import React from "react";
import { Shield, X, Trash2 } from "lucide-react";
import {
  MODULOS_PREDETERMINADOS,
  PRIVILEGIOS_PREDETERMINADOS,
} from "../../services/RolesAPI";

const PINK = "#ff4fd6";
const PINK_LIGHT = "#fff0fb";
const PINK_BORDER = "#f9a8d4";

const sectionTitle = (text) => (
  <p
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: "#9ca3af",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      margin: "0 0 10px",
    }}
  >
    {text}
  </p>
);

const RolDetail = ({ rol, onClose, onDelete }) => {
  if (!rol) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      {/* Overlay — oscurecido sólido, sin difuminado */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "80vh",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: PINK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1f2937" }}>
                {rol.nombre}
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                Detalle del rol
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#f3f4f6",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY (SCROLL AQUÍ) */}
        <div
          className="roles-modal-scroll"
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Descripción */}
          {sectionTitle("Descripción")}
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
              {rol.descripcion || (
                <span style={{ color: "#9ca3af" }}>Sin descripción</span>
              )}
            </div>
          </div>

          {/* Módulos */}
          {sectionTitle(`Módulos y privilegios (${rol.modulos?.length || 0})`)}

          {rol.modulos?.map((moduloRol, index) => {
            const moduloInfo = MODULOS_PREDETERMINADOS.find(
              (m) => m.id === moduloRol.moduloId
            );
            if (!moduloInfo) return null;

            return (
              <div
                key={moduloRol.moduloId}
                style={{
                  background: "#fff8fe",
                  border: `1px solid ${PINK_BORDER}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 7,
                    left: 14,
                    fontSize: 10,
                    color: PINK,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Módulo #{index + 1}
                </span>

                <div
                  style={{
                    marginTop: 18,
                    marginBottom: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  {moduloInfo.nombre}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {moduloRol.privilegios.map((privilegioId) => {
                    const privilegioInfo = PRIVILEGIOS_PREDETERMINADOS.find(
                      (p) => p.id === privilegioId
                    );
                    if (!privilegioInfo) return null;

                    return (
                      <span
                        key={privilegioId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          fontSize: 12,
                          borderRadius: 20,
                          backgroundColor: PINK_LIGHT,
                          border: `1.5px solid ${PINK}`,
                          color: PINK,
                          fontWeight: 600,
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {privilegioInfo.nombre}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {(!rol.modulos || rol.modulos.length === 0) && (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
              Este rol no tiene módulos asignados.
            </p>
          )}
        </div>

        {/* FOOTER */}
        {onDelete && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => onDelete(rol)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1.5px solid #fecaca",
                background: "#fff",
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              <Trash2 size={14} />
              Eliminar rol
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolDetail;