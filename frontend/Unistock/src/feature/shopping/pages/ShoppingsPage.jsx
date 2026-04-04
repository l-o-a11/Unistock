import React, { useState } from "react";
import { useShoppings } from "../hooks/useShoppings";
import { useShoppingSearch } from "../hooks/useShoppingSearch";
import ShoppingTable from "../components/ShoppingTable";
import ShoppingSearch from "../components/ShoppingSearch";
import AddShoppingButton from "../components/AddShoppingButton";
import ShoppingForm from "../components/ShoppingForm";
import ShoppingDetail from "../components/ShoppingDetail";
import Alert from "../../shared/components/Alert";
import { useSuppliers } from "../../suppliers_fixed/hooks/mockSuppliers";

const ADMIN_PASSWORD = "1234"; // TODO: validar en backend

const ShoppingsPage = () => {
  const { suppliers } = useSuppliers();

  const getProveedorNombre = (proveedorId) =>
    suppliers.find((s) => s.id === parseInt(proveedorId))?.nombreEmpresa ?? "—";

  const {
    shoppings,
    createShopping,
    updateShopping,
    anularShopping, // ← reemplaza deleteShopping y toggleShopping
  } = useShoppings();

  const { searchTerm, handleSearch } = useShoppingSearch();

  const [selectedShopping, setSelectedShopping] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingShopping, setEditingShopping] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  // ── Alert helpers ──────────────────────────────────────────────────────────
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ open: true, type, title, message, onConfirm });
  };

  // ── Filtrado y paginación ──────────────────────────────────────────────────
  const filteredShoppings = shoppings.filter((p) => {
    const text = searchTerm.toLowerCase();
    return (
      p.id?.toString().includes(searchTerm) ||
      p.numeroFactura?.toLowerCase().includes(text) ||
      p.proveedor?.toLowerCase().includes(text) ||
      p.observaciones?.toLowerCase().includes(text) ||
      p.costoTotal?.toString().includes(searchTerm) ||
      p.fecha?.includes(searchTerm)
    );
  });

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredShoppings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShoppings = filteredShoppings.slice(startIndex, startIndex + itemsPerPage);

  // ── Acciones ───────────────────────────────────────────────────────────────
  const handleAddShopping = () => setShowCreateForm(true);

  const handleEdit = (shopping) => {
    setEditingShopping(shopping);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingShopping(null);
  };

  const handleView = (shopping) => setSelectedShopping(shopping);

  // ── Anular compra (reemplaza eliminar y activar/desactivar) ────────────────
  const handleAnular = (id) => {
    const shopping = shoppings.find((p) => p.id === id);

    // Si ya está anulada, no se permite ninguna acción adicional
    if (shopping?.anulada) {
      showAlert("error", "Compra ya anulada", `La factura "${shopping?.numeroFactura || id}" ya fue anulada anteriormente.`);
      return;
    }

    showAlert(
      "password",
      "¿Anular compra?",
      `Para anular la factura "${shopping?.numeroFactura || id}" confirma tu contraseña de administrador. Esta acción no se puede deshacer.`,
      async (pwd) => {
        if (pwd !== ADMIN_PASSWORD) {
          showAlert("error", "Contraseña incorrecta", "Verifica tu contraseña e intenta nuevamente.");
          return;
        }
        try {
          await anularShopping(id);
          showAlert(
            "success",
            "Compra anulada",
            `La factura "${shopping?.numeroFactura || id}" fue anulada correctamente.`
          );
        } catch {
          showAlert("error", "Error", "No se pudo anular la compra. Intenta nuevamente.");
        }
      }
    );
  };

  const handleCreateSubmit = async (shoppingData) => {
    try {
      await createShopping(shoppingData);
      handleCloseForm();
      showAlert("success", "Compra registrada", `Factura "${shoppingData.numeroFactura}" creada correctamente.`);
    } catch (error) {
      showAlert("error", "Error al crear", error.message || "No se pudo registrar la compra.");
    }
  };

  const handleEditSubmit = async (shoppingData) => {
    try {
      await updateShopping(editingShopping.id, shoppingData);
      handleCloseForm();
      showAlert("success", "Compra actualizada", `Factura "${shoppingData.numeroFactura}" actualizada correctamente.`);
    } catch (error) {
      showAlert("error", "Error al actualizar", error.message || "No se pudo actualizar la compra.");
    }
  };

  const handleCancelCreate = () => handleCloseForm();
  const handleCancelEdit = () => handleCloseForm();

  const handleDownload = () => {
    const csv = [
      ["ID", "Fecha", "N° Factura", "Proveedor", "Observaciones", "Costo Total", "Estado"],
      ...filteredShoppings.map((p) => [
        p.id, p.fecha, p.numeroFactura, p.proveedor, p.observaciones, p.costoTotal,
        p.anulada ? "Anulada" : "Activa",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compras.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Paginación visual ──────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const paginationBtn = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "24px 32px" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1a1a1a" }}>Compras</h1>
        <ShoppingSearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* TOOLBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", background: "#fff", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px" }}>
        <button
          onClick={handleDownload}
          title="Exportar compras"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <AddShoppingButton onClick={handleAddShopping} />
      </div>

      {/* TABLA */}
      <ShoppingTable
        shoppings={paginatedShoppings}
        getProveedorNombre={getProveedorNombre}
        onView={handleView}
        onEdit={handleEdit}
        onAnular={handleAnular}  // ← prop unificada, reemplaza onDelete y onToggle
      />

      {/* MODAL CREAR */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <ShoppingForm
            onSubmit={handleCreateSubmit}
            onCancel={handleCancelCreate}
          />
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditForm && editingShopping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <ShoppingForm
            shopping={editingShopping}
            onSubmit={handleEditSubmit}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedShopping && (
        <ShoppingDetail
          shopping={selectedShopping}
          getProveedorNombre={getProveedorNombre}
          onClose={() => setSelectedShopping(null)}
          onEdit={(shopping) => {
            setSelectedShopping(null);
            handleEdit(shopping);
          }}
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
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{ ...paginationBtn, background: p === currentPage ? "#FF4FD6" : "#fff", color: p === currentPage ? "#fff" : "#000" }}
              >
                {p}
              </button>
            )
          )}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={paginationBtn}>›</button>
        </div>
      )}

      {/* ALERT GLOBAL */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={(pwd) => {
          alertConfig.onConfirm?.(pwd);
        }}
        onCancel={closeAlert}
      />
    </div>
  );
};

export default ShoppingsPage;