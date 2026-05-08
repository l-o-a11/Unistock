/**
 * userAPI.js
 *
 * API auxiliar de usuarios — usada por el módulo de Roles
 * para verificar si un rol está enlazado antes de eliminarlo o inactivarlo.
 *
 * Antes: mock con datos hardcodeados
 * Ahora: llamadas reales al backend vía httpClient
 */

import { httpRequest } from "../../shared/utils/httpClient";

export const UserAPI = {

  // GET /usuarios — todos los usuarios
  getAll: async () => {
    const response = await httpRequest("/usuarios", { method: "GET" });
    const raw = response?.data ?? response;
    return Array.isArray(raw) ? raw : (raw?.data ?? []);
  },

  // GET /usuarios?rolId=:id — usuarios con ese rol asignado
  getByRolId: async (rolId) => {
    const response = await httpRequest(`/usuarios?rolId=${rolId}`, { method: "GET" });
    const raw = response?.data ?? response;
    return Array.isArray(raw) ? raw : (raw?.data ?? []);
  },

  // Cuenta cuántos usuarios activos tienen asignado un rolId
  countByRolId: async (rolId) => {
    try {
      const usuarios = await UserAPI.getByRolId(rolId);
      return usuarios.filter((u) => u.estado !== false).length;
    } catch {
      // Si el endpoint falla, no bloquear la UI — el backend ya valida esto al eliminar
      return 0;
    }
  },
};
