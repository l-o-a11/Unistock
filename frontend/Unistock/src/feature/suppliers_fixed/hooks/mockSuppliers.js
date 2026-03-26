import { useState, useEffect } from 'react';

const LS_KEY = 'app_suppliers';

export const mockSuppliers = [
  { id: 1, nit: '900123456', nombreEmpresa: 'Textiles Medellín',    nombreContacto: 'Laura Gómez',    direccion: 'Cra 45 #10-20',      telefono: '3001234567', email: 'contacto@textiles.com',  sitioweb: 'https://textilesmedellin.com', estado: true  },
  { id: 2, nit: '800555222', nombreEmpresa: 'Insumos Colombia',      nombreContacto: 'Carlos Pérez',   direccion: 'Calle 30 #50-60',    telefono: '3019876543', email: 'ventas@insumos.com',     sitioweb: 'https://insumoscolombia.com',  estado: true  },
  { id: 3, nit: '901777888', nombreEmpresa: 'Moda Femenina SAS',     nombreContacto: 'Andrea Ruiz',    direccion: 'Av 80 #12-40',       telefono: '3024567890', email: 'info@moda.com',           sitioweb: 'https://modafemenina.com',     estado: false },
  { id: 4, nit: '902111333', nombreEmpresa: 'Confecciones del Sur',  nombreContacto: 'Pedro Muñoz',    direccion: 'Calle 10 #30-50',    telefono: '3105559999', email: 'info@confsur.com',        sitioweb: '',                             estado: false },
  { id: 5, nit: '900444555', nombreEmpresa: 'Distribuidora Rápida',  nombreContacto: 'Marcela Torres', direccion: 'Cra 70 #20-30',      telefono: '3007778899', email: 'ventas@distrap.com',     sitioweb: '',                             estado: true  },
  { id: 6, nit: '800321456', nombreEmpresa: 'Telas y Bordados S.A.', nombreContacto: 'Luis Díaz',      direccion: 'Calle 33 #65-12',    telefono: '3204447788', email: 'info@telasybordados.com', sitioweb: '',                             estado: true  },
  { id: 7, nit: '901654321', nombreEmpresa: 'Importadora Fina',      nombreContacto: 'Sofía Castro',   direccion: 'Cra 52 #40-11',      telefono: '3187776655', email: 'info@importfina.com',     sitioweb: '',                             estado: true  },
  { id: 8, nit: '900876543', nombreEmpresa: 'Accesorios Moda',       nombreContacto: 'Ricardo López',  direccion: 'Calle 80 #30-15',    telefono: '3142223344', email: 'ventas@accmoda.com',     sitioweb: '',                             estado: true  },
];

const loadFromLS = () => {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};
const saveToLS = (list) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
};
const getInitial = () => {
  const saved = loadFromLS();
  if (saved && saved.length > 0) return saved;
  saveToLS(mockSuppliers);
  return mockSuppliers;
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSuppliers(getInitial());
      setLoading(false);
    }, 300);
  }, []);

  const persist = (list) => { saveToLS(list); return list; };

  // ➕ Crear proveedor
  const createSupplier = async (supplierData) => {
    const newSupplier = { id: Date.now(), estado: true, ...supplierData };
    setSuppliers(prev => persist([...prev, newSupplier]));
    return newSupplier;
  };

  // ✏️ Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    setSuppliers(prev => persist(prev.map(s => s.id === id ? { ...s, ...supplierData } : s)));
  };

  // ❌ Eliminar proveedor — lanza error si está activo
  const deleteSupplier = async (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier?.estado === true) {
      throw new Error('No se puede eliminar un proveedor activo. Inactívalo primero.');
    }
    setSuppliers(prev => persist(prev.filter(s => s.id !== id)));
  };

  // 🔄 Alternar estado del proveedor
  const toggleSupplier = (id) => {
    setSuppliers(prev => persist(prev.map(s => s.id === id ? { ...s, estado: !s.estado } : s)));
  };

  // 🔄 Refrescar lista
  const refreshSuppliers = () => {
    setSuppliers(getInitial());
  };

  return { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier, refreshSuppliers, toggleSupplier };
};
