import React, { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { useRolSearch } from "../hooks/useRolSearch";
import { useRolDetail } from "../hooks/useRolDetail";
import RolTable from "../components/RolTable";
import RolSearch from "../components/RolSearch";
import AddRolButton from "../components/AddRolButton";
import RolDetail from "../components/RolDetail";
import CreateRolPage from "./CreateRolPage";
import EditRolPage from "./EditRolPage";

const RolesPage = () => {
  const { roles, createRol, updateRol, deleteRol, toggleRol} = useRoles();
  const { searchTerm, handleSearch } = useRolSearch();
  const { selectedRol, isOpen, openDetail, closeDetail } = useRolDetail();
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState(null); // "create" | "edit" | null
  const [editingRolId, setEditingRolId] = useState(null);

  // ─────────────────────────────
  // FILTER
  // ─────────────────────────────
  const filteredRoles = roles.filter(
    (rol) =>
      rol.id.toString().includes(searchTerm) ||
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────
  // PAGINATION
  // ─────────────────────────────
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ─────────────────────────────
  // HANDLERS
  // ─────────────────────────────
  const handleViewDetails = (rol) => {
    openDetail(rol);
  };

  const handleEdit = (rol) => {
    setEditingRolId(rol.id);
    setModalType("edit");
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este rol?")) {
      deleteRol(id);
    }
  };
  const handleToggle = (id) => toggleRol?.(id);

  const handleAddRol = () => {
    setModalType("create");
  };

 // PAGINACIÓN VISUAL
  const getPageNumbers = () => {
    if (totalPages <= 5)
      return [...Array(totalPages)].map((_, i) => i + 1);

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

  // ─────────────────────────────
  // RENDER
  // ─────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px 32px",
      }}
    >
      {/* ── Header ── */}
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
          Roles
        </h1>

        <RolSearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* ➕ Botón */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          padding: '12px 20px',
          marginBottom: '20px',
        }}
      >
        <AddRolButton onClick={handleAddRol} />
      </div>

      {/* ── Tabla ── */}
      <RolTable
        roles={paginatedRoles}
        onView={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ── Modal Crear / Editar ── */}
      {modalType && (
        <div
          onClick={() => {
            setModalType(null);
            setEditingRolId(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "50%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            
            {modalType === "create" && (
              <CreateRolPage
                createRol={createRol}  // PASAMOS LA FUNCIÓN desde el mismo hook
                onClose={() => setModalType(null)}
              />
            )}


            {modalType === "edit" && (
              <EditRolPage
                rolId={editingRolId}
                updateRol={updateRol}  // PASAMOS LA FUNCIÓN DESDE EL HOOK
                onClose={() => {
                  setModalType(null);
                  setEditingRolId(null);
                }}
              />
            )}  

          </div>
        </div>
      )}

      {/* ── Detalle ── */}
      {isOpen && (
        <RolDetail
          rol={selectedRol}
          onClose={closeDetail}
          onEdit={handleEdit}
        />
      )}

      {/* ── Paginación ── */}
      
      {filteredRoles.length > 0 && (
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={paginationBtn}
          >
            ‹
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: "6px 10px" }}>
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  ...paginationBtn,
                  backgroundColor: p === currentPage ? "#FF4FD6" : "#fff",
                  color: p === currentPage ? "#fff" : "#333",
                  border:
                    p === currentPage
                      ? "1px solid #FF4FD6"
                      : "1px solid #ddd",
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            style={paginationBtn}
          >
            ›
          </button>
          </div>
      )}
    </div>
  );
};

// 🎨 estilo reutilizable
const paginationBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

export default RolesPage;
