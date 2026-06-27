"""
Endpoints de Ventas (POS) — Módulo principal de punto de venta.
Incluye: registrar venta con descuentos, listar, detalle y anulación.
"""

from typing import List, Optional
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.producto import Producto
from app.models.cliente import Cliente
from app.models.promocion import Promocion
from app.schemas.venta import VentaCreate, VentaResponse, VentaListResponse
from app.core.config import settings

router = APIRouter()


def _calcular_descuento(db: Session, cliente_id: Optional[int]) -> tuple:
    """
    Calcula el descuento total aplicable.
    Retorna (porcentaje_total, promocion_id_aplicada).
    Los descuentos de festividad y fidelidad se ACUMULAN con tope del 15%.
    """
    hoy = date.today()
    descuento_festividad = 0.0
    descuento_fidelidad = 0.0
    promo_id = None

    # ── Buscar mejor promoción de festividad vigente ──
    promo_fest = db.query(Promocion).filter(
        Promocion.activo == True,
        Promocion.tipo == "festividad",
        Promocion.fecha_inicio <= hoy,
        Promocion.fecha_fin >= hoy,
    ).order_by(Promocion.porcentaje_descuento.desc()).first()

    if promo_fest:
        descuento_festividad = promo_fest.porcentaje_descuento
        promo_id = promo_fest.id

    # ── Buscar mejor promoción de fidelidad si hay cliente ──
    if cliente_id:
        cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
        if cliente:
            promos_fidel = db.query(Promocion).filter(
                Promocion.activo == True,
                Promocion.tipo == "fidelidad",
                Promocion.fecha_inicio <= hoy,
                Promocion.fecha_fin >= hoy,
            ).all()

            for promo in promos_fidel:
                min_compras = promo.min_compras if promo.min_compras is not None else settings.FIDELIDAD_MIN_COMPRAS
                min_monto = promo.min_monto if promo.min_monto is not None else settings.FIDELIDAD_MIN_MONTO
                if (
                    cliente.total_compras >= min_compras
                    and cliente.monto_acumulado >= min_monto
                    and promo.porcentaje_descuento > descuento_fidelidad
                ):
                    descuento_fidelidad = promo.porcentaje_descuento
                    promo_id = promo.id  # Se guarda la última promo aplicada

    # Acumular con tope máximo configurable
    descuento_total = min(
        descuento_festividad + descuento_fidelidad,
        settings.DESCUENTO_MAX_PORCENTAJE,
    )

    return descuento_total, promo_id


@router.post("/", response_model=VentaResponse, status_code=201)
def registrar_venta(data: VentaCreate, db: Session = Depends(get_db)):
    """
    Registrar una venta completa desde el POS.
    Flujo transaccional:
    1. Valida stock de cada producto
    2. Calcula subtotal
    3. Aplica descuentos (festividad + fidelidad, tope 15%)
    4. Crea venta + detalles
    5. Descuenta stock de cada producto
    6. Actualiza compras y monto del cliente
    7. Evalúa si el cliente pasa a ser "fiel"
    """
    try:
        # ── Validar cliente si se proporcionó ──
        if data.cliente_id:
            cliente = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
            if not cliente:
                raise HTTPException(status_code=404, detail="Cliente no encontrado")

        # ── Validar productos y stock ──
        detalles = []
        subtotal = 0.0
        alertas_venta = []

        for item in data.items:
            producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if not producto:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto con ID {item.producto_id} no encontrado",
                )
            if not producto.activo:
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto '{producto.nombre}' está desactivado",
                )
            
            # ── Validar vencimiento (Sprint 3) ──
            if producto.fecha_vencimiento and producto.fecha_vencimiento < date.today():
                raise HTTPException(
                    status_code=400,
                    detail=f"Bloqueo de Seguridad: No se puede vender '{producto.nombre}' porque está vencido desde {producto.fecha_vencimiento}.",
                )

            if producto.stock < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}, solicitado: {item.cantidad}",
                )

            item_subtotal = producto.precio * item.cantidad
            subtotal += item_subtotal
            detalles.append({
                "producto": producto,
                "cantidad": item.cantidad,
                "precio_unitario": producto.precio,
                "subtotal": item_subtotal,
            })

        # ── Calcular descuento ──
        porcentaje_descuento, promo_id = _calcular_descuento(db, data.cliente_id)
        monto_descuento = round(subtotal * (porcentaje_descuento / 100), 2)
        monto_total = round(subtotal - monto_descuento, 2)

        # ── Crear la venta ──
        venta = Venta(
            cliente_id=data.cliente_id,
            promocion_id=promo_id,
            tipo_comprobante=data.tipo_comprobante,
            metodo_pago=data.metodo_pago,
            subtotal=subtotal,
            descuento=monto_descuento,
            monto_total=monto_total,
        )
        db.add(venta)
        db.flush()  # Para obtener el ID de la venta

        # ── Crear detalles y descontar stock ──
        for det in detalles:
            detalle_venta = DetalleVenta(
                venta_id=venta.id,
                producto_id=det["producto"].id,
                cantidad=det["cantidad"],
                precio_unitario=det["precio_unitario"],
                subtotal=det["subtotal"],
            )
            db.add(detalle_venta)

            # Descontar stock
            det["producto"].stock -= det["cantidad"]

            # ── Alerta de stock bajo en tiempo real (Sprint 3) ──
            if det["producto"].stock <= det["producto"].stock_minimo:
                alertas_venta.append(
                    f"¡Atención! El stock de '{det['producto'].nombre}' cayó a {det['producto'].stock} (Mínimo requerido: {det['producto'].stock_minimo})."
                )

        # ── Actualizar cliente si existe ──
        if data.cliente_id:
            cliente = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
            if cliente:
                cliente.total_compras += 1
                cliente.monto_acumulado += monto_total

                # Evaluar si ahora es cliente fiel
                if (
                    not cliente.es_fiel
                    and cliente.total_compras >= settings.FIDELIDAD_MIN_COMPRAS
                    and cliente.monto_acumulado >= settings.FIDELIDAD_MIN_MONTO
                ):
                    cliente.es_fiel = True

        db.commit()
        db.refresh(venta)
        
        # Inyectar las alertas dinámicamente para que Pydantic las incluya en la respuesta
        if alertas_venta:
            setattr(venta, "alertas", alertas_venta)

        return venta

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar la venta: {str(e)}")


