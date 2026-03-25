import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../../feature/auth/services/AuthAPI";
import { RolesAPI } from "../../feature/roles/services/RolesAPI";

// ── Mapeo ruta → moduloId ─────────────────────────────────────────────────
// 1-Dashboard | 2-Usuarios
// 3-Compras: categorias-insumos(6), insumos(3), proveedores(5), compras(4)
// 4-Producción: productos(2), categorias(2), produccion(9), terceros(10), empleados(11)
// 5-Sedes(12) | 6-Configuración: roles(8)

export const ROUTE_MODULE_MAP = {
  "dashboard":          1,
  "usuarios":           2,
  "categorias-insumos": 3,
  "insumos":            4,
  "proveedores":        5,
  "compras":            6,
  "categorias":         7,
  "productos":          8,
  "produccion":         9,
  "terceros":           10,
  "empleados":          11,
  "sedes":              12,
  "roles":              13,
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [permisos, setPermisos]   = useState([]); // moduloIds que puede ver
  const [loading, setLoading]     = useState(true);

  // Al montar, restaurar sesión si existe
  useEffect(() => {
    const session = AuthAPI.getSession();
    if (session) {
      setUser(session);
      cargarPermisos(session.rolId);
    } else {
      setLoading(false);
    }
  }, []);

  const cargarPermisos = async (rolId) => {
    try {
      const roles = await RolesAPI.getAll();
      // Buscar por ID numérico
      const rol = roles.find((r) => r.id === parseInt(rolId));
      if (rol) {
        const ids = rol.modulos?.map((m) => m.moduloId) || [];
        setPermisos(ids);
      } else {
        setPermisos([]);
      }
    } catch {
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (session) => {
    setUser(session);
    await cargarPermisos(session.rolId);
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
    setPermisos([]);
  };

  // Verifica si el usuario puede ver un módulo por su ruta
  const canAccess = (rutaSegmento) => {
    if (!user) return false;
    // Gerente y Administrador tienen acceso a todo
    // rolId 1=Gerente, 2=Administrador → acceso total
    if ([1, 2].includes(parseInt(user.rolId))) return true;
    const moduloId = ROUTE_MODULE_MAP[rutaSegmento];
    if (!moduloId) return true; // rutas sin módulo asignado (perfil, etc.)
    return permisos.includes(moduloId);
  };

  return (
    <AuthContext.Provider value={{ user, permisos, loading, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return ctx;
};