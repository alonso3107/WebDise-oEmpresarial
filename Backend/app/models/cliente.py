"""
Modelo de Cliente — Registro de clientes frecuentes de la botica.
Incluye contador de compras y monto acumulado para el sistema de fidelidad.
"""

from typing import Optional, List, TYPE_CHECKING
from datetime import date

from sqlalchemy import String, Boolean, Integer, Float, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.venta import Venta


class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    dni: Mapped[str] = mapped_column(String(8), unique=True, index=True)
    nombres: Mapped[str] = mapped_column(String)
    apellidos: Mapped[str] = mapped_column(String)
    telefono: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    total_compras: Mapped[int] = mapped_column(Integer, default=0)
    monto_acumulado: Mapped[float] = mapped_column(Float, default=0.0)
    es_fiel: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_registro: Mapped[date] = mapped_column(Date, default=date.today)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relación inversa
    ventas: Mapped[List["Venta"]] = relationship(back_populates="cliente")
