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