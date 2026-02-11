import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

export const RouterApp = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route
          index
          element={<h1 style={{ padding: 20 }}>Contenido</h1>}
        />
      </Route>
    </Routes>
  );
};
