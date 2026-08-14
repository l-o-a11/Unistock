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
import { withCache, invalidateCacheByPrefix } from '../../shared/utils/apicache';

const CACHE_PREFIX = 'third-parties:';

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
  correo_contacto: data.correoContacto || data.correo_contacto || null,
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

  /**
   * GET /api/terceros — lista completa con filtros opcionales
   *
   * 🐛 FIX (rendimiento): antes se llamaba directo a httpClient cada vez.
   * Como thirdPartyAPI.getAll() se invoca de forma independiente desde
   * varios componentes (ProductForm, ThirdPartiesSection,
   * ProductionAlerts, ProductionDetailsPage...), montarlos juntos disparaba
   * varias peticiones idénticas al backend en paralelo. Ahora se envuelve
   * con `withCache`: si ya hay una petición en vuelo para los mismos
   * `params`, se reusa la misma promesa; si ya se pidió hace menos de 60s,
   * se reusa el resultado en memoria en vez de volver a golpear la red.
   *
   * Usa `{ force: true }` en `params` para forzar una recarga (p. ej. justo
   * después de crear/editar un tercero, aunque normalmente no hace falta
   * porque create/update/delete/toggle ya invalidan el caché).
   */
  async getAll(params = {}) {
    const { force, ...queryParams } = params;
    const cacheKey = `${CACHE_PREFIX}getAll:${JSON.stringify(queryParams)}`;
    return withCache(cacheKey, async () => {
      try {
        const query = new URLSearchParams({
          limit: 100,
          ...queryParams,
        }).toString();
        const response = await httpClient.get(`/terceros?${query}`);
        return extractData(response).map(toFrontend);
      } catch (err) {
        console.error('[thirdPartyAPI] getAll error:', err?.message);
        throw err;
      }
    }, { force });
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
      invalidateCacheByPrefix(CACHE_PREFIX); // los datos cacheados quedaron obsoletos
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
      invalidateCacheByPrefix(CACHE_PREFIX);
      return toFrontend(extractOne(response));
    } catch (err) {
      console.error('[thirdPartyAPI] update error:', err?.message);
      throw err;
    }
  },

  /** DELETE /api/terceros/:id */
  async delete(id) {
    try {
      const result = await httpClient.delete(`/terceros/${id}`);
      invalidateCacheByPrefix(CACHE_PREFIX);
      return result;
    } catch (err) {
      console.error('[thirdPartyAPI] delete error:', err?.message);
      throw err;
    }
  },

  /** PATCH /api/terceros/:id/toggle — activa o inactiva */
  async toggle(id) {
    try {
      const response = await httpClient.patch(`/terceros/${id}/toggle`, {});
      invalidateCacheByPrefix(CACHE_PREFIX);
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
      invalidateCacheByPrefix(CACHE_PREFIX);
      return toFrontend(extractOne(response));
    } catch (err) {
      // Endpoint puede no existir aún en backend — error silencioso
      return null;
    }
  },
};