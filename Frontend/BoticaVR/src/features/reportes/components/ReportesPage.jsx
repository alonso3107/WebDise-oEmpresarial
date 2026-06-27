// ============================================================
// BoticaVR — ReportesPage
// Gráficas + filtros + exportación. Componentes UI reutilizables.
// ============================================================

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Download, Package, DollarSign, Star, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useReportes } from '../hooks/useReportes';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const COLORES = ['#5C6D7C', '#4A5A68', '#7B8FA1', '#96A8B5', '#B0BEC5', '#C8D4DB', '#DCE4E8'];

function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg p-3 border border-[var(--color-borde)]">
      <p className="text-sm font-medium text-[var(--color-texto)]">{label}</p>
      {payload.map((e, i) => <p key={i} className="text-sm" style={{ color: e.color }}>{e.name}: {e.name === 'ingresos' ? 'S/ ' : ''}{e.value.toLocaleString('es-PE')}</p>)}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix = '' }) {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-5 flex items-center gap-4 transition-all duration-500 hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.01]">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primario)]/10"><Icon className="w-6 h-6 text-[var(--color-primario)]" /></div>
      <div><p className="text-sm text-[var(--color-texto-sec)] font-light italic">{label}</p><p className="text-2xl font-bold text-[var(--color-texto)]">{value}{suffix}</p></div>
    </div>
  );
}

export default function ReportesPage() {
  const { ventasMensuales, productosTop, ingresosCat, resumen, filtroDesde, setFiltroDesde, filtroHasta, setFiltroHasta, exportarCSV, isLoading, error } = useReportes();

  const handleExportar = (tipo) => { exportarCSV(tipo); toast.success(`Reporte de ${tipo} descargado`); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Reportes</h1>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic mt-1">Estadísticas y análisis del negocio</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[var(--color-texto-sec)]" />
          <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-borde)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] transition-shadow duration-300" />
          <span className="text-[var(--color-texto-sec)]">—</span>
          <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-borde)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] transition-shadow duration-300" />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>}
      {isLoading && <p className="text-sm text-[var(--color-texto-sec)]">Actualizando reportes…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Ingresos totales" value={`S/ ${resumen.ingresos_totales.toLocaleString('es-PE')}`} />
        <StatCard icon={TrendingUp} label="Ventas totales" value={resumen.ventas_totales} />
        <StatCard icon={Star} label="Ticket promedio" value={`S/ ${resumen.ticket_promedio.toFixed(2)}`} />
        <StatCard icon={Package} label="Producto estrella" value={resumen.producto_top} />
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[var(--color-primario)]" /><h2 className="text-lg font-semibold text-[var(--color-texto)]">Ventas por día</h2></div>
          <Button variant="secundario" tamaño="sm" onClick={() => handleExportar('ventas')}><Download className="w-3.5 h-3.5" /> CSV</Button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventasMensuales} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(92, 109, 124, 0.12)" />
              <XAxis dataKey="mes" tick={{ fill: '#5C6D7C', fontSize: 13 }} axisLine={{ stroke: 'rgba(92, 109, 124, 0.2)' }} tickLine={false} />
              <YAxis tick={{ fill: '#5C6D7C', fontSize: 13 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipPersonalizado />} />
              <Bar dataKey="ingresos" name="Ingresos (S/)" fill="#5C6D7C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Package className="w-5 h-5 text-[var(--color-primario)]" /><h2 className="text-lg font-semibold text-[var(--color-texto)]">Productos más vendidos</h2></div>
            <Button variant="secundario" tamaño="sm" onClick={() => handleExportar('productos')}><Download className="w-3.5 h-3.5" /> CSV</Button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {productosTop.map((p, i) => (
              <div key={p.nombre} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-fondo)] transition-colors duration-300">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primario)]/10 text-sm font-bold text-[var(--color-primario)]">{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[var(--color-texto)] truncate">{p.nombre}</p><p className="text-xs text-[var(--color-texto-sec)] font-light italic">{p.cantidad} unidades</p></div>
                <span className="text-sm font-semibold text-[var(--color-exito)]">S/ {p.ingresos.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-[var(--color-primario)]" /><h2 className="text-lg font-semibold text-[var(--color-texto)]">Ingresos por categoría</h2></div>
            <Button variant="secundario" tamaño="sm" onClick={() => handleExportar('categorias')}><Download className="w-3.5 h-3.5" /> CSV</Button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ingresosCat} dataKey="ingresos" nameKey="categoria" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3}>
                  {ingresosCat.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `S/ ${v.toFixed(2)}`} />
                <Legend formatter={(v) => <span className="text-sm text-[var(--color-texto)]">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
