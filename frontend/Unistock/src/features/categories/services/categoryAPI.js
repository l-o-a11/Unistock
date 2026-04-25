// Datos de ejemplo para categorías
const mockCategories = [
  {
    id: "cat-001",
    name: "Crop Top",
    description: "Prenda moderna y versátil, ideal para looks casuales y juveniles.",
    productCount: 10,
    createdAt: "2026-01-15",
    updatedAt: "2026-02-10",
  },
  {
    id: "cat-002",
    name: "Buzos",
    description: "Perfecta para uso casual, deportivo o de descanso.",
    productCount: 80,
    createdAt: "2026-01-10",
    updatedAt: "2026-02-05",
  },
  {
    id: "cat-003",
    name: "Body",
    description: "Proporciona una silueta definida y elegante.",
    productCount: 100,
    createdAt: "2026-01-05",
    updatedAt: "2026-02-01",
  },
  {
    id: "cat-004",
    name: "Enterizos",
    description: "Pieza completa que combina comodidad y estilo.",
    productCount: 20,
    createdAt: "2026-01-20",
    updatedAt: "2026-02-08",
  },
  {
    id: "cat-005",
    name: "Vestidos",
    description: "Ideal para cualquier ocasión, desde eventos formales hasta salidas casuales.",
    productCount: 50,
    createdAt: "2026-01-12",
    updatedAt: "2026-02-03",
  },
];

export const categoryAPI = {
  // Obtener todas las categorías
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockCategories]);
      }, 500);
    });
  },

  // Obtener categoría por ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const category = mockCategories.find(c => c.id === id);
        if (category) {
          resolve({ ...category });
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 300);
    });
  },

  // Crear nueva categoría
  create: (categoryData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCategory = {
          id: `cat-${Date.now().toString().slice(-5)}`,
          ...categoryData,
          productCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        mockCategories.push(newCategory);
        resolve({ ...newCategory });
      }, 500);
    });
  },

  // Actualizar categoría
  update: (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCategories[index] = {
            ...mockCategories[index],
            ...updatedData,
            updatedAt: new Date().toISOString().split('T')[0],
          };
          resolve({ ...mockCategories[index] });
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 500);
    });
  },

  // Eliminar categoría
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          // Verificar si tiene productos asociados
          if (mockCategories[index].productCount > 0) {
            reject(new Error('No se puede eliminar una categoría con productos asociados'));
          } else {
            mockCategories.splice(index, 1);
            resolve();
          }
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 500);
    });
  },
};