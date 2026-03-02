import { useState, useEffect } from 'react';
import { ProductionAPI } from '../services/ProductionAPI';

export const useProductions = () => {
  const [Productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductions();
  }, []);

  const loadProductions = async () => {
    try {
      setLoading(true);
      const data = await ProductionAPI.getAll();
      setProductions(data);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProduction = async (ProductionData) => {
    try {
      const newProduction = await ProductionAPI.create(ProductionData);
      setProductions(prev => [...prev, newProduction]);
      return newProduction;
    } catch (err) {
      setError('Error al crear categoría');
      throw err;
    }
  };

  const updateProduction = async (id, ProductionData) => {
    try {
      const updatedProduction = await ProductionAPI.update(id, ProductionData);
      setProductions(prev => prev.map(c => c.id === id ? updatedProduction : c));
      return updatedProduction;
    } catch (err) {
      setError('Error al actualizar categoría');
      throw err;
    }
  };

  const deleteProduction = async (id) => {
    try {
      await ProductionAPI.delete(id);
      setProductions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría');
      throw err;
    }
  };

const handleCancelProduction = async (id) => {
  try {
    // 🔴 Llamada a tu servicio / hook
    await updateProduction(id, { status: 'Anulada' });

    // opcional: si tienes función dedicada
    // await cancelProduction(id);

  } catch (error) {
    console.error('Error al anular producción:', error);
    alert('No se pudo anular la orden');
  }
};

  return {
    Productions,
    loading,
    error,
    createProduction,
    updateProduction,
    deleteProduction,
    refreshProductions: loadProductions,
  };
};