/**
 * @file hooks/mockThird_parties.js
 *
 * Exporta `useThird_parties` — mismo nombre que usaba el mock —
 * para que Third_partiesPage.jsx no necesite cambiar su import.
 *
 * Llama al backend en /api/terceros.
 * Si el backend no está disponible, usa caché local (app_third_parties).
 * Enriquece producciones desde localStorage (app_productions, app_prod_terceros_*).
 */
import { useState, useEffect, useCallback } from 'react';
import { thirdPartyAPI } from '../services/thirdPartyAPI';
import {
  enrichWithLocalProductions,
  loadCachedThirdParties,
  rebuildCacheFromProdTercerosKeys,
  saveCachedThirdParties,
} from '../utils/produccionesLocal';

// ── Hook principal ────────────────────────────────────────────────────────────
export const useThird_parties = () => {
  const [Third_parties, setThird_parties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Carga inicial
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await thirdPartyAPI.getAll();
      const enriched = rebuildCacheFromProdTercerosKeys(enrichWithLocalProductions(data));
      saveCachedThirdParties(enriched);
      setThird_parties(enriched);
    } catch (err) {
      console.warn('[useThird_parties] loadAll: backend no disponible, usando caché local');
      const cached = loadCachedThirdParties();
      if (cached.length > 0) {
        setThird_parties(rebuildCacheFromProdTercerosKeys(enrichWithLocalProductions(cached)));
        setError(null);
      } else {
        console.error('[useThird_parties] loadAll error:', err?.message);
        setError(err?.message || 'Error al cargar terceros');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Crear
  const createThird_partie = useCallback(async (data) => {
    const created = await thirdPartyAPI.create(data);
    setThird_parties(prev => {
      const next = enrichWithLocalProductions([created, ...prev]);
      saveCachedThirdParties(next);
      return next;
    });
    return created;
  }, []);

  // Editar
  const updateThird_partie = useCallback(async (id, data) => {
    const updated = await thirdPartyAPI.update(id, data);
    setThird_parties(prev => {
      const next = enrichWithLocalProductions(prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
      saveCachedThirdParties(next);
      return next;
    });
    return updated;
  }, []);

  // Eliminar
  const deleteThird_partie = useCallback(async (id) => {
    await thirdPartyAPI.delete(id);
    setThird_parties(prev => prev.filter(t => t.id !== id));
  }, []);

  // Activar / Inactivar
  const toggleThird_partie = useCallback(async (id) => {
    const updated = await thirdPartyAPI.toggle(id);
    setThird_parties(prev => {
      const next = enrichWithLocalProductions(prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
      saveCachedThirdParties(next);
      return next;
    });
    return updated;
  }, []);

  // Vincular producción
  const linkProduccion = useCallback(async (terceroId, payload) => {
    const updated = await thirdPartyAPI.linkProduccion(terceroId, payload);
    setThird_parties(prev => {
      const next = enrichWithLocalProductions(prev.map(t => (t.id === terceroId ? { ...t, ...updated } : t)));
      saveCachedThirdParties(next);
      return next;
    });
    return updated;
  }, []);

  // Recargar manualmente
  const refreshThird_parties = useCallback(() => { loadAll(); }, [loadAll]);

  return {
    Third_parties,
    loading,
    error,
    createThird_partie,
    updateThird_partie,
    deleteThird_partie,
    toggleThird_partie,
    linkProduccion,
    refreshThird_parties,
  };
};

export default useThird_parties;
