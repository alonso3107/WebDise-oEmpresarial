// ============================================================
// BoticaVR — Button
// Botón reutilizable con variantes: primario, secundario,
// peligro, éxito, fantasma. Hover sutil (max scale 1.02).
// ============================================================

import { forwardRef } from 'react';

/**
 * Variantes disponibles:
 * - primario: fondo Blue Mirage, texto claro
 * - secundario: fondo claro, borde, texto oscuro
 * - peligro: fondo rojo
 * - exito: fondo verde
 * - fantasma: sin fondo, solo texto
 *
 * @param {'sm'|'md'|'lg'} tamaño — Tamaño del botón
 * @param {boolean} isLoading — Muestra spinner
 * @param {boolean} fullWidth — Ocupa todo el ancho
 * @param {string} className — Clases adicionales
 */

const variantes = {
  primario: 'bg-[var(--color-primario)] text-[var(--color-fondo)] hover:bg-[var(--color-primario-hover)] focus:ring-[var(--color-primario)]',
  secundario: 'bg-[var(--color-card)] text-[var(--color-texto)] border border-[var(--color-borde)] hover:bg-[var(--color-fondo)] hover:border-[var(--color-primario)] focus:ring-[var(--color-primario)]',
  peligro: 'bg-[var(--color-alerta)] text-white hover:bg-red-700 focus:ring-[var(--color-alerta)]',
  exito: 'bg-[var(--color-exito)] text-white hover:bg-emerald-600 focus:ring-[var(--color-exito)]',
  fantasma: 'bg-transparent text-[var(--color-texto-sec)] hover:text-[var(--color-texto)] hover:bg-[var(--color-fondo)] focus:ring-[var(--color-primario)]',
};

const tamanos = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const Button = forwardRef(({
  children,
  variant = 'primario',
  tamaño = 'md',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-500
        hover:scale-[1.02]
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variantes[variant] || variantes.primario}
        ${tamanos[tamaño] || tamanos.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
