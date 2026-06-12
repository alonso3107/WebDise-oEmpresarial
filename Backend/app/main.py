"""
Punto de entrada principal de la aplicación Botica V&R.
Configura FastAPI, CORS, y registra los routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Evento de ciclo de vida de la app.
    - startup: Crea las tablas en SQLite si no existen.
    - shutdown: Lugar para limpiar recursos si es necesario.
    """
    # ── Startup: crear tablas ──
    Base.metadata.create_all(bind=engine)
    yield
    # ── Shutdown: limpiar recursos si es necesario ──


def create_app() -> FastAPI:
    """Factory de la aplicación FastAPI."""

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        description=(
            "API REST para la gestión integral de la Botica V&R. "
            "Módulos: Ventas (POS), Inventario, Alertas, Cuadre de Caja y Reportes."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──
    # Permite que el frontend en React/Vite (puerto 5173) se comunique con el backend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Registrar router de API v1 ──
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    # ── Endpoint de salud ──
    @app.get("/", tags=["Health"])
    def health_check():
        return {
            "status": "online",
            "proyecto": settings.PROJECT_NAME,
            "version": settings.PROJECT_VERSION,
            "database": "SQLite (BoticaVR.db)",
        }

    return app


# Instancia de la app
app = create_app()
