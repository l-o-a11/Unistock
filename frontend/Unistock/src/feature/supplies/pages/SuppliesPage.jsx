import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplies } from "../hooks/useSupplies";
import { useSupplySearch } from "../hooks/useSupplySearch";
import SupplyTable from "../components/SupplyTable";
import SupplySearch from "../components/SupplySearch";
import AddSupplyButton from "../components/AddSupplyButton";
import SupplyForm from "../components/SupplyForm";
import SupplyDetail from "../components/SupplyDetail";
import Alert from "../components/Alert";


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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);

 


  // ─── Filtrado y paginación ────────────────────────────────────────────────
  const filteredSupplies = supplies.filter((s) => {
    const text = searchTerm.toLowerCase();
    return (
      s.id?.toString().includes(searchTerm) ||
      s.stock?.toString().includes(searchTerm) ||
      s.nombre?.toLowerCase().includes(text) ||
      s.valorMedida?.toString().includes(searchTerm) ||
      getCategoriaNombre(s.categoriaId)?.toLowerCase().includes(text) ||
      getMedidaNombre(s.medidaId)?.toLowerCase().includes(text)
    );
  });

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredSupplies.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplies = filteredSupplies.slice(startIndex, startIndex + itemsPerPage);

  // ─── Acciones ─────────────────────────────────────────────────────────────
  const handleAddSupply = () => setShowCreateForm(true);

  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingSupply(null);
  };

  const handleView = (supply) => setSelectedSupply(supply);

  const handleDelete = (id) => {
        if (window.confirm("¿Eliminar insumo?")) deleteSupply(id);
  };

  const handleToggle = (id) => {
    toggleSupply?.(id);
  };

 const handleCreateSubmit = async (supplyData) => {
  try {
    await createSupply(supplyData);
    handleCloseForm();
  } catch (error) {
    console.error("Error al crear el insumo:", error);
  }
};

const handleEditSubmit = async (supplyData) => {
  try {
    await updateSupply(editingSupply.id, supplyData);
    handleCloseForm();
  } catch (error) {
    console.error("Error al actualizar el insumo:", error);
  }
};
  const handleDownload = () => {
    const csv = [
      ["id", "Nombre", "Categoría", "Stock"],
      ...filteredSupplies.map((s) => [s.id, s.nombre, getCategoriaNombre(s.categoriaId), s.stock]),
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

  // ─── Paginación visual ────────────────────────────────────────────────────
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Insumos</h1>
        <SupplySearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* TOOLBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", background: "#fff", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px" }}>
        <button onClick={handleDownload}>Exportar</button>
        <AddSupplyButton onClick={handleAddSupply} />
      </div>

      {/* TABLA */}
      <SupplyTable
        supplies={paginatedSupplies}
        getCategoriaNombre={getCategoriaNombre}
        getMedidaNombre={getMedidaNombre}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* MODAL CREAR */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <SupplyForm
            categorias={categorias}
            medidas={medidas}
            propiedades={propiedades}
            onSubmit={handleCreateSubmit}
            onCancel={handleCloseForm}
            
          />
        </div>
      )}
      

      {/* MODAL EDITAR */}
      {showEditForm && editingSupply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <SupplyForm
            supply={editingSupply}
            categorias={categorias}
            medidas={medidas}
            propiedades={propiedades}
            onSubmit={handleEditSubmit}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedSupply && (
        <SupplyDetail
          supply={selectedSupply}
          medidas={medidas}
          propiedades={propiedades}
          categorias={categorias}
          onClose={() => setSelectedSupply(null)}
          onEdit={(supply) => {
            setSelectedSupply(null);
            handleEdit(supply);
          }}
        />
      )}

      {/* PAGINACIÓN */}
      {filteredSupplies.length > 0 && (
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

      
    </div>
  );
};

export default SuppliesPage;