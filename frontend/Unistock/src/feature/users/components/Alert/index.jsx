import React from "react";
import { createPortal } from "react-dom";

const Alert = ({
  isOpen,
  type = "success",
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const config = {
    success: {
      color: "text-green-600",
      title: title || "Éxito",
      confirmText: "Aceptar",
    },
    error: {
      color: "text-red-600",
      title: title || "Error",
      confirmText: "Cerrar",
    },
    warning: {
      color: "text-yellow-600",
      title: title || "Advertencia",
      confirmText: "Aceptar",
    },
    confirm: {
      color: "text-pink-600",
      title: title || "Confirmar acción",
      confirmText: "Sí, eliminar",
    },
  };

  const current = config[type];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        {/* Title */}
        <h3 className={`text-lg font-semibold mb-2 ${current.color}`}>
          {current.title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-4">

          {type === "confirm" && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancelar
            </button>
          )}

          <button
            onClick={onConfirm}
            className={`font-semibold ${current.color}`}
          >
            {current.confirmText}
          </button>

        </div>
      </div>

    </div>,
    document.body
  );
};

export default Alert;