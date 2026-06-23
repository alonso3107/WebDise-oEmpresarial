
## 1. Modificaciones a Modelos Existentes

### Modelo `Producto`
Se añadieron dos nuevas llaves foráneas (`categoria_id` y `proveedor_id`) al modelo `Producto` original. 
**Justificación:**
- `categoria_id`: Es necesario para poder clasificar los productos por tipo (Medicamentos, Cuidado Personal, etc.) y facilitar los filtros en el POS y reportes de rotación.
- `proveedor_id`: Necesario para la trazabilidad de la cadena de suministro y facilitar el reabastecimiento.
*Nota: Ambos campos son `nullable=True` para no romper los productos ya registrados en la base de datos.*

## 2. Nuevas Tablas y Modelos

Se diseñaron e integraron 7 nuevas entidades en SQLite (`BoticaVR.db`), con sus respectivos Modelos de SQLAlchemy y Schemas de Pydantic:
1. **`Categoria`**: Clasificación del catálogo.
2. **`Proveedor`**: Empresas suministradoras.
3. **`Cliente`**: Registro de clientes, incluye contadores automáticos para fidelidad (`total_compras`, `monto_acumulado`, `es_fiel`).
4. **`Promocion`**: Motor de descuentos. Soporta dos tipos: `"festividad"` y `"fidelidad"`.
5. **`Venta`**: Cabecera del ticket/boleta POS. Guarda montos totales, descuentos aplicados y método de pago.
6. **`DetalleVenta`**: Ítems individuales por cada venta.
7. **`PagoServicio`**: Pagos externos como luz, agua o colegios (no afectan inventario).

## 3. Lógica de Negocio Central (Punto de Venta)

El módulo de ventas (`/api/v1/ventas/`) centraliza la lógica fuerte del sistema:

### Flujo Transaccional POS
Al registrar una venta, el sistema automáticamente:
1. Valida que haya **stock suficiente** de cada producto.
2. Calcula el subtotal.
3. Aplica los **descuentos correspondientes** (ver sección abajo).
4. Guarda la cabecera y detalles de la venta.
5. **Descuenta el stock** de los productos afectados.
6. Suma la compra y el monto al **historial del cliente**.
7. Evalúa automáticamente si el cliente asciende a "Cliente Fiel".

### Motor de Promociones y Descuentos
Las reglas de negocio para los descuentos (configurables en `app/core/config.py`) son las siguientes:
- **Acumulación:** Los descuentos por festividad y fidelidad **se suman**.
- **Tope Máximo:** El descuento combinado nunca puede superar el **15%** (Variable `DESCUENTO_MAX_PORCENTAJE`).
- **Condición Cliente Fiel:** Para que un cliente reciba un descuento de fidelidad, debe tener al menos **5 compras** en su historial **Y** haber gastado más de **S/ 25.00** en total (Variables `FIDELIDAD_MIN_COMPRAS` y `FIDELIDAD_MIN_MONTO`).

### ↩Anulación de Ventas
Existe un endpoint para anular ventas (`PUT /api/v1/ventas/{id}/anular`). Al hacerlo:
- Se devuelve el stock íntegro a los productos.
- Se resta la compra y el monto acumulado del cliente.
- El sistema reevalúa la condición de fidelidad (el cliente puede perder el estatus de "fiel" si baja de los umbrales).

## 4. Estructura de Endpoints Disponibles

Todos los endpoints tienen operaciones CRUD completas y están bajo el prefijo `/api/v1/`:
- `[GET/POST/PUT/DELETE] /categorias/`
- `[GET/POST/PUT/DELETE] /clientes/` *(Incluye filtro para buscar por DNI)*
- `[GET/POST/PUT/DELETE] /proveedores/`
- `[GET/POST/PUT/DELETE] /promociones/`
- `[GET/POST/GET_ID/PUT] /ventas/` *(Incluye filtros por fecha, estado y método de pago)*
- `[GET/POST/GET_ID] /servicios/`

## 5. Instrucciones para Ejecución Local
Para arrancar el backend y que la base de datos sincronice las nuevas tablas automáticamente, usar el entorno virtual:
```bash
# Estando en la carpeta Backend/
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```
La documentación interactiva (Swagger) con los nuevos endpoints está en: `http://localhost:8000/docs`
