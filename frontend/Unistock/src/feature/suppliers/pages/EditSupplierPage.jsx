import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSuppliers } from "../hooks/mockSuppliers"; // 👈 este es el hook correcto
import SupplierForm from "../components/SupplierForm";

const EditSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { suppliers, updateSupplier } = useSuppliers();

  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    // 🔥 convertir id a string para comparar correctamente
    const found = suppliers.find((p) => String(p.id) === String(id));
    setSupplier(found);
  }, [id, suppliers]);

  const handleSubmit = async (supplierData) => {
    try {
      await updateSupplier(id, supplierData);
      navigate("/proveedores");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
    }
  };

  // ⏳ LOADING
  if (!supplier) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF4FD6"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: "spin 0.9s linear infinite" }}
          >
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>

          <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
            Cargando proveedor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
          <div style={modalStyle}>
      <SupplierForm
         supplier={supplier}     
        onSubmit={handleSubmit}
        onCancel={() => navigate("/proveedores")}
      />
    </div>
    
    </div>
  );
};

export default EditSupplierPage;
