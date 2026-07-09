// ============================================================
// BoticaVR - ClientesPage
// Gestion simple de clientes con busqueda clara e historial visible.
// ============================================================

import { useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  History,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { TableSkeleton } from '../../../components/ui/Skeleton';

const formatoEntero = new Intl.NumberFormat('es-PE');
const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const formatearEntero = (valor = 0) => formatoEntero.format(Number(valor || 0));
const formatearMoneda = (valor = 0) => formatoMoneda.format(Number(valor || 0));

function SummaryCard({ icon: Icon, label, value, helper, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'bg-[var(--color-primario)]/10 text-[var(--color-primario)]',
    success: 'bg-green-100 text-[var(--color-exito)]',
    warning: 'bg-amber-100 text-amber-700',
  };

  return (
    <article className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-texto-sec)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-texto)]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-texto-sec)]">{helper}</p>
        </div>
      </div>
    </article>
  );
}

function ClienteForm({ cliente, onGuardar, onCancelar, isSaving }) {
  const [nombres, setNombres] = useState(cliente?.nombres || '');
  const [apellidos, setApellidos] = useState(cliente?.apellidos || '');
  const [dni, setDni] = useState(cliente?.dni || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [errorLocal, setErrorLocal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal('');
    if (!nombres.trim() || !apellidos.trim()) {
      setErrorLocal('Completa nombres y apellidos para identificar al cliente.');
      return;
    }
    if (!/^\d{8}$/.test(dni.trim())) {
      setErrorLocal('El DNI debe tener 8 digitos.');
      return;
    }

    const telefonoLimpio = telefono.trim();
    if (telefonoLimpio && !/^9\d{8}$/.test(telefonoLimpio)) {
      setErrorLocal('El celular debe empezar con 9 y tener 9 digitos.');
      return;
    }

    onGuardar({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      dni: dni.trim(),
      telefono: telefonoLimpio || null,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancelar}
      title={cliente ? 'Editar cliente' : 'Registrar cliente'}
      footer={
        <>
          <Button variant="secundario" onClick={onCancelar} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            <Save className="h-4 w-4" /> {cliente ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorLocal && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-[var(--color-alerta)]">
            {errorLocal}
          </p>
        )}

        <div className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)]/55 p-3">
          <p className="text-sm font-semibold text-[var(--color-texto)]">Datos principales</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-texto-sec)]">
            Con nombre y DNI basta para vender; el telefono ayuda para contacto posterior.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Ej: Maria"
            disabled={isSaving}
            autoFocus
          />
          <Input
            label="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            placeholder="Ej: Lopez Garcia"
            disabled={isSaving}
          />
          <Input
            label="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
            placeholder="12345678"
            maxLength={8}
            disabled={isSaving || !!cliente}
            hint={cliente ? 'El DNI no se cambia despues del registro.' : '8 digitos.'}
          />
          <Input
            label="Celular"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
            placeholder="987654321"
            maxLength={9}
            disabled={isSaving}
            hint="Opcional, pero recomendado."
          />
        </div>
      </form>
    </Modal>
  );
}

function HistorialPanel({ cliente, compras, onCerrar }) {
  const totalCompras = compras.reduce((total, compra) => total + Number(compra.total || 0), 0);

  return (
    <Modal isOpen={true} onClose={onCerrar} title="Historial de compras">
      <div className="mb-4 rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)]/55 p-4">
        <p className="text-sm font-semibold text-[var(--color-texto)]">{cliente.nombre}</p>
        <p className="mt-1 text-xs text-[var(--color-texto-sec)]">
          {formatearEntero(compras.length)} compra{compras.length === 1 ? '' : 's'} registrada{compras.length === 1 ? '' : 's'} - {formatearMoneda(totalCompras)}
        </p>
      </div>

      {compras.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-borde)] py-10 text-center">
          <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-[var(--color-texto-sec)]/35" />
          <p className="font-medium text-[var(--color-texto)]">Sin compras registradas</p>
          <p className="mt-1 text-sm text-[var(--color-texto-sec)]">Cuando este cliente compre, aparecera aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {compras.map((compra) => (
            <article key={compra.id} className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-texto)]">
                    {new Date(compra.fecha).toLocaleDateString('es-PE')}
                  </p>
                  <p className="mt-1 text-xs capitalize text-[var(--color-texto-sec)]">
                    {compra.productos} producto{compra.productos === 1 ? '' : 's'} - {compra.metodo_pago}
                  </p>
                </div>
                <p className="text-sm font-bold tabular-nums text-[var(--color-exito)]">
                  {formatearMoneda(compra.total)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </Modal>
  );
}

function EmptyState({ hayBusqueda, onCrear }) {
  return (
    <section className="rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-card)] px-6 py-14 text-center">
      <Users className="mx-auto mb-4 h-14 w-14 text-[var(--color-texto-sec)]/35" />
      <h2 className="text-lg font-bold text-[var(--color-texto)]">
        {hayBusqueda ? 'No encontramos clientes con esa busqueda' : 'Todavia no hay clientes registrados'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-texto-sec)]">
        {hayBusqueda
          ? 'Busca por nombre, DNI o celular. Si no existe, puedes registrarlo.'
          : 'Registra clientes frecuentes para revisar compras y atenderlos mas rapido.'}
      </p>
      {!hayBusqueda && (
        <Button className="mt-5 h-10" onClick={onCrear}>
          <Plus className="h-4 w-4" /> Registrar cliente
        </Button>
      )}
    </section>
  );
}

