# Guía de Integración Backend ↔ Frontend

> **BoticaVR** — Sistema de gestión farmacéutica  
> **Frontend:** React + Vite + Tailwind v4 (puerto 5173)  
> **Backend:** FastAPI + SQLite (puerto 8000)  
> **Proxy:** Vite redirige `/api/*` → `http://localhost:8000`

---

## Reglas globales

### Nombrado de campos
- ✅ **Siempre snake_case**: `precio_venta`, `fecha_vencimiento`, `access_token`
- ❌ **Nunca camelCase**: `precioVenta`, `accessToken`
- ✅ **Nombres en español**: `nombre`, `categoria`, `metodo_pago`
- ❌ **Nunca en inglés**: `name`, `category`, `paymentMethod`

### Formato de respuestas
- ✅ Listas vacías: `[]` (nunca `null` o `""`)
- ✅ Errores: `{"detail": "Mensaje descriptivo en español"}`
- ✅ Fechas: ISO 8601 `YYYY-MM-DD` (sin hora)
- ✅ Precios: number (no string), con 2 decimales

### Autenticación
- ✅ Header: `Authorization: Bearer {access_token}`
- ✅ Token expirado/inválido → **401 Unauthorized**
- ✅ Login response: `{"access_token": "...", "token_type": "bearer"}`
- ✅ Logout debe invalidar el token en el backend

### CORS
- Origen permitido: `http://localhost:5173`
- Métodos: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type

---

## Estado de los módulos

| Módulo | Endpoint | Estado | Archivo doc |
|---|---|---|---|
| Auth | `/api/v1/auth/*` | ✅ Real | `integracion-auth.md` |
| Inventario | `/api/v1/items/*` | ✅ Real | `integracion-inventario.md` |
| Dashboard | `/api/v1/items/*` + mocks | ⚠️ Parcial | `integracion-dashboard.md` |
| Ventas | `/api/v1/ventas/*` | ⚠️ Mock | `integracion-ventas.md` |
| Clientes | `/api/v1/clientes/*` | ⚠️ Mock | `integracion-clientes.md` |
| Reportes | `/api/v1/reportes/*` | ⚠️ Mock | `integracion-reportes.md` |

---

## Prioridad de implementación (backend)

1. **Items CRUD** — ya existe, verificar que cumpla las reglas de esta guía
2. **Ventas** — crítico: es la funcionalidad core. Debe descontar stock.
3. **Clientes** — baja complejidad, alta prioridad para UX
4. **Reportes** — queries de agregación sobre ventas. Último en prioridad.

---

## Cómo probar la integración

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd Frontend/BoticaVR
pnpm dev

# Abrir http://localhost:5173
# Login con credenciales configuradas en el backend
```
