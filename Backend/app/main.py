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

# ── Importar TODOS los modelos para que SQLAlchemy los registre ──
from app.models.categoria import Categoria
from app.models.proveedor import Proveedor
from app.models.producto import Producto
from app.models.cliente import Cliente
from app.models.promocion import Promocion
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.pago_servicio import PagoServicio


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
            "Módulos: Ventas (POS), Inventario, Clientes, Promociones, "
            "Categorías, Proveedores, Pagos de Servicios."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──
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
