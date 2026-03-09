// src/feature/companies/services/Third_partiesAPI.js

// Datos de ejemplo de empresas
const mockCompanies = [
  {
    id: '1',
    nit: '900123456-7',
    nombreEmpresa: 'Textiles Medellín S.A.S',
    nombreContacto: 'Laura Gómez',
    direccion: 'Cra 45 #10-23, Medellín'
  },
  {
    id: '2',
    nit: '901987654-3',
    nombreEmpresa: 'Moda Urbana Colombia',
    nombreContacto: 'Carlos Pérez',
    direccion: 'Calle 50 #70-11, Medellín'
  },
  {
    id: '3',
    nit: '800456789-1',
    nombreEmpresa: 'Diseños Elegantes S.A',
    nombreContacto: 'Ana Rodríguez',
    direccion: 'Av. Oriental #34-90, Medellín'
  }
];

export const companyAPI = {

  // Obtener todas las empresas
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockCompanies]);
      }, 500);
    });
  },

  // Obtener empresa por ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const company = mockCompanies.find(c => c.id === id);
        if (company) {
          resolve({ ...company });
        } else {
          reject(new Error('Empresa no encontrada'));
        }
      }, 300);
    });
  },

  // Crear empresa
  create: (companyData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany = {
          id: Date.now().toString(),
          ...companyData
        };
        mockCompanies.push(newCompany);
        resolve({ ...newCompany });
      }, 500);
    });
  },

  // Actualizar empresa
  update: (id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCompanies.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCompanies[index] = { ...mockCompanies[index], ...updatedData };
          resolve({ ...mockCompanies[index] });
        } else {
          reject(new Error('Empresa no encontrada'));
        }
      }, 500);
    });
  },

  // Eliminar empresa
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCompanies.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCompanies.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Empresa no encontrada'));
        }
      }, 500);
    });
  }
};
