import React, { useState, useEffect } from "react";
import { useRoles } from "../hooks/useRoles";
import RolForm from "../components/RolForm";

const EditRolPage = ({ rolId, onClose }) => {
  const { roles, updateRol } = useRoles();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const found = roles.find((r) => r.id === rolId);
    setRol(found || null);
  }, [rolId, roles]);

  const handleSubmit = async (rolData) => {
    try {
      await updateRol(rolId, rolData);
      onClose();
    } catch (error) {
      console.error("Error al actualizar rol:", error);
    }
  };

  if (!rol) return null;

  return (
    <RolForm
      rol={rol}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
};

export default EditRolPage;
