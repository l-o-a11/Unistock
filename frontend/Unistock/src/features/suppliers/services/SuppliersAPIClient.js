/**
 * Cliente API Real para Proveedores
 * Conecta con el backend en http://localhost:3000/api/proveedores
 */

import { httpRequest } from "../../shared/utils/httpClient";

export const SuppliersAPIClient = {
  /**
   * GET /api/proveedores
   * Lista todos los proveedores con filtros y paginación
   */
  getSuppliers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.nit) queryParams.append("nit", filters.nit);
    if (filters.activo !== undefined) queryParams.append("activo", filters.activo);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.order) queryParams.append("order", filters.order);

    const endpoint = `/proveedores${queryParams.toString() ? "?" + queryParams : ""}`;
    const response = await httpRequest(endpoint, { method: "GET" });
    return response?.data || response;
  },

  /**
   * GET /api/proveedores/:id
   * Obtiene los detalles de un proveedor específico
   */
  getSupplierById: async (id) => {
    const response = await httpRequest(`/proveedores/${id}`, { method: "GET" });
    return response?.data || response;
  },

  /**
   * POST /api/proveedores
   * Crea un nuevo proveedor
   */
  createSupplier: async (data) => {
    const response = await httpRequest("/proveedores", {
      method: "POST",
      body: data,
    });
    return response?.data || response;
  },

  /**
   * PUT /api/proveedores/:id
   * Actualiza un proveedor
   */
  updateSupplier: async (id, data) => {
    const response = await httpRequest(`/proveedores/${id}`, {
      method: "PUT",
      body: data,
    });
    return response?.data || response;
  },

  /**
   * DELETE /api/proveedores/:id
   * Elimina un proveedor
   */
  deleteSupplier: async (id) => {
    const response = await httpRequest(`/proveedores/${id}`, {
      method: "DELETE",
    });
    return response?.data || response;
  },

  /**
   * PATCH /api/proveedores/:id/toggle
   * Activa o inactiva un proveedor
   */
  toggleSupplier: async (id) => {
    const response = await httpRequest(`/proveedores/${id}/toggle`, {
      method: "PATCH",
    });
    return response?.data || response;
  },
};
