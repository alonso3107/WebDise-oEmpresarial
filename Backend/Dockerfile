# ============================================================
# BoticaVR — Backend FastAPI + SQLite
# ============================================================
FROM python:3.12-slim

WORKDIR /app

# ── Dependencias del sistema ──
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Dependencias Python ──
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Código fuente ──
COPY . .

# ── Crear directorio para la base de datos ──
RUN mkdir -p /app/db

EXPOSE 8000

# ── Healthcheck ──
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
    CMD curl -f http://localhost:8000/ || exit 1

# ── El CMD se sobrescribe en compose para desarrollo con --reload ──
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
