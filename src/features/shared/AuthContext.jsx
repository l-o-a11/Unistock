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

const normalizeRole = (role) => {
  if (!role) return role;
  const normalizeModuloKey = (valor) => {
    const raw =
      typeof valor === "object"
        ? (valor?.nombre ?? valor?.name ?? "")
        : String(valor ?? "");
    return raw
      .toLowerCase()
      .trim()
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ");
  };

  const normalizeModuloItem = (item) => {
    if (item == null) return null;

    const moduloIdCandidate =
      typeof item === "object"
        ? item.moduloId
        : Number(item);

    if (moduloIdCandidate !== undefined && moduloIdCandidate !== null && !Number.isNaN(Number(moduloIdCandidate))) {
      return { moduloId: Number(moduloIdCandidate), privilegios: item.privilegios ?? [] };
    }

    const moduloName =
      typeof item === "string"
        ? item
        : item.modulo ?? item.nombre ?? item.name ?? item;
    const mappedId = ROUTE_MODULE_MAP[normalizeModuloKey(moduloName)];
    if (mappedId === undefined) return null;
    return { moduloId: mappedId, privilegios: item.privilegios ?? [] };
  };

  const normalizeModulosArray = (items = []) =>
    (Array.isArray(items) ? items : [])
      .map(normalizeModuloItem)
      .filter(Boolean);

  if (Array.isArray(role.modulos)) {
    return { ...role, modulos: normalizeModulosArray(role.modulos) };
  }

  if (Array.isArray(role.permisos)) {
    const permisosArray = role.permisos;
    if (permisosArray.length === 0) return { ...role, modulos: [] };
    const first = permisosArray[0];

    if (typeof first === "object" && first !== null && "modulo" in first) {
      return {
        ...role,
        modulos: permisosArray
          .map((p) => {
            const moduloName = normalizeModuloKey(p.modulo);
            const moduloId = ROUTE_MODULE_MAP[moduloName];
            if (moduloId === undefined) return null;
            return { moduloId, privilegios: p.privilegios ?? [] };
          })
          .filter(Boolean),
      };
    }

    if (typeof first === "object" && first !== null && "moduloId" in first) {
      return { ...role, modulos: permisosArray };
    }

    if (typeof first === "number" || typeof first === "string") {
      return {
        ...role,
        modulos: permisosArray.map((moduloId) => ({ moduloId: Number(moduloId), privilegios: [1] })),
      };
    }
  }
  return role;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPermisos = async () => {
    try {
      const remotePermisos = await userAPI.getMyPermissions();
      if (remotePermisos && remotePermisos.permisos) {
        const rolNormalizado = normalizeRole({
          id: remotePermisos.rolId,
          nombre: remotePermisos.rolNombre,
          permisos: remotePermisos.permisos,
        });
        const ids = rolNormalizado.modulos?.map((m) => m.moduloId) ?? [];
        setPermisos(ids);
      } else {
        setPermisos([]);
      }
    } catch (err) {
      console.error("Error cargando permisos:", err);
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = AuthAPI.getSession();
    if (session) {
      setUser(session);
      cargarPermisos();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (session) => {
    setLoading(true);
    setUser(session);
    cargarPermisos();
  };

  const logout = () => {
    AuthAPI.logout();
    setUser(null);
    setPermisos([]);
  };

  const canAccess = (rutaSegmento) => {
    if (!user) return false;
    const rolNombre = (user.rolNombre ?? "").toLowerCase();
    if (rolNombre === "gerente") return true;
    if (rutaSegmento === "usuarios") return false;
    const moduloId = ROUTE_MODULE_MAP[rutaSegmento];
    if (moduloId === undefined) return true;
    return permisos.includes(moduloId);
  };

  const refrescarPermisos = () => {
    if (user) cargarPermisos();
  };

  const getFirstAccessibleRoute = (u = user) => {
    if (!u) return "/";
    const rolNombre = (u.rolNombre ?? "").toLowerCase();
    if (rolNombre === "gerente") return "/layout/dashboard";
    const ORDER = [
      "dashboard", "usuarios", "roles", "sedes", "insumos",
      "categorias de insumos", "proveedores", "compras",
      "productos", "categorias de productos", "produccion",
      "terceros", "empleados",
    ];
    const ROUTE_MAP = {
      "dashboard": "/layout/dashboard",
      "usuarios": "/layout/usuarios",
      "roles": "/layout/roles",
      "sedes": "/layout/sedes",
      "insumos": "/layout/insumos",
      "categorias de insumos": "/layout/categorias-insumos",
      "proveedores": "/layout/proveedores",
      "compras": "/layout/compras",
      "productos": "/layout/productos",
      "categorias de productos": "/layout/categorias-productos",
      "produccion": "/layout/produccion",
      "terceros": "/layout/terceros",
      "empleados": "/layout/empleados",
    };
    for (const modulo of ORDER) {
      if (canAccess(modulo)) return ROUTE_MAP[modulo];
    }
    return "/layout/perfil";
  };

  return (
    <AuthContext.Provider value={{ user, permisos, loading, login, logout, canAccess, refrescarPermisos, getFirstAccessibleRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return ctx;
};
