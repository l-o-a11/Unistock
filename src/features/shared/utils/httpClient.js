/**
 * Cliente HTTP centralizado para todas las peticiones al backend
 * Maneja autenticación, errores y configuración base
 */

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "http://localhost:3000/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

const getApiUrl = (endpoint) => (
  endpoint.startsWith("/auth") ? AUTH_API_URL : BACKEND_API_URL
);

/**
 * Limpia la sesión, muestra una alerta visual y redirige al login
 * cuando el token es inválido/expirado.
 */
const clearSessionAndRedirect = (message = "Tu sesión ha expirado. Por favor inicia sesión de nuevo.") => {
  localStorage.removeItem("session_user");
  sessionStorage.removeItem("session_user");

  // Solo redirigir si no estamos ya en /login para evitar bucles
  if (window.location.pathname.includes("/login")) return;

  // Inyectar un toast de sesión expirada antes del redirect.
  // Se hace con DOM puro porque en este punto React puede ya no estar montado.
  const existing = document.getElementById("__session_expired_toast__");
  if (!existing) {
    const toast = document.createElement("div");
    toast.id = "__session_expired_toast__";
    toast.innerHTML = `
      <div style="
        position:fixed; top:20px; right:20px; z-index:99999;
        background:#fff; border-left:6px solid #ef4444;
        border-radius:14px; padding:16px 20px 20px;
        box-shadow:0 10px 25px rgba(0,0,0,0.13);
        width:320px; font-family:Arial,sans-serif;
        animation: __slideIn__ .3s ease forwards;
      ">
        <strong style="color:#111; font-size:14px;">⚠ Sesión finalizada</strong>
        <p style="margin:6px 0 0; font-size:13px; color:#555; line-height:1.5;">${message}</p>
        <div style="
          position:absolute; bottom:0; left:0; height:4px; width:100%;
          background:#ef4444; border-radius:0 0 14px 14px;
          animation: __shrink__ 3s linear forwards;
        "></div>
      </div>
      <style>
        @keyframes __slideIn__ { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes __shrink__  { from{width:100%} to{width:0%} }
      </style>
    `;
    document.body.appendChild(toast);
  }

  // Redirigir después de que el usuario pueda leer la alerta (3 s)
  setTimeout(() => { window.location.href = "/login"; }, 3000);
};

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
    suppressAutoLogout = false,
    ...otherOptions
  } = options;

  const url = `${getApiUrl(endpoint)}${endpoint}`;

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

      // 401 → sesión inválida o token ausente/expirado: forzar re-login.
      // FIX: antes esto reusaba `skipAuth` (que también controla si se manda
      // el token). Eso hacía que cualquier llamada con skipAuth:true saliera
      // SIN Authorization header, y endpoints protegidos por requireAuth
      // (como /auth/verify-password) rechazaban siempre con 401 "Token no
      // proporcionado" — sin importar la contraseña. Ahora son dos flags
      // independientes: skipAuth (no mandar token) y suppressAutoLogout
      // (no cerrar sesión si el 401 es un error de negocio esperado).
      if (response.status === 401 && !suppressAutoLogout) {
        clearSessionAndRedirect();
      }

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
    // FIX: antes se logueaba CUALQUIER error con console.error, incluyendo
    // casos esperados de negocio (ej. credenciales inválidas, validaciones).
    // Ahora solo se loguea si es un error inesperado: sin status (falla de
    // red/timeout) o un 5xx (error real del servidor). Los 400/401/403/404
    // son flujos normales que la UI ya maneja y muestra al usuario.
    const isUnexpected = !error.status || error.status >= 500;
    if (isUnexpected) {
      console.error(`Error in HTTP request to ${url}:`, error);
    }
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