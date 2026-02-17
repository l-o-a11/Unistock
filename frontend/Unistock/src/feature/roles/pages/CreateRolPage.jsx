import React from "react";
import { useRoles } from "../hooks/useRoles";
import RolesForm from "../components/RolForm";

const CreateRolPage = ({ onClose }) => {
  const { createRol } = useRoles();

  const handleSubmit = async (rolData) => {
    try {
      await createRol(rolData);
      onClose(); // cerrar modal
    } catch (error) {
      console.error("Error al crear el rol:", error);
    }
  };

  return (
    <RolesForm
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
};

export default CreateRolPage;
