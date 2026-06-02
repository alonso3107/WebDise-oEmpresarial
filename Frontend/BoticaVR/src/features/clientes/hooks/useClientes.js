// ============================================================
// BoticaVR — Hook useClientes
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import clientesService from '../services/clientesService';
import toast from 'react-hot-toast';

const DNI_REGEX = /^\d{8}$/;
const TELEFONO_REGEX = /^9\d{8}$/;
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/;

const limpiarNombre = (valor = '') => valor.replace(/\s+/g, ' ').trim();
const limpiarDigitos = (valor = '', maxLength) => String(valor).replace(/\D/g, '').slice(0, maxLength);

function validarCliente(datos) {
  const nombre = limpiarNombre(datos?.nombre);
  const dni = limpiarDigitos(datos?.dni, 8);
  const telefono = limpiarDigitos(datos?.telefono, 9);

  if (!nombre) return 'El nombre es obligatorio';
  if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (!NOMBRE_REGEX.test(nombre)) return 'El nombre contiene caracteres no válidos';
  if (!DNI_REGEX.test(dni)) return 'El DNI debe tener exactamente 8 dígitos y no puede ser negativo';
  if (telefono && !TELEFONO_REGEX.test(telefono)) return 'El teléfono debe tener 9 dígitos y empezar con 9';

  return {
    nombre,
    dni,
    telefono,
  };
}

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      const data = await clientesService.listar();
      setClientes(data);
    } catch (err) {
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
    const validado = validarCliente(datos);
    if (typeof validado === 'string') {
      toast.error(validado);
      return;
    }

    setIsSaving(true);
    try {
      if (clienteEdicion) {
        await clientesService.actualizar(clienteEdicion.id, validado);
        toast.success('Cliente actualizado');
      } else {
        await clientesService.crear(validado);
        toast.success('Cliente registrado');
      }
      cerrarModal();
      await cargar();
    } catch (err) {
      toast.error('Error al guardar');
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
    } catch (err) {
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
    busqueda, setBusqueda,
    modalAbierto, abrirCrear, abrirEditar, cerrarModal,
    clienteEdicion, guardar, eliminar, isSaving,
    clienteHistorial, compras, verHistorial, cerrarHistorial,
    recargar: cargar,
  };
}
