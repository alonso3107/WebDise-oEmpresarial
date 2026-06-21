"""Endpoints CRUD para Categorías."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse

router = APIRouter()


@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    """Listar todas las categorías activas."""
    return db.query(Categoria).filter(Categoria.activo == True).all()


@router.post("/", response_model=CategoriaResponse, status_code=201)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    """Crear una nueva categoría."""
    existente = db.query(Categoria).filter(Categoria.nombre == data.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    categoria = Categoria(**data.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(categoria_id: int, data: CategoriaUpdate, db: Session = Depends(get_db)):
    """Actualizar una categoría existente."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(categoria, field, value)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Soft delete de categoría."""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    categoria.activo = False
    db.commit()
    return {"message": "Categoría desactivada exitosamente"}
