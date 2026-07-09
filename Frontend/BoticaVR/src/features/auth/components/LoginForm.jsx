// ============================================================
// BoticaVR - LoginForm
// Entrada tranquila y directa para trabajadores de la botica.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Pill,
  User,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import useAuthStore from '../../../context/authStore';

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

    if (!username.trim()) {
      setErrorLocal('Escribe el usuario para ingresar.');
      return;
    }
    if (!password.trim()) {
      setErrorLocal('Escribe la contrasena para ingresar.');
      return;
    }

    const exito = await login(username.trim(), password);
    if (exito) navigate('/dashboard', { replace: true });
  };

  const demoLogin = () => {
    useAuthStore.getState().demoLogin();
    navigate('/dashboard', { replace: true });
  };

  const mensajeError = errorLocal || error;

  return (
    <main className="min-h-dvh bg-[#EEF4EF] px-4 py-8 text-[#1C2B36]">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#DDEAE3] bg-white text-[#5C6D7C] shadow-[0_14px_36px_rgba(28,43,54,0.08)]">
              <Pill className="h-9 w-9" />
            </div>

            <h1 className="mt-7 text-5xl font-bold leading-tight text-[#1C2B36]">
              BoticaVR
            </h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-[#5C6D7C]">
              Acceso del personal autorizado.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[430px] rounded-xl border border-[#DDEAE3] bg-white p-6 shadow-[0_18px_50px_rgba(28,43,54,0.10)] sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#E7F0EA] text-[#5C6D7C]">
              <Pill className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#1C2B36]">Iniciar sesion</h2>
            <p className="mt-2 text-sm leading-6 text-[#5C6D7C]">
              Ingresa tus credenciales.
            </p>
          </div>

          <div className="mb-5 rounded-lg border border-[#DDEAE3] bg-[#F7FAF7] p-4">
            <p className="text-sm font-bold text-[#1C2B36]">Credenciales locales</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#5C6D7C]">
              <div className="rounded-md bg-white px-3 py-2">
                <span className="block font-semibold text-[#1C2B36]">Usuario</span>
                <span className="font-mono">user</span>
              </div>
              <div className="rounded-md bg-white px-3 py-2">
                <span className="block font-semibold text-[#1C2B36]">Contrasena</span>
                <span className="font-mono">admin</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mensajeError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-alerta)]" />
                <p className="text-sm font-medium text-[var(--color-alerta)]">{mensajeError}</p>
              </div>
            )}

            <Input
              label="Usuario"
              icon={User}
              placeholder="user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={isLoading}
              className="bg-white"
            />

            <div className="relative">
              <Input
                label="Contrasena"
                icon={LockKeyhole}
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                className="bg-white pr-11"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                className="absolute right-3 top-[34px] flex h-9 w-9 items-center justify-center rounded-lg text-[#5C6D7C] transition-colors duration-200 hover:bg-[#E7F0EA] hover:text-[#1C2B36] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#5C6D7C]/25"
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" className="h-12 w-full bg-[#5C6D7C] text-[#F7FAF7] hover:bg-[#4A5A68]" disabled={isLoading}>
              <LogIn className="h-4 w-4" /> Entrar al sistema
            </Button>

            {DEMO_MODE && (
              <Button type="button" variant="secundario" className="h-11 w-full" onClick={demoLogin}>
                Entrar en modo demo
              </Button>
            )}
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-[#5C6D7C]">
            Uso interno de BoticaVR.
          </p>
        </section>
      </div>
    </main>
  );
}
