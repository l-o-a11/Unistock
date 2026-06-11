import { useState, useEffect } from 'react';
import { productAPI } from '../services/productAPI';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortProductsAsc = (list) => {
    return [...(list || [])].sort((a, b) => {
      const idA = String(a.id ?? a._id ?? '');
      const idB = String(b.id ?? b._id ?? '');
      return idA.localeCompare(idB);
    });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(sortProductsAsc(data));
    } catch {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    productAPI.getAll()
      .then((data) => { if (!cancelled) { setProducts(sortProductsAsc(data)); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('Error al cargar productos'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const createProduct = async (productData) => {
    try {
      const newProduct = await productAPI.create(productData);
      try {
        const fullProduct = await productAPI.getById(newProduct.id);
        setProducts(prev => sortProductsAsc([...prev, fullProduct ?? newProduct]));
        return fullProduct ?? newProduct;
      } catch {
        setProducts(prev => sortProductsAsc([...prev, newProduct]));
        return newProduct;
      }
    } catch (err) {
      setError('Error al crear producto');
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const updatedProduct = await productAPI.update(id, productData);
      try {
        const fullProduct = await productAPI.getById(id);
        setProducts(prev =>
          prev.map(p => p.id === id ? (fullProduct ?? updatedProduct) : p)
        );
        return fullProduct ?? updatedProduct;
      } catch {
        setProducts(prev =>
          prev.map(p =>
            p.id === id
              ? {
                  ...p,
                  ...updatedProduct,
                  technicalSheet: updatedProduct.technicalSheet ?? p.technicalSheet,
                }
              : p
          )
        );
        return updatedProduct;
      }
    } catch (err) {
      setError('Error al actualizar producto');
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Error al eliminar producto');
      throw err;
    }
  };

  const toggleProduct = async (id, nextActive) => {
    try {
      const updatedProduct = await productAPI.toggleActive(id, nextActive);
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                ...updatedProduct,
                technicalSheet: updatedProduct.technicalSheet ?? p.technicalSheet,
              }
            : p
        )
      );
      return updatedProduct;
    } catch (err) {
      setError('Error al cambiar estado');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    refreshProducts: loadProducts
  };
};