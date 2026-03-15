// ─────────────────────────────────────────────────────────────
//  Alert/ModalAlert.jsx
//  Modal centrado para: confirm | password
//  · confirm  → solicita confirmación con Cancelar / Confirmar
//  · password → pide contraseña de administrador (1234 mock)
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { ALERT_CONFIG } from "./alertConfig";

const ModalAlert = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  const [visible,  setVisible]  = useState(false);
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setVisible(true);
    setPassword("");
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const { color, icon } = ALERT_CONFIG[type];

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onCancel?.(), 250);
  };

  const handleConfirm = () => {
    if (type === "password" && password !== "1234") {
      setError("Contraseña incorrecta");
      return;
    }
    setVisible(false);
    setTimeout(() => onConfirm?.(password), 250);
  };

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          transform: visible ? "scale(1)" : "scale(0.9)",
          opacity:   visible ? 1 : 0,
          borderTop: `6px solid ${color}`,
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ ...styles.iconCircle, background: color }}>{icon}</div>
          <div>
            <h3 style={{ margin: 0 }}>{title}</h3>
            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>

        {/* Campo contraseña (solo type="password") */}
        {type === "password" && (
          <>
            <input
              type="password"
              placeholder="Contraseña administrador"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              style={{
                ...styles.input,
                border: error ? "2px solid #ef4444" : `2px solid ${color}`,
              }}
            />
            {error && <span style={styles.errorText}>{error}</span>}
          </>
        )}

        {/* Acciones */}
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={handleClose}>Cancelar</button>
          <button style={{ ...styles.confirmBtn, background: color }} onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    width: "400px",
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    transition: "all .25s ease",
  },
  header:     { display: "flex", gap: "12px", alignItems: "center" },
  iconCircle: { width: 44, height: 44, borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  actions:    { marginTop: "18px", display: "flex", justifyContent: "flex-end", gap: "10px" },
  confirmBtn: { border: "none", padding: "10px 16px", borderRadius: "10px", color: "#fff", cursor: "pointer" },
  cancelBtn:  { border: "none", padding: "10px 18px", borderRadius: "10px", background: "#eee", cursor: "pointer" },
  input:      { width: "100%", marginTop: "14px", padding: "10px", borderRadius: "10px", outline: "none" },
  errorText:  { color: "#ef4444", fontSize: "12px", marginTop: "6px", display: "block" },
};

export default ModalAlert;
