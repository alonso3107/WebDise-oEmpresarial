// ============================================================
// BoticaVR - VentasPage
// Flujo de caja simple: buscar, agregar y cobrar sin distracciones.
// ============================================================

import { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  History,
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { useVentas } from '../hooks/useVentas';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { DatePicker } from '../../../components/ui/date-picker';

const formatoEntero = new Intl.NumberFormat('es-PE');
const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const formatearEntero = (valor = 0) => formatoEntero.format(Number(valor || 0));
const formatearMoneda = (valor = 0) => formatoMoneda.format(Number(valor || 0));

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primario)]/10 text-[var(--color-primario)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-texto-sec)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--color-texto)]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-texto-sec)]">{helper}</p>
        </div>
      </div>
    </article>
  );
}

function ProductList({ productos, carrito, isLoading, busqueda, onAgregar }) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-lg bg-[var(--color-borde)]" />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-card)] px-6 py-12 text-center">
        <Package className="mx-auto mb-3 h-12 w-12 text-[var(--color-texto-sec)]/35" />
        <p className="font-semibold text-[var(--color-texto)]">
          {busqueda ? 'No encontramos ese producto' : 'No hay productos disponibles'}
        </p>
        <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
          {busqueda ? 'Prueba con otra palabra o revisa inventario.' : 'Agrega productos en inventario para vender.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {productos.map((producto) => {
        const cantidadEnCarrito = carrito.find((item) => item.id === producto.id)?.cantidad || 0;
        const sinStock = Number(producto.stock || 0) <= 0;

        return (
          <article
            key={producto.id}
            className={`rounded-lg border bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)] ${sinStock ? 'border-red-100 opacity-70' : 'border-[var(--color-borde)]'}`}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_140px_120px] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-bold text-[var(--color-texto)]">{producto.nombre}</h3>
                  {cantidadEnCarrito > 0 && <Badge variant="info">{cantidadEnCarrito} en carrito</Badge>}
                </div>
                <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
                  {producto.categoria || 'Sin categoria'} - Stock {producto.stock}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Precio</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-exito)]">
                  {formatearMoneda(producto.precio_venta)}
                </p>
              </div>

              <Button
                className="h-11 w-full"
                onClick={() => onAgregar(producto)}
                disabled={sinStock}
              >
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function CartPanel({
  carrito,
  totales,
  clientes,
  cliente,
  setCliente,
  metodoPago,
  setMetodoPago,
  cambiarCantidad,
  quitarDelCarrito,
  registrarVenta,
  isRegistrando,
}) {
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: Banknote },
    { value: 'yape', label: 'Yape', icon: Wallet },
    { value: 'plin', label: 'Plin', icon: Wallet },
  ];

  return (
    <aside className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] xl:sticky xl:top-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-texto)]">Venta actual</h2>
          <p className="text-sm text-[var(--color-texto-sec)]">
            {formatearEntero(carrito.length)} producto{carrito.length === 1 ? '' : 's'} seleccionado{carrito.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primario)]/10 text-[var(--color-primario)]">
          <ShoppingCart className="h-5 w-5" />
        </div>
      </div>

      {carrito.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-fondo)]/45 px-4 py-8 text-center">
          <Receipt className="mx-auto mb-3 h-10 w-10 text-[var(--color-texto-sec)]/35" />
          <p className="text-sm font-medium text-[var(--color-texto)]">Agrega productos para cobrar</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-texto-sec)]">El total y el metodo de pago apareceran aqui.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 max-h-[300px] space-y-3 overflow-y-auto pr-1">
            {carrito.map((item) => (
              <article key={item.id} className="rounded-lg bg-[var(--color-fondo)]/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-texto)]">{item.nombre}</p>
                    <p className="mt-1 text-xs text-[var(--color-texto-sec)]">
                      {formatearMoneda(item.precio_venta)} c/u
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarDelCarrito(item.id)}
                    aria-label={`Quitar ${item.nombre}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-texto-sec)] transition-colors duration-200 hover:bg-red-50 hover:text-[var(--color-alerta)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-alerta)]/25"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                      aria-label={`Restar ${item.nombre}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] text-[var(--color-texto)]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-[var(--color-texto)]">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                      aria-label={`Sumar ${item.nombre}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] text-[var(--color-texto)]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-[var(--color-texto)]">
                    {formatearMoneda(item.precio_venta * item.cantidad)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 space-y-3 rounded-lg border border-[var(--color-borde)] bg-white/70 p-4">
            <label className="block text-sm font-semibold text-[var(--color-texto)]" htmlFor="cliente-venta">
              Cliente
            </label>
            <select
              id="cliente-venta"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] px-3 text-sm text-[var(--color-texto)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
            >
              <option value="">Cliente general</option>
              {clientes.map((item) => <option key={item.id} value={item.id}>{item.nombre} - DNI {item.dni}</option>)}
            </select>

            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--color-texto)]">Metodo de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {metodosPago.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMetodoPago(value)}
                    className={`flex h-12 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-primario)]/25 ${metodoPago === value ? 'border-[var(--color-primario)] bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto-sec)] hover:border-[var(--color-primario)]'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-[var(--color-borde)] pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-texto-sec)]">Subtotal</span>
              <span className="tabular-nums text-[var(--color-texto)]">{formatearMoneda(totales.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-texto-sec)]">IGV incluido</span>
              <span className="tabular-nums text-[var(--color-texto)]">{formatearMoneda(totales.igv)}</span>
            </div>
            <div className="flex items-end justify-between pt-2">
              <span className="text-sm font-semibold text-[var(--color-texto)]">Total</span>
              <span className="text-3xl font-bold tabular-nums text-[var(--color-exito)]">{formatearMoneda(totales.total)}</span>
            </div>
          </div>

          <Button className="mt-5 h-12 w-full text-base" variant="exito" onClick={registrarVenta} disabled={isRegistrando}>
            <CheckCircle2 className="h-5 w-5" /> Cobrar venta
          </Button>
        </>
      )}
    </aside>
  );
}

function HistoryPanel({ historial, filtroDesde, setFiltroDesde, filtroHasta, setFiltroHasta }) {
  const totalHistorial = historial.reduce((total, venta) => total + Number(venta.total || 0), 0);
  const limpiarFechas = () => {
    setFiltroDesde('');
    setFiltroHasta('');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-center">
          <DatePicker value={filtroDesde} onChange={setFiltroDesde} placeholder="Desde" className="h-11 text-sm" />
          <DatePicker value={filtroHasta} onChange={setFiltroHasta} placeholder="Hasta" className="h-11 text-sm" />
          {(filtroDesde || filtroHasta) && (
            <Button className="h-11" variant="secundario" onClick={limpiarFechas}>
              <X className="h-4 w-4" /> Limpiar
            </Button>
          )}
          <div className="rounded-lg bg-[var(--color-fondo)]/60 px-4 py-3 text-sm text-[var(--color-texto)]">
            <span className="font-bold">{formatearEntero(historial.length)}</span> ventas - {formatearMoneda(totalHistorial)}
          </div>
        </div>
      </section>

      {historial.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[var(--color-borde)] bg-[var(--color-card)] px-6 py-14 text-center">
          <Receipt className="mx-auto mb-4 h-14 w-14 text-[var(--color-texto-sec)]/35" />
          <h2 className="text-lg font-bold text-[var(--color-texto)]">No hay ventas en este rango</h2>
          <p className="mt-2 text-sm text-[var(--color-texto-sec)]">Cambia las fechas o registra una nueva venta.</p>
        </section>
      ) : (
        <section className="space-y-3">
          {historial.map((venta) => (
            <article key={venta.id} className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[110px_minmax(0,1fr)_120px_130px] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--color-texto-sec)]">Venta</p>
                  <p className="font-mono text-sm font-bold text-[var(--color-texto)]">#{venta.id}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--color-texto)]">{venta.cliente}</p>
                  <p className="mt-1 text-xs text-[var(--color-texto-sec)]">
                    {new Date(venta.fecha).toLocaleDateString('es-PE')} - {venta.productos} producto{venta.productos === 1 ? '' : 's'}
                  </p>
                </div>
                <Badge variant={venta.estado === 'completada' ? 'exito' : 'advertencia'} tamaño="md">
                  {venta.estado}
                </Badge>
                <div className="md:text-right">
                  <p className="text-xs capitalize text-[var(--color-texto-sec)]">{venta.metodo_pago}</p>
                  <p className="text-lg font-bold tabular-nums text-[var(--color-exito)]">{formatearMoneda(venta.total)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default function VentasPage() {
  const {
    productos,
    isLoadingProductos,
    busqueda,
    setBusqueda,
    carrito,
    agregarAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    totales,
    resumenVentas,
    metodoPago,
    setMetodoPago,
    cliente,
    setCliente,
    clientes,
    registrarVenta,
    isRegistrando,
    historial,
    filtroDesde,
    setFiltroDesde,
    filtroHasta,
    setFiltroHasta,
  } = useVentas();

  const [pestana, setPestana] = useState('nueva');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-texto)]">Ventas</h1>
          <p className="mt-1 text-sm text-[var(--color-texto-sec)]">
            Busca productos, arma el carrito y cobra en pocos pasos.
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-1 shadow-[var(--shadow-card)]">
          <button
            type="button"
            onClick={() => setPestana('nueva')}
            className={`flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-200 ${pestana === 'nueva' ? 'bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'text-[var(--color-texto-sec)] hover:text-[var(--color-texto)]'}`}
          >
            <Receipt className="h-4 w-4" /> Nueva venta
          </button>
          <button
            type="button"
            onClick={() => setPestana('historial')}
            className={`flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-200 ${pestana === 'historial' ? 'bg-[var(--color-primario)] text-[var(--color-fondo)]' : 'text-[var(--color-texto-sec)] hover:text-[var(--color-texto)]'}`}
          >
            <History className="h-4 w-4" /> Historial
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Receipt}
          label="Ventas de hoy"
          value={formatearEntero(resumenVentas.ventasHoy)}
          helper={formatearMoneda(resumenVentas.ingresosHoy)}
        />
        <SummaryCard
          icon={Package}
          label="Productos disponibles"
          value={formatearEntero(resumenVentas.productosDisponibles)}
          helper="Listos para vender"
        />
        <SummaryCard
          icon={ShoppingCart}
          label="En carrito"
          value={formatearEntero(resumenVentas.productosEnCarrito)}
          helper={formatearMoneda(totales.total)}
        />
      </section>

      {pestana === 'nueva' ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="space-y-4">
            <div className="rounded-lg border border-[var(--color-borde)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-texto-sec)]" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar producto o categoria"
                  className="h-11 w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] pl-10 pr-4 text-sm text-[var(--color-texto)] transition-shadow duration-200 placeholder:text-[var(--color-texto-sec)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
                />
              </div>
            </div>

            <ProductList
              productos={productos}
              carrito={carrito}
              isLoading={isLoadingProductos}
              busqueda={busqueda}
              onAgregar={agregarAlCarrito}
            />
          </section>

          <CartPanel
            carrito={carrito}
            totales={totales}
            clientes={clientes}
            cliente={cliente}
            setCliente={setCliente}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            cambiarCantidad={cambiarCantidad}
            quitarDelCarrito={quitarDelCarrito}
            registrarVenta={registrarVenta}
            isRegistrando={isRegistrando}
          />
        </div>
      ) : (
        <HistoryPanel
          historial={historial}
          filtroDesde={filtroDesde}
          setFiltroDesde={setFiltroDesde}
          filtroHasta={filtroHasta}
          setFiltroHasta={setFiltroHasta}
        />
      )}
    </div>
  );
}
