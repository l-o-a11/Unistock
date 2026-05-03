// services/http.js
// Cliente HTTP base. Adjunta el token JWT automáticamente en cada request.
// Si el token expira (401), limpia la sesión y redirige al login.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  if (res.status === 204) return null;

  const data = await res.json();

  if (!data.success) {
    const err = new Error(data.message ?? 'Error desconocido');
    err.status = res.status;
    throw err;
  }

  return data.data;
};

export const http = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  patch:  (path, body) => request('PATCH',  path, body),
  delete: (path)       => request('DELETE', path),
};
