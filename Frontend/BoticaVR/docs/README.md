# Integración Backend ↔ Frontend

El frontend usa `/api/v1` y Vite redirige las peticiones a `http://localhost:8000`.
Los componentes no consumen respuestas HTTP directamente: los servicios adaptan los
contratos del backend a los modelos de vista.

## Estado

| Módulo | Endpoints | Estado |
|---|---|---|
| Inventario | `/productos`, `/categorias` | Integrado |
| Clientes | `/clientes`, `/ventas?cliente_id=` | Integrado |
| Ventas | `/ventas`, `/productos`, `/clientes` | Integrado |
| Dashboard | `/reportes/dashboard`, `/reportes/ventas-diarias`, `/ventas` | Integrado |
| Reportes | `/reportes/*` | Integrado |
| Autenticación | `/auth/*` | Pendiente en backend |

## Ejecución

```bash
# Backend
cd Backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd Frontend/BoticaVR
pnpm dev
```

Hasta implementar autenticación en FastAPI, se puede habilitar el acceso local con
`VITE_DEMO_MODE=true`. Este modo solo evita el bloqueo de la interfaz; los datos se
leen y escriben en SQLite mediante la API real.

## Validación

```bash
cd Backend
python -m unittest discover -s tests -v

cd Frontend/BoticaVR
pnpm lint
pnpm build
```
