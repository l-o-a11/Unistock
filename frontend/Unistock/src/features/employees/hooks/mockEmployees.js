// src/feature/employees/hooks/mockEmployees.js
// Comparte el mismo localStorage que users (app_users)
// Filtra usuarios excluyendo Gerente y Admin

import { useState, useEffect } from "react";
import { useRoles } from "../../roles/hooks/useRoles";

const STORAGE_KEY = "app_users";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error al leer localStorage:", e);
  }
  return [];
};

const saveToStorage = (allUsers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
  } catch (e) {
    console.error("No se pudo guardar en localStorage:", e);
  }
};

export const useEmployees = () => {
  // allUsers: TODOS los usuarios (admins, gerentes, empleados)
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useRoles();

  // Carga inicial
  useEffect(() => {
    setAllUsers(loadFromStorage());
    setLoading(false);
  }, []);

  // Persiste cada cambio — sobre TODOS los usuarios, no solo empleados
  useEffect(() => {
    if (!loading) saveToStorage(allUsers);
  }, [allUsers, loading]);

  // Obtener IDs de Gerente y Admin para excluirlos
  const gerenteId = roles.find((r) => r.nombre === "Gerente")?.id;
  const adminId = roles.find((r) => r.nombre === "Administrador")?.id;

  // Vista filtrada: excluir Gerente y Admin
  const employees = allUsers.filter((u) => {
    const userRolId = u.rolId ?? u.rol;
    return userRolId !== gerenteId && userRolId !== adminId;
  });

  // ── CRUD (solo afecta registros que no sean Gerente ni Admin) ────────────

  const createEmployee = async (formData) => {
    const exists = allUsers.find(
      (u) =>
        u.numeroDocumento === formData.documentNumber ||
        u.correo === formData.email,
    );
    if (exists)
      throw new Error("Ya existe un usuario con ese documento o correo.");

    const newEmployee = {
      id: Date.now(),
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.name,
      correo: formData.email,
      rolId: parseInt(formData.role),
      sedeId: parseInt(formData.sede),
      password: formData.password || null,
      estado: true,
    };

    setAllUsers((prev) => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = async (id, formData) => {
    const exists = allUsers.find(
      (u) =>
        String(u.id) !== String(id) &&
        (u.numeroDocumento === formData.documentNumber ||
          u.correo === formData.email),
    );
    if (exists)
      throw new Error("Ya existe otro usuario con ese documento o correo.");

    setAllUsers((prev) =>
      prev.map((u) =>
        String(u.id) === String(id)
          ? {
              ...u,
              tipoDocumento: formData.documentType,
              numeroDocumento: formData.documentNumber,
              nombreCompleto: formData.name,
              correo: formData.email,
              rolId: parseInt(formData.role),
              sedeId: parseInt(formData.sede),
            }
          : u,
      ),
    );
  };

  const deleteEmployee = async (id) => {
    setAllUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
  };

  const toggleEmployee = (id) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        String(u.id) === String(id) ? { ...u, estado: !u.estado } : u,
      ),
    );
  };

  return {
    employees, // todos menos Gerente y Admin
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployee,
  };
};

export default useEmployees;