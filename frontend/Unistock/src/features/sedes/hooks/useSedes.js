import { useState, useEffect } from "react";
import { sedesAPI } from "../services/sedesAPI";

const STORAGE_KEY = "app_sedes";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveToStorage = (sedes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes));
  } catch (e) {
    console.error("No se pudo guardar en localStorage:", e);
  }
};

export const useSedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = loadFromStorage();
    if (cached) { setSedes(cached); setLoading(false); }
    else loadData();
  }, []);

  useEffect(() => {
    if (!loading) saveToStorage(sedes);
  }, [sedes, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await sedesAPI.getAll();
      setSedes(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar sedes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSede = async (sedeData) => {
    const duplicado = sedes.find(
      (s) => s.nombre?.trim().toLowerCase() === sedeData.nombre?.trim().toLowerCase()
    );
    if (duplicado) throw new Error(`Ya existe una sede con el nombre "${sedeData.nombre}"`);

    try {
      setLoading(true);
      const newSede = await sedesAPI.create(sedeData);
      setSedes((prev) => [...prev, newSede]);
      return newSede;
    } catch (err) {
      setError("Error al crear la sede");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSede = async (id, sedeData) => {
    const duplicado = sedes.find(
      (s) => s.id !== id && s.nombre?.trim().toLowerCase() === sedeData.nombre?.trim().toLowerCase()
    );
    if (duplicado) throw new Error(`Ya existe una sede con el nombre "${sedeData.nombre}"`);

    try {
      setLoading(true);
      const updated = await sedesAPI.update(id, sedeData);
      setSedes((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      setError("Error al actualizar la sede");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSede = async (id) => {
    try {
      setLoading(true);
      await sedesAPI.delete(id);
      setSedes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("Error al eliminar la sede");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleSede = (id) => {
    setSedes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: !s.estado } : s)));
  };

  return {
    sedes, loading, error,
    createSede, updateSede, deleteSede, toggleSede,
    refreshSedes: loadData,
  };
};