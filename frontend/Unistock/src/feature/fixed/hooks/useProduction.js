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
      setError('Error al cargar producciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProduction = async (productionData) => {
    try {
      const newProduction = await ProductionAPI.create(productionData);
      setProductions(prev => [...prev, newProduction]);
      return newProduction;
    } catch (err) {
      setError('Error al crear producción');
      throw err;
    }
  };

  const updateProduction = async (id, productionData) => {
    try {
      const updated = await ProductionAPI.update(id, productionData);
      setProductions(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError('Error al actualizar producción');
      throw err;
    }
  };

  // Anular producción con motivo — agrega fecha + motivo al historial
  const cancelProduction = async (id, motivo) => {
    try {
      const updated = await ProductionAPI.cancel(id, motivo);
      setProductions(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError('Error al anular producción');
      throw err;
    }
  };

  const deleteProduction = async (id) => {
    try {
      await ProductionAPI.delete(id);
      setProductions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar producción');
      throw err;
    }
  };

  return {
    Productions,
    loading,
    error,
    createProduction,
    updateProduction,
    cancelProduction,
    deleteProduction,
    refreshProductions: loadProductions,
  };
};
