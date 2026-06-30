// ============================================================
// BoticaVR — Dashboard Service
// Agrega datos del backend para el panel de control.
// ============================================================

import apiClient from '../../../api/axiosConfig';

/**
 * Servicio del dashboard.
 * Consume los endpoints de reportes y ventas del backend.
 */
const dashboardService = {
  /**
   * Obtiene todos los datos necesarios para el dashboard.
   * 
   * @returns {Promise<object>} Datos agregados del dashboard
   */
  async obtenerDatosDashboard() {
    try {
      // 1. Obtener KPIs del dashboard
      const responseDashboard = await apiClient.get('/reportes/dashboard');
      const dataDashboard = responseDashboard.data;

      // 2. Obtener ventas de la semana para la gráfica
      const responseVentasSemanales = await apiClient.get('/reportes/ventas-diarias?dias=7');
      const ventasSemanales = responseVentasSemanales.data.map(v => {
        // Extraer solo el nombre del día para la gráfica (ej: 'Lunes')
        const date = new Date(v.fecha + 'T00:00:00');
        const nombreDia = date.toLocaleDateString('es-PE', { weekday: 'short' });
        return {
          dia: nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1),
          ventas: v.total_ventas
        };
      }).reverse(); // Revertir para mostrar de más antiguo a más reciente

      // 3. Obtener últimas ventas
      const responseVentas = await apiClient.get('/ventas/?limit=5');
      const ultimasVentas = responseVentas.data.map(v => ({
        id: v.id,
        cliente: v.cliente ? v.cliente.nombre : 'Cliente Genérico',
        productos: v.detalles.reduce((acc, det) => acc + det.cantidad, 0),
        metodo_pago: v.metodo_pago,
        total: v.monto_total
      }));

      // 4. Transformar los productos críticos que vienen del endpoint top-productos
      // El dashboard KPI no devuelve el objeto de stock critico, devuelve alertas_stock_pendientes
      // Pero el frontend necesita la lista de criticos. Usaremos los productos mas vendidos por ahora
      // o mapearemos si Samuel no incluyó el endpoint de críticos puros.
      // Ya que Samuel no creó endpoint de críticos, pedimos el inventario y filtramos:
      const responseInventario = await apiClient.get('/inventario/productos/');
      const productos = responseInventario.data;
      
      const criticos = productos.filter(p => p.stock === 0);
      const stockBajo = productos.filter(p => p.stock <= p.stock_minimo);

      return {
        resumen: {
          ventas_dia: 0, // No provee cantidad de ventas el endpoint actual
          ingresos_dia: dataDashboard.ventas_hoy,
          clientes_atendidos: 0, // Falta backend
          stock_bajo: dataDashboard.alertas_stock_pendientes,
        },
        ventasSemanales,
        ultimasVentas,
        stockBajo,
        criticos,
      };
    } catch (error) {
      console.error('[DashboardService] Error al obtener datos:', error);
      throw error;
    }
  },
};

export default dashboardService;
