import React from "react";

// Roles que no se pueden modificar ni eliminar
const ROLES_PROTEGIDOS = ["Administrador", "Gerente"];

const RolTable = ({ roles=[], onView, onEdit, onDelete, onToggle }) => {
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

  if (roles.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay roles para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre del rol</th>
              <th style={thStyle}>Descripción</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => {
              const isActive = rol.estado !== false;
              const protegido = ROLES_PROTEGIDOS.includes(rol.nombre);

              return (
                <tr
                  key={rol.id}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={tdStyle}>{rol.id}</td>

                  <td style={tdStyle}>
                    {rol.nombre && rol.nombre.length > 12 ? rol.nombre.slice(0, 12) + "..." : rol.nombre}
                  </td>

                  <td style={tdStyle}>
                    {rol.descripcion && rol.descripcion.length > 30
                      ? rol.descripcion.slice(0, 30) + "..."
                      : rol.descripcion}
                  </td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    {protegido ? (
                      /* Rol protegido — solo ver detalle + mensaje */
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button onClick={() => onView(rol)} title="Ver detalles del rol"
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
                        <span style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                          Este rol no se puede modificar
                        </span>
                      </div>
                    ) : (
                      /* Rol normal — todas las acciones */
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                        <button onClick={() => onView(rol)} title="Ver detalles del rol"
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

                        <button onClick={() => onEdit(rol)} title="Editar rol"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        <button onClick={() => onDelete(rol.id)} title="Eliminar rol"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>

                        <button onClick={() => onToggle?.(rol.id)}
                          style={{ position: "relative", width: "44px", height: "24px", borderRadius: "20px", border: "none", backgroundColor: isActive ? "#22c55e" : "#d1d5db", cursor: "pointer" }}
                        >
                          <span style={{ position: "absolute", top: "2px", left: isActive ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#fff", transition: "0.2s" }} />
                        </button>

                      </div>
                    )}
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

export default RolTable;