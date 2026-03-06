import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import { useSupplySearch } from "../hooks/useSupplySearch";
import SupplyTable from "../components/SupplyTable";
import SupplySearch from "../components/SupplySearch";
import AddSupplyButton from "../components/AddSupplyButton";
import { useSupplyDetail } from "../hooks/useSupplyDetail";
import SupplyForm from "../components/SupplyForm";
import SupplyDetail from "../components/SupplyDetail";

const SuppliesPage = () => {
  const navigate = useNavigate();
  const {
    supplies,
    createSupply,
    updateSupply,
    deleteSupply,
    toggleSupply,
    categorias,
    medidas,
    propiedades,
    getCategoriaNombre,
    getMedidaNombre,
  } = useSupplies();
  const { searchTerm, handleSearch } = useSupplySearch();
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Estados para modales
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);

  // Filter
  
  const filteredSupplies = supplies.filter((s) => {
  const text = searchTerm.toLowerCase();

  return (
    s.id?.toString().includes(searchTerm) ||
    s.nombre?.toLowerCase().includes(text) ||
    getCategoriaNombre(s.categoriaId)?.toLowerCase().includes(text) ||
    getMedidaNombre(s.medidaId)?.toLowerCase().includes(text)
  );
});

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSupplies.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplies = filteredSupplies.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handlers
  const handleAddSupply = () => {
    setShowCreateForm(true);
  };
  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setShowEditForm(true);
  };
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingSupply(null);
  };

 const handleView = (supply) => {
  setSelectedSupply(supply);
};

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este insumo?")) {
      deleteSupply(id);
    }
  };
  const handleToggle = (id) => toggleSupply?.(id);

  const handleCreateSubmit = async (supplyData) => {
    try {
      await createSupply(supplyData);
      handleCloseForm();
    } catch (error) {
      console.error("Error al crear insumo:", error);
    }
  };

  const handleEditSubmit = async (supplyData) => {
    try {
      await updateSupply(editingSupply.id, supplyData);
      handleCloseForm();
    } catch (error) {
      console.error("Error al actualizar insumo:", error);
    }
  };

  // Download handler (export)
  const handleDownload = () => {
    const csv = [
      ["id", "Nombre", "Categoría", "Stock", "propiedades"],
      ...filteredSupplies.map((supply) => [
        supply.id,
        supply.nombre,
        supply.categoria,
        supply.propiedades,
        supply.stock,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insumos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        padding: "24px 32px",
      }}
    >
      {/* ── Row 1: Title + Search ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "26px",
            fontWeight: "700",
            color: "#1a1a1a",
          }}
        >
          Insumos
        </h1>
        <SupplySearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* ── Row 2: Download icon + Add button — inside white card ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          padding: "12px 20px",
          marginBottom: "20px",
        }}
      >
        {/* Download / export icon */}
        <button
          onClick={handleDownload}
          title="Exportar insumos"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#555",
            display: "flex",
            alignItems: "center",
            padding: "4px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
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

        <AddSupplyButton onClick={handleAddSupply} />
      </div>

      {/* ── Table ── */}
      <SupplyTable
        supplies={paginatedSupplies}
        getCategoriaNombre={getCategoriaNombre}
        getMedidaNombre={getMedidaNombre}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ── MODAL: Crear insumo ── */}
      {showCreateForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              pointerEvents: "auto",
              zIndex: 1001,
            }}
            onClick={handleCloseForm}
          />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "1000px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              zIndex: 1002,
              pointerEvents: "auto",
            }}
          >
            <SupplyForm
            categorias={categorias}
            medidas={medidas}
            propiedades={propiedades}
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* ── MODAL: Editar insumo ── */}
      {showEditForm && editingSupply && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              pointerEvents: "auto",
              zIndex: 1001,
            }}
            onClick={handleCloseForm}
          />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "1000px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              zIndex: 1002,
              pointerEvents: "auto",
            }}
          >
            <SupplyForm
              supply={editingSupply}
              categorias={categorias}
              medidas={medidas}
              propiedades={propiedades}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
      
      {/* ── SupplyDetail Modal ── */}
{selectedSupply && (
  <SupplyDetail
    supply={selectedSupply}
    medidas={medidas}
    propiedades={propiedades}
    categorias={categorias}
    onClose={() => setSelectedSupply(null)}
  />
)}

      {/* ── Pagination (squared like SuppliesPage) ── */}
      {filteredSupplies.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setCurrentPage((supply) => Math.max(1, supply - 1))}
            disabled={currentPage === 1}
            style={{
              ...paginationBtn,
              color: currentPage === 1 ? "#ccc" : "#333",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>

          {getPageNumbers().map((supply, i) =>
            supply === "..." ? (
              <span
                key={i}
                style={{ padding: "6px 10px", fontSize: "14px", color: "#999" }}
              >
                ...
              </span>
            ) : (
              <button
                key={supply}
                onClick={() => setCurrentPage(supply)}
                style={{
                  ...paginationBtn,
                  backgroundColor: supply === currentPage ? "#FF4FD6" : "#fff",
                  color: supply === currentPage ? "#fff" : "#333",
                  border:
                    supply === currentPage
                      ? "1px solid #FF4FD6"
                      : "1px solid #ddd",
                }}
              >
                {supply}
              </button>
            ),
          )}

          <button
            onClick={() =>
              setCurrentPage((supply) => Math.min(totalPages, supply + 1))
            }
            disabled={currentPage === totalPages}
            style={{
              ...paginationBtn,
              color: currentPage === totalPages ? "#ccc" : "#333",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default SuppliesPage;
