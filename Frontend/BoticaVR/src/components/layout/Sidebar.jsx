// ============================================================
// BoticaVR — Sidebar
// Barra lateral de navegación con íconos Lucide.
// Fondo primario (#5C6D7C), texto claro (#F2E0D0).
// ============================================================

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Pill,
} from 'lucide-react';

/**
 * Enlaces de navegación del sidebar.
 * Cada objeto define la ruta, ícono y etiqueta en español.
 */
const enlaces = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ventas',     icon: ShoppingCart,    label: 'Ventas' },
  { to: '/inventario', icon: Package,          label: 'Inventario' },
  { to: '/clientes',   icon: Users,            label: 'Clientes' },
  { to: '/reportes',   icon: BarChart3,        label: 'Reportes' },
];

/**
 * Sidebar de navegación principal.
 * 
 * - Fondo: var(--color-primario) = #5C6D7C
 * - Enlace activo: fondo más claro + indicador lateral
 * - Hover: fondo var(--color-primario-hover)
 */
export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--color-primario)] flex flex-col z-30">
      {/* ── Logo / Marca ── */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15">
          <Pill className="w-6 h-6 text-[var(--color-fondo)]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[var(--color-fondo)] leading-tight">
            BoticaVR
          </h1>
          <p className="text-xs text-[var(--color-fondo)]/60 font-light italic">
            Gestión farmacéutica
          </p>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {enlaces.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-300
                ${isActive
                  ? 'bg-white/20 text-[var(--color-fondo)] shadow-sm'
                  : 'text-[var(--color-fondo)]/70 hover:bg-[var(--color-primario-hover)] hover:text-[var(--color-fondo)]'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-[var(--color-fondo)]/50 font-light italic text-center">
          v1.0 — Uso local
        </p>
      </div>
    </aside>
  );
}
