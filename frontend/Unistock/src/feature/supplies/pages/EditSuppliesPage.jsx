import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import SupplyForm from "../components/SupplyForm";
import Alert from "../components/Alert";

const EditSuppliesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { supplies, updateSupply, categorias, medidas, propiedades, loading } =
    useSupplies();

  const [supply, setSupply] = useState(null);

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

  useEffect(() => {
    const found = supplies.find((s) => s.id === parseInt(id));
    if (found) setSupply(found);
  }, [id, supplies]);

  const handleSubmit = async (data) => {
    try {
      await updateSupply(parseInt(id), data);
      showAlert({
        type: "success",
        title: "Actualizado",
        message: "El insumo se actualizó correctamente",
        onConfirm: () => navigate("/supplies"),
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error.message || "No se pudo actualizar el insumo",
      });
    }
  };

  const handleCancel = () => {
    showAlert({
      type: "confirm",
      title: "Cancelar edición",
      message: "¿Seguro que deseas cancelar? Los cambios no guardados se perderán.",
      onConfirm: () => navigate("/supplies"),
    });
  };

  if (!supply) return <p>Cargando...</p>;

  return (
    <>
      <SupplyForm
        initialData={supply}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        categorias={categorias}
        medidas={medidas}
        propiedades={propiedades}
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

export default EditSuppliesPage;