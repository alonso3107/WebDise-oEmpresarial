// ============================================================
// BoticaVR — Input
// Campo de texto reutilizable con label, error y variantes.
// ⚠️ SIN CSS transitions (regla del proyecto).
// ============================================================

import { forwardRef } from 'react';

/**
 * @param {string} label — Etiqueta superior
 * @param {string} error — Mensaje de error (aparece debajo en rojo)
 * @param {string} hint — Texto de ayuda (debajo, gris)
 * @param {string} icon — Nombre del ícono Lucide (opcional)
 * @param {boolean} fullWidth — Ancho completo (default true)
 */

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-texto)] mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-texto-sec)]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl
            border ${error ? 'border-[var(--color-alerta)] focus:ring-[var(--color-alerta)]' : 'border-[var(--color-borde)] focus:ring-[var(--color-primario)]'}
            bg-[var(--color-fondo)] text-[var(--color-texto)]
            placeholder:text-[var(--color-texto-sec)] placeholder:font-light placeholder:italic
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-[var(--color-alerta)] font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[var(--color-texto-sec)] font-light italic">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
