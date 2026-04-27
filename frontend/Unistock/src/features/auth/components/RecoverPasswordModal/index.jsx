import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const FieldError = ({ msg }) => msg ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-semibold">⚠ {msg}</p>
) : null;

const CloseBtn = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);

const RecoverPasswordModal = ({ onClose, onSendCode, loading, error }) => {
    const [email, setEmail] = useState('');
    const emailErr = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Ingresa un correo válido' : '';
    const valid = email && !emailErr;

    const Navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative">
                <CloseBtn onClick={onClose} />
                <h2 className="text-center font-extrabold text-gray-800 text-base mb-2">Recuperar contraseña</h2>
                <p className="text-center text-gray-500 text-sm font-medium mb-5">
                    Ingresa tu correo y te enviaremos un código para reestablecer tu contraseña
                </p>
                <form onSubmit={(e) => { e.preventDefault(); if (valid) onSendCode(email); }} noValidate>
                    <div className="mb-4">
                        <div className={`border rounded-xl px-3 py-2.5 transition-all ${emailErr ? 'border-red-400 bg-red-50' : valid ? 'border-pink-400 ring-2 ring-pink-100' : 'border-gray-200 bg-gray-50'
                            }`}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="correoelectronico123@gmail.com"
                                className="w-full bg-transparent text-sm font-medium outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <FieldError msg={emailErr} />
                    </div>
                    {error && <p className="text-red-500 text-xs mb-3 text-center font-semibold">{error}</p>}
                    <button type="submit" disabled={!valid || loading}
                        className={`w-full py-3 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 active:scale-95 ${valid && !loading ? 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Enviando...' : 'Enviar código'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RecoverPasswordModal;