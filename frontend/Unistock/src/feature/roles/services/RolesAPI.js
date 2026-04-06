// Datos de ejemplo para módulos y privilegios (simulando BD)
export const MODULOS_PREDETERMINADOS = [
  { id: 1,  nombre: 'Dashboard' },
  { id: 2,  nombre: 'Usuarios' },
  { id: 3,  nombre: 'Categorías de insumos' },
  { id: 4,  nombre: 'Insumos' },
  { id: 5,  nombre: 'Proveedores' },
  { id: 6,  nombre: 'Compras' },
  { id: 7,  nombre: 'Categorías de productos' },
  { id: 8,  nombre: 'Productos' },
  { id: 9,  nombre: 'Producción' },
  { id: 10, nombre: 'Terceros' },
  { id: 11, nombre: 'Empleados' },
  { id: 12, nombre: 'Sedes' },
  { id: 13, nombre: 'Roles' },
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
    estado: true,
    modulos: [
      { moduloId: 1,  privilegios: [1, 2, 3, 4] },
      { moduloId: 2,  privilegios: [1, 2, 3, 4] },
      { moduloId: 3,  privilegios: [1, 2, 3, 4] },
      { moduloId: 4,  privilegios: [1, 2, 3, 4] },
      { moduloId: 5,  privilegios: [1, 2, 3, 4] },
      { moduloId: 6,  privilegios: [1, 2, 3, 4] },
      { moduloId: 7,  privilegios: [1, 2, 3, 4] },
      { moduloId: 8,  privilegios: [1, 2, 3, 4] },
      { moduloId: 9,  privilegios: [1, 2, 3, 4] },
      { moduloId: 10, privilegios: [1, 2, 3, 4] },
      { moduloId: 11, privilegios: [1, 2, 3, 4] },
      { moduloId: 12, privilegios: [1, 2, 3, 4] },
      { moduloId: 13, privilegios: [1, 2, 3, 4] },
    ]
  },
  { 
    id: 2, 
    nombre: 'Administrador', 
    descripcion: 'Accede a todos los módulos de su área. Puede gestionar usuarios y configuraciones básicas.',
    estado: true,
    modulos: [
      { moduloId: 1,  privilegios: [1, 2, 3] },
      { moduloId: 2,  privilegios: [1, 2, 3] },
      { moduloId: 3,  privilegios: [1, 2, 3] },
      { moduloId: 4,  privilegios: [1, 2, 3] },
      { moduloId: 5,  privilegios: [1, 2, 3] },
      { moduloId: 6,  privilegios: [1, 2, 3] },
      { moduloId: 7,  privilegios: [1, 2, 3] },
      { moduloId: 8,  privilegios: [1, 2, 3] },
      { moduloId: 9,  privilegios: [1, 2, 3] },
      { moduloId: 10, privilegios: [1, 2, 3] },
      { moduloId: 11, privilegios: [1, 2, 3] },
      { moduloId: 12, privilegios: [1, 2, 3] },
      { moduloId: 13, privilegios: [1, 2, 3] },
    ]
  },
  { 
    id: 3, 
    nombre: 'Personal de corte', 
    descripcion: 'Accede a la zona contable de la empresa y puede registrar horas de trabajo y materiales utilizados.',
    estado: true,
    modulos: [
      { moduloId: 8, privilegios: [1] },     // Productos: Leer
      { moduloId: 9, privilegios: [1, 2] },  // Producción: Leer, Crear
    ]
  },
  { 
    id: 4, 
    nombre: 'Gestor de inventario', 
    descripcion: 'Este rol permite acceder a los módulos de gestión de inventario, incluyendo insumos, productos y compras. Ideal para personal encargado del control de stock.',
    estado: false,
    modulos: [
      { moduloId: 4, privilegios: [1, 2, 3] }, // Insumos
      { moduloId: 6, privilegios: [1, 2] },    // Compras
      { moduloId: 8, privilegios: [1, 2, 3] }, // Productos
    ]
  },
  { 
    id: 5, 
    nombre: 'Vendedor', 
    descripcion: 'Visualiza la información de productos y puede registrar ventas. No tiene acceso a configuración.',
    estado: true,
    modulos: [
      { moduloId: 8, privilegios: [1] }, // Productos: Leer
    ]
  },
   { 
    id: 6, 
    nombre: 'Contador', 
    descripcion: 'Accede a la información de dashboard. No tiene acceso a configuración.',
    estado: false,
    modulos: [
      { moduloId: 1, privilegios: [1] }, // Dashboard: Leer
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