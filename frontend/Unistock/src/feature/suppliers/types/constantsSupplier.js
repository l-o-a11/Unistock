// src/feature/suppliers/data/supplierConstants.js

// Tipos de proveedor (puedes adaptarlos a tu negocio)
export const StockStatus = [
    { id: 1, name: 'Tela / Textil', image: 'https://via.placeholder.com/150?text=Textil' },
    { id: 2, name: 'Accesorios', image: 'https://via.placeholder.com/150?text=Accesorios' },
    { id: 3, name: 'Confección', image: 'https://via.placeholder.com/150?text=Confeccion' },
    { id: 4, name: 'Servicios', image: 'https://via.placeholder.com/150?text=Servicios' },
    { id: 5, name: 'Logística', image: 'https://via.placeholder.com/150?text=Logistica' }
];


// Tipos de documento del proveedor
export const SupplierDocumentTypes = [
    'NIT',
    'Cédula de ciudadanía',
    'Cédula extranjera',
    'Pasaporte'
];


// Tipos de contacto
export const ContactRoles = [
    'Gerente',
    'Administrador',
    'Encargado de ventas',
    'Representante comercial',
    'Soporte'
];


// Métodos de pago aceptados
export const PaymentMethods = [
    'Transferencia bancaria',
    'Efectivo',
    'Nequi',
    'Daviplata',
    'Cheque'
];


// Tipos de materiales o insumos que puede proveer
export const SupplyCategories = [
    'Telas',
    'Encajes',
    'Elásticos',
    'Hilos',
    'Accesorios metálicos',
    'Accesorios plásticos',
    'Etiquetas',
    'Empaques',
    'Servicios de confección'
];


// Estado del proveedor
export const SupplierStatus = {
    Active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
    Inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' },
    Suspended: { label: 'Suspendido', color: 'bg-red-100 text-red-800' }
};


// Nivel de desempeño del proveedor
export const SupplierPerformance = {
    Excellent: { label: 'Excelente', color: 'bg-green-100 text-green-800' },
    Good: { label: 'Bueno', color: 'bg-blue-100 text-blue-800' },
    Regular: { label: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
    Bad: { label: 'Deficiente', color: 'bg-red-100 text-red-800' }
};
