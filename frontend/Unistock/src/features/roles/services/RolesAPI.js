import { get, post, put, deleteRequest } from "../../shared/utils/httpClient";

// Privilegios y módulos predeterminados usados por los formularios
export const PRIVILEGIOS_PREDETERMINADOS = [
  { id: 1, nombre: "Ver" },
  { id: 2, nombre: "Crear" },
  { id: 3, nombre: "Editar" },
  { id: 4, nombre: "Eliminar" },
];

export const MODULOS_PREDETERMINADOS = [
  { id: 1, nombre: "Dashboard" },
  { id: 2, nombre: "Usuarios" },
  { id: 3, nombre: "Categorías de insumos" },
  { id: 4, nombre: "Insumos" },
  { id: 5, nombre: "Proveedores" },
  { id: 6, nombre: "Compras" },
  { id: 7, nombre: "Categorías de productos" },
  { id: 8, nombre: "Productos" },
  { id: 9, nombre: "Producción" },
  { id: 10, nombre: "Terceros" },
  { id: 11, nombre: "Empleados" },
  { id: 12, nombre: "Sedes" },
  { id: 13, nombre: "Roles" },
];

export const RolesAPI = {
  getAll: async () => {
    try {
      const res = await get("/roles");
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  getById: async (id) => {
    try {
      const res = await get(`/roles/${id}`);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  create: async (data) => {
    try {
      const res = await post("/roles", data);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  update: async (id, data) => {
    try {
      const res = await put(`/roles/${id}`, data);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  delete: async (id) => {
    try {
      const res = await deleteRequest(`/roles/${id}`);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  toggle: async (id) => {
    try {
      const res = await put(`/roles/${id}/toggle`);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  // Devuelve cuántos usuarios están vinculados a un rol (estructura { total })
  countUsers: async (rolId) => {
    try {
      const res = await get(`/roles/${rolId}/users/count`);
      return res?.data ?? res;
    } catch (err) {
      // si no existe el endpoint, devolver 0 para no bloquear UI
      console.warn("RolesAPI.countUsers fallback:", err);
      return { total: 0 };
    }
  },
};

export default RolesAPI;
