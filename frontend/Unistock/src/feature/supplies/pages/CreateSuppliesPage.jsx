import React from "react";
import { useNavigate } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import SupplyForm from "../components/SupplyForm";
import { CATEGORIAS_PREDETERMINADAS, MEDIDAS_PREDETERMINADAS, PROPIEDADES_PREDETERMINADAS } from "../services/supplyAPI";



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
      categorias={CATEGORIAS_PREDETERMINADAS}
      medidas={MEDIDAS_PREDETERMINADAS}
      propiedades={PROPIEDADES_PREDETERMINADAS}
      loading={loading}
    />
  );
};

export default CreateSuppliesPage;