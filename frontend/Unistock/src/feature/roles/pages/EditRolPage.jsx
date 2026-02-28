import React, { useState, useEffect } from "react";
import { useRoles } from "../hooks/useRoles";
import RolForm from "../components/RolForm";

const EditRolPage = ({ rolId, onClose }) => {
  const { roles, updateRol } = useRoles();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const found = roles.find((rol) => rol.id === rolId);
    setRol(found);
  }, [rolId, roles]);

  const handleSubmit = async (rolData) => {
  // combinamos los cambios con el rol original
  const updatedRol = { rolId, rolData };
  await updateRol(rolId, updatedRol);
  onClose();
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
