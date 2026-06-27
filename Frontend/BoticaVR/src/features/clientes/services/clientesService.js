// ============================================================
// BoticaVR — Clientes Service
// Adaptador de clientes: mantiene a la UI desacoplada del contrato HTTP.
// ============================================================

import apiClient from '../../../api/axiosConfig';

const mapearCliente = (cliente) => ({
  ...cliente,
  nombre: `${cliente.nombres} ${cliente.apellidos}`.trim(),
});

const mapearVenta = (venta) => ({
  id: venta.id,
  fecha: venta.fecha_hora,
  total: venta.monto_total,
  productos: venta.cantidad_productos,
  metodo_pago: venta.metodo_pago,
});

const clientesService = {
  async listar() {
    const { data } = await apiClient.get('/clientes/');
    return data.map(mapearCliente);
  },

  async crear(datos) {
    const { data } = await apiClient.post('/clientes/', datos);
    return mapearCliente(data);
  },

  async actualizar(id, datos) {
    const camposEditables = {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      telefono: datos.telefono,
    };
    const { data } = await apiClient.put(`/clientes/${id}`, camposEditables);
    return mapearCliente(data);
  },

  async eliminar(id) {
    await apiClient.delete(`/clientes/${id}`);
  },

  async obtenerCompras(clienteId) {
    const { data } = await apiClient.get('/ventas/', { params: { cliente_id: clienteId, limit: 100 } });
    return data.map(mapearVenta);
  },
};

export default clientesService;
