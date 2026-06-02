// ============================================================
// BoticaVR — LoginForm
// Formulario de inicio de sesión con modo demo controlado por
// variable de entorno VITE_DEMO_MODE.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../../../context/authStore";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

/**true si el modo demo está activado vía .env */
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, limpiarError } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");
    limpiarError();

    if (!username.trim()) {
      setErrorLocal("Ingresa tu nombre de usuario");
      return;
    }
    if (!password.trim()) {
      setErrorLocal("Ingresa tu contraseña");
      return;
    }

    const exito = await login(username.trim(), password);
    if (exito) navigate("/dashboard", { replace: true });
  };

  /**
   * Modo demo: inyecta token falso y redirige al dashboard.
   * Solo se ejecuta si VITE_DEMO_MODE=true en .env
   */
  const demoLogin = () => {
    useAuthStore.getState().demoLogin();
    navigate("/dashboard", { replace: true });
  };

  const mensajeError = errorLocal || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,var(--color-fondo)_0%,#f8fbfd_100%)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-borde)] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-texto-sec)] shadow-[var(--shadow-card)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primario)]" />
            BoticaVR
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-texto)]">
            Acceso para personal autorizado
          </h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-texto-sec)]">
            Portal interno para personal autorizado.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[var(--color-borde)] bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.08)] space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-1 w-16 rounded-full bg-[var(--color-primario)]" />
              <div className="space-y-1">
                <h2 className="text-lg font-medium text-[var(--color-texto)]">
                  Ingresar
                </h2>
              </div>
            </div>

            <div className="relative group shrink-0">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-borde)] bg-[linear-gradient(180deg,#ffffff_0%,#eef4f8_100%)] text-sm font-semibold text-[var(--color-texto)] shadow-[0_8px_18px_rgba(15,23,42,0.06)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primario)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.10)] focus-visible:border-[var(--color-primario)] focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]/20"
                aria-label="Perfil del usuario"
              >
                AF
              </button>

              <div className="pointer-events-none absolute right-0 top-14 z-10 w-64 translate-y-1 rounded-2xl border border-[var(--color-borde)] bg-white/95 p-4 opacity-0 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef4f8_100%)] text-sm font-semibold text-[var(--color-texto)]">
                    AF
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-texto)]">
                      Alonso Flores
                    </p>
                    <p className="text-xs text-[var(--color-texto-sec)]">
                      Personal autorizado
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[var(--color-borde)] pt-3">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[var(--color-texto-sec)]">DNI</span>
                    <span className="font-medium text-[var(--color-texto)]">
                      87654389
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[var(--color-texto-sec)]">Curso</span>
                    <span className="font-medium text-[var(--color-texto)]">
                      DIE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {mensajeError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-alerta)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-alerta)]">
                {mensajeError}
              </p>
            </div>
          )}

          <Input
            label="Usuario"
            placeholder="Tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            disabled={isLoading}
          />

          <div className="relative">
            <Input
              label="Contraseña"
              type={mostrarPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-[38px] text-[var(--color-texto-sec)] hover:text-[var(--color-texto)] transition-colors duration-300 p-1"
              tabIndex={-1}
            >
              {mostrarPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            <LogIn className="w-5 h-5" /> Ingresar
          </Button>

          <p className="text-center text-xs text-[var(--color-texto-sec)]">
            Acceso exclusivo para personal autorizado de BoticaVR.
          </p>

          {DEMO_MODE && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-borde)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-[var(--color-texto-sec)]">
                    o
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={demoLogin}
                className="w-full rounded-xl border border-dashed border-slate-300 px-6 py-3 text-sm font-medium text-slate-600 hover:border-[var(--color-primario)] hover:text-[var(--color-primario)] hover:bg-slate-50 transition-colors duration-300"
              >
                Entrar en modo demo
              </button>

              <p className="text-center text-xs text-[var(--color-texto-sec)]">
                Modo desarrollo activo. El backend no está conectado.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
