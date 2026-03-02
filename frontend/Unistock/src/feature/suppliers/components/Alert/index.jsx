import React, { useState, useEffect } from "react";

const Alert = ({
  isOpen,
  type = "success",
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // limpiar cada vez que abre
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = {
    success: {
      color: "#22c55e",
      bg: "#ffffff",
      icon: "✓",
      title: title || "Éxito",
      confirmText: "Aceptar",
    },
    error: {
      color: "#ef4444",
      bg: "#ffffff",
      icon: "✕",
      title: title || "Error",
      confirmText: "Cerrar",
    },
    warning: {
      color: "#f59e0b",
      bg: "#ffffff",
      icon: "⚠",
      title: title || "Advertencia",
      confirmText: "Aceptar",
    },
    confirm: {
      color: "#E91E8C",
      bg: "#ffffff",
      icon: "?",
      title: title || "Confirmar acción",
      confirmText: "Aceptar",
    },
    password: {
      color: "#E91E8C",
      bg: "#fdf2f8",
      icon: "🔒",
      title: title || "Confirmación",
      confirmText: "Eliminar",
    },
  };

  const current = config[type];

  // 🔐 CONFIRMAR
  const handleConfirm = () => {
    if (type === "password") {
      if (password !== "1234") {
        setError("Contraseña incorrecta");
        return;
      }
      onConfirm(password);
      return;
    }

    onConfirm();
  };

  return (
    <div style={overlay}>
      <div
        style={{
          ...card,
          border: `2px solid ${current.color}`,
          background: current.bg,
        }}
      >
        {/* HEADER */}
        <div style={header}>
          <div style={{ ...iconCircle, background: current.color }}>
            {current.icon}
          </div>

          <div>
            <h3 style={titleStyle}>{current.title}</h3>
            {message && <p style={messageStyle}>{message}</p>}
          </div>
        </div>

        {/* PASSWORD */}
        {type === "password" && (
          <>
            <input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              style={{
                ...input,
                border: error ? "2px solid #ef4444" : "2px solid #E91E8C",
              }}
            />

            {error && <span style={errorText}>{error}</span>}
          </>
        )}

        {/* BOTONES */}
        <div style={actions}>
          {(type === "confirm" || type === "password") && (
            <button style={cancelBtn} onClick={onCancel}>
              Cancelar
            </button>
          )}

          <button
            style={{ ...confirmBtn, color: current.color }}
            onClick={handleConfirm}
          >
            {current.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/* 🎨 ESTILOS */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const card = {
  width: "380px",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
};

const header = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const iconCircle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "18px",
};

const titleStyle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "600",
};

const messageStyle = {
  margin: "4px 0 0 0",
  fontSize: "14px",
  color: "#555",
};

const actions = {
  marginTop: "18px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "16px",
};

const confirmBtn = {
  border: "none",
  background: "none",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
};

const cancelBtn = {
  border: "none",
  background: "none",
  color: "#666",
  fontWeight: "500",
  cursor: "pointer",
};

const input = {
  width: "100%",
  marginTop: "16px",
  padding: "10px",
  borderRadius: "10px",
  outline: "none",
};

const errorText = {
  color: "#ef4444",
  fontSize: "12px",
  marginTop: "6px",
  display: "block",
  fontWeight: "500",
};

export default Alert;