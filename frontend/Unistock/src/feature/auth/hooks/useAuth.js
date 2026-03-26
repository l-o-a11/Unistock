import { useState } from "react";
import { AUTH_MODALS } from "../types/constants";
import { AuthAPI } from "../services/AuthAPI";

export const useAuth = () => {
  const [activeModal, setActiveModal] = useState(AUTH_MODALS.NONE);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verifiedCode, setVerifiedCode] = useState(""); // ← guarda el código verificado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forceChange, setForceChange] = useState(null);

  const [alert, setAlert] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const showAlert = (type, title, message = "") =>
    setAlert({ isOpen: true, type, title, message });
  const closeAlert = () => setAlert((a) => ({ ...a, isOpen: false }));
  const openModal = (modal) => {
    setError("");
    setActiveModal(modal);
  };
  const closeModal = () => {
    setError("");
    setActiveModal(AUTH_MODALS.NONE);
  };

  const handleLogin = async (username, password, onSuccess) => {
    setLoading(true);
    setError("");
    try {
      const data = await AuthAPI.login({ username, password });

      if (data.requiresPasswordChange) {
        setForceChange({
          userId: data.user.id,
          userName: data.user.nombreCompleto,
        });
        return;
      }

      showAlert("success", "¡Bienvenido!", `Hola, ${data.user.nombreCompleto}`);
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch (err) {
      showAlert("error", "Error al iniciar sesión", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceChangePassword = async (newPassword, onSuccess) => {
    if (!forceChange) return;
    setLoading(true);
    try {
      AuthAPI.savePersonalPassword(forceChange.userId, newPassword);
      setForceChange(null);
      showAlert(
        "success",
        "¡Contraseña creada!",
        "Ya puedes usar tu nueva contraseña.",
      );
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch (err) {
      showAlert("error", "Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (email) => {
    setLoading(true);
    setError("");
    try {
      await AuthAPI.sendRecoveryCode(email);
      setRecoveryEmail(email);
      setActiveModal(AUTH_MODALS.VERIFY_CODE);
      showAlert("success", "Código enviado", `Revisa tu correo: ${email}`);
    } catch (err) {
      setError(err.message);
      showAlert("error", "Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    setLoading(true);
    setError("");
    try {
      await AuthAPI.verifyCode(recoveryEmail, code);
      setVerifiedCode(code); // ← guarda el código para usarlo en el siguiente paso
      setActiveModal(AUTH_MODALS.CHANGE_PASSWORD);
    } catch (err) {
      setError(err.message);
      showAlert("error", "Código incorrecto", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (newPassword) => {
    setLoading(true);
    setError("");
    try {
      // Pasa el código verificado — no null
      await AuthAPI.changePassword(recoveryEmail, verifiedCode, newPassword);
      setVerifiedCode("");
      closeModal();
      showAlert(
        "success",
        "¡Contraseña actualizada!",
        "Ya puedes iniciar sesión con tu nueva contraseña.",
      );
    } catch (err) {
      setError(err.message);
      showAlert("error", "Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeModal,
    recoveryEmail,
    loading,
    error,
    alert,
    forceChange,
    closeAlert,
    openModal,
    closeModal,
    handleLogin,
    handleForceChangePassword,
    handleSendCode,
    handleVerifyCode,
    handleChangePassword,
  };
};