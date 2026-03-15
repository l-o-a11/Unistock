// ─────────────────────────────────────────────────────────────
//  Alert/index.jsx
//  Punto de entrada único. Mantiene la misma API pública
//  que el Alert original — sin cambios para quien lo consume.
//
//  Tipos toast  (se auto-cierran): "success" | "error" | "warning"
//  Tipos modal  (requieren acción): "confirm" | "password"
//
//  USO:
//  <Alert
//    isOpen={alertConfig.open}
//    type={alertConfig.type}
//    title={alertConfig.title}
//    message={alertConfig.message}
//    onConfirm={handleConfirm}
//    onCancel={closeAlert}
//  />
// ─────────────────────────────────────────────────────────────

import React from "react";
import { TOAST_TYPES } from "./alertConfig";
import ToastAlert from "./ToastAlert";
import ModalAlert from "./ModalAlert";

const Alert = ({ isOpen, type = "success", title, message, onConfirm, onCancel, duration = 3000 }) => {
  if (!isOpen) return null;

  if (TOAST_TYPES.includes(type)) {
    return (
      <ToastAlert
        isOpen={isOpen}
        type={type}
        title={title}
        message={message}
        duration={duration}
        onClose={onCancel}
      />
    );
  }

  return (
    <ModalAlert
      isOpen={isOpen}
      type={type}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default Alert;
