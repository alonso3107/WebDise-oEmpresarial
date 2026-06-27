# Dashboard

El dashboard consulta en paralelo:

- `/api/v1/reportes/dashboard`
- `/api/v1/reportes/ventas-diarias?dias=7`
- `/api/v1/ventas/?limit=5`
- `/api/v1/productos/`

No existe fallback a datos simulados: si la API falla, la vista muestra un estado
de error y permite reintentar.
