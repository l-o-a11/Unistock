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
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (isOpen) { setPassword(""); setError(""); }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = {
    success: { color: "#22c55e", icon: "✓", confirmText: "Aceptar" },
    error:   { color: "#ef4444", icon: "✕", confirmText: "Cerrar" },
    warning: { color: "#f59e0b", icon: "⚠", confirmText: "Aceptar" },
    confirm: { color: "#E91E8C", icon: "?", confirmText: "Aceptar" },
    password:{ color: "#E91E8C", icon: "🔒", confirmText: "Confirmar" },
  };

  const current = config[type] || config.confirm;

  const handleConfirm = () => {
    if (type === "password") {
      if (password !== "1234") { setError("Contraseña incorrecta"); return; }
      onConfirm?.(password);
      return;
    }
    onConfirm?.();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
      <div style={{
        width: 380, borderRadius: 16, padding: 20,
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        border: `2px solid ${current.color}`, background: "#fff",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", backgroundColor: current.color,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: 18, flexShrink: 0,
          }}>
            {current.icon}
          </div>
          <div>
            {title   && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>}
            {message && <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555" }}>{message}</p>}
          </div>
        </div>

        {type === "password" && (
          <>
            <input type="password" placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              style={{
                width: "100%", marginTop: 16, padding: 10, borderRadius: 10, outline: "none", boxSizing: "border-box",
                border: error ? "2px solid #ef4444" : `2px solid ${current.color}`,
              }} />
            {error && <span style={{ color: "#ef4444", fontSize: 12, marginTop: 6, display: "block", fontWeight: 500 }}>{error}</span>}
          </>
        )}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 16 }}>
          {(type === "confirm" || type === "password") && (
            <button style={{ border: "none", background: "none", color: "#666", fontWeight: 500, cursor: "pointer" }}
              onClick={onCancel}>Cancelar</button>
          )}
          <button style={{ border: "none", background: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", color: current.color }}
            onClick={handleConfirm}>
            {current.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
