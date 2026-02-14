import { useState } from "react";
import { technicalSheetAPI } from "../services/technicalSheetAPI";

export const useTechnicalSheet = (productId) => {
    const [versions, setVersions] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadVersions = async () => {
        if (!productId) return;
        try {
            setLoading(true);
            const data = await technicalSheetAPI.getVersions(productId);
            setVersions(data);
            setCurrentVersion(data[0] || null); //Mostrara la versión más reciente por defecto
        } catch (err) {
            setError('Error al cargar versiones');
        } finally {
            setLoading(false);
        }
    };

    const createVersion = async (sheetData) => {
        try {
            setLoading(true);
            const newVersion = await technicalSheetAPI.create({
                ...sheetData, 
                productId,
                version: versions.length + 1, // Asignar número de versión secuencial
                date: new Date().toISOString(), // Fecha actual
            });
            setVersions(prev => [newVersion, ...prev]);
            setCurrentVersion(newVersion);
            return newVersion;
        } catch (err) {
            setError('Error al crear versión');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteLastVersion = async (versionId) => {
        if (versions.length === 0) return;
        if (versions.length > 1) {
            throw new Error('Solo se puede eliminar la última versión');
        }
        try {
            await technicalSheetAPI.delete(versions[0].id);
            setVersions([]);
            setCurrentVersion(null);
        } catch (err) {
            setError('Error al eliminar versión');
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