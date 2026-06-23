"""
Modelo de Categoría — Clasificación de productos.
Ej: Medicamentos, Belleza, Cuidado Personal, Bebés.
"""

from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.producto import Producto


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, unique=True, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relación inversa
    productos: Mapped[List["Producto"]] = relationship(back_populates="categoria")
