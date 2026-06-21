"""Endpoints CRUD para Clientes."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse

router = APIRouter()


@router.get("/", response_model=List[ClienteResponse])
def listar_clientes(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Listar clientes activos con paginación."""
    return db.query(Cliente).filter(Cliente.activo == True).offset(skip).limit(limit).all()


@router.get("/buscar", response_model=ClienteResponse)
def buscar_cliente_por_dni(
    dni: str = Query(..., min_length=8, max_length=8, description="DNI de 8 dígitos"),
    db: Session = Depends(get_db),
):
    """Buscar cliente por DNI (usado en el POS para aplicar descuentos)."""
    cliente = db.query(Cliente).filter(Cliente.dni == dni, Cliente.activo == True).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.get("/{cliente_id}", response_model=ClienteResponse)
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Obtener detalle de un cliente."""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.post("/", response_model=ClienteResponse, status_code=201)
def crear_cliente(data: ClienteCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo cliente."""
    existente = db.query(Cliente).filter(Cliente.dni == data.dni).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un cliente con ese DNI")
    cliente = Cliente(**data.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def actualizar_cliente(cliente_id: int, data: ClienteUpdate, db: Session = Depends(get_db)):
    """Actualizar datos de un cliente."""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cliente, field, value)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Soft delete de cliente."""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    cliente.activo = False
    db.commit()
    return {"message": "Cliente desactivado exitosamente"}
