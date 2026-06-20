"""
Configuración de la base de datos SQLite con SQLAlchemy ORM.
La BD se crea automáticamente como 'BoticaVR.db' en el directorio Backend/.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

# ── Engine de SQLAlchemy ──
# connect_args={"check_same_thread": False} es necesario para SQLite
# ya que FastAPI usa múltiples hilos
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,  # Cambiar a True para ver las queries SQL en consola (debug)
)

# ── Session Factory ──
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── Base declarativa para los modelos (SQLAlchemy 2.0+) ──
class Base(DeclarativeBase):
    """Clase base de la que heredarán todos los modelos ORM."""
    pass
