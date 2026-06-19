/**
 * thirdPartyAPI.js
 *
 * Servicio de comunicación con el backend para el módulo de Terceros.
 * Endpoint base: GET|POST|PUT|DELETE|PATCH /api/terceros
 *
 * Normalización:
 *  - El frontend usa: nombreEmpresa, nombreContacto, correo, sitioWeb (camelCase)
 *  - El backend devuelve: nombre_empresa, nombre_contacto, correo_empresa, sitio_web (snake_case)
 *  - toFrontend() convierte la respuesta del backend al formato que el front espera.
 *  - toBackend()  convierte el payload del formulario al formato del backend.
 */

import httpClient from '../../shared/utils/httpClient';

// ─── Mapeo back → front ───────────────────────────────────────────────────────
const toFrontend = (doc) => {
  if (!doc) return null;

  // Normaliza valores provenientes del backend para que coincidan con lo que el
  // formulario front usa: nombreEmpresa, nombreContacto, nit, direccion, telefono, etc.

  const rawCodigo = doc.codigo ?? doc.CODIGO ?? doc.codigo_tercero ?? '';
  const codigoNumerico = typeof rawCodigo === 'string'
    ? (rawCodigo.match(/\d+/)?.[0] ?? rawCodigo)
    : rawCodigo;

  const nitValue = doc.nit ?? doc.NIT ?? doc.nit_empresa ?? doc.nitEmpresa ?? '';

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const nombreEmpresaValue =
    doc.nombre_empresa ??
    doc.nombreEmpresa ??
    doc.nombre_empresa_tercero ??
    doc.nombre_empresa_empresa ??
    '';

  const nombreContactoValue =
    doc.nombre_contacto ??
    doc.nombreContacto ??
    doc.contacto ??
    doc.contacto_principal ??
    doc.contactoPrincipal ??
    '';

  const telefonoValue = doc.telefono ?? doc.phone ?? doc.telefono_empresa ?? '';
  const direccionValue = doc.direccion ?? doc.direccion_empresa ?? '';

  return {
    id: doc.id ?? doc._id,
    codigo: codigoNumerico,
    nit: nitValue || '',

    nombreEmpresa: nombreEmpresaValue || '',
    nombre: nombreEmpresaValue || '',

    nombreContacto: nombreContactoValue || '',
    contacto: nombreContactoValue || '',

    direccion: direccionValue || '',
    telefono: telefonoValue || '',

    correoEmpresa: doc.correo_empresa ?? doc.correoEmpresa ?? doc.correo ?? '',
    correo: doc.correo_empresa ?? doc.correoEmpresa ?? doc.correo ?? '',

    correoContacto: doc.correo_contacto ?? doc.correoContacto ?? '',

    sitioWeb: doc.sitio_web ?? doc.sitioWeb ?? '',

    estado: doc.estado ?? true,
    producciones: (doc.producciones ?? []).map(p => ({
      // ✅ Fix: ProductionAPI usa `orderNumber` e `id` (no `_id` ni `orden`)
      orden:        p.orden        || p.orderNumber || p.numero_orden || '',
      fecha:        formatDate(p.fecha),
      produccionId: p.produccionId || p.id || p._id || '',
      cantidad:     Number(p.cantidad) || 0,
      // ✅ Incluir estado de la orden para filtrado en detalle del tercero
      estado:       p.estado || p.orderStatus || null,
    })),
  };
};

// ─── Mapeo front → back ───────────────────────────────────────────────────────
const toBackend = (data) => ({
  // Backend (thirdPartiesController) valida campos requeridos en camelCase:
  // nombre, contacto, direccion, telefono.
  // También soporta snake_case para otros flujos/repository.
  nit: data.nit || null,

  // ✅ Campos requeridos para el controller
  nombre: data.nombreEmpresa || data.nombre || data.nombre_empresa || null,
  contacto: data.nombreContacto || data.contacto || data.nombre_contacto || null,

  // Campos snake_case (compatibilidad)
  nombre_empresa: data.nombreEmpresa || data.nombre || data.nombre_empresa || null,
  nombre_contacto: data.nombreContacto || data.contacto || data.nombre_contacto || null,

  direccion: data.direccion || null,
  telefono: data.telefono || null,

  correo_empresa: data.correoEmpresa || data.correo || data.correo_empresa || null,
  correo_contacto: data.correoContacto || data.correoContacto || data.correo_contacto || null,
  sitio_web: data.sitioWeb || data.sitio_web || null,

  estado: data.estado,
});

// ─── Extrae el array/datos de la respuesta del backend ────────────────────────
const extractData = (response) => {
  // El backend devuelve { success: true, data: { data: [], total, ... } }
  // o { success: true, data: [...] }
  if (Array.isArray(response))            return response;
  if (Array.isArray(response?.data))      return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const extractOne = (response) => {
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
};

// ─── API pública ─────────────────────────────────────────────────────────────
export const thirdPartyAPI = {

  /** GET /api/terceros — lista completa con filtros opcionales */
  async getAll(params = {}) {
    try {
      const query = new URLSearchParams({
        limit: 100,
        ...params,
      }).toString();
      const response = await httpClient.get(`/terceros?${query}`);
      return extractData(response).map(toFrontend);
    } catch (err) {
      console.error('[thirdPartyAPI] getAll error:', err?.message);
      throw err;
    }
  },

  /** GET /api/terceros/:id */
  async getById(id) {
    try {
      const response = await httpClient.get(`/terceros/${id}`);
      return toFrontend(extractOne(response));
    } catch (err) {
      console.error('[thirdPartyAPI] getById error:', err?.message);
      throw err;
    }
  },

  /** POST /api/terceros */
  async create(data) {
    try {
      const response = await httpClient.post('/terceros', toBackend(data));
      return toFrontend(extractOne(response));
    } catch (err) {
      console.error('[thirdPartyAPI] create error:', err?.message);
      throw err;
    }
  },

  /** PUT /api/terceros/:id */
  async update(id, data) {
    try {
      const response = await httpClient.put(`/terceros/${id}`, toBackend(data));
      return toFrontend(extractOne(response));
    } catch (err) {
      console.error('[thirdPartyAPI] update error:', err?.message);
      throw err;
    }
  },

  /** DELETE /api/terceros/:id */
  async delete(id) {
    try {
      return await httpClient.delete(`/terceros/${id}`);
    } catch (err) {
      console.error('[thirdPartyAPI] delete error:', err?.message);
      throw err;
    }
  },

  /** PATCH /api/terceros/:id/toggle — activa o inactiva */
  async toggle(id) {
    try {
      const response = await httpClient.patch(`/terceros/${id}/toggle`, {});
      return toFrontend(extractOne(response));
    } catch (err) {
      console.error('[thirdPartyAPI] toggle error:', err?.message);
      throw err;
    }
  },

  /** POST /api/terceros/:id/producciones — vincula una orden al tercero */
  async linkProduccion(id, { orden, fecha, produccionId, cantidad }) {
    try {
      const response = await httpClient.post(
        `/terceros/${id}/producciones`,
        { orden, fecha, produccionId, cantidad: Number(cantidad) || 0 }
      );
      return toFrontend(extractOne(response));
    } catch (err) {
      // Endpoint puede no existir aún en backend — error silencioso
      return null;
    }
  },
};
