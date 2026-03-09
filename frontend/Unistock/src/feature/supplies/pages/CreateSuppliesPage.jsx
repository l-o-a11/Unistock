import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import SupplyForm from "../components/SupplyForm";
import Alert from "../components/Alert";
import {
  CATEGORIAS_PREDETERMINADAS,
  MEDIDAS_PREDETERMINADAS,
  PROPIEDADES_PREDETERMINADAS,
} from "../services/supplyAPI";

const CreateSuppliesPage = () => {
  const navigate = useNavigate();
  const { createSupply, loading } = useSupplies();

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = ({ type, title, message, onConfirm = null }) => {
    setAlertConfig({ open: false, type, title, message, onConfirm });
    setTimeout(() => setAlertConfig((prev) => ({ ...prev, open: true })), 50);
  };

  const handleSubmit = async (data) => {
    try {
      await createSupply(data);
      showAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Insumo creado correctamente",
        onConfirm: () => navigate("/supplies"),
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error.message || "No se pudo crear el insumo",
      });
    }
  };

  const handleCancel = () => {
    showAlert({
      type: "confirm",
      title: "Cancelar creación",
      message: "¿Seguro que deseas cancelar? Los datos ingresados se perderán.",
      onConfirm: () => navigate("/supplies"),
    });
  };

  return (
    <>
      <SupplyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        categorias={CATEGORIAS_PREDETERMINADAS}
        medidas={MEDIDAS_PREDETERMINADAS}
        propiedades={PROPIEDADES_PREDETERMINADAS}
        loading={loading}
      />

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          closeAlert();
        }}
        onCancel={closeAlert}
      />
    </>
  );
};

export default CreateSuppliesPage;