import { useAuth } from "../hooks/useAuth";
import { useAuthContext } from "../../shared/AuthContext";
import LoginForm from "../components/LoginForm";
import RecoverPasswordModal from "../components/RecoverPasswordModal";
import VerifyCodeModal from "../components/VerifyCodeModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { AUTH_MODALS } from "../types/constants";
import Alert from "../../shared/components/Alert.jsx";
import logo from "../../../assets/Login.jpeg";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: ctxLogin, getFirstAccessibleRoute } = useAuthContext();

  const {
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
  } = useAuth();

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; font-family: 'Nunito', sans-serif; }
  html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }

  @keyframes zoom {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  .animate-zoom {
    animation: zoom 8s ease-in-out infinite;
    transform-origin: center center;
  }
`}</style>

      <div className="h-screen overflow-hidden flex bg-[#F8F9FA]">
        {/* Imagen izquierda — oculta en móvil */}
        <div className="hidden md:block md:w-1/2 relative flex-shrink-0 overflow-hidden">
          <img
            src={logo}
            alt="Login"
            className="w-full h-full object-cover animate-zoom"
          />

          {/* Capa de difuminación lateral hacia la derecha */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F8F9FA]/30 to-[#F8F9FA]"></div>

          {/* Capa superior e inferior para suavizar bordes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA]/20 via-transparent to-[#F8F9FA]/20"></div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10">
          <LoginForm
            onLogin={(u, p) => handleLogin(u, p, (s) => { ctxLogin(s); }, () => navigate(getFirstAccessibleRoute()))}
            onForgotPassword={() => openModal(AUTH_MODALS.RECOVER_PASSWORD)}
            loading={loading && activeModal === AUTH_MODALS.NONE}
            error={activeModal === AUTH_MODALS.NONE ? error : ""}
          />
        </div>
      </div>

      {/* Modal cambio de contraseña obligatorio (primer login) */}
      {forceChange && (
        <ForceChangePasswordModal
          userName={forceChange.userName}
          onChangePassword={(pwd) =>
            handleForceChangePassword(pwd, () => navigate(getFirstAccessibleRoute()))
          }
          loading={loading}
        />
      )}

      {/* Modales */}
      {activeModal === AUTH_MODALS.RECOVER_PASSWORD && (
        <RecoverPasswordModal
          onClose={closeModal}
          onSendCode={handleSendCode}
          loading={loading}
          error={error}
        />
      )}

      {activeModal === AUTH_MODALS.VERIFY_CODE && (
        <VerifyCodeModal
          email={recoveryEmail}
          onClose={closeModal}
          onVerify={handleVerifyCode}
          onResend={() => handleSendCode(recoveryEmail)}
          loading={loading}
          error={error}
        />
      )}

      {activeModal === AUTH_MODALS.CHANGE_PASSWORD && (
        <ChangePasswordModal
          onClose={closeModal}
          onChangePassword={handleChangePassword}
          loading={loading}
          error={error}
        />
      )}

      {/* Alert global */}
      <Alert
        isOpen={alert?.isOpen}
        type={alert?.type}
        title={alert?.title}
        message={alert?.message}
        onCancel={closeAlert}
        onConfirm={closeAlert}
      />
    </>
  );
};

export default LoginPage;