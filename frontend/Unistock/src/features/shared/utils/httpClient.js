/**
 * Cliente HTTP centralizado para todas las peticiones al backend
 * Maneja autenticación, errores y configuración base
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

/**
 * Obtiene el token JWT del localStorage
 */
const getAuthToken = () => {
  try {
    // Buscar en localStorage primero (donde guarda AuthAPI)
    const sessionUser = localStorage.getItem("session_user") || sessionStorage.getItem("session_user");
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
      return user.token || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }
  return null;
};

/**
 * Realiza una petición HTTP al backend
 * @param {string} endpoint - Endpoint relativo (ej: '/users', '/products/1')
 * @param {object} options - Opciones fetch
 * @returns {Promise<any>} Respuesta parseada del servidor
 */
export const httpRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    headers = {},
    skipAuth = false,
    ...otherOptions
  } = options;

  const url = `${API_URL}${endpoint}`;
  
  // Headers por defecto
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Agregar token de autenticación si existe
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const requestConfig = {
    method,
    headers: defaultHeaders,
    timeout: API_TIMEOUT,
    ...otherOptions,
  };

  // Agregar body si existe
  if (body) {
    requestConfig.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestConfig);

    // Manejar respuestas no exitosas
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || `HTTP Error ${response.status}`
      );
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Si la respuesta es 204 No Content, no hay body
    if (response.status === 204) {
      return null;
    }

    // Intentar parsear como JSON, si no, devolver texto
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error(`Error in HTTP request to ${url}:`, error);
    throw error;
  }
};

/**
 * GET request
 */
export const get = (endpoint, options = {}) =>
  httpRequest(endpoint, { ...options, method: "GET" });

/**
 * POST request
 */
export const post = (endpoint, body, options = {}) =>
  httpRequest(endpoint, { ...options, method: "POST", body });

/**
 * PUT request
 */
export const put = (endpoint, body, options = {}) =>
  httpRequest(endpoint, { ...options, method: "PUT", body });

/**
 * PATCH request
 */
export const patch = (endpoint, body, options = {}) =>
  httpRequest(endpoint, { ...options, method: "PATCH", body });

/**
 * DELETE request
 */
export const deleteRequest = (endpoint, options = {}) =>
  httpRequest(endpoint, { ...options, method: "DELETE" });

export default {
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
  httpRequest,
};
