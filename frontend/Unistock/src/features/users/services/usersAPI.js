// services/usersAPI.js
// Llamadas HTTP al módulo de usuarios.
// Traduce los campos del formulario a los que espera la API.

import { http } from './http';

export const userAPI = {

  // GET /users?search=&rolId=&sedeId=&estado=
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search)            params.set('search',  filters.search);
    if (filters.rolId)             params.set('rolId',   filters.rolId);
    if (filters.sedeId)            params.set('sedeId',  filters.sedeId);
    if (filters.estado !== undefined) params.set('estado', filters.estado);
    const query = params.toString();
    return http.get(`/users${query ? `?${query}` : ''}`);
  },

  // GET /users/:id
  getById: (id) => http.get(`/users/${id}`),

  // POST /users
  create: (userData) => http.post('/users', {
    tipoDocumento:   userData.documentType,
    numeroDocumento: userData.documentNumber,
    nombreCompleto:  userData.name,
    correo:          userData.email,
    rolId:           parseInt(userData.role),
    sedeId:          parseInt(userData.sede),
    password:        userData.password,
  }),

  // PUT /users/:id
  update: (id, userData) => http.put(`/users/${id}`, {
    tipoDocumento:   userData.documentType,
    numeroDocumento: userData.documentNumber,
    nombreCompleto:  userData.name,
    correo:          userData.email,
    rolId:           userData.role  ? parseInt(userData.role)  : undefined,
    sedeId:          userData.sede  ? parseInt(userData.sede)  : undefined,
  }),

  // DELETE /users/:id
  delete: (id) => http.delete(`/users/${id}`),

  // PATCH /users/:id/status
  toggleStatus: (id) => http.patch(`/users/${id}/status`),

  // GET /users/roles
  getRoles: () => http.get('/users/roles'),

  // GET /users/sedes
  getSedes: () => http.get('/users/sedes'),
};
