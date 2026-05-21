/**
 * categoriesSupply/services/categoryAPI.js
 *
 * Reemplaza el mock de localStorage/setTimeout por llamadas reales al backend.
 * Endpoint base: /api/categorias-insumos  (montado en server.js)
 *
 * El backend responde: { success: true, data: ... }
 * Paginado devuelve: { data: [...], total, page, limit, totalPages }
 */

import httpClient from "../../shared/utils/httpClient";

// ── Normaliza una categoría recibida del backend ───────────────────────────
const normalizeCategory = (raw) => ({
  id:          String(raw.id ?? raw._id ?? ""),
  nombre:      raw.nombre      ?? "",
  descripcion: raw.descripcion ?? "",
  estado:      raw.estado      ?? true,
  createdAt:   raw.createdAt,
  updatedAt:   raw.updatedAt,
});

export const categoryAPI = {
  /**
   * GET /api/categorias-insumos
   * Soporta: ?search= ?estado= ?page= ?limit= ?sortBy= ?order=
   * Devuelve: { data: Category[], total, page, limit, totalPages }
   */
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    const result = await httpClient.get(`/categorias-insumos${qs ? `?${qs}` : ""}`);
    const payload = result?.data ?? result;

    if (Array.isArray(payload)) {
      return {
        data:       payload.map(normalizeCategory),
        total:      payload.length,
        page:       1,
        limit:      payload.length,
        totalPages: 1,
      };
    }
    return {
      data:       (payload?.data ?? []).map(normalizeCategory),
      total:      payload?.total      ?? 0,
      page:       payload?.page       ?? 1,
      limit:      payload?.limit      ?? 50,
      totalPages: payload?.totalPages ?? 1,
    };
  },

  /**
   * GET /api/categorias-insumos/:id
   */
  getById: async (id) => {
    const result = await httpClient.get(`/categorias-insumos/${id}`);
    const raw = result?.data ?? result;
    return normalizeCategory(raw);
  },

  /**
   * POST /api/categorias-insumos
   */
  create: async (categoryData) => {
    const result = await httpClient.post("/categorias-insumos", {
      nombre:      categoryData.nombre,
      descripcion: categoryData.descripcion ?? "",
    });
    const raw = result?.data ?? result;
    return normalizeCategory(raw);
  },

  /**
   * PUT /api/categorias-insumos/:id
   */
  update: async (id, categoryData) => {
    const body = {};
    if (categoryData.nombre      != null) body.nombre      = categoryData.nombre;
    if (categoryData.descripcion != null) body.descripcion = categoryData.descripcion;
    if (categoryData.estado      != null) body.estado      = categoryData.estado;

    const result = await httpClient.put(`/categorias-insumos/${id}`, body);
    const raw = result?.data ?? result;
    return normalizeCategory(raw);
  },

  /**
   * DELETE /api/categorias-insumos/:id
   * El backend retorna 422 si la categoría tiene insumos activos.
   */
  delete: async (id) => {
    return httpClient.delete(`/categorias-insumos/${id}`);
  },

  /**
   * PATCH /api/categorias-insumos/:id/toggle
   */
  toggle: async (id) => {
    const result = await httpClient.patch(`/categorias-insumos/${id}/toggle`);
    const raw = result?.data ?? result;
    return normalizeCategory(raw);
  },
};
