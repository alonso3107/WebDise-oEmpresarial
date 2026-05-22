// ============================================================
// BoticaVR — ClientesPage
// Tabla de clientes + CRUD + historial de compras por cliente.
// ⚠️ MOCK hasta que el backend implemente /api/v1/clientes/
// ============================================================

import {
  Plus, Search, Pencil, Trash2, Users, History,
  X, Save, Phone, CreditCard, ShoppingBag, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useClientes } from '../hooks/useClientes';

/** Skeleton de carga */
function TablaSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-2">
      {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[var(--color-borde)] rounded-xl" />)}
    </div>
  );
}

/** Formulario modal crear/editar */
function ClienteForm({ cliente, onGuardar, onCancelar, isSaving }) {
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [dni, setDni] = useState(cliente?.dni || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [errorLocal, setErrorLocal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) { setErrorLocal('El nombre es obligatorio'); return; }
    if (!dni.trim() || dni.length < 8) { setErrorLocal('DNI inválido (mínimo 8 dígitos)'); return; }
    onGuardar({ nombre: nombre.trim(), dni: dni.trim(), telefono: telefono.trim() });
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent transition-shadow duration-300 disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--color-card)] rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-borde)]">
          <h2 className="text-lg font-semibold text-[var(--color-texto)]">
            {cliente ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onCancelar} className="p-1.5 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] transition-colors duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorLocal && <p className="text-sm text-[var(--color-alerta)] bg-red-50 border border-red-200 rounded-lg p-3">{errorLocal}</p>}
          <div>
            <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Nombre completo *</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: María López García" className={inputClass} disabled={isSaving} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">DNI *</label>
              <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="12345678" maxLength={8} className={inputClass} disabled={isSaving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Teléfono</label>
              <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="987654321" maxLength={9} className={inputClass} disabled={isSaving} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borde)]">
            <button type="button" onClick={onCancelar} disabled={isSaving} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] transition-colors duration-300">Cancelar</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primario)] text-[var(--color-fondo)] text-sm font-medium hover:bg-[var(--color-primario-hover)] transition-colors duration-300 disabled:opacity-50">
              {isSaving ? 'Guardando...' : (<><Save className="w-4 h-4" /> {cliente ? 'Actualizar' : 'Crear'}</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Panel de historial de compras */
function HistorialPanel({ cliente, compras, onCerrar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[var(--color-card)] rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-borde)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-texto)]">Historial de compras</h2>
            <p className="text-sm text-[var(--color-texto-sec)] font-light italic">{cliente.nombre}</p>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] transition-colors duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {compras.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-[var(--color-texto-sec)]/30 mx-auto mb-3" />
              <p className="text-[var(--color-texto-sec)] font-light italic">Sin compras registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {compras.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-[var(--color-fondo)] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-texto-sec)]">{new Date(c.fecha).toLocaleDateString('es-PE')}</span>
                    <span className="text-sm font-semibold text-[var(--color-exito)]">S/ {c.total.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-[var(--color-texto-sec)]">
                    <span>{c.productos} productos</span>
                    <span>{c.metodo_pago}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

/**
 * Página de gestión de clientes.
 */
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
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"><TablaSkeleton /></div>
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
          <button onClick={recargar} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primario)] text-[var(--color-fondo)] text-sm font-medium hover:bg-[var(--color-primario-hover)] transition-colors duration-300">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Clientes</h1>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic mt-1">
            {totalClientes} cliente{totalClientes !== 1 ? 's' : ''} registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-texto-sec)]" />
            <input
              type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI o teléfono..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] transition-shadow duration-300 placeholder:font-light placeholder:italic w-72"
            />
          </div>
          <button onClick={abrirCrear} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primario)] text-[var(--color-fondo)] text-sm font-medium hover:bg-[var(--color-primario-hover)] transition-all duration-300">
            <Plus className="w-4 h-4" /> Nuevo cliente
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        {clientes.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-[var(--color-texto-sec)]/30 mx-auto mb-4" />
            <p className="text-[var(--color-texto-sec)] font-medium mb-1">
              {busqueda ? 'Sin resultados' : 'No hay clientes registrados'}
            </p>
            <p className="text-sm text-[var(--color-texto-sec)] font-light italic">
              {busqueda ? 'Intenta con otro término de búsqueda' : 'Registra tu primer cliente para empezar'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-borde)]">
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Nombre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">DNI</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Teléfono</th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Registro</th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium text-[var(--color-texto-sec)] uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-borde)] last:border-0 hover:bg-[var(--color-fondo)]/50 transition-colors duration-300">
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-medium text-[var(--color-texto)]">{c.nombre}</p>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-texto-sec)] font-mono">{c.dni}</td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-texto)]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-texto-sec)]" />
                        {c.telefono || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-texto-sec)] font-light italic">
                      {new Date(c.fecha_registro).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => verHistorial(c)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] transition-all duration-300" title="Historial">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => abrirEditar(c)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] transition-all duration-300" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => eliminar(c)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-red-50 hover:text-[var(--color-alerta)] transition-all duration-300" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <ClienteForm cliente={clienteEdicion} onGuardar={guardar} onCancelar={cerrarModal} isSaving={isSaving} />
      )}

      {/* Panel historial */}
      {clienteHistorial && (
        <HistorialPanel cliente={clienteHistorial} compras={compras} onCerrar={cerrarHistorial} />
      )}
    </div>
  );
}
