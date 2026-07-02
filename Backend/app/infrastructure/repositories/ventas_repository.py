"""Repositorio SQLAlchemy del caso de uso de ventas."""

from datetime import date, datetime
from typing import Iterable, Optional

from sqlalchemy.orm import Session, selectinload

from app.models.cliente import Cliente
from app.models.detalle_venta import DetalleVenta
from app.models.producto import Producto
from app.models.promocion import Promocion
from app.models.venta import Venta


class RepositorioVentasSqlAlchemy:
    def __init__(self, db: Session):
        self.db = db

    def obtener_cliente(self, cliente_id: int):
        return self.db.query(Cliente).filter(Cliente.id == cliente_id).first()

    def obtener_productos(self, producto_ids: Iterable[int]):
        ids = list(set(producto_ids))
        if not ids:
            return {}
        productos = self.db.query(Producto).filter(Producto.id.in_(ids)).all()
        return {producto.id: producto for producto in productos}

    def mejor_promocion(self, tipo: str, fecha: date):
        return self.db.query(Promocion).filter(
            Promocion.activo.is_(True),
            Promocion.tipo == tipo,
            Promocion.fecha_inicio <= fecha,
            Promocion.fecha_fin >= fecha,
        ).order_by(Promocion.porcentaje_descuento.desc()).first()

    def promociones(self, tipo: str, fecha: date):
        return self.db.query(Promocion).filter(
            Promocion.activo.is_(True),
            Promocion.tipo == tipo,
            Promocion.fecha_inicio <= fecha,
            Promocion.fecha_fin >= fecha,
        ).all()

    def listar(
        self,
        skip: int,
        limit: int,
        estado: Optional[str],
        metodo_pago: Optional[str],
        fecha: Optional[date],
        cliente_id: Optional[int],
    ):
        query = self.db.query(Venta).options(
            selectinload(Venta.cliente),
            selectinload(Venta.detalles),
        )
        if estado:
            query = query.filter(Venta.estado == estado)
        if metodo_pago:
            query = query.filter(Venta.metodo_pago == metodo_pago)
        if cliente_id is not None:
            query = query.filter(Venta.cliente_id == cliente_id)
        if fecha:
            query = query.filter(
                Venta.fecha_hora >= datetime.combine(fecha, datetime.min.time()),
                Venta.fecha_hora <= datetime.combine(fecha, datetime.max.time()),
            )
        return query.order_by(Venta.fecha_hora.desc()).offset(skip).limit(limit).all()

    def obtener_venta(self, venta_id: int):
        return self.db.query(Venta).options(
            selectinload(Venta.cliente),
            selectinload(Venta.detalles),
        ).filter(Venta.id == venta_id).first()

    def crear_venta(self, **datos):
        venta = Venta(**datos)
        self.db.add(venta)
        return venta

    def crear_detalle(self, **datos):
        detalle = DetalleVenta(**datos)
        self.db.add(detalle)
        return detalle

    def agregar(self, entidad):
        self.db.add(entidad)

    def flush(self):
        self.db.flush()

    def confirmar(self):
        self.db.commit()

    def revertir(self):
        self.db.rollback()

    def refrescar(self, entidad):
        self.db.refresh(entidad)
