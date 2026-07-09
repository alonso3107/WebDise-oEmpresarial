// ============================================================
// BoticaVR - DashboardPage
// Panel ejecutivo simple para lectura diaria y decisiones rapidas.
// ============================================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../../../components/ui/Button';
import { CardSkeleton, TableSkeleton } from '../../../components/ui/Skeleton';
import { useDashboard } from '../hooks/useDashboard';

const formatoEntero = new Intl.NumberFormat('es-PE');
const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});
const formatoMonedaCompacta = new Intl.NumberFormat('es-PE', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatearMoneda = (valor = 0) => formatoMoneda.format(Number(valor || 0));
const formatearEntero = (valor = 0) => formatoEntero.format(Number(valor || 0));
const formatearMonedaCorta = (valor = 0) => `S/ ${formatoMonedaCompacta.format(Number(valor || 0))}`;

function MetricCard({ icon: Icon, label, value, helper, tone = 'neutral', onClick }) {
  const Component = onClick ? 'button' : 'article';
  const toneClasses = {
    neutral: 'bg-[var(--color-primario)]/10 text-[var(--color-primario)]',
    success: 'bg-[var(--color-exito)]/12 text-[var(--color-exito)]',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-50 text-[var(--color-alerta)]',
  };

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`min-h-32 w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 text-left shadow-[var(--shadow-card)] transition-colors duration-200 ${onClick ? 'cursor-pointer hover:border-[var(--color-primario)] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-primario)]/25' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {onClick && <ChevronRight className="h-4 w-4 text-[var(--color-texto-sec)]" aria-hidden="true" />}
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--color-texto-sec)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-texto)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-texto-sec)]">{helper}</p>
    </Component>
  );
}

function TooltipDashboard({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-3 shadow-lg">
      <p className="text-sm font-semibold capitalize text-[var(--color-texto)]">{label}</p>
      <p className="text-sm text-[var(--color-primario)]">
        Ingresos: {formatearMoneda(payload[0].value)}
      </p>
    </div>
  );
}

function PriorityPanel({ resumen, criticos, stockBajo, onInventario }) {
  const tieneCriticos = criticos.length > 0;
  const tieneStockBajo = Number(resumen?.stock_bajo || 0) > 0;
  const estado = tieneCriticos
    ? {
        icon: AlertTriangle,
        title: 'Reponer productos agotados',
        text: `${criticos.length} producto${criticos.length === 1 ? '' : 's'} sin stock. Atiende esto primero para no perder ventas.`,
        panel: 'border-red-200 bg-red-50',
        iconColor: 'text-[var(--color-alerta)]',
      }
    : tieneStockBajo
      ? {
          icon: Package,
          title: 'Revisar stock bajo',
          text: `${resumen.stock_bajo} producto${resumen.stock_bajo === 1 ? '' : 's'} cerca del minimo. Conviene revisar compras.`,
          panel: 'border-amber-200 bg-amber-50',
          iconColor: 'text-amber-600',
        }
      : {
          icon: CheckCircle2,
          title: 'Inventario estable',
          text: 'No hay productos agotados ni alertas urgentes de stock.',
          panel: 'border-emerald-200 bg-emerald-50',
          iconColor: 'text-[var(--color-exito)]',
        };
  const Icon = estado.icon;
  const productosVisibles = stockBajo.slice(0, 3);

  return (
    <section className={`rounded-lg border p-5 ${estado.panel}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${estado.iconColor}`} />
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Prioridad de hoy</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--color-texto)]">{estado.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-texto)]">{estado.text}</p>
        </div>
      </div>

      {productosVisibles.length > 0 && (
        <div className="mt-4 space-y-2">
          {productosVisibles.map((producto) => (
            <div key={producto.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2">
              <span className="min-w-0 truncate text-sm font-medium text-[var(--color-texto)]">
                {producto.nombre}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-alerta)]">
                {producto.stock} disp.
              </span>
            </div>
          ))}
        </div>
      )}

      <Button className="mt-4 h-10 w-full" variant="secundario" onClick={onInventario}>
        Ver inventario <ChevronRight className="h-4 w-4" />
      </Button>
    </section>
  );
}

function WeeklySalesChart({ data }) {
  const hayDatos = data.some((item) => Number(item.ingresos) > 0);

  return (
    <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[var(--color-primario)]" />
            <h2 className="text-lg font-bold text-[var(--color-texto)]">Ingresos de los ultimos 7 dias</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
            Barras simples para comparar el ritmo de venta por dia.
          </p>
        </div>
      </div>

      <div className="mt-5 h-72">
        {hayDatos ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(92, 109, 124, 0.14)" />
              <XAxis
                dataKey="dia"
                tick={{ fill: '#5C6D7C', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                textAnchor="middle"
              />
              <YAxis
                width={48}
                tick={{ fill: '#5C6D7C', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatearMonedaCorta}
              />
              <Tooltip cursor={{ fill: 'rgba(92, 109, 124, 0.08)' }} content={<TooltipDashboard />} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#5C6D7C" radius={[6, 6, 0, 0]} maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-fondo)]/45 text-sm text-[var(--color-texto-sec)]">
            Todavia no hay ventas para graficar esta semana.
          </div>
        )}
      </div>
    </section>
  );
}

function LatestSales({ ventas, onVentas }) {
  return (
    <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-texto)]">Ultimas ventas</h2>
          <p className="text-sm text-[var(--color-texto-sec)]">Registro reciente para validar movimiento.</p>
        </div>
        <Button className="h-10" variant="secundario" onClick={onVentas}>
          Ver ventas
        </Button>
      </div>

      {!ventas.length ? (
        <div className="rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-fondo)]/45 py-8 text-center text-sm text-[var(--color-texto-sec)]">
          No hay ventas recientes.
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-borde)]">
          {ventas.map((venta) => (
            <div key={venta.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-texto)]">{venta.cliente}</p>
                <p className="text-xs capitalize text-[var(--color-texto-sec)]">
                  {venta.productos} prod. · {venta.metodo_pago}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--color-exito)]">
                {formatearMoneda(venta.total)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { datos, isLoading, error, refrescar } = useDashboard();
  const navigate = useNavigate();

  const fechaActual = useMemo(
    () => new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }),
    [],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Dashboard</h1>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg bg-[var(--color-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4 h-8 w-56 animate-pulse rounded bg-[var(--color-borde)]" />
            <div className="h-72 animate-pulse rounded bg-[var(--color-borde)]" />
          </div>
          <div className="rounded-lg bg-[var(--color-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4 h-8 w-36 animate-pulse rounded bg-[var(--color-borde)]" />
            <TableSkeleton columns={3} rows={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !datos) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-texto)]">Dashboard</h1>
        <div className="rounded-lg border border-red-200 bg-[var(--color-card)] p-10 text-center shadow-[var(--shadow-card)]">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[var(--color-alerta)]" />
          <p className="mb-4 text-[var(--color-texto)]">{error}</p>
          <Button className="h-10" onClick={refrescar}>
            <RefreshCw className="h-4 w-4" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const resumen = datos?.resumen || {};
  const ventasSemanales = datos?.ventasSemanales || [];
  const ultimasVentas = datos?.ultimasVentas || [];
  const stockBajo = datos?.stockBajo || [];
  const criticos = datos?.criticos || [];
  const totalSemana = ventasSemanales.reduce((total, item) => total + Number(item.ingresos || 0), 0);
  const mejorDia = ventasSemanales.reduce(
    (mayor, item) => (Number(item.ingresos || 0) > Number(mayor.ingresos || 0) ? item : mayor),
    { dia: 'sin datos', ingresos: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-[var(--color-texto-sec)]">{fechaActual}</p>
        </div>
        <Button className="h-10 self-start sm:self-auto" variant="secundario" onClick={refrescar}>
          <RefreshCw className="h-4 w-4" /> Actualizar datos
        </Button>
      </div>

      <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--color-texto-sec)]">Resultado de hoy</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <p className="text-4xl font-bold tabular-nums text-[var(--color-texto)]">
                {formatearMoneda(resumen.ingresos_dia)}
              </p>
              <p className="pb-1 text-sm text-[var(--color-texto-sec)]">
                en {formatearEntero(resumen.ventas_dia)} venta{resumen.ventas_dia === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--color-fondo)]/60 p-3">
            <div>
              <p className="text-xs text-[var(--color-texto-sec)]">Ticket prom.</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-texto)]">
                {formatearMoneda(resumen.ticket_promedio)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-texto-sec)]">Semana</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-texto)]">
                {formatearMoneda(totalSemana)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon={ShoppingCart}
          label="Ventas cerradas"
          value={formatearEntero(resumen.ventas_dia)}
          helper="Operaciones completadas hoy"
          onClick={() => navigate('/ventas')}
        />
        <MetricCard
          icon={Users}
          label="Clientes identificados"
          value={formatearEntero(resumen.clientes_atendidos)}
          helper="Clientes con registro asociado"
          tone="success"
          onClick={() => navigate('/clientes')}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Alertas de stock"
          value={formatearEntero(resumen.stock_bajo)}
          helper={criticos.length ? `${criticos.length} agotado${criticos.length === 1 ? '' : 's'}` : 'Sin agotados visibles'}
          tone={criticos.length ? 'danger' : resumen.stock_bajo ? 'warning' : 'success'}
          onClick={() => navigate('/inventario')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WeeklySalesChart data={ventasSemanales} />
        <div className="space-y-6">
          <PriorityPanel
            resumen={resumen}
            criticos={criticos}
            stockBajo={stockBajo}
            onInventario={() => navigate('/inventario')}
          />

          <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-primario)]" />
              <h2 className="text-lg font-bold text-[var(--color-texto)]">Lectura rapida</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-texto)]">
              <p className="flex items-start gap-2">
                <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-exito)]" />
                Mejor dia: <span className="font-semibold capitalize">{mejorDia.dia}</span> con {formatearMoneda(mejorDia.ingresos)}.
              </p>
              <p className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primario)]" />
                Vencimientos por revisar: <span className="font-semibold">{formatearEntero(resumen.vencimientos)}</span>.
              </p>
            </div>
          </section>
        </div>
      </div>

      <LatestSales ventas={ultimasVentas} onVentas={() => navigate('/ventas')} />
    </div>
  );
}
