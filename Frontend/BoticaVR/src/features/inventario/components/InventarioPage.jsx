// ============================================================
// BoticaVR - InventarioPage
// Vista simple por prioridad: stock, vencimientos y acciones claras.
// ============================================================

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FilterX,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useInventario } from '../hooks/useInventario';
import inventarioService from '../services/inventarioService';
import ProductoForm from './ProductoForm';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { TableSkeleton } from '../../../components/ui/Skeleton';

const formatoEntero = new Intl.NumberFormat('es-PE');
const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const formatearMoneda = (valor = 0) => formatoMoneda.format(Number(valor || 0));
const formatearEntero = (valor = 0) => formatoEntero.format(Number(valor || 0));

function SummaryCard({ icon: Icon, label, value, helper, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'bg-[var(--color-primario)]/10 text-[var(--color-primario)]',
    success: 'bg-green-100 text-[var(--color-exito)]',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-[var(--color-alerta)]',
  };

  return (
    <article className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-texto-sec)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-texto)]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-texto-sec)]">{helper}</p>
        </div>
      </div>
    </article>
  );
}

function StockBadge({ producto }) {
  const stock = Number(producto.stock || 0);
  const { label } = inventarioService.estadoStock(stock);
  const variant = stock <= 2 ? 'alerta' : stock <= 5 ? 'advertencia' : 'exito';
  return <Badge variant={variant} tamaño="md">{stock} und. - {label}</Badge>;
}

function ExpiryBadge({ fecha }) {
  if (!fecha) return <Badge variant="neutro">Sin fecha</Badge>;

  const porVencer = inventarioService.estaPorVencer(fecha);
  return (
    <Badge variant={porVencer ? 'advertencia' : 'neutro'}>
      {porVencer ? 'Vence pronto' : 'Vigente'} - {new Date(fecha).toLocaleDateString('es-PE')}
    </Badge>
  );
}

function EmptyState({ hayFiltros, onLimpiar, onCrear }) {
  return (
    <section className="rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-card)] px-6 py-14 text-center">
      <Package className="mx-auto mb-4 h-14 w-14 text-[var(--color-texto-sec)]/35" />
      <h2 className="text-lg font-bold text-[var(--color-texto)]">
        {hayFiltros ? 'No encontramos productos con esos filtros' : 'Todavia no hay productos registrados'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-texto-sec)]">
        {hayFiltros
          ? 'Prueba limpiando filtros o busca por una palabra mas corta.'
          : 'Registra el primer producto para empezar a controlar stock, precios y vencimientos.'}
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {hayFiltros ? (
          <Button className="h-10" variant="secundario" onClick={onLimpiar}>
            <FilterX className="h-4 w-4" /> Limpiar filtros
          </Button>
        ) : (
          <Button className="h-10" onClick={onCrear}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        )}
      </div>
    </section>
  );
}

