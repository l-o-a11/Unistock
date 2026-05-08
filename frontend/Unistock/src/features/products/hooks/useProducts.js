import { useState, useEffect } from 'react';
import { productAPI } from '../services/productAPI';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const newProduct = await productAPI.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError('Error al crear producto');
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const updatedProduct = await productAPI.update(id, productData);
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                ...updatedProduct,
                // Respaldo: si el backend no devolviera technicalSheet, conservamos el anterior
                technicalSheet: updatedProduct.technicalSheet ?? p.technicalSheet,
              }
            : p
        )
      );
      return updatedProduct;
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

  const toggleProduct = async (id) => {
    try {
      const updatedProduct = await productAPI.toggleActive(id);
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                ...updatedProduct,
                // toggle solo cambia active, no debería borrar la ficha técnica
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