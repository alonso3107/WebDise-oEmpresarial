// ============================================================
// BoticaVR — Skeleton
// Placeholders animados para estados de carga.
// ============================================================

/**
 * Variantes predefinidas para casos comunes.
 *
 * Uso:
 *   <Skeleton className="h-8 w-40" />           → personalizado
 *   <Skeleton variant="text" />                  → línea de texto
 *   <Skeleton variant="card" />                  → card completa
 *   <Skeleton variant="table-row" />             → fila de tabla
 *   <Skeleton variant="circle" />                → círculo (avatar)
 */

const variants = {
  text: 'h-4 w-full rounded',
  'text-sm': 'h-3 w-3/4 rounded',
  title: 'h-6 w-1/3 rounded-lg',
  card: 'h-32 w-full rounded-2xl',
  'table-row': 'h-12 w-full rounded-xl',
  circle: 'h-10 w-10 rounded-full',
};

export default function Skeleton({ variant, className = '', count = 1 }) {
  const baseClass = variant ? (variants[variant] || variants.text) : '';
  const combined = `${baseClass} ${className}`.trim();

  if (count === 1) {
    return (
      <div className={`animate-pulse bg-[var(--color-borde)] ${combined}`} />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-[var(--color-borde)] ${combined}`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton de tabla completo (cabecera + filas).
 *
 * Uso: <TableSkeleton columns={4} rows={5} />
 */
export function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {/* Cabecera */}
      <div className="flex gap-4 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-[var(--color-borde)] rounded" style={{ flex: 1 }} />
        ))}
      </div>
      {/* Filas */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4">
          {Array.from({ length: columns }).map((_, col) => (
            <div key={col} className="h-10 bg-[var(--color-borde)] rounded-xl" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton de cards en grid.
 *
 * Uso: <CardSkeleton count={4} />
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-5 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-borde)]" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-[var(--color-borde)] rounded" />
            <div className="h-6 w-16 bg-[var(--color-borde)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
