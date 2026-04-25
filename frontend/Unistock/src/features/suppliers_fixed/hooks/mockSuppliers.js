import { useState, useEffect } from 'react';

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
  {
    id: 3,
    nit: '901777888',
    nombreEmpresa: 'Moda Femenina SAS',
    nombreContacto: 'Andrea Ruiz',
    direccion: 'Av 80 #12-40',
    telefono: '3024567890',
    email: 'info@moda.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: false,
  },
  {
    id: 4,
    nit: '901777888',
    nombreEmpresa: 'Moda Femenina SAS',
    nombreContacto: 'Andrea Ruiz',
    direccion: 'Av 80 #12-40',
    telefono: '3024567890',
    email: 'info@moda.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: false,
  },
  {
    id: 5,
    nit: '901777888',
    nombreEmpresa: 'Moda Femenina SAS',
    nombreContacto: 'Andrea Ruiz',
    direccion: 'Av 80 #12-40',
    telefono: '3024567890',
    email: 'info@moda.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: false,
  },
  {
    id: 6,
    nit: '901777888',
    nombreEmpresa: 'Moda Femenina SAS',
    nombreContacto: 'Andrea Ruiz',
    direccion: 'Av 80 #12-40',
    telefono: '3024567890',
    email: 'info@moda.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: false,
  },
  {
    id: 7,
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
    id: 8,
    nit: '900123456',
    nombreEmpresa: 'Textiles Medellín',
    nombreContacto: 'Laura Gómez',
    direccion: 'Cra 45 #10-20',
    telefono: '3001234567',
    email: 'contacto@textiles.com',
    sitioweb: 'https://textilesmedellin.com',
    estado: true,
  },
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial: localStorage primero, datos seed como fallback
  useEffect(() => {
    const cached = loadFromStorage();
    if (cached) {
      setSuppliers(cached);
      setLoading(false);
    } else {
      // Simular carga desde API
      setTimeout(() => {
        setSuppliers(mockSuppliers);
        setLoading(false);
      }, 500);
    }
  }, []);

  // Persistir cada vez que suppliers cambia
  useEffect(() => {
    if (!loading) {
      saveToStorage(suppliers);
    }
  }, [suppliers, loading]);

  // ➕ Crear proveedor
  const createSupplier = async (supplierData) => {
    const newSupplier = {
      id: Date.now(),
      estado: true,
      ...supplierData,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  // ✏️ Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...supplierData } : s))
    );
  };

  // ❌ Eliminar proveedor — solo se puede si está inactivo
  const deleteSupplier = async (id) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // 🔄 Refrescar lista (vuelve al seed y limpia localStorage)
  const refreshSuppliers = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSuppliers(mockSuppliers);
  };

  // 🔄 Alternar estado del proveedor
  const toggleSupplier = (id) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: !s.estado } : s))
    );
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
