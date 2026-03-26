import React from "react";
import HoverCard from "../../../shared/components/HoverCart";

const SupplyTable = ({
  supplies = [],
  getCategoriaNombre,
  getMedidaNombre,
  onView,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const thStyle = {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#f5f5f5",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #f1f1f1",
    whiteSpace: "nowrap",
  };

  if (supplies.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay insumos para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ overflowX: "visible" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Imagen", "ID", "Nombre del insumo", "Categoría", "Stock", "Medida", "Acciones"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supplies.map((supply) => {
              const isActive = supply.estado !== false;
              return (
                <tr
                  key={supply.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Imagen */}
                  <td style={tdStyle}>
                    <HoverCard
                      content={
                        <div>
                          <p style={{ fontWeight: "600", marginBottom: "8px", color: "#333" }}>Imagen del insumo</p>
                          {supply.image ? (
                            <img src={supply.image} alt={supply.nombre} style={{ width: "128px", height: "128px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} />
                          ) : (
                            <div style={{ width: "128px", height: "128px", backgroundColor: "#f5f5f5", borderRadius: "8px", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "14px" }}>Sin imagen</div>
                          )}
                          <p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>ID: {supply.id}</p>
                        </div>
                      }
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", flexShrink: 0 }}>
                        {supply.image ? (
                          <img src={supply.image} alt={supply.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "10px" }}>🖼️</div>
                        )}
                      </div>
                    </HoverCard>
                  </td>

                  <td style={tdStyle}>{supply.id}</td>
                  <td style={tdStyle}>{supply.nombre?.length > 30 ? supply.nombre.slice(0, 30) + "..." : supply.nombre}</td>
                  <td style={tdStyle}>{getCategoriaNombre(supply.categoriaId)}</td>
                  <td style={tdStyle}>{supply.stock}</td>
                  <td style={tdStyle}>{`${supply.valorMedida ?? ""} ${getMedidaNombre(supply.medidaId)}`}</td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                      <button onClick={() => onView(supply)} title="Ver detalles"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" />
                          <line x1="12" y1="12" x2="12" y2="16" />
                        </svg>
                      </button>

                      <button onClick={() => onEdit(supply)} title="Editar"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button onClick={() => onDelete(supply.id)} title="Eliminar"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" /><path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>

                      {/* Toggle — delega completamente al padre, sin lógica local */}
                      <button
                        onClick={() => onToggle?.(supply.id)}
                        title={isActive ? "Desactivar insumo" : "Activar insumo"}
                        style={{ position: "relative", width: "44px", height: "24px", borderRadius: "20px", border: "none", backgroundColor: isActive ? "#22c55e" : "#d1d5db", cursor: "pointer" }}
                      >
                        <span style={{ position: "absolute", top: "2px", left: isActive ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#fff", transition: "0.2s" }} />
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
  );
};

export default SupplyTable;