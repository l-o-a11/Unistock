/**
 * Cliente API Real para Categorías de Producto
 * Conecta con el backend en http://localhost:3020/api/product-categories
 *
 * Nota: El backend retorna:
 *  - GET /product-categories -> { success: true, data: [{ id, nombre, descripcion, ... }] }
 */

import { httpRequest } from "../../shared/utils/httpClient";

const PRODUCT_CATEGORIES_ENDPOINT = "/product-categories";

const unwrapResponse = (response) => {
  if (!response) return response;
  return (
    response.product_categories ??
    response.product_category ??
    response.productCategories ??
    response.productCategory ??
    response.categories ??
    response.categorias ??
    response.data?.product_categories ??
    response.data?.product_category ??
    response.data?.productCategories ??
    response.data?.productCategory ??
    response.data?.categories ??
    response.data?.categorias ??
    response.data?.data ??
    response.data ??
    response
  );
};

const toUiCategory = (raw) => {
  if (!raw) return raw;
  const now = new Date().toISOString().split("T")[0];
  const description =
    raw.descripcion ??
    raw.descripción ??
    raw.description ??
    raw.descripcion_categoria ??
    "";
  const name =
    raw.nombre ??
    raw.name ??
    raw.categoryName ??
    raw.nombre_categoria ??
    "";

  return {
    id:              raw.id ?? raw._id ?? raw.id_categoria_producto ?? raw.id_categorias,
    _id:             raw._id,
    name,
    nombre:          name,
    descripcion:     description,
    description,
    productCount:    raw.cantidad_productos ?? raw.productCount ?? raw.product_count ?? raw.products_count ?? 0,
    createdAt:       raw.createdAt   ?? raw.created_at    ?? raw.fecha_creacion    ?? now,
    updatedAt:       raw.updatedAt   ?? raw.updated_at    ?? raw.fecha_actualizacion ?? now,
  };
};

const buildCategoryPayloads = (data) => {
  if (!data) return { nombre: "", descripcion: "" };
  
  // El formulario envía { nombre, descripcion } - ENVIAR EXACTO
  return {
    nombre: data.nombre || "",
    descripcion: data.descripcion || ""
  };
};

const sendCategoryRequest = async (endpoint, method, data) => {
  const payload = buildCategoryPayloads(data);
  
  console.log('📤 [API] Enviando payload:', JSON.stringify(payload));
  
  return await httpRequest(endpoint, { method, body: payload });
};

export const productCategoryAPI = {
  getAll: async () => {
    const response = await httpRequest(PRODUCT_CATEGORIES_ENDPOINT, { method: "GET" });
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data.map(toUiCategory) : [];
  },

  getById: async (id) => {
    const response = await httpRequest(`${PRODUCT_CATEGORIES_ENDPOINT}/${id}`, { method: "GET" });
    const data = unwrapResponse(response);
    return toUiCategory(data);
  },

  create: async (productCategoryData) => {
    const response = await sendCategoryRequest(PRODUCT_CATEGORIES_ENDPOINT, "POST", productCategoryData);
    const data = unwrapResponse(response);
    return toUiCategory(data);
  },

  update: async (id, updatedData) => {
    const response = await sendCategoryRequest(`${PRODUCT_CATEGORIES_ENDPOINT}/${id}`, "PUT", updatedData);
    const data = unwrapResponse(response);
    return toUiCategory(data);
  },

  delete: async (id) => {
    const response = await httpRequest(`${PRODUCT_CATEGORIES_ENDPOINT}/${id}`, { method: "DELETE" });
    return unwrapResponse(response);
  },
};