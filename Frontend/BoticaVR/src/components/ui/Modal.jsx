// ============================================================
// BoticaVR — Modal
// Ventana flotante con overlay, cabecera, cuerpo y footer.
// Cierra con Escape y click fuera.
// ============================================================

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * @param {boolean} isOpen — Controla visibilidad
 * @param {function} onClose — Callback al cerrar
 * @param {string} title — Título en la cabecera
 * @param {ReactNode} children — Contenido del cuerpo
 * @param {ReactNode} footer — Contenido del pie (botones)
 * @param {'sm'|'md'|'lg'} tamaño — Ancho máximo
 */

const tamanos = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  tamaño = 'md',
}) {
  // Cerrar con Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay — click fuera cierra */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenido */}
      <div className={`relative w-full ${tamanos[tamaño]} bg-[var(--color-card)] rounded-2xl shadow-xl overflow-hidden`}>
        {/* Cabecera */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-borde)]">
            <h2 className="text-lg font-semibold text-[var(--color-texto)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Cuerpo */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-borde)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
