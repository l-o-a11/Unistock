import { useState, useEffect } from 'react';

// ── Contador auto-incremental para códigos ────────────────────────────────────
let nextCode = 9; // los mock usan TP-001..TP-008

const genCode = () => {
  const code = `TP-${String(nextCode).padStart(3, '0')}`;
  nextCode++;
  return code;
};

export const mockThird_parties = [
  { id: 1, codigo: 'TP-001', nit: '900123456-7', nombreEmpresa: 'Textil Aurora S.A.S',            nombreContacto: 'Rosalba de los Milagros', direccion: 'Calle 50 # 85-48, Medellín', telefono: '314782451',  email: 'contacto@textilaurora.com',       sitioweb: 'https://textilaurora.com',        estado: true,  producciones: [{ orden: 21, fecha: '11/04/2025', produccionId: 1 }] },
  { id: 2, codigo: 'TP-002', nit: '800222111-3', nombreEmpresa: 'Insumos Industriales Colombia', nombreContacto: 'Carlos Pérez',             direccion: 'Cra 45 # 10-23, Medellín',  telefono: '3019876543', email: 'ventas@insumoscolombia.com',       sitioweb: 'https://insumoscolombia.com',     estado: true,  producciones: [{ orden: 22, fecha: '02/03/2025', produccionId: 2 }] },
  { id: 3, codigo: 'TP-003', nit: '901456789-0', nombreEmpresa: 'Moda Femenina S.A.S',           nombreContacto: 'Andrea Ruiz',              direccion: 'Av 80 # 12-40, Medellín',   telefono: '3024567890', email: 'info@modafemenina.com',            sitioweb: 'https://modafemenina.com',        estado: false, producciones: [] },
  { id: 4, codigo: 'TP-004', nit: '900999888-1', nombreEmpresa: 'Confecciones Modernas',         nombreContacto: 'Ana Pérez',                direccion: 'Calle 10 # 42-15, Medellín',telefono: '3001234567', email: 'contacto@confeccionesmodernas.com', sitioweb: 'https://confeccionesmodernas.com', estado: true,  producciones: [] },
  { id: 5, codigo: 'TP-005', nit: '901333222-5', nombreEmpresa: 'Distribuciones El Corte',       nombreContacto: 'Jorge Ramírez',            direccion: 'Cra 70 # 25-90, Medellín',  telefono: '3115558899', email: 'ventas@elcorte.com',               sitioweb: 'https://elcorte.com',             estado: false, producciones: [] },
  { id: 6, codigo: 'TP-006', nit: '800777666-4', nombreEmpresa: 'Servicios Textiles del Norte',  nombreContacto: 'Luis Fernando Díaz',       direccion: 'Calle 33 # 65-12, Medellín',telefono: '3204447788', email: 'info@textilesnorte.com',            sitioweb: 'https://textilesnorte.com',       estado: true,  producciones: [] },
  { id: 7, codigo: 'TP-007', nit: '902111000-9', nombreEmpresa: 'Bordados y Acabados S.A.',      nombreContacto: 'Patricia Gómez',           direccion: 'Cra 52 # 40-11, Medellín',  telefono: '3187776655', email: 'info@bordadosacabados.com',         sitioweb: '',                                estado: true,  producciones: [] },
  { id: 8, codigo: 'TP-008', nit: '901887654-2', nombreEmpresa: 'Importadora Telas Finas',       nombreContacto: 'Ricardo Montoya',          direccion: 'Calle 80 # 30-15, Medellín',telefono: '3142223344', email: 'ventas@telasfinas.com',             sitioweb: '',                                estado: true,  producciones: [] },
];

export const useThird_parties = () => {
  const [Third_parties, setThird_parties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => { setThird_parties([...mockThird_parties]); setLoading(false); }, 400);
  }, []);

  // ➕ Crear — código automático
  const createThird_partie = async (data) => {
    const codigo = genCode();
    const newT = {
      id: Date.now(),
      codigo,
      producciones: [],
      estado: true,
      ...data,
      codigo, // forzar: el usuario nunca puede sobreescribir
    };
    mockThird_parties.push(newT);
    setThird_parties(prev => [...prev, newT]);
    return newT;
  };

  const updateThird_partie = async (id, data) => {
    const i = mockThird_parties.findIndex(t => t.id === id);
    if (i !== -1) {
      // Preservar código, id y producciones al editar
      mockThird_parties[i] = {
        ...mockThird_parties[i],
        ...data,
        codigo:      mockThird_parties[i].codigo,
        producciones: mockThird_parties[i].producciones,
      };
    }
    setThird_parties(prev =>
      prev.map(t => t.id === id
        ? { ...t, ...data, codigo: t.codigo, producciones: t.producciones }
        : t
      )
    );
  };

  // ✅ No permite eliminar si tiene producciones
  const deleteThird_partie = async (id) => {
    const t = mockThird_parties.find(x => x.id === id);
    if (t?.producciones?.length > 0) {
      throw new Error(`No se puede eliminar: este tercero tiene ${t.producciones.length} producción(es) asignada(s).`);
    }
    const i = mockThird_parties.findIndex(x => x.id === id);
    if (i !== -1) mockThird_parties.splice(i, 1);
    setThird_parties(prev => prev.filter(t => t.id !== id));
  };

  const toggleThird_partie = (id) => {
    const i = mockThird_parties.findIndex(t => t.id === id);
    if (i !== -1) mockThird_parties[i] = { ...mockThird_parties[i], estado: !mockThird_parties[i].estado };
    setThird_parties(prev => prev.map(t => t.id === id ? { ...t, estado: !t.estado } : t));
  };

  const refreshThird_parties = () => setThird_parties([...mockThird_parties]);

  return { Third_parties, loading, error, createThird_partie, updateThird_partie, deleteThird_partie, refreshThird_parties, toggleThird_partie };
};
