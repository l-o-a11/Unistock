// Datos de ejemplo con nombres COMPLETOS
const mockProducts = [
  {
    id: '772',
    image: 'null',
    reference: '772',
    name: 'Crop Top Negro para todos los días',
    category: 'Crop Top',
    price: 33000,
    stock: 5,
    technicalSheetVersions: 2,
    lastVersionDate: '2026-02-10',
    active: true
  },
  {
    id: '482',
    image: 'null',
    reference: '482',
    name: 'Vestido Bohemio Largo con Estampado Floral',
    category: 'Vestidos',
    price: 36000,
    stock: 10,
    technicalSheetVersions: 1,
    lastVersionDate: '2026-02-09',
    active: true
  },
  {
    id: 'E57',
    image: 'null',
    reference: 'E57',
    name: 'Enterizo Negro Escotado con Abertura Lateral',
    category: 'Enterizos',
    price: 60000,
    stock: 10,
    technicalSheetVersions: 3,
    lastVersionDate: '2026-02-08',
    active: true
  },
  {
    id: '601',
    image: 'null',
    reference: '601',
    name: 'Buzo Estampado Oversize con Capucha',
    category: 'Buzos',
    price: 35000,
    stock: 20,
    technicalSheetVersions: 1,
    lastVersionDate: '2026-02-07',
    active: true
  },
  {
    id: '678',
    image: 'null',
    reference: '678',
    name: 'Crop Top Rojo con Encaje',
    category: 'Crop Top',
    price: 33000,
    stock: 3,
    technicalSheetVersions: 2,
    lastVersionDate: '2026-02-06',
    active: true
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
      { type: 'Copa ojo de gato straple con realce', values: ['34', '36', '38'] },
      { type: 'Copa vergara con realce', values: ['34', '36', '38'] }
    ],
    closures: [
      { type: 'Abrochadura o gafete', values: ['1x1', '2x1', '3x1'] },
      { type: 'Elástico cargadera', values: ['10mm', '15mm', '20mm'] }
    ],
    accessories: [
      { name: 'Varilla metálica completa', values: ['', '', ''] },
      { name: 'Elástico envivar', values: ['', '', ''] },
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
      { type: 'Copa ojo de gato straple con realce', values: ['36', '38', '40'] },
      { type: 'Copa vergara con realce', values: ['36', '38', '40'] }
    ],
    closures: [
      { type: 'Abrochadura o gafete', values: ['2x1', '3x1', '4x1'] },
      { type: 'Elástico cargadera', values: ['15mm', '20mm', '25mm'] }
    ],
    accessories: [
      { name: 'Varilla metálica completa', values: ['', '', ''] },
      { name: 'Elástico envivar', values: ['', '', ''] },
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
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockProducts]);
      }, 500);
    });
  },

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

  create: (productData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          id: Date.now().toString().slice(-4),
          ...productData,
          image: `https://picsum.photos/300/300?random=${Date.now().toString().slice(-4)}`,
          technicalSheetVersions: 1,
          lastVersionDate: new Date().toISOString().split('T')[0],
          active: true
        };
        mockProducts.push(newProduct);
        resolve({ ...newProduct });
      }, 500);
    });
  },

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

  toggleActive: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts[index].active = !mockProducts[index].active;
          resolve({ ...mockProducts[index] });
        } else {
          reject(new Error('Producto no encontrado'));
        }
      }, 300);
    });
  },

  // Métodos para fichas técnicas
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

  createTechnicalSheet: (sheetData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSheet = {
          id: `ts-${sheetData.productId}-v${sheetData.version}`,
          ...sheetData,
          date: new Date().toISOString().split('T')[0]
        };
        mockTechnicalSheets.push(newSheet);
        
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

  updateTechnicalSheet: (productId, sheetData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
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

  deleteTechnicalSheet: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sheet = mockTechnicalSheets.find(s => s.id === id);
        if (!sheet) {
          reject(new Error('Ficha técnica no encontrada'));
          return;
        }
        
        const productSheets = mockTechnicalSheets.filter(s => s.productId === sheet.productId);
        if (productSheets.length > 1) {
          reject(new Error('No se puede eliminar: el producto tiene múltiples versiones'));
          return;
        }
        
        const index = mockTechnicalSheets.findIndex(s => s.id === id);
        mockTechnicalSheets.splice(index, 1);
        
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