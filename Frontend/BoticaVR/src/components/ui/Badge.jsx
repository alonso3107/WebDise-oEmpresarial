// ============================================================
// BoticaVR — Badge
// Etiqueta de estado con variantes de color.
// ============================================================

/**
 * Variantes:
 * - exito (verde): stock normal, operación exitosa
 * - alerta (rojo): stock crítico, error
 * - advertencia (ámbar): stock bajo, pendiente
 * - info (azul): informativo
 * - neutro (gris): estado por defecto
 *
 * @param {'sm'|'md'} tamaño
 */

const variantes = {
  exito: 'bg-green-100 text-[var(--color-exito)] border-green-200',
  alerta: 'bg-red-100 text-[var(--color-alerta)] border-red-200',
  advertencia: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutro: 'bg-gray-100 text-[var(--color-texto-sec)] border-gray-200',
};

const tamanos = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({
  children,
  variant = 'neutro',
  tamaño = 'sm',
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${variantes[variant] || variantes.neutro}
        ${tamanos[tamaño] || tamanos.sm}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </span>
  );
}
