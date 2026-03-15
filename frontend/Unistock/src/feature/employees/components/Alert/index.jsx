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
