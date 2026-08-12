/**
 * supplies/services/supplyAPI.js
 *
 * Llamadas reales al backend. Endpoint base: /api/insumos
 *
 * Reglas de negocio aplicadas en el frontend:
 *  1. create: datos obligatorios + al menos 1 propiedad antes de enviar.
 *  2. create/update: normalización de valores de propiedades (mayúscula inicial).
 *  3. create/update: imagen se envía como multipart/form-data (campo "imagen", File object).
 *  4. delete: la contraseña del gerente es obligatoria.
 *  5. delete / toggle: los errores del backend (409, 403) se relanzan con mensaje claro.
 *  6. Duplicados: el backend responde 409; se captura y relanza con mensaje legible.
 *  7. resolveString: los selectores pueden enviar objetos en vez de strings; se normaliza.
 */

import httpClient from "../../shared/utils/httpClient";

// ── fetch nativo para multipart/form-data ─────────────────────────────────────
// El httpClient centralizado serializa el body como JSON y fija Content-Type:
// application/json, lo que impide enviar FormData correctamente.
// Este helper usa fetch directo SOLO para las llamadas que llevan imagen;
// el resto del módulo sigue usando httpClient sin cambios.

const API_URL = import.meta.env.VITE_API_URL || "https://api-unistock.onrender.com/";

const getToken = () => {
  try {
    const raw = localStorage.getItem("session_user") || sessionStorage.getItem("session_user");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

/**
 * Envía un FormData al backend usando fetch nativo.
 * NO fijar Content-Type — el browser lo genera con el boundary correcto.
 */
const fetchForm = async (method, path, formData) => {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || `HTTP Error ${res.status}`);
    error.status = res.status;
    error.data = err;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * El formulario puede entregar un campo como string puro o como objeto
 * { id, nombre, valor, label, clave, ... } según cómo lo resuelva el selector.
 * Este helper extrae siempre el string correcto según el tipo de campo.
 *
 *  prefer = "id"    → para categoría (ObjectId string)
 *  prefer = "valor" → para medida    (ej: "cja", "kg")
 *  prefer = "clave" → para propiedad.clave
 *  prefer = "label" → para propiedad.label
 */
const resolveString = (value, prefer = "id") => {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  // Objeto — extraer el campo correcto según prefer
  let extracted;
  switch (prefer) {
    case "valor": extracted = value.valor ?? value.id ?? value._id ?? ""; break;
    case "clave": extracted = value.clave ?? value.id ?? value._id ?? ""; break;
    case "label": extracted = value.label ?? value.nombre ?? ""; break;
    default: extracted = value.id ?? value._id ?? value.valor ?? ""; break;
  }
  return String(extracted).trim() || null;
};

/**
 * Normaliza el valor de una propiedad:
 * primera letra mayúscula, resto minúsculas.
 * Ej: "ROJO" → "Rojo" | "algodón pima" → "Algodón pima"
 */
const normalizePropertyValue = (valor) => {
  const str = typeof valor === "string" ? valor : String(valor ?? "");
  if (!str.trim()) return str;
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
};

/**
 * Normaliza un array de propiedades:
 *  - Extrae clave y label cuando llegan como objeto (desde selector).
 *  - Normaliza el valor (mayúscula inicial, resto minúscula).
 */
const normalizeProperties = (propiedades = []) =>
  propiedades.map((p) => ({
    clave: resolveString(p.clave, "clave") ?? "",
    label: resolveString(p.label, "label") ?? resolveString(p.clave, "label") ?? "",
    valor: normalizePropertyValue(p.valor),
  }));

/**
 * Extrae el mensaje de error del backend.
 */
const extractErrorMessage = (err, fallback) =>
  err?.response?.data?.message ?? err?.message ?? fallback;

// ── Normaliza un insumo recibido del backend ──────────────────────────────────

/**
 * El backend guarda la imagen como:
 *   imagen:         String  → URL pública de Cloudinary (o null)
 *   imagenPublicId: String  → public_id para poder eliminarla (o null)
 *
 * No existe imagenes_Url en el schema; ese campo se descarta en el backend.
 */
const normalizeSupply = (raw) => ({
  id: String(raw.id ?? raw._id ?? ""),
  nombre: raw.nombre ?? "",
  categoria: raw.categoria?.id
    ? raw.categoria
    : raw.categoria ?? null,
  categoriaId: raw.categoria?.id ?? raw.categoria ?? null,
  stock: raw.stock ?? 0,
  valor_medida: raw.valor_medida ?? 0,
  valorMedida: raw.valor_medida ?? 0,
  medida: raw.medida ?? "",
  medidaId: raw.medida ?? "",
  imagen: raw.imagen ?? null,               // URL string de Cloudinary
  imagenPublicId: raw.imagenPublicId ?? null,
  estado: raw.estado ?? true,
  propiedades: Array.isArray(raw.propiedades) ? raw.propiedades : [],
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

/**
 * Construye un FormData listo para enviar a multer en el backend.
 * Las propiedades se serializan como JSON string porque multer/body-parser
 * no puede parsear arrays anidados desde campos form normales.
 *
 * @param {object} fields   - campos de texto { nombre, categoria, ... }
 * @param {File|null} imageFile - File object del input[type=file] (o null)
 */
const buildFormData = (fields, imageFile) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Arrays/objetos se serializan como JSON
      fd.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    }
  });
  if (imageFile instanceof File) {
    fd.append("imagen", imageFile);
  }
  return fd;
};

