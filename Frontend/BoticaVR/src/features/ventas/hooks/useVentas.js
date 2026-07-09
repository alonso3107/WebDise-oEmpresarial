// ============================================================
// BoticaVR — Hook useVentas
// Estado: productos disponibles, carrito, checkout, historial.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import ventasService from '../services/ventasService';
import toast from 'react-hot-toast';

/**
 * Hook principal del módulo de ventas.
 */
export function useVentas() {
  // Productos del backend
  const [productos, setProductos] = useState([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(true);
  const [clientes, setClientes] = useState([]);

  // Búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Carrito: { producto, cantidad }
  const [carrito, setCarrito] = useState([]);

  // Checkout
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [cliente, setCliente] = useState('');
  const [isRegistrando, setIsRegistrando] = useState(false);

  // Historial
  const [historial, setHistorial] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [fechaHoy] = useState(() => {
    const fecha = new Date();
    return [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
    ].join('-');
  });

  /** Carga productos del backend */
  const cargarProductos = useCallback(async () => {
    setIsLoadingProductos(true);
    try {
      const [productosData, clientesData] = await Promise.all([
        ventasService.buscarProductos(),
        ventasService.buscarClientes(),
      ]);
      setProductos(productosData);
      setClientes(clientesData);
    } catch (err) {
      console.error('[useVentas] Error al cargar productos:', err);
    } finally {
      setIsLoadingProductos(false);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  /** Carga el historial */
  const cargarHistorial = useCallback(async () => {
    try {
      setHistorial(await ventasService.obtenerHistorial());
    } catch (err) {
      console.error('[useVentas] Error al cargar historial:', err);
      toast.error('No se pudo cargar el historial de ventas');
    }
  }, []);

  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  /** Productos filtrados por búsqueda */
  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const q = busqueda.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  /** Agrega un producto al carrito */
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  /** Cambia la cantidad de un item */
  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      setCarrito((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item))
    );
  };

  /** Elimina un item del carrito */
  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  /** Totales del carrito */
  const totales = useMemo(() => ventasService.calcularTotales(carrito), [carrito]);

  const resumenVentas = useMemo(() => {
    const ventasHoy = historial.filter((venta) => venta.fecha?.slice(0, 10) === fechaHoy);
    const ingresosHoy = ventasHoy.reduce((total, venta) => total + Number(venta.total || 0), 0);
    const productosEnCarrito = carrito.reduce((total, item) => total + Number(item.cantidad || 0), 0);

    return {
      ventasHoy: ventasHoy.length,
      ingresosHoy,
      productosEnCarrito,
      productosDisponibles: productos.filter((producto) => Number(producto.stock || 0) > 0).length,
    };
  }, [carrito, fechaHoy, historial, productos]);

  /** Registra la venta */
  const registrarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return false;
    }

    setIsRegistrando(true);
    try {
      const ventaRegistrada = await ventasService.registrarVenta({
        items: carrito,
        metodo_pago: metodoPago,
        cliente_id: cliente ? Number(cliente) : null,
      });

      toast.success(`Venta registrada — Total: S/ ${ventaRegistrada.monto_total.toFixed(2)}`);
      setCarrito([]);
      setCliente('');
      await Promise.all([cargarHistorial(), cargarProductos()]);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al registrar la venta');
      return false;
    } finally {
      setIsRegistrando(false);
    }
  };

  /** Historial filtrado */
  const historialFiltrado = useMemo(
    () => ventasService.filtrarPorFecha(historial, filtroDesde, filtroHasta),
    [historial, filtroDesde, filtroHasta]
  );

  return {
    // Productos
    productos: productosFiltrados,
    isLoadingProductos,
    busqueda, setBusqueda,
    // Carrito
    carrito,
    agregarAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    totales,
    resumenVentas,
    // Checkout
    metodoPago, setMetodoPago,
    cliente, setCliente,
    clientes,
    registrarVenta,
    isRegistrando,
    // Historial
    historial: historialFiltrado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    recargarProductos: cargarProductos,
  };
}
