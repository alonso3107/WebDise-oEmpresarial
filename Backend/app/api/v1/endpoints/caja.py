from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.deps import get_db
from app.models.movimiento_caja import MovimientoCaja
from app.models.venta import Venta
from app.models.pago_servicio import PagoServicio
from app.schemas.movimiento_caja import MovimientoCajaCreate, MovimientoCajaResponse, ResumenCajaResponse

router = APIRouter()

@router.post("/movimiento", response_model=MovimientoCajaResponse, status_code=201)
def registrar_movimiento(data: MovimientoCajaCreate, db: Session = Depends(get_db)):
    """Registrar un ingreso o egreso manual en la caja."""
    if data.tipo not in ["ingreso", "egreso"]:
        raise HTTPException(status_code=400, detail="El tipo debe ser 'ingreso' o 'egreso'")
    if data.metodo_pago not in ["efectivo", "yape", "plin"]:
        raise HTTPException(status_code=400, detail="El método de pago debe ser 'efectivo', 'yape' o 'plin'")
        
    movimiento = MovimientoCaja(**data.model_dump())
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    return movimiento


@router.get("/resumen-dia", response_model=ResumenCajaResponse)
def resumen_dia(
    db: Session = Depends(get_db),
    fecha: Optional[str] = Query(None, description="Fecha en formato YYYY-MM-DD. Por defecto: hoy."),
    metodo_pago: Optional[str] = Query(None, description="Filtrar por 'efectivo', 'yape' o 'plin'. Si se omite, suma todos.")
):
    """Obtener el cuadre de caja consolidado de un día."""
    if fecha:
        try:
            fecha_dt = datetime.strptime(fecha, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    else:
        fecha_dt = datetime.utcnow().date()
        
    start_of_day = datetime.combine(fecha_dt, datetime.min.time())
    end_of_day = datetime.combine(fecha_dt, datetime.max.time())

    # --- Filtros Base ---
    venta_filter = [Venta.fecha_hora >= start_of_day, Venta.fecha_hora <= end_of_day, Venta.estado == "completada"]
    servicio_filter = [PagoServicio.fecha_hora >= start_of_day, PagoServicio.fecha_hora <= end_of_day]
    movimiento_filter = [MovimientoCaja.fecha_hora >= start_of_day, MovimientoCaja.fecha_hora <= end_of_day]

    # --- Aplicar Filtro de Método de Pago si existe ---
    if metodo_pago:
        if metodo_pago not in ["efectivo", "yape", "plin"]:
            raise HTTPException(status_code=400, detail="El método de pago debe ser 'efectivo', 'yape' o 'plin'")
        venta_filter.append(Venta.metodo_pago == metodo_pago)
        servicio_filter.append(PagoServicio.metodo_pago == metodo_pago)
        movimiento_filter.append(MovimientoCaja.metodo_pago == metodo_pago)

    # --- Sumatorias ---
    # 1. Ventas
    total_ventas = db.query(func.sum(Venta.monto_total)).filter(*venta_filter).scalar() or 0.0
    
    # 2. Servicios
    total_servicios = db.query(func.sum(PagoServicio.monto)).filter(*servicio_filter).scalar() or 0.0
    
    # 3. Ingresos y Egresos Manuales
    total_ingresos = db.query(func.sum(MovimientoCaja.monto)).filter(*movimiento_filter, MovimientoCaja.tipo == "ingreso").scalar() or 0.0
    total_egresos = db.query(func.sum(MovimientoCaja.monto)).filter(*movimiento_filter, MovimientoCaja.tipo == "egreso").scalar() or 0.0

    # --- Saldo Neto ---
    saldo_neto = total_ventas + total_servicios + total_ingresos - total_egresos

    return ResumenCajaResponse(
        fecha=str(fecha_dt),
        metodo_pago_filtro=metodo_pago or "todos",
        total_ventas=round(total_ventas, 2),
        total_servicios=round(total_servicios, 2),
        total_ingresos_manuales=round(total_ingresos, 2),
        total_egresos_manuales=round(total_egresos, 2),
        saldo_neto=round(saldo_neto, 2)
    )
