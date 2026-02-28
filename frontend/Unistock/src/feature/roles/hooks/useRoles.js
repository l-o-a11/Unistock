import { useState, useEffect } from 'react';
import {RolesAPI} from '../services/RolesAPI';


export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modulos, setModulos] = useState([]);
const [privilegios, setPrivilegios] = useState([]);

  // Cargar roles al montar el componente
  useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);

    const [rolesData, modulosData, privilegiosData] =
      await Promise.all([
        RolesAPI.getAll(),
        RolesAPI.getModulos(),
        RolesAPI.getPrivilegios()
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

  // Obtener un rol por ID
  const getRolById = (id) => {
    return roles.find(rol => rol.id === parseInt(id));
  };

  // Crear nuevo rol
const createRol = async (rolData) => {
  try {
    setLoading(true);
    const newRol = await RolesAPI.create(rolData);
    setRoles(prev => [...prev, newRol]);
    return newRol;
  } catch (err) {
    setError('Error al crear el rol');
    console.error(err);
    throw err;
  } finally {
    setLoading(false);
  }
};
  // Actualizar rol existente
  const updateRol = async (id, rolData) => {
  try {
    setLoading(true);
    const updated = await RolesAPI.update(id, rolData);

    setRoles(prev =>
      prev.map(rol =>
        rol.id === id ? updated : rol
      )
    );
  } catch (err) {
    setError('Error al actualizar el rol');
    console.error(err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Eliminar rol
  const deleteRol = async (id) => {
  try {
    setLoading(true);
    await RolesAPI.delete(id);
    setRoles(prev => prev.filter(rol => rol.id !== id));
  } catch (err) {
    setError('Error al eliminar el rol');
    console.error(err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Obtener módulos predeterminados
  const getModulos = () => {
    return MODULOS_PREDETERMINADOS;
  };

  // Obtener privilegios predeterminados
  const getPrivilegios = () => {
    return PRIVILEGIOS_PREDETERMINADOS;
  };

  // Obtener nombre de módulo por ID
  const getModuloNombre = (moduloId) => {
    const modulo = MODULOS_PREDETERMINADOS.find(m => m.id === moduloId);
    return modulo ? modulo.nombre : 'Módulo desconocido';
  };

  // Obtener nombre de privilegio por ID
  const getPrivilegioNombre = (privilegioId) => {
    const privilegio = PRIVILEGIOS_PREDETERMINADOS.find(p => p.id === privilegioId);
    return privilegio ? privilegio.nombre : 'Desconocido';
  };

  // Verificar si un rol tiene un permiso específico
  const tienePermiso = (rolId, moduloId, privilegioId) => {
    const rol = roles.find(rol => rol.id === parseInt(rolId));
    if (!rol) return false;
    
    const modulo = rol.modulos.find(m => m.moduloId === moduloId);
    if (!modulo) return false;
    
    return modulo.privilegios.includes(privilegioId);
  };

  // Obtener todos los permisos de un rol para un módulo
  const getPermisosModulo = (rolId, moduloId) => {
    const rol = roles.find(rol => rol.id === parseInt(rolId));
    if (!rol) return [];
    
    const modulo = rol.modulos.find(m => m.moduloId === moduloId);
    return modulo ? modulo.privilegios : [];
  };

  // 🔄 Alternar estado
  const toggleRol = (id) => {
  setRoles(prev =>
    prev.map(rol =>
      rol.id === id
        ? { ...rol, estado: !rol.estado }
        : rol
    )
  );
};


  return {
    // Estados
    roles,
    loading,
    error,
    
    // CRUD operations
    getRolById,
    createRol,
    updateRol,
    deleteRol,
    toggleRol,
    
    // Módulos y privilegios
    getModulos,
    getPrivilegios,
    getModuloNombre,
    getPrivilegioNombre,
    
    // Utilidades de permisos
    tienePermiso,
    getPermisosModulo

  };
};

// Hook separado para búsqueda de roles
export const useRolSearch = (roles, searchTerm) => {
  const [filteredRoles, setFilteredRoles] = useState(roles);

  useEffect(() => {
    const filtered = roles.filter(rol =>
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [roles, searchTerm]);

  return { filteredRoles };
};

// Hook para manejar el detalle del rol
export const useRolDetail = () => {
  const [selectedRol, setSelectedRol] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = (rol) => {
    setSelectedRole(rol);
    setIsOpen(true);
  };

  const closeDetail = () => {
    setIsOpen(false);
    setSelectedRol(null);
  };

  return {
    selectedRol,
    isOpen,
    openDetail,
    closeDetail
  };
};

export default useRoles;