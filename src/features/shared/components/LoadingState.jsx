/**
 * @file LoadingState.jsx
 * @description Mensaje + spinner que se muestra mientras una vista todavía
 * no tiene datos del backend. Pensado para usarse en el cuerpo de una página
 * (debajo del encabezado) mientras el hook de datos está en su carga inicial.
 *
 * USO:
 *   {loading ? <LoadingState message="Cargando proveedores..." /> : <Tabla .../>}
 */
import React from "react";

const spinKeyframes = `
@keyframes unistock-spin {
  to { transform: rotate(360deg); }
}

@keyframes unistock-loading-bar {
  0% { left: -40%; width: 40%; }
  50% { left: 30%; width: 50%; }
  100% { left: 110%; width: 40%; }
}

@keyframes unistock-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

/**
 * Spinner reutilizable (también usado por Button.jsx).
 * @param {object} props
 * @param {number} [props.size=18] - Tamaño en px
 * @param {string} [props.color="currentColor"] - Color del trazo animado
 * @param {string} [props.trackColor="rgba(0,0,0,0.15)"] - Color del aro de fondo
 */
export const Spinner = ({ size = 18, color = "currentColor", trackColor = "rgba(0,0,0,0.15)" }) => (
  <>
    <style>{spinKeyframes}</style>
    <span
      role="status"
      aria-label="Cargando"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2.5px solid ${trackColor}`,
        borderTopColor: color,
        animation: "unistock-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  </>
);

/**
 * Bloque de espera para el cuerpo de una página/vista.
 * @param {object} props
 * @param {string} [props.message] - Texto principal
 * @param {string} [props.submessage] - Texto secundario opcional
 * @param {number} [props.minHeight=240] - Alto mínimo del contenedor
 */
const LoadingState = ({
  message = "Cargando información, por favor espera un momento...",
  submessage = null,
  minHeight = 260,
}) => (
  <div style={{ width: "100%", minHeight, padding: "8px 0" }}>
    <style>{spinKeyframes}</style>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              width: 140,
              height: 10,
              borderRadius: 999,
              background: "#fce7f3",
              animation: "unistock-skeleton-pulse 1.6s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: 220,
              height: 24,
              borderRadius: 10,
              background: "#f3f4f6",
              animation: "unistock-skeleton-pulse 1.6s ease-in-out infinite",
            }}
          />
        </div>
        <div
          style={{
            width: 320,
            maxWidth: "100%",
            height: 38,
            borderRadius: 10,
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            animation: "unistock-skeleton-pulse 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 170,
            height: 38,
            borderRadius: 999,
            background: "linear-gradient(90deg, #ff8fe0, #FF4FD6)",
            opacity: 0.4,
            animation: "unistock-skeleton-pulse 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            position: "relative",
            height: 3,
            background: "#fce7f3",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)",
              animation: "unistock-loading-bar 1.4s ease-in-out infinite",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Spinner size={22} color="#FF4FD6" trackColor="rgba(255,79,214,0.18)" />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151", textAlign: "center" }}>
            {message}
          </p>
        </div>
        {submessage && (
          <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>{submessage}</p>
        )}
      </div>
    </div>
  </div>
);

export default LoadingState;
