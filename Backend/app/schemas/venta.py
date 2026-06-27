"""Schemas Pydantic para Venta y DetalleVenta."""

from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── DetalleVenta ──

class DetalleVentaItem(BaseModel):
    """Item del carrito de compras al registrar una venta."""
    producto_id: int
    cantidad: int = Field(..., gt=0, description="Debe ser mayor a 0")


class DetalleVentaResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


# ── Venta ──

class VentaCreate(BaseModel):
    """Payload para registrar una venta desde el POS."""
    cliente_id: Optional[int] = None
    tipo_comprobante: str = Field("boleta", description="'boleta' o 'ticket'")
    metodo_pago: str = Field("efectivo", description="'efectivo', 'yape' o 'plin'")
    items: List[DetalleVentaItem] = Field(..., min_length=1, description="Al menos 1 producto")


class VentaResponse(BaseModel):
    id: int
    fecha_hora: datetime
    cliente_id: Optional[int] = None
    promocion_id: Optional[int] = None
    tipo_comprobante: str
    estado: str
    subtotal: float
    descuento: float
    monto_total: float
    metodo_pago: str
    alertas: Optional[List[str]] = None
    detalles: List[DetalleVentaResponse] = []

    model_config = ConfigDict(from_attributes=True)


class VentaListResponse(BaseModel):
    """Versión resumida para listados (sin detalles)."""
    id: int
    fecha_hora: datetime
    cliente_id: Optional[int] = None
    cliente_nombre: Optional[str] = None
    estado: str
    monto_total: float
    metodo_pago: str
    cantidad_productos: int = 0

    model_config = ConfigDict(from_attributes=True)
