import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

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

const FieldError = ({ msg }) => msg ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-semibold">⚠ {msg}</p>
) : null;

const inputCls = (err, val) =>
    `flex items-center border rounded-xl px-3 py-2.5 gap-2 transition-all duration-200 ${err ? 'border-red-400 bg-red-50' : val ? 'border-pink-400 bg-white ring-2 ring-pink-100' : 'border-gray-200 bg-gray-50'
    }`;

const LoginForm = ({ onLogin, onForgotPassword, loading, error }) => {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [touched, setTouched] = useState({ u: false, p: false });

    const navigate = useNavigate();

    const uErr = touched.u && !user ? 'Este campo es requerido' : '';
    const pErr = touched.p && !pass ? 'Este campo es requerido' : '';
    const valid = user.trim() && pass.trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({ u: true, p: true });
        if (valid) onLogin(user, pass);
    };

    const login = (e) => {
        e.preventDefault();

        navigate("/Layout")
    }


    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 sm:p-8">
            <h1 className="text-3xl font-extrabold text-black mb-1">Bienvenido</h1>
            <p className="text-gray-500 text-sm font-medium mb-6">Accede a tu panel de administración.</p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Nombre del usuario o correo electrónico
                    </label>
                    <div className={inputCls(uErr, user)}>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input type="text" value={user}
                            onChange={(e) => { setUser(e.target.value); setTouched(t => ({ ...t, u: true })); }}
                            placeholder="Salome@gmail.com o salome hurtado Berrio"
                            className="flex-1 bg-transparent text-sm font-medium outline-none text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    <FieldError msg={uErr} />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
                    <div className={inputCls(pErr, pass)}>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input type={showPass ? 'text' : 'password'} value={pass}
                            onChange={(e) => { setPass(e.target.value); setTouched(t => ({ ...t, p: true })); }}
                            placeholder="••••••••••••"
                            className="flex-1 bg-transparent text-sm font-medium outline-none text-gray-700 placeholder-gray-400"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-pink-400 transition-colors">
                            <EyeIcon open={showPass} />
                        </button>
                    </div>
                    <FieldError msg={pErr} />
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm text-center font-semibold">{error}</p>
                    </div>
                )}

                <button type="submit" disabled={loading} onClick={login}
                    className={`w-full py-3 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 active:scale-95 ${valid && !loading ? 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
            </form>

            <button onClick={onForgotPassword}
                className="w-full text-center text-pink-500 text-sm font-bold mt-4 hover:underline transition-colors"
            >
                ¿Olvidaste tu contraseña?
            </button>
        </div>
    );
};

export default LoginForm;