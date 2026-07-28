import { useState } from "react";
import { post, put } from "../../shared/utils/httpClient";

const SESSION_KEY = "session_user";

const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* ── Icons ─────────────────────────────────────────────────────────── */
const UserIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
);

/* ── Reusable field with left icon ──────────────────────────────────── */
const IconInput = ({ icon, type = "text", value, onChange, placeholder, disabled, className = "" }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all bg-gray-50
    ${disabled
      ? "border-gray-200 cursor-not-allowed"
      : "border-gray-200 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 focus-within:bg-white"
    } ${className}`}>
    <span className="shrink-0">{icon}</span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
    />
  </div>
);

/* ── Password field ─────────────────────────────────────────────────── */
const PasswordInput = ({ value, onChange, placeholder, show, onToggle, hasError, hasSuccess }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all bg-gray-50 focus-within:bg-white
    ${hasError ? "border-red-300 focus-within:ring-2 focus-within:ring-red-100"
      : hasSuccess ? "border-green-300 focus-within:ring-2 focus-within:ring-green-100"
        : "border-gray-200 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100"}`}>
    <LockIcon />
    <input
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
    />
    <button type="button" onClick={onToggle} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
      <EyeIcon open={show} />
    </button>
  </div>
);

/* ── Section card ───────────────────────────────────────────────────── */
const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-stretch">
      <div className="w-1 bg-pink-500 rounded-l-2xl shrink-0" />
      <div className="flex-1 px-6 py-3.5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────────────────── */
const ProfilePage = () => {
  const session = getSession();

  const [nombre, setNombre] = useState(session?.nombre ?? "");
  const [correo] = useState(session?.correo ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const passwordRules = [
    { label: "Mínimo 8 caracteres", ok: newPassword.length >= 8 },
    { label: "Al menos una mayúscula", ok: /[A-Z]/.test(newPassword) },
    { label: "Al menos una minúscula", ok: /[a-z]/.test(newPassword) },
    { label: "Al menos un número", ok: /\d/.test(newPassword) },
    { label: "Al menos un especial (* - _ # ~ $)", ok: /[*\-_#~$]/.test(newPassword) },
  ];

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    if (!nombre.trim()) { setProfileError("El nombre no puede estar vacío."); return; }
    setProfileLoading(true);
    try {
      await put("/auth/profile", { nombreCompleto: nombre.trim(), correo: correo.trim() });
      const sess = getSession();
      if (sess) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...sess, nombre: nombre.trim() }));
      setProfileSuccess("¡Información actualizada correctamente!");
    } catch (err) {
      setProfileError(err?.message ?? "Error al guardar los cambios.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword) { setPasswordError("Ingresa tu contraseña actual."); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*\-_#~$])[A-Za-z\d*\-_#~$]{8,}$/.test(newPassword)) {
      setPasswordError("La nueva contraseña no cumple los requisitos de seguridad.");
      return;
    }
    if (newPassword !== confirmPassword) { setPasswordError("Las contraseñas no coinciden."); return; }
    if (newPassword === currentPassword) { setPasswordError("La nueva contraseña no puede ser igual a la actual."); return; }
    setPasswordLoading(true);
    try {
      await post("/auth/verify-password", { password: currentPassword });
      await put("/auth/change-password", {
        passwordActual: currentPassword,
        passwordNueva: newPassword,
        confirmarPassword: confirmPassword,
      });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setPasswordSuccess("¡Contraseña actualizada correctamente!");
    } catch (err) {
      setPasswordError(err?.message ?? "Error al actualizar la contraseña.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const passwordsMatch = confirmPassword && confirmPassword === newPassword;
  const passwordsMismatch = confirmPassword && confirmPassword !== newPassword;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="px-8 pt-5 pb-3">
        <h1 className="text-lg font-bold text-gray-900">Mi perfil</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Administra tu información personal y seguridad</p>
      </div>

      <div className="px-8 pb-4 flex flex-col gap-3">

        {/* ── Card: Información personal ─────────────────────────────── */}
        <SectionCard title="Información personal" subtitle="Actualiza tu nombre y datos de contacto">
          <div className="grid grid-cols-2 gap-5 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nombre completo
              </label>
              <IconInput
                icon={<UserIcon />}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Correo electrónico
              </label>
              <IconInput
                icon={<MailIcon />}
                type="email"
                value={correo}
                disabled
                placeholder="correo@ejemplo.com"
              />
              <p className="text-[11px] text-gray-400 mt-0.5 ml-1">No se puede modificar</p>
            </div>
          </div>

          {profileError && <p className="text-xs text-red-500 font-medium mb-2">⚠ {profileError}</p>}
          {profileSuccess && <p className="text-xs text-green-500 font-medium mb-2">✓ {profileSuccess}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={profileLoading}
              className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-100 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {profileLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </SectionCard>

        {/* ── Card: Cambiar contraseña ───────────────────────────────── */}
        <SectionCard title="Cambiar contraseña" subtitle="Usa una contraseña de al menos 8 caracteres">
          <div className="grid grid-cols-3 gap-5 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Contraseña actual
              </label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nueva contraseña
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Confirmar contraseña
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                hasError={passwordsMismatch}
                hasSuccess={passwordsMatch}
              />
              {passwordsMismatch && <p className="text-[11px] text-red-400 mt-0.5 ml-1">Las contraseñas no coinciden</p>}
              {passwordsMatch && <p className="text-[11px] text-green-500 mt-0.5 ml-1">✓ Las contraseñas coinciden</p>}
            </div>
          </div>

          {/* Password strength rules — only when typing */}
          {newPassword.length > 0 && (
            <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {passwordRules.map((rule) => (
                <span key={rule.label} className={`text-[11px] flex items-center gap-1.5 ${rule.ok ? "text-green-500" : "text-gray-400"}`}>
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] shrink-0 border ${rule.ok ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                    {rule.ok ? "✓" : ""}
                  </span>
                  {rule.label}
                </span>
              ))}
            </div>
          )}

          {passwordError && <p className="text-xs text-red-500 font-medium mb-2">⚠ {passwordError}</p>}
          {passwordSuccess && <p className="text-xs text-green-500 font-medium mb-2">✓ {passwordSuccess}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={passwordLoading}
              className="px-5 py-1.5 rounded-lg text-xs font-semibold border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {passwordLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default ProfilePage;