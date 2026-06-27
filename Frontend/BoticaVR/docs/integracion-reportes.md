# Reportes

- `/api/v1/reportes/ventas-diarias`
- `/api/v1/reportes/productos-mas-vendidos`
- `/api/v1/reportes/ingresos-por-categoria`
- `/api/v1/reportes/resumen`

Todos aceptan `desde` y `hasta` cuando corresponde. Las agregaciones se ejecutan
en SQL para evitar descargar el historial completo y recalcularlo en el navegador.
