import { useState, useEffect } from 'react';
import { RolesAPI, MODULOS_PREDETERMINADOS, PRIVILEGIOS_PREDETERMINADOS } from '../services/RolesAPI';

const STORAGE_KEY = 'app_roles';

// ── Helpers de localStorage ────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* JSON corrupto */ }
  return null;
};

// FIX 5: disparar evento 'storage' para que AuthContext se entere
// cuando los roles son modificados en la misma pestaña.
const saveToStorage = (roles) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    // localStorage events solo llegan a OTRAS pestañas por defecto;
    // disparamos uno manual para la pestaña actual.
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (e) {
    console.error('No se pudo guardar en localStorage:', e);
  }
};

// ── Hook principal ─────────────────────────────────────────────────────────
export const useRoles = () => {
  const [roles, setRoles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [modulos, setModulos]     = useState([]);
  const [privilegios, setPrivilegios] = useState([]);

  useEffect(() => {
    const cached = loadFromStorage();
    if (cached) {
      setRoles(cached);
      setLoading(false);
    } else {
      loadData();
    }
  }, []);

  // Persistir cada vez que roles cambia (después de la carga inicial)
  useEffect(() => {
    if (!loading) {
      saveToStorage(roles);
    }
  }, [roles, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, modulosData, privilegiosData] = await Promise.all([
        RolesAPI.getAll(),
        RolesAPI.getModulos(),
        RolesAPI.getPrivilegios(),
      ]);
      setRoles(rolesData);
      setModulos(modulosData);
      setPrivilegios(privilegiosData);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRolById   = (id) => roles.find((rol) => rol.id === parseInt(id));

  const createRol = async (rolData) => {
    try {
      setLoading(true);
      const newRol = await RolesAPI.create(rolData);
      setRoles((prev) => [...prev, newRol]);
      return newRol;
    } catch (err) {
      setError('Error al crear el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRol = async (id, rolData) => {
    try {
      setLoading(true);
      const updated = await RolesAPI.update(id, rolData);
      setRoles((prev) => prev.map((rol) => (rol.id === id ? updated : rol)));
    } catch (err) {
      setError('Error al actualizar el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRol = async (id) => {
    try {
      setLoading(true);
      await RolesAPI.delete(id);
      setRoles((prev) => prev.filter((rol) => rol.id !== id));
    } catch (err) {
      setError('Error al eliminar el rol');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleRol = (id) => {
    setRoles((prev) =>
      prev.map((rol) => (rol.id === id ? { ...rol, estado: !rol.estado } : rol))
    );
  };

  const getModulos        = () => MODULOS_PREDETERMINADOS;
  const getPrivilegios    = () => PRIVILEGIOS_PREDETERMINADOS;
  const getModuloNombre   = (moduloId) => MODULOS_PREDETERMINADOS.find((m) => m.id === moduloId)?.nombre ?? 'Módulo desconocido';
  const getPrivilegioNombre = (privId) => PRIVILEGIOS_PREDETERMINADOS.find((p) => p.id === privId)?.nombre ?? 'Desconocido';

  const tienePermiso = (rolId, moduloId, privilegioId) => {
    const rol = roles.find((r) => r.id === parseInt(rolId));
    if (!rol) return false;
    const mod = rol.modulos?.find((m) => m.moduloId === moduloId);
    return mod ? mod.privilegios.includes(privilegioId) : false;
  };

  const getPermisosModulo = (rolId, moduloId) => {
    const rol = roles.find((r) => r.id === parseInt(rolId));
    if (!rol) return [];
    return rol.modulos?.find((m) => m.moduloId === moduloId)?.privilegios ?? [];
  };

  return {
    roles,
    loading,
    error,
    getRolById,
    createRol,
    updateRol,
    deleteRol,
    toggleRol,
    getModulos,
    getPrivilegios,
    getModuloNombre,
    getPrivilegioNombre,
    tienePermiso,
    getPermisosModulo,
  };
};

export const useRolSearch = (roles, searchTerm) => {
  const [filteredRoles, setFilteredRoles] = useState(roles);

  useEffect(() => {
    const filtered = roles.filter(
      (rol) =>
        rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rol.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [roles, searchTerm]);

  return { filteredRoles };
};

export const useRolDetail = () => {
  const [selectedRol, setSelectedRol] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail  = (rol) => { setSelectedRol(rol); setIsOpen(true); };
  const closeDetail = ()    => { setIsOpen(false); setSelectedRol(null); };

  return { selectedRol, isOpen, openDetail, closeDetail };
};

export default useRoles;
