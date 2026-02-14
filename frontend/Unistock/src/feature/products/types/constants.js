// Categoría de productos
export const Categories = [
    { id: 1, name: 'Buzos', image: 'https://via.placeholder.com/150?text=Buzos' }, //Cambiar imagen - icon: ''
    { id: 2, name: 'Bodys', image: 'https://via.placeholder.com/150?text=Bodys' },
    { id: 3, name: 'Enterizos', image: 'https://via.placeholder.com/150?text=Enterizos' },
    { id: 4, name: 'Vestidos', image: 'https://via.placeholder.com/150?text=Vestidos' },
    { id: 5, name: 'Crop Top', image: 'https://via.placeholder.com/150?text=CropTop' }
];

// Ficha técnica
export const CupTypes = [
    'Copa ojo de gato straple con realce',
    'Copa vergara con realce',
    'Copa ojo de gato sisa con realce'
];

export const ClousereTypes
= [
  'Abrochadura o gafete',
  'Elástico cargadera'
];

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

export const StockStatus = {
    Critical: {label: 'Crítico', color: 'bg-red-100 text-red-800', threshold: 5},
    Low: {label: 'Bajo', color: 'bg-yellow-100 text-yellow-800', threshold: 15},
    Normal: {label: 'Normal', color: 'bg-green-100 text-green-800', threshold: Infinity}    
};