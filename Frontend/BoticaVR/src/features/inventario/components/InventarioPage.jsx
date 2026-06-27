// ============================================================
// BoticaVR — InventarioPage
// Tabla TanStack v8 + CRUD + filtros. Componentes UI reutilizables.
// ============================================================

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Plus, Search, Download, Package, Pencil, Trash2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useInventario } from '../hooks/useInventario';
import inventarioService from '../services/inventarioService';
import ProductoForm from './ProductoForm';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { TableSkeleton } from '../../../components/ui/Skeleton';

function EstadoVacio({ hayFiltros, onLimpiar }) {
  return (
    <div className="text-center py-16">
      <Package className="w-16 h-16 text-[var(--color-texto-sec)]/30 mx-auto mb-4" />
      {hayFiltros ? (
        <>
          <p className="text-[var(--color-texto-sec)] font-medium mb-2">Sin resultados con los filtros actuales</p>
          <button onClick={onLimpiar} className="text-sm text-[var(--color-primario)] hover:underline font-medium">Limpiar filtros</button>
        </>
      ) : (
        <>
          <p className="text-[var(--color-texto-sec)] font-medium mb-1">El inventario está vacío</p>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic">Agrega tu primer producto para empezar</p>
        </>
      )}
    </div>
  );
}

export default function InventarioPage() {
  const {
    productos, totalProductos, isLoading, error,
    filtroStock, setFiltroStock,
    filtroVencimiento, setFiltroVencimiento,
    filtroCategoria, setFiltroCategoria,
    busqueda, setBusqueda,
    categorias,
    modalAbierto, abrirCrear, abrirEditar, cerrarModal,
    productoEdicion,
    guardar, eliminar, isSaving,
    recargar, exportarCSV,
  } = useInventario();

  const columns = useMemo(() => [
    { accessorKey: 'nombre', header: 'Nombre', cell: ({ getValue }) => <span className="font-medium text-[var(--color-texto)]">{getValue()}</span> },
    { accessorKey: 'categoria', header: 'Categoría', cell: ({ getValue }) => <span className="text-sm text-[var(--color-texto-sec)]">{getValue() || '—'}</span> },
    {
      accessorKey: 'stock', header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.stock;
        const { label } = inventarioService.estadoStock(stock);
        const variant = stock <= 2 ? 'alerta' : stock <= 5 ? 'advertencia' : 'exito';
        return <Badge variant={variant}>{stock} — {label}</Badge>;
      },
    },
    { accessorKey: 'precio_venta', header: 'P. Venta', cell: ({ getValue }) => <span className="text-sm font-medium text-[var(--color-exito)]">S/ {parseFloat(getValue() || 0).toFixed(2)}</span> },
    {
      accessorKey: 'fecha_vencimiento', header: 'Vencimiento',
      cell: ({ row }) => {
        const fecha = row.original.fecha_vencimiento;
        if (!fecha) return <span className="text-sm text-[var(--color-texto-sec)] font-light italic">—</span>;
        const estaProximo = inventarioService.estaPorVencer(fecha);
        return <span className={`text-sm ${estaProximo ? 'text-[var(--color-alerta)] font-medium' : 'text-[var(--color-texto-sec)]'}`}>{new Date(fecha).toLocaleDateString('es-PE')}{estaProximo && ' ⚠'}</span>;
      },
    },
    {
      id: 'acciones', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => abrirEditar(row.original)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-primario)] transition-all duration-300" title="Editar"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => eliminar(row.original)} className="p-2 rounded-lg text-[var(--color-texto-sec)] hover:bg-red-50 hover:text-[var(--color-alerta)] transition-all duration-300" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], [abrirEditar, eliminar]);

  const table = useReactTable({ data: productos, columns, getCoreRowModel: getCoreRowModel() });
  const hayFiltros = filtroStock !== 'todos' || filtroVencimiento || filtroCategoria || busqueda.trim();
  const limpiarFiltros = () => { setFiltroStock('todos'); setFiltroVencimiento(false); setFiltroCategoria(''); setBusqueda(''); };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[var(--color-borde)] rounded animate-pulse" />
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"><TableSkeleton columns={5} rows={5} /></div>
      </div>
    );
  }

  if (error && productos.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Inventario</h1>
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
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Inventario</h1>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic mt-1">{totalProductos} producto{totalProductos !== 1 ? 's' : ''} en total{productos.length !== totalProductos && ` — ${productos.length} mostrados`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secundario" tamaño="sm" onClick={exportarCSV} disabled={productos.length === 0}><Download className="w-4 h-4" /> CSV</Button>
          <Button tamaño="sm" onClick={abrirCrear}><Plus className="w-4 h-4" /> Nuevo producto</Button>
        </div>
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-texto-sec)]" />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent transition-shadow duration-300 placeholder:font-light placeholder:italic" />
          </div>
          <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)} className="px-3 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] transition-shadow duration-300">
            <option value="todos">Todo el stock</option><option value="bajo">Stock bajo (≤5)</option><option value="critico">Crítico (≤2)</option>
          </select>
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-sm text-[var(--color-texto)] cursor-pointer hover:bg-[var(--color-fondo)]/80 transition-colors duration-300">
            <input type="checkbox" checked={filtroVencimiento} onChange={(e) => setFiltroVencimiento(e.target.checked)} className="rounded accent-[var(--color-primario)]" /> Próximos a vencer
          </label>
          {categorias.length > 0 && (
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="px-3 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] transition-shadow duration-300">
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}
          {hayFiltros && (
            <button onClick={limpiarFiltros} className="flex items-center gap-1 px-3 py-2.5 text-sm text-[var(--color-alerta)] hover:underline font-medium"><X className="w-4 h-4" /> Limpiar</button>
          )}
        </div>
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        {productos.length === 0 ? (
          <EstadoVacio hayFiltros={hayFiltros} onLimpiar={limpiarFiltros} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-[var(--color-borde)]">
                    {hg.headers.map((h) => <th key={h.id} className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase tracking-wider">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-borde)] last:border-0 hover:bg-[var(--color-fondo)]/50 transition-colors duration-300">
                    {row.getVisibleCells().map((cell) => <td key={cell.id} className="px-6 py-3.5 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && <ProductoForm producto={productoEdicion} onGuardar={guardar} onCancelar={cerrarModal} isSaving={isSaving} />}
    </div>
  );
}
