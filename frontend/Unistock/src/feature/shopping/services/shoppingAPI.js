const STORAGE_KEY = "app_shoppings";

const INITIAL_SHOPPINGS = [
  {
    id: 1,
    numeroFactura: "1873",
    proveedorId: 1,
    proveedor: "Insumos Corseteros",
    fecha: "2025-12-10",
    observaciones: "Compra para la orden x para la ref x",
    costoTotal: 13300.00,
    estado: true,
    detalles: [
      { id: 101, nombre: "Tela Rosada",  cantidad: 50,  costoUnitario: 200.00, costo: 10000.00 },
      { id: 102, nombre: "Hilos",        cantidad: 100, costoUnitario: 3.00,   costo: 300.00   },
      { id: 103, nombre: "Botones",      cantidad: 300, costoUnitario: 10.00,  costo: 3000.00  },
    ],
  },
  {
    id: 2,
    numeroFactura: "2041",
    proveedorId: 2,
    proveedor: "Textiles Medellín",
    fecha: "2026-01-15",
    observaciones: "Reposición de inventario mensual",
    costoTotal: 5800.00,
    estado: true,
    detalles: [
      { id: 201, nombre: "Elástico 2cm", cantidad: 200, costoUnitario: 15.00, costo: 3000.00 },
      { id: 202, nombre: "Velcro negro", cantidad: 140, costoUnitario: 20.00, costo: 2800.00 },
    ],
  },
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

const saveToStorage = (shoppings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppings));
  } catch (e) {
    console.error("No se pudo guardar en localStorage:", e);
  }
};

let mockShoppings = loadFromStorage() ?? [...INITIAL_SHOPPINGS];

// ── API ────────────────────────────────────────────────────────────────────
export const shoppingAPI = {

  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockShoppings]), 400);
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shopping = mockShoppings.find((p) => p.id === id);
        if (shopping) resolve({ ...shopping });
        else reject(new Error("Compra no encontrada"));
      }, 300);
    });
  },

  create: async (shoppingData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newShopping = {
          id: mockShoppings.length > 0
            ? Math.max(...mockShoppings.map((p) => p.id)) + 1
            : 1,
          estado: true,
          ...shoppingData,
          // Asignar IDs a los detalles
          detalles: (shoppingData.detalles || []).map((d, i) => ({
            id: Date.now() + i,
            ...d,
          })),
        };
        mockShoppings.push(newShopping);
        saveToStorage(mockShoppings);
        resolve({ ...newShopping });
      }, 400);
    });
  },

  update: async (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockShoppings.findIndex((p) => p.id === id);
        if (index !== -1) {
          mockShoppings[index] = {
            ...mockShoppings[index],
            ...updatedData,
            detalles: (updatedData.detalles || []).map((d, i) => ({
              id: d.id || Date.now() + i,
              ...d,
            })),
          };
          saveToStorage(mockShoppings);
          resolve({ ...mockShoppings[index] });
        } else {
          reject(new Error("Compra no encontrada"));
        }
      }, 400);
    });
  },

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockShoppings.findIndex((p) => p.id === id);
        if (index !== -1) {
          mockShoppings.splice(index, 1);
          saveToStorage(mockShoppings);
          resolve();
        } else {
          reject(new Error("Compra no encontrada"));
        }
      }, 400);
    });
  },

  // Util para desarrollo
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    mockShoppings = [...INITIAL_SHOPPINGS];
  },
};