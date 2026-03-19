import React from "react";

const ShoppingTable = ({
  shoppings = [],
  getProveedorNombre,
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

  if (shoppings.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧾</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay compras para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID", "Fecha", "N° Factura", "Proveedor", "Observaciones", "Costo total", "Acciones"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shoppings.map((shopping) => {
              const isActive = shopping.estado !== false;
              return (
                <tr
                  key={shopping.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={tdStyle}>{shopping.id}</td>

                  <td style={tdStyle}>
                    {shopping.fecha
                      ? new Date(shopping.fecha).toLocaleDateString("es-CO")
                      : "—"}
                  </td>

                  <td style={tdStyle}>{shopping.numeroFactura || "—"}</td>

                  <td style={tdStyle}>
                    {shopping.proveedor?.length > 25
                      ? shopping.proveedor.slice(0, 25) + "..."
                      : shopping.proveedor || "—"}
                  </td>

                  <td style={tdStyle}>
                    {shopping.observaciones?.length > 35
                      ? shopping.observaciones.slice(0, 35) + "..."
                      : shopping.observaciones || "—"}
                  </td>

                  <td style={tdStyle}>
                    {shopping.costoTotal != null
                      ? `$${Number(shopping.costoTotal).toLocaleString("es-CO")}`
                      : "—"}
                  </td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                      <button onClick={() => onView(shopping)} title="Ver detalles"
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

                      <button onClick={() => onEdit(shopping)} title="Editar"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button onClick={() => onDelete(shopping.id)} title="Eliminar"
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

                      <button
                        onClick={() => onToggle?.(shopping.id)}
                        title={isActive ? "Desactivar compra" : "Activar compra"}
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

export default ShoppingTable;