
export const MEDIDAS_PREDETERMINADAS = [
  { id: 1, nombre: "Unidad" },
  { id: 2, nombre: "Metro" },
  { id: 3, nombre: "Rollo" }
];

export const PROPIEDADES_PREDETERMINADAS = [
  { id: 1, nombre: "Color" },
  { id: 2, nombre: "Ancho" },
  { id: 3, nombre: "Elasticidad" },
  { id: 4, nombre: "Diseño" }
];

export const INITIAL_SUPPLIES = [
  {
    id: 1,
    nombre: "Tela blanca encaje",
    categoriaId: 1,
    stock: 10,
    valorMedida: 45,
    medidaId: 1,
    estado: true,
    propiedades: [
      { id: 1, propiedadId: 1, valor: "Algodón" },
      { id: 2, propiedadId: 2, valor: "Ligero" }
    ]
  },
  {
    id: 2,
    nombre: "Hilo",
    categoriaId: 2,
    stock: 25,
    valorMedida: 5,
    medidaId: 3,
    estado: true,
    propiedades: [
      { id: 3, propiedadId: 1, valor: "Poliéster" }
    ]
  },
  {
    id: 3,
    nombre: "cierre de metal",
    categoriaId: 3,
    stock: 30,
    valorMedida: 20,
    medidaId: 1,
    estado: true,
    propiedades: [
      { id: 4, propiedadId: 2, valor: "2" }
    ]
  }
];


let mockSupply = [...INITIAL_SUPPLIES];
export const supplyAPI = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockSupply]);
      }, 500);
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const supply = mockSupply.find(supply => supply.id === id);
        if (supply) resolve({ ...supply });
        else reject(new Error("Insumo no encontrado"));
      }, 300);
    });
  },

  create: async (supplyData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSupply = {
          id: mockSupply.length > 0
            ? Math.max(...mockSupply.map(supply => supply.id)) + 1
            : 1,
          ...supplyData
        };

        mockSupply.push(newSupply);
        resolve({ ...newSupply });
      }, 500);
    });
  },

  update: async (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSupply.findIndex(supply => supply.id === id);

        if (index !== -1) {
          mockSupply[index] = {
            ...mockSupply[index],
            ...updatedData
          };
          resolve({ ...mockSupply[index] });
        } else {
          reject(new Error("Insumo no encontrado"));
        }
      }, 500);
    });
  },

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSupply.findIndex(supply => supply.id === id);

        if (index !== -1) {
          mockSupply.splice(index, 1);
          resolve();
        } else {
          reject(new Error("Insumo no encontrado"));
        }
      }, 500);
    });
  },

  getMedidas: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MEDIDAS_PREDETERMINADAS]);
      }, 300);
    });
  },

  getPropiedades: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...PROPIEDADES_PREDETERMINADAS]);
      }, 300);
    });
  }
};