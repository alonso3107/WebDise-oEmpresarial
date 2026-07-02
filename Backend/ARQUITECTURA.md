# Arquitectura del backend

El backend usa límites parciales de Clean Architecture para separar HTTP,
casos de uso y persistencia sin introducir complejidad innecesaria.

## Capas

```text
app/
├── api/                 Controladores FastAPI y traducción de errores HTTP
├── application/         Casos de uso y reglas de negocio
├── infrastructure/      SQLAlchemy, repositorios e inicialización de SQLite
├── models/              Modelos ORM existentes
├── schemas/             Contratos de entrada y salida
└── core/                Configuración y conexión compartida
```

La dirección principal es:

```text
API → Application → contrato de repositorio ← Infrastructure
```

La capa `application` no importa FastAPI, SQLAlchemy ni modelos ORM. Una prueba
automatizada protege esta regla. Los controladores solo traducen solicitudes y
errores; las transacciones de ventas viven en el servicio de aplicación y las
consultas agregadas viven en repositorios de infraestructura.

## Inicialización

`infrastructure/database/bootstrap.py` crea el esquema y carga un catálogo solo
si categorías, productos, clientes y ventas están vacíos. La operación es
idempotente: reiniciar el servidor no duplica datos.

Se puede desactivar con una variable de entorno:

```powershell
$env:CARGAR_DATOS_INICIALES="false"
```

La ruta predeterminada de SQLite es absoluta respecto a `Backend/`, por lo que no
cambia según la carpeta desde la que se invoque el proceso.

## Pruebas

```powershell
python -m unittest discover -s tests -v
```

Las pruebas cubren el flujo completo de venta, anulación y devolución de stock,
la carga inicial idempotente y la dirección de dependencias.

