import { useState, useEffect } from 'react';
import { SuppliersAPIClient } from '../services/SuppliersAPIClient';

const STORAGE_KEY = 'app_suppliers';

// ── Helpers de localStorage ─────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // JSON corrupto — ignorar y usar seed
  }
  return null;
};

const saveToStorage = (suppliers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  } catch (e) {
    console.error('No se pudo guardar en localStorage:', e);
  }
};

export const mockSuppliers = [
  {
    id: 1,
    nit: '900123456',
    nombreEmpresa: 'Textiles Medellín',
    nombreContacto: 'Laura Gómez',
    direccion: 'Cra 45 #10-20',
    telefono: '3001234567',
    email: 'contacto@textiles.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: true,
  },
  {
    id: 2,
    nit: '800555222',
    nombreEmpresa: 'Insumos Colombia',
    nombreContacto: 'Carlos Pérez',
    direccion: 'Calle 30 #50-60',
    telefono: '3019876543',
    email: 'ventas@insumos.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: true,
  },
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial desde el API real
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar desde el API real
      const response = await SuppliersAPIClient.getSuppliers({
        page: 1,
        limit: 100,
        sortBy: 'nombre_de_empresa'
      });
      
      // Mapear respuesta del backend al formato del frontend
      const mappedSuppliers = (response.data.data || []).map(supplier => ({
        id: supplier._id || supplier.id,
        nit: supplier.nit,
        nombreEmpresa: supplier.nombre_de_empresa,
        nombre_de_empresa: supplier.nombre_de_empresa,
        nombreContacto: supplier.nombre_del_contacto,
        nombre_del_contacto: supplier.nombre_del_contacto,
        direccion: supplier.direccion,
        telefono: supplier.telefono,
        email: supplier.correo,
        correo: supplier.correo,
        sitioweb: supplier.sitio_web,
        sitio_web: supplier.sitio_web,
        estado: supplier.activo,
        activo: supplier.activo,
        rawData: supplier
      }));
      
      setSuppliers(mappedSuppliers);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      setError('Error al cargar los proveedores. Verifica la conexión con el servidor.');
      // Fallback a localStorage si la API falla
      try {
        const cached = loadFromStorage();
        if (cached) {
          setSuppliers(cached);
          setError(null);
        }
      } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // ➕ Crear proveedor
  const createSupplier = async (supplierData) => {
  try {
  // Mapear formato frontend → backend
  const backendData = {
    nit: supplierData.nit,
    nombre_de_empresa: supplierData.nombreEmpresa || supplierData.nombre_de_empresa,
    nombre_del_contacto: supplierData.nombreContacto || supplierData.nombre_del_contacto,
    direccion: supplierData.direccion,
    telefono: supplierData.telefono,
    correo: supplierData.correoEmpresa || supplierData.email || supplierData.correo,
    sitio_web: supplierData.sitioWeb || supplierData.sitioweb || supplierData.sitio_web,
  };
  const newSupplier = await SuppliersAPIClient.createSupplier(backendData);
      
      // Mapear respuesta
      const supplier = newSupplier.data || newSupplier;
      const mapped = {
        id: supplier._id || supplier.id,
        nit: supplier.nit,
        nombreEmpresa: supplier.nombre_de_empresa,
        nombre_de_empresa: supplier.nombre_de_empresa,
        nombreContacto: supplier.nombre_del_contacto,
        nombre_del_contacto: supplier.nombre_del_contacto,
        direccion: supplier.direccion,
        telefono: supplier.telefono,
        email: supplier.correo,
        correo: supplier.correo,
        sitioweb: supplier.sitio_web,
        sitio_web: supplier.sitio_web,
        estado: supplier.activo,
        activo: supplier.activo,
        rawData: supplier
      };
      
      setSuppliers((prev) => [...prev, mapped]);
      return mapped;
    } catch (err) {
      console.error('Error al crear proveedor:', err);
      setError('Error al crear el proveedor');
      throw err;
    }
  };

  // ✏️ Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    try {
      // Mapear formato frontend → backend
      const backendData = {
        nit: supplierData.nit,
        nombre_de_empresa: supplierData.nombreEmpresa || supplierData.nombre_de_empresa,
        nombre_del_contacto: supplierData.nombreContacto || supplierData.nombre_del_contacto,
        direccion: supplierData.direccion,
        telefono: supplierData.telefono,
        correo: supplierData.correoEmpresa || supplierData.email || supplierData.correo,
        sitio_web: supplierData.sitioWeb || supplierData.sitioweb || supplierData.sitio_web,
      };
      
      const updated = await SuppliersAPIClient.updateSupplier(id, backendData);
      
      // Mapear respuesta
      const mapped = {
        id: updated._id || updated.id,
        nit: updated.nit,
        nombreEmpresa: updated.nombre_de_empresa,
        nombre_de_empresa: updated.nombre_de_empresa,
        nombreContacto: updated.nombre_del_contacto,
        nombre_del_contacto: updated.nombre_del_contacto,
        direccion: updated.direccion,
        telefono: updated.telefono,
        email: updated.correo,
        correo: updated.correo,
        sitioweb: updated.sitio_web,
        sitio_web: updated.sitio_web,
        estado: updated.activo,
        activo: updated.activo,
        rawData: updated
      };
      
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? mapped : s))
      );
      return mapped;
    } catch (err) {
      console.error('Error al actualizar proveedor:', err);
      setError('Error al actualizar el proveedor');
      throw err;
    }
  };

  // ❌ Eliminar proveedor
  const deleteSupplier = async (id) => {
    try {
      await SuppliersAPIClient.deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
      setError('Error al eliminar el proveedor');
      throw err;
    }
  };

  // 🔄 Refrescar lista
  const refreshSuppliers = () => {
    loadSuppliers();
  };

  // 🔄 Alternar estado del proveedor
  const toggleSupplier = async (id) => {
    try {
      const updated = await SuppliersAPIClient.toggleSupplier(id);
      
      const mapped = {
        id: updated._id || updated.id,
        nit: updated.nit,
        nombreEmpresa: updated.nombre_de_empresa,
        nombre_de_empresa: updated.nombre_de_empresa,
        nombreContacto: updated.nombre_del_contacto,
        nombre_del_contacto: updated.nombre_del_contacto,
        direccion: updated.direccion,
        telefono: updated.telefono,
        email: updated.correo,
        correo: updated.correo,
        sitioweb: updated.sitio_web,
        sitio_web: updated.sitio_web,
        estado: updated.activo,
        activo: updated.activo,
        rawData: updated
      };
      
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? mapped : s))
      );
      return mapped;
    } catch (err) {
      console.error('Error al cambiar estado del proveedor:', err);
      setError('Error al cambiar estado del proveedor');
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refreshSuppliers,
    toggleSupplier,
  };
};