function ClienteCard({ cliente, onHistorial, onEditar, onEliminar }) {
  return (
    <article className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_150px_170px_150px] xl:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primario)]/10 text-[var(--color-primario)]">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[var(--color-texto)]">{cliente.nombre}</h3>
            <p className="mt-1 font-mono text-sm text-[var(--color-texto-sec)]">DNI {cliente.dni}</p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Contacto</p>
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-texto)]">
            <Phone className="h-4 w-4 text-[var(--color-texto-sec)]" />
            {cliente.telefono || 'Sin telefono'}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Registro</p>
          <p className="flex items-center gap-2 text-sm text-[var(--color-texto)]">
            <CalendarDays className="h-4 w-4 text-[var(--color-texto-sec)]" />
            {new Date(cliente.fecha_registro).toLocaleDateString('es-PE')}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 xl:justify-end">
          <Button className="h-10" variant="secundario" onClick={() => onHistorial(cliente)}>
            <History className="h-4 w-4" /> Historial
          </Button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditar(cliente)}
              aria-label={`Editar ${cliente.nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-texto-sec)] transition-colors duration-200 hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-primario)]/25"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onEliminar(cliente)}
              aria-label={`Eliminar ${cliente.nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-texto-sec)] transition-colors duration-200 hover:bg-red-50 hover:text-[var(--color-alerta)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-alerta)]/25"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ClientesPage() {
  const {
    clientes,
    totalClientes,
    resumenClientes,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    modalAbierto,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    clienteEdicion,
    guardar,
    eliminar,
    isSaving,
    clienteHistorial,
    compras,
    verHistorial,
    cerrarHistorial,
    recargar,
  } = useClientes();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--color-borde)]" />
        <div className="rounded-lg bg-[var(--color-card)] shadow-[var(--shadow-card)]">
          <TableSkeleton columns={5} rows={4} />
        </div>
      </div>
    );
  }

  if (error && clientes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Clientes</h1>
        <div className="rounded-lg border border-red-200 bg-[var(--color-card)] p-10 text-center shadow-[var(--shadow-card)]">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[var(--color-alerta)]" />
          <p className="mb-4 text-[var(--color-texto)]">{error}</p>
          <Button className="h-10" onClick={recargar}>
            <RefreshCw className="h-4 w-4" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const hayBusqueda = Boolean(busqueda.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Clientes</h1>
          <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
            Encuentra clientes por nombre, DNI o celular y revisa sus compras.
          </p>
        </div>
        <Button className="h-10 self-start lg:self-auto" onClick={abrirCrear}>
          <Plus className="h-4 w-4" /> Registrar cliente
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Users}
          label="Clientes"
          value={formatearEntero(totalClientes)}
          helper={`${formatearEntero(clientes.length)} visibles ahora`}
        />
        <SummaryCard
          icon={Phone}
          label="Con telefono"
          value={formatearEntero(resumenClientes.conTelefono)}
          helper="Listos para contacto"
          tone="success"
        />
        <SummaryCard
          icon={UserRound}
          label="Nuevos"
          value={formatearEntero(resumenClientes.nuevos)}
          helper={`${formatearEntero(resumenClientes.sinTelefono)} sin telefono`}
          tone={resumenClientes.sinTelefono ? 'warning' : 'neutral'}
        />
      </section>

      <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-sec)]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI o celular"
              className="h-11 w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] pl-10 pr-4 text-sm text-[var(--color-texto)] transition-shadow duration-200 placeholder:text-[var(--color-texto-sec)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
            />
          </div>
          {hayBusqueda && (
            <Button className="h-11" variant="secundario" onClick={() => setBusqueda('')}>
              Limpiar busqueda
            </Button>
          )}
        </div>
      </section>

      {clientes.length === 0 ? (
        <EmptyState hayBusqueda={hayBusqueda} onCrear={abrirCrear} />
      ) : (
        <section className="space-y-3">
          {clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onHistorial={verHistorial}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
          ))}
        </section>
      )}

      {modalAbierto && (
        <ClienteForm
          cliente={clienteEdicion}
          onGuardar={guardar}
          onCancelar={cerrarModal}
          isSaving={isSaving}
        />
      )}
      {clienteHistorial && (
        <HistorialPanel
          cliente={clienteHistorial}
          compras={compras}
          onCerrar={cerrarHistorial}
        />
      )}
    </div>
  );
}
