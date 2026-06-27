"""
Modelo de Proveedor — Empresas que suministran productos a la botica.
"""

from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

# pyrefly: ignore [missing-import]
from app.core.database import Base

if TYPE_CHECKING:
    # pyrefly: ignore [missing-import]
    from app.models.producto import Producto


class Proveedor(Base):
    __tablename__ = "proveedores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ruc: Mapped[str] = mapped_column(String(11), unique=True, index=True)
    razon_social: Mapped[str] = mapped_column(String)
    telefono: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    direccion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relación inversa
    productos: Mapped[List["Producto"]] = relationship(back_populates="proveedor")
