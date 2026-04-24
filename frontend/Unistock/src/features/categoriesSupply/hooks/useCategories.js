import { useState, useEffect } from 'react';
import { categoryAPI } from '../services/categoryAPI';

const STORAGE_KEY = 'app_categorias';

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

const saveToStorage = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('No se pudo guardar en localStorage:', e);
  }
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial: localStorage primero, API como fallback
  useEffect(() => {
    const cached = loadFromStorage();
    if (cached) {
      setCategories(cached);
      setLoading(false);
    } else {
      loadCategories();
    }
  }, []);

  // Persistir cada vez que categories cambia
  useEffect(() => {
    if (!loading) {
      saveToStorage(categories);
    }
  }, [categories, loading]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAll();
      setCategories(data);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const newCategory = await categoryAPI.create(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError('Error al crear categoría');
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await categoryAPI.update(id, categoryData);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      setError('Error al actualizar categoría');
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
};