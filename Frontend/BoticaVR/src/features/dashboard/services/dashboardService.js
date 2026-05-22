// ============================================================
// BoticaVR — Dashboard Service
// Agrega datos del backend + mocks para el panel de control.
// ============================================================

import { obtenerProductos } from '../../../api/inventarioApi';
import { ventasSemanales, ventasEjemplo, resumenDelDia } from '../../../api/mocks/ventasMock';

/**
 * Servicio del dashboard.
 * Combina datos reales del backend con mocks donde no hay endpoint aún.
 */
const dashboardService = {
  /**
   * Obtiene todos los datos necesarios para el dashboard.
   * 
   * @returns {Promise<object>} Datos agregados del dashboard
   */
  async obtenerDatosDashboard() {
    try {
      // Datos reales: productos del inventario
      const productos = await obtenerProductos();

      // Productos con stock bajo (≤ 5 unidades)
      const stockBajo = Array.isArray(productos)
        ? productos.filter(p => p.stock <= 5)
        : [];

      // Productos críticos (stock = 0)
      const criticos = Array.isArray(productos)
        ? productos.filter(p => p.stock === 0)
        : [];

      // ⚠️ MOCK: ventas y resumen (hasta que backend implemente /api/v1/ventas/)
      return {
        resumen: resumenDelDia,
        ventasSemanales,
        ultimasVentas: ventasEjemplo.slice(0, 5),
        stockBajo,
        criticos,
        totalProductos: Array.isArray(productos) ? productos.length : 0,
      };
    } catch (error) {
      console.error('[DashboardService] Error al obtener datos:', error);

      // Fallback: devolver solo datos mock si el backend no responde
      return {
        resumen: resumenDelDia,
        ventasSemanales,
        ultimasVentas: ventasEjemplo.slice(0, 5),
        stockBajo: [],
        criticos: [],
        totalProductos: 0,
      };
    }
  },
};

export default dashboardService;
