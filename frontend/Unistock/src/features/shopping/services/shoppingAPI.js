// features/shopping/services/shoppingAPI.js
// Conecta con la API real en /api/compras
// Reemplaza el mock de localStorage cuando el backend esté activo.

import httpClient from "../../shared/utils/httpClient";

export const shoppingAPI = {

  // GET /api/compras?anulada=false&proveedorId=xxx
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.anulada !== undefined) params.set("anulada", filters.anulada);
    if (filters.proveedorId) params.set("proveedorId", filters.proveedorId);
    if (filters.numeroFactura) params.set("numeroFactura", filters.numeroFactura);

    const query = params.toString();
    const response = await httpClient.get(`/compras${query ? `?${query}` : ""}`);
    return response.data; // Array de compras
  },

  // GET /api/compras/:id  →  compra + detalles[]
  getById: async (id) => {
    const response = await httpClient.get(`/compras/${id}`);
    return response.data;
  },

  // POST /api/compras
  // Body: { fecha, proveedorId, total, observaciones, numeroFactura, detalles[] }
  create: async (shoppingData) => {
    const response = await httpClient.post("/compras", shoppingData);
    return response.data;
  },

  // PUT /api/compras/:id
  update: async (id, updatedData) => {
    const response = await httpClient.put(`/compras/${id}`, updatedData);
    return response.data;
  },

  // PATCH /api/compras/:id/anular
  // Body: { motivo: "texto obligatorio" }
  anular: async (id, motivo) => {
    const response = await httpClient.patch(`/compras/${id}/anular`, { motivo });
    return response.data;
  },

  // DELETE /api/compras/:id
  delete: async (id) => {
    const response = await httpClient.delete(`/compras/${id}`);
    return response.data;
  },

  // ── Detalles ──────────────────────────────────────────────────────────────

  // GET /api/compras/detalle-purchase?compraId=xxx
  getDetallesByCompra: async (compraId) => {
    const response = await httpClient.get(`/compras/detalle-purchase?compraId=${compraId}`);
    return response.data;
  },

  // POST /api/compras/detalle-purchase
  createDetalle: async (detalle) => {
    const response = await httpClient.post("/compras/detalle-purchase", detalle);
    return response.data;
  },
};