/**
 * categoriesSupply/hooks/useCategories.js
 *
 * Reemplaza la lógica de localStorage/mock por llamadas reales vía categoryAPI.
 *
 * Cambios respecto a la versión anterior:
 *  - Sin localStorage: la fuente de verdad es el backend
 *  - Paginación server-side: { data, total, page, limit, totalPages }
 *  - La validación de "tiene insumos asociados" la hace el backend (422)
 *  - Nuevo: toggleCategory (PATCH /:id/toggle)
 */

import { useState, useEffect, useCallback } from "react";
import { categoryAPI } from "../services/categoryAPI";

export const useCategories = (initialFilters = {}) => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ limit: 50, sortBy: "createdAt", order: "desc", ...initialFilters });

  // ── Carga paginada ─────────────────────────────────────────────────────────
  const loadCategories = useCallback(async (overrideFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const merged = { ...filters, ...overrideFilters };
      const result = await categoryAPI.getAll(merged);
      setCategories([...result.data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError(err.message || "Error al cargar categorías");
      console.error("[useCategories] loadCategories:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ── Cambiar página / filtros ───────────────────────────────────────────────
  const goToPage = (page) => setFilters((prev) => ({ ...prev, page }));

  const applyFilters = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const createCategory = async (categoryData) => {
    try {
      const newCategory = await categoryAPI.create(categoryData);
      setCategories((prev) => [newCategory, ...prev].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      await loadCategories();
      return newCategory;
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al crear la categoría";
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const updated = await categoryAPI.update(id, categoryData);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al actualizar la categoría";
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteCategory = async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para eliminar la categoría.");
    }
    try {
      await categoryAPI.delete(id, managerPassword);
      // Si la página queda vacía, retroceder
      const newTotal = pagination.total - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / pagination.limit));
      const targetPage = Math.min(pagination.page, maxPage);
      await loadCategories({ page: targetPage });
    } catch (err) {
      // El backend devuelve 422 con mensaje descriptivo si tiene insumos activos
      const msg = err.data?.error || err.message || "Error al eliminar la categoría";
      setError(msg);
      throw new Error(msg);
    }
  };

  const toggleCategory = async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para cambiar el estado de la categoría.");
    }
    try {
      const updated = await categoryAPI.toggle(id, managerPassword);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al cambiar el estado de la categoría";
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    categories,
    pagination,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategory,
    goToPage,
    applyFilters,
    refreshCategories: loadCategories,
  };
};
