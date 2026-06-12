# Backend — Botica V&R API

API REST con **FastAPI + SQLAlchemy + SQLite** para la gestión integral de la Botica V&R.

## Requisitos previos
- Python 3.9+

## Instalación

```bash
cd Backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Instalar dependencias importantes
pip install -r requirements.txt
```

## Ejecutar el servidor

```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

El servidor arranca en **http://localhost:8000**

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/

## Notas importantes

- **CORS**: El frontend conecta desde el puerto `5173`
- **Base de datos**: SQLite → se crea automáticamente como `BoticaVR.db`
- **Antes de hacer git push**: Avisar al grupo para coordinar modificaciones
- **Si el IDE marca errores de imports**: Verificar que `pyrightconfig.json` exista en la raíz del proyecto y que el intérprete de Python apunte al `venv`
