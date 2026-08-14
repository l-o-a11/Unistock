import React from "react";
import RolForm from "../components/RolForm";

const EditRolPage = ({ rol, roles = [], updateRol, onClose }) => {
  // ✅ Recibe el rol directo desde RolesPage — sin hook propio
  // Así comparte exactamente el mismo estado que la tabla

  const handleSubmit = async (rolData) => {
    await updateRol(rolData);
    onClose();
  };

  if (!rol) return null;

  return (
    <RolForm
      rol={rol}
      roles={roles}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  );
};

export default EditRolPage;