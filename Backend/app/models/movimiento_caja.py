"""
Modelo de MovimientoCaja — Ingresos y egresos manuales de la caja.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Float, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class MovimientoCaja(Base):
    __tablename__ = "movimientos_caja"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tipo: Mapped[str] = mapped_column(String, index=True)  # "ingreso" o "egreso"
    metodo_pago: Mapped[str] = mapped_column(String, index=True)  # "efectivo" o "yape"
    monto: Mapped[float] = mapped_column(Float)
    descripcion: Mapped[str] = mapped_column(String)
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    
    # Se deja opcional porque omitimos Auth en el Sprint 3 por tiempo.
    usuario_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
