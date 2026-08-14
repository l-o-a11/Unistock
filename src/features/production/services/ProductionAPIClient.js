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

/**
 * Obtiene el ID del usuario actual desde session_user en localStorage.
 * Retorna el MongoDB ObjectId (u.id) necesario para comparar contra
 * campos como empleadoAsignadoId en el backend.
 */
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('session_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u._id || u.id || null;
    }
  } catch { }
  return null;
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

  if (hasAny('cliente', 'client')) backendData.cliente = String(firstValue('cliente', 'client') || '').trim();
  if (hasAny('fecha_entrega', 'deliveryDate', 'fechaSolicitud')) {
    const parsedDate = parseDateInput(firstValue('fecha_entrega', 'deliveryDate', 'fechaSolicitud'));
    backendData.fecha_entrega = parsedDate || new Date().toISOString();
  }
  if (hasAny('id_usuario', 'userId')) backendData.id_usuario = firstValue('id_usuario', 'userId');
  if (hasAny('asignaciones', 'terceros')) backendData.asignaciones = firstValue('asignaciones', 'terceros');
  if (hasAny('tipo', 'type')) backendData.tipo = firstValue('tipo', 'type');
  if (hasAny('referencia', 'reference')) backendData.referencia = String(firstValue('referencia', 'reference') || '').trim();
  if (hasAny('producto', 'product')) backendData.producto = String(firstValue('producto', 'product') || '').trim();
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
  // 🐛 FIX: esta línea faltaba por completo. `empleadoAsignaciones` (objeto
  // { [etapa]: { id_empleado, nombre_empleado, fecha } }) se construía bien
  // en el frontend pero nunca viajaba al backend porque toBackendFormat no
  // lo reconocía como campo válido — el PUT se enviaba sin él y la
  // asignación se perdía en silencio. Por eso el empleado nunca veía su
  // orden asignada: en la BD el campo quedaba siempre vacío.
  if (hasAny('empleadoAsignaciones')) backendData.empleadoAsignaciones = frontendData.empleadoAsignaciones || {};
  // ✅ Sede dueña de la producción (elegida al crear la orden)
  if (hasAny('sedeId')) backendData.sedeId = firstValue('sedeId');

  if (!hasAny('id_usuario', 'userId')) backendData.id_usuario = getCurrentUserName();
  if (!backendData.cliente) backendData.cliente = 'Cliente sin nombre';
  if (!backendData.fecha_entrega) backendData.fecha_entrega = new Date().toISOString();

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
    // El backend de producción usa `fecha_creacion` en lugar de `createdAt`.
    // Exponer ambos formatos evita que las vistas que agrupan por período
    // (dashboard, calendario y listados) descarten órdenes válidas.
    createdAt: backendData.createdAt || backendData.fecha_creacion || backendData.fechaCreacion || null,
    updatedAt: backendData.updatedAt || backendData.fecha_actualizacion || backendData.fechaActualizacion || backendData.fecha_creacion || null,
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
    // 🐛 FIX: El backend REAL (Api_Unistock, puerto 3000) guarda la asignación
    // como un campo plano `empleadoAsignadoId` (ObjectId directo), NO como el
    // objeto `empleadoAsignaciones`. La derivación desde `empleadoAsignaciones`
    // siempre devolvía null porque ese objeto no existe en la BD real, lo que
    // impedía que el filtro "¿esta orden es mía?" en la vista de Producción del
    // empleado nunca coincidiera con nadie.
    // Ahora se lee `empleadoAsignadoId` directamente como fuente principal, y
    // se conserva `empleadoAsignaciones` solo como compatibilidad con el otro
    // backend (back_unictock, puerto 3020).
    //
    // 🐛 FIX adicional: Los ObjectId de MongoDB pueden venir como objetos
    // (ej. { _id: "..." }) si no se serializan correctamente. Se fuerza la
    // conversión a string para que la comparación en ProductionPage.jsx
    // (String(prod?.empleadoAsignadoId) === String(user?.id)) funcione bien.
    empleadoAsignaciones: backendData.empleadoAsignaciones || {},
    etapaConfirmada: backendData.etapaConfirmada ?? false,
    empleadoAsignadoId: (() => {
      const raw = backendData.empleadoAsignadoId
        || backendData.empleadoAsignaciones?.[backendData.estado]?.id_empleado
        || null;
      if (!raw) return null;
      // Si es un objeto con _id (ObjectId sin serializar), extraer el string
      if (typeof raw === 'object' && raw._id) return String(raw._id);
      return String(raw);
    })(),
    // ✅ Sede dueña de la producción
    sedeId: backendData.sedeId || null,
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
    // 🐛 FIX: el backend devuelve { success: true, data: { data: [...], total, page, ... } }
    // (formato paginado). Si data es un objeto con propiedad "data" que es un array,
    // hay que extraer ese array interno. Si data ya es un array directamente, se usa tal cual.
    // Esto mantiene compatibilidad con ambos formatos de respuesta.
    const rawOrders = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    return rawOrders.map(toFrontendFormat);
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

/**
   * Confirma la etapa actual por parte del empleado asignado.
   * Marca `etapaConfirmada: true` en la orden (NO cambia el estado).
   * Solo el empleado asignado a la etapa actual puede ejecutar esta acción.
   */
  confirmarEtapa: async (id) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/confirmar-etapa`, {
      method: "PATCH",
      body: { id_usuario: getCurrentUserId() },
    });
    const data = res?.data || res;
    return toFrontendFormat(data);
  },

  // ✅ Asigna un empleado a la etapa ACTUAL de la orden — valida en el
  // backend que el rol del empleado coincida con el nombre de la etapa,
  // y dispara el correo de aviso al empleado.
  asignarEmpleado: async (id, empleadoId) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/asignar-empleado`, {
      method: "PATCH",
      body: { empleadoId },
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

  agregarHistorial: async (id, motivo, estado) => {
    const res = await httpRequest(`/produccion/ordenes/${id}/historial`, {
      method: "POST",
      body: { motivo, estado, user: getCurrentUserName(), id_usuario: getCurrentUserName() },
    });
    const data = res?.data || res;
    return toFrontendFormat(data);
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

  /**
   * Lista empleados activos para una etapa de producción junto con su carga
   * actual. El cargo coincide con el nombre de la etapa (Corte, Compras,
   * Recepción, etc.).
   */
  getEmployeeWorkload: async (cargo) => {
    const query = cargo ? `?cargo=${encodeURIComponent(cargo)}` : "";
    const res = await httpRequest(`/produccion/empleados/carga${query}`, { method: "GET" });
    const data = res?.data || res;
    return Array.isArray(data) ? data : [];
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
