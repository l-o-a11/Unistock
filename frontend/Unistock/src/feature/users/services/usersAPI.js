// src/feature/users/services/UsersAPI.js

// Datos mock de usuarios
const mockUsers = [
    {
        id: '1',
        tipoDocumento: 'CC',
        numeroDocumento: '856127435',
        nombreCompleto: 'Sofía Osorio',
        correo: 'sofiaosorio@gmail.com',
        rol: 1,
        sede: 1,
        estado: true
    },
    
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
                    estado: true,
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
                    user.estado = !user.estado;
                    resolve({ ...user });
                } else {
                    reject(new Error('Usuario no encontrado'));
                }
            }, 300);
        });
    }
};