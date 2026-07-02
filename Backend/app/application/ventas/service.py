"""Orquestación transaccional del punto de venta."""

from dataclasses import dataclass
from datetime import date
from typing import Iterable, Optional

from app.application.errors import RecursoNoEncontrado, ReglaNegocioInvalida
@dataclass(frozen=True)
class ItemVentaEntrada:
    producto_id: int
    cantidad: int


@dataclass(frozen=True)
class ConfiguracionFidelidad:
    minimo_compras: int
    minimo_monto: float
    descuento_maximo: float


class ServicioVentas:
    def __init__(self, repositorio, configuracion: ConfiguracionFidelidad):
        self.repositorio = repositorio
        self.configuracion = configuracion

    def registrar(
        self,
        items: Iterable[ItemVentaEntrada],
        cliente_id: Optional[int],
        tipo_comprobante: str,
        metodo_pago: str,
    ):
        try:
            cantidades = self._agrupar_cantidades(items)
            cliente = self._obtener_cliente(cliente_id)
            productos = self.repositorio.obtener_productos(cantidades.keys())
            detalles = self._validar_productos(productos, cantidades)
            subtotal = round(sum(item["subtotal"] for item in detalles), 2)
            porcentaje, promocion_id = self._calcular_descuento(cliente)
            descuento = round(subtotal * porcentaje / 100, 2)

            venta = self.repositorio.crear_venta(
                cliente_id=cliente_id,
                promocion_id=promocion_id,
                tipo_comprobante=tipo_comprobante,
                metodo_pago=metodo_pago,
                subtotal=subtotal,
                descuento=descuento,
                monto_total=round(subtotal - descuento, 2),
            )
            self.repositorio.flush()

            alertas = self._registrar_detalles(venta, detalles)
            self._actualizar_fidelidad(cliente, venta.monto_total)
            self.repositorio.confirmar()
            self.repositorio.refrescar(venta)
            if alertas:
                setattr(venta, "alertas", alertas)
            return venta
        except Exception:
            self.repositorio.revertir()
            raise

    def listar(self, **filtros):
        ventas = self.repositorio.listar(**filtros)
        return [self._resumir(venta) for venta in ventas]

    def obtener(self, venta_id: int):
        venta = self.repositorio.obtener_venta(venta_id)
        if not venta:
            raise RecursoNoEncontrado("Venta no encontrada")
        return venta

    def anular(self, venta_id: int):
        venta = self.obtener(venta_id)
        if venta.estado == "anulada":
            raise ReglaNegocioInvalida("Esta venta ya fue anulada")

        try:
            productos = self.repositorio.obtener_productos(
                detalle.producto_id for detalle in venta.detalles
            )
            venta.estado = "anulada"
            for detalle in venta.detalles:
                producto = productos.get(detalle.producto_id)
                if producto:
                    producto.stock += detalle.cantidad

            if venta.cliente:
                venta.cliente.total_compras = max(0, venta.cliente.total_compras - 1)
                venta.cliente.monto_acumulado = max(
                    0.0,
                    round(venta.cliente.monto_acumulado - venta.monto_total, 2),
                )
                self._reevaluar_fidelidad(venta.cliente)

            self.repositorio.confirmar()
            self.repositorio.refrescar(venta)
            return venta
        except Exception:
            self.repositorio.revertir()
            raise

    @staticmethod
    def _agrupar_cantidades(items: Iterable[ItemVentaEntrada]) -> dict[int, int]:
        cantidades: dict[int, int] = {}
        for item in items:
            cantidades[item.producto_id] = cantidades.get(item.producto_id, 0) + item.cantidad
        if not cantidades:
            raise ReglaNegocioInvalida("La venta debe incluir al menos un producto")
        return cantidades

    def _obtener_cliente(self, cliente_id: Optional[int]):
        if cliente_id is None:
            return None
        cliente = self.repositorio.obtener_cliente(cliente_id)
        if not cliente or not cliente.activo:
            raise RecursoNoEncontrado("Cliente no encontrado")
        return cliente

    @staticmethod
    def _validar_productos(productos, cantidades):
        faltantes = set(cantidades) - set(productos)
        if faltantes:
            raise RecursoNoEncontrado(f"Producto con ID {min(faltantes)} no encontrado")

        detalles = []
        for producto_id, cantidad in cantidades.items():
            producto = productos[producto_id]
            if not producto.activo:
                raise ReglaNegocioInvalida(f"El producto '{producto.nombre}' está desactivado")
            if producto.fecha_vencimiento and producto.fecha_vencimiento < date.today():
                raise ReglaNegocioInvalida(
                    f"No se puede vender '{producto.nombre}' porque está vencido"
                )
            if producto.stock < cantidad:
                raise ReglaNegocioInvalida(
                    f"Stock insuficiente para '{producto.nombre}'. "
                    f"Disponible: {producto.stock}, solicitado: {cantidad}"
                )
            detalles.append({
                "producto": producto,
                "cantidad": cantidad,
                "subtotal": round(producto.precio * cantidad, 2),
            })
        return detalles

    def _calcular_descuento(self, cliente):
        festividad = self.repositorio.mejor_promocion("festividad", date.today())
        porcentaje_festividad = festividad.porcentaje_descuento if festividad else 0.0
        porcentaje_fidelidad = 0.0
        promocion_id = festividad.id if festividad else None

        if cliente:
            for promocion in self.repositorio.promociones("fidelidad", date.today()):
                minimo_compras = promocion.min_compras or self.configuracion.minimo_compras
                minimo_monto = promocion.min_monto or self.configuracion.minimo_monto
                if (
                    cliente.total_compras >= minimo_compras
                    and cliente.monto_acumulado >= minimo_monto
                    and promocion.porcentaje_descuento > porcentaje_fidelidad
                ):
                    porcentaje_fidelidad = promocion.porcentaje_descuento
                    promocion_id = promocion.id

        porcentaje = min(
            porcentaje_festividad + porcentaje_fidelidad,
            self.configuracion.descuento_maximo,
        )
        return porcentaje, promocion_id

    def _registrar_detalles(self, venta, detalles):
        alertas = []
        for item in detalles:
            producto = item["producto"]
            self.repositorio.crear_detalle(
                venta_id=venta.id,
                producto_id=producto.id,
                cantidad=item["cantidad"],
                precio_unitario=producto.precio,
                subtotal=item["subtotal"],
            )
            producto.stock -= item["cantidad"]
            if producto.stock <= producto.stock_minimo:
                alertas.append(
                    f"El stock de '{producto.nombre}' cayó a {producto.stock} "
                    f"(mínimo: {producto.stock_minimo})"
                )
        return alertas

    def _actualizar_fidelidad(self, cliente, monto_total):
        if not cliente:
            return
        cliente.total_compras += 1
        cliente.monto_acumulado = round(cliente.monto_acumulado + monto_total, 2)
        self._reevaluar_fidelidad(cliente)

    def _reevaluar_fidelidad(self, cliente):
        cliente.es_fiel = (
            cliente.total_compras >= self.configuracion.minimo_compras
            and cliente.monto_acumulado >= self.configuracion.minimo_monto
        )

    @staticmethod
    def _resumir(venta):
        return {
            "id": venta.id,
            "fecha_hora": venta.fecha_hora,
            "cliente_id": venta.cliente_id,
            "cliente_nombre": (
                f"{venta.cliente.nombres} {venta.cliente.apellidos}"
                if venta.cliente else None
            ),
            "estado": venta.estado,
            "monto_total": venta.monto_total,
            "metodo_pago": venta.metodo_pago,
            "cantidad_productos": sum(detalle.cantidad for detalle in venta.detalles),
        }
