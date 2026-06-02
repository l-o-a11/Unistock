/**
 * ProductionAPIClient.js
 * Cliente API Real para Producción — conecta con el backend en /api/produccion
 * 
 * Normalización: camelCase (frontend) ↔ snake_case (backend)
 */
import { httpRequest } from "../../shared/utils/httpClient";

// ─── Mapeo Frontend → Backend ──────────────────────────────────────────────────
const toBackendFormat = (frontendData) => {
  if (!frontendData) return {};
  return {
    cliente: frontendData.cliente || frontendData.client || null,
    fecha_entrega: frontendData.fecha_entrega || frontendData.deliveryDate || null,
    id_usuario: frontendData.id_usuario || frontendData.userId || null,
    asignaciones: frontendData.asignaciones || frontendData.terceros || [],
  };
};

// ─── Mapeo Backend → Frontend ──────────────────────────────────────────────────
const toFrontendFormat = (backendData) => {
  if (!backendData) return {};
  return {
    id: backendData._id || backendData.id,
    orderNumber: backendData.numero_orden || backendData.orderNumber,
    cliente: backendData.cliente,
    client: backendData.cliente,
    deliveryDate: backendData.fecha_entrega,
    fecha_entrega: backendData.fecha_entrega,
    estado: backendData.estado,
    status: backendData.estado,
    detalles: backendData.detalles || [],
    asignaciones: backendData.asignaciones || [],
    terceros: backendData.asignaciones || [],
    historial: backendData.historial || [],
    history: backendData.historial || [],
  };
};

export const ProductionAPIClient = {

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
    const data = res?.data || res;
    return Array.isArray(data) ? data.map(toFrontendFormat) : data;
  },

  getOrderById: async (id) => {
    const res = await httpRequest(`/produccion/ordenes/${id}`, { method: "GET" });
    const data = res?.data || res;
    return toFrontendFormat(data);
  },

  createOrder: async (data) => {
    const backendData = toBackendFormat(data);
    const res = await httpRequest("/produccion/ordenes", { method: "POST", body: backendData });
    const resData = res?.data || res;
    return toFrontendFormat(resData);
  },

  updateOrder: async (id, data) => {
    const backendData = toBackendFormat(data);
    const res = await httpRequest(`/produccion/ordenes/${id}`, { method: "PUT", body: backendData });
    const resData = res?.data || res;
    return toFrontendFormat(resData);
  },

  changeOrderStatus: async (id, estado) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/estado`, {
      method: "PATCH",
      body: { estado },
    });
    const resData = res?.data || res;
    return toFrontendFormat(resData);
  },

  cancelOrder: async (id, motivo) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/anular`, {
      method: "PATCH",
      body: { motivo },
    });
    const resData = res?.data || res;
    return toFrontendFormat(resData);
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

  // ── Asignaciones de Terceros ───────────────────────────────────────────────

  /**
   * Obtiene asignaciones (terceros) para una orden.
   */
  getAssignments: async (id_orden) => {
    const q = id_orden ? `?id_orden=${id_orden}` : "";
    const res = await httpRequest(`/produccion/asignaciones${q}`, { method: "GET" });
    const data = res?.data || res;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Crea una asignación de tercero a una orden.
   * @param {{ id_orden: string, id_tercero: string, cantidad: number }} data
   */
  createAssignment: async (data) => {
    const payload = {
      id_orden: data.id_orden || data.idOrden,
      id_tercero: data.id_tercero || data.idTercero || data.terceroId,
      cantidad: Number(data.cantidad || 0),
    };
    const res = await httpRequest("/produccion/asignaciones", { method: "POST", body: payload });
    return res?.data || res;
  },

  /**
   * Actualiza una asignación existente.
   */
  updateAssignment: async (assignmentId, data) => {
    const payload = {
      cantidad: Number(data.cantidad || 0),
    };
    const res = await httpRequest(`/produccion/asignaciones/${assignmentId}`, {
      method: "PUT",
      body: payload,
    });
    return res?.data || res;
  },

  /**
   * Elimina una asignación.
   */
  deleteAssignment: async (assignmentId) => {
    const res = await httpRequest(`/produccion/asignaciones/${assignmentId}`, {
      method: "DELETE",
    });
    return res?.data || res;
  },
};
