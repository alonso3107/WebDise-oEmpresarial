// ============================================================
// BoticaVR — Hook useClientes
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import clientesService from '../services/clientesService';
import toast from 'react-hot-toast';

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEdicion, setClienteEdicion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Historial
  const [clienteHistorial, setClienteHistorial] = useState(null);
  const [compras, setCompras] = useState([]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientesService.listar();
      setClientes(data);
    } catch (err) {
      setError('No se pudieron cargar los clientes');
      console.error('[useClientes]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const clientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return clientes;
    const q = busqueda.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(q) ||
        c.dni?.includes(q) ||
        c.telefono?.includes(q)
    );
  }, [clientes, busqueda]);

  const abrirCrear = () => { setClienteEdicion(null); setModalAbierto(true); };
  const abrirEditar = (c) => { setClienteEdicion(c); setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setClienteEdicion(null); };

  const guardar = async (datos) => {
    setIsSaving(true);
    try {
      if (clienteEdicion) {
        await clientesService.actualizar(clienteEdicion.id, datos);
        toast.success('Cliente actualizado');
      } else {
        await clientesService.crear(datos);
        toast.success('Cliente registrado');
      }
      cerrarModal();
      await cargar();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar el cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const eliminar = async (cliente) => {
    if (!confirm(`¿Eliminar a "${cliente.nombre}"?`)) return;
    try {
      await clientesService.eliminar(cliente.id);
      toast.success('Cliente eliminado');
      await cargar();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const verHistorial = async (cliente) => {
    setClienteHistorial(cliente);
    const data = await clientesService.obtenerCompras(cliente.id);
    setCompras(data);
  };

  const cerrarHistorial = () => { setClienteHistorial(null); setCompras([]); };

  return {
    clientes: clientesFiltrados,
    totalClientes: clientes.length,
    isLoading,
    error,
    busqueda, setBusqueda,
    modalAbierto, abrirCrear, abrirEditar, cerrarModal,
    clienteEdicion, guardar, eliminar, isSaving,
    clienteHistorial, compras, verHistorial, cerrarHistorial,
    recargar: cargar,
  };
}
