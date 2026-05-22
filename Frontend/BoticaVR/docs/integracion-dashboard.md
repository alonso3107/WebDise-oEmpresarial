# Integración: Dashboard

> **Endpoints que consume:** `GET /api/v1/items/` (único endpoint real)  
> **Estado:** ⚠️ Parcial — inventario conectado, ventas/resumen son mock

---

## Datos que necesita el dashboard

### Fuente REAL: `GET /api/v1/items/`

El dashboard usa este endpoint para:
- **Productos críticos:** filtrar `stock === 0` en el frontend
- **Total de productos:** `productos.length`
- **Alertas de stock bajo:** `stock <= 5`

### Fuente MOCK (necesita endpoint):

El dashboard necesita un endpoint de resumen. Propuesta:

#### GET `/api/v1/dashboard/resumen`

```json
{
  "ventas_dia": 8,
  "ingresos_dia": 545.50,
  "clientes_atendidos": 8,
  "stock_bajo": 4
}
```

#### GET `/api/v1/dashboard/ventas-semanales`

```json
[
  { "dia": "2026-05-18", "ventas": 320.00, "transacciones": 5 },
  { "dia": "2026-05-19", "ventas": 280.00, "transacciones": 4 }
]
```

#### GET `/api/v1/ventas/?limit=5&order=fecha_desc`

Últimas 5 ventas para la sección "Últimas ventas".

---

## Reglas para el equipo de backend

- ❗ Mientras no existan estos endpoints, el dashboard funciona con datos mock (no bloquea)
- ❗ `ventas_dia` e `ingresos_dia` deben ser del día actual (no acumulados)
- ❗ `stock_bajo` = count de productos con stock ≤ 5
- ❗ Las ventas semanales deben ser de lunes a domingo de la semana actual
