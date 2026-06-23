"""
Modelo de Venta — Registro de transacciones de venta (POS).
"""

from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.cliente import Cliente
    from app.models.promocion import Promocion
    from app.models.detalle_venta import DetalleVenta


class Venta(Base):
    __tablename__ = "ventas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    cliente_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("clientes.id"), nullable=True
    )
    promocion_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("promociones.id"), nullable=True
    )
    tipo_comprobante: Mapped[str] = mapped_column(String, default="boleta")   # boleta | ticket
    estado: Mapped[str] = mapped_column(String, default="completada")         # completada | anulada
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    descuento: Mapped[float] = mapped_column(Float, default=0.0)
    monto_total: Mapped[float] = mapped_column(Float, default=0.0)
    metodo_pago: Mapped[str] = mapped_column(String, default="efectivo")      # efectivo | yape | plin | tarjeta

    # Relaciones
    cliente: Mapped[Optional["Cliente"]] = relationship(back_populates="ventas")
    promocion: Mapped[Optional["Promocion"]] = relationship()
    detalles: Mapped[List["DetalleVenta"]] = relationship(back_populates="venta")
