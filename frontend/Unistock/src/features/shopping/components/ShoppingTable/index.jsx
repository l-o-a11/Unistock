import React from "react";

const EstadoBadge = ({ anulada }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.03em",
    background: anulada ? "#fde8e8" : "#e8f5e9",
    color: anulada ? "#c0392b" : "#27ae60",
  }}>
    {anulada ? "Anulada" : "Activa"}
  </span>
);

const ShoppingTable = ({
  shoppings = [],
  getProveedorNombre,
  onView,
  onAnular,
}) => {
  const thStyle = {
    padding: "14px 20px", textAlign: "left", fontSize: "13px",
    fontWeight: "500", color: "#888", borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#f5f5f5", whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "16px 20px", fontSize: "14px", color: "#333",
    borderBottom: "1px solid #f1f1f1", whiteSpace: "nowrap",
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
              {["ID", "Fecha", "N° Factura", "Proveedor", "Observaciones", "Costo total", "Estado", "Acciones"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shoppings.map((shopping) => {
              const nombreProveedor = (() => {
                const porId = getProveedorNombre?.(shopping.proveedorId);
                if (porId && porId !== "—" && porId !== "Sin proveedor") return porId;
                return shopping.proveedor || "—";
              })();

              return (
                <tr key={shopping.id} style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>

                  <td style={tdStyle}>{shopping.consecutivo ?? shopping.id}</td>

                  <td style={tdStyle}>
                    {shopping.fecha ? new Date(shopping.fecha).toLocaleDateString("es-CO") : "—"}
                  </td>

                  <td style={tdStyle}>{shopping.numeroFactura || "—"}</td>

                  <td style={tdStyle}>
                    {nombreProveedor.length > 25 ? nombreProveedor.slice(0, 25) + "..." : nombreProveedor}
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

                  <td style={tdStyle}>
                    <EstadoBadge anulada={shopping.anulada} />
                  </td>

                  {/* Acciones: solo Ver y Anular */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                      {/* Ver */}
                      <button onClick={() => onView(shopping)} title="Ver detalles"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" />
                          <line x1="12" y1="12" x2="12" y2="16" />
                        </svg>
                      </button>

                      {/* Anular */}
                      <button
                        onClick={() => !shopping.anulada && onAnular(shopping.id)}
                        disabled={shopping.anulada}
                        title={shopping.anulada ? "Compra ya anulada" : "Anular compra"}
                        style={{
                          padding: "5px 12px", borderRadius: "6px",
                          border: shopping.anulada ? "1px solid #e5e7eb" : "1px solid #fca5a5",
                          background: shopping.anulada ? "#f9fafb" : "#fff5f5",
                          color: shopping.anulada ? "#d1d5db" : "#ef4444",
                          fontSize: "12px", fontWeight: 600,
                          cursor: shopping.anulada ? "not-allowed" : "pointer",
                          transition: "all 0.15s", whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (!shopping.anulada) {
                            e.currentTarget.style.background = "#ef4444";
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = "#ef4444";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!shopping.anulada) {
                            e.currentTarget.style.background = "#fff5f5";
                            e.currentTarget.style.color = "#ef4444";
                            e.currentTarget.style.borderColor = "#fca5a5";
                          }
                        }}>
                        Anular
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