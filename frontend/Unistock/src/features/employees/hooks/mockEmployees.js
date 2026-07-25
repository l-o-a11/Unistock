// src/features/employees/hooks/mockEmployees.js
// Usa GET /users?excludeRoleNames=Gerente,Administrador
// El filtro lo hace MongoDB directamente — sin depender de rolNombre en frontend.

import { useState, useEffect, useCallback } from "react";
import { userAPI } from "../../users/services/usersAPI";

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userAPI.getEmployees();
      setEmployees(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const createEmployee = async (formData) => {
    const result = await userAPI.create({
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.name,
      correo: formData.email,
      rolId: formData.role,
      sedeId: formData.sede,
      cargos: Array.isArray(formData.cargos) ? formData.cargos : [],
    });
    // Refetch para que el nuevo empleado aparezca con todos sus datos resueltos
    await fetchEmployees();
    return result;
  };

  const updateEmployee = async (id, formData) => {
    const updated = await userAPI.update(id, {
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.name,
      correo: formData.email,
      rolId: formData.role,
      sedeId: formData.sede,
      cargos: Array.isArray(formData.cargos) ? formData.cargos : [],
    });
    await fetchEmployees();
    return updated;
  };

  const deleteEmployee = async (id) => {
    await userAPI.delete(id);
    setEmployees((prev) => prev.filter((u) => String(u.id) !== String(id)));
  };

  const toggleEmployee = async (id) => {
    const updated = await userAPI.toggleStatus(id);
    setEmployees((prev) =>
      prev.map((u) => (String(u.id) === String(id) ? updated : u))
    );
    return updated;
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployee,
    refetch: fetchEmployees,
  };
};

export default useEmployees;