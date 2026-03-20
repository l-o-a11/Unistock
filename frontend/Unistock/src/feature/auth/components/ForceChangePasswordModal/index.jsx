import { useState } from 'react';
import { MIN_PASSWORD_LENGTH } from '../../types/constants';

const GLOBAL_KEY = '12345678';

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

/**
 * Modal que se muestra cuando el usuario inicia sesión por primera vez
 * con la clave global. No se puede cerrar — es obligatorio cambiarla.
 */
const ForceChangePasswordModal = ({ userName, onChangePassword, loading }) => {
    const [np, setNp] = useState('');
    const [cp, setCp] = useState('');
    const [showNp, setShowNp] = useState(false);
    const [showCp, setShowCp] = useState(false);
    const [touched, setTouched] = useState({ n: false, c: false });
    const [error, setError] = useState('');

    const npErr = touched.n && np.length < MIN_PASSWORD_LENGTH
        ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`
        : '';
    const cpErr = touched.c && np !== cp ? 'Las contraseñas no coinciden' : '';

    // No puede ser igual a la clave global
    const isSameAsGlobal = np === GLOBAL_KEY;
    const valid =
        np.length >= MIN_PASSWORD_LENGTH &&
        np === cp &&
        !isSameAsGlobal;

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({ n: true, c: true });
        setError('');

        if (isSameAsGlobal) {
            setError('No puedes usar la clave provisional como contraseña.');
            return;
        }
        if (valid) onChangePassword(np);
    };

    const wrap = (err, val) =>
        `flex items-center border rounded-xl px-3 py-2.5 gap-2 transition-all ${err
            ? 'border-red-400 bg-red-50'
            : val
                ? 'border-pink-400 ring-2 ring-pink-100 bg-white'
                : 'border-gray-200 bg-gray-50'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative">

                {/* Ícono + encabezado */}
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center">
                        <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-center text-xl font-extrabold text-gray-800 mb-1">
                    Crea tu contraseña
                </h2>
                <p className="text-center text-gray-500 text-xs font-medium mb-1">
                    Hola, <span className="text-pink-500 font-bold">{userName}</span>
                </p>
                <p className="text-center text-gray-400 text-xs mb-5">
                    Estás usando la clave provisional. Debes crear una contraseña personal antes de continuar.
                </p>

                {/* Aviso — no se puede cerrar */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5 flex items-start gap-2">
                    <span className="text-amber-400 text-sm mt-0.5">⚠</span>
                    <p className="text-amber-700 text-xs font-semibold">
                        Este paso es obligatorio. No podrás acceder al sistema hasta que establezcas tu contraseña.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Nueva contraseña */}
                    <div className="mb-3">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Nueva contraseña
                        </label>
                        <div className={wrap(npErr, np)}>
                            <input
                                type={showNp ? 'text' : 'password'}
                                value={np}
                                onChange={(e) => { setNp(e.target.value); setTouched(t => ({ ...t, n: true })); }}
                                placeholder="Mínimo 8 caracteres"
                                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder-gray-400 text-gray-700"
                                autoFocus
                            />
                            <button type="button" onClick={() => setShowNp(!showNp)}
                                className="text-gray-400 hover:text-pink-400 transition-colors">
                                <EyeIcon open={showNp} />
                            </button>
                        </div>
                        {npErr && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {npErr}</p>}
                    </div>

                    {/* Confirmar */}
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Confirmar contraseña
                        </label>
                        <div className={wrap(cpErr, cp)}>
                            <input
                                type={showCp ? 'text' : 'password'}
                                value={cp}
                                onChange={(e) => { setCp(e.target.value); setTouched(t => ({ ...t, c: true })); }}
                                placeholder="Repite tu contraseña"
                                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder-gray-400 text-gray-700"
                            />
                            <button type="button" onClick={() => setShowCp(!showCp)}
                                className="text-gray-400 hover:text-pink-400 transition-colors">
                                <EyeIcon open={showCp} />
                            </button>
                        </div>
                        {cpErr && <p className="text-red-500 text-xs mt-1 font-semibold">⚠ {cpErr}</p>}
                    </div>

                    {(error || (isSameAsGlobal && touched.n)) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-xs text-center font-semibold">
                                ⚠ {error || 'No puedes usar la clave provisional como contraseña.'}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!valid || loading}
                        className={`w-full py-3 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 active:scale-95 ${valid && !loading
                            ? 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Guardando...' : 'Establecer contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForceChangePasswordModal;
