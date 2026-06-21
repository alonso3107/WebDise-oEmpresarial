"""
Modelo PagoServicio — Pagos de servicios externos (luz, agua, colegios, etc.)
Estos pagos son independientes de las ventas de productos.
"""

from typing import Optional
from datetime import datetime

from sqlalchemy import String, Float, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PagoServicio(Base):
    __tablename__ = "pagos_servicios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tipo_servicio: Mapped[str] = mapped_column(String, index=True)  # luz | agua | colegio | telefono | otro
    descripcion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    numero_referencia: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    monto: Mapped[float] = mapped_column(Float)
    comision: Mapped[float] = mapped_column(Float, default=0.0)
    metodo_pago: Mapped[str] = mapped_column(String, default="efectivo")  # efectivo | yape | plin | tarjeta
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
