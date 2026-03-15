/**
 * @file Alert.jsx
 * @description Componente de alertas unificado para toda la aplicación.
 *
 * TIPOS:
 *   success  — Toast verde deslizante (esquina superior derecha, cierre automático)
 *   error    — Toast rojo deslizante (cierre automático)
 *   warning  — Toast amarillo deslizante (cierre automático)
 *   confirm  — Modal centrado con botones Cancelar / Confirmar
 *   password — Modal centrado con campo de contraseña de administrador
 *
 * USO:
 *   <Alert
 *     isOpen={alertConfig.open}
 *     type="confirm"
 *     title="¿Eliminar registro?"
 *     message="Esta acción no se puede deshacer."
 *     onConfirm={handleDelete}
 *     onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
 *   />
 */
import React, { useState, useEffect } from "react";

/**
 * @param {object}   props
 * @param {boolean}  props.isOpen     - Controla la visibilidad del alert
 * @param {'success'|'error'|'warning'|'confirm'|'password'} [props.type='success']
 * @param {string}   props.title      - Título principal
 * @param {string}   [props.message]  - Descripción o detalle adicional
 * @param {function} [props.onConfirm]- Se llama al confirmar (en toasts, también cierra)
 * @param {function} [props.onCancel] - Se llama al cancelar o cerrar
 * @param {number}   [props.duration=3000] - Duración en ms para los toasts automáticos
 */
const Alert = ({
  isOpen,
  type = "success",
  title,
  message,
  onConfirm,
  onCancel,
  duration = 3000,
}) => {
  // Estado de animación de entrada/salida
  const [visible, setVisible] = useState(false);

  // Campo de contraseña para el tipo "password"
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Los tipos toast se cierran solos; los modales requieren acción del usuario
  const isToast = type === "success" || type === "error" || type === "warning";

  // ── Inyectar keyframe "shrink" para la barra de progreso del toast ──────────
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-alert-keyframes", "true");
    // Solo inyecta una vez en el DOM para evitar duplicados
    if (!document.querySelector("[data-alert-keyframes]")) {
      style.innerHTML = `
        @keyframes alertShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      // Limpieza al desmontar — solo elimina si la creó este efecto
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // ── Animación de entrada y auto-cierre para toasts ──────────────────────────
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setPassword("");
      setPasswordError("");

      if (isToast) {
        // Cierre automático después de `duration` ms
        const timer = setTimeout(() => handleClose(), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);

  // No renderiza nada cuando está cerrado
  if (!isOpen) return null;

  /**
   * Paleta de estilos por tipo de alerta.
   * Unificada con la paleta del componente Button.
   */
  const config = {
    success:  { color: "#22c55e",  icon: "✓",  confirmText: "Aceptar"   },
    error:    { color: "#ef4444",  icon: "✕",  confirmText: "Cerrar"    },
    warning:  { color: "#f59e0b",  icon: "⚠",  confirmText: "Aceptar"   },
    confirm:  { color: "#FF4FD6",  icon: "?",  confirmText: "Confirmar" },
    password: { color: "#FF4FD6",  icon: "🔒", confirmText: "Confirmar" },
  };

  const current = config[type] || config.confirm;

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Cierra la alerta con animación de salida */
  const handleClose = () => {
    setVisible(false);
    // Pequeño delay para que termine la animación antes de notificar al padre
    setTimeout(() => onCancel && onCancel(), 280);
  };

  /** Confirma la acción — para "password" valida primero */
  const handleConfirm = () => {
    if (type === "password") {
      if (password !== "1234") {
        setPasswordError("Contraseña incorrecta");
        return;
      }
      setVisible(false);
      setTimeout(() => onConfirm && onConfirm(password), 280);
      return;
    }
    setVisible(false);
    setTimeout(() => onConfirm && onConfirm(), 280);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // TOAST (success, error, warning)
  // Se muestra como notificación deslizante en la esquina superior derecha
  // ────────────────────────────────────────────────────────────────────────────
  if (isToast) {
    return (
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        pointerEvents: "none", // No bloquea clicks debajo
      }}>
        <div style={{
          width: "320px",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(10px)",
          borderRadius: "14px",
          padding: "16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
          boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
          borderLeft: `5px solid ${current.color}`,
          // Animación deslizante: entra desde la derecha
          transform: visible ? "translateX(0)" : "translateX(130%)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.32s cubic-bezier(.22,.68,0,1.2), opacity 0.28s ease",
          position: "relative",
          overflow: "hidden",
          pointerEvents: "all",
        }}>
          {/* Icono de estado */}
          <span style={{ fontWeight: "bold", fontSize: "18px", color: current.color, flexShrink: 0 }}>
            {current.icon}
          </span>

          {/* Contenido textual */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: "14px", color: "#1f2937" }}>{title}</strong>
            {message && (
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#6b7280", whiteSpace: "pre-line" }}>
                {message}
              </p>
            )}
          </div>

          {/* Botón de cierre manual */}
          <button
            onClick={handleClose}
            style={{
              border: "none", background: "transparent",
              cursor: "pointer", fontSize: "14px",
              color: "#9ca3af", flexShrink: 0, lineHeight: 1, padding: 2,
            }}
          >
            ✕
          </button>

          {/* Barra de progreso animada que indica el tiempo restante */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0,
            height: "3px",
            background: current.color,
            borderRadius: "0 0 0 14px",
            animationName: "alertShrink",
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            animationDuration: `${duration}ms`,
          }} />
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODAL (confirm, password)
  // Se muestra centrado con overlay oscuro y requiere acción del usuario
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.52)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}>
      <div style={{
        width: "400px",
        maxWidth: "92vw",
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
        borderTop: `5px solid ${current.color}`,
        // Animación de escala al aparecer
        transform: visible ? "scale(1)" : "scale(0.9)",
        opacity: visible ? 1 : 0,
        transition: "all 0.22s ease",
      }}>
        {/* Header: icono + título + mensaje */}
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "6px" }}>
          <div style={{
            width: "44px", height: "44px",
            borderRadius: "50%",
            backgroundColor: current.color,
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: "18px",
            flexShrink: 0,
          }}>
            {current.icon}
          </div>
          <div style={{ flex: 1 }}>
            {title   && <h3 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>{title}</h3>}
            {message && (
              <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Campo de contraseña — solo para type="password" */}
        {type === "password" && (
          <div style={{ marginTop: "16px" }}>
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                outline: "none",
                boxSizing: "border-box",
                fontSize: "14px",
                border: passwordError ? "2px solid #ef4444" : `2px solid ${current.color}`,
                transition: "border-color 0.15s",
              }}
            />
            {passwordError && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", display: "block", fontWeight: 500 }}>
                {passwordError}
              </span>
            )}
          </div>
        )}

        {/* Acciones: Cancelar / Confirmar */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          {/* Botón Cancelar — solo para modales que requieren decisión */}
          {(type === "confirm" || type === "password") && (
            <button
              onClick={handleClose}
              style={{
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                color: "#6b7280",
                fontWeight: 500,
                cursor: "pointer",
                padding: "9px 18px",
                borderRadius: "9px",
                fontSize: "14px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f9fafb")}
            >
              Cancelar
            </button>
          )}

          {/* Botón Confirmar — color corporativo según tipo */}
          <button
            onClick={handleConfirm}
            style={{
              border: "none",
              background: current.color,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              padding: "9px 20px",
              borderRadius: "9px",
              fontSize: "14px",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            {current.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
