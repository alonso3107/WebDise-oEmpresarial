# Integración: Ventas

> **Endpoint base:** `/api/v1/ventas/` (NO EXISTE AÚN)  
> **Estado:** ⚠️ MOCK — usa localStorage + datos de ejemplo  
> **Dependencia:** `GET /api/v1/items/` (para buscar productos)

---

## Endpoints que necesita el frontend

### GET `/api/v1/ventas/`

**Response esperada:**
```json
[
  {
    "id": 1001,
    "fecha": "2026-05-22",
    "cliente": "María López",
    "total": 45.50,
    "items": [
      { "producto_id": 1, "nombre": "Paracetamol 500mg", "cantidad": 2, "precio_unitario": 5.00 }
    ],
    "metodo_pago": "efectivo"
  }
]
```

**Query params opcionales:**
- `?desde=2026-05-01` — filtrar desde fecha
- `?hasta=2026-05-31` — filtrar hasta fecha
- `?cliente_id=1` — filtrar por cliente

### POST `/api/v1/ventas/`

**Request:**
```json
{
  "cliente": "María López",
  "metodo_pago": "efectivo",
  "items": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}
```

**Response esperada (201):**
```json
{
  "id": 1002,
  "fecha": "2026-05-22",
  "cliente": "María López",
  "total": 19.00,
  "metodo_pago": "efectivo",
  "items": [...]
}
```

---

## Reglas para el equipo de backend

- ❗ **Crucial:** Al registrar una venta, el backend debe **descontar el stock** automáticamente
- ❗ `metodo_pago` solo acepta: `"efectivo"` o `"tarjeta"`
- ❗ `cliente` puede ser null o string vacío (venta a cliente general)
- ❗ `total` lo calcula el backend (NO confiar en el total del frontend)
- ❗ IGV = 18% incluido en el precio de venta
- ❗ Validar que haya stock suficiente para cada item antes de registrar
- ❗ El campo `items` debe incluir `producto_id`, `cantidad` (NO `id` ni `producto`)
- ❗ La respuesta debe incluir los items con `nombre` del producto (para mostrar en historial sin otra request)
