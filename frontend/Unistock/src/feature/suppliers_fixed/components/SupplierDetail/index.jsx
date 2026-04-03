import React from "react";

// ✅ Fix #3: JSX corregido y contenido completo del detalle del proveedor
const SupplierDetail = ({ supplier, onClose, onEdit }) => {
  if (!supplier) return null;

  const isActive = supplier.estado !== false;

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#190202",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "2px",
  };

  const valueStyle = {
    fontSize: "14px",
    color: "#222",
    margin: 0,
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  const fieldBox = {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  const divider = {
    borderBottom: "1px solid #f0f0f0",
    margin: "16px 0",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl"
          style={{ width: "100%", maxWidth: "580px", overflow: "hidden" }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #FF4FD6, #FF4FD6)",
              borderRadius: "12px 12px 0 0",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#fff" }}>
                Detalle del Proveedor
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px" }}>

            {/* Nombre empresa + estado */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <div>
                <p style={{ ...labelStyle }}>Empresa</p>
                <p style={{ ...valueStyle, fontSize: "18px", fontWeight: "700", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                  {supplier.nombreEmpresa}
                </p>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
                  color: isActive ? "#16a34a" : "#6b7280",
                }}
              >
                {isActive ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div style={divider} />

            {/* Datos empresa */}
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
              <p style={{ ...labelStyle, margin:0 }}>Información de la empresa</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "4px" }}>
              <div style={fieldBox}>
                <span style={labelStyle}>NIT</span>
                <p style={valueStyle}>{supplier.nit}</p>
              </div>
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
                <p style={{ ...valueStyle, wordBreak:"break-all", overflowWrap:"anywhere" }}>
                  {supplier.sitioWeb || supplier.sitioweb
                    ? <a href={supplier.sitioWeb || supplier.sitioweb} target="_blank" rel="noreferrer"
                        style={{ color:"#FF4FD6", fontSize:12, display:"block", wordBreak:"break-all", overflowWrap:"anywhere" }}
                        title={supplier.sitioWeb || supplier.sitioweb}>
                        {supplier.sitioWeb || supplier.sitioweb}
                      </a>
                    : "—"
                  }
                </p>
              </div>
            </div>

            <div style={divider} />

            {/* Datos contacto */}
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <p style={{ ...labelStyle, margin:0 }}>Contacto</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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

          {/* Footer — solo Cerrar */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "flex-end",
              borderRadius: "0 0 12px 12px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "9px 28px",
                border: "none",
                borderRadius: "9px",
                background: "#FF4FD6",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "700",
                boxShadow: "0 4px 12px rgba(255,79,214,0.3)",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
