import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
/**
 * Protege una ruta:
 * - Si no hay sesión → redirige a login "/"
 * - Si no tiene permiso → redirige a /layout/dashboard con mensaje
 */
const PrivateRoute = ({ children, modulo }) => {
  const { user, canAccess, loading } = useAuthContext();

  if (loading) return null; // o un spinner

  if (!user) return <Navigate to="/" replace />;

  if (modulo && !canAccess(modulo)) {
    return <Navigate to="/layout/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;