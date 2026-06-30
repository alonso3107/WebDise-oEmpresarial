// ============================================================
// BoticaVR — Hook useReportes
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import reportesService from '../services/reportesService';

export function useReportes() {
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [ingresosCat, setIngresosCat] = useState([]);
  const [resumen, setResumen] = useState({
    ingresos_totales: 0,
    ventas_totales: 0,
    ticket_promedio: 0,
    producto_top: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [v, p, i, r] = await Promise.all([
        reportesService.obtenerVentasMensuales(),
        reportesService.obtenerProductosMasVendidos(),
        reportesService.obtenerIngresosPorCategoria(),
        reportesService.obtenerResumen()
      ]);
      setVentasMensuales(v);
      setProductosTop(p);
      setIngresosCat(i);
      setResumen(r);
    } catch (err) {
      console.error('[useReportes] Error:', err);
      setError('No se pudieron cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const exportarCSV = (tipo) => {
    let datos, nombre;

    switch (tipo) {
      case 'ventas':
        datos = ventasMensuales;
        nombre = 'reporte-ventas';
        break;
      case 'productos':
        datos = productosTop;
        nombre = 'reporte-productos';
        break;
      case 'categorias':
        datos = ingresosCat;
        nombre = 'reporte-categorias';
        break;
      default:
        return;
    }

    reportesService.exportarCSV(datos, nombre);
  };

  return {
    ventasMensuales,
    productosTop,
    ingresosCat,
    resumen,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    exportarCSV,
    isLoading,
    error,
    refrescar: cargarDatos
  };
}
