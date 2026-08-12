/**
 * Cliente HTTP centralizado para todas las peticiones al backend.
 *
 * Detecta automáticamente:
 * - Desarrollo/local: http://localhost:3000/api
 * - Producción: https://api-unistock.onrender.com
 *
 * Las variables de entorno tienen prioridad sobre los valores automáticos.
 */

// ============================================================
// CONFIGURACIÓN DE ENTORNO
// ============================================================

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const isProduction =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

// ============================================================
// URLS DEL BACKEND
// ============================================================

const LOCAL_API_URL = "http://localhost:3000/api";

const PRODUCTION_API_URL = "https://api-unistock.onrender.com";

// Variable principal del backend
const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL);

// URL específica para autenticación
const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL ||
  (isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL);

// Timeout
const API_TIMEOUT =
  parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 10000;


// ============================================================
// NORMALIZAR URL
// ============================================================

/**
 * Evita problemas como:
 *
 * https://api-unistock.onrender.com//auth/login
 *
 * y garantiza:
 *
 * https://api-unistock.onrender.com/auth/login
 */
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


// Normalizamos las URLs una sola vez
const NORMALIZED_BACKEND_API_URL = normalizeBaseUrl(BACKEND_API_URL);
const NORMALIZED_AUTH_API_URL = normalizeBaseUrl(AUTH_API_URL);


// ============================================================
// SELECCIONAR URL SEGÚN ENDPOINT
// ============================================================

const getApiUrl = (endpoint) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  if (normalizedEndpoint.startsWith("/auth")) {
    return NORMALIZED_AUTH_API_URL;
  }

  return NORMALIZED_BACKEND_API_URL;
};


// ============================================================
// INFORMACIÓN DE ENTORNO
// ============================================================

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🌐 UniStock HTTP Client");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Entorno:", isLocalhost ? "LOCAL" : "PRODUCCIÓN");
console.log("Hostname:", window.location.hostname);
console.log("Backend:", NORMALIZED_BACKEND_API_URL);
console.log("Auth:", NORMALIZED_AUTH_API_URL);
console.log("Timeout:", API_TIMEOUT);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");


// ============================================================
// LIMPIAR SESIÓN Y REDIRIGIR
// ============================================================

/**
 * Limpia la sesión, muestra una alerta visual y redirige al login
 * cuando el token es inválido o expirado.
 */
const clearSessionAndRedirect = (
  message = "Tu sesión ha expirado. Por favor inicia sesión de nuevo."
) => {
  localStorage.removeItem("session_user");
  sessionStorage.removeItem("session_user");

  // Evitar bucles si ya estamos en login
  if (window.location.pathname.includes("/login")) {
    return;
  }

  // Buscar toast existente
  const existing = document.getElementById(
    "__session_expired_toast__"
  );

  if (!existing) {
    const toast = document.createElement("div");

    toast.id = "__session_expired_toast__";

    toast.innerHTML = `
      <div style="
        position:fixed;
        top:20px;
        right:20px;
        z-index:99999;
        background:#fff;
        border-left:6px solid #ef4444;
        border-radius:14px;
        padding:16px 20px 20px;
        box-shadow:0 10px 25px rgba(0,0,0,0.13);
        width:320px;
        font-family:Arial,sans-serif;
        animation:__slideIn__ .3s ease forwards;
      ">
        <strong style="
          color:#111;
          font-size:14px;
        ">
          ⚠ Sesión finalizada
        </strong>

        <p style="
          margin:6px 0 0;
          font-size:13px;
          color:#555;
          line-height:1.5;
        ">
          ${message}
        </p>

        <div style="
          position:absolute;
          bottom:0;
          left:0;
          height:4px;
          width:100%;
          background:#ef4444;
          border-radius:0 0 14px 14px;
          animation:__shrink__ 3s linear forwards;
        "></div>
      </div>

      <style>
        @keyframes __slideIn__ {
          from {
            transform:translateX(120%);
            opacity:0;
          }

          to {
            transform:translateX(0);
            opacity:1;
          }
        }

        @keyframes __shrink__ {
          from {
            width:100%;
          }

          to {
            width:0%;
          }
        }
      </style>
    `;

    document.body.appendChild(toast);
  }

  // Dar 3 segundos para leer el mensaje
  setTimeout(() => {
    window.location.href = "/login";
  }, 3000);
};


// ============================================================
// OBTENER TOKEN JWT
// ============================================================

