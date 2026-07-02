# Backend — Botica V&R API

API REST con **FastAPI + SQLAlchemy + SQLite** para la gestión integral de la Botica V&R.

## Requisitos previos
- Python 3.9+

## Instalación

```bash
cd Backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\Activate.ps1      # Windows PowerShell
# source venv/bin/activate      # macOS / Linux

# Instalar dependencias importantes
pip install -r requirements.txt
```

## Ejecutar el servidor

```bash
venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```

El servidor arranca en **http://localhost:8000**

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/

## Notas importantes

- **CORS**: El frontend conecta desde el puerto `5173`
- **Base de datos**: SQLite → `Backend/BoticaVR.db`, sin depender del directorio actual
- **Datos iniciales**: se crean automáticamente cuando la base está vacía y no se duplican
- **Arquitectura**: consulta [ARQUITECTURA.md](ARQUITECTURA.md)
- **Pruebas**: `python -m unittest discover -s tests -v`
- **Antes de hacer git push**: Avisar al grupo para coordinar modificaciones
- **Si el IDE marca errores de imports**: Verificar que `pyrightconfig.json` exista en la raíz del proyecto y que el intérprete de Python apunte al `venv`
