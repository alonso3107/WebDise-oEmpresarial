"""Schemas Pydantic para PagoServicio."""

from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PagoServicioBase(BaseModel):
    tipo_servicio: str = Field(..., description="'luz', 'agua', 'colegio', 'telefono', 'otro'")
    descripcion: Optional[str] = None
    numero_referencia: Optional[str] = None
    monto: float = Field(..., gt=0)
    comision: float = Field(0.0, ge=0)
    metodo_pago: str = Field("efectivo", description="'efectivo', 'yape', 'plin', 'tarjeta'")


class PagoServicioCreate(PagoServicioBase):
    pass


class PagoServicioResponse(PagoServicioBase):
    id: int
    fecha_hora: datetime

    model_config = ConfigDict(from_attributes=True)
