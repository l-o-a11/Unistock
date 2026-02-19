// src/feature/products/services/productAPI.js

// Datos de ejemplo con referencias numéricas y nombres COMPLETOS
const mockProducts = [
  {
    id: '772',
    image: 'https://via.placeholder.com/40/3B82F6/ffffff?text=772',
    reference: '772',
    name: 'Crop Top Negro para todos los días',
    category: 'Crop Top',
    price: 33000,
    stock: 5,
    technicalSheetVersions: 2,
    lastVersionDate: '2026-02-10'
  },
  {
    id: '482',
    image: 'https://via.placeholder.com/40/8B5CF6/ffffff?text=482',
    reference: '482',
    name: 'Vestido Bohemio Largo con Estampado Floral',
    category: 'Vestidos',
    price: 36000,
    stock: 10,
    technicalSheetVersions: 1,
    lastVersionDate: '2026-02-09'
  },
  {
    id: 'E57',
    image: 'https://via.placeholder.com/40/EC4899/ffffff?text=E57',
    reference: 'E57',
    name: 'Enterizo Negro Escotado con Abertura Lateral',
    category: 'Enterizos',
    price: 60000,
    stock: 10,
    technicalSheetVersions: 3,
    lastVersionDate: '2026-02-08'
  },
  {
    id: '601',
    image: 'https://via.placeholder.com/40/F59E0B/ffffff?text=601',
    reference: '601',
    name: 'Buzo Estampado Oversize con Capucha',
    category: 'Buzos',
    price: 35000,
    stock: 20,
    technicalSheetVersions: 1,
    lastVersionDate: '2026-02-07'
  },
  {
    id: '678',
    image: 'https://via.placeholder.com/40/EF4444/ffffff?text=678',
    reference: '678',
    name: 'Crop Top Rojo con Encaje',
    category: 'Crop Top',
    price: 33000,
    stock: 3,
    technicalSheetVersions: 2,
    lastVersionDate: '2026-02-06'
  }
];

// Fichas técnicas de ejemplo
const mockTechnicalSheets = [
  {
    id: 'ts-772-v1',
    productId: '772',
    version: 1,
    date: '2026-01-15',
    client: 'Diego Perez',
    type: 'Body manga larga con cortes diagonales',
    description: 'Body manga larga, con cortes diagonales en destellante y mallatex, copa partida doble, frente inferior encarretado doble en centro y lateral, espalda abierta con cortes, lleva elástico, enviado en cuello, puños, espalda y piernas para mejor apariencia.',
    fabrics: [
      { name: 'MALLATEX', consumption: '0.59', pieces: '34' },
      { name: 'DESTELLANTE', consumption: '0.66', pieces: '36' }
    ],
    cups: [
      { type: 'Copa ojo de gato straple con realce', talla34: '34', talla36: '36', talla38: '38' },
      { type: 'Copa vergara con realce', talla34: '34', talla36: '36', talla38: '38' },
      { type: 'Copa ojo de gato sisa con realce', talla34: '34', talla36: '36', talla38: '38' }
    ],
    closures: [
      { type: 'Abrochadura o gafete', opcion1: '1x1', opcion2: '2x1', opcion3: '3x1' },
      { type: 'Elástico cargadera', opcion1: '10mm', opcion2: '15mm', opcion3: '20mm' }
    ],
    accessories: [
      { name: 'Varilla metálica completa', values: ['', '', ''] },
      { name: 'Elastico envivar', values: ['', '', ''] },
      { name: 'Hiladilla', values: ['', '', ''] },
      { name: 'Broches decorativos', values: ['', '', ''] }
    ],
    observations: 'Conservar apariencia lisa de la prenda, no recogidos.',
    createdBy: 'Paula Andrea Builes'
  },
  {
    id: 'ts-772-v2',
    productId: '772',
    version: 2,
    date: '2026-02-10',
    client: 'Diego Perez',
    type: 'Body manga larga con cortes diagonales - Versión mejorada',
    description: 'Body manga larga, con cortes diagonales en destellante y mallatex...',
    fabrics: [
      { name: 'MALLATEX', consumption: '0.62', pieces: '36' },
      { name: 'DESTELLANTE', consumption: '0.68', pieces: '38' }
    ],
    cups: [
      { type: 'Copa ojo de gato straple con realce', talla34: '36', talla36: '38', talla38: '40' },
      { type: 'Copa vergara con realce', talla34: '36', talla36: '38', talla38: '40' },
      { type: 'Copa ojo de gato sisa con realce', talla34: '36', talla36: '38', talla38: '40' }
    ],
    closures: [
      { type: 'Abrochadura o gafete', opcion1: '2x1', opcion2: '3x1', opcion3: '4x1' },
      { type: 'Elástico cargadera', opcion1: '15mm', opcion2: '20mm', opcion3: '25mm' }
    ],
    accessories: [
      { name: 'Varilla metálica completa', values: ['', '', ''] },
      { name: 'Elastico envivar', values: ['', '', ''] },
      { name: 'Hiladilla', values: ['', '', ''] },
      { name: 'Broches decorativos', values: ['', '', ''] },
      { name: 'Aro', values: ['', '', ''] },
      { name: 'Tensor', values: ['', '', ''] }
    ],
    observations: 'Ajuste de consumos y mejora en acabados.',
    createdBy: 'Paula Andrea Builes'
  }
];

