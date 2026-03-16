const STORAGE_KEY = 'app_categorias';

const INITIAL_CATEGORIES = [
  { id: 1, nombre: 'Telas' },
  { id: 2, nombre: 'Hilos' },
  { id: 3, nombre: 'Cierres' },
  { id: 4, nombre: 'Elásticos' },
  { id: 5, nombre: 'Encajes y pasamanería' },
  { id: 6, nombre: 'Entretelas' },
  { id: 7, nombre: 'Botones' },
  { id: 8, nombre: 'Velcros' },
];

// ── localStorage helpers ───────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // JSON corrupto — usar seed
  }
  return null;
};

const saveToStorage = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('No se pudo guardar en localStorage:', e);
  }
};

// Nota: usamos "nombre" (no "name") para ser consistente con el resto de la app
let mockCategories = loadFromStorage() ?? [...INITIAL_CATEGORIES];

export const categoryAPI = {

  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCategories]), 500);
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const category = mockCategories.find(c => c.id === id);
        if (category) resolve({ ...category });
        else reject(new Error('Categoría no encontrada'));
      }, 300);
    });
  },

  create: async (categoryData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCategory = {
          id: mockCategories.length > 0
            ? Math.max(...mockCategories.map(c => c.id)) + 1
            : 1,
          ...categoryData,
        };
        mockCategories.push(newCategory);
        saveToStorage(mockCategories);
        resolve({ ...newCategory });
      }, 500);
    });
  },

  update: async (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCategories[index] = { ...mockCategories[index], ...updatedData };
          saveToStorage(mockCategories);
          resolve({ ...mockCategories[index] });
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 500);
    });
  },

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCategories.splice(index, 1);
          saveToStorage(mockCategories);
          resolve();
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 500);
    });
  },

  // Util para desarrollo
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    mockCategories = [...INITIAL_CATEGORIES];
  },
};