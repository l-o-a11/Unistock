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
  const [showCalendar,   setShowCalendar]   = useState(false);

  const createProduction = (data) => {
    if (onCreateProduction) onCreateProduction(data);
    setShowCreateForm(false);
  };

  // ── PDF — usa importación dinámica para evitar errores de módulo ──────────
  const handleDownloadPdf = async () => {
    try {
      const { jsPDF }    = await import("jspdf");
      const autoTable    = (await import("jspdf-autotable")).default;

      const doc   = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M     = 14; // margin

      const C = {
        pink:     [236, 72, 153],
        pinkBg:   [252, 231, 243],
        pinkText: [190, 24, 93],
        grayHead: [245, 245, 247],
        grayText: [55, 65, 81],
        grayLight:[156, 163, 175],
        border:   [229, 231, 235],
        white:    [255, 255, 255],
        redBg:    [254, 226, 226],
        redText:  [185, 28, 28],
      };

      const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

      // ── Cabecera ──────────────────────────────────────────────────────────
      doc.setFillColor(...C.pink);
      doc.rect(0, 0, pageW, 30, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(...C.white);
      doc.text("Órdenes de Producción", M, 16);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado: ${today}`, pageW - M, 16, { align: "right" });

      const total    = productions.length;
      const activas  = productions.filter(p => p.status !== "Anulada").length;
      const anuladas = productions.filter(p => p.status === "Anulada").length;
      doc.text(`Total: ${total}   Activas: ${activas}   Anuladas: ${anuladas}`, M, 24);

      let y = 38;

      if (productions.length === 0) {
        doc.setTextColor(...C.grayLight);
        doc.setFontSize(12);
        doc.text("No hay órdenes para mostrar.", pageW / 2, y + 20, { align: "center" });
      }

      productions.forEach((prod, idx) => {
        const details   = Array.isArray(prod.details) ? prod.details : [];
        const history   = Array.isArray(prod.history) ? prod.history : [];
        const anulEntry = [...history].reverse().find(h => h.status === "Anulada");

        // Espacio estimado
        const needed = 30 + (details.length > 0 ? 18 + details.length * 8 : 0) + (anulEntry ? 14 : 0) + 8;
        if (y + needed > pageH - 20) { doc.addPage(); y = 18; }

        // Cabecera de orden
        doc.setFillColor(...C.grayHead);
        doc.roundedRect(M, y, pageW - M * 2, 11, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C.grayText);
        doc.text(`Orden #${prod.orderNumber}  ·  ${prod.client || "—"}`, M + 3, y + 7.5);

        // Badge estado
        const statusTxt = String(prod.status || "—");
        const bW = 42, bX = pageW - M - bW;
        doc.setFillColor(...C.pinkBg);
        doc.roundedRect(bX, y + 1.5, bW, 8, 2, 2, "F");
        doc.setFontSize(8);
        doc.setTextColor(...C.pinkText);
        doc.text(statusTxt, bX + bW / 2, y + 7, { align: "center" });
        y += 14;

        // Tabla principal
        autoTable(doc, {
          startY: y,
          margin: { left: M, right: M },
          head: [["Producto / Artículo", "Cantidad", "Color", "Fecha entrega", "Fecha estado"]],
          body: [[
            String(prod.producto     ?? prod.referencia  ?? "N/A"),
            String(prod.quantity     ?? prod.cantidad    ?? "N/A"),
            String(prod.color        ?? "N/A"),
            String(prod.deliveryDate ?? prod.fechaEntrega ?? "N/A"),
            String(prod.statusDate   ?? prod.fechaEstado  ?? "N/A"),
          ]],
          headStyles: { fillColor: [...C.grayHead], textColor: [...C.grayLight], fontStyle: "bold", fontSize: 8, cellPadding: 2.5, lineColor: [...C.border], lineWidth: 0.2 },
          bodyStyles: { fontSize: 9, textColor: [...C.grayText], cellPadding: 3, lineColor: [...C.border], lineWidth: 0.2 },
          theme: "plain",
        });
        y = doc.lastAutoTable.finalY + 2;

        // Tabla de artículos/detalles
        if (details.length > 0) {
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...C.grayLight);
          doc.text("ARTÍCULOS", M + 3, y + 4);
          y += 7;

          autoTable(doc, {
            startY: y,
            margin: { left: M + 4, right: M },
            head: [["Ref_corte", "Ref", "Estado", "Fecha", "Cantidad", "Color"]],
            body: details.map(d => [
              String(d.refCorte   ?? "N/A"),
              String(d.ref        ?? "N/A"),
              String(d.status     ?? "N/A"),
              String(d.statusDate ?? "N/A"),
              String(d.quantity   ?? "N/A"),
              String(d.color      ?? "N/A"),
            ]),
            headStyles: { fillColor: [243,244,246], textColor: [...C.grayLight], fontStyle: "bold", fontSize: 7, cellPadding: 2, lineColor: [...C.border], lineWidth: 0.2 },
            bodyStyles: { fontSize: 8, textColor: [...C.grayText], cellPadding: 2, lineColor: [...C.border], lineWidth: 0.2 },
            theme: "plain",
          });
          y = doc.lastAutoTable.finalY + 2;
        }

        // Bloque de anulación
        if (anulEntry && anulEntry.motivo) {
          if (y + 14 > pageH - 20) { doc.addPage(); y = 18; }
          doc.setFillColor(...C.redBg);
          doc.roundedRect(M, y, pageW - M * 2, 12, 2, 2, "F");
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...C.redText);
          doc.text(`Anulada el ${anulEntry.date}  |  Motivo: `, M + 3, y + 8);
          doc.setFont("helvetica", "normal");
          const labelW = doc.getTextWidth(`Anulada el ${anulEntry.date}  |  Motivo: `);
          doc.text(String(anulEntry.motivo), M + 3 + labelW, y + 8);
          y += 15;
        }

        y += 5;

        // Separador
        if (idx < productions.length - 1) {
          doc.setDrawColor(...C.border);
          doc.setLineWidth(0.3);
          doc.line(M, y - 2, pageW - M, y - 2);
          y += 2;
        }
      });

      // Pie de página
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...C.pink);
        doc.setLineWidth(0.4);
        doc.line(M, pageH - 14, pageW - M, pageH - 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.grayLight);
        doc.text("Sistema de Gestión de Producción", M, pageH - 8);
        doc.text(`Página ${i} de ${totalPages}`, pageW - M, pageH - 8, { align: "right" });
      }

      doc.save("ordenes_produccion.pdf");
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF. Verifica que jspdf y jspdf-autotable estén instalados.");
    }
  };

  const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: "7px", padding: "9px 16px", borderRadius: "8px",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
    transition: "background-color 0.15s",
  };

  const overlayStyle = {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050,
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* CREAR */}
        <button onClick={() => setShowCreateForm(true)}
          style={{ ...btnBase, backgroundColor: "#FF4FD6", color: "#fff", border: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C9187A")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF4FD6")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Agregar
        </button>

        {/* PDF */}
        <button onClick={handleDownloadPdf} title="Descargar PDF"
          style={{ ...btnBase, padding: "9px 12px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", color: "#555" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <polyline points="9,15 12,18 15,15"/>
          </svg>
          PDF
        </button>

        {/* CALENDARIO */}
        <button onClick={() => setShowCalendar(true)} title="Abrir calendario"
          style={{ ...btnBase, padding: "9px 12px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", color: "#555" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
      </div>

      {/* CALENDARIO MODAL */}
      {showCalendar && (
        <div style={overlayStyle} onClick={() => setShowCalendar(false)}>
          <div style={{ background: "#fff", borderRadius: 14, width: "92%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}>
            <ProduccionCalendario
              onClose={() => setShowCalendar(false)}
              productions={[]}
            />
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateForm && (
        <div style={overlayStyle} onClick={() => setShowCreateForm(false)}>
          <div style={{ background: "#fff", borderRadius: 12, width: "92%", maxWidth: 660, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <ProductionForm onSubmit={createProduction} onCancel={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductionButton;
