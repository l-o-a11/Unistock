/**
 * apiCache.js
 *
 * Caché en memoria + deduplicación de peticiones "en vuelo" para catálogos
 * que se piden repetidas veces desde distintos componentes en la misma
 * sesión (terceros, categorías de producto, sedes, etc).
 *
 * Problema que resuelve:
 *   thirdPartyAPI.getAll() y productCategoryAPI.getAll() se llamaban de
 *   forma independiente en varios componentes (ProductForm,
 *   ThirdPartiesSection, ProductionAlerts, ProductionDetailsPage...). Si
 *   una pantalla monta 3-4 de esos componentes a la vez, se disparan 3-4
 *   peticiones idénticas al backend en paralelo, y además se repiten cada
 *   vez que el usuario navega de vuelta a esa pantalla.
 *
 * Esta utilidad NO reemplaza React Query/SWR (recomendado a futuro para
 * invalidación más fina), pero con cero dependencias nuevas ya evita:
 *   1. Peticiones duplicadas simultáneas → una sola promesa compartida.
 *   2. Repetir la petición en cada montaje → se reusa el resultado durante
 *      `ttlMs` (por defecto 60s), tiempo razonable para catálogos que no
 *      cambian segundo a segundo.
 */

const cache = new Map(); // key -> { data, expiresAt }
const inFlight = new Map(); // key -> Promise

const DEFAULT_TTL_MS = 60_000;

/**
 * Envuelve una función asíncrona `fetcher` con caché + deduplicación.
 *
 * @param {string} key - Identificador único del recurso (ej: 'third-parties:all')
 * @param {() => Promise<any>} fetcher - Función que realmente pide los datos
 * @param {{ ttlMs?: number, force?: boolean }} [opts]
 */
export const withCache = async (key, fetcher, opts = {}) => {
  const { ttlMs = DEFAULT_TTL_MS, force = false } = opts;

  if (!force) {
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    // Ya hay una petición idéntica en curso: reusarla en vez de duplicar.
    if (inFlight.has(key)) {
      return inFlight.get(key);
    }
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      cache.set(key, { data, expiresAt: Date.now() + ttlMs });
      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
};

/**
 * Invalida una entrada específica (usar después de crear/editar/eliminar
 * un registro del recurso cacheado, para que el próximo `withCache` vuelva
 * a pedir datos frescos).
 */
export const invalidateCache = (key) => {
  cache.delete(key);
  inFlight.delete(key);
};

/** Invalida todas las entradas cuyo key empiece con `prefix`. */
export const invalidateCacheByPrefix = (prefix) => {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
  for (const k of inFlight.keys()) if (k.startsWith(prefix)) inFlight.delete(k);
};

/** Limpia todo el caché (ej: al cerrar sesión). */
export const clearApicache = () => {
  cache.clear();
  inFlight.clear();
};