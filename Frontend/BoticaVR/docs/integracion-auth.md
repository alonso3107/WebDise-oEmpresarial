# Autenticación

El frontend está preparado para `POST /api/v1/auth/login`, pero el backend todavía
no registra este router y sus archivos de usuario, esquemas y seguridad están
vacíos o pendientes. Para desarrollo local puede usarse `VITE_DEMO_MODE=true`.

No se debe considerar autenticación terminada hasta implementar usuarios, hash de
contraseñas, JWT, dependencia de usuario actual y protección de endpoints.
