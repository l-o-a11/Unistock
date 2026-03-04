import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import RecoverPasswordModal from '../components/RecoverPasswordModal';
import VerifyCodeModal from '../components/VerifyCodeModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { AUTH_MODALS } from '../types/constants';
import logo from '../../../assets/Login.jpeg';

const LoginPage = () => {
    const {
        activeModal, recoveryEmail, loading, error,
        openModal, closeModal, handleLogin, handleSendCode,
        handleVerifyCode, handleChangePassword,
    } = useAuth();

    const [toast, setToast] = useState('');
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; font-family: 'Nunito', sans-serif; }
        html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
      `}</style>

            <div className="h-screen overflow-hidden flex bg-gray-200">
                {/* Imagen izquierda — oculta en móvil */}
                <div className="hidden md:block md:w-1/2 relative flex-shrink-0">
                    <img src={logo} alt="Usuario" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50/20" />
                </div>

                {/* Panel derecho */}
                <div className="flex-1 flex items-center justify-center px-5 sm:px-10">
                    <LoginForm
                        onLogin={(u, p) => handleLogin(u, p).then(() => showToast('¡Sesión iniciada!'))}
                        onForgotPassword={() => openModal(AUTH_MODALS.RECOVER_PASSWORD)}
                        loading={loading && activeModal === AUTH_MODALS.NONE}
                        error={activeModal === AUTH_MODALS.NONE ? error : ''}
                    />
                </div>
            </div>

            {activeModal === AUTH_MODALS.RECOVER_PASSWORD && (
                <RecoverPasswordModal onClose={closeModal} onSendCode={handleSendCode} loading={loading} error={error} />
            )}
            {activeModal === AUTH_MODALS.VERIFY_CODE && (
                <VerifyCodeModal email={recoveryEmail} onClose={closeModal} onVerify={handleVerifyCode} onResend={() => handleSendCode(recoveryEmail)} loading={loading} error={error} />
            )}
            {activeModal === AUTH_MODALS.CHANGE_PASSWORD && (
                <ChangePasswordModal onClose={closeModal} onChangePassword={handleChangePassword} loading={loading} error={error} />
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl z-[100]">
                    {toast}
                </div>
            )}
        </>
    );
};

export default LoginPage;