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
import React, { useState, useEffect, useRef } from "react";

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  // Los tipos toast se cierran solos; los modales requieren acción del usuario
  const isToast = type === "success" || type === "error" || type === "warning";

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
      @keyframes slideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes popIn {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Reset password/error cada vez que se abre
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
      // Auto-cierre para toasts
      if (isToast) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onCancel && onCancel();
        }, duration);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, type]);

  // No renderiza nada cuando está cerrado
  if (!isOpen) return null;

  /**
   * Paleta de estilos por tipo de alerta.
   * Unificada con la paleta del componente Button.
   */
  const config = {
    success: { color: "#22c55e", icon: "✓" },
    error:   { color: "#ef4444", icon: "✕" },
    warning: { color: "#f59e0b", icon: "⚠" },
    confirm: { color: "#FF4FD6", icon: "!" },
    password:{ color: "#FF4FD6", icon: "🔒" },
  };

  const current = config[type] || config.success;

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Cierra la alerta con animación de salida */
  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onCancel && onCancel();
  };

  /** Confirma la acción — para "password" valida primero */
  const handleConfirm = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onConfirm && onConfirm(password);
  };

  /* ── TOAST ── */
  if (isToast) {
    return (
      <div style={toastContainer}>
        <div style={{
          ...toast,
          borderLeft: `6px solid ${current.color}`,
          animation: "slideIn .3s ease forwards",
        }}>
          <div style={toastIcon}>{current.icon}</div>
          <div style={{ flex: 1 }}>
            <strong>{title || message}</strong>
            {title && message && <p style={toastMsg}>{message}</p>}
          </div>
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={{
            ...progressBar,
            background: current.color,
            animationDuration: `${duration}ms`,
          }} />
        </div>
      </div>
    );
  }

  /* ── MODAL ── */
  return (
    <div style={overlay}>
      <div style={{ ...modal, animation: "popIn .2s cubic-bezier(0.34,1.4,0.64,1) forwards" }}>

        {/* Ícono + texto */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: `${current.color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", color: current.color, fontWeight: "bold",
          }}>
            {current.icon}
          </div>
          {title && (
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827", textAlign: "center" }}>
              {title}
            </h3>
          )}
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", textAlign: "center", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        {/* Input contraseña */}
        {type === "password" && (
          <div style={{ marginBottom: "4px" }}>
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && password && handleConfirm()}
              style={{
                ...inputStyle,
                border: error ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                backgroundColor: "#f9fafb",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = current.color;
                e.target.style.boxShadow = `0 0 0 3px ${current.color}20`;
                e.target.style.backgroundColor = "#fff";
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
                e.target.style.backgroundColor = "#f9fafb";
              }}
            />
            {error && <span style={errorStyle}>{error}</span>}
          </div>
        )}

        {/* Botones */}
        <div style={actions}>
          <button style={cancelBtn} onClick={handleClose}>Cancelar</button>
          <button
            style={{
              ...confirmBtn,
              background: `linear-gradient(135deg, ${current.color} 0%, ${current.color}cc 100%)`,
              boxShadow: `0 4px 12px ${current.color}44`,
              opacity: type === "password" && !password ? 0.5 : 1,
              cursor: type === "password" && !password ? "not-allowed" : "pointer",
            }}
            onClick={handleConfirm}
            disabled={type === "password" && !password}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Estilos ── */

const toastContainer = {
  position: "fixed", top: "20px", right: "20px", zIndex: 9999,
};

const toast = {
  width: "320px",
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: "14px",
  padding: "16px",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
  position: "relative",
};

const progressBar = {
  position: "absolute", bottom: 0, left: 0,
  height: "4px", width: "100%",
  borderRadius: "0 0 14px 14px",
  animationName: "shrink",
  animationTimingFunction: "linear",
  animationFillMode: "forwards",
};

const toastIcon  = { fontWeight: "bold", fontSize: "18px" };
const toastMsg   = { margin: "2px 0 0", fontSize: "13px", color: "#555" };
const closeBtn   = { border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#666" };

const overlay = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.25)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 999,
};

const modal = {
  width: "380px",
  background: "#fff",
  borderRadius: "20px",
  padding: "28px 24px 20px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
};

const actions = {
  marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px",
};

const confirmBtn = {
  flex: 1, border: "none",
  padding: "10px 16px", borderRadius: "50px",
  color: "#fff", fontSize: "14px", fontWeight: 700,
};

const cancelBtn = {
  flex: 1, border: "1.5px solid #e5e7eb",
  padding: "10px 18px", borderRadius: "50px",
  background: "#fff", color: "#6b7280",
  cursor: "pointer", fontSize: "14px", fontWeight: 600,
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  borderRadius: "12px", outline: "none",
  fontSize: "14px", boxSizing: "border-box",
  transition: "all 0.18s",
};

const errorStyle = { color: "#ef4444", fontSize: "12px", marginTop: "6px", display: "block" };

export default Alert;
