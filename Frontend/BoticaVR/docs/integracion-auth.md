# Integración: Auth

> **Endpoint base:** `/api/v1/auth/`  
> **Estado:** ✅ Conectado a backend real

---

## Endpoints que consume

### POST `/api/v1/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response esperada (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Response error (401):**
```json
{
  "detail": "Usuario o contraseña incorrectos"
}
```

### POST `/api/v1/auth/logout`

**Request:** Sin body. El token va en header `Authorization: Bearer {token}`.

**Response esperada (200):**
```json
{
  "detail": "Sesión cerrada exitosamente"
}
```

---

## Flujo en el frontend

1. `LoginForm` → `authStore.login(username, password)`
2. El store llama a `POST /api/v1/auth/login` vía `apiClient` (Axios)
3. Si 200: guarda `access_token` en `localStorage` (clave `botica-token`)
4. Axios interceptor inyecta `Authorization: Bearer {token}` en **todas** las requests
5. Si 401 en **cualquier** request: limpia token y redirige a `/login`

---

## Reglas para el equipo de backend

- ❗ El endpoint de login **debe** devolver `access_token` (no `accessToken`, no `token`)
- ❗ El campo `token_type` debe ser `"bearer"` (minúscula)
- ❗ Todos los endpoints que requieran auth deben devolver **401** (no 403) cuando el token sea inválido/expirado
- ❗ El logout debe invalidar el token en el backend (no basta con eliminarlo del cliente)
- ❗ Los mensajes de error van en el campo `detail` del response body
- ✅ El esquema Pydantic esperado está en `backend/app/schemas/auth.py`
