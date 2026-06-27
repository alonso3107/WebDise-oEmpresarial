// ============================================================
// BoticaVR — ProductoForm
// Modal de crear/editar producto. Usa componentes UI reutilizables.
// ============================================================

import { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';

export default function ProductoForm({ producto, onGuardar, onCancelar, isSaving }) {
  const esEdicion = !!producto;

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [categoria, setCategoria] = useState(producto?.categoria || '');
  const [stock, setStock] = useState(producto?.stock ?? 0);
  const [precioVenta, setPrecioVenta] = useState(producto?.precio_venta?.toString() || '');
  const [fechaVencimiento, setFechaVencimiento] = useState(producto?.fecha_vencimiento?.slice(0, 10) || '');
  const [errorLocal, setErrorLocal] = useState('');

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
      precio_venta: parseFloat(precioVenta),
      fecha_vencimiento: fechaVencimiento || null,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancelar}
      title={esEdicion ? 'Editar producto' : 'Nuevo producto'}
      tamaño="lg"
      footer={
        <>
          <Button variant="secundario" onClick={onCancelar} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            <Save className="w-4 h-4" /> {esEdicion ? 'Actualizar' : 'Crear'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorLocal && (
          <p className="text-sm text-[var(--color-alerta)] bg-red-50 border border-red-200 rounded-lg p-3">{errorLocal}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Nombre *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Paracetamol 500mg" disabled={isSaving} autoFocus />
          </div>

          <Input label="Categoría *" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: Analgésico" disabled={isSaving} />

          <Input label="Stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} disabled={isSaving} />

          <Input label="Precio venta (S/) *" type="number" step="0.01" min="0" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="0.00" disabled={isSaving} />

          <div className="sm:col-span-2">
            <Input label="Fecha de vencimiento" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} disabled={isSaving} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
