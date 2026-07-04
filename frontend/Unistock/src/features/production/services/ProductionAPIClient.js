/**
 * ProductionAPIClient.js
 * Cliente API Real para Producción — conecta con el backend en /api/produccion
 * 
 * Normalización: camelCase (frontend) ↔ snake_case (backend)
 */
import { httpRequest } from "../../shared/utils/httpClient";

const getCurrentUserName = () => {
  try {
    const raw = localStorage.getItem('session_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u.nombreCompleto || u.nombre || u.username || u.id || 'Admin';
    }
  } catch { }
  return 'Admin';
};

// ─── Mapeo Frontend → Backend ──────────────────────────────────────────────────
const toBackendFormat = (frontendData) => {
  if (!frontendData) return {};

  const hasAny = (...keys) => keys.some((key) => Object.prototype.hasOwnProperty.call(frontendData, key));
  const firstValue = (...keys) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(frontendData, key)) return frontendData[key];
    }
    return undefined;
  };

  const parseDateInput = (value) => {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'number' && !Number.isNaN(value)) return new Date(value).toISOString();
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('/');
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('-');
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? frontendData.fecha_entrega || frontendData.deliveryDate || null : date.toISOString();
  };

  const backendData = {};

  if (hasAny('cliente', 'client')) backendData.cliente = firstValue('cliente', 'client');
  if (hasAny('fecha_entrega', 'deliveryDate', 'fechaSolicitud')) {
    backendData.fecha_entrega = parseDateInput(firstValue('fecha_entrega', 'deliveryDate', 'fechaSolicitud'));
  }
  if (hasAny('id_usuario', 'userId')) backendData.id_usuario = firstValue('id_usuario', 'userId');
  if (hasAny('asignaciones', 'terceros')) backendData.asignaciones = firstValue('asignaciones', 'terceros');
  if (hasAny('tipo', 'type')) backendData.tipo = firstValue('tipo', 'type');
  if (hasAny('referencia', 'reference')) backendData.referencia = firstValue('referencia', 'reference');
  if (hasAny('producto', 'product')) backendData.producto = firstValue('producto', 'product');
  if (hasAny('techSpecification', 'techSheet')) backendData.techSpecification = firstValue('techSpecification', 'techSheet');
  if (hasAny('designImages')) backendData.designImages = Array.isArray(frontendData.designImages) ? frontendData.designImages : [];
  if (hasAny('finishedImages')) backendData.finishedImages = Array.isArray(frontendData.finishedImages) ? frontendData.finishedImages : [];
  if (hasAny('finishedImageUrl')) backendData.finishedImageUrl = frontendData.finishedImageUrl;
  if (hasAny('fromDamaged')) backendData.fromDamaged = frontendData.fromDamaged;
  if (hasAny('originalOrderNumber')) backendData.originalOrderNumber = frontendData.originalOrderNumber;
  if (hasAny('originalOrderStatus')) backendData.originalOrderStatus = frontendData.originalOrderStatus;
  // ✅ Persistir asignaciones de sede/tercero en la BD (antes solo localStorage)
  if (hasAny('sedeAsignaciones')) backendData.sedeAsignaciones = Array.isArray(frontendData.sedeAsignaciones) ? frontendData.sedeAsignaciones : [];
  if (hasAny('terceroAsignaciones')) backendData.terceroAsignaciones = Array.isArray(frontendData.terceroAsignaciones) ? frontendData.terceroAsignaciones : [];

  if (!hasAny('id_usuario', 'userId')) backendData.id_usuario = getCurrentUserName();

  return backendData;
};

