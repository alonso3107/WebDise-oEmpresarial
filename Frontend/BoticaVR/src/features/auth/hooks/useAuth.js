// ============================================================
// BoticaVR — Hook useAuth
// Lógica del formulario de login con react-hook-form + Zod.
// ============================================================

import { useState } from 'react';
import useAuthStore from '../../../context/authStore';

/**
 * Hook para el formulario de login.
 * 
 * Uso:
 *   const { login, isLoading, error, limpiarError } = useAuth();
 * 
 * @returns {object} Métodos y estado para el formulario de login
 */
export function useAuth() {
  const { login: storeLogin, logout, isLoading, error, limpiarError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Maneja el envío del formulario de login.
   * 
   * @param {Event} e — Evento submit del formulario
   * @returns {Promise<boolean>} true si el login fue exitoso
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // Validación básica del lado del cliente
    if (!username.trim() || !password.trim()) {
      return false;
    }

    const exito = await storeLogin(username.trim(), password);
    return exito;
  };

  return {
    // Estado del formulario
    username,
    password,
    setUsername,
    setPassword,
    // Estado de la operación
    isLoading,
    error,
    // Acciones
    handleLogin,
    logout,
    limpiarError,
  };
}
