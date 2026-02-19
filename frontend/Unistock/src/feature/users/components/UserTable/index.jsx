import React from "react";
import HoverCard from "../HoverCard";

const UserTable = ({ users = [], onEdit, onDelete, onToggle }) => {

  const thStyle = {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap",
    backgroundColor: "#f5f5f5",
  };

  const tdStyle = {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #f5f5f5",
    whiteSpace: "nowrap",
  };

  if (users.length === 0) {
    return (
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "64px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>
          No hay usuarios para mostrar
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      overflow: "visible"
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Tipo de documento</th>
              <th style={thStyle}>Documento</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Correo</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Sede</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {

              const isActive = user.estado !== false;

              return (
                <tr
                  key={user.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={tdStyle}>{user.tipoDocumento}</td>
                  <td style={tdStyle}>{user.numeroDocumento}</td>

                  {/* 🔥 Nombre con HoverCard */}
                  <td style={tdStyle}>
                    <HoverCard
                      position="right"
                      content={
                        <div>
                          <h3 style={{
                            margin: "0 0 8px 0",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#222"
                          }}>
                            Información del usuario
                          </h3>

                          <p style={{
                            margin: "0 0 12px 0",
                            fontSize: "14px",
                            color: "#444"
                          }}>
                            {user.nombreCompleto}
                          </p>

                          <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                            Documento: <strong>{user.tipoDocumento} {user.numeroDocumento}</strong>
                          </p>

                          <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                            Rol: <strong>{user.rol}</strong>
                          </p>

                          <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                            Sede: {user.sede}
                          </p>

                          <hr style={{ margin: "12px 0", borderColor: "#eee" }} />

                          <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                            Estado actual · {isActive ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                      }
                    >
                      <span style={{ fontWeight: 500 }}>
                        {user.nombreCompleto}
                      </span>
                    </HoverCard>
                  </td>

                  <td style={tdStyle}>{user.correo}</td>
                  <td style={tdStyle}>{user.rol}</td>
                  <td style={tdStyle}>{user.sede}</td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                      {/* Edit */}
                      <button onClick={() => onEdit(user)} title="Editar producto"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button onClick={() => onDelete(user.id)} title="Eliminar producto"
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

                      {/* Toggle */}
                      <button
                        onClick={() => onToggle?.(user.id)}
                        title={isActive ? "Desactivar" : "Activar"}
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                          border: "none",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <span style={{
                          position: "absolute",
                          left: isActive ? "22px" : "2px",
                          top: "2px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                          transition: "left 0.2s",
                        }} />
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

export default UserTable;