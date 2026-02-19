import React from "react";
import RolesForm from "../components/RolForm";



const CreateRolPage = ({ onClose, createRol }) => {
  const handleSubmit = async (rolData) => {
    await createRol(rolData); // esto actualiza el mismo estado que la tabla
    onClose();
  };

  return <RolesForm
   onSubmit={handleSubmit} 
   onCancel={onClose} />;
};


export default CreateRolPage;


