import React from "react";
import { useNavigate } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import SupplyForm from "../components/SupplyForm";

const CreateSuppliesPage = () => {
  const navigate = useNavigate();
  const {
    createSupply,
    medidas,
    propiedades,
    loading
  } = useSupplies();

  const handleSubmit = async (data) => {
    try {
      await createSupply(data);
      navigate("/supplies");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SupplyForm
      onSubmit={handleSubmit}
      medidas={medidas}
      propiedades={propiedades}
      loading={loading}
    />
  );
};

export default CreateSuppliesPage;