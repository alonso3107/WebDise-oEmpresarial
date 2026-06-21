"""Schemas Pydantic para Cliente."""

from typing import Optional
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ClienteBase(BaseModel):
    dni: str = Field(..., min_length=8, max_length=8, description="DNI de 8 dígitos")
    nombres: str
    apellidos: str
    telefono: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    telefono: Optional[str] = None


class ClienteResponse(ClienteBase):
    id: int
    total_compras: int
    monto_acumulado: float
    es_fiel: bool
    fecha_registro: date
    activo: bool

    model_config = ConfigDict(from_attributes=True)
