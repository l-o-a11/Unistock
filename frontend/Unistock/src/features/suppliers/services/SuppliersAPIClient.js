/**
 * Cliente API Real para Proveedores
 * Conecta con el backend en http://localhost:3000/api/suppliers
 */

import { httpRequest } from "../../shared/utils/httpClient";

export const SuppliersAPIClient = {
  /**
   * GET /suppliers
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

    const endpoint = `/suppliers${queryParams.toString() ? "?" + queryParams : ""}`;
    const response = await httpRequest(endpoint, { method: "GET" });
    return response?.data || response;
  },

  getSupplierById: async (id) => {
    const response = await httpRequest(`/suppliers/${id}`, { method: "GET" });
    return response?.data || response;
  },

  createSupplier: async (data) => {
    const response = await httpRequest("/suppliers", {
      method: "POST",
      body: data,
    });
    return response?.data || response;
  },

  updateSupplier: async (id, data) => {
    const response = await httpRequest(`/suppliers/${id}`, {
      method: "PUT",
      body: data,
    });
    return response?.data || response;
  },

  deleteSupplier: async (id) => {
    const response = await httpRequest(`/suppliers/${id}`, {
      method: "DELETE",
    });
    return response?.data || response;
  },

  toggleSupplier: async (id) => {
    const response = await httpRequest(`/suppliers/${id}/toggle`, {
      method: "PATCH",
    });
    return response?.data || response;
  },
};

