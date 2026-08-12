import React from "react";

const SedeTable = ({
  sedes = [],
  onView,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const thStyle = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#f5f5f5",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "16px 16px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #f1f1f1",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  if (sedes.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏢</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay sedes para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              {[ 
                { label: "Nombre", width: "18%" },
                { label: "Ciudad", width: "14%" },
                { label: "Barrio", width: "14%" },
                { label: "Dirección", width: "28%" },
                { label: "Teléfono", width: "12%" },
                { label: "Acciones", width: "14%" },
              ].map((h) => (
                <th key={h.label} style={{ ...thStyle, width: h.width }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sedes.map((sede) => {
              const isActive = sede.estado !== false;
              return (
                <tr
                  key={sede.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ ...tdStyle, width: "18%" }}>{sede.nombre}</td>
                  <td style={{ ...tdStyle, width: "14%" }}>{sede.ciudad}</td>
                  <td style={{ ...tdStyle, width: "14%" }}>{sede.barrio}</td>
                  <td style={{ ...tdStyle, width: "28%" }}>
                    {sede.direccion?.length > 30
                      ? sede.direccion.slice(0, 30) + "..."
                      : sede.direccion}
                  </td>
                  <td style={{ ...tdStyle, width: "12%" }}>{sede.telefono}</td>

                  {/* Acciones */}
                  <td style={{ ...tdStyle, width: "14%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                     

                      {/* Editar */}
                      <button onClick={() => onEdit(sede)} title="Editar"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4FD6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Eliminar */}
                      <button onClick={() => onDelete(sede.id)} title="Eliminar"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" /><path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>

                      {/* Toggle */}
                      <button
                        onClick={() => onToggle?.(sede.id)}
                        title={isActive ? "Desactivar sede" : "Activar sede"}
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

export default SedeTable;