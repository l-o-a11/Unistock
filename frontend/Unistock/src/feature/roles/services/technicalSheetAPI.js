// Mock(Imitación) de fichas técnicas con versiones
let mockTechnicalSheets = [
    {
    id: 'ts-772-v1',
    productId: '772',
    version: 1,
    date: '2026-01-15',
    client: 'Cliente A',
    type: 'Body manga larga con cortes diagonales',
    description: 'Body manga larga, con cortes diagonales en destellante y mallatex...',
    fabrics: [
      { name: 'MALLATEX', consumption: '0.59', pieces: '34' },
      { name: 'DESTELLANTE', consumption: '0.66', pieces: '36' }
    ],
    cups: [
      { type: 'Copa ojo de gato straple con realce', tela1: '34', tela2: '36', tela3: '38' },
      { type: 'Copa vergara con realce', tela1: '34', tela2: '36', tela3: '38' },
      { type: 'Copa ojo de gato sisa con realce', tela1: '34', tela2: '36', tela3: '38' }
    ],
    closures: [
      { type: 'Abrochadura o gafete', tela1: '1x1', tela2: '2x1', tela3: '3x1' },
      { type: 'Elástico cargadera', tela1: '10mm', tela2: '15mm', tela3: '20mm' }
    ],
    accessories: [
      'Varilla metálica completa',
      'Elástico envivar',
      'Hiladilla',
      'Broches decorativos'
    ],
    observations: 'Conservar apariencia lisa de la prenda, no recogidos.',
    createdBy: 'Paula Andrea Builes'
  },
  {
    id: 'ts-772-v2',
    productId: '772',
    version: 2,
    date: '2026-02-10',
    client: 'Cliente A',
    type: 'Body manga larga con cortes diagonales - Versión mejorada',
    description: 'Body manga larga, con cortes diagonales en destellante y mallatex...',
    fabrics: [
      { name: 'MALLATEX', consumption: '0.62', pieces: '36' },
      { name: 'DESTELLANTE', consumption: '0.68', pieces: '38' }
    ],
    cups: [
      { type: 'Copa ojo de gato straple con realce', tela1: '36', tela2: '38', tela3: '40' },
      { type: 'Copa vergara con realce', tela1: '36', tela2: '38', tela3: '40' },
      { type: 'Copa ojo de gato sisa con realce', tela1: '36', tela2: '38', tela3: '40' }
    ],
    closures: [
      { type: 'Abrochadura o gafete', tela1: '2x1', tela2: '3x1', tela3: '4x1' },
      { type: 'Elástico cargadera', tela1: '15mm', tela2: '20mm', tela3: '25mm' }
    ],
    accessories: [
      'Varilla metálica completa',
      'Elástico envivar',
      'Hiladilla',
      'Broches decorativos',
      'Aro',
      'Tensor'
    ],
    observations: 'Ajuste de consumos y mejora en acabados.',
    createdBy: 'Paula Andrea Builes'
  }
];

export const technicalSheetAPI = {
    getVersions: (productId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const sheets = mockTechnicalSheets
                    .filter(sheet => sheet.productId === productId)
                    .sort((a, b) => b.version - a.version); // Ordenar por versión descendente
                resolve(sheets);    
            }, 300);
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const sheet = mockTechnicalSheets.find(s => s.id === id);
                sheet ? resolve(sheet) : reject(new Error('Ficha técnica no encontrada'));
            }, 300);
        });
    },

    create: (sheetData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newSheet = {
                    id: `ts-${sheetData.productId}-v${sheetData.version}`,
                    ...sheetData, date: new Date().toISOString().split('T')[0] // Fecha actual
                };
                mockTechnicalSheets.push(newSheet);
                resolve(newSheet);
            }, 500);
        });
    },

    update: (id, updatedData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockTechnicalSheets.findIndex(s => s.id === id);
                if (index !== -1) {
                    mockTechnicalSheets[index] = { ...mockTechnicalSheets[index], ...updatedData };
                    resolve(mockTechnicalSheets[index]);
                } else {
                    reject(new Error('Ficha técnica no encontrada'));
                }
            }, 500);
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockTechnicalSheets.findIndex(s => s.id === id);
                if (index !== -1) {
                    mockTechnicalSheets.splice(index, 1);
                    resolve();
                } else {
                    reject(new Error('Ficha técnica no encontrada'));
                }
            }, 500);
        });
    }
};    