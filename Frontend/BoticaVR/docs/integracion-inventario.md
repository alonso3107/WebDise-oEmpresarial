# Inventario

- `GET/POST/PUT/DELETE /api/v1/productos/`
- `GET/POST /api/v1/categorias/`

La UI trabaja con `precio_venta` y el adaptador lo traduce al campo `precio` del
backend. También resuelve el texto de categoría a `categoria_id`; si la categoría
no existe, la crea antes de guardar el producto.
