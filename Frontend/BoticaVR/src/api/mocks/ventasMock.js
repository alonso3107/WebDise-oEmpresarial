// ============================================================
// BoticaVR — Ventas Mock
// Datos simulados para el módulo de ventas.
// ⚠️ MOCK — será reemplazado cuando el backend implemente /api/v1/ventas/
// ============================================================

/** Productos de ejemplo para el dashboard y carrito */
export const productosEjemplo = [
  { id: 1, nombre: 'Paracetamol 500mg', categoria: 'Analgésico', stock: 45, precio_compra: 2.50, precio_venta: 5.00, fecha_vencimiento: '2027-06-15' },
  { id: 2, nombre: 'Ibuprofeno 400mg', categoria: 'Antiinflamatorio', stock: 3, precio_compra: 3.00, precio_venta: 6.50, fecha_vencimiento: '2026-08-20' },
  { id: 3, nombre: 'Amoxicilina 500mg', categoria: 'Antibiótico', stock: 0, precio_compra: 4.50, precio_venta: 9.00, fecha_vencimiento: '2026-04-10' },
  { id: 4, nombre: 'Loratadina 10mg', categoria: 'Antialérgico', stock: 28, precio_compra: 1.80, precio_venta: 4.00, fecha_vencimiento: '2027-03-01' },
  { id: 5, nombre: 'Omeprazol 20mg', categoria: 'Antiácido', stock: 2, precio_compra: 2.20, precio_venta: 5.50, fecha_vencimiento: '2026-06-30' },
  { id: 6, nombre: 'Vitamina C 1g', categoria: 'Suplemento', stock: 60, precio_compra: 1.50, precio_venta: 3.50, fecha_vencimiento: '2027-12-01' },
  { id: 7, nombre: 'Diclofenaco 50mg', categoria: 'Antiinflamatorio', stock: 12, precio_compra: 2.80, precio_venta: 6.00, fecha_vencimiento: '2027-01-15' },
  { id: 8, nombre: 'Metformina 850mg', categoria: 'Antidiabético', stock: 1, precio_compra: 3.50, precio_venta: 7.50, fecha_vencimiento: '2026-05-20' },
];

/** Ventas recientes de ejemplo */
export const ventasEjemplo = [
  { id: 1001, fecha: '2026-05-22', cliente: 'María López', total: 45.50, productos: 3, metodo_pago: 'Efectivo' },
  { id: 1002, fecha: '2026-05-22', cliente: 'Carlos Ruiz', total: 78.00, productos: 5, metodo_pago: 'Tarjeta' },
  { id: 1003, fecha: '2026-05-22', cliente: 'Ana García', total: 22.00, productos: 2, metodo_pago: 'Efectivo' },
  { id: 1004, fecha: '2026-05-21', cliente: 'Pedro Sánchez', total: 120.50, productos: 7, metodo_pago: 'Tarjeta' },
  { id: 1005, fecha: '2026-05-21', cliente: 'Lucía Vargas', total: 15.00, productos: 1, metodo_pago: 'Efectivo' },
];

/** Datos para gráfica semanal (ventas por día) */
export const ventasSemanales = [
  { dia: 'Lun', ventas: 320.00, transacciones: 5 },
  { dia: 'Mar', ventas: 280.00, transacciones: 4 },
  { dia: 'Mié', ventas: 450.00, transacciones: 7 },
  { dia: 'Jue', ventas: 390.00, transacciones: 6 },
  { dia: 'Vie', ventas: 510.00, transacciones: 8 },
  { dia: 'Sáb', ventas: 620.00, transacciones: 10 },
  { dia: 'Dom', ventas: 180.00, transacciones: 3 },
];

/** Resumen del día (mock) */
export const resumenDelDia = {
  ventas_dia: 8,
  ingresos_dia: 545.50,
  clientes_atendidos: 8,
  stock_bajo: 4,
};
