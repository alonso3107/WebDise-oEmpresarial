// ============================================================
// BoticaVR — Layout
// Estructura base: Sidebar izquierdo + Topbar + Contenido.
// Todas las páginas protegidas se renderizan dentro de este layout.
// ============================================================

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * Layout principal de la aplicación.
 * 
 * - Sidebar fijo a la izquierda (w-64)
 * - Topbar fijo arriba (h-16), a la derecha del sidebar
 * - Contenido con scroll independiente
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-fondo)]">
      <Sidebar />
      <Topbar />

      {/* ── Área de contenido ── */}
      <main className="ml-64 mt-16 p-6 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
