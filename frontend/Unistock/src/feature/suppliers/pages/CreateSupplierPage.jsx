import React from "react";
import { useNavigate } from "react-router-dom";
import { useSuppliers } from "../hooks/mockSuppliers";
import SupplierForm from "../components/SupplierForm";

const CreateSupplierPage = () => {
  const navigate = useNavigate();
  const { createSupplier } = useSuppliers();

  const handleSubmit = async (supplierData) => {
    try {
      await createSupplier(supplierData);
      navigate("/proveedores");
    } catch (error) {
      console.error("Error al crear el proveedor:", error);
    }
  };

  return (
      <div style={overlayStyle}>
          <div style={modalStyle}>
      <SupplierForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/proveedores")}
      />
    </div>
     </div>
  );
};

export default CreateSupplierPage;
