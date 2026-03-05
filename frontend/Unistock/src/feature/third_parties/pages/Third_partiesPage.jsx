import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThird_parties } from "../hooks/mockThird_parties";
import { useThird_partieSearch } from "../hooks/useThird_partiesSearch";

import Third_partieForm from "../components/Third_partiesForm";
import Third_partieTable from "../components/Third_partiesTable";
import Third_partieSearch from "../components/Third_partiesSearch";
import AddThird_partieButton from "../components/AddThird_partiesButton";
import Third_partieDetail from "../components/Third_partiesDetail";

/**
 * Third_partiePage - Main page for managing third-party vendors
 * 
 * This component displays third-party vendor information in a two-column layout:
 * - Left column: table with list of vendors and pagination
 * - Right column: detail view for selected vendor
 * 
 * Features:
 * - Real-time search across company name (nombreEmpresa) and NIT fields
 * - Automatic selection of first vendor when page loads
 * - Tab navigation between Productions and Terceros sections
 * - Create/Edit/Delete functionality with navigation
 * - Pagination with dynamic page number display
 * - Enable/disable toggle for vendors
 * - Responsive two-column grid layout
 * 
 * The component uses local state for detail panel selection instead of a separate hook
 */
const Third_partiePage = () => {
  const navigate = useNavigate();

  const { Third_parties, deleteThird_partie, toggleThird_partie, createThird_partie, updateThird_partie } = useThird_parties();

  const { searchTerm, handleSearch } = useThird_partieSearch();



  /**
   * Local state for detail panel
   * selectedThird_partie - currently selected vendor to display in right panel
   * currentPage - pagination state
   */
  const [selectedThird_partie, setSelectedThird_partie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Auto-select first vendor when component mounts or data changes
   * This ensures the detail panel always shows a vendor
   */
  useEffect(() => {
    if (Third_parties.length > 0 && !selectedThird_partie) {
      setSelectedThird_partie(Third_parties[0]);
    }
  }, [Third_parties]);

  /**
   * Filter vendors based on search term
   * Searches across vendor company name (nombreEmpresa) and NIT fields
   * Uses useMemo for performance optimization
   */
  const filteredThird_parties = useMemo(() => {
    if (!Third_parties) return [];

    return Third_parties.filter(
      (s) =>
        s.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.toString().includes(searchTerm)
    );
  }, [Third_parties, searchTerm]);

  /**
   * Calculate pagination values
   * itemsPerPage - number of vendors per page (fixed at 7)
   * totalPages - total number of pages based on filtered vendors
   * paginatedThird_partie - vendors array slice for current page
   */
  const itemsPerPage = 7;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredThird_parties.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThird_partie = filteredThird_parties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /**
   * Action handlers for vendor management
   * handleView - update detail panel with selected vendor
   * handleEdit - navigate to edit page
   * handleDelete - delete vendor with confirmation
   * handleToggle - toggle vendor active/inactive status
   * handleAddThird_partie - navigate to create new vendor
   */
  const handleView = (third) => {
    setSelectedThird_partie(third);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar tercero?")) deleteThird_partie(id);
  };

  const handleToggle = (id) => toggleThird_partie?.(id);

  // Añadir estos estados
  const [showForm, setShowForm] = useState(false);
  const [editingThird_partie, setEditingThird_partie] = useState(null);

  // Cambiar estos handlers:
  const handleEdit = (third) => {
    setEditingThird_partie(third);   // guarda el tercero a editar
    setShowForm(true);               // abre el modal
  };

  const handleAddThird_partie = () => {
    setEditingThird_partie(null);    // modo crear (sin datos previos)
    setShowForm(true);               // abre el modal
  };

  // Agregar handler de submit
  const handleFormSubmit = async (data) => {
    if (editingThird_partie) {
      await updateThird_partie(editingThird_partie.id, data);
    } else {
      await createThird_partie(data);
    }
    setShowForm(false);
  };

  /**
   * Generate page numbers for pagination display
   * Shows limited page buttons (max 7) with dots for skipped pages
   * Ensures first and last pages are always visible
   */
  const getPageNumbers = () => {
    if (totalPages <= 7)
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
    <div style={styles.container}>
      {/* Page header with title and search component */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de terceros</h1>

        <div style={styles.searchBox}>
          <Third_partieSearch value={searchTerm} onChange={handleSearch} />
        </div>
      </div>

      {/* Navigation tabs for Productions and Terceros sections */}
      <div style={styles.tabs}>
        <button
          onClick={() => navigate("/produccion")}
          style={styles.tabInactive}
        >
          Producciones
        </button>

        <button
          onClick={() => navigate("/terceros")}
          style={styles.tabActive}
        >
          Terceros
        </button>
      </div>

      {/* Main content with two-column layout: table on left, detail on right */}
      <div style={styles.mainContent}>
        {/* Left column: table and pagination */}
        <div style={styles.left}>
          {/* Add new vendor button */}
          <div style={styles.topBar}>
            <AddThird_partieButton onClick={handleAddThird_partie} />
          </div>

          {/* Vendors table with action buttons */}
          <Third_partieTable
            Third_parties={paginatedThird_partie}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />

          {/* Pagination controls with previous/next and page buttons */}
          {filteredThird_parties.length > 0 && (
            <div style={styles.pagination}>
              {/* Previous page button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={styles.pageBtn}
              >
                ‹
              </button>

              {/* Page number buttons with ellipsis for skipped pages */}
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={i}>...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      ...styles.pageBtn,
                      backgroundColor: p === currentPage ? "#FF4FD6" : "#fff",
                      color: p === currentPage ? "#fff" : "#333",
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
                style={styles.pageBtn}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Right column: detail panel for selected vendor */}
        <div style={styles.right}>
          {selectedThird_partie ? (
            <Third_partieDetail
              Third_partie={selectedThird_partie}
              onEdit={handleEdit}
              onClose={() => setSelectedThird_partie(null)}
            />
          ) : (
            <div style={styles.emptyDetail}>Selecciona un tercero</div>
          )}
        </div>
      </div>

      {/* Modal de crear/editar tercero */}
      {showForm && (
        <Third_partieForm
          Third_partie={editingThird_partie}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div >
  );
};

/**
 * Styling constants for the page layout
 * Uses pink theme (#FF4FD6) for active states and primary actions
 * Two-column grid layout for table and detail view
 */
const styles = {
  container: {
    padding: "0px 0px",
    background: "#F7F7F9",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0px",
  },

  title: {
    fontSize: "26px",
    fontWeight: 600,
    color: "#1E1E1E",
  },

  searchBox: {
    width: "210px",
  },

  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },

  tabActive: {
    background: "#FF4FD6",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  tabInactive: {
    background: "#F1F1F1",
    color: "#666",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  mainContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "10px",
  },

  left: {
    background: "#fff",
    borderRadius: "10px",
    padding: "12px",
  },

  right: {
    background: "#fff",
    borderRadius: "10px",
    padding: "16px",
    minHeight: "400px",
    height: "fit-content",
    alignSelf: "start",
  },

  emptyDetail: {
    color: "#999",
    textAlign: "center",
    marginTop: "40px",
  },

  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  },

  pagination: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    gap: "6px",
  },

  pageBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
};

export default Third_partiePage;
