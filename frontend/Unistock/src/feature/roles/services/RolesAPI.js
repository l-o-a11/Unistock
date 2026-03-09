// Datos de ejemplo para módulos y privilegios (simulando BD)
export const MODULOS_PREDETERMINADOS = [
  { id: 1, nombre: 'Usuarios' },
  { id: 2, nombre: 'Productos' },
  { id: 3, nombre: 'Insumos' },
  { id: 4, nombre: 'Compras' },
  { id: 5, nombre: 'Proveedores' },
  { id: 6, nombre: 'categorias de insumos' },
  { id: 7, nombre: 'dashboard' },
  { id: 8, nombre: 'Configuración' }
];

export  const PRIVILEGIOS_PREDETERMINADOS = [
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
  },
   { 
    id: 6, 
    nombre: 'Contador', 
    descripcion: 'Accede a la información de dashboard. No tiene acceso a configuración.',
    modulos: [
      { moduloId: 7, privilegios: [1] },
    ]
  }
];
let mockRoles = [...INITIAL_ROLES];
export const RolesAPI = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockRoles]);
      }, 500);
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const rol = mockRoles.find(r => r.id === id);
        if (rol) resolve({ ...rol });
        else reject(new Error('Rol no encontrado'));
      }, 300);
    });
  },

  create: async (rolData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRol = {
          id: mockRoles.length > 0
            ? Math.max(...mockRoles.map(r => r.id)) + 1
            : 1,
          ...rolData
        };

        mockRoles.push(newRol);
        resolve({ ...newRol });
      }, 500);
    });
  },

  update: async (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
          mockRoles[index] = {
            ...mockRoles[index],
            ...updatedData
          };
          resolve({ ...mockRoles[index] });
        } else {
          reject(new Error('Rol no encontrado'));
        }
      }, 500);
    });
  },

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
          mockRoles.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Rol no encontrado'));
        }
      }, 500);
    });
  },

  getModulos: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MODULOS_PREDETERMINADOS]);
      }, 300);
    });
  },

  getPrivilegios: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...PRIVILEGIOS_PREDETERMINADOS]);
      }, 300);
    });
  }
};

