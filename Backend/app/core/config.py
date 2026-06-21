"""
Configuración central de la aplicación Botica V&R.
Todas las variables de entorno y constantes del proyecto se definen aquí.
"""

from typing import List

# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Información del proyecto ──
    PROJECT_NAME: str = "Botica V&R API"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # ── Base de datos (SQLite) ──
    DATABASE_URL: str = "sqlite:///./BoticaVR.db"

    # ── Seguridad / JWT ──
    SECRET_KEY: str = "botica-vr-secret-key-cambiar-en-produccion-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas (un turno completo)

    # ── Fidelidad de clientes (configurable por el Product Owner) ──
    FIDELIDAD_MIN_COMPRAS: int = 5          # Mínimo de compras para ser "fiel"
    FIDELIDAD_MIN_MONTO: float = 25.0       # Monto mínimo acumulado (soles)
    DESCUENTO_MAX_PORCENTAJE: float = 15.0  # Tope máximo de descuento combinado (%)

    # ── CORS ──
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Configuración de pydantic-settings v2 (reemplaza class Config deprecado)
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


# Instancia global de configuración
settings = Settings()
