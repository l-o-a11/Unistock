import { useState } from "react";
import { AUTH_MODALS } from "../types/constants";
import { AuthAPI } from "../services/AuthAPI";

export const useAuth = () => {
  const [activeModal, setActiveModal] = useState(AUTH_MODALS.NONE);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetToken, setResetToken] = useState(""); // ← guarda el resetToken que devuelve verifyCode
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

  // FIX: recibe ctxLogin (del AuthContext) para actualizar el estado React
  // en el mismo instante del login, sin esperar un refresh.
  const handleLogin = async (username, password, ctxLogin, onSuccess) => {
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

      // Leer la sesión que AuthAPI.login() acaba de guardar en localStorage.
      // Si por algún motivo no está, decodificar el JWT directamente aquí.
      let session = AuthAPI.getSession();
      if (!session?.rolNombre && data.token) {
        try {
          const claims = JSON.parse(atob(data.token.split(".")[1]));
          session = {
            id: data.user?.id ?? data.user?._id,
            nombre: data.user?.nombreCompleto ?? data.user?.nombre,
            correo: data.user?.correo,
            rolId: data.user?.rolId ?? claims?.rolId,
            rolNombre: claims?.rolNombre ?? null,
            sedeId: data.user?.sedeId ?? claims?.sedeId,
            sedeNombre: claims?.sedeNombre ?? null,
            token: data.token,
          };
        } catch { session = data.user; }
      }
      if (ctxLogin) ctxLogin(session ?? data.user);

      showAlert("success", "¡Bienvenido!", `Hola, ${data.user.nombreCompleto}`);

      // IMPORTANTE:
      // Pasamos la sesión directamente para que la ruta
      // no dependa de que React haya actualizado el contexto.
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(session ?? data.user);
        }, 1200);
      }
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
      const notFound = err?.status === 404 || /no.*encontrado|not found|no existe/i.test(err?.message || "");
      const message = notFound
        ? "El correo no existe o no se encuentra registrado en la aplicación."
        : err.message || "No se pudo enviar el código. Intenta nuevamente.";
      setError(message);
      showAlert("error", "Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    setLoading(true);
    setError("");
    try {
      const result = await AuthAPI.verifyCode(recoveryEmail, code);
      // FIX: guardar el resetToken que devuelve la API, no el código
      setResetToken(result?.resetToken ?? result?.data?.resetToken ?? "");
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
      // FIX: pasar resetToken (no correo ni código) a reset-password
      await AuthAPI.changePassword(resetToken, newPassword);
      setResetToken("");
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