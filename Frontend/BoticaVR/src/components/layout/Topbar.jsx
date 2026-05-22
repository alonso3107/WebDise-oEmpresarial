// ============================================================
// BoticaVR — Topbar
// Barra superior: breadcrumb + info del usuario + logout.
// ============================================================

import { useLocation } from 'react-router-dom';
import { LogOut, User, ChevronRight } from 'lucide-react';
import useAuthStore from '../../context/authStore';

/**
 * Mapeo de rutas a etiquetas en español para el breadcrumb.
 */
const breadcrumbLabels = {
  'dashboard':  'Dashboard',
  'ventas':     'Ventas',
  'inventario': 'Inventario',
  'clientes':   'Clientes',
  'reportes':   'Reportes',
};

/**
 * Barra superior fija.
 * Muestra breadcrumb, nombre del usuario y botón de logout.
 */
export default function Topbar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  // Construir breadcrumb desde la ruta actual
  const segmentos = location.pathname.split('/').filter(Boolean);
  const breadcrumb = segmentos.map((seg) => breadcrumbLabels[seg] || seg);

  return (
    <header className="fixed left-64 right-0 top-0 h-16 bg-[var(--color-card)] border-b border-[var(--color-borde)] flex items-center justify-between px-6 z-20 shadow-sm">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--color-texto-sec)] font-light italic">
          BoticaVR
        </span>
        {breadcrumb.map((label, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-[var(--color-texto-sec)]/50" />
            <span className={
              i === breadcrumb.length - 1
                ? 'text-[var(--color-texto)] font-medium'
                : 'text-[var(--color-texto-sec)]'
            }>
              {label}
            </span>
          </span>
        ))}
      </div>

      {/* ── Usuario + Logout ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-texto-sec)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primario)] flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--color-fondo)]" />
          </div>
          <span className="hidden sm:inline font-medium text-[var(--color-texto)]">
            Trabajador
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-texto-sec)] hover:bg-red-50 hover:text-[var(--color-alerta)] transition-all duration-300"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
