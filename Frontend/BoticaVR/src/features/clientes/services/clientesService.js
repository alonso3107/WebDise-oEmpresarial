// ============================================================
// BoticaVR — Clientes Service
// ⚠️ MOCK — usa localStorage. Reemplazar con API real.
// ============================================================

import clientesMock from '../../../api/mocks/clientesMock';

const clientesService = {
  async listar() {
    return clientesMock.listar();
  },

  async crear(datos) {
    return clientesMock.crear(datos);
  },

  async actualizar(id, datos) {
    return clientesMock.actualizar(id, datos);
  },

  async eliminar(id) {
    return clientesMock.eliminar(id);
  },

  async obtenerCompras(clienteId) {
    return clientesMock.obtenerCompras(clienteId);
  },
};

export default clientesService;
