// ============================================================
// BoticaVR — LoginForm
// Formulario de inicio de sesión para trabajadores de la farmacia.
// Conectado a POST /api/v1/auth/login vía authStore (Zustand).
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Pill, AlertCircle, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../../context/authStore';

/**
 * Formulario de login.
 * 
 * - Campos: usuario + contraseña
 * - Validación: ambos campos requeridos
 * - Error 401: mensaje claro en español
 * - Éxito: redirige al dashboard
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, limpiarError } = useAuthStore();

  // Estado local del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  /**
   * Envía el formulario de login.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    limpiarError();

    // Validación local
    if (!username.trim()) {
      setErrorLocal('Ingresa tu nombre de usuario');
      return;
    }
    if (!password.trim()) {
      setErrorLocal('Ingresa tu contraseña');
      return;
    }

    const exito = await login(username.trim(), password);
    if (exito) {
      navigate('/dashboard', { replace: true });
    }
  };

  // El error puede venir del store (respuesta del backend) o ser local
  const mensajeError = errorLocal || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)] p-4">
      {/* ── Tarjeta de login ── */}
      <div className="w-full max-w-md">
        {/* Logo / marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primario)] mb-4">
            <Pill className="w-8 h-8 text-[var(--color-fondo)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-texto)]">
            BoticaVR
          </h1>
          <p className="text-sm text-[var(--color-texto-sec)] mt-1 font-light italic">
            Sistema de gestión farmacéutica
          </p>
        </div>

        {/* ── Formulario ── */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-8 space-y-6"
        >
          <h2 className="text-xl font-semibold text-[var(--color-texto)]">
            Iniciar sesión
          </h2>

          {/* ── Error ── */}
          {mensajeError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-[var(--color-alerta)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-alerta)]">
                {mensajeError}
              </p>
            </div>
          )}

          {/* ── Usuario ── */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[var(--color-texto)] mb-1.5"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              autoComplete="username"
              autoFocus
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] placeholder:text-[var(--color-texto-sec)] placeholder:font-light placeholder:italic focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent transition-shadow duration-300 disabled:opacity-60"
            />
          </div>

          {/* ── Contraseña ── */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-texto)] mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] placeholder:text-[var(--color-texto-sec)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent transition-shadow duration-300 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-sec)] hover:text-[var(--color-texto)] transition-colors duration-300 p-1"
                tabIndex={-1}
              >
                {mostrarPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* ── Botón ── */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primario)] text-[var(--color-fondo)] font-medium hover:bg-[var(--color-primario-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:ring-offset-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Ingresando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Ingresar
              </>
            )}
          </button>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-[var(--color-texto-sec)] font-light italic">
            Uso exclusivo para trabajadores de BoticaVR
          </p>
        </form>
      </div>
    </div>
  );
}
