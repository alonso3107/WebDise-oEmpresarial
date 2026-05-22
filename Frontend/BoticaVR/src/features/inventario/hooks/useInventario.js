// ============================================================
// BoticaVR — Hook useInventario
// Estado del módulo: lista, filtros, modales, CRUD.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import inventarioService from '../services/inventarioService';
import toast from 'react-hot-toast';

/**
 * Hook principal del módulo de inventario.
 */
export function useInventario() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroStock, setFiltroStock] = useState('todos'); // todos | bajo | critico
  const [filtroVencimiento, setFiltroVencimiento] = useState(false); // solo próximos a vencer
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal de creación/edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEdicion, setProductoEdicion] = useState(null); // null = crear, objeto = editar
  const [isSaving, setIsSaving] = useState(false);

  /** Carga productos desde el backend */
  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventarioService.listar();
      setProductos(data);
    } catch (err) {
      setError('No se pudo cargar el inventario');
      console.error('[useInventario]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  /** Abre modal para crear */
  const abrirCrear = () => {
    setProductoEdicion(null);
    setModalAbierto(true);
  };

  /** Abre modal para editar */
  const abrirEditar = (producto) => {
    setProductoEdicion(producto);
    setModalAbierto(true);
  };

  /** Cierra modal */
  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEdicion(null);
  };

  /** Guarda (crear o actualizar) */
  const guardar = async (datos) => {
    setIsSaving(true);
    try {
      if (productoEdicion) {
        await inventarioService.actualizar(productoEdicion.id, datos);
        toast.success('Producto actualizado');
      } else {
        await inventarioService.crear(datos);
        toast.success('Producto creado');
      }
      cerrarModal();
      await cargar();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al guardar el producto';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  /** Elimina un producto */
  const eliminar = async (producto) => {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await inventarioService.eliminar(producto.id);
      toast.success('Producto eliminado');
      await cargar();
    } catch (err) {
      toast.error('Error al eliminar el producto');
    }
  };

  /** Exporta a CSV */
  const exportarCSV = () => {
    inventarioService.exportarCSV(productosFiltrados);
    toast.success('CSV descargado');
  };

  /** Productos filtrados según criterios activos */
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // Filtro por stock
    if (filtroStock === 'bajo') {
      resultado = resultado.filter((p) => p.stock <= 5 && p.stock > 0);
    } else if (filtroStock === 'critico') {
      resultado = resultado.filter((p) => p.stock <= 2);
    }

    // Filtro por vencimiento próximo
    if (filtroVencimiento) {
      resultado = resultado.filter((p) => inventarioService.estaPorVencer(p.fecha_vencimiento));
    }

    // Filtro por categoría
    if (filtroCategoria) {
      resultado = resultado.filter((p) =>
        p.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase())
      );
    }

    // Búsqueda textual
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q)
      );
    }

    return resultado;
  }, [productos, filtroStock, filtroVencimiento, filtroCategoria, busqueda]);

  /** Categorías únicas para el filtro */
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return [...cats].sort();
  }, [productos]);

  return {
    // Datos
    productos: productosFiltrados,
    totalProductos: productos.length,
    isLoading,
    error,
    // Filtros
    filtroStock, setFiltroStock,
    filtroVencimiento, setFiltroVencimiento,
    filtroCategoria, setFiltroCategoria,
    busqueda, setBusqueda,
    categorias,
    // Modal
    modalAbierto, abrirCrear, abrirEditar, cerrarModal,
    productoEdicion,
    // CRUD
    guardar, eliminar, isSaving,
    // Utilidades
    recargar: cargar,
    exportarCSV,
  };
}
