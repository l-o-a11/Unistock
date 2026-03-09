import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThird_parties } from "../hooks/mockThird_parties";
import { useThird_partieSearch } from "../hooks/useThird_partiesSearch";

import Third_partieForm   from "../components/Third_partiesForm";
import Third_partieTable  from "../components/Third_partiesTable";
import Third_partieSearch from "../components/Third_partiesSearch";
import AddThird_partieButton from "../components/AddThird_partiesButton";
import Third_partieDetail from "../components/Third_partiesDetail";
import Alert from "../components/Alert";

const Third_partiePage = () => {
  const navigate = useNavigate();

  const {
    Third_parties,
    deleteThird_partie,
    toggleThird_partie,
    createThird_partie,
    updateThird_partie,
  } = useThird_parties();

  const { searchTerm, handleSearch } = useThird_partieSearch();

  const [selectedThird_partie, setSelectedThird_partie] = useState(null);
  const [currentPage,          setCurrentPage]          = useState(1);
  const [showForm,             setShowForm]             = useState(false);
  const [editingThird_partie,  setEditingThird_partie]  = useState(null);

  // ✅ Fix: Alert global para eliminar (en lugar de window.confirm)
  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    id:   null,
  });

  // Auto-seleccionar el primer tercero al cargar
  useEffect(() => {
    if (Third_parties.length > 0 && !selectedThird_partie) {
      setSelectedThird_partie(Third_parties[0]);
    }
  }, [Third_parties]);

  // Actualizar el panel derecho si el tercero seleccionado fue editado
  useEffect(() => {
    if (selectedThird_partie) {
      const updated = Third_parties.find((t) => t.id === selectedThird_partie.id);
      if (updated) setSelectedThird_partie(updated);
    }
  }, [Third_parties]);

  const filteredThird_parties = useMemo(() => {
    if (!Third_parties) return [];
    return Third_parties.filter(
      (s) =>
        s.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.toString().includes(searchTerm)
    );
  }, [Third_parties, searchTerm]);

  const itemsPerPage = 7;
  const totalPages   = Math.max(1, Math.ceil(filteredThird_parties.length / itemsPerPage));
  const startIndex   = (currentPage - 1) * itemsPerPage;
  const paginatedThird_partie = filteredThird_parties.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (third) => setSelectedThird_partie(third);

  // ✅ Fix: eliminar con Alert tipo "password" en lugar de window.confirm
  const handleDelete = (id) => {
    setDeleteAlert({ open: true, id });
  };

  const confirmDelete = () => {
    deleteThird_partie(deleteAlert.id);
    // Si el eliminado era el seleccionado, limpiar el panel
    if (selectedThird_partie?.id === deleteAlert.id) {
      setSelectedThird_partie(null);
    }
    setDeleteAlert({ open: false, id: null });
  };

  const handleToggle = (id) => toggleThird_partie?.(id);

  const handleEdit = (third) => {
    setEditingThird_partie(third);
    setShowForm(true);
  };

  const handleAddThird_partie = () => {
    setEditingThird_partie(null);
    setShowForm(true);
  };

  // ✅ Fix: NO cerrar el modal aquí — el Third_partieForm lo cierra solo
  // via pendingClose cuando el Alert de éxito se cierra
  const handleFormSubmit = async (data) => {
    if (editingThird_partie) {
      await updateThird_partie(editingThird_partie.id, data);
    } else {
      await createThird_partie(data);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div style={styles.container}>
      {/* Alert global de eliminación */}
      <Alert
        isOpen={deleteAlert.open}
        type="password"
        title="Eliminar tercero"
        message="Esta acción no se puede deshacer. Ingresa la contraseña de administrador para confirmar."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteAlert({ open: false, id: null })}
      />

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de terceros</h1>
        <div style={styles.searchBox}>
          <Third_partieSearch value={searchTerm} onChange={handleSearch} />
        </div>
      </div>

      {/* Tabs de navegación */}
      <div style={styles.tabs}>
        <button onClick={() => navigate("/Layout/produccion")} style={styles.tabInactive}>
          Producciones
        </button>
        <button onClick={() => navigate("/Layout/terceros")} style={styles.tabActive}>
          Terceros
        </button>
      </div>

      {/* Layout de dos columnas */}
      <div style={styles.mainContent}>
        {/* Columna izquierda: tabla + paginación */}
        <div style={styles.left}>
          <div style={styles.topBar}>
            <AddThird_partieButton onClick={handleAddThird_partie} />
          </div>

          <Third_partieTable
            Third_parties={paginatedThird_partie}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />

          {filteredThird_parties.length > 0 && (
            <div style={styles.pagination}>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={styles.pageBtn}>‹</button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={i} style={{ padding: "6px 4px" }}>...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      ...styles.pageBtn,
                      backgroundColor: p === currentPage ? "#FF4FD6" : "#fff",
                      color:           p === currentPage ? "#fff"    : "#333",
                      border:          p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd",
                    }}
                  >
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={styles.pageBtn}>›</button>
            </div>
          )}
        </div>

        {/* Columna derecha: detalle */}
        <div style={styles.right}>
          {selectedThird_partie ? (
            <Third_partieDetail
              Third_partie={selectedThird_partie}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClose={() => setSelectedThird_partie(null)}
            />
          ) : (
            <div style={styles.emptyDetail}>Selecciona un tercero</div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      {showForm && (
        <Third_partieForm
          Third_partie={editingThird_partie}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container:   { padding: "0", background: "#F7F7F9", minHeight: "100vh" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0" },
  title:       { fontSize: "26px", fontWeight: 600, color: "#1E1E1E" },
  searchBox:   { width: "210px" },
  tabs:        { display: "flex", gap: "8px", marginBottom: "20px" },
  tabActive:   { background: "#FF4FD6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  tabInactive: { background: "#F1F1F1", color: "#666", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  mainContent: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" },
  left:        { background: "#fff", borderRadius: "10px", padding: "12px" },
  right:       { background: "#fff", borderRadius: "10px", padding: "16px", minHeight: "400px", height: "fit-content", alignSelf: "start" },
  emptyDetail: { color: "#999", textAlign: "center", marginTop: "40px" },
  topBar:      { display: "flex", justifyContent: "flex-end", marginBottom: "12px" },
  pagination:  { marginTop: "10px", display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" },
  pageBtn:     { padding: "6px 12px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
};

export default Third_partiePage;