// Asignar fichas técnicas a los productos
mockProducts.forEach(product => {
  product.technicalSheet = mockTechnicalSheets.find(ts => ts.productId === product.id && ts.version === product.technicalSheetVersions);
});

export const productAPI = {
  // Obtener todos los productos
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockProducts]);
      }, 500);
    });
  },

  // Obtener producto por ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === id);
        if (product) {
          resolve({ ...product });
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 300);
    });
  },

  // Crear nuevo producto
  create: (productData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          id: Date.now().toString().slice(-4),
          ...productData,
          image: `https://via.placeholder.com/40/10B981/ffffff?text=${Date.now().toString().slice(-4)}`,
          technicalSheetVersions: 1,
          lastVersionDate: new Date().toISOString().split('T')[0]
        };
        mockProducts.push(newProduct);
        resolve({ ...newProduct });
      }, 500);
    });
  },

  // Actualizar producto
  update: (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts[index] = { ...mockProducts[index], ...updatedData };
          resolve({ ...mockProducts[index] });
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 500);
    });
  },

  // Eliminar producto
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 500);
    });
  },

  // ===== MÉTODOS PARA FICHAS TÉCNICAS =====
  
  // Obtener todas las versiones de ficha técnica de un producto
  getTechnicalSheetVersions: (productId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sheets = mockTechnicalSheets
          .filter(sheet => sheet.productId === productId)
          .sort((a, b) => b.version - a.version);
        resolve([...sheets]);
      }, 300);
    });
  },

  // Obtener una versión específica de ficha técnica
  getTechnicalSheetById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sheet = mockTechnicalSheets.find(s => s.id === id);
        if (sheet) {
          resolve({ ...sheet });
        } else {
          reject(new Error('Ficha técnica no encontrada'));
        }
      }, 300);
    });
  },

  // Crear nueva versión de ficha técnica
  createTechnicalSheet: (sheetData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSheet = {
          id: `ts-${sheetData.productId}-v${sheetData.version}`,
          ...sheetData,
          date: new Date().toISOString().split('T')[0]
        };
        mockTechnicalSheets.push(newSheet);
        
        // Actualizar el producto
        const product = mockProducts.find(p => p.id === sheetData.productId);
        if (product) {
          product.technicalSheetVersions = sheetData.version;
          product.lastVersionDate = new Date().toISOString().split('T')[0];
          product.technicalSheet = newSheet;
        }
        
        resolve({ ...newSheet });
      }, 500);
    });
  },

  // Actualizar ficha técnica (crea nueva versión)
  updateTechnicalSheet: (productId, sheetData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Obtener la última versión
        const productSheets = mockTechnicalSheets
          .filter(s => s.productId === productId)
          .sort((a, b) => b.version - a.version);
        
        const newVersion = (productSheets[0]?.version || 0) + 1;
        
        const newSheet = {
          id: `ts-${productId}-v${newVersion}`,
          productId,
          version: newVersion,
          ...sheetData,
          date: new Date().toISOString().split('T')[0]
        };
        
        mockTechnicalSheets.push(newSheet);
        
        // Actualizar el producto
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
          product.technicalSheetVersions = newVersion;
          product.lastVersionDate = new Date().toISOString().split('T')[0];
          product.technicalSheet = newSheet;
        }
        
        resolve({ ...newSheet });
      }, 500);
    });
  },

  // Eliminar la última versión de ficha técnica (solo si es la única)
  deleteLastTechnicalSheet: (productId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const productSheets = mockTechnicalSheets
          .filter(s => s.productId === productId)
          .sort((a, b) => b.version - a.version);
        
        if (productSheets.length === 0) {
          reject(new Error('No hay fichas técnicas para eliminar'));
        } else if (productSheets.length > 1) {
          reject(new Error('No se puede eliminar: el producto tiene múltiples versiones'));
        } else {
          // Eliminar la única versión
          const index = mockTechnicalSheets.findIndex(s => s.id === productSheets[0].id);
          mockTechnicalSheets.splice(index, 1);
          
          // Actualizar el producto
          const product = mockProducts.find(p => p.id === productId);
          if (product) {
            product.technicalSheetVersions = 0;
            product.lastVersionDate = null;
            product.technicalSheet = null;
          }
          
          resolve();
        }
      }, 500);
    });
  },

  // Eliminar una versión específica (solo si es la última y única)
  deleteTechnicalSheetById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sheet = mockTechnicalSheets.find(s => s.id === id);
        if (!sheet) {
          reject(new Error('Ficha técnica no encontrada'));
          return;
        }
        
        // Verificar si es la única versión del producto
        const productSheets = mockTechnicalSheets.filter(s => s.productId === sheet.productId);
        if (productSheets.length > 1) {
          reject(new Error('No se puede eliminar: el producto tiene múltiples versiones'));
          return;
        }
        
        // Eliminar
        const index = mockTechnicalSheets.findIndex(s => s.id === id);
        mockTechnicalSheets.splice(index, 1);
        
        // Actualizar el producto
        const product = mockProducts.find(p => p.id === sheet.productId);
        if (product) {
          product.technicalSheetVersions = 0;
          product.lastVersionDate = null;
          product.technicalSheet = null;
        }
        
        resolve();
      }, 500);
    });
  }
};