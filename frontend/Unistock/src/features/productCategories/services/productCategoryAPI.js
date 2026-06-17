/**
 * Cliente API Real para Categorías de Producto
 * Conecta con el backend en http://localhost:3000/api/product-categories
 *
 * Nota: El backend documenta categorías como:
 *  - GET /product-categories -> [{ id, name }]
 * Para mantener compatibilidad con la UI actual, normalizamos campos faltantes
 * (description, productCount, createdAt, updatedAt) con valores por defecto.
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
  return {
    id:           raw.id ?? raw._id ?? raw.id_categoria_producto ?? raw.id_categorias,
    _id:          raw._id,
    name:         raw.name        ?? raw.nombre        ?? raw.categoryName ?? raw.nombre_categoria ?? "",
    description:  raw.description ?? raw.descripcion   ?? raw["descripción"] ?? raw.descripcion_categoria ?? "",
    productCount: raw.productCount ?? raw.product_count ?? raw.products_count ?? raw.cantidad_productos ?? raw.total_products ?? 0,
    createdAt:    raw.createdAt   ?? raw.created_at    ?? raw.fecha_creacion    ?? now,
    updatedAt:    raw.updatedAt   ?? raw.updated_at    ?? raw.fecha_actualizacion ?? now,
  };
};

const buildCategoryPayloads = (data) => {
  if (!data) return [{}];
  const name        = data.name        ?? data.nombre     ?? "";
  const description = data.description ?? data.descripcion ?? "";

  // ✅ Payload correcto primero — el backend espera "nombre" y "descripcion"
  return [
    { nombre: name, descripcion: description },
    { nombre: name, description:  description },
    { name,         descripcion:  description },
    { name,         description:  description },
  ];
};

const sendWithPayloadFallback = async (endpoint, method, data) => {
  const payloads = buildCategoryPayloads(data);
  let lastError;
  for (const payload of payloads) {
    try {
      return await httpRequest(endpoint, { method, body: payload });
    } catch (error) {
      lastError = error;
      if (![400, 422].includes(error?.status)) throw error;
    }
  }
  throw lastError;
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
    const response = await sendWithPayloadFallback(PRODUCT_CATEGORIES_ENDPOINT, "POST", productCategoryData);
    const data = unwrapResponse(response);
    return toUiCategory(data);
  },

  update: async (id, updatedData) => {
    const response = await sendWithPayloadFallback(`${PRODUCT_CATEGORIES_ENDPOINT}/${id}`, "PUT", updatedData);
    const data = unwrapResponse(response);
    return toUiCategory(data);
  },

  delete: async (id) => {
    const response = await httpRequest(`${PRODUCT_CATEGORIES_ENDPOINT}/${id}`, { method: "DELETE" });
    return unwrapResponse(response);
  },
};