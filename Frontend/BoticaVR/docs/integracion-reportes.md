# Integración: Reportes

> **Endpoint base:** `/api/v1/reportes/` (NO EXISTE AÚN)  
> **Estado:** ⚠️ MOCK — datos simulados estáticos

---

## Endpoints que necesita el frontend

### GET `/api/v1/reportes/resumen?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`

**Response esperada:**
```json
{
  "ingresos_totales": 5450.00,
  "ventas_totales": 105,
  "ticket_promedio": 51.90,
  "producto_top": "Paracetamol 500mg"
}
```

### GET `/api/v1/reportes/ventas-mensuales?anio=2026`

**Response esperada:**
```json
[
  { "mes": "Ene", "ingresos": 4200.00, "ventas": 85 },
  { "mes": "Feb", "ingresos": 3800.00, "ventas": 72 }
]
```

### GET `/api/v1/reportes/productos-top?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&limit=8`

**Response esperada:**
```json
[
  { "nombre": "Paracetamol 500mg", "cantidad": 145, "ingresos": 725.00 },
  { "nombre": "Ibuprofeno 400mg", "cantidad": 98, "ingresos": 637.00 }
]
```

### GET `/api/v1/reportes/ingresos-categoria?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`

**Response esperada:**
```json
[
  { "categoria": "Analgésico", "ingresos": 1050.00 },
  { "categoria": "Antiinflamatorio", "ingresos": 961.00 }
]
```

---

## Reglas para el equipo de backend

- ❗ Todos los endpoints aceptan query params `desde` y `hasta` (opcionales, formato ISO `YYYY-MM-DD`)
- ❗ Si no se pasan fechas, devolver datos del mes actual
- ❗ `ticket_promedio` = `ingresos_totales / ventas_totales`
- ❗ `producto_top` = producto con mayor `ingresos` en el período
- ❗ `productos-top` ordenado por `cantidad` descendente
- ❗ `ingresos-categoria` agrupa ventas por `categoria` del producto y suma `total`
- ❗ `ventas-mensuales` devuelve los 12 meses, con 0 en meses sin ventas (no omitirlos)
- ❗ La exportación CSV la hace el frontend (el backend solo devuelve JSON)
