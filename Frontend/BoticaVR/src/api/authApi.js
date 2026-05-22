// ============================================================
// BoticaVR — Auth API
// Llamadas HTTP a /api/v1/auth/
// ============================================================

import apiClient from './axiosConfig';

/**
 * Envía credenciales al backend para obtener un token JWT.
 *
 * @param {string} username — Nombre de usuario del trabajador
 * @param {string} password — Contraseña
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function loginRequest(username, password) {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
  });
  return response.data;
}

/**
 * Cierra sesión en el backend (invalida el token).
 *
 * @returns {Promise<void>}
 */
export async function logoutRequest() {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

/**
 * Refresca el token JWT actual.
 *
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function refreshTokenRequest() {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
}
