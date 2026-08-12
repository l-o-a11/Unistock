import React from "react";
import HoverCard from "../../../shared/components/HoverCart";

const truncate = (text, max = 18) => {
  if (!text) return { text: "", truncated: false };
  const truncated = text.length > max;
  return { text: truncated ? text.slice(0, max) + "..." : text, truncated };
};

const SupplierTable = ({ suppliers = [], onView, onEdit, onDelete, onToggle }) => {

  const thStyle = {
    padding: "14px 20px", textAlign: "left", fontSize: "13px",
    fontWeight: "500", color: "#888", borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", backgroundColor: "#f5f5f5",
  };
  const tdStyle = {
    padding: "14px 20px", fontSize: "14px", color: "#333",
    borderBottom: "1px solid #f5f5f5",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  };
  const tdActionsStyle = { ...tdStyle, overflow: "visible", textOverflow: "clip" };

  if (suppliers.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay proveedores para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "16%" }}>Documento</th>
                <th style={{ ...thStyle, width: "24%" }}>Nombre de empresa</th>
                <th style={{ ...thStyle, width: "20%" }}>Nombre de contacto</th>
                <th style={{ ...thStyle, width: "22%" }}>Dirección</th>
                <th style={{ ...thStyle, width: "130px", overflow: "visible" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => {
                const isActive = supplier.estado !== false;
                return (
                  <tr key={supplier.id}
                    style={{ transition: "background 0.15s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={() => onView?.(supplier)}
                  >
                    <td style={tdStyle}>
                      {(() => { const { text, truncated } = truncate(supplier.nit); return truncated ? (
                        <HoverCard title="Información proveedor" fields={[{ label: "NIT", value: supplier.nit, highlight: true }]}>
                          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                        </HoverCard>
                      ) : (
                        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                      ); })()}
                    </td>
                    <td style={tdStyle}> 
                      {(() => { const { text, truncated } = truncate(supplier.nombreEmpresa); return truncated ? (
                        <HoverCard title="Información proveedor" fields={[{ label: "Empresa", value: supplier.nombreEmpresa, highlight: true }]}>
                          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                        </HoverCard>
                      ) : (
                        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                      ); })()}
                    </td>
                    <td style={tdStyle}>
                      {(() => { const { text, truncated } = truncate(supplier.nombreContacto); return truncated ? (
                        <HoverCard title="Información proveedor" fields={[{ label: "Contacto", value: supplier.nombreContacto }]}>
                          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                        </HoverCard>
                      ) : (
                        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                      ); })()}
                    </td>
                    <td style={tdStyle}>
                      {(() => { const { text, truncated } = truncate(supplier.direccion); return truncated ? (
                        <HoverCard title="Información proveedor" fields={[{ label: "Dirección", value: supplier.direccion }]}>
                          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                        </HoverCard>
                      ) : (
                        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{text}</span>
                      ); })()}
                    </td>
                    <td style={tdActionsStyle} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                        <button onClick={(e) => { e.stopPropagation(); onView?.(supplier); }} title="Ver detalle"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", flexShrink: 0 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4FD6")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8.5"/><line x1="12" y1="12" x2="12" y2="16"/>
                          </svg>
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(supplier); }} title="Editar proveedor"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", flexShrink: 0 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4FD6")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); onDelete?.(supplier.id); }} title="Eliminar proveedor"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", flexShrink: 0 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onToggle?.(supplier.id, !isActive); }}
                          title={isActive ? "Inactivar proveedor" : "Activar proveedor"}
                          style={{
                            position: "relative",
                            width: "44px",
                            minWidth: "44px",
                            height: "24px",
                            minHeight: "24px",
                            flexShrink: 0,
                            boxSizing: "border-box",
                            borderRadius: "20px",
                            border: "none",
                            backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                            cursor: "pointer",
                            padding: 0,
                          }}>
                          <span style={{
                            position: "absolute",
                            top: "2px",
                            left: isActive ? "22px" : "2px",
                            width: "20px",
                            height: "20px",
                            minWidth: "20px",
                            minHeight: "20px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            transition: "0.2s",
                            boxSizing: "border-box",
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

    </>
  );
};

export default SupplierTable;