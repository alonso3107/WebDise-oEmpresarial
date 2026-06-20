from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, Boolean
from app.core.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    precio: Mapped[float] = mapped_column(Float)
    stock: Mapped[int] = mapped_column(default=0)
    codigo_barras: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
