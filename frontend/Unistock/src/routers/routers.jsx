import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";
import AppLayout from "../feature/dashboard/components/layout/AppLayout.jsx";
import ProductsPage from '../feature/products/pages/ProductsPage';
import CreateProductPage from '../feature/products/pages/CreateProductPage';
import EditProductPage from '../feature/products/pages/EditProductPage';
import TechnicalSheetPage from '../feature/products/pages/TechnicalSheetPage';

export function RouterApp() {
  return (
    <Routes>
      {/* Layout principal con Navbar y Sidebar */}
      <Route path="/" element={<AppLayout />}>
        
        {/* Dashboard - Ruta por defecto */}
        <Route index element={<ProductionDashboard />} />
        <Route path="dashboard" element={<ProductionDashboard />} />
        
        {/* Módulo de Productos */}
        <Route path="productos" element={<ProductsPage />} />
        <Route path="productos/crear" element={<CreateProductPage />} />
        <Route path="productos/editar/:id" element={<EditProductPage />} />
        <Route path="productos/ficha-tecnica/:id" element={<TechnicalSheetPage />} />
        
      </Route>
      
      {/* Ruta 404 - Redirige al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RouterApp;
