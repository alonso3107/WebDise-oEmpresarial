// ============================================================
// BoticaVR — LoginForm
// Formulario de inicio de sesión con modo demo controlado por
// variable de entorno VITE_DEMO_MODE y Avatar interactivo.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Pill, AlertCircle, Eye, EyeOff, User } from 'lucide-react';
import useAuthStore from '../../../context/authStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

/** true si el modo demo está activado vía .env */
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

  const demoLogin = () => {
    useAuthStore.getState().demoLogin();
    navigate('/dashboard', { replace: true });
  };

  const mensajeError = errorLocal || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)] p-4 antialiased">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        
        {/* Logo minimalista */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <Pill className="w-6 h-6 text-[var(--color-primario)]" />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-texto)]">BoticaVR</h1>
          </div>
          <p className="text-xs text-[var(--color-texto-sec)] font-light italic">
            Sistema de gestión farmacéutica
          </p>
        </div>

        {/* Tarjeta de Formulario con Avatar Interactivo */}
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-8 border border-[var(--color-borde)] relative">
          
          {/* Avatar interactivo con hover */}
          <div className="flex justify-center mb-6 relative group">
            <div className="w-14 h-14 rounded-full border border-[var(--color-borde)] bg-[var(--color-card)] flex items-center justify-center cursor-help transition-all duration-300 hover:border-[var(--color-primario)] hover:shadow-sm">
              <User className="w-6 h-6 text-[var(--color-texto-sec)] group-hover:text-[var(--color-primario)] transition-colors duration-300" />
            </div>
            
            {/* Panel de Hover (Tooltip) */}
            <div className="absolute top-16 scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50 w-60 p-4 rounded-xl border border-[var(--color-borde)] bg-[var(--color-card)]/95 backdrop-blur-sm shadow-lg pointer-events-none text-left">
              <h4 className="text-[10px] font-semibold text-[var(--color-primario)] uppercase tracking-wider mb-2">Credenciales de Acceso</h4>
              <div className="space-y-1.5 text-xs text-[var(--color-texto)] font-light">
                <p className="flex justify-between">
                  <span className="text-[var(--color-texto-sec)]">Usuario:</span> 
                  <span className="font-mono bg-[var(--color-fondo)] px-1 rounded tabular-nums">user</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--color-texto-sec)]">Contraseña:</span> 
                  <span className="font-mono bg-[var(--color-fondo)] px-1 rounded tabular-nums">admin</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--color-texto-sec)]">Rol:</span> 
                  <span className="font-medium">Operador</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--color-texto-sec)]">Entorno:</span> 
                  <span className="font-medium text-emerald-600">Desarrollo</span>
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--color-borde)] text-[9px] text-[var(--color-texto-sec)] text-center font-light italic">
                Pasa el cursor para ver credenciales
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-[var(--color-texto)] text-center">Iniciar Sesión</h2>

            {mensajeError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50/50 border border-red-200/60">
                <AlertCircle className="w-4 h-4 text-[var(--color-alerta)] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-alerta)]">{mensajeError}</p>
              </div>
            )}

            <Input 
              label="Usuario" 
              placeholder="user" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              autoComplete="username" 
              autoFocus 
              disabled={isLoading} 
            />

            <div className="relative">
              <Input 
                label="Contraseña" 
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="admin" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" 
                disabled={isLoading} 
              />
              <button 
                type="button" 
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-[34px] text-[var(--color-texto-sec)] hover:text-[var(--color-texto)] transition-colors duration-300 p-1" 
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              <LogIn className="w-4 h-4" /> Ingresar
            </Button>

            <p className="text-center text-[10px] text-[var(--color-texto-sec)] font-light italic">
              Uso exclusivo para trabajadores de BoticaVR
            </p>

            {/* Modo demo */}
            {DEMO_MODE && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-borde)]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-[var(--color-card)] text-[10px] text-[var(--color-texto-sec)] font-light italic">o</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={demoLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--color-borde)] text-xs text-[var(--color-texto-sec)] font-medium hover:border-[var(--color-primario)] hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/5 transition-all duration-300"
                >
                  🔧 Entrar sin backend (demo)
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
