// ============================================================
// BoticaVR - Dashboard Service
// Agrega datos reales del backend para una vista simple y legible.
// ============================================================

import { obtenerProductos } from '../../../api/inventarioApi';
import apiClient from '../../../api/axiosConfig';

const crearFechaLocalISO = () => {
  const fechaLocal = new Date();
  return [
    fechaLocal.getFullYear(),
    String(fechaLocal.getMonth() + 1).padStart(2, '0'),
    String(fechaLocal.getDate()).padStart(2, '0'),
  ].join('-');
};

const mapearVenta = (venta) => ({
  id: venta.id,
  cliente: venta.cliente_nombre || 'Cliente general',
  productos: venta.cantidad_productos,
  metodo_pago: venta.metodo_pago,
  total: venta.monto_total,
  fecha: venta.fecha_hora,
});

const ordenarPorUrgenciaStock = (productos) =>
  [...productos].sort((a, b) => {
    if (a.stock !== b.stock) return a.stock - b.stock;
    return a.nombre.localeCompare(b.nombre, 'es');
  });

const dashboardService = {
  async obtenerDatosDashboard() {
    const hoy = crearFechaLocalISO();
    const [productos, kpisResponse, ventasResponse, ventasHoyResponse, ventasDiariasResponse] = await Promise.all([
      obtenerProductos(),
      apiClient.get('/reportes/dashboard'),
      apiClient.get('/ventas/', { params: { limit: 5, estado: 'completada' } }),
      apiClient.get('/ventas/', { params: { fecha: hoy, limit: 100, estado: 'completada' } }),
      apiClient.get('/reportes/ventas-diarias', { params: { dias: 7 } }),
    ]);

    const kpis = kpisResponse.data;
    const ventasHoy = ventasHoyResponse.data;
    const ingresosDia = Number(kpis.ventas_hoy || 0);
    const ventasDia = ventasHoy.length;
    const stockBajo = ordenarPorUrgenciaStock(
      productos.filter((producto) => producto.stock <= producto.stock_minimo),
    );

    return {
      resumen: {
        ventas_dia: ventasDia,
        ingresos_dia: ingresosDia,
        ticket_promedio: ventasDia ? ingresosDia / ventasDia : 0,
        clientes_atendidos: new Set(ventasHoy.map((venta) => venta.cliente_id).filter(Boolean)).size,
        stock_bajo: kpis.alertas_stock_pendientes,
        vencimientos: kpis.alertas_vencimiento_pendientes,
      },
      ventasSemanales: ventasDiariasResponse.data.reverse().map((item) => ({
        dia: new Date(`${item.fecha}T00:00:00`).toLocaleDateString('es-PE', { weekday: 'short' }),
        fecha: item.fecha,
        ingresos: item.total_ventas,
      })),
      ultimasVentas: ventasResponse.data.map(mapearVenta),
      stockBajo,
      criticos: stockBajo.filter((producto) => producto.stock === 0),
      totalProductos: productos.length,
    };
  },
};

export default dashboardService;
