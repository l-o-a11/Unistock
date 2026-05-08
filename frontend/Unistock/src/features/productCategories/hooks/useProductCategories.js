import { useState, useEffect } from 'react';
import { productCategoryAPI } from '../services/productCategoryAPI';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productCategoryAPI.getAll();
      setProductCategories(data || []);
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
      setProductCategories(prev => [...prev, newItem]);
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
      setProductCategories(prev =>
        prev.map(pc => pc.id === id ? updated : pc)
      );
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
      setProductCategories(prev => prev.filter(pc => pc.id !== id));
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