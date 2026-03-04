import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../feature/auth/pages/LoginPage.jsx";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";
import AppLayout from "../feature/dashboard/components/layout/AppLayout.jsx";
import RolesPage from '../feature/roles/pages/RolesPage';
import CreateRolPage from '../feature/roles/pages/CreateRolPage.jsx';
import EditRolPage from '../feature/roles/pages/EditRolPage.jsx';


import ProductsPage from '../feature/products/pages/ProductsPage';

import CategoriesPage from '../feature/categories/pages/CategoriesPage';

import SuppliersPage from '../feature/suppliers/pages/SuppliersPage';
import CreateSupplierPage from '../feature/suppliers/pages/CreateSupplierPage';
import EditSupplierPage from '../feature/suppliers/pages/EditSupplierPage.jsx';

import Third_partiesPage from '../feature/third_parties/pages/Third_partiesPage.jsx';
import CreateThird_partiePage from '../feature/third_parties/pages/CreateThird_partiesPage.jsx';
import EditThird_partiePage from '../feature/third_parties/pages/EditThird_partiesPage.jsx';

import UsersPage from '../feature/users/pages/UsersPage.jsx';

import ProductionsPage from '../feature/Productions/pages/ProductionPage.jsx';
import ProductionDetailsPage from '../feature/Productions/productionDetails/pages/ProductionDetailsPage.jsx';
import ProductionCalender from '../feature/Productions/components/ProductionCalender/index.jsx';

export function RouterApp() {
  return (
    <Routes>
      <Route>
        <Route path="/" element={<Login />} />
      </Route>

      {/* Layout principal con Navbar y Sidebar */}
      <Route path="/Layout" element={<AppLayout />}>

        {/* Dashboard - Ruta por defecto */}
        <Route index element={<ProductionDashboard />} />
        <Route path="dashboard" element={<ProductionDashboard />} />

        {/* Módulo de roles */}
        <Route path="roles" element={<RolesPage />} />
        <Route path="roles/crear" element={<CreateRolPage />} />
        <Route path="roles/editar/:id" element={<EditRolPage />} />

        {/* Módulo de productos */}
        <Route path="productos" element={<ProductsPage />} />

        {/* Módulo de categorías */}
        <Route path="categorias" element={<CategoriesPage />} />

        {/* Módulo de proveedores */}
        <Route path="proveedores" element={<SuppliersPage />} />
        <Route path="proveedores/crear" element={<CreateSupplierPage />} />
        <Route path="proveedores/editar/:id" element={<EditSupplierPage />} />


<<<<<<< HEAD
{/* Módulo de producciones */}
        <Route path="/produccion" element={<ProductionsPage />} />
        <Route path="/produccion/:id" element={<ProductionDetailsPage />} />
        <Route path="/produccion/calendario" element={<ProductionCalender />} />
         {/* Módulo de terceros */}
        <Route path="/terceros" element={<Third_partiesPage />} />
        <Route path="/terceros/crear" element={<CreateThird_partiePage />} />
        <Route path="/terceros/editar/:id" element={<EditThird_partiePage />} />
        
         {/* Módulo de usuarios */}
         <Route path="users" element={<UsersPage />} />
        <Route path="users/crear" element={<CreateUsersPage />} />
        <Route path="users/editar/:id" element={<EditUserPage />} />
=======
        {/* Módulo de producciones */}
        <Route path="produccion" element={<ProductionsPage />} />
        <Route path="produccion/:id" element={<ProductionDetailsPage />} />
        {/* Módulo de terceros */}
        <Route path="terceros" element={<Third_partiesPage />} />
        <Route path="terceros/crear" element={<CreateThird_partiePage />} />
        <Route path="terceros/editar/:id" element={<EditThird_partiePage />} />

        {/* Módulo de usuarios */}
        <Route path="users" element={<UsersPage />} />
>>>>>>> 189b11c1a709e089b851c132656490b36fa35ff6
      </Route>


      {/* Ruta 404 - Redirige al dashboard */}
      <Route path="*" element={<Navigate to="/layout" replace />} />
    </Routes>
  );
}

export default RouterApp;