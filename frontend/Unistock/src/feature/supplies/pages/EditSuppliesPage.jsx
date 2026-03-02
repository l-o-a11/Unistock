import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import SupplyForm from "../components/SupplyForm";

const EditSuppliesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    supplies,
    updateSupply,
    medidas,
    propiedades,
    loading
  } = useSupplies();

  const [supply, setSupply] = useState(null);

  useEffect(() => {
    const found = supplies.find(s => s.id === parseInt(id));
    if (found) {
      setSupply(found);
    }
  }, [id, supplies]);

  const handleSubmit = async (data) => {
    try {
      await updateSupply(parseInt(id), data);
      navigate("/supplies");
    } catch (error) {
      console.error(error);
    }
  };

  if (!supply) return <p>Cargando...</p>;

  return (
    <SupplyForm
      initialData={supply}
      onSubmit={handleSubmit}
      medidas={medidas}
      propiedades={propiedades}
      loading={loading}
    />
  );
};

export default EditSuppliesPage;