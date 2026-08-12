import { productAPI } from "../../products/services/productAPI";

// ── Usuario actual desde sesión ───────────────────────────────────────────────
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('session_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u.nombreCompleto || u.nombre || u.username || 'Admin';
    }
  } catch { }
  return 'Admin';
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const TECH_SPEC_772 = {
  name: 'Ficha técnica Crop Top Negro',
  version: '2',
  costPerUnit: 48000,
  totalCost: 14400000,
  completed: true,
  client: 'Sorelly santana rojo',
  date: '02/04/2025',
  ref: '772',
  type: 'Crop Top manga corta con cortes diagonales',
  description: 'Crop top negro para uso diario, con cortes diagonales en destellante y mallatex.',
  image: null,
  fabrics: [
    { name: 'MALLATEX', consumption: '0.62', pieces: '36', talla: '' },
    { name: 'DESTELLANTE', consumption: '0.68', pieces: '38', talla: '' },
  ],
  cups: [
    { type: 'Copa ojo de gato straple con realce', values: ['36', '38', '40'] },
    { type: 'Copa vergara con realce', values: ['36', '38', '40'] },
  ],
  closures: [
    { type: 'Abrochadura o gafete', values: ['2x1', '3x1', '4x1'] },
    { type: 'Elástico cargadera', values: ['15mm', '20mm', '25mm'] },
  ],
  accessories: [
    { name: 'Varilla mi', values: ['', '', ''] },
    { name: 'Elástico envívar', values: ['', '', ''] },
    { name: 'Hiladilla', values: ['', '', ''] },
    { name: 'Broches decorativos', values: ['', '', ''] },
  ],
  measurements: [
    { name: 'Medidas cargaderas', values: ['', ''] },
    { name: 'Medidas varillas plásticas', values: ['', ''] },
  ],
  observations: 'Conservar apariencia lisa de la prenda, no recogidos.',
  createdBy: 'Paula Andrea Builes',
};

const TECH_SPEC_482 = {
  name: 'Ficha técnica Vestido Bohemio',
  version: '1',
  costPerUnit: 35000,
  totalCost: 5250000,
  completed: true,
  client: 'Otro cliente',
  date: '02/04/2025',
  ref: '482',
  type: 'Vestido largo bohemio',
  description: 'Vestido bohemio con estampado floral, largo hasta los pies.',
  image: null,
  fabrics: [{ name: 'SEDA ESTAMPADA', consumption: '1.20', pieces: '30', talla: '' }],
  cups: [], closures: [], accessories: [],
  measurements: [], observations: '', createdBy: 'Paula Andrea Builes',
};

const mockProductions = [
  {
    id: 1,
    orderNumber: 21,
    quantity: 300,
    deliveryDate: '11/04/2025',
    status: 'Producción',
    statusDate: '11/04/2025',
    client: 'Sorelly santana rojo',
    producto: 'Crop Top Negro para todos los días',
    referencia: '772',
    color: 'negro',
    tipo: 'produccion',
    details: [
      { refCorte: '772_3005', ref: '772', status: 'En producción', statusDate: '11/04/2025', quantity: 300, color: 'negro' }
    ],
    history: [
      { status: 'Diseño', date: '01/04/2025', user: 'Paula Builes', motivo: null },
      { status: 'Ficha Técnica', date: '02/04/2025', user: 'Paula Builes', motivo: null },
      { status: 'Corte', date: '04/04/2025', user: 'Jorge Ramírez', motivo: null },
      { status: 'Compras', date: '06/04/2025', user: 'Ana Pérez', motivo: null },
      { status: 'Producción', date: '08/04/2025', user: 'Luis Díaz', motivo: null },
    ],
    techSpecification: { ...TECH_SPEC_772 },
  },
  {
    id: 2,
    orderNumber: 22,
    quantity: 150,
    deliveryDate: '15/04/2025',
    status: 'Corte',
    statusDate: '07/04/2025',
    client: 'Otro cliente',
    producto: 'Vestido Bohemio Largo con Estampado Floral',
    referencia: '482',
    color: 'Rojo',
    tipo: 'produccion',
    details: [
      { refCorte: '482_3005', ref: '482', status: 'En corte', statusDate: '07/04/2025', quantity: 150, color: 'Rojo' }
    ],
    history: [
      { status: 'Diseño', date: '01/04/2025', user: 'Paula Builes', motivo: null },
      { status: 'Ficha Técnica', date: '02/04/2025', user: 'Paula Builes', motivo: null },
      { status: 'Corte', date: '05/04/2025', user: 'Jorge Ramírez', motivo: null },
    ],
    techSpecification: { ...TECH_SPEC_482 },
  },
];