// ─── Mapeo Backend → Frontend ──────────────────────────────────────────────────
const toFrontendFormat = (backendData) => {
  if (!backendData) return {};
  return {
    id: backendData._id || backendData.id,
    orderNumber: backendData.numero_orden || backendData.orderNumber,
    numero_orden: backendData.numero_orden || backendData.orderNumber,
    cliente: backendData.cliente,
    client: backendData.cliente,
    tipo: backendData.tipo || backendData.type || 'produccion',
    techSpecification: backendData.techSpecification || backendData.techSheet || null,
    designImages: Array.isArray(backendData.designImages) ? backendData.designImages : [],
    finishedImages: Array.isArray(backendData.finishedImages) ? backendData.finishedImages : [],
    finishedImageUrl: backendData.finishedImageUrl || null,
    fromDamaged: backendData.fromDamaged || false,
    originalOrderNumber: backendData.originalOrderNumber || null,
    originalOrderStatus: backendData.originalOrderStatus || null,
    // ✅ Fix: deliveryDate siempre formateado a dd/mm/yyyy — antes se asignaba
    // el ISO crudo del backend (ej. "2026-08-11T00:00:00.000Z"), lo cual se
    // veía roto en cualquier vista que confiara en este mapeo genérico en
    // vez de calcular el formato por su cuenta.
    deliveryDate: backendData.fecha_entrega
      ? new Date(backendData.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '',
    fecha_entrega: backendData.fecha_entrega,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    estado: backendData.estado,
    status: backendData.estado,
    producto: backendData.producto || backendData.referencia || null,
    referencia: backendData.referencia || backendData.producto || null,
    cantidad: backendData.cantidad || backendData.quantity || 0,
    quantity: backendData.quantity || backendData.cantidad || 0,
    color: backendData.color || '',
    detalles: backendData.detalles || [],
    asignaciones: backendData.asignaciones || [],
    terceros: backendData.asignaciones || [],
    // ✅ Persistidas en BD — antes solo se guardaban en localStorage
    sedeAsignaciones: Array.isArray(backendData.sedeAsignaciones) ? backendData.sedeAsignaciones : [],
    terceroAsignaciones: Array.isArray(backendData.terceroAsignaciones) ? backendData.terceroAsignaciones : [],
    historial: backendData.historial || [],
    history: backendData.historial || [],
    rawData: backendData,
    // ✅ Fix defensivo: también se exponen en el formato enriquecido que usa
    // la vista de detalle ("details"/"history" con sus campos ya mapeados),
    // por si algún código llega a usar este resultado directamente para
    // pintar la pantalla sin pasar por el mapeo manual del useEffect inicial.
    details: (backendData.detalles || []).map((d) => ({
      id: d.id || d._id,
      refCorte: d.refCorte || d.id_producto || '',
      ref: d.id_producto || '',
      quantity: d.cantidad || 0,
      color: d.color || '—',
      status: backendData.estado,
      estado: d.estado !== false,
    })),
  };
};

export const ProductionAPIClient = {

  getOrders: async (filters = {}) => {
    const q = new URLSearchParams();
    if (filters.search) q.append("search", filters.search);
    if (filters.estado) q.append("estado", filters.estado);
    if (filters.id_usuario) q.append("id_usuario", filters.id_usuario);
    if (filters.fecha_desde) q.append("fecha_desde", filters.fecha_desde);
    if (filters.fecha_hasta) q.append("fecha_hasta", filters.fecha_hasta);
    if (filters.page) q.append("page", filters.page);
    if (filters.limit) q.append("limit", filters.limit);
    if (filters.sortBy) q.append("sortBy", filters.sortBy);
    if (filters.order) q.append("order", filters.order);
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

  changeOrderStatus: async (id, estado, options = {}) => {
    const body = { estado, id_usuario: getCurrentUserName(), user: getCurrentUserName(), ...options.extra };
    if (options.force) body.force = true;
    const res = await httpRequest(`/produccion/ordenes/${id}/estado`, {
      method: "PATCH",
      body,
    });
    const resData = res?.data || res;
    return toFrontendFormat(resData);
  },

  updateOrderDetail: async (id, data) => {
    const res = await httpRequest(`/produccion/detalle-orden/${id}`, {
      method: "PUT",
      body: data,
    });
    return res?.data || res;
  },

  deleteOrderDetail: async (id) => {
    const res = await httpRequest(`/produccion/detalle-orden/${id}`, {
      method: "DELETE",
      body: { id_usuario: getCurrentUserName(), user: getCurrentUserName() },
    });
    return res?.data || res;
  },

  cancelOrder: async (id, motivo) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/anular`, {
      method: "PATCH",
      body: { motivo, id_usuario: getCurrentUserName() },
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
        id_orden: data.id_orden,
        id_producto: String(data.id_producto || "").trim(),
        cantidad: Number(data.cantidad),
        color: data.color ? String(data.color).trim() : "",
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

  /**
   * Elimina todas las asignaciones de terceros de una orden.
   * Se usa antes de reasignar para evitar duplicar cantidades al retroceder
   * y volver a avanzar el flujo.
   */
  deleteAssignmentsByOrder: async (orderId) => {
    const res = await httpRequest(`/produccion/asignaciones/orden/${orderId}`, {
      method: "DELETE",
    });
    return res?.data || res;
  },
};
