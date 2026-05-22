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
   * Exporta los productos a CSV.
   * @param {Array} productos
   */
  exportarCSV(productos) {
    const cabeceras = ['Nombre', 'Categoría', 'Stock', 'Precio Compra', 'Precio Venta', 'Vencimiento'];
    const filas = productos.map((p) => [
      p.nombre,
      p.categoria,
      p.stock,
      p.precio_compra,
      p.precio_venta,
      p.fecha_vencimiento || '',
    ]);

    const csv = [cabeceras, ...filas]
      .map((fila) => fila.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario-boticavr-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};

export default inventarioService;
