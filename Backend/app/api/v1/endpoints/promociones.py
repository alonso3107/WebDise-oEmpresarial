"""Endpoints CRUD para Promociones + lógica de descuentos aplicables."""

from typing import List
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.promocion import Promocion
from app.models.cliente import Cliente
from app.schemas.promocion import PromocionCreate, PromocionUpdate, PromocionResponse
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[PromocionResponse])
def listar_promociones(db: Session = Depends(get_db)):
    """Listar todas las promociones activas."""
    return db.query(Promocion).filter(Promocion.activo == True).all()


@router.get("/vigentes", response_model=List[PromocionResponse])
def listar_promociones_vigentes(db: Session = Depends(get_db)):
    """Listar solo las promociones activas y vigentes HOY."""
    hoy = date.today()
    return db.query(Promocion).filter(
        Promocion.activo == True,
        Promocion.fecha_inicio <= hoy,
        Promocion.fecha_fin >= hoy,
    ).all()


@router.get("/aplicables/{cliente_id}")
def obtener_descuento_aplicable(cliente_id: int, db: Session = Depends(get_db)):
    """
    Calcular el descuento total aplicable a un cliente específico.
    Combina festividad + fidelidad con tope máximo configurable.
    """
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    hoy = date.today()
    descuento_festividad = 0.0
    descuento_fidelidad = 0.0
    promo_festividad = None
    promo_fidelidad = None

    # Buscar la mejor promoción de festividad vigente
    promos_festividad = db.query(Promocion).filter(
        Promocion.activo == True,
        Promocion.tipo == "festividad",
        Promocion.fecha_inicio <= hoy,
        Promocion.fecha_fin >= hoy,
    ).all()

    if promos_festividad:
        promo_festividad = max(promos_festividad, key=lambda p: p.porcentaje_descuento)
        descuento_festividad = promo_festividad.porcentaje_descuento

    # Buscar la mejor promoción de fidelidad aplicable al cliente
    promos_fidelidad = db.query(Promocion).filter(
        Promocion.activo == True,
        Promocion.tipo == "fidelidad",
        Promocion.fecha_inicio <= hoy,
        Promocion.fecha_fin >= hoy,
    ).all()

    for promo in promos_fidelidad:
        min_compras = promo.min_compras or settings.FIDELIDAD_MIN_COMPRAS
        min_monto = promo.min_monto or settings.FIDELIDAD_MIN_MONTO
        if cliente.total_compras >= min_compras and cliente.monto_acumulado >= min_monto:
            if promo.porcentaje_descuento > descuento_fidelidad:
                descuento_fidelidad = promo.porcentaje_descuento
                promo_fidelidad = promo

    # Acumular ambos descuentos con tope máximo
    descuento_total = min(
        descuento_festividad + descuento_fidelidad,
        settings.DESCUENTO_MAX_PORCENTAJE,
    )

    return {
        "cliente_id": cliente.id,
        "cliente_nombre": f"{cliente.nombres} {cliente.apellidos}",
        "es_fiel": cliente.es_fiel,
        "total_compras": cliente.total_compras,
        "monto_acumulado": cliente.monto_acumulado,
        "descuento_festividad": descuento_festividad,
        "descuento_fidelidad": descuento_fidelidad,
        "descuento_total": descuento_total,
        "tope_maximo": settings.DESCUENTO_MAX_PORCENTAJE,
        "promo_festividad": promo_festividad.nombre if promo_festividad else None,
        "promo_fidelidad": promo_fidelidad.nombre if promo_fidelidad else None,
    }


@router.post("/", response_model=PromocionResponse, status_code=201)
def crear_promocion(data: PromocionCreate, db: Session = Depends(get_db)):
    """Crear una nueva promoción."""
    if data.tipo not in ("festividad", "fidelidad"):
        raise HTTPException(status_code=400, detail="El tipo debe ser 'festividad' o 'fidelidad'")
    if data.fecha_fin < data.fecha_inicio:
        raise HTTPException(status_code=400, detail="La fecha de fin no puede ser anterior a la de inicio")
    promocion = Promocion(**data.model_dump())
    db.add(promocion)
    db.commit()
    db.refresh(promocion)
    return promocion


@router.put("/{promocion_id}", response_model=PromocionResponse)
def actualizar_promocion(promocion_id: int, data: PromocionUpdate, db: Session = Depends(get_db)):
    """Actualizar una promoción existente."""
    promocion = db.query(Promocion).filter(Promocion.id == promocion_id).first()
    if not promocion:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(promocion, field, value)
    db.commit()
    db.refresh(promocion)
    return promocion


@router.delete("/{promocion_id}")
def eliminar_promocion(promocion_id: int, db: Session = Depends(get_db)):
    """Desactivar promoción."""
    promocion = db.query(Promocion).filter(Promocion.id == promocion_id).first()
    if not promocion:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    promocion.activo = False
    db.commit()
    return {"message": "Promoción desactivada exitosamente"}
