// MODULOS de ROLES
export const Categories = [
    { id: 1, name: 'Roles', image: 'https://via.placeholder.com/150?text=Roles' }, //Cambiar imagen - icon: ''
    { id: 2, name: 'Usuarios', image: 'https://via.placeholder.com/150?text=Usuarios' },
    { id: 3, name: 'Categoría de insumos', image: 'https://via.placeholder.com/150?text=Categoría de insumos' },
    { id: 4, name: 'Insumos', image: 'https://via.placeholder.com/150?text=Insumos' },
    { id: 5, name: 'Proveedores', image: 'https://via.placeholder.com/150?text=Proveedores' }
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