// ============================================================
// BoticaVR — Ventas Service
// Lógica de negocio y adaptación de contratos para el POS.
// ============================================================

import { obtenerProductos } from '../../../api/inventarioApi';
import apiClient from '../../../api/axiosConfig';

const IGV = 0.18; // 18% IGV en Perú

/**
 * Servicio del módulo de ventas.
 */
const ventasService = {
  /**
   * Busca productos en el inventario (backend real).
   * @returns {Promise<Array>}
   */
  async buscarProductos() {
    const productos = await obtenerProductos();
    return Array.isArray(productos) ? productos : [];
  },

  async buscarClientes() {
    const { data } = await apiClient.get('/clientes/');
    return data.map((cliente) => ({
      id: cliente.id,
      nombre: `${cliente.nombres} ${cliente.apellidos}`.trim(),
      dni: cliente.dni,
    }));
  },

  /**
   * Calcula los totales del carrito.
   * @param {Array} items — Productos en el carrito con cantidad
   * @returns {{ subtotal: number, igv: number, total: number }}
   */
  calcularTotales(items) {
    const total = items.reduce((sum, item) => sum + item.precio_venta * item.cantidad, 0);
    const subtotal = total / (1 + IGV);
    const igv = total - subtotal;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      igv: Math.round(igv * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  /**
   * Registra una venta.
   * @param {object} venta — { items, metodo_pago, cliente_id }
   * @returns {Promise<object>} Venta registrada
   */
  async registrarVenta(venta) {
    const { data } = await apiClient.post('/ventas/', {
      cliente_id: venta.cliente_id || null,
      tipo_comprobante: 'boleta',
      metodo_pago: venta.metodo_pago,
      items: venta.items.map((item) => ({ producto_id: item.id, cantidad: item.cantidad })),
    });
    return data;
  },

  /**
   * Obtiene el historial persistido en el backend.
   * @returns {Promise<Array>}
   */
  async obtenerHistorial() {
    const { data } = await apiClient.get('/ventas/', { params: { limit: 100 } });
    return data.map((venta) => ({
      id: venta.id,
      fecha: venta.fecha_hora,
      cliente: venta.cliente_nombre || 'Cliente general',
      total: venta.monto_total,
      productos: venta.cantidad_productos,
      metodo_pago: venta.metodo_pago,
      estado: venta.estado,
    }));
  },

  /**
   * Filtra el historial por rango de fechas.
   * @param {Array} ventas
   * @param {string} desde — fecha ISO
   * @param {string} hasta — fecha ISO
   * @returns {Array}
   */
  filtrarPorFecha(ventas, desde, hasta) {
    return ventas.filter((v) => {
      if (desde && v.fecha < desde) return false;
      if (hasta && v.fecha > hasta) return false;
      return true;
    });
  },
};

export default ventasService;
