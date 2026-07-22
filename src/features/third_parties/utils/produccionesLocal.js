/**
 * Utilidades para vincular producciones ↔ terceros desde localStorage.
 *
 * Fuentes:
 *  - app_productions[].terceros (formulario de creación)
 *  - app_prod_terceros_{prodId} (asignación en detalle de producción)
 *  - app_third_parties[].producciones (caché persistida)
 */

export const LS_THIRD_PARTIES = 'app_third_parties';
export const LS_PRODUCTIONS = 'app_productions';
export const LS_PROD_TERCEROS_PREFIX = 'app_prod_terceros_';

const norm = (value) => String(value ?? '').trim().toLowerCase();

const safeParse = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const loadProductions = () => {
  const raw = localStorage.getItem(LS_PRODUCTIONS);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
};

export const loadCachedThirdParties = () => {
  const raw = localStorage.getItem(LS_THIRD_PARTIES);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
};

export const saveCachedThirdParties = (terceros) => {
  try {
    localStorage.setItem(LS_THIRD_PARTIES, JSON.stringify(terceros));
  } catch {}
};

const productionById = () => {
  const map = new Map();
  loadProductions().forEach((prod) => {
    const id = prod?.id ?? prod?._id;
    if (id != null && id !== '') map.set(String(id), prod);
  });
  return map;
};

const buildNameToIdMap = (terceros = []) => {
  const map = new Map();
  terceros.forEach((t) => {
    const id = t?.id ?? t?._id;
    if (id == null || id === '') return;
    const names = [
      t.nombreEmpresa,
      t.nombre,
      t.nombre_empresa,
      t.contacto,
      t.nombreContacto,
      t.nombre_contacto,
    ];
    names.forEach((name) => {
      const key = norm(name);
      if (key) map.set(key, String(id));
    });
  });
  return map;
};

const formatDate = (value) => {
  // soporta fechas ya formateadas
  if (value && typeof value === 'string' && value.trim() !== '') {
    // si ya viene con formato es-CO/dd/mm/yyyy o similar, devolvemos tal cual
    if (/\d{2}[\/-]\d{2}[\/-]\d{4}/.test(value)) return value;
  }
  if (!value) return '';
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const pushProduccion = (map, terceroId, entry) => {
  // Evitar entradas corruptas: sin produccionId o cantidad 0 generan filas tipo "#—"
  const cantidad = Number(entry?.cantidad) || 0;
  const produccionId = entry?.produccionId ?? entry?.id ?? '';
  if (!terceroId) return;
  if (!produccionId) return;
  if (cantidad <= 0) return;

  // Filtro antifantasmas: si el entry trae estado/proceso, no agregamos Empaque/Enviado/Anulada.
  // Esto evita que el detalle de terceros muestre producciones que ya pasaron de fase.
  const rawEstado = entry?.estado ?? entry?.status ?? entry?.proceso ?? '';
  const estado = rawEstado ? rawEstado.toString().toLowerCase() : '';
  const bloqueadas = estado.includes('empaque') || estado.includes('enviado') || estado.includes('anulada') || estado.includes('anulado');
  if (bloqueadas) return;

  const tid = String(terceroId);
  if (!map[tid]) map[tid] = [];


  const dup = map[tid].some(
    (p) =>
      String(p.produccionId) === String(entry.produccionId) ||
      (entry.orden && String(p.orden) === String(entry.orden)),
  );
  if (!dup) map[tid].push(entry);
};

const resolveTerceroId = (ref, nameToId) => {
  if (ref?.id_tercero != null && ref.id_tercero !== '') return String(ref.id_tercero);
  if (ref?.terceroId != null && ref.terceroId !== '') return String(ref.terceroId);

  const byName = norm(ref?.option ?? ref?.tercero_nombre ?? ref?.nombre ?? ref?.nombreEmpresa);
  if (byName && nameToId.has(byName)) return nameToId.get(byName);

  return '';
};

/**
 * Construye mapa terceroId → [{ produccionId, orden, fecha, cantidad }]
 */
export const buildProduccionesMap = (tercerosList = []) => {
  const map = {};
  const nameToId = buildNameToIdMap(tercerosList);
  const prodMap = productionById();

  // Fuente 1: app_productions[].terceros
  loadProductions().forEach((prod) => {
    const prodId = prod?.id ?? prod?._id;
    if (!prodId || !Array.isArray(prod.terceros)) return;

    prod.terceros.forEach((t) => {
      const tid = resolveTerceroId(t, nameToId);
      pushProduccion(map, tid, {
        produccionId: prodId,
        orden: prod.orderNumber ?? prod.numero_orden ?? '',
        fecha: formatDate(prod.deliveryDate ?? prod.fecha_entrega ?? prod.fechaSolicitud),
        cantidad: Number(t.cantidad) || 0,
      });
    });
  });

  // Fuente 2: app_prod_terceros_{prodId}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(LS_PROD_TERCEROS_PREFIX)) continue;

      const prodId = key.slice(LS_PROD_TERCEROS_PREFIX.length);
      const assignments = safeParse(localStorage.getItem(key), []);
      if (!Array.isArray(assignments) || assignments.length === 0) continue;

      const prod = prodMap.get(String(prodId));
      assignments.forEach((a) => {
        const tid = resolveTerceroId(a, nameToId);
        pushProduccion(map, tid, {
          produccionId: prodId,
          orden: prod?.orderNumber ?? prod?.numero_orden ?? '',
          fecha: formatDate(prod?.deliveryDate ?? prod?.fecha_entrega ?? prod?.fechaSolicitud),
          cantidad: Number(a.cantidad) || 0,
        });
      });
    }
  } catch {}

  // Fuente 3: app_third_parties[].producciones
  loadCachedThirdParties().forEach((t) => {
    const tid = t?.id ?? t?._id;
    if (!tid || !Array.isArray(t.producciones)) return;
    t.producciones.forEach((p) => {
      pushProduccion(map, tid, {
        produccionId: p.produccionId ?? p.id ?? '',
        orden: p.orden ?? p.orderNumber ?? '',
        fecha: formatDate(p.fecha),
        cantidad: Number(p.cantidad) || 0,
      });
    });
  });

  return map;
};

