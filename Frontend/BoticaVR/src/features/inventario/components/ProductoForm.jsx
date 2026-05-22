// ============================================================
// BoticaVR — ProductoForm
// Formulario dentro del modal para crear/editar productos.
// ============================================================

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

/**
 * Formulario de producto (crear/editar).
 * 
 * @param {object} producto — Datos existentes (null si es creación)
 * @param {function} onGuardar — Callback con los datos del formulario
 * @param {function} onCancelar — Cierra el modal
 * @param {boolean} isSaving — true mientras se guarda
 */
export default function ProductoForm({ producto, onGuardar, onCancelar, isSaving }) {
  const esEdicion = !!producto;

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [stock, setStock] = useState(0);
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [errorLocal, setErrorLocal] = useState('');

  // Rellenar campos si es edición
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || '');
      setCategoria(producto.categoria || '');
      setStock(producto.stock ?? 0);
      setPrecioCompra(producto.precio_compra?.toString() || '');
      setPrecioVenta(producto.precio_venta?.toString() || '');
      setFechaVencimiento(producto.fecha_vencimiento?.slice(0, 10) || '');
    }
  }, [producto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!nombre.trim()) { setErrorLocal('El nombre es obligatorio'); return; }
    if (!categoria.trim()) { setErrorLocal('La categoría es obligatoria'); return; }
    if (!precioVenta || parseFloat(precioVenta) <= 0) { setErrorLocal('El precio de venta debe ser mayor a 0'); return; }

    onGuardar({
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      stock: parseInt(stock) || 0,
      precio_compra: parseFloat(precioCompra) || 0,
      precio_venta: parseFloat(precioVenta),
      fecha_vencimiento: fechaVencimiento || null,
    });
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent transition-shadow duration-300 placeholder:text-[var(--color-texto-sec)] placeholder:font-light placeholder:italic disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[var(--color-card)] rounded-2xl shadow-xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-borde)]">
          <h2 className="text-lg font-semibold text-[var(--color-texto)]">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button
            onClick={onCancelar}
            className="p-1.5 rounded-lg text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorLocal && (
            <p className="text-sm text-[var(--color-alerta)] bg-red-50 border border-red-200 rounded-lg p-3 font-medium">
              {errorLocal}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Nombre *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Paracetamol 500mg" className={inputClass} disabled={isSaving} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Categoría *</label>
              <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: Analgésico" className={inputClass} disabled={isSaving} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Stock</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} disabled={isSaving} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Precio compra (S/)</label>
              <input type="number" step="0.01" min="0" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} placeholder="0.00" className={inputClass} disabled={isSaving} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Precio venta (S/) *</label>
              <input type="number" step="0.01" min="0" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="0.00" className={inputClass} disabled={isSaving} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-texto)] mb-1">Fecha de vencimiento</label>
              <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className={inputClass} disabled={isSaving} />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borde)]">
            <button
              type="button"
              onClick={onCancelar}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-texto-sec)] hover:bg-[var(--color-fondo)] transition-colors duration-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primario)] text-[var(--color-fondo)] text-sm font-medium hover:bg-[var(--color-primario-hover)] transition-colors duration-300 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {esEdicion ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
