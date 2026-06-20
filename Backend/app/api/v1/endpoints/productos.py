from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse

router = APIRouter()

@router.get("/", response_model=List[ProductoResponse])
def get_productos(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    activo_only: bool = True
):
    """Obtener lista de productos con paginación."""
    query = db.query(Producto)
    if activo_only:
        query = query.filter(Producto.activo == True)
    productos = query.offset(skip).limit(limit).all()
    return productos

@router.get("/buscar", response_model=List[ProductoResponse])
def buscar_productos(
    q: str = Query(..., description="Término de búsqueda para nombre o código de barras"),
    db: Session = Depends(get_db)
):
    """Búsqueda rápida de productos por nombre o código de barras."""
    search_term = f"%{q}%"
    productos = db.query(Producto).filter(
        (Producto.nombre.ilike(search_term)) | 
        (Producto.codigo_barras.ilike(search_term))
    ).filter(Producto.activo == True).all()
    return productos

@router.get("/{producto_id}", response_model=ProductoResponse)
def get_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener detalle de un producto por ID."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/", response_model=ProductoResponse, status_code=201)
def create_producto(producto_in: ProductoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo producto."""
    # Verificar si el codigo_barras ya existe
    if producto_in.codigo_barras:
        existing = db.query(Producto).filter(Producto.codigo_barras == producto_in.codigo_barras).first()
        if existing:
            raise HTTPException(status_code=400, detail="El código de barras ya está registrado")
            
    nuevo_producto = Producto(**producto_in.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@router.put("/{producto_id}", response_model=ProductoResponse)
def update_producto(producto_id: int, producto_in: ProductoUpdate, db: Session = Depends(get_db)):
    """Actualizar un producto existente."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    update_data = producto_in.model_dump(exclude_unset=True)
    
    # Verificar unicidad de código de barras si se está modificando
    if "codigo_barras" in update_data and update_data["codigo_barras"] is not None:
        existing = db.query(Producto).filter(
            Producto.codigo_barras == update_data["codigo_barras"], 
            Producto.id != producto_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="El código de barras ya está registrado por otro producto")
            
    for field, value in update_data.items():
        setattr(producto, field, value)
        
    db.commit()
    db.refresh(producto)
    return producto

@router.delete("/{producto_id}")
def delete_producto(producto_id: int, db: Session = Depends(get_db)):
    """Eliminado lógico (soft delete). Cambia estado activo a False."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    producto.activo = False
    db.commit()
    return {"message": "Producto eliminado (desactivado) exitosamente"}
