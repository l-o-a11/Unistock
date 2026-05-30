import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../../features/auth/services/AuthAPI";
import { userAPI } from "../users/services/usersAPI";

export const ROUTE_MODULE_MAP = {
  "dashboard": 0,
  "usuarios": 1,
  "categorias de insumos": 2,
  "insumos": 3,
  "proveedores": 4,
  "compras": 5,
  "categorias de productos": 6,
  "productos": 7,
  "produccion": 8,
  "terceros": 9,
  "empleados": 10,
  "sedes": 11,
  "roles": 12,
};

const ROLES_KEY = "app_roles";

const getRolesFromStorage = () => {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRolesToStorage = (roles) => {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  } catch { }
};

const normalizeRole = (role) => {
  if (!role) return role;
  // Ya normalizado
  if (Array.isArray(role.modulos)) return role;

  if (Array.isArray(role.permisos)) {
    const permisosArray = role.permisos;
    if (permisosArray.length === 0) return { ...role, modulos: [] };
    const first = permisosArray[0];

    // Formato API real: [{ modulo: "usuarios", privilegios: ["leer"] }]
    if (typeof first === "object" && first !== null && "modulo" in first) {
      return {
        ...role,
        modulos: permisosArray
          .map((p) => {
            const moduloId = ROUTE_MODULE_MAP[p.modulo?.toLowerCase()];
            if (moduloId === undefined) return null;
            return { moduloId, privilegios: p.privilegios ?? [] };
          })
          .filter(Boolean),
      };
    }

    // Formato legacy: [{ moduloId: 1, privilegios: [1] }]
    if (typeof first === "object" && first !== null && "moduloId" in first) {
      return { ...role, modulos: permisosArray };
    }

    // Formato legacy: [1, 2, 3]
    if (typeof first === "number" || typeof first === "string") {
      return {
        ...role,
        modulos: permisosArray.map((moduloId) => ({ moduloId: Number(moduloId), privilegios: [1] })),
      };
    }
  }
  return role;
};

const rolesMatchSession = (roles, session) => {
  if (!session) return false;
  const exactMatch = roles.some((r) => String(r.id) === String(session.rolId));
  if (exactMatch) return true;
  const sessionRolNombre = session.rolNombre?.toString().toLowerCase();
  if (sessionRolNombre) {
    return roles.some((r) => String(r.nombre).toLowerCase() === sessionRolNombre);
  }
  return false;
};

const fetchRolesCatalog = async (session) => {
  const storedRoles = getRolesFromStorage();

  if (storedRoles.length > 0 && rolesMatchSession(storedRoles, session)) {
    return storedRoles.map(normalizeRole);
  }

  try {
    const remoteRoles = await userAPI.getRoles();
    if (Array.isArray(remoteRoles) && remoteRoles.length > 0) {
      const normalized = remoteRoles.map(normalizeRole);
      saveRolesToStorage(normalized);
      return normalized;
    }
  } catch (err) {
    console.error("Error cargando roles desde API:", err);
  }

  return storedRoles.map(normalizeRole);
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPermisos = async (session) => {
    const roles = await fetchRolesCatalog(session);
    const sessionRolId = session?.rolId;
    const sessionRolNombre = session?.rolNombre?.toString().toLowerCase();

    const rol = roles.find((r) => {
      if (String(r.id) === String(sessionRolId)) return true;
      if (sessionRolNombre && String(r.nombre).toLowerCase() === sessionRolNombre) return true;
      return false;
    });

    let ids = [];
    if (rol) {
      ids = rol.modulos?.map((m) => m.moduloId) ?? [];
      setPermisos(ids);
    } else {
      setPermisos([]);
    }
    console.log("=== cargarPermisos FIN, rol:", rol?.nombre, "permisos:", ids);
    setLoading(false);
  };

  // Carga sesión inicial desde localStorage
  useEffect(() => {
    const session = AuthAPI.getSession();
    if (session) {
      setUser(session);
      cargarPermisos(session);
    } else {
      setLoading(false);
    }
  }, []);

  // Recarga permisos si otra pestaña actualiza los roles
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === ROLES_KEY && user) cargarPermisos(user);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  const login = (session) => {
    console.log("=== login() llamado:", session);
    setLoading(true);
    setUser(session);
    cargarPermisos(session);
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
    setPermisos([]);
  };

  const canAccess = (rutaSegmento) => {
    if (!user) return false;
    const rolNombre = (user.rolNombre ?? "").toLowerCase();
    if (rolNombre === "gerente" || rolNombre === "administrador") return true;
    const moduloId = ROUTE_MODULE_MAP[rutaSegmento];
    if (moduloId === undefined) return true;
    return permisos.includes(moduloId);
  };

  const refrescarPermisos = () => {
    if (user) cargarPermisos(user);
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