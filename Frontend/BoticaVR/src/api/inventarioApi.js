// ============================================================
// BoticaVR — Inventario API
// Llamadas HTTP a /api/v1/items/
// ============================================================

import apiClient from './axiosConfig';

/**
 * Obtiene todos los productos del inventario.
 * 
 * @returns {Promise<Array>} Lista de productos
 */
export async function obtenerProductos() {
  const response = await apiClient.get('/items/');
  return response.data;
}

/**
 * Obtiene un producto por su ID.
 * 
 * @param {number} id — ID del producto
 * @returns {Promise<object>} Datos del producto
 */
export async function obtenerProducto(id) {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
}

/**
 * Crea un nuevo producto en el inventario.
 * 
 * @param {object} producto — Datos del producto (según schema ItemCreate)
 * @returns {Promise<object>} Producto creado
 */
export async function crearProducto(producto) {
  const response = await apiClient.post('/items/', producto);
  return response.data;
}

/**
 * Actualiza un producto existente.
 * 
 * @param {number} id — ID del producto
 * @param {object} producto — Datos a actualizar
 * @returns {Promise<object>} Producto actualizado
 */
export async function actualizarProducto(id, producto) {
  const response = await apiClient.put(`/items/${id}`, producto);
  return response.data;
}

/**
 * Elimina un producto del inventario.
 * 
 * @param {number} id — ID del producto
 * @returns {Promise<void>}
 */
export async function eliminarProducto(id) {
  const response = await apiClient.delete(`/items/${id}`);
  return response.data;
}
