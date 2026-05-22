// ============================================================
// BoticaVR — AuthStore (Zustand)
// Estado global de autenticación: token JWT, usuario actual,
// acciones de login/logout.
// ============================================================

import { create } from 'zustand';
import apiClient from '../api/axiosConfig';

/**
 * Estructura del estado de autenticación.
 * 
 * @property {string|null} token — JWT access token
 * @property {object|null} usuario — Datos del trabajador autenticado
 * @property {boolean} isAuthenticated — true si hay token válido
 * @property {boolean} isLoading — true durante login/logout
 * @property {string|null} error — Mensaje de error del último intento
 */

/**
 * Hook principal de autenticación.
 * 
 * Uso:
 *   const { login, logout, isAuthenticated, usuario } = useAuthStore();
 */
const useAuthStore = create((set, get) => ({
  // ── Estado inicial ──
  token: localStorage.getItem('botica-token') || null,
  usuario: null,
  isAuthenticated: !!localStorage.getItem('botica-token'),
  isLoading: false,
  error: null,

  /**
   * Inicia sesión con credenciales del trabajador.
   * 
   * @param {string} username — Nombre de usuario
   * @param {string} password — Contraseña
   * @returns {Promise<boolean>} true si login exitoso
   */
  login: async (username, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      // El backend responde con { access_token, token_type }
      const { access_token } = response.data;
      
      // Persistir token en localStorage
      localStorage.setItem('botica-token', access_token);

      set({
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      // Extraer mensaje descriptivo del error
      let mensaje = 'Error al iniciar sesión';

      if (error.response?.status === 401) {
        mensaje = 'Usuario o contraseña incorrectos';
      } else if (error.response?.data?.detail) {
        mensaje = error.response.data.detail;
      } else if (!error.response) {
        mensaje = 'No se pudo conectar con el servidor';
      }

      set({
        isLoading: false,
        error: mensaje,
      });

      return false;
    }
  },

  /**
   * Cierra la sesión del trabajador.
   * Limpia token, usuario y redirige al login.
   */
  /**
   * Modo demo: inicia sesión sin backend.
   * ⚠️ Solo para desarrollo.
   */
  demoLogin: () => {
    localStorage.setItem('botica-token', 'demo-token-boticavr-2026');
    set({
      token: 'demo-token-boticavr-2026',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  logout: () => {
    // Intentar notificar al backend (fire-and-forget)
    apiClient.post('/auth/logout').catch(() => {
      // Ignorar errores — el logout local es lo importante
    });

    // Limpiar estado local
    localStorage.removeItem('botica-token');

    set({
      token: null,
      usuario: null,
      isAuthenticated: false,
      error: null,
    });
  },

  /**
   * Limpia el mensaje de error (útil al cerrar modales, cambiar de pantalla).
   */
  limpiarError: () => set({ error: null }),
}));

export default useAuthStore;
