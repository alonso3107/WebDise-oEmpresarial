"""Schemas Pydantic para Proveedor."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProveedorBase(BaseModel):
    ruc: str = Field(..., min_length=11, max_length=11, description="RUC de 11 dígitos")
    razon_social: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorResponse(ProveedorBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)
