import React from "react";
import RolesForm from "../components/RolForm";



const CreateRolPage = ({ onClose, createRol, roles = [] }) => {
  const handleSubmit = async (rolData) => {
    await createRol(rolData); // esto actualiza el mismo estado que la tabla
    onClose();
  };

  return <RolesForm
   roles={roles}
   onSubmit={handleSubmit} 
   onCancel={onClose} />;
};


export default CreateRolPage;

