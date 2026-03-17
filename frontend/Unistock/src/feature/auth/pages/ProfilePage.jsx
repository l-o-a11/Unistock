import { useState } from 'react';

// ── Helpers de localStorage (mismas keys que useUsers y AuthAPI) ────────────
const USERS_KEY = 'app_users';
const SESSION_KEY = 'session_user';

const getSession = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
};

// ✅ Actualiza nombre y correo en app_users Y en session_user simultáneamente
const updateProfileInStorage = (sessionId, nombre, correo) => {
    // 1. Actualizar en la lista de usuarios (app_users)
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    const updatedUsers = users.map((u) =>
        String(u.id) === String(sessionId)
            ? { ...u, nombreCompleto: nombre, correo }
            : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    // 2. Actualizar la sesión activa (session_user)
    const session = getSession();
    if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, nombre, correo }));
    }
};

// ── EyeIcon ────────────────────────────────────────────────────────────────
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

// ── Componente principal ───────────────────────────────────────────────────
const ProfilePage = () => {
    const session = getSession();

    const [nombre, setNombre] = useState(session?.nombre ?? '');
    const [correo, setCorreo] = useState(session?.correo ?? '');

    // 'idle'      → solo contraseña actual + botón Confirmar
    // 'confirmed' → se revelan campos nueva contraseña + Cancelar/Guardar
    const [passwordStep, setPasswordStep] = useState('idle');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ── Confirmar contraseña actual ────────────────────────────────────────
    const handleConfirm = () => {
        setError('');
        if (!currentPassword) {
            setError('Ingresa tu contraseña actual.');
            return;
        }
        setPasswordStep('confirmed');
    };

    // ── Cancelar cambio de contraseña ──────────────────────────────────────
    const handleCancel = () => {
        setPasswordStep('idle');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };

    // ── Guardar cambios ────────────────────────────────────────────────────
    const handleSave = async () => {
        setError('');
        setSuccess('');

        if (!nombre.trim()) {
            setError('El nombre no puede estar vacío.');
            return;
        }

        if (passwordStep === 'confirmed') {
            if (newPassword.length < 6) {
                setError('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
        }

        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600)); // simula delay de red

            // ✅ Escribe en app_users (lista de usuarios) y en session_user (sesión)
            updateProfileInStorage(session?.id, nombre.trim(), correo.trim());

            setSuccess('¡Cambios guardados correctamente!');
            handleCancel();
        } catch (err) {
            setError(err.message ?? 'Error al guardar los cambios.');
        } finally {
            setLoading(false);
        }
    };

    // ── Estilos reutilizables ──────────────────────────────────────────────
    const inputBase =
        'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all bg-white placeholder-gray-400';

    const passwordWrapper =
        'flex items-center border border-gray-300 rounded-xl px-4 py-3 gap-2 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 transition-all bg-white';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Encabezado */}
            <div className="px-10 pt-10 pb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>
                {session && (
                    <span className="text-sm text-gray-400 font-medium">{session.nombre}</span>
                )}
            </div>

            {/* Tarjeta */}
            <div className="mx-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                {/* ── Información del usuario ── */}
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-3">Información del usuario</h2>
                    <hr className="border-gray-200 mb-6" />
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputBase} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
                            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className={inputBase} />
                        </div>
                    </div>
                </div>

                {/* ── Cambiar contraseña ── */}
                <div className="mt-2">
                    <h2 className="text-base font-semibold text-gray-800 mb-3">Cambiar contraseña</h2>
                    <hr className="border-gray-200 mb-6" />

                    {/* Fila 1: Contraseña actual + Confirmar */}
                    <div className="flex items-end gap-6 mb-5">
                        <div className="flex-1 max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                            <div className={passwordWrapper}>
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••••••••••••••"
                                    className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <EyeIcon open={showCurrent} />
                                </button>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={passwordStep === 'confirmed'}
                                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95
                                    ${passwordStep === 'confirmed'
                                        ? 'bg-pink-300 text-white cursor-default'
                                        : 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100'}`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>

                    {/* Fila 2: Nueva + Confirmar nueva */}
                    {passwordStep === 'confirmed' && (
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                                <div className={passwordWrapper}>
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••••••••••••••"
                                        className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <EyeIcon open={showNew} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
                                <div className={passwordWrapper}>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••••••••••••••"
                                        className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <EyeIcon open={showConfirm} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensajes */}
                    {error && <p className="text-red-500 text-sm mb-4 font-medium">⚠ {error}</p>}
                    {success && <p className="text-green-500 text-sm mb-4 font-medium">✓ {success}</p>}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 mt-4">
                        {passwordStep === 'confirmed' && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 active:scale-95"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Guardar Cambios — siempre visible ── */}
            <div className="mx-10 mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl font-semibold text-sm bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;