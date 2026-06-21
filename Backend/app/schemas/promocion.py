"""Schemas Pydantic para Promoción."""

from typing import Optional
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class PromocionBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo: str = Field(..., description="'festividad' o 'fidelidad'")
    porcentaje_descuento: float = Field(..., gt=0, le=100, description="Porcentaje de descuento (1-100)")
    fecha_inicio: date
    fecha_fin: date
    min_compras: Optional[int] = Field(None, description="Mínimo de compras (solo fidelidad)")
    min_monto: Optional[float] = Field(None, description="Monto mínimo acumulado (solo fidelidad)")


class PromocionCreate(PromocionBase):
    pass


class PromocionUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    porcentaje_descuento: Optional[float] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    min_compras: Optional[int] = None
    min_monto: Optional[float] = None
    activo: Optional[bool] = None


class PromocionResponse(PromocionBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)
