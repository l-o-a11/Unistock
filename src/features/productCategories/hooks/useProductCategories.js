import { useState, useEffect } from 'react';
import { productCategoryAPI } from '../services/productCategoryAPI';
import { useProducts } from '../../products/hooks/useProducts';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Obtener productos para calcular stock por categoría
  const { products } = useProducts();

  const sortCategoriesAsc = (list) => {
    return [...(list || [])].sort((a, b) => {
      const idA = String(a.id ?? a._id ?? '');
      const idB = String(b.id ?? b._id ?? '');
      return idA.localeCompare(idB);
    });
  };

  // ✅ NUEVA: Calcular productCount como suma de stocks por categoría
  const enrichCategoriesWithStock = (categories) => {
    if (!Array.isArray(categories) || !Array.isArray(products)) {
      return categories;
    }

    return categories.map(category => {
      // Obtener el nombre de la categoría (puede ser "nombre" o "name")
      const categoryName = category.name ?? category.nombre ?? '';
      
      // Sumar todos los stocks de productos en esta categoría
      const totalStock = products
        .filter(product => {
          const productCategory = product.category ?? product.categoria ?? '';
          return productCategory === categoryName;
        })
        .reduce((sum, product) => {
          return sum + (parseInt(product.stock) || 0);
        }, 0);

      // ✅ Retornar categoría con productCount actualizado (suma de stocks)
      return {
        ...category,
        productCount: totalStock // ← Ahora es la suma de stocks
      };
    });
  };

  // ✅ CARGAR CATEGORÍAS - Sin cascada de renders
  useEffect(() => {
    let cancelled = false;

    const fetchAndEnrich = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productCategoryAPI.getAll();
        
        if (!cancelled) {
          const enrichedCategories = enrichCategoriesWithStock(data || []);
          setProductCategories(sortCategoriesAsc(enrichedCategories));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Error al cargar categorías');
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAndEnrich();
    return () => { cancelled = true; };
  }, [products]); // Recargar cuando hay cambios en productos

  // ✅ Función auxiliar para recargar manualmente
  const refreshProductCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productCategoryAPI.getAll();
      const enrichedCategories = enrichCategoriesWithStock(data || []);
      setProductCategories(sortCategoriesAsc(enrichedCategories));
    } catch (err) {
      setError(err?.message || 'Error al cargar categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProductCategory = async (data) => {
    try {
      setError(null);
      const newItem = await productCategoryAPI.create(data);
      await refreshProductCategories();
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
      await refreshProductCategories();
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
      await refreshProductCategories();
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
    refreshProductCategories,
  };
};