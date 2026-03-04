import React, { useState, useEffect } from "react";

const Alert = ({
  isOpen,
  type = "success",
  title,
  message,
  onConfirm,
  onCancel,
  duration = 3000,
}) => {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isToast = type === "success" || type === "error" || type === "warning";

  //  inyectar keyframes dinámicamente
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setPassword("");
      setError("");

      if (isToast) {
        const timer = setTimeout(() => handleClose(), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = {
    success: { color: "#22c55e", icon: "✓" },
    error: { color: "#ef4444", icon: "✕" },
    warning: { color: "#f59e0b", icon: "⚠" },
    confirm: { color: "#6366f1", icon: "?" },
    password: { color: "#E91E8C", icon: "🔒" },
  };

  const current = config[type];

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onCancel && onCancel(), 250);
  };

  const handleConfirm = () => {
    if (type === "password" && password !== "1234") {
      setError("Contraseña incorrecta");
      return;
    }
    setVisible(false);
    setTimeout(() => onConfirm && onConfirm(password), 250);
  };

  /* ===========================
        🎯 TOAST LATERAL
  =========================== */
  if (isToast) {
    return (
      <div style={toastContainer}>
        <div
          style={{
            ...toast,
            transform: visible ? "translateX(0)" : "translateX(120%)",
            opacity: visible ? 1 : 0,
            borderLeft: `6px solid ${current.color}`,
          }}
        >
          <div style={toastIcon}>{current.icon}</div>

          <div style={{ flex: 1 }}>
            <strong>{title}</strong>
            {message && <p style={toastMsg}>{message}</p>}
          </div>

          <button style={closeBtn} onClick={handleClose}>
            ✕
          </button>

          {/* ⏳ barra animada */}
          <div
            style={{
              ...progressBar,
              background: current.color,
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
      </div>
    );
  }

  /* ===========================
        🎯 MODAL CENTRADO
  =========================== */
  return (
    <div style={overlay}>
      <div
        style={{
          ...modal,
          transform: visible ? "scale(1)" : "scale(0.9)",
          opacity: visible ? 1 : 0,
          borderTop: `6px solid ${current.color}`,
        }}
      >
        <div style={modalHeader}>
          <div style={{ ...modalIcon, background: current.color }}>
            {current.icon}
          </div>

          <div>
            <h3 style={{ margin: 0 }}>{title}</h3>
            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>

        {type === "password" && (
          <>
            <input
              type="password"
              placeholder="Contraseña administrador"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              style={{
                ...input,
                border: error
                  ? "2px solid #ef4444"
                  : `2px solid ${current.color}`,
              }}
            />
            {error && <span style={errorText}>{error}</span>}
          </>
        )}

        <div style={actions}>
          <button style={cancelBtn} onClick={handleClose}>
            Cancelar
          </button>
          <button
            style={{ ...confirmBtn, background: current.color }}
            onClick={handleConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

/* 🎨 estilos  */

const toastContainer = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999,
};

const toast = {
  width: "320px",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: "14px",
  padding: "16px",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  transition: "all .35s ease",
  position: "relative",
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

const toastIcon = { fontWeight: "bold", fontSize: "18px" };
const toastMsg = { margin: "2px 0 0", fontSize: "13px", color: "#555" };

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal = {
  width: "400px",
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  transition: "all .25s ease",
};

const modalHeader = { display: "flex", gap: "12px", alignItems: "center" };
const modalIcon = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const actions = {
  marginTop: "18px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

const confirmBtn = {
  border: "none",
  padding: "10px 16px",
  borderRadius: "10px",
  color: "#fff",
  cursor: "pointer",
};

const cancelBtn = {
  border: "none",
  padding: "10px 18px",
  borderRadius: "10px",
  background: "#eee",
  cursor: "pointer",
};

const closeBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "14px",
  color: "#666",
};

const input = {
  width: "100%",
  marginTop: "14px",
  padding: "10px",
  borderRadius: "10px",
  outline: "none",
};

const errorText = {
  color: "#ef4444",
  fontSize: "12px",
  marginTop: "6px",
};

export default Alert;