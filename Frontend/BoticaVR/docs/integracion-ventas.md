# Ventas

- Registro e historial: `/api/v1/ventas/`
- Catálogo: `/api/v1/productos/`
- Selección de cliente: `/api/v1/clientes/`

El frontend envía únicamente `producto_id` y `cantidad`. El backend valida stock,
calcula descuentos, persiste la venta y descuenta existencias dentro de la misma
transacción. Los precios mostrados incluyen IGV; no se vuelve a sumar 18 % al total.
