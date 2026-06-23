"""Endpoints para Pagos de Servicios (luz, agua, colegios, etc.)."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.pago_servicio import PagoServicio
from app.schemas.pago_servicio import PagoServicioCreate, PagoServicioResponse

router = APIRouter()


@router.get("/", response_model=List[PagoServicioResponse])
def listar_pagos_servicios(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    tipo_servicio: Optional[str] = Query(None, description="'luz', 'agua', 'colegio', 'telefono', 'otro'"),
):
    """Listar pagos de servicios con filtro opcional por tipo."""
    query = db.query(PagoServicio)
    if tipo_servicio:
        query = query.filter(PagoServicio.tipo_servicio == tipo_servicio)
    return query.order_by(PagoServicio.fecha_hora.desc()).offset(skip).limit(limit).all()


@router.get("/{pago_id}", response_model=PagoServicioResponse)
def obtener_pago_servicio(pago_id: int, db: Session = Depends(get_db)):
    """Obtener detalle de un pago de servicio."""
    pago = db.query(PagoServicio).filter(PagoServicio.id == pago_id).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago de servicio no encontrado")
    return pago


@router.post("/", response_model=PagoServicioResponse, status_code=201)
def registrar_pago_servicio(data: PagoServicioCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo pago de servicio (luz, agua, colegio, etc.)."""
    tipos_validos = ("luz", "agua", "colegio", "telefono", "otro")
    if data.tipo_servicio not in tipos_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de servicio inválido. Opciones: {', '.join(tipos_validos)}",
        )
    pago = PagoServicio(**data.model_dump())
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago
