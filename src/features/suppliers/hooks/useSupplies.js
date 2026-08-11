/**
 * supplies/hooks/useSupplies.js
 *
 * Reemplaza la lógica de localStorage/mock por llamadas reales vía supplyAPI.
 *
 * Cambios respecto a la versión anterior:
 *  - Sin localStorage: la fuente de verdad es el backend
 *  - Paginación server-side: { data, total, page, limit, totalPages }
 *  - Catálogos (medidas, propiedades, categorías) vienen del backend
 *  - toggleSupply llama al backend (PATCH /:id/toggle)
 *  - Validación de unicidad delegada al backend (elimina duplicado local)
 */

import { useState, useEffect, useCallback } from "react";
import { supplyAPI } from "../services/supplyAPI";

export const useSupplies = (initialFilters = {}) => {
  const [supplies, setSupplies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // NOTA: el backend ahora sí implementa paginación real (page/limit/skip).
  // Mientras SuppliesPage siga haciendo su propio filtrado y paginado en el
  // cliente (para poder exportar a Excel/PDF el listado filtrado completo,
  // no solo la página visible), seguimos pidiendo TODO el catálogo con
  // limit: "all". Si en el futuro se migra SuppliesPage a paginación 100%
  // server-side, basta con cambiar esto a `{ limit: 10, ...initialFilters }`
  // y conectar goToPage/applyFilters (ya expuestos por este hook) a los
  // controles de la UI.
  const [filters, setFilters] = useState({ limit: "all", ...initialFilters });

  // ── Catálogos ──────────────────────────────────────────────────────────────
  const [categorias, setCategorias] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  // ── Carga de catálogos (una sola vez al montar) ────────────────────────────
  const loadCatalogos = useCallback(async () => {
    try {
      const [medidasData, propiedadesData, categoriasData] = await Promise.all([
        supplyAPI.getMedidas(),
        supplyAPI.getPropiedades(),
        supplyAPI.getCategorias(),
      ]);
      setMedidas(medidasData);
      setPropiedades(propiedadesData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error("[useSupplies] loadCatalogos:", err);
    }
  }, []);

  // ── Carga paginada de insumos ──────────────────────────────────────────────
  const loadData = useCallback(async (overrideFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const merged = { ...filters, ...overrideFilters };
      const result = await supplyAPI.getAll(merged);
      setSupplies(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError(err.message || "Error al cargar insumos");
      console.error("[useSupplies] loadData:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadCatalogos(); }, [loadCatalogos]);

  // ── Cambiar página / filtros ───────────────────────────────────────────────
  const goToPage = (page) => setFilters((prev) => ({ ...prev, page }));

  const applyFilters = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const createSupply = async (supplyData) => {
    try {
      setLoading(true);
      const newSupply = await supplyAPI.create(supplyData);
      await loadData(); // recarga para reflejar orden/paginación del servidor
      return newSupply;
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al crear el insumo";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateSupply = async (id, supplyData) => {
    try {
      setLoading(true);
      const updated = await supplyAPI.update(id, supplyData);
      await loadData();
      return updated;
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al actualizar el insumo";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupply = async (id, managerPassword) => {
    try {
      setLoading(true);
      await supplyAPI.delete(id, managerPassword);
      // Si la página actual queda vacía, retroceder una página
      const newTotal = pagination.total - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / pagination.limit));
      const targetPage = Math.min(pagination.page, maxPage);
      await loadData({ page: targetPage });
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al eliminar el insumo";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // toggle: actualización optimista local + llamada al backend
  const toggleSupply = async (id, managerPassword) => {
    if (!managerPassword?.trim()) {
      throw new Error("Se requiere la contraseña del gerente para cambiar el estado del insumo.");
    }

    try {
      setLoading(true);
      const updated = await supplyAPI.toggle(id, managerPassword);
      setSupplies((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      const msg = err.data?.error || err.message || "Error al cambiar el estado del insumo";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers de catálogos ───────────────────────────────────────────────────
  const getSupplyById = (id) => supplies.find((s) => s.id === String(id));

  const getCategoriaNombre = (categoriaId) => {
    if (!categoriaId) return "Sin categoría";
    // categoriaId puede ser string ObjectId o un objeto con .nombre
    if (typeof categoriaId === "object" && categoriaId.nombre) return categoriaId.nombre;
    return categorias.find((c) => c.id === String(categoriaId))?.nombre ?? "Sin categoría";
  };

  const getMedidaNombre = (medidaId) =>
    medidas.find((m) => m.id === medidaId || m.valor === medidaId)?.nombre ?? medidaId ?? "Sin medida";

  const getPropiedadNombre = (propiedadId) =>
    propiedades.find((p) => p.id === propiedadId || p.clave === propiedadId)?.nombre ?? "Desconocida";

  return {
    // Datos
    supplies,
    pagination,
    loading,
    error,
    // Catálogos
    categorias,
    medidas,
    propiedades,
    // CRUD
    createSupply,
    updateSupply,
    deleteSupply,
    toggleSupply,
    // Paginación/filtros
    goToPage,
    applyFilters,
    refreshSupplies: loadData,
    refreshCatalogos: loadCatalogos,
    // Helpers
    getSupplyById,
    getCategoriaNombre,
    getMedidaNombre,
    getPropiedadNombre,
  };
};
