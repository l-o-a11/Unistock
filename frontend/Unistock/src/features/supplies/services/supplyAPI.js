// supplies/components/services/supplyAPI.js
export const MEDIDAS_PREDETERMINADAS = [
  { id: 1, nombre: "Unidad" },
  { id: 2, nombre: "Metro" },
  { id: 3, nombre: "Rollo" },
  { id: 4, nombre: "Paquete" },
  { id: 5, nombre: "Caja" },
  { id: 6, nombre: "Litro" },
  
];

export const PROPIEDADES_PREDETERMINADAS = [
  { id: 1, nombre: "Color" }, //string
  { id: 2, nombre: "tamaño" }, //int
  { id: 3, nombre: "Elasticidad" }, 
  { id: 4, nombre: "Diseño" }, //string
  { id: 5, nombre: "Material" }, //string
];

export const CATEGORIAS_PREDETERMINADAS = [
  { id: 1, nombre: "Telas" },
  { id: 2, nombre: "Hilos" },
  { id: 3, nombre: "Cierres" },
  { id: 4, nombre: "Elásticos" },
  { id: 5, nombre: "Encajes y pasamanería" },
  { id: 6, nombre: "Entretelas" },
  { id: 7, nombre: "Botones" },
  { id: 8, nombre: "Velcros" },
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
    nombre: "Hilo ",
    categoriaId: 2,
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
  nombre: "Botón",
  categoriaId: 7,
  stock: 200,
  valorMedida: 200,
  medidaId: 1,
  estado: true,
  propiedades: [
    { id: 3, propiedadId: 1, valor: "Plástico" },
    { id: 4, propiedadId: 2, valor: "Negro" }
  ]
},
  {
  image: null,
  id: 4,
  nombre: "Cierre de plastico",
  categoriaId: 3,
  stock: 50,
  valorMedida: 20,
  medidaId: 1,
  estado: true,
  propiedades: [
    { id: 5, propiedadId: 1, valor: "Metal" },
    { id: 6, propiedadId: 2, valor: "20 cm" }
  ]
},
  {
  image: null,
  id: 5,
  nombre: "Elástico",
  categoriaId: 4,
  stock: 30,
  valorMedida: 10,
  medidaId: 1,
  estado: true,
  propiedades: [
    { id: 7, propiedadId: 1, valor: "Poliéster" },
    { id: 8, propiedadId: 2, valor: "Flexible" }
  ]
},
  {
  image: null,
  id: 6,
  nombre: "Entretela",
  categoriaId: 6,
  stock: 25,
  valorMedida: 5,
  medidaId: 1,
  estado: true,
  propiedades: [
    { id: 9, propiedadId: 1, valor: "Fusible" },
    { id: 10, propiedadId: 2, valor: "Blanca" }
  ]
},
  {
  image: null,
  id: 7,
  nombre: "Velcro",
  categoriaId: 8,
  stock: 40,
  valorMedida: 3,
  medidaId: 1,
  estado: true,
  propiedades: [
    { id: 11, propiedadId: 1, valor: "Nylon" },
    { id: 12, propiedadId: 2, valor: "Negro" }
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