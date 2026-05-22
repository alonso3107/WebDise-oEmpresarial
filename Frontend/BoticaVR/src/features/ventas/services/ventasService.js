// ============================================================
// BoticaVR — Ventas Service
// Lógica de negocio: carrito, IGV, cálculo de totales.
// ⚠️ El registro de venta es MOCK hasta que el backend lo implemente.
// ============================================================

import { obtenerProductos } from '../../../api/inventarioApi';
import { ventasEjemplo } from '../../../api/mocks/ventasMock';
import toast from 'react-hot-toast';

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

  /**
   * Calcula los totales del carrito.
   * @param {Array} items — Productos en el carrito con cantidad
   * @returns {{ subtotal: number, igv: number, total: number }}
   */
  calcularTotales(items) {
    const subtotal = items.reduce((sum, item) => sum + item.precio_venta * item.cantidad, 0);
    const igv = subtotal * IGV;
    const total = subtotal + igv;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      igv: Math.round(igv * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  /**
   * Registra una venta.
   * ⚠️ MOCK — simula registro. Reemplazar con POST /api/v1/ventas/ cuando exista.
   * 
   * @param {object} venta — { items, metodo_pago, cliente }
   * @returns {Promise<object>} Venta registrada (mock)
   */
  async registrarVenta(venta) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { total } = this.calcularTotales(venta.items);

    const nuevaVenta = {
      id: Date.now(),
      fecha: new Date().toISOString().slice(0, 10),
      cliente: venta.cliente || 'Cliente general',
      total,
      productos: venta.items.reduce((sum, i) => sum + i.cantidad, 0),
      metodo_pago: venta.metodo_pago,
      items: venta.items,
    };

    // Guardar en localStorage para el historial (temporal)
    const historial = JSON.parse(localStorage.getItem('botica-ventas') || '[]');
    historial.unshift(nuevaVenta);
    localStorage.setItem('botica-ventas', JSON.stringify(historial.slice(0, 50)));

    return nuevaVenta;
  },

  /**
   * Obtiene el historial de ventas (mock + localStorage).
   * @returns {Array}
   */
  obtenerHistorial() {
    const local = JSON.parse(localStorage.getItem('botica-ventas') || '[]');
    // Combinar con ventas de ejemplo
    return [...local, ...ventasEjemplo];
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