function ProductCard({ producto, onEditar, onEliminar }) {
  const stock = Number(producto.stock || 0);
  const requiereAtencion = stock <= 5 || inventarioService.estaPorVencer(producto.fecha_vencimiento);

  return (
    <article className={`rounded-lg border bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)] ${requiereAtencion ? 'border-amber-200' : 'border-[var(--color-borde)]'}`}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_170px_180px_120px] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-[var(--color-texto)]">{producto.nombre}</h3>
            {requiereAtencion && (
              <Badge variant={stock <= 2 ? 'alerta' : 'advertencia'}>
                Revisar
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
            {producto.categoria || 'Sin categoria'}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Stock</p>
          <StockBadge producto={producto} />
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Vencimiento</p>
          <ExpiryBadge fecha={producto.fecha_vencimiento} />
        </div>

        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <div className="xl:text-right">
            <p className="text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Precio</p>
            <p className="text-base font-bold tabular-nums text-[var(--color-exito)]">
              {formatearMoneda(producto.precio_venta)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEditar(producto)}
              aria-label={`Editar ${producto.nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-texto-sec)] transition-colors duration-200 hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-primario)]/25"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onEliminar(producto)}
              aria-label={`Eliminar ${producto.nombre}`}
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

export default function InventarioPage() {
  const {
    productos,
    totalProductos,
    resumenInventario,
    isLoading,
    error,
    filtroStock,
    setFiltroStock,
    filtroVencimiento,
    setFiltroVencimiento,
    filtroCategoria,
    setFiltroCategoria,
    busqueda,
    setBusqueda,
    categorias,
    modalAbierto,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    productoEdicion,
    guardar,
    eliminar,
    isSaving,
    recargar,
    exportarExcel,
  } = useInventario();

  const hayFiltros = filtroStock !== 'todos' || filtroVencimiento || filtroCategoria || busqueda.trim();
  const limpiarFiltros = () => {
    setFiltroStock('todos');
    setFiltroVencimiento(false);
    setFiltroCategoria('');
    setBusqueda('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--color-borde)]" />
        <div className="rounded-lg bg-[var(--color-card)] shadow-[var(--shadow-card)]">
          <TableSkeleton columns={5} rows={5} />
        </div>
      </div>
    );
  }

  if (error && productos.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Inventario</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Inventario</h1>
          <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
            Control rapido de productos, stock y vencimientos.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="h-10" variant="secundario" onClick={exportarExcel} disabled={productos.length === 0}>
            <Download className="h-4 w-4" /> Exportar Excel
          </Button>
          <Button className="h-10" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Package}
          label="Productos"
          value={formatearEntero(totalProductos)}
          helper={`${formatearEntero(productos.length)} visibles ahora`}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Stock critico"
          value={formatearEntero(resumenInventario.criticos)}
          helper="Prioridad de reposicion"
          tone={resumenInventario.criticos ? 'danger' : 'success'}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Stock bajo"
          value={formatearEntero(resumenInventario.bajos)}
          helper="Conviene revisar compras"
          tone={resumenInventario.bajos ? 'warning' : 'success'}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Por vencer"
          value={formatearEntero(resumenInventario.porVencer)}
          helper={`Valor estimado: ${formatearMoneda(resumenInventario.valorInventario)}`}
          tone={resumenInventario.porVencer ? 'warning' : 'neutral'}
        />
      </section>

      <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_190px_220px_auto] xl:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-sec)]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto o categoria"
              className="h-11 w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] pl-10 pr-4 text-sm text-[var(--color-texto)] transition-shadow duration-200 placeholder:text-[var(--color-texto-sec)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
            />
          </div>

          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="h-11 rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] px-3 text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
          >
            <option value="todos">Todo el stock</option>
            <option value="bajo">Stock bajo</option>
            <option value="critico">Stock critico</option>
          </select>

          <button
            type="button"
            onClick={() => setFiltroVencimiento(!filtroVencimiento)}
            className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-primario)]/25 ${filtroVencimiento ? 'border-amber-300 bg-amber-100 text-amber-800' : 'border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] hover:border-[var(--color-primario)]'}`}
          >
            <AlertTriangle className="h-4 w-4" />
            Vencen pronto
          </button>

          {categorias.length > 0 && (
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="h-11 rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] px-3 text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
            >
              <option value="">Todas las categorias</option>
              {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}

          {hayFiltros && (
            <Button className="h-11" variant="secundario" onClick={limpiarFiltros}>
              <FilterX className="h-4 w-4" /> Limpiar
            </Button>
          )}
        </div>
      </section>

      {productos.length === 0 ? (
        <EmptyState hayFiltros={hayFiltros} onLimpiar={limpiarFiltros} onCrear={abrirCrear} />
      ) : (
        <section className="space-y-3">
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onEditar={abrirEditar}
              onEliminar={eliminar}
            />
          ))}
        </section>
      )}

      {modalAbierto && (
        <ProductoForm
          producto={productoEdicion}
          onGuardar={guardar}
          onCancelar={cerrarModal}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
