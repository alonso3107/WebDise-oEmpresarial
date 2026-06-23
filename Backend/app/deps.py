"""
Dependencias compartidas para inyección en los endpoints de FastAPI.
"""

from typing import Generator

from sqlalchemy.orm import Session

from app.core.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Genera una sesión de base de datos por cada request.
    Se cierra automáticamente al finalizar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# TODO Sprint 1 (Gonzalo):
# - get_current_user(token, db) -> Usuario
# - get_current_active_user(current_user) -> Usuario
# - require_admin(current_user) -> Usuario  (verificar rol Administrador)