const getAuthToken = () => {
  try {
    const sessionUser =
      localStorage.getItem("session_user") ||
      sessionStorage.getItem("session_user");

    if (sessionUser) {
      const user = JSON.parse(sessionUser);

      return user.token || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }

  return null;
};


// ============================================================
// PETICIÓN HTTP CENTRALIZADA
// ============================================================

/**
 * Realiza una petición HTTP al backend.
 *
 * @param {string} endpoint
 * @param {object} options
 * @returns {Promise<any>}
 */
export const httpRequest = async (
  endpoint,
  options = {}
) => {
  const {
    method = "GET",
    body = null,
    headers = {},
    skipAuth = false,
    suppressAutoLogout = false,
    signal: externalSignal = null,
    ...otherOptions
  } = options;

  // ----------------------------------------------------------
  // Construcción segura de URL
  // ----------------------------------------------------------

  const normalizedEndpoint = normalizeEndpoint(endpoint);

  const baseUrl = getApiUrl(normalizedEndpoint);

  const url = `${baseUrl}${normalizedEndpoint}`;


  // ----------------------------------------------------------
  // Headers
  // ----------------------------------------------------------

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };


  // ----------------------------------------------------------
  // Token
  // ----------------------------------------------------------

  if (!skipAuth) {
    const token = getAuthToken();

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }


  // ----------------------------------------------------------
  // AbortController / Timeout
  // ----------------------------------------------------------

  const timeoutController = new AbortController();

  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, API_TIMEOUT);


  // ----------------------------------------------------------
  // Combinar signal externo con timeout
  // ----------------------------------------------------------

  if (externalSignal) {
    if (externalSignal.aborted) {
      timeoutController.abort();
    } else {
      externalSignal.addEventListener(
        "abort",
        () => timeoutController.abort(),
        { once: true }
      );
    }
  }


  // ----------------------------------------------------------
  // Configuración fetch
  // ----------------------------------------------------------

  const requestConfig = {
    method,
    headers: defaultHeaders,
    signal: timeoutController.signal,
    ...otherOptions,
  };


  // ----------------------------------------------------------
  // Body
  // ----------------------------------------------------------

  if (body !== null && body !== undefined) {
    requestConfig.body =
      typeof body === "string"
        ? body
        : JSON.stringify(body);
  }


  // ----------------------------------------------------------
  // REQUEST
  // ----------------------------------------------------------

  try {
    console.log(`➡️ ${method} ${url}`);

    const response = await fetch(
      url,
      requestConfig
    );

    clearTimeout(timeoutId);


    // --------------------------------------------------------
    // ERROR HTTP
    // --------------------------------------------------------

    if (!response.ok) {
      const errorData =
        await response
          .json()
          .catch(() => ({}));


      // Mensaje principal
      let message =
        errorData.message ||
        `HTTP Error ${response.status}`;


      // Errores de validación
      if (
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        const detalle =
          errorData.errors
            .map((e) => {
              const campo = e?.field
                ? String(e.field).replace(/^\./, "")
                : "datos";

              return `• ${
                campo
              }: ${
                e?.message ||
                "valor inválido"
              }`;
            })
            .join("\n");

        message = `${message}\n${detalle}`;
      }


      // Crear error
      const error = new Error(message);

      error.status = response.status;
      error.data = errorData;


      // ------------------------------------------------------
      // 401 → TOKEN INVÁLIDO / EXPIRADO
      // ------------------------------------------------------

      if (
        response.status === 401 &&
        !suppressAutoLogout
      ) {
        clearSessionAndRedirect();
      }

      throw error;
    }


    // --------------------------------------------------------
    // 204 NO CONTENT
    // --------------------------------------------------------

    if (response.status === 204) {
      return null;
    }


    // --------------------------------------------------------
    // JSON / TEXT
    // --------------------------------------------------------

    const contentType =
      response.headers.get("content-type");

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      return await response.json();
    }

    return await response.text();

  } catch (error) {

    clearTimeout(timeoutId);


    // --------------------------------------------------------
    // ABORT / TIMEOUT
    // --------------------------------------------------------

    if (error.name === "AbortError") {

      const wasExternalAbort =
        externalSignal?.aborted;

      const abortError = new Error(
        wasExternalAbort
          ? "Petición cancelada"
          : "Tiempo de espera agotado. Verifica tu conexión."
      );

      abortError.status =
        wasExternalAbort
          ? undefined
          : 408;

      abortError.isTimeout =
        !wasExternalAbort;

      abortError.isCancelled =
        !!wasExternalAbort;


      if (!wasExternalAbort) {
        console.error(
          `Timeout (${API_TIMEOUT}ms) en petición a ${url}`
        );
      }

      throw abortError;
    }


    // --------------------------------------------------------
    // ERRORES INESPERADOS
    // --------------------------------------------------------

    const isUnexpected =
      !error.status ||
      error.status >= 500;

    if (isUnexpected) {
      console.error(
        `Error in HTTP request to ${url}:`,
        error
      );
    }

    throw error;
  }
};


// ============================================================
// MÉTODOS HTTP
// ============================================================

export const get = (
  endpoint,
  options = {}
) =>
  httpRequest(endpoint, {
    ...options,
    method: "GET",
  });


export const post = (
  endpoint,
  body,
  options = {}
) =>
  httpRequest(endpoint, {
    ...options,
    method: "POST",
    body,
  });


export const put = (
  endpoint,
  body,
  options = {}
) =>
  httpRequest(endpoint, {
    ...options,
    method: "PUT",
    body,
  });


export const patch = (
  endpoint,
  body,
  options = {}
) =>
  httpRequest(endpoint, {
    ...options,
    method: "PATCH",
    body,
  });


export const deleteRequest = (
  endpoint,
  options = {}
) =>
  httpRequest(endpoint, {
    ...options,
    method: "DELETE",
  });


// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
  httpRequest,
};