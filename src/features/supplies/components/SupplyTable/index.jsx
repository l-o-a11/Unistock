import React, { useState } from "react";
import HoverCard from "../../../shared/components/HoverCart";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";

const SupplyTable = ({
  supplies = [],
  getCategoriaNombre,
  getMedidaNombre,
  onView,
  onEdit,
  onDelete,
  onToggle,
  onStockChange,
  onStockError,
  startIndex = 0,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [hoveredSupplyId, setHoveredSupplyId] = useState(null);
  const [stockDrafts, setStockDrafts] = useState({});

  const getStockDraft = (supply) =>
    Object.prototype.hasOwnProperty.call(stockDrafts, supply.id)
      ? stockDrafts[supply.id]
      : supply.stock ?? 0;

  const commitStock = async (supply) => {
    const rawValue = getStockDraft(supply);
    if (rawValue === "") {
      setStockDrafts((current) => ({ ...current, [supply.id]: supply.stock ?? 0 }));
      return;
    }

    const nextStock = Number(rawValue);
    const currentStock = Number(supply.stock) || 0;
    if (nextStock > currentStock) {
      onStockError?.("El stock solo puede disminuirse, no aumentarse.");
      setStockDrafts((current) => ({ ...current, [supply.id]: currentStock }));
      return;
    }
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setStockDrafts((current) => ({ ...current, [supply.id]: currentStock }));
      return;
    }

    if (nextStock !== currentStock) {
      const updated = await onStockChange?.(supply.id, nextStock);
      if (updated === false) {
        setStockDrafts((current) => ({ ...current, [supply.id]: currentStock }));
        return;
      }
    }
    setStockDrafts((current) => ({ ...current, [supply.id]: nextStock }));
  };

  const decreaseStock = async (supply) => {
    const currentStock = Number(supply.stock) || 0;
    if (currentStock <= 0) return;

    const nextStock = currentStock - 1;
    const updated = await onStockChange?.(supply.id, nextStock);
    if (updated !== false) {
      setStockDrafts((current) => ({ ...current, [supply.id]: nextStock }));
    }
  };

  const thStyle = {
    padding: isMobile ? "10px 12px" : "14px 20px",
    textAlign: "left",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#f5f5f5",
    whiteSpace: isMobile ? "normal" : "nowrap",
    overflow: isMobile ? "visible" : "hidden",
    textOverflow: isMobile ? "clip" : "ellipsis",
    fontFamily: "inherit",
  };

  const tdStyle = {
    padding: isMobile ? "10px 12px" : "8px 20px",
    fontSize: isMobile ? "13px" : "14px",
    color: "#333",
    borderBottom: "1px solid #f5f5f5",
    whiteSpace: isMobile ? "normal" : "nowrap",
    overflow: isMobile ? "visible" : "hidden",
    textOverflow: isMobile ? "clip" : "ellipsis",
    fontFamily: "inherit",
  };

  const tdActionsStyle = {
    ...tdStyle,
    overflow: "visible",
    textOverflow: "clip",
    whiteSpace: "nowrap",
  };

  const tdImageStyle = {
    ...tdStyle,
    overflow: "visible",
    textOverflow: "clip",
    position: "relative",
  };

  if (supplies.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "64px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>
          No hay insumos para mostrar
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .stock-table-input::-webkit-inner-spin-button,
        .stock-table-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .stock-table-input {
          -moz-appearance: textfield;
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          minWidth: 0,
        }}
      >
        <div
          className="table-scroll-wrapper"
          style={{ paddingBottom: "10px", minWidth: 0 }}
        >
          <table
            className="responsive-data-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "auto",
            }}
          >
          <thead>
            <tr>
              {[
                { label: "Imagen", width: "10%" },
                { label: "Nombre del insumo", width: "25%" },
                { label: "Categoría", width: "20%" },
                { label: "Stock", width: "15%" },
                { label: "Medida", width: "15%" },
                { label: "Acciones", width: "15%" },
              ].map((h) => (
                <th key={h.label} style={{ ...thStyle, width: h.width }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supplies.map((supply, index) => {
              const isActive = supply.estado !== false;
              return (
                <tr
                  key={supply.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {/* Imagen */}
                  <td style={tdImageStyle}>
                    <div
                      className="relative inline-flex"
                      style={{ position: "relative" }}
                      onMouseEnter={() => setHoveredSupplyId(supply.id)}
                      onMouseLeave={() => setHoveredSupplyId(null)}
                    >
                      {supply.imagen ? (
                        <img
                          src={supply.imagen}
                          alt={supply.nombre}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 cursor-pointer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs cursor-pointer">
                          🖼️
                        </div>
                      )}

                      {hoveredSupplyId === supply.id && (
                        <div
                          style={{
                            position: "absolute",
                            left: "calc(100% + 12px)",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: supply.imagen ? 200 : 170,
                            minHeight: supply.imagen ? 200 : 90,
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.15)",
                            padding: supply.imagen ? "10px" : "16px",
                            zIndex: 40,
                            pointerEvents: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {supply.imagen ? (
                            <img
                              src={supply.imagen}
                              alt={supply.nombre}
                              style={{
                                width: "100%",
                                height: "100%",
                                maxHeight: 180,
                                objectFit: "contain",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6b7280",
                                fontSize: "14px",
                                borderRadius: "8px",
                                backgroundColor: "#f3f4f6",
                              }}
                            >
                              Sin imagen
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td style={{ ...tdStyle, width: "35%" }}>
                    {supply.nombre?.length > 30
                      ? supply.nombre.slice(0, 30) + "..."
                      : supply.nombre}
                  </td>
                  <td style={{ ...tdStyle, width: "20%" }}>
                    {getCategoriaNombre(supply.categoriaId)}
                  </td>
                  <td style={{ ...tdStyle, width: "10%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => decreaseStock(supply)}
                        disabled={(Number(supply.stock) || 0) <= 0}
                        title="Disminuir stock"
                        style={{
                          width: "22px",
                          minWidth: "22px",
                          height: "22px",
                          minHeight: "22px",
                          borderRadius: "50%",
                          border: "1px solid #f9a8d4",
                          background: "#fff",
                          color: (Number(supply.stock) || 0) <= 0 ? "#d1d5db" : "#ff4fd6",
                          fontSize: "14px",
                          fontWeight: "700",
                          lineHeight: 1,
                          cursor: (Number(supply.stock) || 0) > 0 ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(event) => {
                          if ((Number(supply.stock) || 0) > 0) event.currentTarget.style.backgroundColor = "#fff0fb";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.backgroundColor = "#fff";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="stock-table-input"
                        min="0"
                        max={Number(supply.stock) || 0}
                        step="1"
                        value={getStockDraft(supply)}
                        aria-label={`Stock de ${supply.nombre}`}
                        onChange={(event) =>
                          setStockDrafts((current) => ({
                            ...current,
                            [supply.id]: event.target.value,
                          }))
                        }
                        onBlur={() => commitStock(supply)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                        style={{
                          width: "58px",
                          padding: "4px 5px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "5px",
                          textAlign: "center",
                          font: "inherit",
                          appearance: "textfield",
                          WebkitAppearance: "none",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{ ...tdStyle, width: "12%" }}
                  >{`${supply.valorMedida ?? ""} ${getMedidaNombre(supply.medidaId)}`}</td>

                  {/* Acciones */}
                  <td className="table-actions" style={{ ...tdActionsStyle, width: "15%" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => onView?.(supply)}
                        title="Ver detalles"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#555",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#8b5cf6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#555")
                        }
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="8.5"
                            strokeWidth="2.5"
                          />
                          <line x1="12" y1="12" x2="12" y2="16" />
                        </svg>
                      </button>

                      <button
                        onClick={() => onEdit(supply)}
                        title="Editar"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#555",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#8b5cf6")
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

                      <button
                        onClick={() => onDelete(supply.id)}
                        title="Eliminar"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#555",
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

                      {/* Toggle — delega completamente al padre, sin lógica local */}
                      <button
                        onClick={() => onToggle?.(supply.id)}
                        title={
                          isActive ? "Desactivar insumo" : "Activar insumo"
                        }
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "24px",
                          borderRadius: "20px",
                          border: "none",
                          backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: isActive ? "22px" : "2px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            transition: "0.2s",
                          }}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
};

export default SupplyTable;
