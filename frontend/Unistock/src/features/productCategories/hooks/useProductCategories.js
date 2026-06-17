import { useState, useEffect } from 'react';
import { productCategoryAPI } from '../services/productCategoryAPI';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortCategoriesAsc = (list) => {
    return [...(list || [])].sort((a, b) => {
      const idA = String(a.id ?? a._id ?? '');
      const idB = String(b.id ?? b._id ?? '');
      return idA.localeCompare(idB);
    });
  };

  const loadProductCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productCategoryAPI.getAll();
      setProductCategories(sortCategoriesAsc(data || []));
    } catch (err) {
      setError(err?.message || 'Error al cargar categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductCategories();
  }, []);

  const createProductCategory = async (data) => {
    try {
      setError(null);
      const newItem = await productCategoryAPI.create(data);
      await loadProductCategories();
      return newItem;
    } catch (err) {
      setError(err?.message || 'Error al crear categoría');
      throw err;
    }
  };

  const updateProductCategory = async (id, data) => {
    try {
      setError(null);
      const updated = await productCategoryAPI.update(id, data);
      await loadProductCategories();
      return updated;
    } catch (err) {
      setError(err?.message || 'Error al actualizar categoría');
      throw err;
    }
  };

  const deleteProductCategory = async (id) => {
    try {
      setError(null);
      await productCategoryAPI.delete(id);
      await loadProductCategories();
    } catch (err) {
      setError(err?.message || 'Error al eliminar categoría');
      throw err;
    }
  };

  return {
    productCategories,
    loading,
    error,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    refreshProductCategories: loadProductCategories,
  };
};
