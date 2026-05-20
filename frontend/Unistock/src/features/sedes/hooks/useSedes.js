/**
 * useSedes.js
 *
 * Hook principal para gestión de sedes.
 * Reemplaza la lógica de localStorage/mock por llamadas reales vía sedesAPI.
 *
 * Responsabilidades:
 *  - Cargar la lista de sedes desde el backend al montar
 *  - Exponer CRUD: createSede, updateSede, deleteSede, toggleSede
 *  - Mantener loading y error para la UI
 */

import { useState, useEffect, useCallback } from "react";
import { sedesAPI } from "../services/sedesAPI";

export const useSedes = () => {
  const [sedes,   setSedes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const loadData = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await sedesAPI.getAll(filters);
      setSedes(data);
    } catch (err) {
      setError(err.message || "Error al cargar sedes");
      console.error("[useSedes] loadData:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Crear ──────────────────────────────────────────────────────────────────
  const createSede = async (sedeData) => {
    try {
      setLoading(true);
      const newSede = await sedesAPI.create(sedeData);
      setSedes((prev) => [...prev, newSede]);
      return newSede;
    } catch (err) {
      const msg = err.message || "Error al crear la sede";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Actualizar ─────────────────────────────────────────────────────────────
  const updateSede = async (id, sedeData) => {
    try {
      setLoading(true);
      const updated = await sedesAPI.update(id, sedeData);
      setSedes((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      const msg = err.message || "Error al actualizar la sede";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar ───────────────────────────────────────────────────────────────
  const deleteSede = async (id) => {
    try {
      setLoading(true);
      await sedesAPI.delete(id);
      setSedes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const msg = err.message || "Error al eliminar la sede";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle activo/inactivo ────────────────────────────────────────────────
  // Llama al backend (PATCH /api/sites/:id/toggle) en lugar de mutar el estado local.
  const toggleSede = async (id) => {
    try {
      setLoading(true);
      const updated = await sedesAPI.toggle(id);
      setSedes((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      const msg = err.message || "Error al cambiar el estado de la sede";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sedes,
    loading,
    error,
    createSede,
    updateSede,
    deleteSede,
    toggleSede,
    refreshSedes: loadData,
  };
};
