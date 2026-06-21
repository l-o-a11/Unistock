import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useShoppings } from "../hooks/useShoppings";
import { shoppingAPI } from "../services/shoppingAPI";
import ShoppingTable from "../components/ShoppingTable";
import SearchInput from "../../shared/components/SearchInput";
import AddShoppingButton from "../components/AddShoppingButton";
import ShoppingForm from "../components/ShoppingForm";
import ShoppingDetail from "../components/ShoppingDetail";
import Alert from "../../shared/components/Alert";
import { useSuppliers } from "../../suppliers/hooks/mockSuppliers";

const ShoppingsPage = () => {
  const { suppliers } = useSuppliers();

  // ✅ FIX: sin parseInt — proveedorId vendrá como string desde MongoDB
  const getProveedorNombre = (proveedorId) =>
    suppliers.find((s) => String(s.id) === String(proveedorId))?.nombreEmpresa ?? "—";

  const { shoppings, createShopping, anularShopping } = useShoppings();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShopping, setSelectedShopping] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  // ── Modal de descarga (elegir Excel o PDF) ────────────────────────────────
  // Igual patrón que ProductionPage: un booleano controla si el modal se ve.
  const [downloadModal, setDownloadModal] = useState(false);

  // ── Modal anulación con motivo ────────────────────────────────────────────
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, motivo: "" });
  const [motivoError, setMotivoError] = useState("");

  const openCancelModal = (id) => { setCancelModal({ open: true, id, motivo: "" }); setMotivoError(""); };
  const closeCancelModal = () => { setCancelModal({ open: false, id: null, motivo: "" }); setMotivoError(""); };

  // ── Alert global ─────────────────────────────────────────────────────────
  const [alertConfig, setAlertConfig] = useState({
    open: false, type: "success", title: "", message: "", onConfirm: null,
  });
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  // ── Filtrado y paginación ─────────────────────────────────────────────────
  const filteredShoppings = shoppings.filter((p) => {
    const text = searchTerm.toLowerCase();

    const coincideBusqueda =
      p.id?.toString().includes(searchTerm) ||
      p.numeroFactura?.toLowerCase().includes(text) ||
      p.proveedor?.toLowerCase().includes(text) ||
      p.observaciones?.toLowerCase().includes(text) ||
      p.motivoAnulacion?.toLowerCase().includes(text) ||
      p.costoTotal?.toString().includes(searchTerm) ||
      p.fecha?.includes(searchTerm);

    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && !p.anulada) ||
      (estadoFiltro === "inactivos" && p.anulada);

    return coincideBusqueda && coincideEstado;
  });

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredShoppings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShoppings = filteredShoppings.slice(startIndex, startIndex + itemsPerPage);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleView = async (shopping) => {
    try {
      const response = await shoppingAPI.getById(shopping.id);
      const full = response?.data ?? response;
      const normalizado = {
        ...full,
        id: full._id ?? full.id,
        costoTotal: full.total ?? full.costoTotal,
        detalles: (full.detalles || []).map((d) => ({
          ...d,
          id: d._id ?? d.id,
          costoUnitario: d.precioUnitario ?? 0,
          costo: d.subtotal ?? 0,
        })),
      };
      setSelectedShopping(normalizado);
    } catch {
      setSelectedShopping(shopping);
    }
  };

  const handleAnular = (id) => {
    const shopping = shoppings.find((p) => p.id === id);
    if (shopping?.anulada) {
      showAlert("error", "Compra ya anulada", `La factura "${shopping?.numeroFactura || id}" ya fue anulada anteriormente.`);
      return;
    }
    openCancelModal(id);
  };

  const confirmAnular = async () => {
    if (!cancelModal.motivo.trim()) {
      setMotivoError("El motivo de anulación es obligatorio");
      return;
    }
    const shopping = shoppings.find((p) => p.id === cancelModal.id);
    try {
      await anularShopping(cancelModal.id, cancelModal.motivo.trim());
      closeCancelModal();
      showAlert("success", "Compra anulada", `La factura "${shopping?.numeroFactura || cancelModal.id}" fue anulada correctamente.`);
    } catch {
      closeCancelModal();
      showAlert("error", "Error", "No se pudo anular la compra. Intenta nuevamente.");
    }
  };

  const handleCreateSubmit = async (shoppingData) => {
    try {
      await createShopping(shoppingData);
      setShowCreateForm(false);
      showAlert("success", "Compra registrada", `Factura "${shoppingData.numeroFactura}" creada correctamente.`);
    } catch (error) {
      showAlert("error", "Error al crear", error.message || "No se pudo registrar la compra.");
    }
  };

  const handleDownloadExcel = () => {
    setDownloadModal(false); // cierra el modal de selección al elegir
    try {
      const data = filteredShoppings.map((p) => ({
        "ID": p.id,
        "Fecha": p.fecha,
        "N° Factura": p.numeroFactura || "—",
        "Proveedor": getProveedorNombre(p.proveedorId) || p.proveedor || "—",
        "Observaciones": p.observaciones || "—",
        "Costo Total": p.costoTotal ?? 0,
        "Estado": p.anulada ? "Anulada" : "Activa",
        "Motivo anulación": p.motivoAnulacion || "—",
        "Fecha anulación": p.fechaAnulacion || "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet["!cols"] = [
        { wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 28 },
        { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 18 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Compras");
      const fecha = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `compras_${fecha}.xlsx`);
      showAlert("success", "¡Éxito!", "Archivo exportado correctamente.");
    } catch (error) {
      console.error("Error al exportar:", error);
      showAlert("error", "¡Error!", "No se pudo exportar el archivo.");
    }
  };

  // ── Exportar a PDF ─────────────────────────────────────────────────────────
  // Mismo patrón que ProductionPage.handleDownloadPDF:
  // 1) Construye un documento HTML completo como string (con su propio <style>)
  // 2) Lo abre en una pestaña nueva con window.open
  // 3) Llama a print() — el usuario elige "Guardar como PDF" en el diálogo del navegador
  const handleDownloadPDF = () => {
    setDownloadModal(false);

    const now = new Date();
    const fecha = now.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const hora = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

    // esc(): escapa caracteres especiales de HTML para evitar romper el documento
    // si una observación contiene < > & etc.
    const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Colores de badge según el estado de la compra — mismo concepto que
    // statusColor() en producción, pero solo dos estados posibles aquí.
    const estadoColor = (anulada) =>
      anulada
        ? { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" } // Anulada → rojo
        : { bg: "#dcfce7", color: "#166534", dot: "#22c55e" }; // Activa  → verde

    // Total general — suma de costoTotal de todas las compras filtradas
    const totalGeneral = filteredShoppings.reduce((sum, p) => sum + (Number(p.costoTotal) || 0), 0);
    const totalAnuladas = filteredShoppings.filter((p) => p.anulada).length;
    const totalActivas = filteredShoppings.length - totalAnuladas;

    // Construir una fila <tr> por cada compra
    const tableRows = filteredShoppings.map((p, i) => {
      const ec = estadoColor(p.anulada);
      return `
        <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="td-id"><span class="id-num">#${esc(p.consecutivo ?? p.id)}</span></td>
          <td class="td-factura">${esc(p.numeroFactura || '—')}</td>
          <td class="td-proveedor">${esc(getProveedorNombre(p.proveedorId) || p.proveedor || '—')}</td>
          <td class="td-fecha">${esc(p.fecha || '—')}</td>
          <td class="td-obs">${esc(p.observaciones || '—')}</td>
          <td class="td-total">$${Number(p.costoTotal || 0).toLocaleString('es-CO')}</td>
          <td class="td-estado">
            <span class="status-badge" style="background:${ec.bg};color:${ec.color};">
              <span class="status-dot" style="background:${ec.dot};"></span>
              ${p.anulada ? 'Anulada' : 'Activa'}
            </span>
          </td>
        </tr>`;
    }).join('');

    // Documento HTML completo — incluye su propio <style> porque se abre
    // en una ventana/pestaña aparte, sin acceso a los estilos de la app.
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Compras — ${fecha}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
          body { padding: 32px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #FF4FD6; padding-bottom: 16px; }
          .header h1 { font-size: 24px; font-weight: 800; color: #1f2937; }
          .header p { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .summary { display: flex; gap: 16px; margin-bottom: 20px; }
          .summary-card { flex: 1; background: #f9fafb; border-radius: 10px; padding: 12px 16px; border: 1px solid #f0f0f0; }
          .summary-card .label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }
          .summary-card .value { font-size: 20px; font-weight: 800; color: #1f2937; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #fdf2f8; color: #831843; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #fbcfe8; }
          td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
          .row-even { background: #fff; }
          .row-odd  { background: #fafafa; }
          .id-num { font-weight: 700; color: #FF4FD6; }
          .td-total { font-weight: 700; text-align: right; }
          th:last-child, .td-total, .td-estado { text-align: right; }
          .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
          .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
          .footer { margin-top: 16px; font-size: 11px; color: #9ca3af; text-align: center; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Reporte de Compras</h1>
            <p>Generado el ${fecha} a las ${hora}</p>
          </div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Total compras</div>
            <div class="value">${filteredShoppings.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Activas</div>
            <div class="value">${totalActivas}</div>
          </div>
          <div class="summary-card">
            <div class="label">Anuladas</div>
            <div class="value">${totalAnuladas}</div>
          </div>
          <div class="summary-card">
            <div class="label">Monto total</div>
            <div class="value">$${totalGeneral.toLocaleString('es-CO')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>N° Factura</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Observaciones</th>
              <th>Costo total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        <p class="footer">Unistock · Reporte generado automáticamente</p>
      </body>
      </html>
    `;

    // Abrir en una pestaña nueva y disparar el diálogo de impresión.
    // El usuario elige "Guardar como PDF" como destino — es la misma técnica
    // usada en ProductionPage.handleDownloadPDF.
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showAlert("error", "Bloqueado", "El navegador bloqueó la ventana emergente. Permite pop-ups para exportar a PDF.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Pequeño delay para asegurar que el HTML termine de renderizar antes de imprimir
    setTimeout(() => printWindow.print(), 300);
  };

  // ── Paginación visual ─────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const paginationBtn = {
    padding: "6px 12px", borderRadius: "6px",
    border: "1px solid #ddd", background: "#fff",
    cursor: "pointer", fontSize: "14px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "24px 32px" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Compras</h1>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <div style={{ width: "260px" }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar"
            />
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              Escribe <strong>a</strong> para ver activos · <strong>i</strong> para anuladas
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        background: "#fff", padding: "12px 20px",
        borderRadius: "10px", marginBottom: "20px", alignItems: "center",
      }}>
        {/* IZQUIERDA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Antes llamaba directo a handleDownload (solo Excel).
              Ahora abre el modal de selección de formato — igual que en Producción. */}
          <button
            onClick={() => setDownloadModal(true)}
            title="Exportar compras"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", padding: "4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>

        {/* DERECHA */}
        <AddShoppingButton onClick={() => setShowCreateForm(true)} />
      </div>

      {/* TABLA */}
      <ShoppingTable
        shoppings={paginatedShoppings}
        getProveedorNombre={getProveedorNombre}
        onView={handleView}
        onAnular={handleAnular}
      />

      {/* MODAL CREAR */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <ShoppingForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedShopping && (
        <ShoppingDetail
          shopping={selectedShopping}
          getProveedorNombre={getProveedorNombre}
          onClose={() => setSelectedShopping(null)}
        />
      )}

      {/* PAGINACIÓN */}
      {filteredShoppings.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "6px" }}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={paginationBtn}>‹</button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: "6px 10px" }}>...</span>
            ) : (
              <button key={p} onClick={() => setCurrentPage(p)}
                style={{ ...paginationBtn, background: p === currentPage ? "#FF4FD6" : "#fff", color: p === currentPage ? "#fff" : "#000" }}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={paginationBtn}>›</button>
        </div>
      )}

      {/* MODAL ANULACIÓN CON MOTIVO */}
      {cancelModal.open && (() => {
        const shopping = shoppings.find((p) => p.id === cancelModal.id);
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px",
          }}>
            <div style={{
              background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "420px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "24px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111" }}>
                  Anular compra
                </h3>
                <button onClick={closeCancelModal}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "20px", lineHeight: 1, padding: "2px 6px" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}>
                  ×
                </button>
              </div>

              {/* Info */}
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
                Estás por anular la factura{" "}
                <strong style={{ color: "#111" }}>"{shopping?.numeroFactura || cancelModal.id}"</strong>.
                Esta acción no se puede deshacer.
              </p>

              {/* Motivo */}
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                Motivo de anulación *
              </label>
              <textarea
                value={cancelModal.motivo}
                onChange={(e) => { setCancelModal((p) => ({ ...p, motivo: e.target.value })); setMotivoError(""); }}
                placeholder="Describe el motivo..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "8px",
                  boxSizing: "border-box", resize: "vertical", fontSize: "13px", outline: "none",
                  border: motivoError ? "2px solid #ef4444" : "1.5px solid #d1d5db",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { if (!motivoError) e.target.style.borderColor = "#FF4FD6"; }}
                onBlur={(e) => { if (!motivoError) e.target.style.borderColor = "#d1d5db"; }}
              />
              {motivoError && (
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#ef4444" }}>{motivoError}</p>
              )}

              {/* Botones */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={closeCancelModal}
                  style={{
                    padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e7eb",
                    background: "#fff", fontSize: "13px", cursor: "pointer", color: "#555",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAnular}
                  style={{
                    padding: "8px 18px", borderRadius: "8px", border: "none",
                    background: "#ef4444", color: "#fff", fontSize: "13px",
                    fontWeight: 600, cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
                >
                  Confirmar anulación
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL SELECCIÓN FORMATO DE DESCARGA (Excel / PDF) */}
      {/* Mismo diseño que el download-modal de ProductionPage, pero con
          estilos inline en vez de clases CSS — para no tocar el <style global>
          que ShoppingsPage no tiene definido (producción sí lo tiene). */}
      {downloadModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1200, padding: "0 16px",
        }}>
          <div style={{
            borderRadius: "16px", padding: "24px", background: "#fff",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            width: "calc(100vw - 32px)", maxWidth: "360px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111" }}>Descargar compras</h3>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#888" }}>Elige el formato de exportación</p>
              </div>
              <button onClick={() => setDownloadModal(false)}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: "20px", lineHeight: 1, padding: "4px" }}>
                ×
              </button>
            </div>

            {/* Opciones */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* Opción Excel */}
              <button
                onClick={handleDownloadExcel}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", borderRadius: "10px", cursor: "pointer",
                  border: "1.5px solid #e5e7eb", background: "#fafafa", textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff4fd6"; e.currentTarget.style.background = "#fff0fb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fafafa"; }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#e6f4ea" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#111" }}>Excel / XLSX</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>Tabla editable, compatible con Excel y Sheets</p>
                </div>
              </button>

              {/* Opción PDF */}
              <button
                onClick={handleDownloadPDF}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", borderRadius: "10px", cursor: "pointer",
                  border: "1.5px solid #e5e7eb", background: "#fafafa", textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff4fd6"; e.currentTarget.style.background = "#fff0fb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fafafa"; }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fef2f2" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#111" }}>PDF</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>Documento listo para imprimir o compartir</p>
                </div>
              </button>
            </div>

            {/* Contador */}
            <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#d1d5db", textAlign: "center" }}>
              {filteredShoppings.length} compra{filteredShoppings.length !== 1 ? "s" : ""} se exportará{filteredShoppings.length !== 1 ? "n" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ALERT GLOBAL */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={(pwd) => { alertConfig.onConfirm?.(pwd); }}
        onCancel={closeAlert}
      />
    </div>
  );
};

export default ShoppingsPage;