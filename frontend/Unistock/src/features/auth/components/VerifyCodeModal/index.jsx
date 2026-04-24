import { useState } from 'react';
import { CODE_LENGTH } from '../../types/constants';

const CloseBtn = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);

const VerifyCodeModal = ({ email, onClose, onVerify, onResend, loading, error }) => {
    const [code, setCode] = useState('');
    const valid = code.length === CODE_LENGTH && /^\d+$/.test(code);
    const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] || '0');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative">
                <CloseBtn onClick={onClose} />
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-pink-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-center font-extrabold text-gray-800 mb-1">Verifica tu código</h2>
                <p className="text-center text-gray-500 text-xs font-medium mb-1">Hemos enviado un código de 6 dígitos a:</p>
                <p className="text-center text-pink-500 text-sm font-bold mb-4">{email}</p>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-4 text-center">
                    <p className="text-blue-400 text-xs font-semibold">Ejemplo:</p>
                    <p className="text-blue-500 text-lg font-extrabold tracking-widest">123456</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); if (valid) onVerify(code); }} noValidate>
                    <div className="relative mb-4">
                        <div className="flex gap-1.5 pointer-events-none">
                            {digits.map((d, i) => (
                                <div key={i} className={`flex-1 h-10 flex items-center justify-center border rounded-lg text-base font-extrabold transition-all ${code[i] ? 'border-pink-400 text-gray-800 bg-pink-50' : 'border-gray-200 text-gray-300'
                                    }`}>{d}</div>
                            ))}
                        </div>
                        <input type="text" inputMode="numeric" value={code} autoFocus
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                            className="absolute inset-0 opacity-0 cursor-text w-full"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs mb-3 text-center font-semibold">{error}</p>}
                    <button type="submit" disabled={!valid || loading}
                        className={`w-full py-3 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 active:scale-95 ${valid && !loading ? 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Verificando...' : 'Verificar código'}
                    </button>
                </form>
                <button onClick={onResend} className="w-full text-left text-pink-500 text-xs font-bold mt-3 hover:underline">
                    ¿No recibiste el código? Reenviar
                </button>
            </div>
        </div>
    );
};

export default VerifyCodeModal;