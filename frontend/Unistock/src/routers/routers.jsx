import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../features/auth/pages/LoginPage.jsx";
// import ProductionDashboard from "../features/dashboard/dashboard.jsx"; // TODO: Archivo no existe
import AppLayout from "../layout/AppLayout.jsx";
import PrivateRoute from "../features/shared/PrivateRoute.jsx";

import DashboardPage from "../features/dashboard/dashboard.jsx";

// Roles
import RolesPage from "../features/roles/pages/RolesPage";
import CreateRolPage from "../features/roles/pages/CreateRolPage.jsx";
import EditRolPage from "../features/roles/pages/EditRolPage.jsx";

// Insumos
import SuppliesPage from "../features/supplies/pages/SuppliesPage.jsx";

// Categorías
import ProductCategoriesPage from "../features/productCategories/pages/ProductCategoriesPage.jsx";
import CategoriesSupplyPage from "../features/categoriesSupply/pages/CategoriesSupplyPage.jsx";

// Productos
import ProductsPage from "../features/products/pages/ProductsPage.jsx";

// Proveedores
import SuppliersPage from "../features/suppliers/pages/SuppliersPage.jsx";

// Compras
import ShoppingsPage from "../features/shopping/pages/ShoppingsPage.jsx";

// Terceros
import ThirdPartiesPage from "../features/third_parties/pages/Third_partiesPage.jsx";

// Usuarios
import UsersPage from "../features/users/pages/UsersPage.jsx";

// Producciones
import ProductionsPage from "../features/production/pages/ProductionPage.jsx";
import ProductForm from "../features/production/components/ProductionForm/index.jsx";
import ProductionDetailsPage from "../features/production/productionDetails/pages/ProductionDetailsPage.jsx";
import ProductionCalendarPage from "../features/production/pages/ProductionCalendarPage.jsx";

// Empleados
import EmployeesPage from "../features/employees/pages/EmployeesPage.jsx";

// Perfil
import ProfilePage from "../features/auth/pages/ProfilePage.jsx";

// Sedes
import SedesPage from "../features/sedes/pages/sedesPage.jsx";

export function RouterApp() {
  return (
    <Routes>

      {/* Login — público */}
      <Route path="/" element={<Login />} />

      {/* Layout principal — requiere sesión */}
      <Route path="/layout" element={
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Usuarios */}
        <Route path="usuarios" element={
          <PrivateRoute modulo="usuarios"><UsersPage /></PrivateRoute>
        } />

        {/* Roles / Configuración */}
        <Route path="roles" element={
          <PrivateRoute modulo="roles"><RolesPage /></PrivateRoute>
        } />
        <Route path="roles/crear" element={
          <PrivateRoute modulo="roles"><CreateRolPage /></PrivateRoute>
        } />
        <Route path="roles/editar/:id" element={
          <PrivateRoute modulo="roles"><EditRolPage /></PrivateRoute>
        } />

        {/* Sedes */}
        <Route path="sedes" element={
          <PrivateRoute modulo="sedes"><SedesPage /></PrivateRoute>
        } />

        {/* Insumos */}
        <Route path="insumos" element={
          <PrivateRoute modulo="insumos"><SuppliesPage /></PrivateRoute>
        } />
        <Route path="categorias-insumos" element={
          <PrivateRoute modulo="categorias-insumos"><CategoriesSupplyPage /></PrivateRoute>
        } />

        {/* Proveedores */}
        <Route path="proveedores" element={
          <PrivateRoute modulo="proveedores"><SuppliersPage /></PrivateRoute>
        } />

        {/* Compras */}
        <Route path="compras" element={
          <PrivateRoute modulo="compras"><ShoppingsPage /></PrivateRoute>
        } />

        {/* Productos */}
        <Route path="productos" element={
          <PrivateRoute modulo="productos"><ProductsPage /></PrivateRoute>
        } />
        <Route path="categorias-productos" element={
          <PrivateRoute modulo="categorias-productos"><ProductCategoriesPage /></PrivateRoute>
        } />
        <Route path="productos/crear" element={
          <PrivateRoute modulo="productos"><ProductForm /></PrivateRoute>
        } />

        {/* Producción */}
        <Route path="produccion" element={
          <PrivateRoute modulo="produccion"><ProductionsPage /></PrivateRoute>
        } />
        <Route path="produccion/detalle/:id" element={
          <PrivateRoute modulo="produccion"><ProductionDetailsPage /></PrivateRoute>
        } />
        <Route path="/layout/produccion/calendario" element={
          <PrivateRoute modulo="produccion"><ProductionCalendarPage /></PrivateRoute>
        } />

        {/* Terceros */}
        <Route path="terceros" element={
          <PrivateRoute modulo="terceros"><ThirdPartiesPage /></PrivateRoute>
        } />

        {/* Empleados */}
        <Route path="empleados" element={
          <PrivateRoute modulo="empleados"><EmployeesPage /></PrivateRoute>
        } />

        {/* Perfil — siempre accesible */}
        <Route path="perfil" element={<ProfilePage />} />

      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/layout" replace />} />

    </Routes>
  );
}

export default RouterApp;