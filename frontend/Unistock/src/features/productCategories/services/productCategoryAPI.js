/**
 * Cliente API Real para Categorías de Producto
 * Conecta con el backend en http://localhost:3000/api/categories
 *
 * Nota: El backend documenta categorías como:
 *  - GET /categories -> [{ id, name }]
 * Para mantener compatibilidad con la UI actual, normalizamos campos faltantes
 * (description, productCount, createdAt, updatedAt) con valores por defecto.
 */

import { httpRequest } from "../../shared/utils/httpClient";

const toUiCategory = (raw) => {
  if (!raw) return raw;
  const now = new Date().toISOString().split("T")[0];
  return {
    id: raw.id,
    name: raw.name ?? raw.nombre ?? "",
    description: raw.description ?? raw.descripcion ?? "",
    productCount: raw.productCount ?? raw.product_count ?? 0,
    createdAt: raw.createdAt ?? raw.created_at ?? now,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? now,
  };
};

const toBackendCategoryPayload = (data) => {
  if (!data) return {};
  return {
    // backend: { name: "..." }
    name: data.name ?? data.nombre ?? "",
  };
};

export const productCategoryAPI = {
  // Obtener todas las categorías (GET /product-categories)
  getAll: async () => {
    const response = await httpRequest("/product-categories", { method: "GET" });
    const data = response?.data ?? response;
    return Array.isArray(data) ? data.map(toUiCategory) : [];
  },

  // Obtener categoría por ID (GET /product-categories/:id)
  getById: async (id) => {
    const response = await httpRequest(`/product-categories/${id}`, { method: "GET" });
    const data = response?.data ?? response;
    return toUiCategory(data);
  },

  // Crear nueva categoría (POST /product-categories)
  create: async (productCategoryData) => {
    const payload = toBackendCategoryPayload(productCategoryData);
    const response = await httpRequest("/product-categories", {
      method: "POST",
      body: payload,
    });
    const data = response?.data ?? response;
    return toUiCategory(data);
  },

  // Actualizar categoría (PUT /product-categories/:id)
  update: async (id, updatedData) => {
    const payload = toBackendCategoryPayload(updatedData);
    const response = await httpRequest(`/product-categories/${id}`, {
      method: "PUT",
      body: payload,
    });
    const data = response?.data ?? response;
    return toUiCategory(data);
  },

  // Eliminar categoría (DELETE /product-categories/:id)
  delete: async (id) => {
    const response = await httpRequest(`/product-categories/${id}`, {
      method: "DELETE",
    });
    return response?.data ?? response;
  },
};