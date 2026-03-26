import { useState, useEffect } from "react";
import { supplyAPI } from "../services/supplyAPI";

const STORAGE_KEY = "app_supplies";

// ── Helpers de localStorage ────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // JSON corrupto — ignorar y usar seed
  }
  return null;
};

const saveToStorage = (supplies) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(supplies));
  } catch (e) {
    console.error("No se pudo guardar en localStorage:", e);
  }
};

export const useSupplies = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  // Carga inicial: localStorage primero, API como fallback
  useEffect(() => {
    const cached = loadFromStorage();
    if (cached) {
      setSupplies(cached);
      setLoading(false);
    } else {
      loadData();
    }
    // Catálogos siempre desde la API (no cambian)
    loadCatalogos();
  }, []);

  // Persistir cada vez que supplies cambia
  useEffect(() => {
    if (!loading) {
      saveToStorage(supplies);
    }
  }, [supplies, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const suppliesData = await supplyAPI.getAll();
      setSupplies(suppliesData);
      setError(null);
    } catch (err) {
      setError("Error al cargar insumos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const [medidasData, propiedadesData] = await Promise.all([
        supplyAPI.getMedidas(),
        supplyAPI.getPropiedades(),
      ]);
      setMedidas(medidasData);
      setPropiedades(propiedadesData);
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }

    // Categorías vienen del módulo de categorías vía localStorage
    // Si no hay nada aún, fallback a supplyAPI.getCategorias()
    try {
      const raw = localStorage.getItem("app_categorias");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Normalizar: categoryAPI usa "name", supplyAPI usa "nombre"
        setCategorias(parsed.map(c => ({ ...c, nombre: c.nombre ?? c.name })));
      } else {
        const categoriasData = await supplyAPI.getCategorias();
        setCategorias(categoriasData);
      }
    } catch {
      const categoriasData = await supplyAPI.getCategorias();
      setCategorias(categoriasData);
    }
  };

  // ── Obtener por ID ─────────────────────────────────────────────────────────
  const getSupplyById = (id) => supplies.find((s) => s.id === parseInt(id));

  // ── Crear insumo ───────────────────────────────────────────────────────────
  const createSupply = async (supplyData) => {
    // Validación: nombre duplicado (insensible a mayúsculas y espacios)
    const nombreNorm = supplyData.nombre?.trim().toLowerCase();
    const duplicado = supplies.find(
      (s) => s.nombre?.trim().toLowerCase() === nombreNorm
    );
    if (duplicado) {
      throw new Error(`Ya existe un insumo con el nombre "${supplyData.nombre}"`);
    }

    try {
      setLoading(true);
      const newSupply = await supplyAPI.create(supplyData);
      setSupplies((prev) => [...prev, newSupply]);
      return newSupply;
    } catch (err) {
      setError("Error al crear el insumo");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Actualizar insumo ──────────────────────────────────────────────────────
  const updateSupply = async (id, supplyData) => {
    // Validación: nombre duplicado excluyendo el mismo insumo
    const nombreNorm = supplyData.nombre?.trim().toLowerCase();
    const duplicado = supplies.find(
      (s) => s.id !== id && s.nombre?.trim().toLowerCase() === nombreNorm
    );
    if (duplicado) {
      throw new Error(`Ya existe un insumo con el nombre "${supplyData.nombre}"`);
    }

    try {
      setLoading(true);
      const updatedSupply = await supplyAPI.update(id, supplyData);
      setSupplies((prev) => prev.map((s) => (s.id === id ? updatedSupply : s)));
    } catch (err) {
      setError("Error al actualizar el insumo");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar insumo ────────────────────────────────────────────────────────
  const deleteSupply = async (id) => {
    // TODO: validar fichas técnicas enlazadas antes de eliminar
    // Cuando sepas cómo referencia la ficha técnica al insumo, reemplaza
    // la función getFichasEnlazadas con la lógica real. Ejemplo:
    //
    // const getFichasEnlazadas = (supplyId) => {
    //   const raw = localStorage.getItem("app_fichas");
    //   const fichas = raw ? JSON.parse(raw) : [];
    //   return fichas.filter(f => f.supplyId === supplyId).length;
    //   // o si usa array de insumos: f.insumos?.some(i => i.id === supplyId)
    // };
    //
    // const enlazadas = getFichasEnlazadas(id);
    // if (enlazadas > 0) {
    //   throw new Error(
    //     `Este insumo está enlazado a ${enlazadas} ficha${enlazadas > 1 ? "s" : ""} técnica${enlazadas > 1 ? "s" : ""}. Desasócialo antes de eliminarlo.`
    //   );
    // }

    try {
      setLoading(true);
      await supplyAPI.delete(id);
      setSupplies((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("Error al eliminar el insumo");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Alternar estado ────────────────────────────────────────────────────────
  const toggleSupply = (id) => {
    setSupplies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: !s.estado } : s))
    );
  };

  // ── Helpers de catálogos ───────────────────────────────────────────────────
  const getCategoriaNombre = (categoriaId) =>
    categorias.find((c) => c.id === categoriaId)?.nombre ?? "Sin categoría";

  const getMedidaNombre = (medidaId) =>
    medidas.find((m) => m.id === medidaId)?.nombre ?? "Sin medida";

  const getPropiedadNombre = (propiedadId) =>
    propiedades.find((p) => p.id === propiedadId)?.nombre ?? "Desconocida";

  return {
    supplies,
    loading,
    error,
    getSupplyById,
    createSupply,
    updateSupply,
    deleteSupply,
    toggleSupply,
    categorias,
    medidas,
    propiedades,
    getCategoriaNombre,
    getMedidaNombre,
    getPropiedadNombre,
  };
};