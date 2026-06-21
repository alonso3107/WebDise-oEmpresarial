"""Endpoints CRUD para Proveedores."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.proveedor import Proveedor
from app.schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorResponse

router = APIRouter()


@router.get("/", response_model=List[ProveedorResponse])
def listar_proveedores(db: Session = Depends(get_db)):
    """Listar proveedores activos."""
    return db.query(Proveedor).filter(Proveedor.activo == True).all()


@router.post("/", response_model=ProveedorResponse, status_code=201)
def crear_proveedor(data: ProveedorCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo proveedor."""
    existente = db.query(Proveedor).filter(Proveedor.ruc == data.ruc).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un proveedor con ese RUC")
    proveedor = Proveedor(**data.model_dump())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.put("/{proveedor_id}", response_model=ProveedorResponse)
def actualizar_proveedor(proveedor_id: int, data: ProveedorUpdate, db: Session = Depends(get_db)):
    """Actualizar datos de un proveedor."""
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(proveedor, field, value)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.delete("/{proveedor_id}")
def eliminar_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    """Soft delete de proveedor."""
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    proveedor.activo = False
    db.commit()
    return {"message": "Proveedor desactivado exitosamente"}
