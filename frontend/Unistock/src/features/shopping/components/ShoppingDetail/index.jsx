import React from "react";

const EstadoBadge = ({ anulada }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.03em",
      background: anulada ? "#fde8e8" : "#e8f5e9",
      color: anulada ? "#c0392b" : "#27ae60",
    }}
  >
    {anulada ? "Anulada" : "Activa"}
  </span>
);

const ShoppingDetail = ({ shopping, getProveedorNombre, onClose }) => {
  if (!shopping) return null;

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(3px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "16px",
  };

  const thStyle = {
    padding: "10px 14px", textAlign: "left",
    fontSize: "11px", fontWeight: 700,
    color: "#888", letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "12px 14px", fontSize: "13px",
    color: "#333", borderBottom: "1px solid #f0f0f0",
  };

  const labelStyle = { fontSize: "11px", color: "#999", marginBottom: "4px", display: "block" };
  const valueStyle = { fontSize: "14px", color: "#111", fontWeight: 500 };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "14px",
          width: "100%", maxWidth: "620px",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          scrollbarGutter: "stable",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#111" }}>
              Detalle de Compra
            </h2>
            <EstadoBadge anulada={shopping.anulada} />
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "20px", lineHeight: 1, padding: "2px 6px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            ×
          </button>
        </div>

        {/* Banner anulación */}
        {shopping.anulada && shopping.motivoAnulacion && (
          <div style={{
            margin: "16px 24px 0",
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            display: "flex", gap: "8px", alignItems: "flex-start",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626" }}>Motivo de anulación: </span>
              <span style={{ fontSize: 11, color: "#b91c1c" }}>{shopping.motivoAnulacion}</span>
              {shopping.fechaAnulacion && (
                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "8px" }}>
                  · {new Date(shopping.fechaAnulacion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Info general */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "20px", alignItems: "start" }}>
            <div>
              <span style={labelStyle}>ID</span>
              <span style={valueStyle}>{shopping.id}</span>
            </div>
            <div>
              <span style={labelStyle}>Número de factura</span>
              <span style={valueStyle}>{shopping.numeroFactura || "—"}</span>
            </div>
            <div>
              <span style={labelStyle}>Fecha</span>
              <span style={valueStyle}>
                {shopping.fecha
                  ? new Date(shopping.fecha).toLocaleDateString("es-CO")
                  : "—"}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={labelStyle}>Costo total</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#FF4FD6" }}>
                ${Number(shopping.costoTotal || 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
            <div>
              <span style={labelStyle}>Proveedor</span>
              <span style={valueStyle}>{getProveedorNombre?.(shopping.proveedorId) || "—"}</span>
            </div>
            <div>
              <span style={labelStyle}>Observaciones</span>
              <span style={{ ...valueStyle, fontWeight: 400, color: "#555", lineHeight: 1.5 }}>
                {shopping.observaciones || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla detalles */}
        <div style={{ padding: "16px 24px 24px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 600, color: "#333" }}>
            Detalle de compras
          </p>

          {shopping.detalles?.length > 0 ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th style={thStyle}>ID DETALLE</th>
                    <th style={thStyle}>PRODUCTO/INSUMO</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>CANTIDAD</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>COSTO UNIT.</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {shopping.detalles.map((d, index) => (
                    <tr
                      key={d.id || index}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={tdStyle}>{d.id || index + 101}</td>
                      <td style={tdStyle}>{d.nombre}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>{d.cantidad}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        ${Number(d.costoUnitario || 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                        ${Number(d.costo || 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "#bbb", fontSize: "13px", border: "1px dashed #e5e7eb", borderRadius: "8px" }}>
              No hay detalles registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingDetail;