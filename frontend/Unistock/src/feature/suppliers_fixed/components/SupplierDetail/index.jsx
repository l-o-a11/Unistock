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
          style={{ width: "100%", maxWidth: "580px" }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #E91E8C, #E91E8C)",
              borderRadius: "12px 12px 0 0",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🏢</span>
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
                <p style={{ ...valueStyle, fontSize: "18px", fontWeight: "700" }}>
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
            <p style={{ ...labelStyle, marginBottom: "12px" }}>📋 Información de la empresa</p>
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
                <p style={valueStyle}>
                  {supplier.sitioWeb || supplier.sitioweb
                    ? <a href={supplier.sitioWeb || supplier.sitioweb} target="_blank" rel="noreferrer" style={{ color: "#E91E8C" }}>{supplier.sitioWeb || supplier.sitioweb}</a>
                    : "—"
                  }
                </p>
              </div>
            </div>

            <div style={divider} />

            {/* Datos contacto */}
            <p style={{ ...labelStyle, marginBottom: "12px" }}>👤 Contacto</p>
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

          {/* Footer con acciones */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              borderRadius: "0 0 12px 12px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#fff",
                color: "#555",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => { onClose(); onEdit(supplier); }}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #E91E8C, #E91E8C)",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              ✏️ Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
