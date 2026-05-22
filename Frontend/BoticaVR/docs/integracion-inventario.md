# Integración: Inventario

> **Endpoint base:** `/api/v1/items/`  
> **Estado:** ✅ Conectado a backend real  
> **Schema Pydantic:** `backend/app/schemas/item.py`

---

## Endpoints que consume

### GET `/api/v1/items/`

**Response esperada (200):**
```json
[
  {
    "id": 1,
    "nombre": "Paracetamol 500mg",
    "categoria": "Analgésico",
    "stock": 45,
    "precio_compra": 2.50,
    "precio_venta": 5.00,
    "fecha_vencimiento": "2027-06-15"
  }
]
```

### POST `/api/v1/items/`

**Request:**
```json
{
  "nombre": "Ibuprofeno 400mg",
  "categoria": "Antiinflamatorio",
  "stock": 20,
  "precio_compra": 3.00,
  "precio_venta": 6.50,
  "fecha_vencimiento": "2027-08-20"
}
```

**Response esperada (201):**
```json
{
  "id": 2,
  "nombre": "Ibuprofeno 400mg",
  "categoria": "Antiinflamatorio",
  "stock": 20,
  "precio_compra": 3.00,
  "precio_venta": 6.50,
  "fecha_vencimiento": "2027-08-20"
}
```

### PUT `/api/v1/items/{id}`

**Request:** Mismos campos que POST (todos opcionales, solo los enviados se actualizan).

**Response esperada (200):** Objeto actualizado.

### DELETE `/api/v1/items/{id}`

**Response esperada (200 o 204):** Sin body o `{"detail": "Producto eliminado"}`.

---

## Reglas para el equipo de backend

- ❗ Los campos se llaman exactamente: `nombre`, `categoria`, `stock`, `precio_compra`, `precio_venta`, `fecha_vencimiento` (snake_case, español)
- ❗ `stock` es integer ≥ 0
- ❗ `precio_compra` y `precio_venta` son float con 2 decimales
- ❗ `fecha_vencimiento` es string ISO 8601 (`YYYY-MM-DD`), puede ser null
- ❗ `categoria` es string libre (no hay catálogo predefinido)
- ❗ GET debe devolver array (vacío `[]` si no hay productos, no null)
- ❗ POST/PUT deben validar que `precio_venta > 0` y `nombre` no esté vacío
- ❗ DELETE debe devolver 404 si el id no existe
