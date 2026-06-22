from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    codigo_barras: Optional[str] = None
    activo: bool = True
    fecha_vencimiento: Optional[date] = None
    stock_minimo: int = 5
    categoria_id: Optional[int] = None
    proveedor_id: Optional[int] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    codigo_barras: Optional[str] = None
    activo: Optional[bool] = None
    fecha_vencimiento: Optional[date] = None
    stock_minimo: Optional[int] = None
    categoria_id: Optional[int] = None
    proveedor_id: Optional[int] = None

class ProductoResponse(ProductoBase):
    id: int

    # Permite mapear desde objetos SQLAlchemy
    model_config = ConfigDict(from_attributes=True)
