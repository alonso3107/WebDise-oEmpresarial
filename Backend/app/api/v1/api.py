"""
Router principal de la API v1.
Aquí se agrupan todos los endpoints de los módulos.

⚠️ ARCHIVO COMPARTIDO: Coordinar con el otro dev antes de modificar.
"""

from fastapi import APIRouter

router = APIRouter()

# ── Sprint 1 (Dev A): Autenticación y Usuarios ──
# from app.api.v1.endpoints import auth, users
# router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
# router.include_router(users.router, prefix="/users", tags=["Usuarios"])

# ── Sprint 1 (Dev B): Productos / Inventario ──
# from app.api.v1.endpoints import productos
# router.include_router(productos.router, prefix="/productos", tags=["Productos"])

# ── Sprint 2 (Dev A): Ventas ──
# from app.api.v1.endpoints import ventas
# router.include_router(ventas.router, prefix="/ventas", tags=["Ventas"])

# ── Sprint 2 (Dev B): Alertas ──
# from app.api.v1.endpoints import alertas
# router.include_router(alertas.router, prefix="/alertas", tags=["Alertas"])

# ── Sprint 3 (Dev A): Caja ──
# from app.api.v1.endpoints import caja
# router.include_router(caja.router, prefix="/caja", tags=["Caja"])

# ── Sprint 3 (Dev B): Reportes ──
# from app.api.v1.endpoints import reportes
# router.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
