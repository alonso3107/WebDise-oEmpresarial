// ============================================================
// BoticaVR — Dashboard Service
// Agrega datos reales del backend para el panel de control.
// ============================================================

import { obtenerProductos } from '../../../api/inventarioApi';
import apiClient from '../../../api/axiosConfig';

/**
 * Servicio del dashboard.
   * Combina en paralelo los endpoints necesarios y adapta su respuesta a la vista.
 */
const dashboardService = {
  /**
   * Obtiene todos los datos necesarios para el dashboard.
   * 
   * @returns {Promise<object>} Datos agregados del dashboard
   */
  async obtenerDatosDashboard() {
    const fechaLocal = new Date();
    const hoy = [
      fechaLocal.getFullYear(),
      String(fechaLocal.getMonth() + 1).padStart(2, '0'),
      String(fechaLocal.getDate()).padStart(2, '0'),
    ].join('-');
    const [productos, kpisResponse, ventasResponse, ventasHoyResponse, ventasDiariasResponse] = await Promise.all([
      obtenerProductos(),
      apiClient.get('/reportes/dashboard'),
      apiClient.get('/ventas/', { params: { limit: 5 } }),
      apiClient.get('/ventas/', { params: { fecha: hoy, limit: 100 } }),
      apiClient.get('/reportes/ventas-diarias', { params: { dias: 7 } }),
    ]);

    const kpis = kpisResponse.data;
    const ventasHoy = ventasHoyResponse.data.filter((venta) => venta.estado === 'completada');
    const mapearVenta = (venta) => ({
      id: venta.id,
      cliente: venta.cliente_nombre || 'Cliente general',
      productos: venta.cantidad_productos,
      metodo_pago: venta.metodo_pago,
      total: venta.monto_total,
    });

    return {
      resumen: {
        ventas_dia: ventasHoy.length,
        ingresos_dia: kpis.ventas_hoy,
        clientes_atendidos: new Set(ventasHoy.map((venta) => venta.cliente_id).filter(Boolean)).size,
        stock_bajo: kpis.alertas_stock_pendientes,
      },
      ventasSemanales: ventasDiariasResponse.data.reverse().map((item) => ({
        dia: new Date(`${item.fecha}T00:00:00`).toLocaleDateString('es-PE', { weekday: 'short' }),
        ventas: item.total_ventas,
      })),
      ultimasVentas: ventasResponse.data.map(mapearVenta),
      stockBajo: productos.filter((producto) => producto.stock <= producto.stock_minimo),
      criticos: productos.filter((producto) => producto.stock === 0),
      totalProductos: productos.length,
    };
  },
};

export default dashboardService;
