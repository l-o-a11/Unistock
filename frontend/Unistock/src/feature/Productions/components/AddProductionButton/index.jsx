import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductionForm from "../ProductionForm";
import ProduccionCalendario from "../ProductionCalender";


const AddProductionButton = ({
  productions = [],
  onCreateProduction,
  onFilterByDate,
}) => {
  const navigate = useNavigate();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  /**
   * Open create production modal
   */
  const handleAddProduction = () => {
    setShowCreateForm(true);
  };

  /**
   * Close create modal
   */
  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  /**
   * Close calendar modal
   */
  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  /**
   * Create production
   */
  const createProduction = (data) => {
    if (onCreateProduction) {
      onCreateProduction(data);
    }
    setShowCreateForm(false);
  };

  /**
   * Filter production by date
   */
  const calendarProduction = (date) => {
    if (onFilterByDate) {
      onFilterByDate(date);
    }
    setShowCalendar(false);
  };

  /**
   * Descargar PDF básico
   */
  const handleDownloadPdf = () => {
    const content = `
REPORTE DE ÓRDENES

${productions
        .map(
          (p, index) => `
Orden #${index + 1}
Producto: ${p.producto || "N/A"}
Cantidad: ${p.cantidad || "N/A"}
Fecha: ${p.fecha || "N/A"}
-----------------------------`
        )
        .join("\n")}
`;

    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ordenes_produccion.pdf";
    link.click();
  };

  /**
   * Toggle calendar
   */
  const handleCalendarClick = () => {
    setShowCalendar(true);
  };

  const baseButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    minWidth: "400px",
    maxWidth: "600px",
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* BOTÓN PRINCIPAL */}
        <button
          onClick={handleAddProduction}
          style={{
            ...baseButtonStyle,
            backgroundColor: "#FF4FD6",
            color: "#fff",
            border: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#C9187A")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#FF4FD6")
          }
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Agregar Producción
        </button>

        {/* BOTÓN PDF */}
        <button
          onClick={handleDownloadPdf}
          style={{
            ...baseButtonStyle,
            padding: "10px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            color: "#555",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </button>

        {/* BOTÓN CALENDARIO */}
        <button
          onClick={handleCalendarClick}
          style={{
            ...baseButtonStyle,
            padding: "10px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            color: "#555",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {/* CALENDARIO MODAL */}
      {showCalendar && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <ProduccionCalendario
              onClose={handleCloseCalendar}   // ← prop que sí lee el componente
            />
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <ProductionForm
              onSubmit={createProduction}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductionButton;