import { useState, useEffect } from 'react';

// Datos de ejemplo para módulos y privilegios (simulando BD)
const MODULOS_PREDETERMINADOS = [
  { id: 1, nombre: 'Usuarios' },
  { id: 2, nombre: 'Productos' },
  { id: 3, nombre: 'Insumos' },
  { id: 4, nombre: 'Compras' },
  { id: 5, nombre: 'Proveedores' },
  { id: 6, nombre: 'Ventas' },
  { id: 7, nombre: 'Reportes' },
  { id: 8, nombre: 'Configuración' }
];

const PRIVILEGIOS_PREDETERMINADOS = [
  { id: 1, nombre: 'Leer', key: 'leer' },
  { id: 2, nombre: 'Crear', key: 'crear' },
  { id: 3, nombre: 'Actualizar', key: 'actualizar' },
  { id: 4, nombre: 'Eliminar', key: 'eliminar' }
];

// Datos de ejemplo para roles iniciales
const INITIAL_ROLES = [
  { 
    id: 1, 
    nombre: 'Gerente', 
    descripcion: 'Accede a todos los módulos y permisos completos del sistema. Puede crear, editar y eliminar cualquier registro.',
    modulos: [
      { moduloId: 1, privilegios: [1, 2, 3, 4] }, // Usuarios: todos
      { moduloId: 2, privilegios: [1, 2, 3, 4] }, // Productos: todos
      { moduloId: 3, privilegios: [1, 2, 3, 4] }, // Insumos: todos
      { moduloId: 4, privilegios: [1, 2, 3, 4] }, // Compras: todos
      { moduloId: 5, privilegios: [1, 2, 3, 4] }, // Proveedores: todos
      { moduloId: 6, privilegios: [1, 2, 3, 4] }, // Ventas: todos
      { moduloId: 7, privilegios: [1, 2, 3, 4] }, // Reportes: todos
      { moduloId: 8, privilegios: [1, 2, 3, 4] }  // Configuración: todos
    ]
  },
  { 
    id: 2, 
    nombre: 'Administrador', 
    descripcion: 'Accede a todos los módulos de su área. Puede gestionar usuarios y configuraciones básicas.',
    modulos: [
      { moduloId: 1, privilegios: [1, 2, 3] }, // Usuarios: Leer, Crear, Actualizar
      { moduloId: 2, privilegios: [1, 2, 3] }, // Productos: Leer, Crear, Actualizar
      { moduloId: 3, privilegios: [1, 2, 3] }, // Insumos: Leer, Crear, Actualizar
      { moduloId: 4, privilegios: [1, 2, 3] }, // Compras: Leer, Crear, Actualizar
      { moduloId: 8, privilegios: [1, 2, 3] }  // Configuración: Leer, Crear, Actualizar
    ]
  },
  { 
    id: 3, 
    nombre: 'Personal de corte', 
    descripcion: 'Accede a la zona contable de la empresa y puede registrar horas de trabajo y materiales utilizados.',
    modulos: [
      { moduloId: 2, privilegios: [1] }, // Productos: Leer
      { moduloId: 3, privilegios: [1, 2] } // Insumos: Leer, Crear
    ]
  },
  { 
    id: 4, 
    nombre: 'Gestor de inventario', 
    descripcion: 'Este rol permite acceder a los módulos de gestión de inventario, incluyendo insumos, productos y compras. Ideal para personal encargado del control de stock.',
    modulos: [
      { moduloId: 2, privilegios: [1, 2, 3] }, // Productos: Leer, Crear, Actualizar
      { moduloId: 3, privilegios: [1, 2, 3] }, // Insumos: Leer, Crear, Actualizar
      { moduloId: 4, privilegios: [1, 2] }     // Compras: Leer, Crear
    ]
  },
  { 
    id: 5, 
    nombre: 'Vendedor', 
    descripcion: 'Visualiza la información de productos y puede registrar ventas. No tiene acceso a configuración.',
    modulos: [
      { moduloId: 2, privilegios: [1] }, // Productos: Leer
      { moduloId: 6, privilegios: [1, 2] } // Ventas: Leer, Crear
    ]
  }
];

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, []);

  // Simular carga de datos desde API
  const loadRoles = async () => {
    try {
      setLoading(true);
      // Simular retardo de red
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(INITIAL_ROLES);
      setError(null);
    } catch (err) {
      setError('Error al cargar los roles');
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
      // Simular retardo de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRol = {
        id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
        ...rolData
      };
      
      setRoles(prevRoles => [...prevRoles, newRol]);
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
      // Simular retardo de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prevRoles => 
        prevRoles.map(rol => 
          rol.id === parseInt(id) 
            ? { ...rolData, id: parseInt(id) }
            : rol
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
      // Simular retardo de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRoles(prevRoles => prevRoles.filter(rol => rol.id !== parseInt(id)));
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
    const rol = roles.find(r => r.id === parseInt(rolId));
    if (!rol) return false;
    
    const modulo = rol.modulos.find(m => m.moduloId === moduloId);
    if (!modulo) return false;
    
    return modulo.privilegios.includes(privilegioId);
  };

  // Obtener todos los permisos de un rol para un módulo
  const getPermisosModulo = (rolId, moduloId) => {
    const rol = roles.find(r => r.id === parseInt(rolId));
    if (!rol) return [];
    
    const modulo = rol.modulos.find(m => m.moduloId === moduloId);
    return modulo ? modulo.privilegios : [];
  };

  return {
    // Estados
    roles,
    loading,
    error,
    
    // CRUD operations
    loadRoles,
    getRolById,
    createRol,
    updateRol,
    deleteRol,
    
    // Módulos y privilegios
    getModulos,
    getPrivilegios,
    getModuloNombre,
    getPrivilegioNombre,
    
    // Utilidades de permisos
    tienePermiso,
    getPermisosModulo,
    
    // Datos estáticos (por si se necesitan directamente)
    MODULOS: MODULOS_PREDETERMINADOS,
    PRIVILEGIOS: PRIVILEGIOS_PREDETERMINADOS
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