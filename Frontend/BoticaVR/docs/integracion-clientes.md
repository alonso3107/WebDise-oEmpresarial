# Integración: Clientes

> **Endpoint base:** `/api/v1/clientes/` (NO EXISTE AÚN)  
> **Estado:** ⚠️ MOCK — usa localStorage + 4 clientes precargados

---

## Endpoints que necesita el frontend

### GET `/api/v1/clientes/`

**Response esperada:**
```json
[
  {
    "id": 1,
    "nombre": "María López García",
    "dni": "12345678",
    "telefono": "987654321",
    "fecha_registro": "2026-01-15"
  }
]
```

### POST `/api/v1/clientes/`

**Request:**
```json
{
  "nombre": "María López García",
  "dni": "12345678",
  "telefono": "987654321"
}
```

**Response esperada (201):**
```json
{
  "id": 2,
  "nombre": "María López García",
  "dni": "12345678",
  "telefono": "987654321",
  "fecha_registro": "2026-05-22"
}
```

### PUT `/api/v1/clientes/{id}`

**Request:** Mismos campos que POST (todos opcionales).

### DELETE `/api/v1/clientes/{id}`

**Response esperada (200 o 204).**

### GET `/api/v1/clientes/{id}/compras`

Historial de compras de un cliente.

**Response esperada:**
```json
[
  {
    "id": 1001,
    "fecha": "2026-05-22",
    "total": 45.50,
    "productos": 3,
    "metodo_pago": "efectivo"
  }
]
```

---

## Reglas para el equipo de backend

- ❗ `dni` debe ser único (no puede haber 2 clientes con el mismo DNI)
- ❗ `dni` debe tener exactamente 8 dígitos numéricos
- ❗ `telefono` es opcional, 9 dígitos
- ❗ `nombre` es obligatorio
- ❗ `fecha_registro` se genera automáticamente en el backend
- ❗ DELETE debe ser SOFT DELETE o validar que no tenga ventas asociadas
- ❗ GET `/clientes/{id}/compras` debe filtrar solo ventas de ese cliente
- ❗ Si no se quiere endpoint separado para compras, incluir `compras` como array anidado en GET `/clientes/{id}`
