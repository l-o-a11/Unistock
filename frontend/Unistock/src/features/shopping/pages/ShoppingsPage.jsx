import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useShoppings } from "../hooks/useShoppings";
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
  const handleView = (shopping) => setSelectedShopping(shopping);

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

  const handleDownload = () => {
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
        <h1 style={{ fontSize: "26px", fontWeight: 600, margin: 0 }}>Compras</h1>
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
          <button
            onClick={handleDownload}
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "13px", color: "#555" }}>Estado:</label>
            <select
              value={estadoFiltro}
              onChange={(e) => { setEstadoFiltro(e.target.value); setCurrentPage(1); }}
              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", cursor: "pointer", outline: "none" }}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
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