const STORAGE_KEY = "app_shoppings";
const SEED_VERSION_KEY = "app_shoppings_seed_v";
const CURRENT_SEED_VERSION = "2"; // ← sube este número cada vez que cambies INITIAL_SHOPPINGS

const INITIAL_SHOPPINGS = [
  {
    id: 1,
    numeroFactura: "1873",
    proveedorId: 1,
    proveedor: "Insumos Corseteros",
    fecha: "2025-12-10",
    observaciones: "Compra para la orden x para la ref x",
    costoTotal: 13300.00,
    anulada: false,
    motivoAnulacion: null,
    fechaAnulacion: null,
    detalles: [
      { id: 101, nombre: "Tela Rosada", cantidad: 50, costoUnitario: 200.00, costo: 10000.00 },
      { id: 102, nombre: "Hilos", cantidad: 100, costoUnitario: 3.00, costo: 300.00 },
      { id: 103, nombre: "Botones", cantidad: 300, costoUnitario: 10.00, costo: 3000.00 },
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
    anulada: false,
    motivoAnulacion: null,
    fechaAnulacion: null,
    detalles: [
      { id: 201, nombre: "Elástico 2cm", cantidad: 200, costoUnitario: 15.00, costo: 3000.00 },
      { id: 202, nombre: "Velcro negro", cantidad: 140, costoUnitario: 20.00, costo: 2800.00 },
    ],
  },
  {
    id: 3,
    numeroFactura: "1879",
    proveedorId: 1,
    proveedor: "Insumos Corseteros",
    fecha: "2025-12-10",
    observaciones: "Compra para la orden x para la ref x",
    costoTotal: 13300.00,
    anulada: false,
    motivoAnulacion: null,
    fechaAnulacion: null,
    detalles: [
      { id: 101, nombre: "Tela Rosada", cantidad: 50, costoUnitario: 200.00, costo: 10000.00 },
      { id: 102, nombre: "Hilos", cantidad: 100, costoUnitario: 3.00, costo: 300.00 },
      { id: 103, nombre: "Botones", cantidad: 300, costoUnitario: 10.00, costo: 3000.00 },
    ],
  },
  {
    id: 4,
    numeroFactura: "2049",
    proveedorId: 2,
    proveedor: "Textiles Medellín",
    fecha: "2026-01-15",
    observaciones: "Reposición de inventario mensual",
    costoTotal: 13300.00,
    anulada: false,
    motivoAnulacion: null,
    fechaAnulacion: null,
    detalles: [
      { id: 101, nombre: "Tela Rosada", cantidad: 50, costoUnitario: 200.00, costo: 10000.00 },
      { id: 102, nombre: "Hilos", cantidad: 100, costoUnitario: 3.00, costo: 300.00 },
      { id: 103, nombre: "Botones", cantidad: 300, costoUnitario: 10.00, costo: 3000.00 },
    ],
  },
];

// ── localStorage helpers ───────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    // Si el seed cambió, limpiar cache para que cargue el nuevo seed
    const savedVersion = localStorage.getItem(SEED_VERSION_KEY);
    if (savedVersion !== CURRENT_SEED_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
      return null;
    }
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
        const shopping = mockShoppings.find((p) => String(p.id) === String(id));
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
          anulada: false,
          motivoAnulacion: null,
          fechaAnulacion: null,
          ...shoppingData,
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
        const index = mockShoppings.findIndex((p) => String(p.id) === String(id));
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

  // ── Anular compra ──────────────────────────────────
  // ✅ Ahora recibe motivo y guarda motivoAnulacion + fechaAnulacion
  anular: async (id, motivo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockShoppings.findIndex((p) => String(p.id) === String(id));
        if (index !== -1) {
          mockShoppings[index] = {
            ...mockShoppings[index],
            anulada: true,
            motivoAnulacion: motivo,
            fechaAnulacion: new Date().toISOString(),
          };
          saveToStorage(mockShoppings);
          resolve({ ...mockShoppings[index] });
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