const mockProductions = [
  {
    id: 1,
    orderNumber: 21,
    quantity: 300,
    deliveryDate: "11/04/2025",
    status: "Producción",
    statusDate: "11/04/2025",
    client: "Sorelly santana rojo",
    details: [
      {
        refCorte: "513_3005",
        ref: "513",
        status: "En producción",
        statusDate: "11/04/2025",
        quantity: 300,
        color: "negro"
      }
    ],
    history: [
      { status: "Diseño", date: "01/04/2025", user: "Admin" },
      { status: "Ficha Técnica", date: "02/04/2025", user: "Admin" },
      { status: "Corte", date: "04/04/2025", user: "Operario" },
      { status: "Compras", date: "06/04/2025", user: "Compras" },
      { status: "Producción", date: "08/04/2025", user: "Producción" }
    ],
    techSpecification: {
      name: "Ficha técnica top aurora",
      version: "1.0",
      costPerUnit: 48000,
      totalCost: 4800000,
      completed: true
    }
  },
  {
    id: 2,
    orderNumber: 22,
    quantity: 300,
    deliveryDate: "15/04/2025",
    status: "Corte",
    statusDate: "07/04/2025",
    client: "Otro cliente",
    details: [
      {
        refCorte: "513_3005",
        ref: "513",
        status: "En corte",
        statusDate: "07/04/2025",
        quantity: 300,
        color: "Rojo"
      }
    ],
    history: [
      { status: "Diseño", date: "01/04/2025", user: "Admin" },
      { status: "Ficha Técnica", date: "02/04/2025", user: "Admin" },
      { status: "Corte", date: "05/04/2025", user: "Operario" }
    ],
    techSpecification: {
      name: "Ficha técnica estándar",
      version: "1.0",
      costPerUnit: 35000,
      totalCost: 3500000,
      completed: true
    }
  }
];

export const ProductionAPI = {
  // Obtener todas las categorías
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockProductions]);
      }, 500);
    });
  },

  // Obtener categoría por ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const Production = mockProductions.find(c => c.id === id);
        if (Production) {
          resolve({ ...Production });
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 300);
    });
  },

  // Crear nueva categoría
  create: (ProductionData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduction = {
          id: `cat-${Date.now().toString().slice(-5)}`,
          ...ProductionData,
          productCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        mockProductions.push(newProduction);
        resolve({ ...newProduction });
      }, 500);
    });
  },

  // Actualizar categoría
  update: (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProductions.findIndex(c => c.id === id);
        if (index !== -1) {
          mockProductions[index] = {
            ...mockProductions[index],
            ...updatedData,
            updatedAt: new Date().toISOString().split('T')[0],
          };
          resolve({ ...mockProductions[index] });
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
        const index = mockProductions.findIndex(c => c.id === id);
        if (index !== -1) {
          // Verificar si tiene productos asociados
          if (mockProductions[index].productCount > 0) {
            reject(new Error('No se puede eliminar una categoría con productos asociados'));
          } else {
            mockProductions.splice(index, 1);
            resolve();
          }
        } else {
          reject(new Error('Categoría no encontrada'));
        }
      }, 500);
    });
  },
};