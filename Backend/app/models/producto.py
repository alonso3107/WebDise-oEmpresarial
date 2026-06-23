"""
Modelo de Producto — Artículos disponibles en la Botica V&R.

MODIFICADO por Gonzalo (Sprint 2):
  Se agregaron los campos 'categoria_id' y 'proveedor_id' como Foreign Keys
  opcionales (nullable) para vincular cada producto con su categoría y proveedor.

  Justificación:
  - categoria_id: Permite clasificar productos por tipo (Medicamentos, Belleza,
    Cuidado Personal, Bebés) para facilitar búsquedas, filtros en el POS y
    reportes de rotación por categoría (requerido por la documentación del proyecto).
  - proveedor_id: Permite rastrear qué proveedor suministra cada producto para
    gestión de reabastecimiento y trazabilidad de la cadena de suministro.

  Ambos campos son opcionales (nullable=True) para mantener compatibilidad con
  los productos ya registrados que no tengan esta info asignada.
"""

from datetime import date
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Float, Boolean, Integer, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.categoria import Categoria
    from app.models.proveedor import Proveedor


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    precio: Mapped[float] = mapped_column(Float)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    codigo_barras: Mapped[Optional[str]] = mapped_column(
        String, unique=True, index=True, nullable=True
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # ── Campos de Alertas (Sprint 3) ──
    fecha_vencimiento: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    stock_minimo: Mapped[int] = mapped_column(Integer, default=5)

    # ── Campos agregados por Gonzalo (Sprint 2) ──
    categoria_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("categorias.id"), nullable=True
    )
    proveedor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("proveedores.id"), nullable=True
    )

    # Relaciones
    categoria: Mapped[Optional["Categoria"]] = relationship(back_populates="productos")
    proveedor: Mapped[Optional["Proveedor"]] = relationship(back_populates="productos")
