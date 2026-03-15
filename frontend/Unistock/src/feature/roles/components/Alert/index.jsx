import React, { useState } from "react";

/**
 * Alert / Modal reutilizable
 * Estilo coherente con la app: fondo #f3f4f6, cards blancas, primario #FF4FD6,
 * tipografía limpia, bordes suaves, sin sombras pesadas.
 *
 * Props:
 *  - isOpen   : boolean
 *  - type     : "success" | "error" | "warning" | "confirm" | "password"
 *  - message  : string
 *  - onConfirm: (password?) => void
 *  - onCancel : () => void
 */
const Alert = ({ isOpen, type = "success", message, onConfirm, onCancel }) => {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  if (!isOpen) return null;

  const config = {
    success: {
      accent: "#22c55e",
      softBg: "#f0fdf4",
      label: "Aceptar",
      showCancel: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    error: {
      accent: "#ef4444",
      softBg: "#fef2f2",
      label: "Aceptar",
      showCancel: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    warning: {
      accent: "#f59e0b",
      softBg: "#fffbeb",
      label: "Entendido",
      showCancel: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.3" fill="#f59e0b" />
        </svg>
      ),
    },
    confirm: {
      accent: "#FF4FD6",
      softBg: "#fdf4fc",
      label: "Confirmar",
      showCancel: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4" stroke="#FF4FD6" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.3" fill="#FF4FD6" />
        </svg>
      ),
    },
    password: {
      accent: "#FF4FD6",
      softBg: "#fdf4fc",
      label: "Confirmar",
      showCancel: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="7" y="11" width="10" height="8" rx="1.5" stroke="#FF4FD6" strokeWidth="2" />
          <path d="M9 11V8.5a3 3 0 1 1 6 0V11" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1" fill="#FF4FD6" />
        </svg>
      ),
    },
  };

  const { accent, softBg, label, showCancel, icon } = config[type] || config.success;
  const disableConfirm = type === "password" && !password.trim();

  const handleConfirm = () => {
    if (type === "password") {
      onConfirm?.(password);
      setPassword("");
      setShowPass(false);
    } else {
      onConfirm?.();
    }
  };

  const handleCancel = () => {
    setPassword("");
    setShowPass(false);
    onCancel?.();
  };

  return (
    <>
      {/* Backdrop — mismo tono gris apagado que usa la app en sus modales */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          zIndex: 3000,
          animation: "al-fade 0.15s ease",
        }}
      />

      {/* Centrador */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3001,
          padding: "16px",
        }}
      >
        {/* Card — mismo estilo que las cards de la app */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "380px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.10)",
            overflow: "hidden",
            animation: "al-up 0.2s cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}
        >
          {/* Header coloreado — igual al borde izquierdo activo del sidebar */}
          <div
            style={{
              backgroundColor: softBg,
              padding: "24px 24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            {/* Círculo ícono */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                boxShadow: `0 2px 8px ${accent}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>

            {/* Mensaje */}
            <p
              style={{
                margin: 0,
                fontSize: "14.5px",
                color: "#374151",
                textAlign: "center",
                lineHeight: "1.65",
                fontWeight: 500,
              }}
            >
              {message}
            </p>
          </div>

          {/* Footer con acciones */}
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Input contraseña */}
            {type === "password" && (
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Contraseña de administrador"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  onKeyDown={(e) =>
                    e.key === "Enter" && !disableConfirm && handleConfirm()
                  }
                  style={{
                    width: "100%",
                    padding: "10px 42px 10px 14px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#111827",
                    backgroundColor: "#f9fafb",
                    transition: "all 0.18s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = accent;
                    e.target.style.boxShadow = `0 0 0 3px ${accent}1a`;
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "#f9fafb";
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Botones — mismo pill style que "Agregar nuevo proveedor" */}
            <div style={{ display: "flex", gap: "8px" }}>
              {showCancel && (
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "50px",          // pill — igual al botón primario de la app
                    border: "1.5px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#6b7280",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.color = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  Cancelar
                </button>
              )}

              <button
                onClick={handleConfirm}
                disabled={disableConfirm}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "50px",            // pill
                  border: "none",
                  background: disableConfirm
                    ? "#f3f4f6"
                    : `linear-gradient(135deg, #FF4FD6 0%, #ff74e0 100%)`,
                  color: disableConfirm ? "#9ca3af" : "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: disableConfirm ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  boxShadow: disableConfirm
                    ? "none"
                    : "0 4px 14px rgba(255, 79, 214, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  if (!disableConfirm)
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(255, 79, 214, 0.50)";
                }}
                onMouseLeave={(e) => {
                  if (!disableConfirm)
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(255, 79, 214, 0.35)";
                }}
              >
                {/* Mini ícono en el botón confirmar (igual al ⊕ del botón Agregar) */}
                {!disableConfirm && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {label}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes al-fade {
          from { opacity: 0 } to { opacity: 1 }
        }
        @keyframes al-up {
          from { transform: translateY(16px) scale(0.97); opacity: 0 }
          to   { transform: translateY(0) scale(1); opacity: 1 }
        }
      `}</style>
    </>
  );
};

export default Alert;