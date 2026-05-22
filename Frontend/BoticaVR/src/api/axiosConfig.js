// ============================================================
// BoticaVR — Configuración de Axios
// Instancia base + interceptor JWT Bearer Token
// ============================================================

import axios from 'axios';

/**
 * Instancia preconfigurada de Axios para comunicación con el backend FastAPI.
 * 
 * - baseURL apunta a /api/v1 (el proxy de Vite redirige a localhost:8000)
 * - Interceptor de solicitud: adjunta el token JWT desde authStore
 * - Interceptor de respuesta: detecta 401 y redirige al login
 */

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos máximo por solicitud
});

// ── Interceptor de SOLICITUD: inyecta Bearer Token ──
apiClient.interceptors.request.use(
  (config) => {
    // Leer el token directamente de localStorage para evitar dependencia circular
    // con el store de Zustand (el store también usa este cliente)
    const token = localStorage.getItem('botica-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Interceptor de RESPUESTA: manejo de errores ──
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado o inválido → limpiar sesión y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('botica-token');
      // Solo redirigir si NO estamos ya en /login (evita bucle)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Error de red / servidor caído
    if (!error.response) {
      console.error('[BoticaVR] Error de conexión con el backend:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
