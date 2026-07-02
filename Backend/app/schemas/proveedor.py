"""Schemas Pydantic para Proveedor."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProveedorBase(BaseModel):
    ruc: str = Field(..., pattern=r"^\d{11}$", description="RUC de exactamente 11 dígitos numéricos")
    razon_social: str = Field(..., min_length=1)
    telefono: Optional[str] = Field(None, pattern=r"^\+?[0-9\-\s]{7,15}$", description="Teléfono del proveedor")
    email: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = Field(None, min_length=1)
    telefono: Optional[str] = Field(None, pattern=r"^\+?[0-9\-\s]{7,15}$")
    email: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorResponse(ProveedorBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)