let nextOrderNumber = 23;
const deepCopy = (o) => JSON.parse(JSON.stringify(o));

// ── LocalStorage persistence ──────────────────────────────────────────────────
const LS_KEY = 'app_productions';

const saveToLS = (list) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { }
};

const loadFromLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// Inicializar mockProductions desde LS si hay datos persistidos
(() => {
  const stored = loadFromLS();
  if (stored && stored.length > 0) {
    mockProductions.length = 0;
    stored.forEach(p => mockProductions.push(p));
    // Recalcular nextOrderNumber para evitar duplicados
    const maxOrder = Math.max(...stored.map(p => p.orderNumber || 0));
    if (maxOrder >= nextOrderNumber) nextOrderNumber = maxOrder + 1;
  } else {
    saveToLS(mockProductions);
  }
})();

// ── Mapa en memoria: referencia → ficha técnica ───────────────────────────────
// Se llena al cargar la primera vez con los datos de productAPI (mock)
const techSheetCache = {
  '772': deepCopy(TECH_SPEC_772),
  '482': deepCopy(TECH_SPEC_482),
};

// ── API ───────────────────────────────────────────────────────────────────────
export const ProductionAPI = {
  getAll: async () => new Promise(r => setTimeout(() => {
    const stored = loadFromLS();
    if (stored) {
      mockProductions.length = 0;
      stored.forEach(p => mockProductions.push(p));
      const maxOrder = Math.max(...stored.map(p => p.orderNumber || 0));
      if (maxOrder >= nextOrderNumber) nextOrderNumber = maxOrder + 1;
    }
    r(deepCopy(mockProductions));
  }, 300)),

  getById: (id) => new Promise((res, rej) => {
    setTimeout(() => {
      const p = mockProductions.find(p => p.id === id);
      p ? res(deepCopy(p)) : rej(new Error('Producción no encontrada'));
    }, 300);
  }),

  // Trae la ficha técnica del producto (busca en productAPI en tiempo real)
  fetchTechSheetForProduct: async (referencia) => {
    try {
      const products = await productAPI.getAll();

      const prod = products.find(
        (p) => p.reference === referencia || p.id === referencia
      );

      if (prod && prod.technicalSheet) {
        const sheet = deepCopy(prod.technicalSheet);
        techSheetCache[referencia] = sheet;
        return sheet;
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }

    return techSheetCache[referencia]
      ? deepCopy(techSheetCache[referencia])
      : null;
  },

  create: async (formData) => {
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const user = getCurrentUser();
    const cantPrincipal = Number(formData.cantidad) || 0;
    const cantExtras = (formData.referencias || []).reduce((s, r) => s + (Number(r.cantidad) || 0), 0);
    const totalQty = cantPrincipal + cantExtras;

    // Armar details
    const details = [];
    if (cantPrincipal > 0) {
      details.push({
        refCorte: `${formData.referencia}_${Date.now().toString().slice(-4)}`,
        ref: formData.referencia, status: 'Diseño', statusDate: today,
        quantity: cantPrincipal, color: formData.color,
      });
    }
    (formData.referencias || []).forEach((r, i) => {
      if (r.cantidad) {
        details.push({
          refCorte: `${formData.referencia}_${(Date.now() + i + 1).toString().slice(-4)}`,
          ref: formData.referencia, status: 'Diseño', statusDate: r.fecha || today,
          quantity: Number(r.cantidad), color: r.color,
        });
      }
    });

    const isProduccion = formData.tipo === 'produccion';
    const initialStatus = isProduccion ? 'Ficha Técnica' : 'Diseño';

    const initialHistory = isProduccion
      ? [
        { status: 'Diseño', date: today, user, motivo: null },
        { status: 'Ficha Técnica', date: today, user, motivo: null },
      ]
      : [{ status: 'Diseño', date: today, user, motivo: null }];

    // ── Ficha técnica ─────────────────────────────────────────────────────────
    let techSpec = null;

    if (isProduccion) {
      // Buscar ficha del producto en productAPI
      let sheet = null;
      try {
        const { productAPI } = await import('../../products/services/productAPI');
        const products = await productAPI.getAll();
        const prod = products.find(p => p.reference === formData.referencia || p.id === formData.referencia);
        if (prod && prod.technicalSheet) sheet = deepCopy(prod.technicalSheet);
        else if (prod) {
          // Producto sin ficha: construir skeleton
          sheet = {
            ref: prod.reference, type: prod.name || '', description: '',
            image: null, fabrics: [], cups: [], closures: [], accessories: [],
            measurements: [], observations: '', createdBy: user,
          };
        }
      } catch { }
      if (!sheet) sheet = techSheetCache[formData.referencia]
        ? deepCopy(techSheetCache[formData.referencia]) : null;

      const cpuBase = Math.round((25000 + Math.random() * 40000) / 500) * 500;
      techSpec = {
        ...(sheet || {}),
        name: `Ficha técnica ${formData.producto || formData.referencia}`,
        version: sheet?.version ? String(sheet.version) : '1',
        costPerUnit: cpuBase,
        totalCost: cpuBase * totalQty,
        completed: true,
        client: formData.cliente,
        date: today,
      };
    } else if (formData.techSheet) {
      // Tipo "diseno": la ficha fue creada manualmente en el form
      const cpuBase = Math.round((25000 + Math.random() * 40000) / 500) * 500;
      techSpec = {
        ...deepCopy(formData.techSheet),
        name: `Ficha técnica ${formData.producto || formData.referencia}`,
        version: '1',
        costPerUnit: cpuBase,
        totalCost: cpuBase * totalQty,
        completed: true,
        client: formData.cliente,
        date: today,
      };
    }

    const newProd = {
      id: Date.now(),
      orderNumber: nextOrderNumber++,
      quantity: totalQty,
      deliveryDate: formData.fechaSolicitud || today,
      status: initialStatus,
      statusDate: today,
      client: formData.cliente,
      producto: formData.producto || formData.referencia,
      referencia: formData.referencia,
      color: formData.color,
      tipo: formData.tipo,
      designImages: formData.designImages || [],
      finishedImageUrl: null,
      details: details.map(d => ({ ...d, status: initialStatus, statusDate: today })),
      history: initialHistory,
      techSpecification: techSpec,
    };

    mockProductions.push(newProd);
    saveToLS(mockProductions);
    return deepCopy(newProd);
  },

  update: (id, data) => new Promise((res, rej) => {
    setTimeout(() => {
      const i = mockProductions.findIndex(p => p.id === id);
      if (i !== -1) { mockProductions[i] = { ...mockProductions[i], ...data }; saveToLS(mockProductions); res(deepCopy(mockProductions[i])); }
      else rej(new Error('Producción no encontrada'));
    }, 300);
  }),

  cancel: (id, motivo) => new Promise((res, rej) => {
    setTimeout(() => {
      const i = mockProductions.findIndex(p => p.id === id);
      if (i !== -1) {
        const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        mockProductions[i] = {
          ...mockProductions[i], status: 'Anulada', statusDate: today,
          history: [...(mockProductions[i].history || []),
          { status: 'Anulada', date: today, user: getCurrentUser(), motivo }],
        };
        saveToLS(mockProductions);
        res(deepCopy(mockProductions[i]));
      } else rej(new Error('Producción no encontrada'));
    }, 300);
  }),

  delete: (id) => new Promise((res, rej) => {
    setTimeout(() => {
      const i = mockProductions.findIndex(p => p.id === id);
      if (i !== -1) { mockProductions.splice(i, 1); saveToLS(mockProductions); res(); }
      else rej(new Error('Producción no encontrada'));
    }, 300);
  }),

  getCurrentUser,
};