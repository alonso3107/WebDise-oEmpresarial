// ============================================================
// BoticaVR — Router
// React Router DOM v6 — Rutas protegidas con PrivateRoute.
// ============================================================

import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout
import Layout from '../components/layout/Layout';
import PrivateRoute from '../components/layout/PrivateRoute';

// Páginas
import LoginForm from '../features/auth/components/LoginForm';
import DashboardPage from '../features/dashboard/components/DashboardPage';
import VentasPage from '../features/ventas/components/VentasPage';
import InventarioPage from '../features/inventario/components/InventarioPage';
import ClientesPage from '../features/clientes/components/ClientesPage';
import ReportesPage from '../features/reportes/components/ReportesPage';

/**
 * Configuración de rutas de la aplicación.
 * 
 * Estructura:
 *   /login      → público (LoginForm)
 *   /*          → protegido (PrivateRoute → Layout → página)
 *   /           → redirige a /dashboard
 */
const router = createBrowserRouter([
  // ── Ruta pública: Login ──
  {
    path: '/login',
    element: <LoginForm />,
  },

  // ── Rutas protegidas ──
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Redirección raíz
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          // Páginas internas
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/ventas',
            element: <VentasPage />,
          },
          {
            path: '/inventario',
            element: <InventarioPage />,
          },
          {
            path: '/clientes',
            element: <ClientesPage />,
          },
          {
            path: '/reportes',
            element: <ReportesPage />,
          },
        ],
      },
    ],
  },

  // ── Catch-all: redirigir rutas desconocidas al dashboard ──
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
