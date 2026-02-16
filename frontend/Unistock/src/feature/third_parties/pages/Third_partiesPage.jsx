import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useThird_parties } from "../hooks/mockThird_parties";
import { useThird_partieSearch } from "../hooks/useThird_partiesSearch";

import Third_partieTable from "../components/Third_partiesTable";
import Third_partieSearch from "../components/Third_partiesSearch";
import AddThird_partieButton from "../components/AddThird_partiesButton";
import Third_partieDetail from "../components/Third_partiesDetail";

const Third_partiePage = () => {
  const navigate = useNavigate();

  const { Third_parties, deleteThird_partie, toggleThird_partie } =
    useThird_parties();

  const { searchTerm, handleSearch } = useThird_partieSearch();

  // 🔥 ESTADO LOCAL PARA DETALLE (REEMPLAZA EL HOOK)
  const [selectedThird_partie, setSelectedThird_partie] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  // 🔎 FILTRO
  const filteredThird_parties = useMemo(() => {
    if (!Third_parties) return [];

    return Third_parties.filter(
      (s) =>
        s.nombreEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nit?.toString().includes(searchTerm)
    );
  }, [Third_parties, searchTerm]);

  // 📄 PAGINACIÓN
  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredThird_parties.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThird_partie = filteredThird_parties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🎯 ACCIONES
  const handleView = (third) => {
    setSelectedThird_partie(third); // 👈 muestra el detalle en el panel derecho
  };

  const handleEdit = (third) => {
    navigate(`/terceros/editar/${third.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar tercero?")) deleteThird_partie(id);
  };

  const handleToggle = (id) => toggleThird_partie?.(id);

  const handleAddThird_partie = () => navigate("/terceros/crear");

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
    <div style={styles.container}>
      {/* 🔝 HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de terceros</h1>

        <div style={styles.searchBox}>
          <Third_partieSearch value={searchTerm} onChange={handleSearch} />
        </div>
      </div>

      {/* 🧭 TABS */}
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

      {/* 🧩 CONTENIDO PRINCIPAL */}
      <div style={styles.mainContent}>
        {/* IZQUIERDA */}
        <div style={styles.left}>
          {/* BOTÓN */}
          <div style={styles.topBar}>
            <AddThird_partieButton onClick={handleAddThird_partie} />
          </div>

          {/* TABLA */}
          <Third_partieTable
            Third_parties={paginatedThird_partie}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />

          {/* PAGINACIÓN */}
          {filteredThird_parties.length > 0 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={styles.pageBtn}
              >
                ‹
              </button>

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

        {/* DERECHA - DETALLE */}
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
    </div>
  );
};

// 🎨 ESTILOS
const styles = {
  container: {
    padding: "24px 32px",
    background: "#F7F7F9",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  title: {
    fontSize: "26px",
    fontWeight: 600,
    color: "#1E1E1E",
  },

  searchBox: {
    width: "260px",
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
    gap: "20px",
  },

  left: {
    background: "#fff",
    borderRadius: "10px",
    padding: "16px",
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
    marginTop: "20px",
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
