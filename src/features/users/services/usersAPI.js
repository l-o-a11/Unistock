import { get, post, put, deleteRequest } from "../../shared/utils/httpClient";

// Compatibilidad con formularios previos que enviaban `cargos` en plural.
// La API persiste el campo canónico `cargo` como arreglo.
// Solo se incluye `cargo` si el payload original contenía `cargo` o `cargos`.
// Si no viene ninguno, se omite para no sobrescribir datos existentes en BD.
const normalizeUserPayload = (data = {}) => {
  const { cargos, cargo, ...rest } = data;
  // Si explícitamente se envió cargos o cargo, normalizar y agregar.
  // Si no se mencionó ninguno, no tocar el campo en BD.
  if (cargo !== undefined || cargos !== undefined) {
    return {
      ...rest,
      cargo: cargo ?? cargos ?? [],
    };
  }
  return rest;
};

/**
 * Extrae un mensaje legible desde el error de la API.
 * El backend responde con { success: false, message: "..." }.
 * err puede ser un Error (de red) o un objeto { message } (respuesta API).
 */
const extractError = (err) => {
  // Si err ya es un Error y no tiene data, devolverlo tal cual
  if (err instanceof Error && !err.data) return err;
  // Si err tiene .data con .message, usarlo
  if (err?.data?.message) {
    const e = new Error(err.data.message);
    e.status = err.status;
    e.data = err.data;
    return e;
  }
  // Si err mismo es un objeto con .message (ej: err?.data devuelve { message })
  if (err?.message) {
    const e = new Error(err.message);
    e.status = err.status;
    e.data = err.data;
    return e;
  }
  // Fallback genérico
  return new Error("Error desconocido en la solicitud");
};

const internal = {
  getUsers: async () => {
    try {
      const res = await get("/users");
      return res?.data ?? res;
    } catch (err) {
      throw extractError(err);
    }
  },

  // Obtener empleados: devuelve los usuarios que no son Gerente/Administrador.
  // La API puede no soportar el query param `excludeRoleNames`, así que usamos
  // GET /users y filtramos en frontend para evitar 403 inesperados.
  getEmployees: async () => {
    try {
      const res = await get("/users");
      const users = res?.data ?? res;
      if (!Array.isArray(users)) return [];

      const excludedRoleNames = ["gerente", "administrador", "admin"];
      const getRoleName = (user) => {
        if (!user) return "";
        if (typeof user.rolNombre === "string") return user.rolNombre;
        if (typeof user.rol === "string") return user.rol;
        if (typeof user.rol?.nombre === "string") return user.rol.nombre;
        if (typeof user.rol?.name === "string") return user.rol.name;
        return "";
      };

      return users.filter((user) => {
        const roleName = getRoleName(user).toString().toLowerCase().trim();
        return !excludedRoleNames.includes(roleName);
      });
    } catch (err) {
      throw extractError(err);
    }
  },

  getUserById: async (id) => {
    try {
      const res = await get(`/users/${id}`);
      return res?.data ?? res;
    } catch (err) {
      throw extractError(err);
    }
  },

  createUser: async (data) => {
    try {
      const res = await post("/users", normalizeUserPayload(data));
      return res?.data ?? res;
    } catch (err) {
      throw extractError(err);
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await put(`/users/${id}`, normalizeUserPayload(data));
      return res?.data ?? res;
    } catch (err) {
      throw extractError(err);
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await deleteRequest(`/users/${id}`);
      return res?.data ?? res;
    } catch (err) {
      throw extractError(err);
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
      throw extractError(err);
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
      throw extractError(err);
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
      throw extractError(err);
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
      throw extractError(err);
    }
  },
};

export default userAPI;