const mergeProducciones = (existing = [], local = []) => {
  const merged = Array.isArray(existing) ? [...existing] : [];
  local.forEach((lp) => {
    const dup = merged.some(
      (p) =>
        String(p.produccionId) === String(lp.produccionId) ||
        (lp.orden && String(p.orden) === String(lp.orden)),
    );
    if (!dup) merged.push(lp);
  });
  return merged;
};

/** Enriquece un tercero con producciones locales */
export const enrichSingleTercero = (tercero, tercerosList = []) => {
  if (!tercero) return tercero;
  const map = buildProduccionesMap(tercerosList.length ? tercerosList : [tercero]);
  const localProds = map[String(tercero.id ?? tercero._id)] || [];
  if (localProds.length === 0) return tercero;
  return {
    ...tercero,
    producciones: mergeProducciones(tercero.producciones, localProds),
  };
};

/** Enriquece lista de terceros con producciones locales */
export const enrichWithLocalProductions = (terceros) => {
  if (!Array.isArray(terceros) || terceros.length === 0) return terceros;
  const map = buildProduccionesMap(terceros);
  return terceros.map((t) => {
    const localProds = map[String(t.id ?? t._id)] || [];
    if (localProds.length === 0) return t;
    return {
      ...t,
      producciones: mergeProducciones(t.producciones, localProds),
    };
  });
};

/** Reconstruye producciones en caché desde app_prod_terceros_* existentes */
export const rebuildCacheFromProdTercerosKeys = (terceros = []) => {
  if (!Array.isArray(terceros) || terceros.length === 0) return terceros;

  const map = buildProduccionesMap(terceros);
  const enriched = terceros.map((t) => {
    const localProds = map[String(t.id ?? t._id)] || [];
    if (localProds.length === 0) return t;
    return { ...t, producciones: mergeProducciones(t.producciones, localProds) };
  });

  saveCachedThirdParties(enriched);
  return enriched;
};

// Mantener compatibilidad con imports existentes en el frontend.
// Este helper sincroniza la caché local de terceros usando la producción y sus asignaciones.
export const syncProduccionToThirdPartiesCache = (production, terceroAsignaciones = []) => {
  try {
    const current = loadCachedThirdParties();
    const prodId = production?.id ?? production?._id;
    if (!prodId) return current;

    const byId = new Map();
    current.forEach((t) => {
      const tid = String(t?.id ?? t?._id ?? '');
      if (tid) byId.set(tid, t);
    });

    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fecha = production?.deliveryDate || production?.fecha_entrega || production?.fecha || today;

    const updated = current.map((t) => {
      const tid = String(t?.id ?? t?._id ?? '');
      if (!tid) return t;

      const localProds = Array.isArray(t.producciones) ? [...t.producciones] : [];

      const matches = (Array.isArray(terceroAsignaciones) ? terceroAsignaciones : []).filter((a) => {
        const idTer = a?.id_tercero ?? a?.idTercero;
        if (idTer) return String(idTer) === tid;
        // fallback por nombre en caso de que no venga el id
        const opt = a?.option ?? a?.nombreEmpresa ?? a?.nombre;
        const optNorm = norm(opt);
        const nameNorm = norm(t?.nombreEmpresa ?? t?.nombre ?? t?.nombre_empresa);
        return optNorm && nameNorm && optNorm === nameNorm;
      });

      if (matches.length === 0) return t;

      matches.forEach((m) => {
        const cantidad = Number(m.cantidad) || 0;
        if (cantidad <= 0) return;

        const orden = production?.orderNumber || production?.numero_orden || '';
        const entry = {
          produccionId: prodId,
          orden,
          fecha: formatDate(fecha) || today,
          cantidad,
        };

        const dup = localProds.some((p) => String(p.produccionId) === String(entry.produccionId) && (entry.orden ? String(p.orden) === String(entry.orden) : true));
        if (!dup) localProds.push(entry);
      });

      return { ...t, producciones: localProds };
    });

    saveCachedThirdParties(updated);
    return updated;
  } catch {
    return loadCachedThirdParties();
  }
};






