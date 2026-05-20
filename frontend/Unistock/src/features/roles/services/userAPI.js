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

  
  
};
