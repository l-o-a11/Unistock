/**
 * Cliente API Real para Producción
 * Conecta con el backend en http://localhost:3000/api/produccion
 */
 
import { httpRequest } from "../../shared/utils/httpClient";
 
export const ProductionAPIClient = {
  /**
   * GET /api/produccion/ordenes
   * Lista todas las órdenes con filtros y paginación
   */
  getOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.estado) queryParams.append("estado", filters.estado);
    if (filters.id_usuario) queryParams.append("id_usuario", filters.id_usuario);
    if (filters.fecha_desde) queryParams.append("fecha_desde", filters.fecha_desde);
    if (filters.fecha_hasta) queryParams.append("fecha_hasta", filters.fecha_hasta);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.order) queryParams.append("order", filters.order);
 
    const endpoint = `/produccion/ordenes${queryParams.toString() ? "?" + queryParams : ""}`;
    const response = await httpRequest(endpoint, { method: "GET" });
    return response?.data || response;
  },
 
  /**
   * GET /api/produccion/ordenes/:id
   * Obtiene los detalles de una orden específica
   */
  getOrderById: async (id) => {
    const response = await httpRequest(`/produccion/ordenes/${id}`, { method: "GET" });
    return response?.data || response;
  },
 
  /**
   * POST /api/produccion/ordenes
   * Crea una nueva orden de producción
   */
  createOrder: async (data) => {
    const response = await httpRequest("/produccion/ordenes", {
      method: "POST",
      body: data,
    });
    return response?.data || response;
  },
 
  /**
   * PUT /api/produccion/ordenes/:id
   * Actualiza una orden (fecha_entrega, cliente)
   */
  updateOrder: async (id, data) => {
    const response = await httpRequest(`/produccion/ordenes/${id}`, {
      method: "PUT",
      body: data,
    });
    return response?.data || response;
  },
 
  /**
   * PATCH /api/produccion/ordenes/:id/estado
   * Cambia el estado de una orden
   */
  changeOrderStatus: async (id, estado) => {
    const response = await httpRequest(`/produccion/ordenes/${id}/estado`, {
      method: "PATCH",
      body: { estado },
    });
    return response?.data || response;
  },
 
  /**
   * PATCH /api/produccion/ordenes/:id/anular
   * Anula una orden
   */
  cancelOrder: async (id, motivo) => {
    const response = await httpRequest(`/produccion/ordenes/${id}/anular`, {
      method: "PATCH",
      body: { motivo },
    });
    return response?.data || response;
  },
 
  /**
   * GET /api/produccion/ordenes/estados
   * Obtiene la lista de estados válidos
   */
  getEstados: async () => {
    const response = await httpRequest("/produccion/ordenes/estados", { method: "GET" });
    return response?.data || response;
  },
 
  /**
   * GET /api/produccion/calendario
   * Obtiene eventos para el calendario
   */
  getCalendario: async (desde, hasta) => {
    const queryParams = new URLSearchParams();
    if (desde) queryParams.append("desde", desde);
    if (hasta) queryParams.append("hasta", hasta);
 
    const endpoint = `/produccion/calendario${queryParams.toString() ? "?" + queryParams : ""}`;
    const response = await httpRequest(endpoint, { method: "GET" });
    return response?.data || response;
  },
 
  /**
   * GET /api/produccion/alertas
   * Obtiene alertas de órdenes (vencidas, por vencer, sin avance)
   */
  getAlertas: async () => {
    const response = await httpRequest("/produccion/alertas", { method: "GET" });
    return response?.data || response;
  },
  // ── Detalles de orden ───────────────────────────────────────────────────────
 
  /**
   * GET /api/produccion/detalle-orden?id_orden=:id
   */
  getOrderDetails: async (id_orden) => {
    const response = await httpRequest(
      `/produccion/detalle-orden?id_orden=${id_orden}`,
      { method: "GET" }
    );
    return response?.data || response;
  },
 
  /**
   * POST /api/produccion/detalle-orden
   * Crea un detalle asociado a una orden existente.
   * @param {{ id_orden, id_producto, cantidad, color }} data
   */
  createOrderDetail: async (data) => {
    const response = await httpRequest("/produccion/detalle-orden", {
      method: "POST",
      body: data,
    });
    return response?.data || response;
  },
 
  /**
   * GET /api/produccion/alertas
   * Retorna órdenes vencidas, por vencer y sin avance (>7 días).
   */
  getAlertasFull: async () => {
    const response = await httpRequest("/produccion/alertas", { method: "GET" });
    return response?.data || response;
  },
};