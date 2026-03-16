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

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
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

  if (!isOpen) return null;

  const config = {
    success:  { color: "#22c55e", icon: "✓" },
    error:    { color: "#ef4444", icon: "✕" },
    warning:  { color: "#f59e0b", icon: "⚠" },
    confirm:  { color: "#FF4FD6", icon: "!" },
    password: { color: "#FF4FD6", icon: "🔒" },
  };

  const current = config[type] || config.success;

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onCancel && onCancel();
  };

  const handleConfirm = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onConfirm && onConfirm(password);
  };

  /* ── TOAST ── */
  if (isToast) {
    return (
      <div style={toastContainer}>
        <div style={{
          ...toastStyle,
          borderLeft: `6px solid ${current.color}`,
          animation: "slideIn .3s ease forwards",
        }}>
          <div style={toastIconStyle}>{current.icon}</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: "14px", color: "#111827" }}>{title || message}</strong>
            {title && message && <p style={toastMsgStyle}>{message}</p>}
          </div>
          <button style={closeBtnStyle} onClick={handleClose}>✕</button>
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
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, animation: "popIn .2s cubic-bezier(0.34,1.4,0.64,1) forwards" }}>

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
          {message && (
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", textAlign: "center", lineHeight: 1.6 }}>
              {message}
            </p>
          )}
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
                ...passwordInputStyle,
                border: error ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
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
        <div style={actionsStyle}>
          <button style={cancelBtnStyle} onClick={handleClose}>Cancelar</button>
          <button
            style={{
              ...confirmBtnStyle,
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

/* ── Estilos ────────────────────────────────────────────────────────────────
   Nombres únicos para evitar colisiones con otros archivos del proyecto
── */

const toastContainer = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 99999,           // ✅ Siempre encima de todo
};

const toastStyle = {
  width: "320px",
  background: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(10px)",
  borderRadius: "14px",
  padding: "16px",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
  position: "relative",
  overflow: "hidden",
};

const progressBar = {
  position: "absolute",
  bottom: 0,
  left: 0,
  height: "4px",
  width: "100%",
  borderRadius: "0 0 14px 14px",
  animationName: "shrink",
  animationTimingFunction: "linear",
  animationFillMode: "forwards",
};

const toastIconStyle = { fontWeight: "bold", fontSize: "18px", flexShrink: 0 };
const toastMsgStyle  = { margin: "2px 0 0", fontSize: "13px", color: "#555" };
const closeBtnStyle  = { border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#666", flexShrink: 0 };

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.30)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,            // ✅ Sobre modales de formulario (z-50 = 50) pero bajo el toast
};

const modalStyle = {
  width: "380px",
  background: "#fff",
  borderRadius: "20px",
  padding: "28px 24px 20px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

const actionsStyle = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};

const confirmBtnStyle = {
  flex: 1,
  border: "none",
  padding: "10px 16px",
  borderRadius: "50px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 700,
};

const cancelBtnStyle = {
  flex: 1,
  border: "1.5px solid #e5e7eb",
  padding: "10px 18px",
  borderRadius: "50px",
  background: "#fff",
  color: "#6b7280",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

const passwordInputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "12px",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
  transition: "all 0.18s",
  backgroundColor: "#f9fafb",
};

const errorStyle = {
  color: "#ef4444",
  fontSize: "12px",
  marginTop: "6px",
  display: "block",
};

export default Alert;