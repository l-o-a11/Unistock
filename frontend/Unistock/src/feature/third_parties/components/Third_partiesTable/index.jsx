import React, { useState } from "react";
import HoverCard from "../HoverCard";
import Alert from "../Alert";

const Third_partieTable = ({
  Third_parties = [],
  onView,
  onToggle,
}) => {

  /*  ESTADOS PARA ALERTA DE CAMBIO DE ESTADO */
  const [showToggleAlert, setShowToggleAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

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
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "64px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <p style={{ color: "#999" }}>No hay terceros para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            
            {/* HEADER */}
            <thead>
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Contacto principal</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {Third_parties.map((t) => {
                const isActive = t.estado !== false;

                return (
                  <tr
                    key={t.id}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {/* CODIGO */}
                    <td style={tdStyle}>{t.id}</td>

                    {/* NOMBRE */}
                    <td style={tdStyle}>
                      <HoverCard content={<span>{t.nombreEmpresa}</span>}>
                        {t.nombreEmpresa}
                      </HoverCard>
                    </td>

                    {/* CONTACTO */}
                    <td style={tdStyle}>
                      <HoverCard content={<span>{t.nombreContacto}</span>}>
                        {t.nombreContacto}
                      </HoverCard>
                    </td>

                    {/* ACCIONES */}
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        {/* VER */}
                        <button
                          onClick={() => onView?.(t)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "1px solid #ccc",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          title="Ver detalle"
                        >
                          !
                        </button>

                        {/* SWITCH CON CONFIRMACIÓN */}
                        <button
                          onClick={() => {
                            setSelectedId(t.id);
                            setNewStatus(!isActive);
                            setShowToggleAlert(true);
                          }}
                          style={{
                            position: "relative",
                            width: "44px",
                            height: "24px",
                            borderRadius: "20px",
                            border: "none",
                            backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                            cursor: "pointer",
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

      {/*  ALERTA DE CONFIRMACIÓN DE CAMBIO DE ESTADO */}
      <Alert
        isOpen={showToggleAlert}
        type="password"
        title={newStatus ? "Activar proveedor" : "Inactivar proveedor"}
        message={
          newStatus
            ? "Para activar este proveedor ingresa la contraseña de administrador"
            : "Para inactivar este proveedor ingresa la contraseña de administrador"
        }
        onCancel={() => setShowToggleAlert(false)}
        onConfirm={(password) => {
          onToggle?.(selectedId, newStatus);
          setShowToggleAlert(false);
        }}
      />
    </>
  );
};

export default Third_partieTable;