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
  minHeight = 240,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      minHeight,
      width: "100%",
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      padding: "32px 20px",
      boxSizing: "border-box",
    }}
  >
    <Spinner size={32} color="#FF4FD6" trackColor="rgba(255,79,214,0.18)" />
    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151", textAlign: "center" }}>
      {message}
    </p>
    {submessage && (
      <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>{submessage}</p>
    )}
  </div>
);

export default LoadingState;
