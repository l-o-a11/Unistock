/**
 * useSedes.js
 *
 * FIX #9: el hook ahora maneja la paginación del servidor.
 * - Expone `pagination` con { total, page, limit, totalPages }
 * - loadData acepta filters (incluyendo page/limit) y los pasa a la API
 * - Las acciones CRUD recargan la página actual en lugar de mutar estado local
 *   (evita inconsistencias con el orden/filtrado del servidor)
 */

import { useState, useEffect, useCallback } from "react";
import { sedesAPI } from "../services/sedesAPI";

export const useSedes = (initialFilters = {}) => {
  const [sedes, setSedes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ limit: 10, sortBy: "createdAt", order: "desc", ...initialFilters });

  // ── Carga (server-side) ────────────────────────────────────────────────────
  const loadData = useCallback(async (overrideFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const merged = { ...filters, ...overrideFilters };
      const result = await sedesAPI.getAll(merged);
      setSedes([...result.data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      if (err?.status === 403) {
        setSedes([]);
        setPagination({ total: 0, page: 1, limit: filters.limit || 10, totalPages: 1 });
        setError(null);
      } else {
        setError(err.message || "Error al cargar sedes");
        console.error("[useSedes] loadData:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cambiar página / filtros y recargar
  const goToPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const applyFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // ── Crear ──────────────────────────────────────────────────────────────────
  const createSede = async (sedeData) => {
    try {
      setLoading(true);
      const newSede = await sedesAPI.create(sedeData);
      await loadData(); // recarga para reflejar orden/paginación del servidor
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
      await loadData(); // recarga para reflejar cambios de orden/filtrado
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
  const deleteSede = async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para eliminar la sede.");
    }
    try {
      setLoading(true);
      await sedesAPI.delete(id, managerPassword);
      // Si la página actual queda vacía tras eliminar, retroceder una página
      const newTotal = pagination.total - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / pagination.limit));
      const targetPage = Math.min(pagination.page, maxPage);
      await loadData({ page: targetPage });
    } catch (err) {
      const msg = err.message || "Error al eliminar la sede";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle activo/inactivo ─────────────────────────────────────────────────
  const toggleSede = async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para cambiar el estado de la sede.");
    }
    try {
      setLoading(true);
      const updated = await sedesAPI.toggle(id, managerPassword);
      // Actualización optimista local (evita un round-trip innecesario)
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
    pagination,
    loading,
    error,
    createSede,
    updateSede,
    deleteSede,
    toggleSede,
    refreshSedes: loadData,
    goToPage,
    applyFilters,
  };
};
