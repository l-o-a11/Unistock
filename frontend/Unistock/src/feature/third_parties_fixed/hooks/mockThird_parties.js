import { useState, useEffect } from 'react';

export const mockThird_parties = [
  {
    id: 1,
    nit: '900123456-7',
    nombreEmpresa: 'Textil Aurora S.A.S',
    nombreContacto: 'Rosalba de los Milagros',
    direccion: 'Calle 50 # 85-48, Medellín',
    telefono: '314782451',
    email: 'contacto@textilaurora.com',
    sitioweb: 'https://textilaurora.com',
    estado: true,
    producciones: [
      { orden: 21, fecha: "11/04/2025" },
      
    ],
  },
  {
    id: 2,
    nit: '800222111-3',
    nombreEmpresa: 'Insumos Industriales Colombia',
    nombreContacto: 'Carlos Pérez',
    direccion: 'Cra 45 # 10-23, Medellín',
    telefono: '3019876543',
    email: 'ventas@insumoscolombia.com',
    sitioweb: 'https://insumoscolombia.com',
    estado: true,
    producciones: [
      { orden: 30011, fecha: "02/03/2025" },
    ],
  },
  {
    id: 3,
    nit: '901456789-0',
    nombreEmpresa: 'Moda Femenina S.A.S',
    nombreContacto: 'Andrea Ruiz',
    direccion: 'Av 80 # 12-40, Medellín',
    telefono: '3024567890',
    email: 'info@modafemenina.com',
    sitioweb: 'https://modafemenina.com',
    estado: false,
    producciones: [],
  },
  {
    id: 4,
    nit: '900999888-1',
    nombreEmpresa: 'Confecciones Modernas',
    nombreContacto: 'Ana Pérez',
    direccion: 'Calle 10 # 42-15, Medellín',
    telefono: '3001234567',
    email: 'contacto@confeccionesmodernas.com',
    sitioweb: 'https://confeccionesmodernas.com',
    estado: true,
    producciones: [
      { corte: 40021, fecha: "20/01/2025" },
      { corte: 40022, fecha: "21/01/2025" },
    ],
  },
  {
    id: 5,
    nit: '901333222-5',
    nombreEmpresa: 'Distribuciones El Corte',
    nombreContacto: 'Jorge Ramírez',
    direccion: 'Cra 70 # 25-90, Medellín',
    telefono: '3115558899',
    email: 'ventas@elcorte.com',
    sitioweb: 'https://elcorte.com',
    estado: false,
    producciones: [],
  },
  {
    id: 6,
    nit: '800777666-4',
    nombreEmpresa: 'Servicios Textiles del Norte',
    nombreContacto: 'Luis Fernando Díaz',
    direccion: 'Calle 33 # 65-12, Medellín',
    telefono: '3204447788',
    email: 'info@textilesnorte.com',
    sitioweb: 'https://textilesnorte.com',
    estado: true,
    producciones: [
      { corte: 60001, fecha: "05/05/2025" },
    ],
  },
  {
    id: 7,
    nit: '900123456-7',
    nombreEmpresa: 'Textil Aurora S.A.S',
    nombreContacto: 'Rosalba de los Milagros',
    direccion: 'Calle 50 # 85-48, Medellín',
    telefono: '314782451',
    email: 'contacto@textilaurora.com',
    sitioweb: 'https://textilaurora.com',
    estado: true,
    producciones: [],
  },
  {
    id: 8,
    nit: '900123456-7',
    nombreEmpresa: 'Textil Aurora S.A.S',
    nombreContacto: 'Rosalba de los Milagros',
    direccion: 'Calle 50 # 85-48, Medellín',
    telefono: '314782451',
    email: 'contacto@textilaurora.com',
    sitioweb: 'https://textilaurora.com',
    estado: true,
    producciones: [],
  },
];

export const useThird_parties = () => {
  const [Third_parties, setThird_parties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setThird_parties(mockThird_parties);
      setLoading(false);
    }, 500);
  }, []);

  // ➕ Crear tercero
  const createThird_partie = async (Third_partieData) => {
    const newThird_partie = {
      id: Date.now().toString(),
      producciones: [],
      ...Third_partieData,
    };
    setThird_parties(prev => [...prev, newThird_partie]);
    return newThird_partie;
  };

  // ✏️ Actualizar tercero
  const updateThird_partie = async (id, Third_partieData) => {
    setThird_parties(prev =>
      prev.map(s => (s.id === id ? { ...s, ...Third_partieData } : s))
    );
  };

  // ❌ Eliminar tercero
  const deleteThird_partie = async (id) => {
    setThird_parties(prev => prev.filter(s => s.id !== id));
  };

  // 🔄 Refrescar lista
  const refreshThird_parties = () => {
    setThird_parties(mockThird_parties);
  };

  // 🔄 Alternar estado del tercero
  const toggleThird_partie = (id) => {
    setThird_parties(prev =>
      prev.map(s => (s.id === id ? { ...s, estado: !s.estado } : s))
    );
  };

  return {
    Third_parties,
    loading,
    error,
    createThird_partie,
    updateThird_partie,
    deleteThird_partie,
    refreshThird_parties,
    toggleThird_partie,
  };
};