"""
Router principal de la API v1.
Aquí se agrupan todos los endpoints de los módulos.

⚠️ ARCHIVO COMPARTIDO: Coordinar con el otro dev antes de modificar.
"""

from fastapi import APIRouter

router = APIRouter()

# ── Sprint 1 (Dev B): Productos / Inventario ──
from app.api.v1.endpoints import productos
router.include_router(productos.router, prefix="/productos", tags=["Productos"])

# ── Sprint Gonzalo: Categorías ──
from app.api.v1.endpoints import categorias
router.include_router(categorias.router, prefix="/categorias", tags=["Categorías"])

# ── Sprint Gonzalo: Clientes ──
from app.api.v1.endpoints import clientes
router.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])

# ── Sprint Gonzalo: Proveedores ──
from app.api.v1.endpoints import proveedores
router.include_router(proveedores.router, prefix="/proveedores", tags=["Proveedores"])

# ── Sprint Gonzalo: Promociones ──
from app.api.v1.endpoints import promociones
router.include_router(promociones.router, prefix="/promociones", tags=["Promociones"])

# ── Sprint Gonzalo: Ventas (POS) ──
from app.api.v1.endpoints import ventas
router.include_router(ventas.router, prefix="/ventas", tags=["Ventas (POS)"])

# ── Sprint Gonzalo: Pagos de Servicios ──
from app.api.v1.endpoints import servicios
router.include_router(servicios.router, prefix="/servicios", tags=["Pagos de Servicios"])

# ── Sprint 3: Alertas ──
from app.api.v1.endpoints import alertas
router.include_router(alertas.router, prefix="/alertas", tags=["Alertas"])

# ── Sprint 3: Caja ──
from app.api.v1.endpoints import caja
router.include_router(caja.router, prefix="/caja", tags=["Caja Registradora"])

# ── Sprint 3: Reportes y KPIs ──
from app.api.v1.endpoints import reportes
router.include_router(reportes.router, prefix="/reportes", tags=["Reportes y Dashboard"])

# ── Autenticación de Desarrollo ──
from app.api.v1.endpoints import auth
router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])

