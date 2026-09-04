import { useState, useEffect } from 'react';
import { productCategoryAPI } from '../services/productCategoryAPI';
import { useProducts } from '../../products/hooks/useProducts';

const getProductCategoryId = (category) =>
  category?.id ?? category?._id ?? category?.id_categoria_producto ?? category?.id_categorias;

const sameProductCategoryId = (left, right) => String(left) === String(right);

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Obtener productos para calcular stock por categoría
  const { products, updateProductCategoryName } = useProducts();

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

    return categories.map((category) => {
      const categoryId =
        category.id ?? category._id ?? category.id_categoria_producto ?? category.id_categorias ?? category.id_categoria;

      const totalStock = products
        .filter((product) => {
          const productCategoryId = product.categoryId ?? product.id_categoria ?? product.id_categorias;
          return String(productCategoryId) === String(categoryId);
        })
        .reduce((sum, product) => {
          return sum + (parseInt(product.stock) || 0);
        }, 0);

      return {
        ...category,
        productCount: totalStock,
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
      const oldCategory = productCategories.find((c) =>
        sameProductCategoryId(getProductCategoryId(c), id)
      );
      const oldCategoryId = getProductCategoryId(oldCategory);
      const oldName = oldCategory?.name ?? oldCategory?.nombre ?? "";

      const updated = await productCategoryAPI.update(id, data);
      const newName = updated?.name ?? updated?.nombre ?? data?.nombre ?? oldName;

      if (oldCategoryId && oldName && newName && oldName !== newName) {
        updateProductCategoryName(oldCategoryId, newName);
      }

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