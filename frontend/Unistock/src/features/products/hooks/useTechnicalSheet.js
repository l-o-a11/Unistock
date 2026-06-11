import { useState } from 'react';
import { productAPI } from '../services/productAPI';

export const useTechnicalSheet = (productId) => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadVersions = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getTechnicalSheetVersions(productId);
      setVersions(data);
      setCurrentVersion(data[0] || null);
    } catch (err) {
      const message = err?.message || 'Error al cargar versiones';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createVersion = async (sheetData) => {
    try {
      setLoading(true);
      setError(null);
      const newVersion = await productAPI.createTechnicalSheet({
        ...sheetData,
        productId,
        version: versions.length + 1,
      });
      setVersions(prev => [newVersion, ...prev]);
      setCurrentVersion(newVersion);
      return newVersion;
    } catch (err) {
      const message = err?.message || 'Error al crear versión';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLastVersion = async (versionId) => {
    if (versions.length === 0) return;
    try {
      setError(null);
      await productAPI.deleteTechnicalSheet(productId, versionId);
      setVersions([]);
      setCurrentVersion(null);
    } catch (err) {
      const message = err?.message || 'Error al eliminar versión';
      setError(message);
      throw err;
    }
  };

  return {
    versions,
    currentVersion,
    loading,
    error,
    loadVersions,
    createVersion,
    deleteLastVersion
  };
};