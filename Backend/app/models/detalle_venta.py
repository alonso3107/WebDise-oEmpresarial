"""
Modelo DetalleVenta — Items individuales de cada venta.
Cada registro vincula una venta con un producto y su cantidad.
"""

from typing import TYPE_CHECKING

from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.venta import Venta
    from app.models.producto import Producto


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    venta_id: Mapped[int] = mapped_column(Integer, ForeignKey("ventas.id"))
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("productos.id"))
    cantidad: Mapped[int] = mapped_column(Integer)
    precio_unitario: Mapped[float] = mapped_column(Float)
    subtotal: Mapped[float] = mapped_column(Float)

    # Relaciones
    venta: Mapped["Venta"] = relationship(back_populates="detalles")
    producto: Mapped["Producto"] = relationship()
