// ============================================================
// BoticaVR — Reportes Service
// ⚠️ MOCK — usa datos simulados.
// ============================================================

import {
  ventasMensuales,
  productosMasVendidos,
  ingresosPorCategoria,
  resumenPeriodo,
} from '../../../api/mocks/reportesMock';

const reportesService = {
  obtenerVentasMensuales() {
    return ventasMensuales;
  },

  obtenerProductosMasVendidos() {
    return productosMasVendidos;
  },

  obtenerIngresosPorCategoria() {
    return ingresosPorCategoria;
  },

  obtenerResumen() {
    return resumenPeriodo;
  },

  /** Exporta los datos a CSV */
  exportarCSV(datos, nombreArchivo) {
    if (!datos?.length) return;

    const cabeceras = Object.keys(datos[0]);
    const filas = datos.map((d) => cabeceras.map((k) => d[k]));

    const csv = [cabeceras, ...filas]
      .map((fila) => fila.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  /** Exporta a PDF (simplificado: abre ventana de impresión) */
  exportarPDF(elementoId) {
    window.print();
  },
};

export default reportesService;
