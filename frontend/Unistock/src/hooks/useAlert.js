import { useState } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = ({ message, type = 'info', onConfirm, onCancel }) => {
    setAlert({
      isOpen: true,
      message,
      type,
      onConfirm: onConfirm || (() => closeAlert()),
      onCancel: onCancel || null,
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  return {
    alert,
    showAlert,
    closeAlert,
  };
};