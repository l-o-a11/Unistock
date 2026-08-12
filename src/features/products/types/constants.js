// Categorías de productos
export const Categories = [
  { id: 1, name: 'Buzos'},
  { id: 2, name: 'Bodys'},
  { id: 3, name: 'Enterizos'},
  { id: 4, name: 'Vestidos'},
  { id: 5, name: 'Crop Top'}
];

// Estados de stock con colores
export const StockStatus = {
  Critical: { label: 'Crítico', color: 'bg-red-100 text-red-800', threshold: 5 },
  Low: { label: 'Bajo', color: 'bg-yellow-100 text-yellow-800', threshold: 10 },
  Normal: { label: 'Normal', color: 'bg-green-100 text-green-800', threshold: Infinity }
};

// Tipos de copa
export const CupTypes = [
  'Copa ojo de gato straple con realce',
  'Copa vergara con realce',
  'Copa ojo de gato sisa con realce'
];

// Tipos de abrochadura
export const ClousereTypes = [
  'Abrochadura o gafete',
  'Elastico cargadera'
];

// Accesorios
export const Accesories = [
  'Varilla metálica completa',
  'Elástico envivar',
  'Hiladilla',
  'Broches decorativos',
  'Aro',
  'Tensor',
  'Zeta',
  'Cinta ilusión',
  'Elástico con base mora',
  'Marquilla',
  'Cordón redondo',
  'Sesgo tapavarrilla',
  'Varilla plástica',
  'Elástico sencillo'
];
