// ============================================================
// BoticaVR — Reportes Service
// Consultas y adaptación de reportes persistidos en el backend.
// ============================================================

import apiClient from '../../../api/axiosConfig';
import * as XLSX from 'xlsx';

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

  /** Exporta los datos a Excel (.xlsx) con anchos de columna autoajustados y cabeceras amigables */
  exportarExcel(datos, nombreArchivo) {
    if (!datos?.length) return;

    // Diccionario de traducción de claves técnicas a cabeceras en español con formato limpio
    const traducciones = {
      // Reporte de Ventas
      mes: 'Fecha / Período',
      ingresos: 'Ingresos (S/)',
      // Reporte de Productos
      nombre: 'Nombre del Producto',
      cantidad: 'Cantidad Vendida',
      // Reporte de Categorías
      categoria: 'Categoría',
      porcentaje: 'Porcentaje (%)',
    };

    // Formatear los datos mapeando claves amigables
    const datosMapeados = datos.map((fila) => {
      const filaFormateada = {};
      Object.keys(fila).forEach((key) => {
        const cabeceraAmigable = traducciones[key] || key;
        filaFormateada[cabeceraAmigable] = fila[key];
      });
      return filaFormateada;
    });

    // Crear libro y hoja
    const worksheet = XLSX.utils.json_to_sheet(datosMapeados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    // Calcular y asignar anchos de columnas de forma inteligente
    const maxAnchos = Object.keys(datosMapeados[0]).map((key) => {
      const maxLen = datosMapeados.reduce((max, fila) => {
        const valLen = String(fila[key] ?? '').length;
        return valLen > max ? valLen : max;
      }, key.length);
      return { wch: Math.max(maxLen + 4, 15) };
    });
    worksheet['!cols'] = maxAnchos;

    // Descargar archivo Excel
    XLSX.writeFile(workbook, `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  /** Exporta a PDF (simplificado: abre ventana de impresión) */
  exportarPDF() {
    window.print();
  },
};

export default reportesService;
