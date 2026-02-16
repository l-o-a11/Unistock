import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";
import AppLayout from "../feature/dashboard/components/layout/AppLayout.jsx";
import ProductsPage from '../feature/products/pages/ProductsPage';
import CreateProductPage from '../feature/products/pages/CreateProductPage';
import EditProductPage from '../feature/products/pages/EditProductPage';
import TechnicalSheetPage from '../feature/products/pages/TechnicalSheetPage';
import SuppliersPage from '../feature/suppliers/pages/SuppliersPage';
import CreateSupplierPage from '../feature/suppliers/pages/CreateSupplierPage';
import EditSupplierPage from '../feature/suppliers/pages/EditSupplierPage.jsx';
import Third_partiesPage from '../feature/third_parties/pages/Third_partiesPage.jsx';
import CreateThird_partiePage from '../feature/third_parties/pages/CreateThird_partiesPage.jsx';
import EditThird_partiePage from '../feature/third_parties/pages/EditThird_partiesPage.jsx';

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
        
        {/* Módulo de proveedores */}
        <Route path="/proveedores" element={<SuppliersPage />} />
        <Route path="/proveedores/crear" element={<CreateSupplierPage />} />
        <Route path="/proveedores/editar/:id" element={<EditSupplierPage />} />

         {/* Módulo de terceros */}
        <Route path="/terceros" element={<Third_partiesPage />} />
        <Route path="/terceros/crear" element={<CreateThird_partiePage />} />
        <Route path="/terceros/editar/:id" element={<EditThird_partiePage />} />
      </Route>
      
      
      {/* Ruta 404 - Redirige al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RouterApp;
