import { useState, useEffect } from 'react';

// 📦 DATOS DIRECTOS AQUÍ (temporal)
const mockProducts = [
  {
    id: '772',
    image: 'https://via.placeholder.com/40/3B82F6/ffffff?text=772',
    reference: '772',  // ← SOLO NÚMERO
    name: 'Crop Top Negro para todos los días',  // ← COMPLETO
    category: 'Crop Top',
    price: 33000,
    stock: 5,
    technicalSheetVersions: 2,
    lastVersionDate: '2026-02-10'
  },
  {
    id: '482',
    image: 'https://via.placeholder.com/40/8B5CF6/ffffff?text=482',
    reference: '482',
    name: 'Vestido Bohemio Largo con Estampado Floral',
    category: 'Vestidos',
    price: 36000,
    stock: 10,
    technicalSheetVersions: 1,
    lastVersionDate: '2026-02-09'
  },
  {
    id: 'E57',
    image: 'https://via.placeholder.com/40/EC4899/ffffff?text=E57',
    reference: 'E57',
    name: 'Enterizo Negro Escotado con Abertura Lateral',
    category: 'Enterizos',
    price: 60000,
    stock: 10,
    technicalSheetVersions: 3,
    lastVersionDate: '2026-02-08'
  },
  {
    id: '601',
    image: 'https://via.placeholder.com/40/F59E0B/ffffff?text=601',
    reference: '601',
    name: 'Buzo Estampado Oversize con Capucha',
    category: 'Buzos',
    price: 35000,
    stock: 20,
    technicalSheetVersions: 1,
    lastVersionDate: '2026-02-07'
  },
  {
    id: '678',
    image: 'https://via.placeholder.com/40/EF4444/ffffff?text=678',
    reference: '678',
    name: 'Crop Top Rojo con Encaje',
    category: 'Crop Top',
    price: 33000,
    stock: 3,
    technicalSheetVersions: 2,
    lastVersionDate: '2026-02-06'
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ⚡ CARGAR DATOS DIRECTAMENTE
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const createProduct = async (productData) => {
    const newProduct = {
      id: Date.now().toString().slice(-4),
      ...productData,
      image: productData.image || `https://via.placeholder.com/40/10B981/ffffff?text=${Date.now().toString().slice(-4)}`,
      technicalSheetVersions: 1,
      lastVersionDate: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id, productData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: () => setProducts(mockProducts)
  };  
};