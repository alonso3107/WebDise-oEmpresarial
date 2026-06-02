// ============================================================
// BoticaVR — ClientesPage
// Tabla + CRUD + historial. Componentes UI reutilizables.
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Users, History, X, Save, Phone, ShoppingBag, AlertTriangle, RefreshCw } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { TableSkeleton } from '../../../components/ui/Skeleton';

const DNI_REGEX = /^\d{8}$/;
const TELEFONO_REGEX = /^9\d{8}$/;
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/;

const limpiarNombre = (valor) => valor.replace(/\s+/g, ' ').trim();
const limpiarDigitos = (valor, maxLength) => valor.replace(/\D/g, '').slice(0, maxLength);

function ClienteForm({ cliente, onGuardar, onCancelar, isSaving }) {
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [dni, setDni] = useState(cliente?.dni || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [errores, setErrores] = useState({ nombre: '', dni: '', telefono: '' });

  useEffect(() => {
    setNombre(cliente?.nombre || '');
    setDni(cliente?.dni || '');
    setTelefono(cliente?.telefono || '');
    setErrores({ nombre: '', dni: '', telefono: '' });
  }, [cliente]);

  const validar = () => {
    const nombreLimpio = limpiarNombre(nombre);
    const dniLimpio = limpiarDigitos(dni, 8);
    const telefonoLimpio = limpiarDigitos(telefono, 9);
    const nuevosErrores = { nombre: '', dni: '', telefono: '' };

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombreLimpio.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (!NOMBRE_REGEX.test(nombreLimpio)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras, espacios, puntos o guiones';
    }

    if (!DNI_REGEX.test(dniLimpio)) {
      nuevosErrores.dni = 'El DNI debe tener exactamente 8 dígitos y no puede ser negativo';
    }

    if (telefonoLimpio && !TELEFONO_REGEX.test(telefonoLimpio)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos y empezar con 9';
    }

    setErrores(nuevosErrores);
    return {
      valido: !nuevosErrores.nombre && !nuevosErrores.dni && !nuevosErrores.telefono,
      datos: {
        nombre: nombreLimpio,
        dni: dniLimpio,
        telefono: telefonoLimpio,
      },
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resultado = validar();
    if (!resultado.valido) return;
    onGuardar(resultado.datos);
  };

  return (
    <Modal isOpen={true} onClose={onCancelar} title={cliente ? 'Editar cliente' : 'Nuevo cliente'}
      footer={<>
        <Button variant="secundario" onClick={onCancelar} disabled={isSaving}>Cancelar</Button>
        <Button onClick={handleSubmit} isLoading={isSaving}><Save className="w-4 h-4" /> {cliente ? 'Actualizar' : 'Crear'}</Button>
      </>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo *"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: María López García"
          error={errores.nombre}
          disabled={isSaving}
          autoFocus
          autoComplete="name"
          inputMode="text"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DNI *"
            value={dni}
            onChange={(e) => setDni(limpiarDigitos(e.target.value, 8))}
            placeholder="12345678"
            maxLength={8}
            disabled={isSaving}
            error={errores.dni}
            inputMode="numeric"
            pattern="[0-9]{8}"
            autoComplete="off"
          />
          <Input
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(limpiarDigitos(e.target.value, 9))}
            placeholder="987654321"
            maxLength={9}
            disabled={isSaving}
            error={errores.telefono}
            inputMode="numeric"
            pattern="9[0-9]{8}"
            autoComplete="off"
            hint="Opcional, pero si se ingresa debe empezar con 9"
          />
        </div>
      </form>
    </Modal>
  );
}

function HistorialPanel({ cliente, compras, onCerrar }) {
  return (
    <Modal isOpen={true} onClose={onCerrar} title="Historial de compras">
      <p className="text-sm text-[var(--color-texto-sec)] font-light italic -mt-2 mb-4">{cliente.nombre}</p>
      {compras.length === 0 ? (
        <div className="text-center py-8"><ShoppingBag className="w-12 h-12 text-[var(--color-texto-sec)]/30 mx-auto mb-3" /><p className="text-[var(--color-texto-sec)] font-light italic">Sin compras registradas</p></div>
      ) : (
        <div className="space-y-3">
          {compras.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-[var(--color-fondo)] space-y-2">
              <div className="flex justify-between"><span className="text-sm text-[var(--color-texto-sec)]">{new Date(c.fecha).toLocaleDateString('es-PE')}</span><span className="text-sm font-semibold text-[var(--color-exito)]">S/ {c.total.toFixed(2)}</span></div>
              <div className="flex gap-4 text-xs text-[var(--color-texto-sec)]"><span>{c.productos} productos</span><span>{c.metodo_pago}</span></div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function ClientesPage() {
  const {
    clientes, totalClientes, isLoading, error,
    busqueda, setBusqueda,
    modalAbierto, abrirCrear, abrirEditar, cerrarModal,
    clienteEdicion, guardar, eliminar, isSaving,
    clienteHistorial, compras, verHistorial, cerrarHistorial,
    recargar,
  } = useClientes();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[var(--color-borde)] rounded animate-pulse" />
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"><TableSkeleton columns={5} rows={4} /></div>
      </div>
    );
  }

  if (error && clientes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Clientes</h1>
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--color-alerta)] mx-auto mb-4" />
          <p className="text-[var(--color-texto)] mb-4">{error}</p>
          <Button onClick={recargar}><RefreshCw className="w-4 h-4" /> Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Clientes</h1>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic mt-1">{totalClientes} cliente{totalClientes !== 1 ? 's' : ''} registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-texto-sec)]" />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, DNI o teléfono..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] transition-shadow duration-300 placeholder:font-light placeholder:italic w-72" />
          </div>
          <Button tamaño="sm" onClick={abrirCrear}><Plus className="w-4 h-4" /> Nuevo cliente</Button>
        </div>
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        {clientes.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-[var(--color-texto-sec)]/30 mx-auto mb-4" />
            <p className="text-[var(--color-texto-sec)] font-medium mb-1">{busqueda ? 'Sin resultados' : 'No hay clientes registrados'}</p>
            <p className="text-sm text-[var(--color-texto-sec)] font-light italic">{busqueda ? 'Intenta con otro término' : 'Registra tu primer cliente'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[var(--color-borde)]"><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Nombre</th><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">DNI</th><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Teléfono</th><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Registro</th><th className="px-6 py-3.5 text-right text-xs font-medium text-[var(--color-texto-sec)] uppercase">Acciones</th></tr></thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-borde)] last:border-0 hover:bg-[var(--color-fondo)]/50 transition-colors duration-300">
                    <td className="px-6 py-3.5"><p className="text-sm font-medium text-[var(--color-texto)]">{c.nombre}</p></td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-texto-sec)] font-mono">{c.dni}</td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-texto)]"><span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[var(--color-texto-sec)]" />{c.telefono || '—'}</span></td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-texto-sec)] font-light italic">{new Date(c.fecha_registro).toLocaleDateString('es-PE')}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => verHistorial(c)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] transition-all duration-300" title="Historial"><History className="w-4 h-4" /></button>
                        <button onClick={() => abrirEditar(c)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] transition-all duration-300" title="Editar"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => eliminar(c)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-red-50 hover:text-[var(--color-alerta)] transition-all duration-300" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && <ClienteForm cliente={clienteEdicion} onGuardar={guardar} onCancelar={cerrarModal} isSaving={isSaving} />}
      {clienteHistorial && <HistorialPanel cliente={clienteHistorial} compras={compras} onCerrar={cerrarHistorial} />}
    </div>
  );
}
