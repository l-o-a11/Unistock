import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSuppliers } from "../hooks/mockSuppliers";
import { useSupplierSearch } from "../hooks/useSupplierSearch";
import { useSupplierDetail } from "../hooks/useSupplierDetail";

import SupplierTable from "../components/SupplierTable";
import SupplierSearch from "../components/SupplierSearch";
import AddSupplierButton from "../components/AddSupplierButton";
import SupplierDetail from "../components/SupplierDetail";

const SupplierPage = () => {
  const navigate = useNavigate();

  const { suppliers, deleteSupplier, toggleSupplier } = useSuppliers();

  const { searchTerm, handleSearch } = useSupplierSearch();
  const { selectedSupplier, isOpen, openDetail, closeDetail } =
    useSupplierDetail();

  const [currentPage, setCurrentPage] = useState(1);

  // 🔎 FILTRO
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];

    return suppliers.filter(
      (s) =>
        s.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.toString().includes(searchTerm)
    );
  }, [suppliers, searchTerm]);

  // 📄 PAGINACIÓN
  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplier = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🎯 ACCIONES
  const handleView = (supplier) => openDetail(supplier);
  const handleEdit = (supplier) =>
    navigate(`/proveedores/editar/${supplier.id}`);

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar proveedor?")) deleteSupplier(id);
  };

  const handleToggle = (id) => toggleSupplier?.(id);
  const handleAddSupplier = () => navigate("/proveedores/crear");

  // 🔢 PAGINACIÓN VISUAL
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

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* 🔝 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Proveedores</h1>

        <div style={{ width: "260px" }}>
          <SupplierSearch value={searchTerm} onChange={handleSearch} />
        </div>
      </div>

      {/* ➕ BOTÓN */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
          padding: "12px 16px",
        }}
      >
        <AddSupplierButton onClick={handleAddSupplier} />
      </div>

      {/* 📋 TABLA */}
      <SupplierTable
        suppliers={paginatedSupplier}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* 📦 MODAL DETALLE */}
      {isOpen && (
        <SupplierDetail
          supplier={selectedSupplier}
          onClose={closeDetail}
          onEdit={handleEdit}
        />
      )}

      {/* 📄 PAGINACIÓN */}
      {filteredSuppliers.length > 0 && (
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

export default SupplierPage;
