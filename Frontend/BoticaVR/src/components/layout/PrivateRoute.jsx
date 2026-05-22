// ============================================================
// BoticaVR — PrivateRoute
// Protege rutas que requieren autenticación JWT.
// Si no hay token → redirige a /login con toast de aviso.
// ============================================================

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Componente guardián de rutas protegidas.
 * 
 * Envuelve las rutas internas de la app.
 * Si el usuario no está autenticado, redirige a /login.
 */
export default function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para acceder', {
        id: 'auth-required',
        duration: 3000,
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Guardar la ruta que intentó acceder para redirigir tras login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
