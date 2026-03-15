import { useState, useEffect } from 'react';


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

  useEffect(() => {
    // ⚡ Simulación de carga
    setLoading(true);
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 500);
  }, []);

  // ➕ Crear proveedor
  const createSupplier = async (supplierData) => {
    const newSupplier = {
      id: Date.now().toString(),
      ...supplierData
    };

    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  // ✏️ Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, ...supplierData } : s))
    );
  };

  // ❌ Eliminar proveedor
  const deleteSupplier = async (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // 🔄 Refrescar lista
  const refreshSuppliers = () => {
    setSuppliers(mockSuppliers);
  };

  // 🔄 Alternar estado del proveedor
  const toggleSupplier = (id) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, estado: !s.estado } : s))
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
  toggleSupplier
};

};
