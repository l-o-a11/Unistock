import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../feature/auth/pages/LoginPage.jsx";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";

import AppLayout from "../layout/AppLayout.jsx";

import RolesPage from '../feature/roles/pages/RolesPage';
import CreateRolPage from '../feature/roles/pages/CreateRolPage.jsx';
import EditRolPage from '../feature/roles/pages/EditRolPage.jsx';

import CategoriesSupplyPage from '../feature/categoriesSupply/pages/CategoriesSupplyPage';

import SuppliesPage from '../feature/supplies/pages/SuppliesPage.jsx';
import CreateSuppliesPage from '../feature/supplies/pages/CreateSuppliesPage.jsx';
import EditSuppliesPage from '../feature/supplies/pages/EditSuppliesPage.jsx';



// Productos
import ProductsPage from "../feature/products/pages/ProductsPage.jsx";

// Categorías
import CategoriesPage from "../feature/categories/pages/CategoriesPage.jsx";

// Proveedores
import SuppliersPage from "../feature/suppliers_fixed/pages/SuppliersPage.jsx";

// Terceros
import ThirdPartiesPage from "../feature/third_parties_fixed/pages/Third_partiesPage.jsx";

// Usuarios
import UsersPage from "../feature/users/pages/UsersPage.jsx";

// Producciones
import ProductionsPage from "../feature/Productions_fixed/pages/ProductionPage.jsx";
import ProductFrom from "../feature/productions_fixed/components/ProductionForm/index.jsx";
import ProductionDetailsPage from "../feature/Productions_fixed/productionDetails/pages/ProductionDetailsPage.jsx";
import EmpleoyeesPage from "../feature/employees/pages/EmployeesPage.jsx";
import ProfilePage from "../feature/auth/pages/ProfilePage.jsx";


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

          {/* Módulo de categorías */}
        <Route path="categorias" element={<CategoriesSupplyPage />} />

         {/* Módulo de insumos */}
        <Route path="insumos" element={<SuppliesPage />} />
        <Route path="supplies/crear" element={<CreateSuppliesPage />} />
        <Route path="supplies/editar/:id" element={<EditSuppliesPage />} />

        {/* Productos */}
        <Route path="productos" element={<ProductsPage />} />

        {/* Categorías */}
        <Route path="categorias" element={<CategoriesPage />} />

        {/* Proveedores */}
        <Route path="proveedores" element={<SuppliersPage />} />


        {/* Producciones */}
        <Route path="produccion" element={<ProductionsPage />} />
        <Route path="produccion/detail/:id" element={<ProductionDetailsPage />} />

        {/* Crear ficha técnica */}
        <Route path="products/create" element={<ProductFrom />} />
        {/* Terceros */}
        <Route path="terceros" element={<ThirdPartiesPage />} />


        {/* Usuarios */}
        <Route path="users" element={<UsersPage />} />

        {/* Empleados */}
        <Route path="empleados" element={<EmpleoyeesPage />} />

        {/* Perfil */}
        <Route path="perfil" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/layout" replace />} />
    </Routes>
  );
}

export default RouterApp;