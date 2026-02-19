// src/feature/third_parties/data/Third_partieConstants.js

// 🏷️ Tipos de tercero
export const ThirdPartieTypes = [
    { id: 1, name: "Tela / Textil", image: "https://via.placeholder.com/150?text=Textil" },
    { id: 2, name: "Accesorios", image: "https://via.placeholder.com/150?text=Accesorios" },
    { id: 3, name: "Confección", image: "https://via.placeholder.com/150?text=Confeccion" },
    { id: 4, name: "Servicios", image: "https://via.placeholder.com/150?text=Servicios" },
    { id: 5, name: "Logística", image: "https://via.placeholder.com/150?text=Logistica" }
];


// 📄 Tipos de documento
export const ThirdPartieDocumentTypes = [
    "NIT",
    "Cédula de ciudadanía",
    "Cédula extranjera",
    "Pasaporte"
];


// 👤 Rol del contacto
export const ContactRoles = [
    "Gerente",
    "Administrador",
    "Encargado de ventas",
    "Representante comercial",
    "Soporte"
];


// 📦 Categorías de insumos
export const SupplyCategories = [
    "Telas",
    "Encajes",
    "Elásticos",
    "Hilos",
    "Accesorios metálicos",
    "Accesorios plásticos",
    "Etiquetas",
    "Empaques",
    "Servicios de confección"
];


// 🔄 Estado del tercero
export const ThirdPartieStatus = {
    Active: { label: "Activo", color: "bg-green-100 text-green-800" },
    Inactive: { label: "Inactivo", color: "bg-gray-100 text-gray-800" },
    Suspended: { label: "Suspendido", color: "bg-red-100 text-red-800" }
};


// ⭐ Nivel de desempeño
export const ThirdPartiePerformance = {
    Excellent: { label: "Excelente", color: "bg-green-100 text-green-800" },
    Good: { label: "Bueno", color: "bg-blue-100 text-blue-800" },
    Regular: { label: "Regular", color: "bg-yellow-100 text-yellow-800" },
    Bad: { label: "Deficiente", color: "bg-red-100 text-red-800" }
};