// ── API ───────────────────────────────────────────────────────────────────────

export const supplyAPI = {
  /**
   * GET /api/insumos
   * Soporta: ?search= ?categoria= ?estado= ?page= ?limit= ?sortBy= ?order=
   */
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
    ).toString();
    const result = await httpClient.get(`/insumos${qs ? `?${qs}` : ""}`);
    const payload = result?.data ?? result;

    if (Array.isArray(payload)) {
      return {
        data: payload.map(normalizeSupply),
        total: payload.length,
        page: 1,
        limit: payload.length,
        totalPages: 1,
      };
    }
    return {
      data: (payload?.data ?? []).map(normalizeSupply),
      total: payload?.total ?? 0,
      page: payload?.page ?? 1,
      limit: payload?.limit ?? 10,
      totalPages: payload?.totalPages ?? 1,
    };
  },

  /** GET /api/insumos/:id */
  getById: async (id) => {
    const result = await httpClient.get(`/insumos/${id}`);
    const raw = result?.data ?? result;
    return normalizeSupply(raw);
  },

  /**
   * POST /api/insumos
   *
   * Envía multipart/form-data para que multer procese el archivo "imagen".
   * Si no hay imagen, envía igualmente FormData (multer lo acepta sin req.file).
   *
   * Antes de enviar:
   *  - Resuelve medida y categoría (pueden llegar como objeto o string).
   *  - Valida campos obligatorios.
   *  - Exige al menos 1 propiedad con estructura completa.
   *  - Normaliza valores de propiedades.
   *
   * supplyData espera:
   *  { nombre, categoriaId, medidaId, valorMedida, stock, propiedades, imageFile? }
   *  imageFile debe ser un File object del input[type=file] (no base64).
   */
  create: async (supplyData) => {
    // Resolver campos que el selector puede entregar como objeto o string
    const medida = resolveString(supplyData.medidaId, "valor")
      ?? resolveString(supplyData.medida, "valor");
    const categoria = resolveString(supplyData.categoriaId, "id")
      ?? resolveString(supplyData.categoria, "id");

    // ── Validación campos obligatorios ────────────────────────────────────────
    const missing = [];
    if (!supplyData.nombre?.trim()) missing.push("nombre");
    if (!categoria) missing.push("categoria");
    if (supplyData.valorMedida == null && supplyData.valor_medida == null) missing.push("valor_medida");
    if (!medida) missing.push("medida");
    if (supplyData.stock == null) missing.push("stock");

    if (missing.length > 0) {
      throw new Error(`Campos obligatorios faltantes: ${missing.join(", ")}`);
    }

    // ── Regla: al menos 1 propiedad ───────────────────────────────────────────
    const props = supplyData.propiedades ?? [];
    if (props.length === 0) {
      throw new Error("El insumo debe tener al menos una propiedad.");
    }

    // Normalizar propiedades antes de validar (resuelve claves que llegan como objeto)
    const propiedadesNorm = normalizeProperties(props);

    const emptyProp = propiedadesNorm.find(
      (p) => !p.clave?.trim() || !p.label?.trim() || !p.valor?.trim(),
    );
    if (emptyProp) {
      throw new Error("Cada propiedad debe tener clave, label y valor.");
    }

    try {
      const body = {
        nombre: supplyData.nombre.trim(),
        categoria,
        stock: supplyData.stock ?? 0,
        valor_medida: supplyData.valorMedida ?? supplyData.valor_medida,
        medida,
        propiedades: propiedadesNorm,
      };

      let result;
      if (supplyData.imageFile instanceof File) {
        // Con imagen: fetch nativo con FormData para que multer reciba el archivo
        const fd = buildFormData(body, supplyData.imageFile);
        result = await fetchForm("POST", "/insumos", fd);
      } else {
        // Sin imagen: JSON normal a través del httpClient habitual
        result = await httpClient.post("/insumos", body);
      }
      const raw = result?.data ?? result;
      return normalizeSupply(raw);
    } catch (err) {
      if (err?.response?.status === 409) {
        throw new Error("Ya existe un insumo con ese nombre en esta categoría.");
      }
      throw new Error(extractErrorMessage(err, "Error al crear el insumo."));
    }
  },

  /**
   * PUT /api/insumos/:id
   *
   * Envía multipart/form-data igual que create.
   * Para eliminar la imagen sin subir una nueva, incluir { eliminarImagen: true }.
   *
   * supplyData espera los mismos campos que create, todos opcionales, más:
   *  { imageFile?: File, eliminarImagen?: boolean }
   */
  update: async (id, supplyData) => {
    const fields = {};

    if (supplyData.nombre != null) fields.nombre = supplyData.nombre.trim();

    const categoria = resolveString(supplyData.categoriaId, "id")
      ?? resolveString(supplyData.categoria, "id");
    if (categoria != null) fields.categoria = categoria;

    if (supplyData.stock != null) fields.stock = supplyData.stock;

    const vm = supplyData.valorMedida ?? supplyData.valor_medida;
    if (vm != null) fields.valor_medida = vm;

    const medida = resolveString(supplyData.medidaId, "valor")
      ?? resolveString(supplyData.medida, "valor");
    if (medida != null) fields.medida = medida;

    // Señal para que el backend elimine la imagen actual sin reemplazarla
    if (supplyData.eliminarImagen) fields.eliminarImagen = "true";

    if (supplyData.propiedades != null) {
      if (supplyData.propiedades.length === 0) {
        throw new Error("El insumo debe mantener al menos una propiedad.");
      }
      fields.propiedades = normalizeProperties(supplyData.propiedades);
    }

    try {
      let result;
      if (supplyData.imageFile instanceof File || supplyData.eliminarImagen) {
        // Con imagen o eliminación: fetch nativo con FormData para multer
        const fd = buildFormData(fields, supplyData.imageFile ?? null);
        result = await fetchForm("PUT", `/insumos/${id}`, fd);
      } else {
        // Sin cambio de imagen: JSON normal a través del httpClient habitual
        result = await httpClient.put(`/insumos/${id}`, fields);
      }
      const raw = result?.data ?? result;
      return normalizeSupply(raw);
    } catch (err) {
      if (err?.response?.status === 409) {
        throw new Error("Ya existe un insumo con ese nombre en esta categoría.");
      }
      throw new Error(extractErrorMessage(err, "Error al actualizar el insumo."));
    }
  },

  /**
   * DELETE /api/insumos/:id
   *
   * Requiere la contraseña del gerente.
   * El backend verifica: contraseña + que no tenga registros en fichas técnicas.
   */
  delete: async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para eliminar un insumo.");
    }

    try {
      return await httpClient.delete(`/insumos/${id}`, {
        body: { password: managerPassword },
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) throw new Error("Contraseña del gerente incorrecta.");
      if (status === 409) throw new Error("No se puede eliminar: el insumo está referenciado en materiales de fichas técnicas.");
      throw new Error(extractErrorMessage(err, "Error al eliminar el insumo."));
    }
  },

  /**
   * PATCH /api/insumos/:id/toggle
   * El backend bloquea si el insumo tiene registros asociados.
   */
  toggle: async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para cambiar el estado del insumo.");
    }

    try {
      const result = await httpClient.patch(`/insumos/${id}/toggle`, {
        password: managerPassword,
      });
      const raw = result?.data ?? result;
      return normalizeSupply(raw);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) throw new Error("Contraseña del gerente incorrecta.");
      if (status === 409) {
        throw new Error("No se puede cambiar el estado: el insumo está referenciado en materiales de fichas técnicas.");
      }
      throw new Error(extractErrorMessage(err, "Error al cambiar el estado del insumo."));
    }
  },

  // ── Catálogos ─────────────────────────────────────────────────────────────

  /** GET /api/insumos/catalogos/medidas */
  getMedidas: async () => {
    const result = await httpClient.get("/insumos/catalogos/medidas");
    const list = result?.data ?? result;
    return (Array.isArray(list) ? list : []).map((m) => ({
      id: m.valor ?? m.id,
      nombre: m.label ?? m.nombre,
      valor: m.valor ?? m.id,
      label: m.label ?? m.nombre,
    }));
  },

  /** GET /api/insumos/catalogos/propiedades */
  getPropiedades: async () => {
    const result = await httpClient.get("/insumos/catalogos/propiedades");
    const list = result?.data ?? result;
    return (Array.isArray(list) ? list : []).map((p) => ({
      id: p.clave ?? p.id,
      nombre: p.label ?? p.nombre,
      clave: p.clave ?? p.id,
      label: p.label ?? p.nombre,
    }));
  },

  /** GET /api/categorias-insumos?estado=true&limit=100 */
  getCategorias: async () => {
    const result = await httpClient.get("/categorias-insumos?estado=true&limit=100");
    const payload = result?.data ?? result;
    const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return list.map((c) => ({
      id: c.id ?? c._id,
      nombre: c.nombre ?? "",
      descripcion: c.descripcion ?? "",
      estado: c.estado ?? true,
    }));
  },
};