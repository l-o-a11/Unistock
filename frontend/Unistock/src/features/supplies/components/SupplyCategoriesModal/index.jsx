import React, { useState, useEffect } from "react";

/**
 * SupplyCategoriesModal
 * Muestra las categorías de insumos en un modal con el mismo estilo de SuppliesPage.
 *
 * Props:
 *  - onClose: () => void
 *  - categorias: Array<{ _id, nombre, descripcion?, estado? }>
 *    (viene del hook useSupplies, ya disponible en SuppliesPage)
 */
const SupplyCategoriesModal = ({
  onEdit,
  onDelete,
  onClose,
  categorias = [],
  supplyCounts = {},
}) => {
  const thStyle = {
    padding: "14px 20px",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#f5f5f5",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #f5f5f5",
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const filtered = categorias.filter((c) => {
    const text = searchTerm.toLowerCase();
    const coincideBusqueda =
      c.nombre?.toLowerCase().includes(text) ||
      c.descripcion?.toLowerCase().includes(text);
    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && c.estado !== false) ||
      (estadoFiltro === "inactivos" && c.estado === false);
    return coincideBusqueda && coincideEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
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
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "24px",
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#f5f5f5",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "720px",
          padding: "28px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Categorías de Insumos
          </h2>

          {/* Buscador */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "6px 12px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#999"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar"
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#333",
                  width: "160px",
                  background: "transparent",
                }}
              />
            </div>

            {/* Cerrar */}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                display: "flex",
                alignItems: "center",
                padding: "4px",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              title="Cerrar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── TOOLBAR (contador) ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            padding: "10px 16px",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#888" }}>
            {filtered.length} categoría{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── TABLA ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#fafafa",
                  borderBottom: "1px solid #eee",
                }}
              >
                {["Nombre", "Cantidad de insumos", "Acciones"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: h === "Acciones" ? "center" : "left",
                      fontWeight: 600,
                      color: "#555",
                      fontSize: "13px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "#aaa",
                      fontSize: "14px",
                    }}
                  >
                    No se encontraron categorías
                  </td>
                </tr>
              ) : (
                paginated.map((cat, idx) => (
                  <tr
                    key={cat._id ?? idx}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fdf5fb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                  
                    {/*nombre*/}
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                      }}
                    >
                      {cat.nombre ?? "—"}
                    </td>
                    {/* cantidad de insumos */}
                    <td
                      style={{
                        padding: "10px 16px",
                        color: "#555",
                        fontSize: "13px",
                        textAlign: "left",
                      }}
                    >
                      {supplyCounts[String(cat.id ?? cat._id)] ?? 0}
                    </td>
                    {/* ACCIONES */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        {/* Edit button */}
                        <button
                          onClick={() => onEdit(cat)}
                          title="Editar categoría"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#555",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#E91E8C")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#555")
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => onDelete(cat.id)}
                          title="Eliminar categoría"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#555",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#ef4444")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#555")
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINACIÓN ── */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div
            style={{ display: "flex", justifyContent: "center", gap: "6px" }}
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
                    background: p === currentPage ? "#FF4FD6" : "#fff",
                    color: p === currentPage ? "#fff" : "#000",
                  }}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={paginationBtn}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyCategoriesModal;
