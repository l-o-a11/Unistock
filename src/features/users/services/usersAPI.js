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

  // Igual que getUsers pero excluye Gerente y Administrador directamente en MongoDB
  getEmployees: async () => {
    try {
      const res = await get("/users?excludeRoleNames=Gerente,Administrador");
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
  getEmployees: internal.getEmployees,
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
  // FIX: este endpoint está protegido por requireAuth y necesita el token
  // para saber QUÉ usuario está confirmando su contraseña. Antes se usaba
  // skipAuth:true pensando en evitar solo el logout automático, pero esa
  // misma bandera también omitía el token → la petición SIEMPRE fallaba
  // con 401 "Token no proporcionado", sin importar la contraseña.
  // Ahora se manda el token (skipAuth queda en false) y solo se suprime
  // el logout automático con suppressAutoLogout, para no cerrar la sesión
  // real solo porque el usuario se equivocó al escribir su contraseña.
  verifyPassword: async (password) => {
    try {
      const res = await post("/auth/verify-password", { password }, { suppressAutoLogout: true });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },
};

export default userAPI;