@router.get("/", response_model=List[VentaListResponse])
def listar_ventas(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    estado: Optional[str] = Query(None, description="'completada' o 'anulada'"),
    metodo_pago: Optional[str] = Query(None, description="'efectivo', 'yape' o 'plin'"),
    fecha: Optional[str] = Query(None, description="Filtrar por fecha (YYYY-MM-DD)"),
):
    """Listar ventas con filtros opcionales."""
    query = db.query(Venta)
    if estado:
        query = query.filter(Venta.estado == estado)
    if metodo_pago:
        query = query.filter(Venta.metodo_pago == metodo_pago)
    if fecha:
        try:
            fecha_dt = datetime.strptime(fecha, "%Y-%m-%d").date()
            query = query.filter(
                Venta.fecha_hora >= datetime.combine(fecha_dt, datetime.min.time()),
                Venta.fecha_hora <= datetime.combine(fecha_dt, datetime.max.time()),
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")

    return query.order_by(Venta.fecha_hora.desc()).offset(skip).limit(limit).all()


@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(venta_id: int, db: Session = Depends(get_db)):
    """Obtener detalle de una venta con todos sus productos."""
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


@router.put("/{venta_id}/anular", response_model=VentaResponse)
def anular_venta(venta_id: int, db: Session = Depends(get_db)):
    """
    Anular una venta:
    1. Cambia estado a "anulada"
    2. Devuelve stock de cada producto
    3. Resta compra y monto al cliente
    4. Re-evalúa si el cliente sigue siendo "fiel"
    """
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    if venta.estado == "anulada":
        raise HTTPException(status_code=400, detail="Esta venta ya fue anulada")

    try:
        # Cambiar estado
        venta.estado = "anulada"

        # Devolver stock
        for detalle in venta.detalles:
            producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
            if producto:
                producto.stock += detalle.cantidad

        # Restar compra al cliente
        if venta.cliente_id:
            cliente = db.query(Cliente).filter(Cliente.id == venta.cliente_id).first()
            if cliente:
                cliente.total_compras = max(0, cliente.total_compras - 1)
                cliente.monto_acumulado = max(0.0, cliente.monto_acumulado - venta.monto_total)

                # Re-evaluar fidelidad
                if cliente.es_fiel and (
                    cliente.total_compras < settings.FIDELIDAD_MIN_COMPRAS
                    or cliente.monto_acumulado < settings.FIDELIDAD_MIN_MONTO
                ):
                    cliente.es_fiel = False

        db.commit()
        db.refresh(venta)
        return venta

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al anular la venta: {str(e)}")
