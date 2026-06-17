/**
 * sedesAPI.js
 *
 * FIX #9: getAll ahora devuelve la metadata de paginación completa
 * { data, total, page, limit, totalPages } en lugar de solo el array.
 * Esto permite que useSedes y sedesPage usen la paginación del servidor
 * en lugar de recargar todos los registros y paginar en el cliente.
 */

import httpClient from "../../shared/utils/httpClient";

// Normaliza una sede recibida del backend
const normalizeSede = (raw) => ({
  id: String(raw.id ?? raw._id ?? ""),
  nombre: raw.nombre ?? "",
  ciudad: raw.ciudad ?? "",
  barrio: raw.barrio ?? "",
  direccion: raw.direccion ?? "",
  telefono: String(raw.telefono ?? ""),
  estado: raw.estado ?? true,
});

export const sedesAPI = {
  /**
   * GET /api/sites
   * Soporta: ?search= ?estado= ?page= ?limit= ?sortBy= ?order=
   *
   * FIX #9: antes descartaba total/totalPages y devolvía solo el array.
   * Ahora devuelve: { data: Sede[], total, page, limit, totalPages }
   */
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    ).toString();

    const result = await httpClient.get(`/sites${qs ? `?${qs}` : ""}`);

    // La API responde: { success: true, data: { data: [...], total, page, ... } }
    const payload = result?.data ?? result;

    // Soporta tanto respuesta paginada { data: [...], total, ... } como array directo
    if (Array.isArray(payload)) {
      return { data: payload.map(normalizeSede), total: payload.length, page: 1, limit: payload.length, totalPages: 1 };
    }

    return {
      data: (payload?.data ?? []).map(normalizeSede),
      total: payload?.total ?? 0,
      page: payload?.page ?? 1,
      limit: payload?.limit ?? 10,
      totalPages: payload?.totalPages ?? 1,
    };
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
      nombre: sedeData.nombre,
      ciudad: sedeData.ciudad,
      barrio: sedeData.barrio,
      direccion: sedeData.direccion,
      telefono: String(sedeData.telefono),
      estado: sedeData.estado ?? true,
    });
    const raw = result?.data ?? result;
    return normalizeSede(raw);
  },

  /**
   * PUT /api/sites/:id
   */
  update: async (id, sedeData) => {
    const body = {};
    if (sedeData.nombre !== undefined) body.nombre = sedeData.nombre;
    if (sedeData.ciudad !== undefined) body.ciudad = sedeData.ciudad;
    if (sedeData.barrio !== undefined) body.barrio = sedeData.barrio;
    if (sedeData.direccion !== undefined) body.direccion = sedeData.direccion;
    if (sedeData.telefono !== undefined) body.telefono = String(sedeData.telefono);
    if (sedeData.estado !== undefined) body.estado = sedeData.estado;

    const result = await httpClient.put(`/sites/${id}`, body);
    const raw = result?.data ?? result;
    return normalizeSede(raw);
  },

  /**
   * DELETE /api/sites/:id
   */
  delete: async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para eliminar la sede.");
    }
    try {
      return await httpClient.delete(`/sites/${id}`, {
        body: { password: managerPassword },
      });
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if (status === 403) throw new Error("Contraseña del gerente incorrecta.");
      throw err;
    }
  },

  /**
   * PATCH /api/sites/:id/toggle
   */
  toggle: async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para cambiar el estado de la sede.");
    }
    try {
      const result = await httpClient.patch(`/sites/${id}/toggle`, {
        password: managerPassword,
      });
      const raw = result?.data ?? result;
      return normalizeSede(raw);
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if (status === 403) throw new Error("Contraseña del gerente incorrecta.");
      throw err;
    }
  },
};
