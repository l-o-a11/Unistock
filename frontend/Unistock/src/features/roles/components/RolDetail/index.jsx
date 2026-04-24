import React from "react";
import { Shield } from "lucide-react";
import {
  MODULOS_PREDETERMINADOS,
  PRIVILEGIOS_PREDETERMINADOS,
} from "../../services/RolesAPI";

const RolDetail = ({ rol, onClose, onEdit, onDelete }) => {
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
      {/* Overlay */}
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
          maxWidth: "50%",
          maxHeight: "80vh",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "16px",
            bbackgroundColor: "#fdf2f8",
            border: "1px solid #f9a8d4",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            fontWeight: "600",
            fontSize: "18px",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          {/* ID y Nombre */}

          <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "20px"}}>
            <div>
              <Shield size={22} />
            </div>

            <div>
              <div style={{ fontSize: "12px", color: "#be185d" }}>
                ID: #{rol.id}
              </div>
              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {rol.nombre}
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "black",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* BODY (SCROLL AQUÍ) */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* Descripción */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontSize: "12px", marginBottom: "8px" }}>
              DESCRIPCIÓN
            </div>
            <div style={{ fontSize: "14px", color: "#374151" }}>
              {rol.descripcion}
            </div>
          </div>

          {/* Módulos */}
          {rol.modulos?.map((moduloRol) => {
            const moduloInfo = MODULOS_PREDETERMINADOS.find(
              (m) => m.id === moduloRol.moduloId,
            );
            if (!moduloInfo) return null;

            return (
              <div
                key={moduloRol.moduloId}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    marginBottom: "10px",
                  }}
                >
                  {moduloInfo.nombre}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {moduloRol.privilegios.map((privilegioId) => {
                    const privilegioInfo = PRIVILEGIOS_PREDETERMINADOS.find(
                      (p) => p.id === privilegioId,
                    );
                    if (!privilegioInfo) return null;

                    return (
                      <span
                        key={privilegioId}
                        style={{
                          padding: "6px 10px",
                          fontSize: "12px",
                          borderRadius: "6px",
                          backgroundColor: "#fce7f3",
                          border: "1px solid #f9a8d4",
                          color: "#be185d",
                          fontWeight: "500",
                        }}
                      >
                        {privilegioInfo.nombre}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button onClick={onClose}>Cerrar</button>
          <button 
            onClick={() => {
              onEdit(rol); 
              onClose();
              }}>
                Editar
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default RolDetail;
