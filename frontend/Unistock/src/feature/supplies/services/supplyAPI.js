// supplies/components/services/supplyAPI.js
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

export const CATEGORIAS_PREDETERMINADAS = [
  { id: 1, nombre: "Telas" },
  { id: 2, nombre: "Hilos" },
  { id: 3, nombre: "Cierres y botones" },
  { id: 4, nombre: "Elásticos" },
  { id: 5, nombre: "Encajes y pasamanería" },
  { id: 6, nombre: "Entretelas" }
];

export const INITIAL_SUPPLIES = [
  {
    image: null,
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
    image: null,
    id: 2,
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
    image: null,
    id: 3,
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
    image: null,
    id: 4,
    nombre: "Tela blanca encaje",
    categoriaId: 1,
    stock: 10,
    valorMedida: 45,
    medidaId: 1,
    estado: false,
    propiedades: [
      { id: 1, propiedadId: 1, valor: "Algodón" },
      { id: 2, propiedadId: 2, valor: "Ligero" }
    ]
  },
  {
    image: null,
    id: 5,
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
    image: null,
    id: 6,
    nombre: "Tela blanca encaje",
    categoriaId: 1,
    stock: 10,
    valorMedida: 45,
    medidaId: 1,
    estado: false,
    propiedades: [
      { id: 1, propiedadId: 1, valor: "Algodón" },
      { id: 2, propiedadId: 2, valor: "Ligero" }
    ]
  },
  { 
    image: null,
    id: 7,
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
    image: null,
    id: 8,
    nombre: "cierre de metal",
    categoriaId: 3,
    stock: 30,
    valorMedida: 20,
    medidaId: 1,
    estado: false,
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
          ...supplyData,
          propiedades: supplyData.propiedades.map((prop, index) => ({
            id: mockSupply.reduce((max, s) => 
              Math.max(max, ...(s.propiedades?.map(p => p.id) || [0])), 0) + index + 1,
            ...prop
          }))
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
          // Conservar los IDs de propiedades existentes o asignar nuevos
          const existingProps = mockSupply[index].propiedades || [];
          const updatedProps = updatedData.propiedades.map((prop, idx) => {
            const existingProp = existingProps.find(p => p.propiedadId === prop.propiedadId);
            return {
              id: existingProp?.id || mockSupply.reduce((max, s) => 
                Math.max(max, ...(s.propiedades?.map(p => p.id) || [0])), 0) + idx + 1,
              ...prop
            };
          });

          mockSupply[index] = {
            ...mockSupply[index],
            ...updatedData,
            propiedades: updatedProps
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
          resolve({ success: true });
        } else {
          reject(new Error("Insumo no encontrado"));
        }
      }, 500);
    });
  },

    getMedidas: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('getMedidas devuelve:', MEDIDAS_PREDETERMINADAS);
        resolve([...MEDIDAS_PREDETERMINADAS]);
      }, 300);
    });
  },

  getPropiedades: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('getPropiedades devuelve:', PROPIEDADES_PREDETERMINADAS);
        resolve([...PROPIEDADES_PREDETERMINADAS]);
      }, 300);
    });
  },

  getCategorias: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('getCategorias devuelve:', CATEGORIAS_PREDETERMINADAS);
        resolve([...CATEGORIAS_PREDETERMINADAS]);
      }, 300);
    });
  }
};