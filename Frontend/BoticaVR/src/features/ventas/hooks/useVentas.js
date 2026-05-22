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

  /** Carga productos del backend */
  const cargarProductos = useCallback(async () => {
    setIsLoadingProductos(true);
    try {
      const data = await ventasService.buscarProductos();
      setProductos(data);
    } catch (err) {
      console.error('[useVentas] Error al cargar productos:', err);
    } finally {
      setIsLoadingProductos(false);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  /** Carga el historial */
  const cargarHistorial = useCallback(() => {
    const data = ventasService.obtenerHistorial();
    setHistorial(data);
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

  /** Registra la venta */
  const registrarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return false;
    }

    setIsRegistrando(true);
    try {
      await ventasService.registrarVenta({
        items: carrito,
        metodo_pago: metodoPago,
        cliente: cliente.trim() || null,
      });

      toast.success(`Venta registrada — Total: S/ ${totales.total.toFixed(2)}`);
      setCarrito([]);
      setCliente('');
      cargarHistorial();
      return true;
    } catch (err) {
      toast.error('Error al registrar la venta');
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
    // Checkout
    metodoPago, setMetodoPago,
    cliente, setCliente,
    registrarVenta,
    isRegistrando,
    // Historial
    historial: historialFiltrado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    recargarProductos: cargarProductos,
  };
}
