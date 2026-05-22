// ============================================================
// BoticaVR — Hook useReportes
// ============================================================

import { useState, useMemo } from 'react';
import reportesService from '../services/reportesService';

export function useReportes() {
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  const ventasMensuales = useMemo(() => reportesService.obtenerVentasMensuales(), []);
  const productosTop = useMemo(() => reportesService.obtenerProductosMasVendidos(), []);
  const ingresosCat = useMemo(() => reportesService.obtenerIngresosPorCategoria(), []);
  const resumen = useMemo(() => reportesService.obtenerResumen(), []);

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
  };
}
