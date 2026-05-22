// ============================================================
// BoticaVR — Hook useDashboard
// Estado y lógica del panel de control.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

/**
 * Hook para el dashboard.
 * Carga datos al montar y expone estado + acción de refrescar.
 * 
 * @returns {object} datos, isLoading, error, refrescar
 */
export function useDashboard() {
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carga los datos del dashboard desde el backend + mocks.
   */
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resultado = await dashboardService.obtenerDatosDashboard();
      setDatos(resultado);
    } catch (err) {
      setError('No se pudieron cargar los datos del panel');
      console.error('[useDashboard]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    datos,
    isLoading,
    error,
    refrescar: cargarDatos,
  };
}
