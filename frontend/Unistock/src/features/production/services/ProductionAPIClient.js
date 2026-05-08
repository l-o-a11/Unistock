/**
 * ProductionAPIClient.js
 * Cliente API Real para Producción — conecta con el backend en /api/produccion
 */
import { httpRequest } from "../../shared/utils/httpClient";

export const ProductionAPIClient = {

  // ── Órdenes ────────────────────────────────────────────────────────────────

  getOrders: async (filters = {}) => {
    const q = new URLSearchParams();
    if (filters.search)      q.append("search",      filters.search);
    if (filters.estado)      q.append("estado",      filters.estado);
    if (filters.id_usuario)  q.append("id_usuario",  filters.id_usuario);
    if (filters.fecha_desde) q.append("fecha_desde", filters.fecha_desde);
    if (filters.fecha_hasta) q.append("fecha_hasta", filters.fecha_hasta);
    if (filters.page)        q.append("page",        filters.page);
    if (filters.limit)       q.append("limit",       filters.limit);
    if (filters.sortBy)      q.append("sortBy",      filters.sortBy);
    if (filters.order)       q.append("order",       filters.order);
    const endpoint = `/produccion/ordenes${q.toString() ? "?" + q : ""}`;
    const res = await httpRequest(endpoint, { method: "GET" });
    return res?.data || res;
  },

  getOrderById: async (id) => {
    const res = await httpRequest(`/produccion/ordenes/${id}`, { method: "GET" });
    return res?.data || res;
  },

  createOrder: async (data) => {
    const res = await httpRequest("/produccion/ordenes", { method: "POST", body: data });
    return res?.data || res;
  },

  updateOrder: async (id, data) => {
    const res = await httpRequest(`/produccion/ordenes/${id}`, { method: "PUT", body: data });
    return res?.data || res;
  },

  changeOrderStatus: async (id, estado) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/estado`, {
      method: "PATCH",
      body: { estado },
    });
    return res?.data || res;
  },

  cancelOrder: async (id, motivo) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/anular`, {
      method: "PATCH",
      body: { motivo },
    });
    return res?.data || res;
  },

  getEstados: async () => {
    const res = await httpRequest("/produccion/ordenes/estados", { method: "GET" });
    return res?.data || res;
  },

  // ── Detalles de orden ──────────────────────────────────────────────────────

  /** Lista los artículos de una orden. Retorna [] si no hay. */
  getOrderDetails: async (id_orden) => {
    const res = await httpRequest(
      `/produccion/detalle-orden?id_orden=${id_orden}`,
      { method: "GET" }
    );
    const data = res?.data || res;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Crea un artículo/detalle asociado a una orden.
   * @param {{ id_orden: string, id_producto: string, cantidad: number, color?: string }} data
   */
  createOrderDetail: async (data) => {
    const res = await httpRequest("/produccion/detalle-orden", {
      method: "POST",
      body: {
        id_orden:    data.id_orden,
        id_producto: String(data.id_producto || "").trim(),
        cantidad:    Number(data.cantidad),
        color:       data.color ? String(data.color).trim() : "",
      },
    });
    return res?.data || res;
  },

  // ── Calendario y Alertas ───────────────────────────────────────────────────

  getCalendario: async (desde, hasta) => {
    const q = new URLSearchParams();
    if (desde) q.append("desde", desde);
    if (hasta) q.append("hasta", hasta);
    const endpoint = `/produccion/calendario${q.toString() ? "?" + q : ""}`;
    const res = await httpRequest(endpoint, { method: "GET" });
    return res?.data || res;
  },

  getAlertas: async () => {
    const res = await httpRequest("/produccion/alertas", { method: "GET" });
    return res?.data || res;
  },

  // ── Asignaciones ───────────────────────────────────────────────────────────

  getAssignments: async (id_orden) => {
    const q = id_orden ? `?id_orden=${id_orden}` : "";
    const res = await httpRequest(`/produccion/asignaciones${q}`, { method: "GET" });
    return res?.data || res;
  },

  createAssignment: async (data) => {
    const res = await httpRequest("/produccion/asignaciones", { method: "POST", body: data });
    return res?.data || res;
  },
};
