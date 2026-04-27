import { useState } from 'react';
import { MIN_PASSWORD_LENGTH } from '../../types/constants';

const EyeIcon = ({ open }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        ) : (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </>
        )}
    </svg>
);

const CloseBtn = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);

const ChangePasswordModal = ({ onClose, onChangePassword, loading, error }) => {
    const [np, setNp] = useState('');
    const [cp, setCp] = useState('');
    const [showNp, setShowNp] = useState(false);
    const [showCp, setShowCp] = useState(false);
    const [touched, setTouched] = useState({ n: false, c: false });

    const npErr = touched.n && np.length < MIN_PASSWORD_LENGTH ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres` : '';
    const cpErr = touched.c && np !== cp ? 'Las contraseñas no coinciden' : '';
    const valid = np.length >= MIN_PASSWORD_LENGTH && np === cp;

    const wrap = (err, val) =>
        `flex items-center border rounded-xl px-3 py-2.5 gap-2 transition-all ${err ? 'border-red-400 bg-red-50' : val ? 'border-pink-400 ring-2 ring-pink-100' : 'border-gray-200 bg-gray-50'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative">
                <CloseBtn onClick={onClose} />
                <h2 className="text-center font-extrabold text-gray-800 mb-2">Cambiar contraseña</h2>
                <p className="text-center text-gray-500 text-xs font-medium mb-5">
                    Ingresa tu nueva contraseña. Debe tener al menos {MIN_PASSWORD_LENGTH} caracteres.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); setTouched({ n: true, c: true }); if (valid) onChangePassword(np); }} noValidate>
                    <div className="mb-3">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Nueva contraseña</label>
                        <div className={wrap(npErr, np)}>
                            <input type={showNp ? 'text' : 'password'} value={np}
                                onChange={(e) => { setNp(e.target.value); setTouched(t => ({ ...t, n: true })); }}
                                placeholder="Ingresa tu nueva contraseña"
                                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder-gray-400"
                            />
                            <button type="button" onClick={() => setShowNp(!showNp)} className="text-gray-400 hover:text-pink-400 transition-colors">
                                <EyeIcon open={showNp} />
                            </button>
                        </div>
                        {npErr && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {npErr}</p>}
                    </div>
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirmar contraseña</label>
                        <div className={wrap(cpErr, cp)}>
                            <input type={showCp ? 'text' : 'password'} value={cp}
                                onChange={(e) => { setCp(e.target.value); setTouched(t => ({ ...t, c: true })); }}
                                placeholder="Confirma tu nueva contraseña"
                                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder-gray-400"
                            />
                            <button type="button" onClick={() => setShowCp(!showCp)} className="text-gray-400 hover:text-pink-400 transition-colors">
                                <EyeIcon open={showCp} />
                            </button>
                        </div>
                        {cpErr && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {cpErr}</p>}
                    </div>
                    {error && <p className="text-red-500 text-xs mb-3 text-center font-semibold">{error}</p>}
                    <button type="submit" disabled={!valid || loading}
                        className={`w-full py-3 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 active:scale-95 ${valid && !loading ? 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;