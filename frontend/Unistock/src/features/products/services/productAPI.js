import httpClient from "../../shared/utils/httpClient";
import { Categories } from "../types/constants";

const getCategoryId = (categoryName) => {
  if (!categoryName) return 1;
  return Categories.find(c => c.name === categoryName)?.id || Categories[0]?.id || 1;
};

// Full mockProducts from original
const mockProducts = [
  {
    id: '772',
    id_categorias: 1,
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
    id_categorias: 2,
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
    id_categorias: 3,
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
    id_categorias: 4,
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
    id_categorias: 1,
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

const mockTechnicalSheets = [
  // original full
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
    try {
      const products = await httpClient.get(`/products`);

      // Enriquecer cada producto con su ficha técnica (última versión)
      const enriched = await Promise.all(
        (products || []).map(async (p) => {
          const product = {
            id: p.id,
            reference: p.reference,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            active: p.active,
            technicalSheetVersions: p.technicalSheetVersions ?? 0,
            lastVersionDate: p.lastVersionDate ?? null,
            image: p.image ?? (p.imagenes_Url?.[0] || p.imagenesUrl?.[0] || null),
            technicalSheet: null,
          };

          try {
            const versions = await productAPI.getTechnicalSheetVersions(p.id);
            const sorted = Array.isArray(versions)
              ? [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0))
              : [];

            product.technicalSheet = sorted[0] || null;
            product.technicalSheetVersions = p.technicalSheetVersions ?? sorted.length ?? 0;
            product.lastVersionDate = p.lastVersionDate ?? sorted[0]?.date ?? null;
          } catch (e) {
            if (e?.status) throw e;
            // Si falla la ficha técnica, al menos dejamos el producto base
          }

          return product;
        })
      );

      return enriched;
    } catch (error) {
      console.warn("Backend no disponible, usando datos locales:", error?.message);
      return [...mockProducts];
    }
  },

  getById: async (id) => {
    try {
      const p = await httpClient.get(`/products/${id}`);
      const product = {
        id: p?.id ?? id,
        reference: p?.reference,
        name: p?.name,
        category: p?.category,
        price: p?.price,
        stock: p?.stock,
        active: p?.active,
        technicalSheetVersions: p?.technicalSheetVersions ?? 0,
        lastVersionDate: p?.lastVersionDate ?? null,
        image: p?.image ?? (p?.imagenes_Url?.[0] || p?.imagenesUrl?.[0] || null),
        technicalSheet: null,
      };

      try {
        const versions = await productAPI.getTechnicalSheetVersions(product.id);
        const sorted = Array.isArray(versions)
          ? [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0))
          : [];
        product.technicalSheet = sorted[0] || null;
      } catch (e) {
        if (e?.status) throw e;
        // sin technicalSheet
      }

      return product;
    } catch (error) {
      console.warn("Backend no disponible, usando datos locales:", error?.message);
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
    }
  },

  create: async (productData) => {
    const { technicalSheet } = productData || {};
    const backendData = {
      id_categorias: productData.categoryId || getCategoryId(productData.category),
      imagenes_Url: productData.image ? [productData.image] : [],
      referencia: productData.reference || productData.referencia || productData.id,
      nombre: productData.name || productData.nombre,
      precio: productData.price || productData.precio,
      stock: productData.stock,
    };

    let created;
    try {
      created = await httpClient.post("/products", backendData);
    } catch (error) {
      console.warn("Backend no disponible, usando datos locales:", error?.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          const newProduct = {
            id: Date.now().toString().slice(-4),
            id_categorias: backendData.id_categorias,
            image:
              backendData.imagenes_Url[0] ||
              `https://picsum.photos/300/300?random=${Date.now().toString().slice(-4)}`,
            reference: backendData.referencia,
            name: backendData.nombre,
            category:
              Categories.find((c) => c.id === backendData.id_categorias)?.name || "General",
            price: backendData.precio,
            stock: backendData.stock,
            technicalSheetVersions: 1,
            lastVersionDate: new Date().toISOString().split("T")[0],
            active: true,
          };
          mockProducts.push(newProduct);
          resolve(newProduct);
        }, 500);
      });
    }

    const createdProduct = {
      id: created?.id ?? created?.productId ?? created?.data?.id,
      reference: created?.reference ?? created?.referencia,
      name: created?.name ?? created?.nombre,
      category: created?.category ?? created?.nombreCategoria,
      price: created?.price ?? created?.precio,
      stock: created?.stock,
      active: created?.active ?? true,
      technicalSheetVersions: created?.technicalSheetVersions ?? 0,
      lastVersionDate: created?.lastVersionDate ?? null,
      image: created?.image ?? (created?.imagenes_Url?.[0] || created?.imagenesUrl?.[0] || null),
      technicalSheet: null,
    };

    // Crear ficha técnica (obligatoria por ProductForm)
    if (technicalSheet && createdProduct.id) {
      const version = technicalSheet.version ?? 1;
      const sheetPayload = {
        ...technicalSheet,
        productId: createdProduct.id,
        version,
      };

      const createdSheet = await productAPI.createTechnicalSheet(sheetPayload);
      createdProduct.technicalSheet = createdSheet || null;
      createdProduct.technicalSheetVersions = 1;
      createdProduct.lastVersionDate = createdSheet?.date ?? createdProduct.lastVersionDate;
    }

    return createdProduct;
  },

  update: async (id, updatedData) => {
    const { technicalSheet } = updatedData || {};
    const backendData = {
      id_categorias: updatedData.categoryId || getCategoryId(updatedData.category),
      imagenes_Url: updatedData.image ? [updatedData.image] : [],
      referencia: updatedData.reference || updatedData.referencia,
      nombre: updatedData.name || updatedData.nombre,
      precio: updatedData.price || updatedData.precio,
      stock: updatedData.stock,
    };
    let updated;
    try {
      updated = await httpClient.put(`/products/${id}`, backendData);
    } catch (error) {
      console.warn("Backend no disponible, usando datos locales:", error?.message);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockProducts.findIndex((p) => p.id === id);
          if (index !== -1) {
            mockProducts[index] = {
              ...mockProducts[index],
              ...backendData,
              id_categorias: backendData.id_categorias,
            };
            resolve(mockProducts[index]);
          } else {
            reject(new Error("Producto no encontrado"));
          }
        }, 500);
      });
    }

    const updatedProduct = {
      id: updated?.id ?? id,
      reference: updated?.reference ?? updated?.referencia,
      name: updated?.name ?? updated?.nombre,
      category: updated?.category ?? updated?.nombreCategoria,
      price: updated?.price ?? updated?.precio,
      stock: updated?.stock,
      active: updated?.active ?? true,
      technicalSheetVersions: updated?.technicalSheetVersions ?? 0,
      lastVersionDate: updated?.lastVersionDate ?? null,
      image: updated?.image ?? (updated?.imagenes_Url?.[0] || updated?.imagenesUrl?.[0] || null),
      technicalSheet: null,
    };

    if (technicalSheet) {
      const version = technicalSheet.version ?? updatedProduct.technicalSheetVersions ?? 1;
      const sheetPayload = {
        ...technicalSheet,
        productId: id,
        version,
      };

      // OJO: si falla la ficha técnica, propagamos el error para que el usuario lo vea
      const updatedSheet = await productAPI.updateTechnicalSheet(id, sheetPayload);
      updatedProduct.technicalSheet = updatedSheet || null;
      updatedProduct.technicalSheetVersions =
        updatedProduct.technicalSheetVersions || (version ? version : 1);
      updatedProduct.lastVersionDate = updatedSheet?.date ?? updatedProduct.lastVersionDate;
    } else {
      // Si no viene ficha técnica, intentamos conservar/traer la actual del backend
      try {
        const versions = await productAPI.getTechnicalSheetVersions(id);
        const sorted = Array.isArray(versions)
          ? [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0))
          : [];
        updatedProduct.technicalSheet = sorted[0] || null;
        updatedProduct.technicalSheetVersions =
          updatedProduct.technicalSheetVersions ?? sorted.length ?? 0;
        updatedProduct.lastVersionDate =
          updatedProduct.lastVersionDate ?? sorted[0]?.date ?? null;
      } catch {
        // noop
      }
    }

    return updatedProduct;
  },

  delete: async (id) => {
    try {
      return await httpClient.delete(`/products/${id}`);
    } catch (error) {
      console.warn("Backend no disponible, usando datos locales:", error.message);
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
    }
  },

  toggleActive: async (id) => {
    try {
      return await httpClient.patch(`/products/${id}/toggle-active`, {});
    } catch (error) {
      console.warn("Backend no disponible, usando datos locales:", error.message);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockProducts.findIndex(p => p.id === id);
          if (index !== -1) {
            mockProducts[index].active = !mockProducts[index].active;
            resolve(mockProducts[index]);
          } else {
            reject(new Error('Producto no encontrado'));
          }
        }, 300);
      });
    }
  },

  // Technical sheets full unchanged...
  getTechnicalSheetVersions: async (productId) => {
    try {
      // Backend ruta real: GET /api/products/:id/technical-sheets
      return await httpClient.get(`/products/${productId}/technical-sheets`);
    } catch (error) {
      // Si el backend responde (ej: 404/500), no ocultamos el problema con mocks
      if (error?.status) throw error;

      console.warn("Backend no disponible, usando datos locales:", error?.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          const sheets = mockTechnicalSheets
            .filter(sheet => sheet.productId === productId)
            .sort((a, b) => b.version - a.version);
          resolve([...sheets]);
        }, 300);
      });
    }
  },

  getTechnicalSheetById: async (id) => {
    try {
      return await httpClient.get(`/technical-sheets/${id}`);
    } catch (error) {
      if (error?.status) throw error;

      console.warn("Backend no disponible, usando datos locales:", error?.message);
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
    }
  },

  createTechnicalSheet: async (sheetData) => {
    try {
      return await httpClient.post("/technical-sheets", sheetData);
    } catch (error) {
      if (error?.status) throw error;

      console.warn("Backend no disponible, usando datos locales:", error?.message);
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
    }
  },

  updateTechnicalSheet: async (productId, sheetData) => {
    try {
      return await httpClient.post(`/products/${productId}/technical-sheets`, sheetData);
    } catch (error) {
      if (error?.status) throw error;

      console.warn("Backend no disponible, usando datos locales:", error?.message);
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
    }
  },

  deleteTechnicalSheet: async (id) => {
    try {
      return await httpClient.delete(`/technical-sheets/${id}`);
    } catch (error) {
      if (error?.status) throw error;

      console.warn("Backend no disponible, usando datos locales:", error?.message);
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
  }
};

