// ============================================================
// BoticaVR — Inventario API
// Adaptador entre el modelo del inventario en la UI y la API de productos.
// ============================================================

import apiClient from './axiosConfig';

/**
 * Obtiene todos los productos del inventario.
 * 
 * @returns {Promise<Array>} Lista de productos
 */
export async function obtenerProductos() {
  const [productosResponse, categoriasResponse] = await Promise.all([
    apiClient.get('/productos/'),
    apiClient.get('/categorias/'),
  ]);
  const categorias = new Map(categoriasResponse.data.map((categoria) => [categoria.id, categoria.nombre]));
  return productosResponse.data.map((producto) => mapearProducto(producto, categorias));
}

/**
 * Obtiene un producto por su ID.
 * 
 * @param {number} id — ID del producto
 * @returns {Promise<object>} Datos del producto
 */
export async function obtenerProducto(id) {
  const [productoResponse, categoriasResponse] = await Promise.all([
    apiClient.get(`/productos/${id}`),
    apiClient.get('/categorias/'),
  ]);
  const categorias = new Map(categoriasResponse.data.map((categoria) => [categoria.id, categoria.nombre]));
  return mapearProducto(productoResponse.data, categorias);
}

/**
 * Crea un nuevo producto en el inventario.
 * 
 * @param {object} producto — Datos del producto (según schema ItemCreate)
 * @returns {Promise<object>} Producto creado
 */
export async function crearProducto(producto) {
  const payload = await mapearPayloadProducto(producto);
  const response = await apiClient.post('/productos/', payload);
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
  const payload = await mapearPayloadProducto(producto);
  const response = await apiClient.put(`/productos/${id}`, payload);
  return response.data;
}

/**
 * Elimina un producto del inventario.
 * 
 * @param {number} id — ID del producto
 * @returns {Promise<void>}
 */
export async function eliminarProducto(id) {
  const response = await apiClient.delete(`/productos/${id}`);
  return response.data;
}

function mapearProducto(producto, categorias) {
  return {
    ...producto,
    categoria: categorias.get(producto.categoria_id) || 'Sin categoría',
    precio_venta: producto.precio,
  };
}

async function obtenerOCrearCategoria(nombre) {
  const nombreNormalizado = nombre.trim();
  const { data: categorias } = await apiClient.get('/categorias/');
  const existente = categorias.find(
    (categoria) => categoria.nombre.toLocaleLowerCase('es') === nombreNormalizado.toLocaleLowerCase('es'),
  );
  if (existente) return existente.id;

  try {
    const { data } = await apiClient.post('/categorias/', { nombre: nombreNormalizado });
    return data.id;
  } catch (error) {
    // Otra petición pudo crearla entre el GET y el POST.
    if (error.response?.status !== 400) throw error;
    const { data: actualizadas } = await apiClient.get('/categorias/');
    const creada = actualizadas.find(
      (categoria) => categoria.nombre.toLocaleLowerCase('es') === nombreNormalizado.toLocaleLowerCase('es'),
    );
    if (!creada) throw error;
    return creada.id;
  }
}

async function mapearPayloadProducto(producto) {
  const categoria_id = producto.categoria?.trim()
    ? await obtenerOCrearCategoria(producto.categoria)
    : null;

  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion || null,
    precio: Number(producto.precio_venta),
    stock: Number(producto.stock) || 0,
    codigo_barras: producto.codigo_barras || null,
    fecha_vencimiento: producto.fecha_vencimiento || null,
    stock_minimo: Number(producto.stock_minimo) || 5,
    categoria_id,
    proveedor_id: producto.proveedor_id || null,
  };
}
