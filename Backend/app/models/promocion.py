"""
Modelo de Promoción — Descuentos por festividad o fidelidad.
- Festividad: descuento para todos los clientes en un rango de fechas.
- Fidelidad: descuento solo para clientes que cumplen min_compras y min_monto.
"""

from typing import Optional
from datetime import date

from sqlalchemy import String, Boolean, Integer, Float, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Promocion(Base):
    __tablename__ = "promociones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tipo: Mapped[str] = mapped_column(String)  # "festividad" o "fidelidad"
    porcentaje_descuento: Mapped[float] = mapped_column(Float)
    fecha_inicio: Mapped[date] = mapped_column(Date)
    fecha_fin: Mapped[date] = mapped_column(Date)
    min_compras: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)   # Solo para fidelidad
    min_monto: Mapped[Optional[float]] = mapped_column(Float, nullable=True)     # Solo para fidelidad
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
