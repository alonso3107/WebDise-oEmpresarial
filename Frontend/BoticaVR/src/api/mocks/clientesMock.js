// ============================================================
// BoticaVR — Clientes Mock
// Datos simulados y almacenamiento local.
// ⚠️ MOCK — reemplazar con /api/v1/clientes/ cuando exista.
// ============================================================

const CLIENTES_KEY = 'botica-clientes';

/** Clientes de ejemplo precargados */
const clientesIniciales = [
  { id: 1, nombre: 'María López García', dni: '12345678', telefono: '987654321', fecha_registro: '2026-01-15' },
  { id: 2, nombre: 'Carlos Ruiz Mendoza', dni: '23456789', telefono: '976543210', fecha_registro: '2026-02-20' },
  { id: 3, nombre: 'Ana García Torres', dni: '34567890', telefono: '965432109', fecha_registro: '2026-03-10' },
  { id: 4, nombre: 'Pedro Sánchez Díaz', dni: '45678901', telefono: '954321098', fecha_registro: '2026-04-05' },
];

/**
 * Servicio mock de clientes con persistencia en localStorage.
 */
const clientesMock = {
  /** Obtiene todos los clientes */
  listar() {
    const data = localStorage.getItem(CLIENTES_KEY);
    if (data) return JSON.parse(data);
    // Inicializar con datos de ejemplo
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientesIniciales));
    return [...clientesIniciales];
  },

  /** Crea un cliente nuevo */
  crear(datos) {
    const clientes = this.listar();
    const nuevo = {
      id: Date.now(),
      ...datos,
      fecha_registro: new Date().toISOString().slice(0, 10),
    };
    clientes.push(nuevo);
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
    return nuevo;
  },

  /** Actualiza un cliente existente */
  actualizar(id, datos) {
    const clientes = this.listar();
    const idx = clientes.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cliente no encontrado');
    clientes[idx] = { ...clientes[idx], ...datos };
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
    return clientes[idx];
  },

  /** Elimina un cliente */
  eliminar(id) {
    const clientes = this.listar();
    const filtrados = clientes.filter((c) => c.id !== id);
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(filtrados));
  },

  /** Busca el historial de compras de un cliente */
  obtenerCompras(clienteId) {
    const ventas = JSON.parse(localStorage.getItem('botica-ventas') || '[]');
    return ventas.filter((v) => v.clienteId === clienteId || v.cliente === clienteId);
  },
};

export default clientesMock;
