// ============================================================
// BoticaVR — Inventario Service
// Lógica de negocio para el módulo de inventario.
// ============================================================

import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../../../api/inventarioApi';

import * as XLSX from 'xlsx';

/**
 * Servicio de inventario.
 * Encapsula CRUD y operaciones sobre productos.
 */
const inventarioService = {
  /**
   * Obtiene todos los productos.
   * @returns {Promise<Array>}
   */
  async listar() {
    const productos = await obtenerProductos();
    return Array.isArray(productos) ? productos : [];
  },

  /**
   * Crea un nuevo producto.
   * @param {object} datos — Campos del producto
   * @returns {Promise<object>}
   */
  async crear(datos) {
    return await crearProducto(datos);
  },

  /**
   * Actualiza un producto existente.
   * @param {number} id
   * @param {object} datos
   * @returns {Promise<object>}
   */
  async actualizar(id, datos) {
    return await actualizarProducto(id, datos);
  },

  /**
   * Elimina un producto.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    return await eliminarProducto(id);
  },

  /**
   * Determina la categoría de stock para el badge.
   * @param {number} stock
   * @returns {{ label: string, color: string }}
   */
  estadoStock(stock) {
    if (stock <= 2) return { label: 'Crítico', color: 'bg-red-100 text-[var(--color-alerta)] border-red-200' };
    if (stock <= 5) return { label: 'Bajo', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Normal', color: 'bg-green-100 text-[var(--color-exito)] border-green-200' };
  },

  /**
   * Verifica si un producto está próximo a vencer (30 días).
   * @param {string} fecha — fecha_vencimiento en formato ISO
   * @returns {boolean}
   */
  estaPorVencer(fecha) {
    if (!fecha) return false;
    const vencimiento = new Date(fecha);
    const hoy = new Date();
    const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes >= 0;
  },

  /**
   * Exporta los productos a Excel (.xlsx) con autoajuste de columnas y cabeceras pulidas.
   * @param {Array} productos
   */
  exportarExcel(productos) {
    if (!productos?.length) return;

    // Mapear datos con nombres de cabeceras profesionales y legibles
    const datosMapeados = productos.map((p) => ({
      'ID': p.id,
      'Nombre de Producto': p.nombre,
      'Categoría': p.categoria,
      'Stock Actual': p.stock,
      'Precio Venta (S/)': p.precio_venta,
      'Fecha de Vencimiento': p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString('es-PE') : '—'
    }));

    // Crear la hoja de trabajo y el libro de cálculo
    const worksheet = XLSX.utils.json_to_sheet(datosMapeados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // Calcular y asignar anchos de columnas automáticamente
    const maxAnchos = Object.keys(datosMapeados[0]).map((key) => {
      // Tomar la longitud de la cabecera o de los datos de la columna
      const maxLen = datosMapeados.reduce((max, fila) => {
        const valLen = String(fila[key] ?? '').length;
        return valLen > max ? valLen : max;
      }, key.length);
      return { wch: Math.max(maxLen + 4, 10) };
    });
    worksheet['!cols'] = maxAnchos;

    // Generar archivo de descarga
    XLSX.writeFile(workbook, `inventario-boticavr-${new Date().toISOString().slice(0, 10)}.xlsx`);
  },
};

export default inventarioService;
