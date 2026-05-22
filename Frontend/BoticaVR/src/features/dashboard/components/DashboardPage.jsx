// ============================================================
// BoticaVR — DashboardPage
// Panel de control: cards resumen, gráfica semanal,
// últimas ventas y alertas de stock crítico.
// ============================================================

import { useDashboard } from '../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Tarjeta de estadística individual.
 */
function StatCard({ icon: Icon, label, value, suffix = '', color = 'text-[var(--color-texto)]', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)]
        p-5 flex items-center gap-4 transition-all duration-500
        hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.01]
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primario)]/10">
        <Icon className="w-6 h-6 text-[var(--color-primario)]" />
      </div>
      <div>
        <p className="text-sm text-[var(--color-texto-sec)] font-light italic">
          {label}
        </p>
        <p className={`text-2xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('es-PE') : value}
          {suffix}
        </p>
      </div>
    </div>
  );
}

/**
 * Skeleton de carga para las cards.
 */
function SkeletonCard() {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-borde)]" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-24 bg-[var(--color-borde)] rounded" />
        <div className="h-6 w-16 bg-[var(--color-borde)] rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton para la tabla de ventas.
 */
function SkeletonTable() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-3">
          <div className="h-4 flex-1 bg-[var(--color-borde)] rounded" />
          <div className="h-4 w-20 bg-[var(--color-borde)] rounded" />
          <div className="h-4 w-16 bg-[var(--color-borde)] rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Tooltip personalizado para la gráfica.
 */
function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg p-3 border border-[var(--color-borde)]">
      <p className="text-sm font-medium text-[var(--color-texto)]">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: S/ {entry.value.toLocaleString('es-PE')}
        </p>
      ))}
    </div>
  );
}

/**
 * Página principal del Dashboard.
 */
export default function DashboardPage() {
  const { datos, isLoading, error, refrescar } = useDashboard();
  const navigate = useNavigate();

  // ── Estado de carga ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
            <div className="h-8 w-40 bg-[var(--color-borde)] rounded animate-pulse mb-4" />
            <div className="h-64 bg-[var(--color-borde)] rounded animate-pulse" />
          </div>
          <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
            <div className="h-8 w-32 bg-[var(--color-borde)] rounded animate-pulse mb-4" />
            <SkeletonTable />
          </div>
        </div>
      </div>
    );
  }

  // ── Estado de error ──
  if (error && !datos) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Dashboard</h1>
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--color-alerta)] mx-auto mb-4" />
          <p className="text-[var(--color-texto)] mb-4">{error}</p>
          <button
            onClick={refrescar}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primario)] text-[var(--color-fondo)] text-sm font-medium hover:bg-[var(--color-primario-hover)] transition-colors duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ── Datos cargados ──
  const { resumen, ventasSemanales, ultimasVentas, criticos } = datos || {};

  return (
    <div className="space-y-6">
      {/* ── Cabecera ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic mt-1">
            Resumen del día — {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={refrescar}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-card)] shadow-[var(--shadow-card)] text-sm text-[var(--color-texto-sec)] hover:text-[var(--color-texto)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* ── Cards de resumen ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          label="Ventas del día"
          value={resumen?.ventas_dia || 0}
          onClick={() => navigate('/ventas')}
        />
        <StatCard
          icon={DollarSign}
          label="Ingresos del día"
          value={`S/ ${(resumen?.ingresos_dia || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          color="text-[var(--color-exito)]"
        />
        <StatCard
          icon={Users}
          label="Clientes atendidos"
          value={resumen?.clientes_atendidos || 0}
          onClick={() => navigate('/clientes')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock bajo"
          value={resumen?.stock_bajo || 0}
          color="text-[var(--color-alerta)]"
          onClick={() => navigate('/inventario')}
        />
      </div>

      {/* ── Gráfica + Últimas ventas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica semanal */}
        <div className="lg:col-span-2 bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[var(--color-primario)]" />
            <h2 className="text-lg font-semibold text-[var(--color-texto)]">
              Ventas de la semana
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasSemanales}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(92, 109, 124, 0.15)" />
                <XAxis
                  dataKey="dia"
                  tick={{ fill: '#5C6D7C', fontSize: 13, fontFamily: 'Frick' }}
                  axisLine={{ stroke: 'rgba(92, 109, 124, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5C6D7C', fontSize: 13, fontFamily: 'Frick' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `S/${v}`}
                />
                <Tooltip content={<TooltipPersonalizado />} />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="#5C6D7C"
                  strokeWidth={2.5}
                  dot={{ fill: '#5C6D7C', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4A5A68' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimas ventas */}
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-texto)]">
              Últimas ventas
            </h2>
            <button
              onClick={() => navigate('/ventas')}
              className="text-sm text-[var(--color-texto-sec)] hover:text-[var(--color-primario)] transition-colors duration-300 flex items-center gap-1"
            >
              Ver todo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!ultimasVentas?.length ? (
            <p className="text-sm text-[var(--color-texto-sec)] font-light italic text-center py-8">
              No hay ventas registradas hoy
            </p>
          ) : (
            <div className="space-y-3">
              {ultimasVentas.map((venta) => (
                <div
                  key={venta.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-fondo)] transition-colors duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-texto)] truncate">
                      {venta.cliente}
                    </p>
                    <p className="text-xs text-[var(--color-texto-sec)] font-light italic">
                      {venta.productos} productos — {venta.metodo_pago}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-exito)] ml-3 flex-shrink-0">
                    S/ {venta.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Alertas de stock crítico ── */}
      {criticos?.length > 0 && (
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6 border-l-4 border-[var(--color-alerta)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[var(--color-alerta)]" />
            <h2 className="text-lg font-semibold text-[var(--color-alerta)]">
              Productos críticos ({criticos.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticos.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-texto)] truncate">
                    {prod.nombre}
                  </p>
                  <p className="text-xs text-[var(--color-alerta)] font-medium">
                    Stock: {prod.stock} {prod.stock === 0 ? '— ¡Agotado!' : '— Crítico'}
                  </p>
                </div>
                <Package className="w-5 h-5 text-[var(--color-alerta)] flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/inventario')}
            className="mt-4 text-sm text-[var(--color-primario)] hover:text-[var(--color-primario-hover)] transition-colors duration-300 flex items-center gap-1"
          >
            Ir al inventario
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Sin productos críticos ── */}
      {criticos && criticos.length === 0 && (
        <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-6 border-l-4 border-[var(--color-exito)]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--color-exito)]" />
            <p className="text-sm text-[var(--color-texto)]">
              Todos los productos tienen stock suficiente.{' '}
              <span className="text-[var(--color-exito)] font-medium">✓</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
