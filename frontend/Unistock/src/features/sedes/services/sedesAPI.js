/**
 * sedesAPI.js
 *
 * Reemplaza el mock de localStorage por llamadas reales al backend.
 * Endpoint base: /api/sites  (montado en server.js como app.use('/api/sites', siteRoutes))
 *
 * La API envuelve las respuestas en { success: true, data: ... }
 * httpClient devuelve el JSON crudo → desenvolvemos con result?.data ?? result.
 *
 * Normalización frontend ↔ backend:
 *   backend devuelve: { id, nombre, ciudad, barrio, direccion, telefono, estado }
 *   frontend usa:     mismos campos — no hay transformación necesaria.
 */

import httpClient from "../../shared/utils/httpClient";

// Normaliza una sede recibida del backend
const normalizeSede = (raw) => ({
  id:        String(raw.id ?? raw._id ?? ""),
  nombre:    raw.nombre    ?? "",
  ciudad:    raw.ciudad    ?? "",
  barrio:    raw.barrio    ?? "",
  direccion: raw.direccion ?? "",
  telefono:  String(raw.telefono ?? ""),
  estado:    raw.estado    ?? true,
});

export const sedesAPI = {
  /**
   * GET /api/sites
   * Soporta: ?search= ?estado= ?page= ?limit= ?sortBy= ?order=
   * Devuelve: { data: Sede[], total, page, limit, totalPages }
   *           o el array directo si el backend no pagina.
   */
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    const result = await httpClient.get(`/sites${qs ? `?${qs}` : ""}`);
    // Soporta respuesta paginada { data: [...] } y array directo
    const raw = result?.data ?? result;
    const lista = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return lista.map(normalizeSede);
  },

  /**
   * GET /api/sites/:id
   */
  getById: async (id) => {
    const result = await httpClient.get(`/sites/${id}`);
    const raw = result?.data ?? result;
    return normalizeSede(raw);
  },

  /**
   * POST /api/sites
   */
  create: async (sedeData) => {
    const result = await httpClient.post("/sites", {
      nombre:    sedeData.nombre,
      ciudad:    sedeData.ciudad,
      barrio:    sedeData.barrio,
      direccion: sedeData.direccion,
      telefono:  String(sedeData.telefono),
      estado:    sedeData.estado ?? true,
    });
    const raw = result?.data ?? result;
    return normalizeSede(raw);
  },

  /**
   * PUT /api/sites/:id
   */
  update: async (id, sedeData) => {
    const body = {};
    if (sedeData.nombre    !== undefined) body.nombre    = sedeData.nombre;
    if (sedeData.ciudad    !== undefined) body.ciudad    = sedeData.ciudad;
    if (sedeData.barrio    !== undefined) body.barrio    = sedeData.barrio;
    if (sedeData.direccion !== undefined) body.direccion = sedeData.direccion;
    if (sedeData.telefono  !== undefined) body.telefono  = String(sedeData.telefono);
    if (sedeData.estado    !== undefined) body.estado    = sedeData.estado;

    const result = await httpClient.put(`/sites/${id}`, body);
    const raw = result?.data ?? result;
    return normalizeSede(raw);
  },

  /**
   * DELETE /api/sites/:id
   */
  delete: async (id) => {
    return httpClient.delete(`/sites/${id}`);
  },

  /**
   * PATCH /api/sites/:id/toggle
   */
  toggle: async (id) => {
    const result = await httpClient.patch(`/sites/${id}/toggle`);
    const raw = result?.data ?? result;
    return normalizeSede(raw);
  },
};
