import { get, post, put, deleteRequest } from "../../shared/utils/httpClient";

const internal = {
  getUsers: async () => {
    try {
      const res = await get("/users");
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  getUserById: async (id) => {
    try {
      const res = await get(`/users/${id}`);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  createUser: async (data) => {
    try {
      const res = await post("/users", data);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await put(`/users/${id}`, data);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await deleteRequest(`/users/${id}`);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },
};

// API pública con los nombres que esperan los hooks/components
export const userAPI = {
  getAll: internal.getUsers,
  getById: internal.getUserById,
  create: internal.createUser,
  update: internal.updateUser,
  delete: internal.deleteUser,
  // FIX: la API usa PATCH /users/:id/status, no PUT /users/:id/toggle
  toggleStatus: async (id) => {
    try {
      const { patch } = await import("../../shared/utils/httpClient");
      const res = await patch(`/users/${id}/status`);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },
  // Catálogos usados por useCatalogs / AuthContext
  getRoles: async () => {
    try {
      const res = await get("/roles");
      // La API puede devolver array plano o { data: [...] }
      const payload = res?.data ?? res;
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (err) {
      throw err?.data || err;
    }
  },
  // FIX: la API monta las sedes en /sites, no en /sedes
  getSedes: async () => {
    try {
      const res = await get("/sites");
      // La API puede devolver array plano o { data: [...] }
      const payload = res?.data ?? res;
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (err) {
      throw err?.data || err;
    }
  },

  // POST /api/auth/verify-password — valida la contraseña del usuario autenticado.
  // Lanza error si la contraseña es incorrecta (401), lo que permite al llamador
  // detener la acción y mostrar feedback sin ejecutar la operación sensible.
  // POST /api/auth/verify-password
  // Valida la contraseña del usuario autenticado antes de operaciones sensibles.
  // Lanza si la contraseña es incorrecta — el llamador detiene la acción.
  // POST /api/auth/verify-password
  // skipAuth: true → evita que httpClient haga logout automático si la
  // contraseña es incorrecta (401). El llamador maneja el error manualmente.
  verifyPassword: async (password) => {
    try {
      const res = await post("/auth/verify-password", { password }, { skipAuth: true });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },
};

export default userAPI;