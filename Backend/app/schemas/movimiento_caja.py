"""Schemas Pydantic para MovimientoCaja y Cuadre de Caja."""

from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MovimientoCajaBase(BaseModel):
    tipo: str = Field(..., description="'ingreso' o 'egreso'")
    metodo_pago: str = Field(..., description="'efectivo', 'yape' o 'plin'")
    monto: float = Field(..., gt=0, description="Monto del movimiento (debe ser mayor a 0)")
    descripcion: str
    usuario_id: Optional[int] = None


class MovimientoCajaCreate(MovimientoCajaBase):
    pass


class MovimientoCajaResponse(MovimientoCajaBase):
    id: int
    fecha_hora: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumenCajaResponse(BaseModel):
    """Resumen consolidado de la caja para un día y un método de pago (opcional)."""
    fecha: str
    metodo_pago_filtro: Optional[str] = Field(None, description="'efectivo', 'yape', 'plin' o 'todos'")
    
    total_ventas: float = 0.0
    total_servicios: float = 0.0
    total_ingresos_manuales: float = 0.0
    total_egresos_manuales: float = 0.0
    
    saldo_neto: float = 0.0
