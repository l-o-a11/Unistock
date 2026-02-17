import React from "react";
import { useNavigate } from "react-router-dom";
import { useThird_parties } from "../hooks/mockThird_parties";
import Third_partieForm from "../components/Third_partiesForm";

const CreateThird_partiePage = () => {
  const navigate = useNavigate();
  const { createThird_partie } = useThird_parties();

  const handleSubmit = async (Third_partieData) => {
    try {
      await createThird_partie(Third_partieData);
      navigate("/terceros");
    } catch (error) {
      console.error("Error al crear el tercero:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Third_partieForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/terceros")}
      />
    </div>
  );
};

export default CreateThird_partiePage;
