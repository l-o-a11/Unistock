import { useState, useEffect } from 'react';

const LS_KEY = 'app_third_parties';
let nextCode = 9;
const genCode = () => { const c = `TP-${String(nextCode).padStart(3,'0')}`; nextCode++; return c; };

const INITIAL_THIRD_PARTIES = [
  { id: 1, codigo: 'TP-001', nit: '900123456-7', nombreEmpresa: 'Textil Aurora S.A.S',            nombreContacto: 'Rosalba de los Milagros', direccion: 'Calle 50 # 85-48, Medellín', telefono: '314782451',  correoEmpresa: 'contacto@textilaurora.com',       correoContacto: '', sitioWeb: 'https://textilaurora.com',        estado: true,  producciones: [{ orden: 21, fecha: '11/04/2025', produccionId: 1 }] },
  { id: 2, codigo: 'TP-002', nit: '800222111-3', nombreEmpresa: 'Insumos Industriales Colombia', nombreContacto: 'Carlos Pérez',             direccion: 'Cra 45 # 10-23, Medellín',  telefono: '3019876543', correoEmpresa: 'ventas@insumoscolombia.com',       correoContacto: '', sitioWeb: 'https://insumoscolombia.com',     estado: true,  producciones: [{ orden: 22, fecha: '02/03/2025', produccionId: 2 }] },
  { id: 3, codigo: 'TP-003', nit: '901456789-0', nombreEmpresa: 'Moda Femenina S.A.S',           nombreContacto: 'Andrea Ruiz',              direccion: 'Av 80 # 12-40, Medellín',   telefono: '3024567890', correoEmpresa: 'info@modafemenina.com',            correoContacto: '', sitioWeb: 'https://modafemenina.com',        estado: false, producciones: [] },
  { id: 4, codigo: 'TP-004', nit: '900999888-1', nombreEmpresa: 'Confecciones Modernas',         nombreContacto: 'Ana Pérez',                direccion: 'Calle 10 # 42-15, Medellín',telefono: '3001234567', correoEmpresa: 'contacto@confeccionesmodernas.com', correoContacto: '', sitioWeb: 'https://confeccionesmodernas.com', estado: true,  producciones: [] },
  { id: 5, codigo: 'TP-005', nit: '901333222-5', nombreEmpresa: 'Distribuciones El Corte',       nombreContacto: 'Jorge Ramírez',            direccion: 'Cra 70 # 25-90, Medellín',  telefono: '3115558899', correoEmpresa: 'ventas@elcorte.com',               correoContacto: '', sitioWeb: 'https://elcorte.com',             estado: false, producciones: [] },
  { id: 6, codigo: 'TP-006', nit: '800777666-4', nombreEmpresa: 'Servicios Textiles del Norte',  nombreContacto: 'Luis Fernando Díaz',       direccion: 'Calle 33 # 65-12, Medellín',telefono: '3204447788', correoEmpresa: 'info@textilesnorte.com',            correoContacto: '', sitioWeb: 'https://textilesnorte.com',       estado: true,  producciones: [] },
  { id: 7, codigo: 'TP-007', nit: '902111000-9', nombreEmpresa: 'Bordados y Acabados S.A.',      nombreContacto: 'Patricia Gómez',           direccion: 'Cra 52 # 40-11, Medellín',  telefono: '3187776655', correoEmpresa: 'info@bordadosacabados.com',         correoContacto: '', sitioWeb: '',                                estado: true,  producciones: [] },
  { id: 8, codigo: 'TP-008', nit: '901887654-2', nombreEmpresa: 'Importadora Telas Finas',       nombreContacto: 'Ricardo Montoya',          direccion: 'Calle 80 # 30-15, Medellín',telefono: '3142223344', correoEmpresa: 'ventas@telasfinas.com',             correoContacto: '', sitioWeb: '',                                estado: true,  producciones: [] },
];

// Sync nextCode with stored data to avoid duplicate codes
const syncNextCode = (list) => {
  list.forEach(t => {
    const n = parseInt((t.codigo || '').replace('TP-', ''), 10);
    if (!isNaN(n) && n >= nextCode) nextCode = n + 1;
  });
};

const loadFromLS = () => { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const saveToLS   = (d) => { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {} };
const getInitial = () => {
  const s = loadFromLS();
  if (s && s.length > 0) { syncNextCode(s); return s; }
  saveToLS(INITIAL_THIRD_PARTIES);
  syncNextCode(INITIAL_THIRD_PARTIES);
  return INITIAL_THIRD_PARTIES;
};

export const useThird_parties = () => {
  const [Third_parties, setThird_parties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => { setThird_parties(getInitial()); setLoading(false); }, 300);
  }, []);

  const persist = (list) => { saveToLS(list); return list; };

  const createThird_partie = async (data) => {
    const newT = { id: Date.now(), codigo: genCode(), producciones: [], estado: true, ...data };
    newT.codigo = newT.codigo; // ensure genCode() result is used
    setThird_parties(p => persist([...p, newT]));
    return newT;
  };

  const updateThird_partie = async (id, data) => {
    setThird_parties(p => persist(
      p.map(t => t.id === id
        ? { ...t, ...data, codigo: t.codigo, producciones: t.producciones }
        : t
      )
    ));
  };

  const deleteThird_partie = async (id) => {
    const t = Third_parties.find(x => x.id === id);
    if (t?.producciones?.length > 0)
      throw new Error(`No se puede eliminar: este tercero tiene ${t.producciones.length} producción(es) asignada(s).`);
    setThird_parties(p => persist(p.filter(x => x.id !== id)));
  };

  const toggleThird_partie = (id) =>
    setThird_parties(p => persist(p.map(t => t.id === id ? { ...t, estado: !t.estado } : t)));

  const refreshThird_parties = () => { const d = loadFromLS(); if (d) setThird_parties(d); };

  // Vincular una producción a un tercero
  const linkProduccion = (terceroId, { orden, fecha, produccionId }) => {
    setThird_parties(p => persist(
      p.map(t => t.id === terceroId
        ? { ...t, producciones: [...(t.producciones || []), { orden, fecha, produccionId }] }
        : t
      )
    ));
  };

  return { Third_parties, loading, error, createThird_partie, updateThird_partie, deleteThird_partie, refreshThird_parties, toggleThird_partie, linkProduccion };
};
