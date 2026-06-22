from typing import List
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoResponse

router = APIRouter()

@router.get("/vencimientos", response_model=List[ProductoResponse])
def obtener_alertas_vencimientos(
    db: Session = Depends(get_db),
    meses_aviso: int = 3
):
    """
    Obtener productos que están a punto de vencer (por defecto en los próximos 3 meses)
    o que ya se encuentran vencidos.
    """
    dias_aviso = meses_aviso * 30  # Aproximación de 3 meses en días
    fecha_limite = date.today() + timedelta(days=dias_aviso)
    
    productos = db.query(Producto).filter(
        Producto.activo == True,
        Producto.fecha_vencimiento != None,
        Producto.fecha_vencimiento <= fecha_limite
    ).order_by(Producto.fecha_vencimiento.asc()).all()
    
    return productos

@router.get("/stock", response_model=List[ProductoResponse])
def obtener_alertas_stock_bajo(
    db: Session = Depends(get_db)
):
    """
    Obtener productos cuyo stock actual es menor o igual a su stock_minimo.
    """
    productos = db.query(Producto).filter(
        Producto.activo == True,
        Producto.stock <= Producto.stock_minimo
    ).order_by(Producto.stock.asc()).all()
    
    return productos
