/**
 * RolesAPI.js
 *
 * Conectado a back_unistock → VITE_BACK_URL/roles  (puerto 3020)
 *
 * El backend guarda los permisos como:
 *   permisos: [{ modulo: { nombre: 'insumos' }, privilegios: [{ nombre: 'crear' }] }]
 *
 * El frontend los usa como:
 *   modulos: [{ moduloId: 4, privilegios: [2] }]
 *
 * Este archivo convierte en ambas direcciones para que el resto
 * del frontend (hooks, páginas, formularios) no cambie nada.
 */

import httpClient from "../../shared/utils/httpClient";

// ── Catálogos locales ─────────────────────────────────────────────────────────
// Deben coincidir con los nombres que siembra el seed del backend.
export const MODULOS_PREDETERMINADOS = [
  { id: 1,  nombre: "dashboard" },
  { id: 2,  nombre: "usuarios" },
  { id: 3,  nombre: "categorías de insumos" },
  { id: 4,  nombre: "insumos" },
  { id: 5,  nombre: "proveedores" },
  { id: 6,  nombre: "compras" },
  { id: 7,  nombre: "categorías de productos" },
  { id: 8,  nombre: "productos" },
  { id: 9,  nombre: "produccion" },
  { id: 10, nombre: "terceros" },
  { id: 11, nombre: "empleados" },
  { id: 12, nombre: "sedes" },
  { id: 13, nombre: "roles" },
];

export const PRIVILEGIOS_PREDETERMINADOS = [
  { id: 1, nombre: "Leer",       key: "leer" },
  { id: 2, nombre: "Crear",      key: "crear" },
  { id: 3, nombre: "Actualizar", key: "actualizar" },
  { id: 4, nombre: "Eliminar",   key: "eliminar" },
];

// ── Conversión backend → frontend ─────────────────────────────────────────────
// backend:  [{ modulo: { nombre: 'insumos' }, privilegios: [{ nombre: 'crear' }] }]
// frontend: [{ moduloId: 4, privilegios: [2] }]
const permisosBackToFront = (permisos = []) =>
  permisos
    .map((p) => {
      const nombreModulo = p.modulo?.nombre ?? "";
      const modulo = MODULOS_PREDETERMINADOS.find(
        (m) => m.nombre.toLowerCase() === nombreModulo.toLowerCase()
      );
      const privilegios = (p.privilegios ?? [])
        .map((priv) => {
          const nombre = typeof priv === "object" ? priv.nombre : priv;
          return PRIVILEGIOS_PREDETERMINADOS.find(
            (pr) =>
              pr.key.toLowerCase()    === nombre.toLowerCase() ||
              pr.nombre.toLowerCase() === nombre.toLowerCase()
          )?.id;
        })
        .filter(Boolean);

      return modulo ? { moduloId: modulo.id, privilegios } : null;
    })
    .filter(Boolean);

// ── Conversión frontend → backend ─────────────────────────────────────────────
// frontend: [{ moduloId: 4, privilegios: [2] }]
// backend:  [{ modulo: { nombre: 'insumos' }, privilegios: [{ nombre: 'crear' }] }]
const permisosFrontToBack = (modulos = []) =>
  modulos
    .map((m) => {
      const modulo = MODULOS_PREDETERMINADOS.find((mod) => mod.id === m.moduloId);
      if (!modulo) return null;

      // Convierte los IDs de privilegios a sus keys (strings)
      const privilegios = (m.privilegios ?? [])
        .map((privId) => {
          const priv = PRIVILEGIOS_PREDETERMINADOS.find((p) => p.id === privId);
          return priv ? priv.key : null;  // ← string ("crear", "leer", etc.)
        })
        .filter(Boolean);

      return {
        modulo: modulo.nombre, // ← string directo, ej: "insumos"
        privilegios,           // ← arreglo de strings, ej: ["crear"]
      };
    })
    .filter(Boolean);
    
// ── Normalizar rol del backend al formato del frontend ────────────────────────
// backend:  { _id, nombre, descripcion, estado, permisos }
// frontend: { id,  nombre, descripcion, estado, modulos }
const normalizeRol = (rol) => ({
  id:          rol._id  ?? rol.id,
  nombre:      rol.nombre,
  descripcion: rol.descripcion,
  estado:      rol.estado ?? true,
  modulos:     permisosBackToFront(rol.permisos ?? []),
});

// ── API pública (ahora con métodos HTTP igual que productAPI) ────────────────
export const RolesAPI = {

  /**
   * GET /api/roles
   * Soporta: ?search= ?estado= ?page= ?limit= ?sortBy= ?order=
   */
  getAll: async (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    const endpoint = `/roles${qs ? `?${qs}` : ""}`;

    // httpClient.get devuelve directamente los datos (response.data)
    const result = await httpClient.get(endpoint);
    const lista = Array.isArray(result) ? result : (result?.data ?? []);
    return lista.map(normalizeRol);
  },

  /**
   * GET /api/roles/:id
   */
  getById: async (id) => {
    const rol = await httpClient.get(`/roles/${id}`);
    return normalizeRol(rol);
  },

  /**
   * POST /api/roles
   * Recibe formato frontend: { nombre, descripcion, estado, modulos }
   */
  create: async (rolData) => {
    const body = {
      nombre:      rolData.nombre,
      descripcion: rolData.descripcion,
      estado:      rolData.estado ?? true,
      permisos:    permisosFrontToBack(rolData.modulos ?? []),
    };
    const rol = await httpClient.post("/roles", body);
    return normalizeRol(rol);
  },

  /**
   * PUT /api/roles/:id
   */
  update: async (id, rolData) => {
    const body = {
      ...(rolData.nombre      !== undefined && { nombre:      rolData.nombre }),
      ...(rolData.descripcion !== undefined && { descripcion: rolData.descripcion }),
      ...(rolData.estado      !== undefined && { estado:      rolData.estado }),
      ...(rolData.modulos     !== undefined && {
        permisos: permisosFrontToBack(rolData.modulos),
      }),
    };
    const rol = await httpClient.put(`/roles/${id}`, body);
    return normalizeRol(rol);
  },

  /**
   * DELETE /api/roles/:id
   * El backend bloquea si hay usuarios activos con ese rol.
   */
  delete: async (id) => {
    return httpClient.delete(`/roles/${id}`);
  },

  /**
   * PATCH /api/roles/:id/toggle
   * Activa o inactiva el rol.
   */
  toggle: async (id) => {
    const rol = await httpClient.patch(`/roles/${id}/toggle`);
    return normalizeRol(rol);
  },

  // ── Catálogos (compatibilidad con el hook actual) ─────────────────────────
  // Se devuelven los locales — no hace falta llamar al backend para esto.
  getModulos:     async () => [...MODULOS_PREDETERMINADOS],
  getPrivilegios: async () => [...PRIVILEGIOS_PREDETERMINADOS],
};