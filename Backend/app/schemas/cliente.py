"""Schemas Pydantic para Cliente."""

from typing import Optional
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ClienteBase(BaseModel):
    dni: str = Field(..., pattern=r"^\d{8}$", description="DNI de exactamente 8 dígitos numéricos")
    nombres: str = Field(..., min_length=1)
    apellidos: str = Field(..., min_length=1)
    telefono: Optional[str] = Field(None, pattern=r"^9\d{8}$", description="Teléfono móvil peruano de exactamente 9 dígitos que empieza con 9")


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombres: Optional[str] = Field(None, min_length=1)
    apellidos: Optional[str] = Field(None, min_length=1)
    telefono: Optional[str] = Field(None, pattern=r"^9\d{8}$", description="Teléfono móvil peruano de 9 dígitos")


class ClienteResponse(ClienteBase):
    id: int
    total_compras: int
    monto_acumulado: float
    es_fiel: bool
    fecha_registro: date
    activo: bool

    model_config = ConfigDict(from_attributes=True)
