/**
 * Cliente HTTP centralizado para todas las peticiones al backend.
 *
 * Detecta automáticamente si la aplicación está ejecutándose:
 *
 * LOCAL:
 *   http://localhost:3000/api
 *
 * PRODUCCIÓN:
 *   https://api-unistock.onrender.com/api
 */

// ============================================================
// DETECTAR ENTORNO
// ============================================================

const hostname = window.location.hostname;

const isLocalhost =
  hostname === "localhost" ||
  hostname === "127.0.0.1";

const isProduction = !isLocalhost;


// ============================================================
// URLS DEL BACKEND
// ============================================================

const LOCAL_API_URL =
  "http://localhost:3000/api";

const PRODUCTION_API_URL =
  "https://api-unistock.onrender.com/api";


// ============================================================
// VARIABLES DE ENTORNO
// ============================================================

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? LOCAL_API_URL
    : PRODUCTION_API_URL);


// ============================================================
// NORMALIZAR URL
// ============================================================

const normalizeBaseUrl = (url) => {
  if (!url) return "";

  return url.replace(/\/+$/, "");
};

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) return "";

  return endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
};


const API_URL =
  normalizeBaseUrl(BACKEND_API_URL);


// ============================================================
// TIMEOUT
// ============================================================

const API_TIMEOUT =
  parseInt(
    import.meta.env.VITE_API_TIMEOUT,
    10
  ) || 10000;


// ============================================================
// INFORMACIÓN DEL ENTORNO
// ============================================================

console.log("====================================");
console.log("🌐 UniStock HTTP Client");
console.log(
  "Entorno:",
  isLocalhost ? "LOCAL" : "PRODUCCIÓN"
);
console.log(
  "Frontend:",
  window.location.origin
);
console.log(
  "Backend:",
  API_URL
);
console.log(
  "Timeout:",
  API_TIMEOUT
);
console.log("====================================");

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  try {
    const raw =
      localStorage.getItem("session_user") ||
      sessionStorage.getItem("session_user");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

// ============================================================
// LOGOUT AUTOMÁTICO
// ============================================================

const handleAutoLogout = () => {
  localStorage.removeItem("session_user");
  sessionStorage.removeItem("session_user");
  window.location.href = "/login";
};

// ============================================================
// HTTP REQUEST
// ============================================================

export const httpRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    skipAuth = false,
    suppressAutoLogout = false,
    headers = {},
  } = options;

  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const url = `${API_URL}${normalizedEndpoint}`;

  const requestHeaders = { ...headers };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  if (
    body &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  ) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body:
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof ArrayBuffer
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      const error = new Error(`Request timeout after ${API_TIMEOUT}ms`);
      error.status = 408;
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.response = response;

    if (response.status === 401 && !suppressAutoLogout) {
      handleAutoLogout();
    }

    throw error;
  }

  return data;
};

// ============================================================
// HELPERS CONVENIENCE
// ============================================================

export const get = (endpoint, options = {}) =>
  httpRequest(endpoint, { ...options, method: "GET" });

export const post = (endpoint, data, options = {}) =>
  httpRequest(endpoint, { ...options, method: "POST", body: data });

export const put = (endpoint, data, options = {}) =>
  httpRequest(endpoint, { ...options, method: "PUT", body: data });

export const patch = (endpoint, data, options = {}) =>
  httpRequest(endpoint, { ...options, method: "PATCH", body: data });

export const deleteRequest = (endpoint, options = {}) =>
  httpRequest(endpoint, { ...options, method: "DELETE" });

// ============================================================
// CLIENTE POR DEFECTO
// ============================================================

const httpClient = {
  get: (endpoint, options) => get(endpoint, options),
  post: (endpoint, data, options) => post(endpoint, data, options),
  put: (endpoint, data, options) => put(endpoint, data, options),
  patch: (endpoint, data, options) => patch(endpoint, data, options),
  delete: (endpoint, options) => deleteRequest(endpoint, options),
  request: httpRequest,
};

export default httpClient;