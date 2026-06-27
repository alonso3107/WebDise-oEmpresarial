// ============================================================
// BoticaVR — Reportes Service
// Consultas y adaptación de reportes persistidos en el backend.
// ============================================================

import apiClient from '../../../api/axiosConfig';

const construirParametros = (desde, hasta) => ({
  ...(desde ? { desde } : {}),
  ...(hasta ? { hasta } : {}),
});

const reportesService = {
  async obtenerVentas(desde, hasta) {
    const { data } = await apiClient.get('/reportes/ventas-diarias', {
      params: { dias: 30, ...construirParametros(desde, hasta) },
    });
    return data.reverse().map((item) => ({ mes: item.fecha, ingresos: item.total_ventas }));
  },

  async obtenerProductosMasVendidos(desde, hasta) {
    const { data } = await apiClient.get('/reportes/productos-mas-vendidos', {
      params: construirParametros(desde, hasta),
    });
    return data.map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad_vendida,
      ingresos: item.total_recaudado,
    }));
  },

  async obtenerIngresosPorCategoria(desde, hasta) {
    const { data } = await apiClient.get('/reportes/ingresos-por-categoria', {
      params: construirParametros(desde, hasta),
    });
    return data;
  },

  async obtenerResumen(desde, hasta) {
    const { data } = await apiClient.get('/reportes/resumen', {
      params: construirParametros(desde, hasta),
    });
    return data;
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
  exportarPDF() {
    window.print();
  },
};

export default reportesService;
