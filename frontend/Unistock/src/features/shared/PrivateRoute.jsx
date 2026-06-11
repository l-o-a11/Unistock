import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
/**
 * Protege una ruta:
 * - Si no hay sesión → redirige a login "/"
 * - Si no tiene permiso → redirige a /layout/dashboard con mensaje
 */
const PrivateRoute = ({ children, modulo }) => {
  const { user, canAccess, loading, getFirstAccessibleRoute } = useAuthContext();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (modulo && !canAccess(modulo)) {
    // Redirigir al primer módulo accesible en vez del dashboard hardcodeado
    return <Navigate to={getFirstAccessibleRoute()} replace />;
  }

  return children;
};

export default PrivateRoute;