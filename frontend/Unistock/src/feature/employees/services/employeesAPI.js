// src/feature/users/services/UsersAPI.js

// Datos mock de usuarios
const mockUsers = [
    {
        id: '1',
        tipoDocumento: 'CC',
        numeroDocumento: '856127435',
        nombreCompleto: 'Sofía Osorio',
        correo: 'sofiaosorio@gmail.com',
        rol: 'Empleado',
        sede: 'Parque del Río',
        activo: true
    },
    {
        id: '2',
        tipoDocumento: 'CC',
        numeroDocumento: '684217935',
        nombreCompleto: 'Miguel Ángel',
        correo: 'miguelangel@gmail.com',
        rol: 'Empleado',
        sede: 'Parque del Río',
        activo: true
    },
    {
        id: '3',
        tipoDocumento: 'CC',
        numeroDocumento: '1234785624',
        nombreCompleto: 'Mía Flórez',
        correo: 'miaflorez@gmail.com',
        rol: 'Empleado',
        sede: 'Parque del Río',
        activo: false
    }
];

export const userAPI = {

    // Obtener todos los usuarios
    getAll: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...mockUsers]);
            }, 500);
        });
    },

    // Obtener usuario por ID
    getById: (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.id === id);
                if (user) {
                    resolve({ ...user });
                } else {
                    reject(new Error('Usuario no encontrado'));
                }
            }, 300);
        });
    },

    // Crear usuario
    create: (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser = {
                    id: Date.now().toString(),
                    activo: true,
                    ...userData
                };
                mockUsers.push(newUser);
                resolve({ ...newUser });
            }, 500);
        });
    },

    // Actualizar usuario
    update: (id, updatedData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockUsers.findIndex(u => u.id === id);
                if (index !== -1) {
                    mockUsers[index] = { ...mockUsers[index], ...updatedData };
                    resolve({ ...mockUsers[index] });
                } else {
                    reject(new Error('Usuario no encontrado'));
                }
            }, 500);
        });
    },

    // Eliminar usuario
    delete: (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockUsers.findIndex(u => u.id === id);
                if (index !== -1) {
                    mockUsers.splice(index, 1);
                    resolve();
                } else {
                    reject(new Error('Usuario no encontrado'));
                }
            }, 500);
        });
    },

    // Cambiar estado activo/inactivo
    toggleStatus: (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.id === id);
                if (user) {
                    user.activo = !user.activo;
                    resolve({ ...user });
                } else {
                    reject(new Error('Usuario no encontrado'));
                }
            }, 300);
        });
    }
};
