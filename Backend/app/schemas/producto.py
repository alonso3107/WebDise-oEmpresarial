from pydantic import BaseModel, ConfigDict, Field
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
    nombre: str = Field(..., min_length=1)
    precio: float = Field(..., gt=0)
    stock: int = Field(0, ge=0)
    stock_minimo: int = Field(5, ge=0)

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1)
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    codigo_barras: Optional[str] = None
    activo: Optional[bool] = None
    fecha_vencimiento: Optional[date] = None
    stock_minimo: Optional[int] = Field(None, ge=0)
    categoria_id: Optional[int] = None
    proveedor_id: Optional[int] = None

class ProductoResponse(ProductoBase):
    id: int

    # Permite mapear desde objetos SQLAlchemy
    model_config = ConfigDict(from_attributes=True)
