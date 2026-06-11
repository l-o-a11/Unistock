// features/shopping/services/shoppingAPI.js
// Conecta con la API real en /api/compras
// Reemplaza el mock de localStorage cuando el backend esté activo.

import httpClient from "../../shared/utils/httpClient";

export const shoppingAPI = {

  // GET /api/compras?anulada=false&proveedorId=xxx
  // httpClient devuelve el JSON crudo { success, data } — el hook desenvuelve con response?.data ?? response
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.anulada !== undefined) params.set("anulada", filters.anulada);
    if (filters.proveedorId) params.set("proveedorId", filters.proveedorId);
    if (filters.numeroFactura) params.set("numeroFactura", filters.numeroFactura);
    const query = params.toString();
    return httpClient.get(`/compras${query ? `?${query}` : ""}`);
  },

  // GET /api/compras/:id  →  compra + detalles[]
  getById: async (id) => {
    return httpClient.get(`/compras/${id}`);
  },

  // POST /api/compras
  create: async (shoppingData) => {
    return httpClient.post("/compras", shoppingData);
  },

  // PUT /api/compras/:id
  update: async (id, updatedData) => {
    return httpClient.put(`/compras/${id}`, updatedData);
  },

  // PATCH /api/compras/:id/anular  — body: { motivo }
  anular: async (id, motivo) => {
    return httpClient.patch(`/compras/${id}/anular`, { motivo });
  },

  // DELETE /api/compras/:id
  delete: async (id) => {
    return httpClient.delete(`/compras/${id}`);
  },

  // ── Detalles ──────────────────────────────────────────────────────────────

  // GET /api/compras/detalle-purchase?compraId=xxx
  getDetallesByCompra: async (compraId) => {
    return httpClient.get(`/compras/detalle-purchase?compraId=${compraId}`);
  },

  // POST /api/compras/detalle-purchase
  createDetalle: async (detalle) => {
    return httpClient.post("/compras/detalle-purchase", detalle);
  },
};