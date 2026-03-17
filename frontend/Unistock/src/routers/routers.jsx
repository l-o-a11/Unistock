import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../feature/auth/pages/LoginPage.jsx";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";
import AppLayout from "../layout/AppLayout.jsx";

// Roles
import RolesPage from "../feature/roles/pages/RolesPage";
import CreateRolPage from "../feature/roles/pages/CreateRolPage.jsx";
import EditRolPage from "../feature/roles/pages/EditRolPage.jsx";

// Insumos
import SuppliesPage from "../feature/supplies/pages/SuppliesPage.jsx";


// Categorías
import CategoriesPage from "../feature/categories/pages/CategoriesPage.jsx";
import CategoriesSupplyPage from "../feature/categoriesSupply/pages/CategoriesSupplyPage.jsx";

// Productos
import ProductsPage from "../feature/products/pages/ProductsPage.jsx";
 
// Proveedores
import SuppliersPage from "../feature/suppliers_fixed/pages/SuppliersPage.jsx";
//compras

import ShoppingsPage from "../feature/shopping/pages/ShoppingsPage.jsx";

// Terceros
import ThirdPartiesPage from "../feature/third_parties_fixed/pages/Third_partiesPage.jsx";

// Usuarios
import UsersPage from "../feature/users/pages/UsersPage.jsx";

// Producciones
import ProductionsPage from "../feature/fixed/pages/ProductionPage.jsx";
import ProductForm from "../feature/fixed/components/ProductionForm/index.jsx";
import ProductionDetailsPage from "../feature/fixed/productionDetails/pages/ProductionDetailsPage.jsx";
import ProductionCalendarPage from "../feature/fixed/components/ProductionCalender";


// Empleados
import EmployeesPage from "../feature/employees/pages/EmployeesPage.jsx";

// Perfil
import ProfilePage from "../feature/auth/pages/ProfilePage.jsx";

//Sedes
import SedesPage from "../feature/sedes/pages/sedesPage.jsx";

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

        {/* Categorías productos */}
        <Route path="categorias" element={<CategoriesPage />} />

        {/* Categorías insumos */}
        <Route path="categorias-insumos" element={<CategoriesSupplyPage />} />

        {/* Insumos */}
        <Route path="insumos" element={<SuppliesPage />} />

        {/* Productos */}
        <Route path="productos" element={<ProductsPage />} />

        {/* Proveedores */}
        <Route path="proveedores" element={<SuppliersPage />} />

        {/* Compras */}
        <Route path="compras" element={<ShoppingsPage />} />

        {/* Producciones */}
        <Route path="produccion" element={<ProductionsPage />} />
        <Route path="produccion/detalle/:id" element={<ProductionDetailsPage />} />
        <Route path="/layout/produccion/calendario" element={<ProductionCalendarPage />} />
        {/* Crear ficha técnica */}
        <Route path="productos/crear" element={<ProductForm />} />

        {/* Terceros */}
        <Route path="terceros" element={<ThirdPartiesPage />} />

        {/* Usuarios */}
        <Route path="usuarios" element={<UsersPage />} />

        {/* Empleados */}
        <Route path="empleados" element={<EmployeesPage />} />

        {/* Perfil */}
        <Route path="perfil" element={<ProfilePage />} />


         {/* sedes */}
         <Route path="sedes" element={<SedesPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/layout" replace />} />

    </Routes>
  );
}

export default RouterApp;