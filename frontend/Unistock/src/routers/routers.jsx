import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../feature/auth/pages/LoginPage.jsx";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";
import AppLayout from "../feature/dashboard/components/layout/AppLayout.jsx";

// Roles
import RolesPage from "../feature/roles/pages/RolesPage.jsx";
import CreateRolPage from "../feature/roles/pages/CreateRolPage.jsx";
import EditRolPage from "../feature/roles/pages/EditRolPage.jsx";

// Productos
import ProductsPage from "../feature/products/pages/ProductsPage.jsx";

// Categorías
import CategoriesPage from "../feature/categories/pages/CategoriesPage.jsx";

// Proveedores
import SuppliersPage from "../feature/suppliers/pages/SuppliersPage.jsx";
import CreateSupplierPage from "../feature/suppliers/pages/CreateSupplierPage.jsx";
import EditSupplierPage from "../feature/suppliers/pages/EditSupplierPage.jsx";

// Terceros
import ThirdPartiesPage from "../feature/third_parties/pages/Third_partiesPage.jsx";
import CreateThirdPartiePage from "../feature/third_parties/pages/CreateThird_partiesPage.jsx";
import EditThirdPartiePage from "../feature/third_parties/pages/EditThird_partiesPage.jsx";

// Usuarios
import UsersPage from "../feature/users/pages/UsersPage.jsx";

// Producciones
import ProductionsPage from "../feature/Productions/pages/ProductionPage.jsx";

export function RouterApp() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Layout principal */}
      <Route path="/layout" element={<AppLayout />}>

        {/* Dashboard */}
        <Route index element={<ProductionDashboard />} />
        <Route path="dashboard" element={<ProductionDashboard />} />

        {/* Roles */}
        <Route path="roles" element={<RolesPage />} />
        <Route path="roles/crear" element={<CreateRolPage />} />
        <Route path="roles/editar/:id" element={<EditRolPage />} />

        {/* Productos */}
        <Route path="productos" element={<ProductsPage />} />

        {/* Categorías */}
        <Route path="categorias" element={<CategoriesPage />} />

        {/* Proveedores */}
        <Route path="proveedores" element={<SuppliersPage />} />
        <Route path="proveedores/crear" element={<CreateSupplierPage />} />
        <Route path="proveedores/editar/:id" element={<EditSupplierPage />} />

        {/* Producciones */}
        <Route path="produccion" element={<ProductionsPage />} />

        {/* Terceros */}
        <Route path="terceros" element={<ThirdPartiesPage />} />
        <Route path="terceros/crear" element={<CreateThirdPartiePage />} />
        <Route path="terceros/editar/:id" element={<EditThirdPartiePage />} />

        {/* Usuarios */}
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/layout" replace />} />
    </Routes>
  );
}

export default RouterApp;