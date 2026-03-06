import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductionForm from "../ProductionForm";
import ProduccionCalendario from "../ProductionCalender";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;

  const PINK       = [236, 72, 153];
  const PINK_BADGE = [252, 231, 243];
  const PINK_TEXT  = [190, 24, 93];
  const GRAY_HEAD  = [249, 250, 251];
  const GRAY_TEXT  = [75, 85, 99];
  const GRAY_LIGHT = [156, 163, 175];
  const BORDER     = [229, 231, 235];

  // Logo
  doc.setFillColor(...PINK);
  doc.circle(margin + 6, 18, 7, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.7);
  doc.rect(margin + 2.8, 16.5, 6.4, 5, "S");
  doc.line(margin + 2.8, 16.5, margin + 1,  14.5);
  doc.line(margin + 9.2, 16.5, margin + 11, 14.5);
  doc.line(margin + 4.5, 16.5, margin + 6,  15.2);
  doc.line(margin + 7.5, 16.5, margin + 6,  15.2);

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...GRAY_TEXT);
  doc.text("Órdenes de Producción", margin + 16, 20);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, 28, pageW - margin, 28);

  let y = 36;

  productions.forEach((prod, idx) => {
    const details = Array.isArray(prod.details) ? prod.details : [];
    const estimatedH = 20 + (details.length > 0 ? 12 + details.length * 9 : 0) + 8;
    if (y + estimatedH > pageH - 30) { doc.addPage(); y = 20; }

    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      tableWidth: pageW - margin * 2,
      head: [["Orden", "Cantidad", "Fecha de entrega", "Estado", "Fecha de estado", "Cliente"]],
      body: [[
        String(prod.orderNumber  ?? prod.orden        ?? idx + 1),
        String(prod.cantidad     ?? prod.quantity     ?? "N/A"),
        String(prod.fechaEntrega ?? prod.deliveryDate ?? "N/A"),
        String(prod.status       ?? prod.estado       ?? "N/A"),
        String(prod.statusDate   ?? prod.fechaEstado  ?? "N/A"),
        String(prod.cliente      ?? prod.client       ?? "N/A"),
      ]],
      headStyles: { fillColor: [...GRAY_HEAD], textColor: [...GRAY_TEXT], fontStyle: "bold", fontSize: 9, lineColor: [...BORDER], lineWidth: 0.3, cellPadding: 3 },
      bodyStyles: { fontSize: 9, textColor: [...GRAY_TEXT], lineColor: [...BORDER], lineWidth: 0.3, cellPadding: 3.5 },
      didDrawCell(data) {
        if (data.section === "body" && data.column.index === 3) {
          const { x, y: cy, width, height } = data.cell;
          const badgeW = Math.min(width - 4, 28);
          const badgeX = x + (width - badgeW) / 2;
          doc.setFillColor(...PINK_BADGE);
          doc.roundedRect(badgeX, cy + 1.5, badgeW, height - 3, 2, 2, "F");
          doc.setTextColor(...PINK_TEXT);
          doc.setFontSize(8);
          doc.text(String(data.cell.raw), badgeX + badgeW / 2, cy + height / 2 + 1, { align: "center" });
        }
      },
      theme: "plain",
    });

    y = doc.lastAutoTable.finalY + 2;

    if (details.length > 0) {
      doc.autoTable({
        startY: y,
        margin: { left: margin + 2, right: margin },
        tableWidth: pageW - margin * 2 - 2,
        head: [["Ref_corte", "Ref", "Estado", "Fecha de estado", "Cantidad"]],
        body: details.map((d) => [
          String(d.refCorte ?? "N/A"), String(d.ref ?? "N/A"),
          String(d.status ?? d.estado ?? "N/A"),
          String(d.statusDate ?? d.fechaEstado ?? "N/A"),
          String(d.quantity ?? d.cantidad ?? "N/A"),
        ]),
        headStyles: { fillColor: [243, 244, 246], textColor: [...GRAY_LIGHT], fontStyle: "bold", fontSize: 8, lineColor: [...BORDER], lineWidth: 0.3, cellPadding: 2.5 },
        bodyStyles: { fontSize: 8, textColor: [...GRAY_TEXT], lineColor: [...BORDER], lineWidth: 0.3, cellPadding: 2.5 },
        didDrawCell(data) {
          if (data.section === "body" && data.column.index === 2) {
            const { x, y: cy, width, height } = data.cell;
            const badgeW = Math.min(width - 4, 28);
            const badgeX = x + (width - badgeW) / 2;
            doc.setFillColor(...PINK_BADGE);
            doc.roundedRect(badgeX, cy + 1.2, badgeW, height - 2.5, 2, 2, "F");
            doc.setTextColor(...PINK_TEXT);
            doc.setFontSize(7);
            doc.text(String(data.cell.raw), badgeX + badgeW / 2, cy + height / 2 + 0.8, { align: "center" });
          }
        },
        theme: "plain",
      });
      y = doc.lastAutoTable.finalY + 2;
    }
    y += 6;
  });

  // Pie de página
  const totalPages = doc.internal.getNumberOfPages();
  const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PINK);
    doc.setLineWidth(0.5);
    doc.line(margin, pageH - 22, pageW - margin, pageH - 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_LIGHT);
    doc.text(`Generado el ${today}`, margin, pageH - 16);
    doc.text(`✉  info@tuempresa.com`, margin, pageH - 11);
    doc.text(`✆  (123) 456-7890`, margin, pageH - 6);
    doc.text(`Página ${i}`, pageW - margin, pageH - 6, { align: "right" });
  }

  doc.save("ordenes_produccion.pdf");
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