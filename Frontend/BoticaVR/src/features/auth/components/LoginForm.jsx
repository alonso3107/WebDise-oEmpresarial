// ============================================================
// BoticaVR — LoginForm
// Formulario de inicio de sesión con modo demo controlado por
// variable de entorno VITE_DEMO_MODE.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Pill, AlertCircle, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../../context/authStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

/**true si el modo demo está activado vía .env */
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, limpiarError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    limpiarError();

    if (!username.trim()) { setErrorLocal('Ingresa tu nombre de usuario'); return; }
    if (!password.trim()) { setErrorLocal('Ingresa tu contraseña'); return; }

    const exito = await login(username.trim(), password);
    if (exito) navigate('/dashboard', { replace: true });
  };

  /**
   * Modo demo: inyecta token falso y redirige al dashboard.
   * Solo se ejecuta si VITE_DEMO_MODE=true en .env
   */
  const demoLogin = () => {
    useAuthStore.getState().demoLogin();
    navigate('/dashboard', { replace: true });
  };

  const mensajeError = errorLocal || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primario)] mb-4">
            <Pill className="w-8 h-8 text-[var(--color-fondo)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-texto)]">BoticaVR</h1>
          <p className="text-sm text-[var(--color-texto-sec)] mt-1 font-light italic">
            Sistema de gestión farmacéutica
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-8 space-y-6">
          <h2 className="text-xl font-semibold text-[var(--color-texto)]">Iniciar sesión</h2>

          {mensajeError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-[var(--color-alerta)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-alerta)]">{mensajeError}</p>
            </div>
          )}

          <Input label="Usuario" placeholder="Tu nombre de usuario" value={username}
            onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus disabled={isLoading} />

          <div className="relative">
            <Input label="Contraseña" type={mostrarPassword ? 'text' : 'password'}
              placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" disabled={isLoading} />
            <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-[38px] text-[var(--color-texto-sec)] hover:text-[var(--color-texto)] transition-colors duration-300 p-1" tabIndex={-1}>
              {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            <LogIn className="w-5 h-5" /> Ingresar
          </Button>

          <p className="text-center text-xs text-[var(--color-texto-sec)] font-light italic">
            Uso exclusivo para trabajadores de BoticaVR
          </p>

          {/* ── Modo demo: solo visible con VITE_DEMO_MODE=true ── */}
          {DEMO_MODE && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-borde)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[var(--color-card)] text-xs text-[var(--color-texto-sec)] font-light italic">o</span>
                </div>
              </div>

              <button type="button" onClick={demoLogin}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-[var(--color-borde)] text-[var(--color-texto-sec)] font-medium hover:border-[var(--color-primario)] hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/5 transition-all duration-300">
                🔧 Entrar sin backend (demo)
              </button>

              <p className="text-center text-xs text-[var(--color-texto-sec)] font-light italic">
                ⚠️ Modo desarrollo — autenticación backend pendiente
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
