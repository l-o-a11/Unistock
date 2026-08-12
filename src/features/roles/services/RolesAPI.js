/**
 * RolesAPI.js
 *
 * Convierte entre el formato del backend y el formato del frontend.
 *
 * Backend (RoleModel canónico):
 *   permisos: [{ modulo: { nombre: "insumos" }, privilegios: [{ nombre: "crear" }] }]
 *
 * Frontend (hook/form):
 *   modulos:  [{ moduloId: 4, privilegios: [2] }]
 */

import httpClient from "../../shared/utils/httpClient";

// ── Catálogos locales ─────────────────────────────────────────────────────────
// Nombres exactos del seed. Los IDs son locales al frontend (no son ObjectIds).
export const MODULOS_PREDETERMINADOS = [
  { id: 1, nombre: "usuarios" },
  { id: 2, nombre: "dashboard" },
  { id: 3, nombre: "empleados" },
  { id: 4, nombre: "roles" },
  { id: 5, nombre: "compras" },
  { id: 6, nombre: "insumos" },
  { id: 7, nombre: "categorias de insumos" },
  { id: 8, nombre: "produccion" },
  { id: 9, nombre: "proveedores" },
  { id: 10, nombre: "terceros" },
  { id: 11, nombre: "sedes" },
  { id: 12, nombre: "productos" },
  { id: 13, nombre: "categorias de productos" },
];

export const PRIVILEGIOS_PREDETERMINADOS = [
  { id: 1, nombre: "Leer", key: "leer" },
  { id: 2, nombre: "Crear", key: "crear" },
  { id: 3, nombre: "Actualizar", key: "actualizar" },
  { id: 4, nombre: "Eliminar", key: "eliminar" },
];

// ── Backend → Frontend ────────────────────────────────────────────────────────
// Entrada:  [{ modulo: { nombre: "insumos" }, privilegios: [{ nombre: "crear" }] }]
// Salida:   [{ moduloId: 6, privilegios: [2] }]
const permisosBackToFront = (permisos = []) =>
  permisos
    .map((p) => {
      // Soporta tanto string como objeto { nombre }
      const nombreModulo =
        typeof p.modulo === "object" ? (p.modulo?.nombre ?? "") : (p.modulo ?? "");

      const modulo = MODULOS_PREDETERMINADOS.find(
        (m) => m.nombre.toLowerCase() === nombreModulo.toLowerCase()
      );
      if (!modulo) return null;

      const privilegios = (p.privilegios ?? [])
        .map((priv) => {
          const nombre =
            typeof priv === "object" ? (priv.nombre ?? "") : (priv ?? "");
          return PRIVILEGIOS_PREDETERMINADOS.find(
            (pr) =>
              pr.key.toLowerCase() === nombre.toLowerCase() ||
              pr.nombre.toLowerCase() === nombre.toLowerCase()
          )?.id;
        })
        .filter(Boolean);

      return { moduloId: modulo.id, privilegios };
    })
    .filter(Boolean);

// ── Frontend → Backend ────────────────────────────────────────────────────────
// Entrada:  [{ moduloId: 6, privilegios: [2] }]
// Salida:   [{ modulo: "insumos", privilegios: ["crear"] }]
// El backend (rolePermissionValidator) convierte "insumos" →  { nombre: "insumos" }
const permisosFrontToBack = (modulos = []) =>
  modulos
    .map((m) => {
      const modulo = MODULOS_PREDETERMINADOS.find((mod) => mod.id === m.moduloId);
      if (!modulo) return null;

      const privilegios = (m.privilegios ?? [])
        .map((privId) => {
          const priv = PRIVILEGIOS_PREDETERMINADOS.find((p) => p.id === privId);
          return priv ? priv.key : null; // string: "crear", "leer", etc.
        })
        .filter(Boolean);

      return {
        modulo: modulo.nombre, // string directo que acepta el validador del backend
        privilegios,                // array de strings
      };
    })
    .filter(Boolean);

// ── Normalizar respuesta del backend ─────────────────────────────────────────
// backend:  { id, nombre, descripcion, estado, permisos }
// frontend: { id, nombre, descripcion, estado, modulos }
const normalizeRol = (rol) => ({
  id: String(rol.id ?? rol._id ?? ""),
  nombre: rol.nombre ?? "",
  descripcion: rol.descripcion ?? "",
  estado: rol.estado ?? true,
  modulos: permisosBackToFront(rol.permisos ?? []),
});

// ── API pública ───────────────────────────────────────────────────────────────
export const RolesAPI = {
  countUsers: async (id) => {
    return httpClient.get(`/roles/${id}/users-count`);
  },

  // GET /api/roles  — soporta ?search= ?estado= ?page= ?limit= ?sortBy= ?order=
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    const result = await httpClient.get(`/roles${qs ? `?${qs}` : ""}`);
    const lista = Array.isArray(result) ? result : (result?.data ?? []);
    return lista.map(normalizeRol);
  },

  // GET /api/roles/:id
  getById: async (id) => {
    const result = await httpClient.get(`/roles/${id}`);
    // La API envuelve en { success, data } — httpClient devuelve el JSON crudo
    const rol = result?.data ?? result;
    return normalizeRol(rol);
  },

  // POST /api/roles
  create: async (rolData) => {
    const body = {
      nombre: rolData.nombre,
      descripcion: rolData.descripcion,
      estado: rolData.estado ?? true,
      permisos: permisosFrontToBack(rolData.modulos ?? []),
    };
    const result = await httpClient.post("/roles", body);
    const rol = result?.data ?? result;
    return normalizeRol(rol);
  },

  // PUT /api/roles/:id
  update: async (id, rolData) => {
    const body = {
      ...(rolData.nombre !== undefined && { nombre: rolData.nombre }),
      ...(rolData.descripcion !== undefined && { descripcion: rolData.descripcion }),
      ...(rolData.estado !== undefined && { estado: rolData.estado }),
      ...(rolData.modulos !== undefined && {
        permisos: permisosFrontToBack(rolData.modulos),
      }),
    };
    const result = await httpClient.put(`/roles/${id}`, body);
    const rol = result?.data ?? result;
    return normalizeRol(rol);
  },

  // DELETE /api/roles/:id
  delete: async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para eliminar el rol.");
    }
    try {
      return await httpClient.delete(`/roles/${id}`, {
        body: { password: managerPassword },
      });
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if (status === 403) throw new Error("Contraseña del gerente incorrecta.");
      throw err;
    }
  },

  // PATCH /api/roles/:id/toggle
  toggle: async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para cambiar el estado del rol.");
    }
    try {
      const result = await httpClient.patch(`/roles/${id}/toggle`, {
        password: managerPassword,
      });
      const rol = result?.data ?? result;
      return normalizeRol(rol);
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if (status === 403) throw new Error("Contraseña del gerente incorrecta.");
      throw err;
    }
  },

  // Catálogos locales (sin petición extra al servidor)
  getModulos: async () => [...MODULOS_PREDETERMINADOS],
  getPrivilegios: async () => [...PRIVILEGIOS_PREDETERMINADOS],
};