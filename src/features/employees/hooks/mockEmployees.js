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
    const payload = {
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.name,
      correo: formData.email,
      rolId: formData.role,
      sedeId: formData.sede,
    };

    // Solo incluir cargos si el rol seleccionado requiere cargos.
    // Para Administrador/Gerente no tiene sentido enviar cargos.
    if (Array.isArray(formData.cargos) && formData.cargos.length > 0) {
      payload.cargos = formData.cargos;
    }

    const result = await userAPI.create(payload);
    // Refetch para que el nuevo empleado aparezca con todos sus datos resueltos
    await fetchEmployees();
    return result;
  };

  const updateEmployee = async (id, formData) => {
    // Solo incluir `cargos` si el rol seleccionado es "Empleado".
    // Para roles como Administrador/Gerente, el campo cargo no aplica
    // y enviarlo vacío (aunque el backend ya lo maneje mejor) evita
    // escrituras innecesarias en BD.
    const payload = {
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.name,
      correo: formData.email,
      rolId: formData.role,
      sedeId: formData.sede,
    };

    // Detectar si el rolId corresponde a "Empleado" consultando catálogo local
    // Nota: no tenemos roles aquí, así que delegamos la decisión al backend
    // que ya sabe ignorar cargo cuando el rol no lo requiere.
    // IMPORTANTE: se envía `cargos` SIEMPRE (incluso como arreglo vacío).
    // Antes solo se incluía cuando tenía elementos, lo que hacía imposible
    // quitarle todos los cargos a un empleado desde el formulario: al
    // deseleccionar todos, el payload omitía `cargos` y el backend
    // conservaba el valor anterior en BD (ver UpdateUser.execute, que sí
    // sabe limpiar el campo si se le manda `cargo`/`cargos` explícito).
    payload.cargos = Array.isArray(formData.cargos) ? formData.cargos : [];

    const updated = await userAPI.update(id, payload);
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