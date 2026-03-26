import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../../feature/auth/services/AuthAPI";

// ── Mapeo ruta → moduloId ─────────────────────────────────────────────────
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

// ── Leer roles desde localStorage (misma clave que useRoles) ─────────────
const ROLES_KEY = "app_roles";

const getRolesFromStorage = () => {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const session = AuthAPI.getSession();
    if (session) {
      setUser(session);
      cargarPermisos(session.rolId);
    } else {
      setLoading(false);
    }
  }, []);

  const cargarPermisos = (rolId) => {
    // FIX 1: leer desde localStorage, no desde RolesAPI (memoria volátil).
    const roles = getRolesFromStorage();
    const idNum = parseInt(rolId);

    const rol = roles.find((r) => r.id === idNum);
    if (rol) {
      const ids = rol.modulos?.map((m) => m.moduloId) ?? [];
      setPermisos(ids);
    } else {
      setPermisos([]);
    }
    setLoading(false);
  };

  const login = (session) => {
    // Actualizar usuario Y permisos juntos para que el re-render
    // los reciba en el mismo ciclo — evita que el sidebar vea
    // por un instante al usuario anterior con los permisos del nuevo.
    const roles  = getRolesFromStorage();
    const idNum  = parseInt(session.rolId);
    const rol    = roles.find((r) => r.id === idNum);
    const ids    = rol?.modulos?.map((m) => m.moduloId) ?? [];
    setUser(session);
    setPermisos(ids);
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
    setPermisos([]);
  };

  // FIX 2: recargar permisos si otra pestaña/módulo actualiza los roles.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === ROLES_KEY && user) {
        cargarPermisos(user.rolId);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  const canAccess = (rutaSegmento) => {
    if (!user) return false;

    // FIX 3: parseInt robusto — evita NaN cuando rolId es null/undefined.
    const rolId = parseInt(user.rolId);
    if (isNaN(rolId)) return false;

    // Gerente (1) y Administrador (2) → acceso total
    if ([1, 2].includes(rolId)) return true;

    const moduloId = ROUTE_MODULE_MAP[rutaSegmento];
    if (!moduloId) return true; // rutas sin módulo (perfil, etc.)
    return permisos.includes(moduloId);
  };

  // Permite que otros módulos fuercen un refresco de permisos.
  const refrescarPermisos = () => {
    if (user) cargarPermisos(user.rolId);
  };

  return (
    <AuthContext.Provider value={{ user, permisos, loading, login, logout, canAccess, refrescarPermisos }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return ctx;
};
