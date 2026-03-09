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

  const isToast =
    type === "success" || type === "error" || type === "warning";

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
    success: { color: "bg-green-500", border: "border-green-500", icon: "✓" },
    error: { color: "bg-red-500", border: "border-red-500", icon: "✕" },
    warning: { color: "bg-yellow-500", border: "border-yellow-500", icon: "⚠" },
    confirm: { color: "bg-indigo-500", border: "border-indigo-500", icon: "?" },
    password: { color: "bg-pink-500", border: "border-pink-500", icon: "🔒" },
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
        🔔 TOAST
  =========================== */
  if (isToast) {
    return (
      <div className="fixed top-5 right-5 z-[9999]">
        <div
          className={`
            w-80 relative flex items-center gap-3 p-4
            bg-white/90 backdrop-blur-lg rounded-xl
            shadow-xl border-l-4
            transition-all duration-300
            ${visible ? "translate-x-0 opacity-100" : "translate-x-40 opacity-0"}
            ${current.border}
          `}
        >
          <div className="font-bold text-lg">{current.icon}</div>

          <div className="flex-1">
            <strong>{title}</strong>
            {message && (
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>

          {/* Barra progreso */}
          <div
            className={`absolute bottom-0 left-0 h-1 ${current.color}`}
            style={{
              width: visible ? "0%" : "100%",
              transition: `width ${duration}ms linear`,
            }}
          />
        </div>
      </div>
    );
  }

  /* ===========================
        🪟 MODAL
  =========================== */

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div
        className={`
          w-[400px] bg-white rounded-2xl p-6 shadow-2xl
          transform transition-all duration-300
          ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          border-t-4 ${current.border}
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${current.color}`}
          >
            {current.icon}
          </div>

          <div>
            <h3 className="font-semibold">{title}</h3>
            {message && (
              <p className="text-sm text-gray-600">{message}</p>
            )}
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
              className={`
                w-full mt-4 p-2 rounded-lg outline-none border-2
                ${
                  error
                    ? "border-red-500"
                    : current.border
                }
              `}
            />
            {error && (
              <span className="text-red-500 text-xs mt-1 block">
                {error}
              </span>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-white transition hover:opacity-90 ${current.color}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;