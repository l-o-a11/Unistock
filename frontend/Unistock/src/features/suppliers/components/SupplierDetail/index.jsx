import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// BADGE DE ESTADO — patrón ShoppingDetail
// ─────────────────────────────────────────────────────────────────────────────
const EstadoBadge = ({ activo }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
    background: activo ? "#e8f5e9" : "#f3f4f6",
    color:      activo ? "#27ae60" : "#6b7280",
  }}>
    {activo ? "Activo" : "Inactivo"}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS BASE — alineados con ShoppingDetail
// ─────────────────────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, color: "#bbb", marginBottom: 4,
  display: "block", letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const valueStyle = {
  fontSize: 14, color: "#111", fontWeight: 500,
  margin: 0, wordBreak: "break-word", overflowWrap: "anywhere",
};

const fieldBox = { display: "flex", flexDirection: "column", gap: 2 };

const divider = { borderBottom: "1px solid #f0f0f0", margin: "16px 0" };

// Título de subsección con ícono — patrón consistente con ShoppingDetail
const SectionLabel = ({ icon, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
    {icon}
    <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {children}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const SupplierDetail = ({ supplier, onClose, onEdit }) => {
  if (!supplier) return null;

  const isActive = supplier.estado !== false;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(92, 13, 13, 0.25)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 14,
          width: "100%", maxWidth: 580,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          scrollbarGutter: "stable",
        }}
      >
        {/* ── Header — patrón ShoppingDetail ── */}
        <div style={{
          display: "flex", justifyContent: "", alignItems: "center",
          padding: "20px 16px", borderBottom: "1px solid #f0f0f0",
        }}><div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "#ff4fd6",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  <line x1="12" y1="12" x2="12" y2="16"/>
                  <line x1="8"  y1="12" x2="8"  y2="12.01"/>
                  <line x1="16" y1="12" x2="16" y2="12.01"/>
                </svg>
              </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: "10px", fontSize: 17, fontWeight: 700, color: "#111" }}>
              Detalle del proveedor
            </h2>
            <EstadoBadge activo={isActive} />
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 20, lineHeight: 1, padding: "2px 6px", borderRadius: 6, marginLeft: "auto" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px" }}>

          {/* Nombre empresa grande + badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <span style={labelStyle}>Empresa</span>
              <p style={{ ...valueStyle, fontSize: 18, fontWeight: 700 }}>
                {supplier.nombreEmpresa}
              </p>
            </div>
            {/* NIT pill — pink, igual que badge de NIT en edición del form */}
            {supplier.nit && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#ff4fd6",
                background: "#fff0fb", padding: "3px 10px",
                borderRadius: 20, border: "1px solid #f9a8d4",
                whiteSpace: "nowrap", marginTop: 2,
              }}>
                NIT: {supplier.nit}
              </span>
            )}
          </div>

          <div style={divider} />

          {/* ── Información de la empresa ── */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
          }>
            Información de la empresa
          </SectionLabel>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
            <div style={fieldBox}>
              <span style={labelStyle}>Dirección</span>
              <p style={valueStyle}>{supplier.direccion || "—"}</p>
            </div>
            <div style={fieldBox}>
              <span style={labelStyle}>Correo empresa</span>
              <p style={valueStyle}>{supplier.correoEmpresa || supplier.email || "—"}</p>
            </div>
            <div style={fieldBox}>
              <span style={labelStyle}>Sitio web</span>
              {supplier.sitioWeb || supplier.sitioweb ? (
                <a
                  href={supplier.sitioWeb || supplier.sitioweb}
                  target="_blank" rel="noreferrer"
                  style={{ ...valueStyle, color: "#FF4FD6", fontSize: 13, wordBreak: "break-all" }}
                >
                  {supplier.sitioWeb || supplier.sitioweb}
                </a>
              ) : (
                <p style={valueStyle}>—</p>
              )}
            </div>
          </div>

          <div style={divider} />

          {/* ── Persona de contacto ── */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }>
            Persona de contacto
          </SectionLabel>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldBox}>
              <span style={labelStyle}>Nombre</span>
              <p style={valueStyle}>{supplier.nombreContacto || "—"}</p>
            </div>
            <div style={fieldBox}>
              <span style={labelStyle}>Teléfono</span>
              <p style={valueStyle}>{supplier.telefono || "—"}</p>
            </div>
            <div style={fieldBox}>
              <span style={labelStyle}>Correo contacto</span>
              <p style={valueStyle}>{supplier.correoContacto || "—"}</p>
            </div>
          </div>
        </div>

        {/* ── Footer — solo Cerrar, patrón ShoppingDetail ── */}
        <div style={{
          padding: "12px 24px",
          borderTop: "1px solid #f0f0f0",
          display: "flex", justifyContent: "flex-end", gap: 10,
        }}>
          
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px", borderRadius: 8, fontSize: 13,
              fontWeight: 700, cursor: "pointer",
              border: "none", background: "#ff4fd6", color: "#fff",
              boxShadow: "0 4px 12px rgba(255,79,214,0.25)",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;