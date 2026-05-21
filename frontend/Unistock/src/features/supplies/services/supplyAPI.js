/**
 * supplies/services/supplyAPI.js
 *
 * Reemplaza el mock de localStorage/setTimeout por llamadas reales al backend.
 * Endpoint base: /api/insumos  (montado en server.js)
 *
 * El backend responde siempre: { success: true, data: ... }
 * httpClient devuelve el JSON crudo → desenvolvemos con raw?.data ?? raw
 *
 * Normalización frontend ↔ backend:
 *   El backend devuelve: { id, nombre, categoria (obj|id), stock,
 *                          valor_medida, medida, imagenes_Url, estado, propiedades }
 *   El frontend usa los mismos nombres — sin transformación extra.
 */

import httpClient from "../../shared/utils/httpClient";

// ── Normaliza un insumo recibido del backend ───────────────────────────────
const normalizeSupply = (raw) => ({
  id:           String(raw.id ?? raw._id ?? ""),
  nombre:       raw.nombre        ?? "",
  // categoria puede llegar como objeto { id, nombre } o como string (ObjectId)
  categoria:    raw.categoria?.id
                  ? raw.categoria           // objeto populado → conservar completo
                  : raw.categoria ?? null,  // string ObjectId
  categoriaId:  raw.categoria?.id ?? raw.categoria ?? null, // compat con la UI
  stock:        raw.stock         ?? 0,
  valor_medida: raw.valor_medida  ?? 0,
  valorMedida:  raw.valor_medida  ?? 0,     // compat con la UI actual
  medida:       raw.medida        ?? "",
  medidaId:     raw.medida        ?? "",    // compat con la UI actual
  imagenes_Url: Array.isArray(raw.imagenes_Url) ? raw.imagenes_Url : [],
  estado:       raw.estado        ?? true,
  propiedades:  Array.isArray(raw.propiedades) ? raw.propiedades : [],
  createdAt:    raw.createdAt,
  updatedAt:    raw.updatedAt,
});

export const supplyAPI = {
  /**
   * GET /api/insumos
   * Soporta: ?search= ?categoria= ?estado= ?page= ?limit= ?sortBy= ?order=
   * Devuelve: { data: Supply[], total, page, limit, totalPages }
   */
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    const result = await httpClient.get(`/insumos${qs ? `?${qs}` : ""}`);
    const payload = result?.data ?? result;

    if (Array.isArray(payload)) {
      return {
        data:       payload.map(normalizeSupply),
        total:      payload.length,
        page:       1,
        limit:      payload.length,
        totalPages: 1,
      };
    }
    return {
      data:       (payload?.data ?? []).map(normalizeSupply),
      total:      payload?.total      ?? 0,
      page:       payload?.page       ?? 1,
      limit:      payload?.limit      ?? 10,
      totalPages: payload?.totalPages ?? 1,
    };
  },

  /**
   * GET /api/insumos/:id
   */
  getById: async (id) => {
    const result = await httpClient.get(`/insumos/${id}`);
    const raw = result?.data ?? result;
    return normalizeSupply(raw);
  },

  /**
   * POST /api/insumos
   */
  create: async (supplyData) => {
    const result = await httpClient.post("/insumos", {
      nombre:       supplyData.nombre,
      categoria:    supplyData.categoriaId ?? supplyData.categoria,
      stock:        supplyData.stock        ?? 0,
      valor_medida: supplyData.valorMedida  ?? supplyData.valor_medida,
      medida:       supplyData.medidaId     ?? supplyData.medida,
      imagenes_Url: supplyData.imagenes_Url ?? supplyData.image
                      ? [supplyData.image]
                      : [],
      propiedades:  supplyData.propiedades  ?? [],
    });
    const raw = result?.data ?? result;
    return normalizeSupply(raw);
  },

  /**
   * PUT /api/insumos/:id
   */
  update: async (id, supplyData) => {
    const body = {};
    if (supplyData.nombre       != null) body.nombre       = supplyData.nombre;
    if (supplyData.categoriaId  != null) body.categoria    = supplyData.categoriaId;
    if (supplyData.categoria    != null) body.categoria    = body.categoria ?? supplyData.categoria;
    if (supplyData.stock        != null) body.stock        = supplyData.stock;
    const vm = supplyData.valorMedida ?? supplyData.valor_medida;
    if (vm                      != null) body.valor_medida = vm;
    const med = supplyData.medidaId ?? supplyData.medida;
    if (med                     != null) body.medida       = med;
    if (supplyData.imagenes_Url != null) body.imagenes_Url = supplyData.imagenes_Url;
    if (supplyData.propiedades  != null) body.propiedades  = supplyData.propiedades;

    const result = await httpClient.put(`/insumos/${id}`, body);
    const raw = result?.data ?? result;
    return normalizeSupply(raw);
  },

  /**
   * DELETE /api/insumos/:id
   */
  delete: async (id) => {
    return httpClient.delete(`/insumos/${id}`);
  },

  /**
   * PATCH /api/insumos/:id/toggle
   */
  toggle: async (id) => {
    const result = await httpClient.patch(`/insumos/${id}/toggle`);
    const raw = result?.data ?? result;
    return normalizeSupply(raw);
  },

  // ── Catálogos desde el backend ──────────────────────────────────────────────

  /**
   * GET /api/insumos/catalogos/medidas
   */
  getMedidas: async () => {
    const result = await httpClient.get("/insumos/catalogos/medidas");
    const list = result?.data ?? result;
    // El backend devuelve [{ valor, label }]; la UI espera [{ id, nombre }]
    return (Array.isArray(list) ? list : []).map((m) => ({
      id:     m.valor ?? m.id,
      nombre: m.label ?? m.nombre,
      valor:  m.valor ?? m.id,
      label:  m.label ?? m.nombre,
    }));
  },

  /**
   * GET /api/insumos/catalogos/propiedades
   */
  getPropiedades: async () => {
    const result = await httpClient.get("/insumos/catalogos/propiedades");
    const list = result?.data ?? result;
    // El backend devuelve [{ clave, label }]; la UI espera [{ id, nombre }]
    return (Array.isArray(list) ? list : []).map((p) => ({
      id:     p.clave ?? p.id,
      nombre: p.label ?? p.nombre,
      clave:  p.clave ?? p.id,
      label:  p.label ?? p.nombre,
    }));
  },

  /**
   * GET /api/categorias-insumos  (categorías activas para selectores)
   */
  getCategorias: async () => {
    const result = await httpClient.get("/categorias-insumos?estado=true&limit=100");
    const payload = result?.data ?? result;
    const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return list.map((c) => ({
      id:          c.id     ?? c._id,
      nombre:      c.nombre ?? "",
      descripcion: c.descripcion ?? "",
      estado:      c.estado ?? true,
    }));
  },
};
