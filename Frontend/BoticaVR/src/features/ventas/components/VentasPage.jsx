// ============================================================
// BoticaVR — VentasPage
// Nueva venta + Historial. Componentes UI reutilizables.
// ============================================================

import { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Receipt, History, Calendar, X, Package } from 'lucide-react';
import { useVentas } from '../hooks/useVentas';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { DatePicker } from '../../../components/ui/date-picker';

export default function VentasPage() {
  const {
    productos, isLoadingProductos,
    busqueda, setBusqueda,
    carrito, agregarAlCarrito, cambiarCantidad, quitarDelCarrito,
    totales,
    metodoPago, setMetodoPago,
    cliente, setCliente, clientes,
    registrarVenta, isRegistrando,
    historial,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
  } = useVentas();

  const [pestana, setPestana] = useState('nueva');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Ventas</h1>
          <p className="text-sm text-[var(--color-texto-sec)] font-light italic mt-1">Gestión de ventas y registro de transacciones</p>
        </div>
        <div className="flex bg-[var(--color-card)] rounded-xl shadow-[var(--shadow-card)] p-1">
          <button onClick={() => setPestana('nueva')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pestana === 'nueva' ? 'bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'text-[var(--color-texto-sec)] hover:text-[var(--color-texto)]'}`}>
            <Receipt className="w-4 h-4" /> Nueva venta
          </button>
          <button onClick={() => setPestana('historial')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pestana === 'historial' ? 'bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'text-[var(--color-texto-sec)] hover:text-[var(--color-texto)]'}`}>
            <History className="w-4 h-4" /> Historial
          </button>
        </div>
      </div>

      {pestana === 'nueva' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-texto-sec)]" />
              <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto por nombre o categoría..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--color-borde)] bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] focus:border-transparent transition-shadow duration-300 placeholder:font-light placeholder:italic" />
            </div>
            <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
              {isLoadingProductos ? (
                <div className="animate-pulse p-4 space-y-2">{[1,2,3,4].map((i) => <div key={i} className="h-14 bg-[var(--color-borde)] rounded-xl" />)}</div>
              ) : productos.length === 0 ? (
                <div className="text-center py-12"><Package className="w-12 h-12 text-[var(--color-texto-sec)]/30 mx-auto mb-3" /><p className="text-[var(--color-texto-sec)] font-light italic">{busqueda ? 'Sin resultados' : 'No hay productos en el inventario'}</p></div>
              ) : (
                <div className="divide-y divide-[var(--color-borde)] max-h-[500px] overflow-y-auto">
                  {productos.map((prod) => {
                    const enCarrito = carrito.find((item) => item.id === prod.id);
                    return (
                      <div key={prod.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-fondo)]/50 transition-colors duration-300">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[var(--color-texto)] truncate">{prod.nombre}</p>
                          <p className="text-xs text-[var(--color-texto-sec)] font-light italic">{prod.categoria} — Stock: {prod.stock}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-sm font-semibold text-[var(--color-exito)]">S/ {parseFloat(prod.precio_venta).toFixed(2)}</span>
                          <Button tamaño="sm" onClick={() => agregarAlCarrito(prod)} disabled={prod.stock <= 0}>
                            <Plus className="w-3.5 h-3.5" /> {enCarrito ? `(${enCarrito.cantidad})` : 'Agregar'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-[var(--color-primario)]" />
                <h2 className="font-semibold text-[var(--color-texto)]">Carrito ({carrito.length})</h2>
              </div>
              {carrito.length === 0 ? (
                <p className="text-sm text-[var(--color-texto-sec)] font-light italic text-center py-8">Agrega productos desde la lista</p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-fondo)]">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--color-texto)] truncate">{item.nombre}</p>
                        <p className="text-xs text-[var(--color-texto-sec)] font-light italic">S/ {parseFloat(item.precio_venta).toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} className="p-1 rounded-md text-[var(--color-texto-sec)] hover:bg-[var(--color-borde)] transition-colors duration-300"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} className="p-1 rounded-md text-[var(--color-texto-sec)] hover:bg-[var(--color-borde)] transition-colors duration-300"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => quitarDelCarrito(item.id)} className="p-1 rounded-md text-[var(--color-texto-sec)] hover:text-[var(--color-alerta)] hover:bg-red-50 transition-all duration-300 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {carrito.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--color-borde)] space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-[var(--color-texto-sec)]">Subtotal</span><span className="text-[var(--color-texto)]">S/ {totales.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[var(--color-texto-sec)]">IGV (18%)</span><span className="text-[var(--color-texto)]">S/ {totales.igv.toFixed(2)}</span></div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-[var(--color-borde)]"><span className="text-[var(--color-texto)]">Total</span><span className="text-[var(--color-exito)]">S/ {totales.total.toFixed(2)}</span></div>
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-5 space-y-4">
                <h3 className="font-semibold text-[var(--color-texto)] text-sm">Datos de la venta</h3>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-texto-sec)] mb-2">Cliente (opcional)</label>
                  <select value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-borde)] bg-[var(--color-fondo)] text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]">
                    <option value="">Cliente general</option>
                    {clientes.map((item) => <option key={item.id} value={item.id}>{item.nombre} — DNI {item.dni}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-texto-sec)] mb-2">Método de pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setMetodoPago('efectivo')} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${metodoPago === 'efectivo' ? 'bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'bg-[var(--color-fondo)] text-[var(--color-texto-sec)] border border-[var(--color-borde)] hover:border-[var(--color-primario)]'}`}><Banknote className="w-4 h-4" /> Efectivo</button>
                    <button onClick={() => setMetodoPago('tarjeta')} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${metodoPago === 'tarjeta' ? 'bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'bg-[var(--color-fondo)] text-[var(--color-texto-sec)] border border-[var(--color-borde)] hover:border-[var(--color-primario)]'}`}><CreditCard className="w-4 h-4" /> Tarjeta</button>
                  </div>
                </div>
                <Button variant="exito" fullWidth onClick={registrarVenta} isLoading={isRegistrando}>
                  <Receipt className="w-5 h-5" /> Registrar venta — S/ {totales.total.toFixed(2)}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {pestana === 'historial' && (
        <div className="space-y-4">
          <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2"><label className="text-sm text-[var(--color-texto-sec)]">Desde:</label><DatePicker value={filtroDesde} onChange={setFiltroDesde} placeholder="Seleccionar fecha" className="h-9 text-xs py-1" /></div>
              <div className="flex items-center gap-2"><label className="text-sm text-[var(--color-texto-sec)]">Hasta:</label><DatePicker value={filtroHasta} onChange={setFiltroHasta} placeholder="Seleccionar fecha" className="h-9 text-xs py-1" /></div>
              {(filtroDesde || filtroHasta) && <button onClick={() => { setFiltroDesde(''); setFiltroHasta(''); }} className="flex items-center gap-1 text-sm text-[var(--color-alerta)] hover:underline font-medium"><X className="w-4 h-4" /> Limpiar</button>}
              <span className="text-sm text-[var(--color-texto-sec)] font-light italic ml-auto">{historial.length} venta{historial.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="bg-[var(--color-card)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
            {historial.length === 0 ? (
              <div className="text-center py-16"><Receipt className="w-16 h-16 text-[var(--color-texto-sec)]/30 mx-auto mb-4" /><p className="text-[var(--color-texto-sec)] font-medium">{filtroDesde || filtroHasta ? 'Sin ventas en ese rango' : 'No hay ventas registradas'}</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-[var(--color-borde)]"><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">ID</th><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Fecha</th><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Cliente</th><th className="px-6 py-3.5 text-center text-xs font-medium text-[var(--color-texto-sec)] uppercase">Productos</th><th className="px-6 py-3.5 text-left text-xs font-medium text-[var(--color-texto-sec)] uppercase">Pago</th><th className="px-6 py-3.5 text-right text-xs font-medium text-[var(--color-texto-sec)] uppercase">Total</th></tr></thead>
                  <tbody>
                    {historial.map((venta) => (
                      <tr key={venta.id} className="border-b border-[var(--color-borde)] last:border-0 hover:bg-[var(--color-fondo)]/50 transition-colors duration-300">
                        <td className="px-6 py-3.5 text-sm text-[var(--color-texto-sec)] font-mono">#{venta.id}</td>
                        <td className="px-6 py-3.5 text-sm text-[var(--color-texto)]">{new Date(venta.fecha).toLocaleDateString('es-PE')}</td>
                        <td className="px-6 py-3.5 text-sm text-[var(--color-texto)]">{venta.cliente}</td>
                        <td className="px-6 py-3.5 text-sm text-center text-[var(--color-texto)]">{venta.productos}</td>
                        <td className="px-6 py-3.5 text-sm"><Badge variant={venta.metodo_pago === 'Tarjeta' ? 'info' : 'advertencia'}>{venta.metodo_pago}</Badge></td>
                        <td className="px-6 py-3.5 text-sm text-right font-semibold text-[var(--color-exito)]">S/ {venta.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
