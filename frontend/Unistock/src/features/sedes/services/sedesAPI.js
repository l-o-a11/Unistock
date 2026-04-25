const STORAGE_KEY = "app_sedes";

const INITIAL_SEDES = [
  {
    id: 1,
    nombre: "Sede Principal",
    ciudad: "Medellín",
    barrio: "Parque Berrío",
    direccion: "Calle 50 #45-30",
    telefono: "6042345678",
    estado: true,
  },
  {
    id: 2,
    nombre: "Sede Norte",
    ciudad: "Medellín",
    barrio: "Parque Berrio",
    direccion: "Carrera 52 #90-15",
    telefono: "6042987654",
    estado: true,
  },
];

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveToStorage = (sedes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes));
  } catch (e) {
    console.error("No se pudo guardar en localStorage:", e);
  }
};

let mockSedes = loadFromStorage() ?? [...INITIAL_SEDES];

export const sedesAPI = {
  getAll: async () => new Promise((resolve) => setTimeout(() => resolve([...mockSedes]), 400)),

  getById: async (id) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const sede = mockSedes.find((s) => s.id === id);
      if (sede) resolve({ ...sede });
      else reject(new Error("Sede no encontrada"));
    }, 300);
  }),

  create: async (sedeData) => new Promise((resolve) => {
    setTimeout(() => {
      const newSede = {
        id: mockSedes.length > 0 ? Math.max(...mockSedes.map((s) => s.id)) + 1 : 1,
        estado: true,
        ...sedeData,
      };
      mockSedes.push(newSede);
      saveToStorage(mockSedes);
      resolve({ ...newSede });
    }, 400);
  }),

  update: async (id, updatedData) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSedes.findIndex((s) => s.id === id);
      if (index !== -1) {
        mockSedes[index] = { ...mockSedes[index], ...updatedData };
        saveToStorage(mockSedes);
        resolve({ ...mockSedes[index] });
      } else reject(new Error("Sede no encontrada"));
    }, 400);
  }),

  delete: async (id) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSedes.findIndex((s) => s.id === id);
      if (index !== -1) {
        mockSedes.splice(index, 1);
        saveToStorage(mockSedes);
        resolve();
      } else reject(new Error("Sede no encontrada"));
    }, 400);
  }),

  reset: () => { localStorage.removeItem(STORAGE_KEY); mockSedes = [...INITIAL_SEDES]; },
};