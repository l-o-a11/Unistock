// Datos de ejemplo para categorías
const mockCategories = [
  { id: 1, name: "Telas" },
  { id: 2, name: "Hilos" },
  { id: 3, name: "Cierres" },
  { id: 4, name: "Elásticos" },
  { id: 5, name: "Encajes y pasamanería" },
  { id: 6, name: "Entretelas" },
  { id: 7, name: "Botones" },
  { id: 8, name: "Velcros" },
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
          id: mockCategories.length > 0
            ? Math.max(...mockCategories.map(c => c.id)) + 1
            : 1,
          ...categoryData,
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
          // Verificar si tiene insumos asociados
          if (mockCategories[index].supplyCount > 0) {
            reject(new Error('No se puede eliminar una categoría con insumos asociados'));
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