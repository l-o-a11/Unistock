import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProductsPage from '../feature/products/pages/ProductsPage';
import CreateProductPage from '../feature/products/pages/CreateProductPage';
import EditProductPage from '../feature/products/pages/EditProductPage';
import TechnicalSheetPage from '../feature/products/pages/TechnicalSheetPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal - Lista de productos */}
        <Route path="/" element={<Navigate to="/productos" replace />} />
        
        {/* Módulo de productos */}
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/crear" element={<CreateProductPage />} />
        <Route path="/productos/editar/:id" element={<EditProductPage />} />
        <Route path="/productos/ficha-tecnica/:id" element={<TechnicalSheetPage />} />
        
        {/* Ruta para cuando no encuentra nada (404) */}
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;