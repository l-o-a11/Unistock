// features/roles/hooks/useRoles.js

import { useState, useEffect, useCallback } from "react";
import {
  RolesAPI,
  MODULOS_PREDETERMINADOS,
  PRIVILEGIOS_PREDETERMINADOS,
} from "../services/RolesAPI";

// ── Hook principal ────────────────────────────────────────────────────────────
export const useRoles = () => {
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Carga inicial desde el backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RolesAPI.getAll();
      setRoles(data);
    } catch (err) {
      setError(err.message ?? "Error al cargar roles");
      console.error("[useRoles] loadData:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  // Busca un rol en el estado local por id (acepta string o número)
  const getRolById = useCallback(
    (id) => roles.find((r) => String(r.id) === String(id)),
    [roles]
  );

  const createRol = async (rolData) => {
    try {
      setLoading(true);
      setError(null);
      const newRol = await RolesAPI.create(rolData);
      setRoles((prev) => [...prev, newRol]);
      return newRol;
    } catch (err) {
      const msg = err.message ?? "Error al crear el rol";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateRol = async (id, rolData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await RolesAPI.update(id, rolData);
      setRoles((prev) =>
        prev.map((r) => (String(r.id) === String(id) ? updated : r))
      );
      return updated;
    } catch (err) {
      const msg = err.message ?? "Error al actualizar el rol";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteRol = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await RolesAPI.delete(id);
      setRoles((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err) {
      const msg = err.message ?? "Error al eliminar el rol";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // toggleRol ahora llama al backend (PATCH /roles/:id/toggle)
  const toggleRol = async (id) => {
    try {
      setError(null);
      const updated = await RolesAPI.toggle(id);
      setRoles((prev) =>
        prev.map((r) => (String(r.id) === String(id) ? updated : r))
      );
      return updated;
    } catch (err) {
      const msg = err.message ?? "Error al cambiar estado del rol";
      setError(msg);
      throw new Error(msg);
    }
  };

  // ── Helpers de catálogos ──────────────────────────────────────────────────
  // Usan los catálogos locales definidos en RolesAPI.js — sin petición extra.

  const getModulos     = () => MODULOS_PREDETERMINADOS;
  const getPrivilegios = () => PRIVILEGIOS_PREDETERMINADOS;

  const getModuloNombre = (moduloId) =>
    MODULOS_PREDETERMINADOS.find((m) => m.id === moduloId)?.nombre ??
    "Módulo desconocido";

  const getPrivilegioNombre = (privId) =>
    PRIVILEGIOS_PREDETERMINADOS.find((p) => p.id === privId)?.nombre ??
    "Desconocido";

  const tienePermiso = (rolId, moduloId, privilegioId) => {
    const rol = roles.find((r) => String(r.id) === String(rolId));
    if (!rol) return false;
    const mod = rol.modulos?.find((m) => m.moduloId === moduloId);
    return mod ? mod.privilegios.includes(privilegioId) : false;
  };

  const getPermisosModulo = (rolId, moduloId) => {
    const rol = roles.find((r) => String(r.id) === String(rolId));
    if (!rol) return [];
    return rol.modulos?.find((m) => m.moduloId === moduloId)?.privilegios ?? [];
  };

  return {
    roles,
    loading,
    error,
    reload: loadData,       // nuevo: permite refrescar la lista manualmente
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

// ── Hooks auxiliares — misma interfaz que antes, sin cambios ──────────────────

export const useRolSearch = (roles, searchTerm) => {
  const [filteredRoles, setFilteredRoles] = useState(roles);

  useEffect(() => {
    const term = (searchTerm ?? "").toLowerCase();
    setFilteredRoles(
      roles.filter(
        (r) =>
          r.nombre?.toLowerCase().includes(term) ||
          r.descripcion?.toLowerCase().includes(term)
      )
    );
  }, [roles, searchTerm]);

  return { filteredRoles };
};

export const useRolDetail = () => {
  const [selectedRol, setSelectedRol] = useState(null);
  const [isOpen, setIsOpen]           = useState(false);

  const openDetail  = (rol) => { setSelectedRol(rol); setIsOpen(true); };
  const closeDetail = ()    => { setIsOpen(false); setSelectedRol(null); };

  return { selectedRol, isOpen, openDetail, closeDetail };
};

export default useRoles;
