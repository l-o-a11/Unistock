/**
 * @file hooks/mockThird_parties.js  (reemplazado por implementación real)
 *
 * Exporta `useThird_parties` — mismo nombre que usaba el mock —
 * para que Third_partiesPage.jsx no necesite cambiar su import.
 *
 * Ahora llama al backend en /api/terceros en lugar de usar localStorage.
 */
import { useState, useEffect, useCallback } from 'react';
import { thirdPartyAPI } from '../services/thirdPartyAPI';

export const useThird_parties = () => {
  const [Third_parties, setThird_parties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Carga inicial ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await thirdPartyAPI.getAll();
      setThird_parties(data);
    } catch (err) {
      console.error('[useThird_parties] loadAll error:', err?.message);
      setError(err?.message || 'Error al cargar terceros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Crear ────────────────────────────────────────────────────────────────────
  const createThird_partie = useCallback(async (data) => {
    const created = await thirdPartyAPI.create(data);
    setThird_parties(prev => [created, ...prev]);
    return created;
  }, []);

  // ── Editar ───────────────────────────────────────────────────────────────────
  const updateThird_partie = useCallback(async (id, data) => {
    const updated = await thirdPartyAPI.update(id, data);
    setThird_parties(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updated } : t))
    );
    return updated;
  }, []);

  // ── Eliminar (bloquea si tiene producciones — el backend lo enforcea) ─────────
  const deleteThird_partie = useCallback(async (id) => {
    await thirdPartyAPI.delete(id);
    setThird_parties(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Activar / Inactivar ──────────────────────────────────────────────────────
  const toggleThird_partie = useCallback(async (id) => {
    const updated = await thirdPartyAPI.toggle(id);
    setThird_parties(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updated } : t))
    );
    return updated;
  }, []);

  // ── Vincular producción ──────────────────────────────────────────────────────
  const linkProduccion = useCallback(async (terceroId, payload) => {
    const updated = await thirdPartyAPI.linkProduccion(terceroId, payload);
    setThird_parties(prev =>
      prev.map(t => (t.id === terceroId ? { ...t, ...updated } : t))
    );
    return updated;
  }, []);

  // ── Recargar manualmente ─────────────────────────────────────────────────────
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
