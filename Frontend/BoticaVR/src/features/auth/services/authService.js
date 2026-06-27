// ============================================================
// BoticaVR — Auth Service
// Capa de servicio: orquesta llamadas API + estado global.
// Los componentes/hooks consumen desde aquí, nunca directo a la API.
// ============================================================

import { logoutRequest } from '../../../api/authApi';
import useAuthStore from '../../../context/authStore';

/**
 * Servicio de autenticación.
 * Encapsula la lógica de negocio entre la UI y la capa HTTP.
 */
const authService = {
  /**
   * Inicia sesión y actualiza el estado global.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{exito: boolean, error?: string}>}
   */
  async login(username, password) {
    const store = useAuthStore.getState();

    try {
      const exito = await store.login(username, password);
      return { exito, error: exito ? undefined : useAuthStore.getState().error };
    } catch (error) {
      let mensaje = 'Error al iniciar sesión';

      if (error.response?.status === 401) {
        mensaje = 'Usuario o contraseña incorrectos';
      } else if (error.response?.data?.detail) {
        mensaje = error.response.data.detail;
      } else if (!error.response) {
        mensaje = 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
      }

      return { exito: false, error: mensaje };
    }
  },

  /**
   * Cierra sesión (local + backend).
   */
  async logout() {
    try {
      await logoutRequest();
    } catch {
      // Ignorar errores del backend en logout
    } finally {
      useAuthStore.getState().logout();
    }
  },
};

export default authService;
