import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSuppliers } from "../hooks/mockSuppliers";
import { useSupplierSearch } from "../hooks/useSupplierSearch";
import { useSupplierDetail } from "../hooks/useSupplierDetail";

import SupplierForm from "../components/SupplierForm";
import SupplierTable from "../components/SupplierTable";
import SupplierSearch from "../components/SupplierSearch";
import AddSupplierButton from "../components/AddSupplierButton";
import SupplierDetail from "../components/SupplierDetail";

/**
 * SuppliersPage - Main page for managing supplier vendors
 * 
 * This component displays an organized list of suppliers with comprehensive management features:
 * - Real-time search across company name and NIT fields
 * - Table display with supplier information and action buttons
 * - Detail panel for viewing supplier information
 * - Create/Edit/Delete functionality with navigation
 * - Pagination with customizable page buttons
 * - Enable/disable toggle functionality for suppliers
 * 
 * Features:
 * - Search term filtering with memoization for performance
 * - Dynamic pagination that resets to page 1 on filter changes
 * - Responsive button styling with active state indicators
 * - Connection to supplier hooks for data management
 */
const SupplierPage = () => {
  const navigate = useNavigate();

  const { suppliers, deleteSupplier, toggleSupplier, createSupplier, updateSupplier } = useSuppliers();

  const { searchTerm, handleSearch } = useSupplierSearch();
  const { selectedSupplier, isOpen, openDetail, closeDetail } =
    useSupplierDetail();

  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Filter suppliers based on search term
   * Searches across supplier company name (nombreEmpresa) and NIT fields
   * Uses useMemo to prevent unnecessary recalculations
   */
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];

    return suppliers.filter(
      (s) =>
        s.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.toString().includes(searchTerm)
    );
  }, [suppliers, searchTerm]);

  /**
   * Calculate pagination values
   * itemsPerPage - number of suppliers per page (fixed at 7)
   * totalPages - total number of pages based on filtered suppliers
   * paginatedSupplier - suppliers array slice for current page
   */
  const itemsPerPage = 7;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplier = filteredSuppliers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /**
   * Action handlers for supplier management
   * handleView - open supplier detail panel
   * handleEdit - navigate to edit page
   * handleDelete - delete supplier with confirmation
   * handleToggle - toggle supplier active/inactive status
   * handleAddSupplier - navigate to create new supplier
   */
  const handleView = (supplier) => openDetail(supplier);

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar proveedor?")) deleteSupplier(id);
  };

  const handleToggle = (id) => toggleSupplier?.(id);

  // Estado del modal
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data);
    } else {
      await createSupplier(data);
    }
    setShowForm(false);
  };

  /**
   * Generate page numbers for pagination display
   * Shows limited page buttons (max 5) with dots for skipped pages
   * Ensures first and last pages are always visible
   */
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
      {/* Page header with title and search component */}
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

      {/* Add supplier button section */}
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

      {/* Suppliers table with action buttons */}
      <SupplierTable
        suppliers={paginatedSupplier}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* Supplier detail panel modal */}
      {isOpen && (
        <SupplierDetail
          supplier={selectedSupplier}
          onClose={closeDetail}
          onEdit={handleEdit}
        />
      )}

      {/* Pagination controls with page buttons */}
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
          {/* Previous page button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={paginationBtn}
          >
            ‹
          </button>

          {/* Page number buttons with ellipsis for skipped pages */}
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

          {/* Next page button */}
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
      {/* Modal de crear/editar proveedor */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

/**
 * Shared pagination button styles
 * Used for all page navigation buttons
 */
const paginationBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

export default SupplierPage;