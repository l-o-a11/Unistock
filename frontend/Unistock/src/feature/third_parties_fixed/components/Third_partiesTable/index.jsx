import React, { useState } from "react";
import HoverCard from "../../../shared/components/HoverCart";
import Alert from "../Alert";

const Third_partieTable = ({
  Third_parties = [],
  onView,
  onEdit,
  onDelete,
  onToggle,
}) => {

  // ✅ Fix: alerta de confirmación para toggle de estado
  const [toggleAlert, setToggleAlert] = useState({
    open: false,
    thirdId: null,
    isActive: false,
  });

  const handleToggleClick = (t) => {
    setToggleAlert({
      open: true,
      thirdId: t.id,
      isActive: t.estado !== false,
    });
  };

  const confirmToggle = () => {
    onToggle?.(toggleAlert.thirdId);
    setToggleAlert({ open: false, thirdId: null, isActive: false });
  };

  const cancelToggle = () => {
    setToggleAlert({ open: false, thirdId: null, isActive: false });
  };

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

  if (Third_parties.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <p style={{ color: "#999" }}>No hay terceros para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <Alert
        isOpen={toggleAlert.open}
        type="password"
        title={toggleAlert.isActive ? "Inactivar tercero" : "Activar tercero"}
        message={
          toggleAlert.isActive
            ? "Para inactivar este tercero ingresa la contraseña de administrador."
            : "Para activar este tercero ingresa la contraseña de administrador."
        }
        onConfirm={confirmToggle}
        onCancel={cancelToggle}
      />

      <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Contacto principal</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Third_parties.map((t) => {
                const isActive = t.estado !== false;
                return (
                  <tr
                    key={t.id}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* CODIGO */}
                    <td style={tdStyle}>{t.id}</td>

                    {/* NOMBRE */}
                  
<td style={tdStyle}>
  <HoverCard
    title="Información proveedor"
    fields={[
      { label: "Empresa", value: t.nombreEmpresa, highlight: true }
    ]}
  >
    {t.nombreEmpresa && t.nombreEmpresa.length > 20
      ? t.nombreEmpresa.slice(0, 20) + "..."
      : t.nombreEmpresa}
  </HoverCard>
</td>

                    {/* CONTACTO */}
<td style={tdStyle}>
  <HoverCard
    title="Información proveedor"
    fields={[
      { label: "Contacto", value: t.nombreContacto }
    ]}
  >
    {t.nombreContacto && t.nombreContacto.length > 18
      ? t.nombreContacto.slice(0, 18) + "..."
      : t.nombreContacto}
  </HoverCard>
</td>

                    {/* ACCIONES */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                        {/* ⓘ Ver detalle */}
                        <button
                          onClick={() => onView?.(t)}
                          title="Ver detalle"
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

                        {/* ✅ Fix: botón editar */}
                        <button
                          onClick={() => onEdit?.(t)}
                          title="Editar tercero"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* ✅ Fix: botón eliminar */}
                        <button
                          onClick={() => onDelete?.(t.id)}
                          title="Eliminar tercero"
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

                        {/* Toggle switch con alerta de contraseña */}
                        <button
                          onClick={() => handleToggleClick(t)}
                          title={isActive ? "Inactivar" : "Activar"}
                          style={{
                            position: "relative",
                            width: "44px",
                            height: "24px",
                            borderRadius: "20px",
                            border: "none",
                            backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "2px",
                              left: isActive ? "22px" : "2px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              transition: "0.2s",
                            }}
                          />
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

export default Third_partieTable;
