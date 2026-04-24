// API auxiliar de usuarios — usada por el módulo de Roles
// para verificar si un rol está enlazado antes de eliminarlo o inactivarlo.
// Los datos reales los maneja el módulo de usuarios de tu compañero.

const ejemploUsers = [
  {
    id: 1,
    tipoDocumento: "CC",
    numeroDocumento: "856127435",
    nombreCompleto: "Sofía Osorio Ramírez",
    correo: "sofia.osorio@gmail.com",
    rolId: 3, // Personal de corte
    sede: "Parque Berrio",
    estado: true,
  },
  {
    id: 2,
    tipoDocumento: "CC",
    numeroDocumento: "684217935",
    nombreCompleto: "Miguel Ángel Torres",
    correo: "miguel.torres@gmail.com",
    rolId: 3, // Personal de corte
    sede: "Parque Berrio",
    estado: true,
  },
  {
    id: 3,
    tipoDocumento: "CC",
    numeroDocumento: "1023456789",
    nombreCompleto: "Laura Marcela Gómez",
    correo: "laura.gomez@gmail.com",
    rolId: 2, // Administrador
    sede: "Parque Berrio",
    estado: true,
  },
];

export const UserAPI = {
  // Retorna todos los usuarios
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...ejemploUsers]), 300);
    });
  },

  // Retorna solo los usuarios que tienen asignado un rolId específico
  getByRolId: async (rolId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ejemploUsers.filter((u) => u.rolId === rolId));
      }, 300);
    });
  },

  // Cuenta cuántos usuarios tienen asignado un rolId específico
  countByRolId: async (rolId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ejemploUsers.filter((u) => u.rolId === rolId).length);
      }, 300);
    });
  },
};