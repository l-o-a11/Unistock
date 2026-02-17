import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useThird_parties } from "../hooks/mockThird_parties"; // 👈 este es el hook correcto
import Third_partieForm from "../components/Third_partiesForm";

const EditThird_partiePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { Third_parties, updateThird_partie } = useThird_parties();

  const [Third_partie, setThird_partie] = useState(null);

  useEffect(() => {
    // 🔥 convertir id a string para comparar correctamente
    const found = Third_parties.find((p) => String(p.id) === String(id));
    setThird_partie(found);
  }, [id, Third_parties]);

  const handleSubmit = async (Third_partieData) => {
    try {
      await updateThird_partie(id, Third_partieData);
      navigate("/terceros");
    } catch (error) {
      console.error("Error al actualizar tercero:", error);
    }
  };

  // ⏳ LOADING
  if (!Third_partie) {
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
            Cargando tercero...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Third_partieForm
        Third_partie={Third_partie}     
        onSubmit={handleSubmit}
        onCancel={() => navigate("/terceros")}
      />
    </div>
  );
};

export default EditThird_partiePage;
