import { useState } from 'react';
import { productAPI } from '../services/productAPI';

export const useTechnicalSheet = (productId) => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadVersions = async () => {
    if (!productId) return [];
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getTechnicalSheetVersions(productId);
      setVersions(data);
      setCurrentVersion(data[0] || null);
      return data;
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
      // ✅ Fix numeración: usar el MÁXIMO existente + 1, no la cantidad en
      // memoria (evita números duplicados si "versions" no estaba completo).
      const freshVersions = await productAPI.getTechnicalSheetVersions(productId).catch(() => versions);
      const maxVersion = freshVersions.reduce((max, v) => Math.max(max, Number(v.version) || 0), 0);
      // ✅ Fix: la fecha de una versión NUEVA siempre debe ser la fecha real
      // en que se crea, no la fecha heredada de la versión que se editó
      // para partir de ella (sheetData.date traía la fecha vieja).
      const { date: _oldDate, ...sheetDataSinFecha } = sheetData;
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const newVersion = await productAPI.createTechnicalSheet({
        ...sheetDataSinFecha,
        productId,
        version: maxVersion + 1,
        date: localDate,
      });
      const updatedList = [newVersion, ...freshVersions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
      setVersions(updatedList);
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
    if (versions.length === 0) return false;
    try {
      setError(null);
      const result = await productAPI.deleteTechnicalSheet(productId, versionId);
      setVersions([]);
      setCurrentVersion(null);
      return true;
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