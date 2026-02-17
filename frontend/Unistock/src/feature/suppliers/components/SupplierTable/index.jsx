import React from "react";
import HoverCard from "../HoverCard";

const supplierTable = ({ suppliers = [], onView, onEdit, onDelete, onToggle }) => {
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
 
  if (suppliers.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay proveedores para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Nit</th>
              <th style={thStyle}>Nombre de empresa</th>
              <th style={thStyle}>Nombre de contacto</th>
              <th style={thStyle}>Dirección</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => {
              const isActive = supplier.estado !== false;

              return (
                <tr
                  key={supplier.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* NIT */}
                  <td style={tdStyle}>
                    <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>NIT del proveedor</p><p style={{ fontSize: "13px", color: "#555" }}>{supplier.nit}</p></div>}>
                      <span style={{ cursor: "help", color: "#333" }}>{supplier.nit}</span>
                    </HoverCard>
                  </td>

                  {/* Nombre Empresa */}
                  <td style={tdStyle}>
                    <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>Información de la empresa</p><p style={{ fontSize: "13px", color: "#555" }}>{supplier.nombreEmpresa}</p></div>}>
                      <span style={{ cursor: "help" }}>{supplier.nombreEmpresa && supplier.nombreEmpresa.length > 15 ? supplier.nombreEmpresa.slice(0, 15) + "..." : supplier.nombreEmpresa}</span>
                    </HoverCard>
                  </td>

                  {/* Nombre Contacto */}
                  <td style={tdStyle}>
                    <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>Contacto</p><p style={{ fontSize: "13px", color: "#555" }}>{supplier.nombreContacto}</p></div>}>
                      <span style={{ cursor: "help" }}>{supplier.nombreContacto && supplier.nombreContacto.length > 12 ? supplier.nombreContacto.slice(0, 12) + "..." : supplier.nombreContacto}</span>
                    </HoverCard>
                  </td>

                  {/* Dirección */}
                  <td style={tdStyle}>
                    <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>Dirección completa</p><p style={{ fontSize: "13px", color: "#555" }}>{supplier.direccion}</p></div>}>
                      <span style={{ cursor: "help" }}>{supplier.direccion && supplier.direccion.length > 18 ? supplier.direccion.slice(0, 18) + "..." : supplier.direccion}</span>
                    </HoverCard>
                  </td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                      {/* ⓘ info */}
                      <HoverCard content={<div style={{ padding: "8px" }}><p style={{ fontWeight: "600", marginBottom: "4px", color: "#333", fontSize: "12px" }}>{supplier.nombreEmpresa}</p><p style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>📧 {supplier.email}</p><p style={{ fontSize: "11px", color: "#666" }}>📞 {supplier.telefono}</p></div>}>
                        <button 
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="1.5" />
                            <line x1="12" y1="12" x2="12" y2="16" />
                          </svg>
                        </button>
                      </HoverCard>

                      

                      

                      {/* ✏️ edit */}
                      <button onClick={() => onEdit(supplier)} title="Editar proveedor"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* 🗑️ delete */}
                      <button onClick={() => onDelete(supplier.id)} title="Eliminar proveedor"
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

                      {/* 🟢 Toggle switch */}
                      <button
                        onClick={() => onToggle?.(supplier.id)}
                        title={isActive ? "Desactivar" : "Activar"}
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          flexShrink: 0,
                          transition: "background-color 0.2s",
                        }}
                      >
                        {/* Knob */}
                        <span style={{
                          position: "absolute",
                          left: isActive ? "22px" : "2px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                          transition: "left 0.2s",
                        }} />
                        {/* Checkmark — only when active */}
                        {isActive && (
                          <svg
                            style={{ position: "absolute", left: "5px", width: "11px", height: "11px", color: "#fff", pointerEvents: "none" }}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
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

export default supplierTable;