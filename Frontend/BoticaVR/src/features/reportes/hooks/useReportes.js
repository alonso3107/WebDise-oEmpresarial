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
  const [resumen, setResumen] = useState({ ingresos_totales: 0, ventas_totales: 0, ticket_promedio: 0, producto_top: 'Sin ventas' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ventas, productos, categorias, resumenData] = await Promise.all([
        reportesService.obtenerVentas(filtroDesde, filtroHasta),
        reportesService.obtenerProductosMasVendidos(filtroDesde, filtroHasta),
        reportesService.obtenerIngresosPorCategoria(filtroDesde, filtroHasta),
        reportesService.obtenerResumen(filtroDesde, filtroHasta),
      ]);
      setVentasMensuales(ventas);
      setProductosTop(productos);
      setIngresosCat(categorias);
      setResumen(resumenData);
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  }, [filtroDesde, filtroHasta]);

  useEffect(() => { cargar(); }, [cargar]);

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
    isLoading, error, recargar: cargar,
    exportarCSV,
  };
}
