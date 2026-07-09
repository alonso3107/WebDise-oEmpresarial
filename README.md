# Botica V&R

Sistema web para la gestion diaria de una botica. Incluye frontend en React, backend en FastAPI y base de datos SQLite para desarrollo local.

## Requisitos

Antes de levantar el proyecto, instala:

- Git
- Podman
- Podman Compose

No es necesario instalar dependencias manualmente para el primer arranque. El contenedor del frontend usa `pnpm` durante la construccion.

## Primer arranque

Clona el repositorio y entra a la carpeta del proyecto:

```bash
git clone <url-del-repositorio>
cd <carpeta-del-proyecto>
```

Si vas a trabajar sobre la rama del ultimo feedback:

```bash
git checkout feedback-v3
```

Levanta backend y frontend con:

```bash
podman compose up -d --build
```

El comando construye las imagenes, instala las dependencias necesarias dentro de los contenedores y deja los servicios corriendo en segundo plano.

## Accesos locales

Cuando los contenedores terminen de iniciar:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Login: `http://localhost:5173/login`

Credenciales locales:

- Usuario: `user`
- Contrasena: `admin`

## Comandos utiles

Ver el estado de los servicios:

```bash
podman compose ps
```

Ver logs:

```bash
podman compose logs -f
```

Detener el proyecto:

```bash
podman compose down
```

Reconstruir despues de cambios importantes:

```bash
podman compose up -d --build
```

## Trabajo sin contenedores

Si necesitas trabajar el frontend fuera del contenedor, usa `pnpm`:

```bash
cd Frontend/BoticaVR
pnpm install
pnpm dev
```

Para validar el frontend:

```bash
pnpm lint
pnpm build
```

## Notas

- El backend corre con SQLite en desarrollo.
- La base de datos se guarda en `Backend/BoticaVR.db`.
- Si los puertos `5173` o `8000` estan ocupados, libera esos puertos antes de levantar los contenedores.
- Si el frontend no conecta con el backend, revisa que ambos servicios esten arriba con `podman compose ps`.
