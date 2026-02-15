import React from "react";
import { Routes, Route } from "react-router-dom";
import ProductionDashboard from "../feature/dashboard/dashboard.jsx";
import AppLayout from "../feature/routers/Layout/AppLayout.jsx";

export function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<ProductionDashboard />} />
        <Route index path="dashboard" element={<ProductionDashboard />} />
      </Route>
    </Routes>
  );
}

export default RouterApp;
