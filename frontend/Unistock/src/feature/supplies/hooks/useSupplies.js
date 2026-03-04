import { useState, useEffect } from "react";
import { supplyAPI } from "../services/supplyAPI";

export const useSupplies = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [medidas, setMedidas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [suppliesData, medidasData, propiedadesData] =
        await Promise.all([
          supplyAPI.getAll(),
          supplyAPI.getMedidas(),
          supplyAPI.getPropiedades(),
        ]);

      setSupplies(suppliesData);
      setMedidas(medidasData);
      setPropiedades(propiedadesData);
      setError(null);
    } catch (err) {
      setError("Error al cargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener insumo por ID
  const getSupplyById = (id) => {
    return supplies.find((s) => s.id === parseInt(id));
  };

  // Crear insumo
  const createSupply = async (supplyData) => {
    try {
      setLoading(true);
      const newSupply = await supplyAPI.create(supplyData);
      setSupplies((prev) => [...prev, newSupply]);
      return newSupply;
    } catch (err) {
      setError("Error al crear el insumo");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar insumo
  const updateSupply = async (id, supplyData) => {
    try {
      setLoading(true);
      const updatedSupply = await supplyAPI.update(id, supplyData);

      setSupplies((prev) =>
        prev.map((s) => (s.id === id ? updatedSupply : s))
      );
    } catch (err) {
      setError("Error al actualizar el insumo");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar insumo
  const deleteSupply = async (id) => {
    try {
      setLoading(true);
      await supplyAPI.delete(id);
      setSupplies((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("Error al eliminar el insumo");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Alternar estado
  const toggleSupply = (id) => {
    setSupplies((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, estado: !s.estado } : s
      )
    );
  };

  // Obtener nombre de medida por ID

  const getMedidaNombre = (medidaId) => {
  const medida = medidas.find(m => m.id === medidaId);
  return medida ? medida.nombre : "Sin medida";
};
  // Obtener nombre de propiedad por ID
  const getPropiedadNombre = (propiedadId) => {
    const propiedad = propiedades.find((p) => p.id === propiedadId);
    return propiedad ? propiedad.nombre : "Desconocida";
  };

  return {
    // Estados
    supplies,
    loading,
    error,

    // CRUD
    getSupplyById,
    createSupply,
    updateSupply,
    deleteSupply,
    toggleSupply,

    // Catálogos
    medidas,
    propiedades,
    getMedidaNombre,
    getPropiedadNombre,
  };
};