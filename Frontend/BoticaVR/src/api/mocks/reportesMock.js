// ============================================================
// BoticaVR — Reportes Mock
// ⚠️ MOCK — reemplazar con endpoints reales del backend.
// ============================================================

/** Ventas mensuales para gráfica de barras */
export const ventasMensuales = [
  { mes: 'Ene', ingresos: 4200, ventas: 85 },
  { mes: 'Feb', ingresos: 3800, ventas: 72 },
  { mes: 'Mar', ingresos: 5100, ventas: 98 },
  { mes: 'Abr', ingresos: 4600, ventas: 90 },
  { mes: 'May', ingresos: 5450, ventas: 105 },
];

/** Productos más vendidos */
export const productosMasVendidos = [
  { nombre: 'Paracetamol 500mg', cantidad: 145, ingresos: 725.00 },
  { nombre: 'Ibuprofeno 400mg', cantidad: 98, ingresos: 637.00 },
  { nombre: 'Vitamina C 1g', cantidad: 87, ingresos: 304.50 },
  { nombre: 'Loratadina 10mg', cantidad: 72, ingresos: 288.00 },
  { nombre: 'Omeprazol 20mg', cantidad: 65, ingresos: 357.50 },
  { nombre: 'Diclofenaco 50mg', cantidad: 54, ingresos: 324.00 },
  { nombre: 'Amoxicilina 500mg', cantidad: 43, ingresos: 387.00 },
  { nombre: 'Metformina 850mg', cantidad: 31, ingresos: 232.50 },
];

/** Ingresos por categoría */
export const ingresosPorCategoria = [
  { categoria: 'Analgésico', ingresos: 1050.00 },
  { categoria: 'Antiinflamatorio', ingresos: 961.00 },
  { categoria: 'Suplemento', ingresos: 304.50 },
  { categoria: 'Antialérgico', ingresos: 288.00 },
  { categoria: 'Antibiótico', ingresos: 387.00 },
  { categoria: 'Antiácido', ingresos: 357.50 },
  { categoria: 'Antidiabético', ingresos: 232.50 },
];

/** Totales del período */
export const resumenPeriodo = {
  ingresos_totales: 5450.00,
  ventas_totales: 105,
  ticket_promedio: 51.90,
  producto_top: 'Paracetamol 500mg',
};
