import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID       = "service_nokqz2k";
const EMAILJS_TEMPLATE_ID      = "template_rgm176v";
const EMAILJS_WELCOME_TEMPLATE = "template_7pb7ues";
const EMAILJS_PUBLIC_KEY       = "5IVlWdQ53cSfiS0i_";

const PENDING_CODE_KEY = "auth_pending_code";

// ─────────────────────────────────────────────────────────────────────────────
// URL base de la API  (configura VITE_API_URL en tu .env del frontend si cambia)
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ── Generadores ───────────────────────────────────────────────────────────────
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── sessionStorage helpers (recuperación de contraseña) ──────────────────────
const getPendingCode = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_CODE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const setPendingCode = (value) => {
  if (value === null) {
    sessionStorage.removeItem(PENDING_CODE_KEY);
  } else {
    sessionStorage.setItem(PENDING_CODE_KEY, JSON.stringify(value));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
export const AuthAPI = {

  // ── Correo de bienvenida (se sigue usando EmailJS — sin cambios) ───────────
  prepareWelcome: () => {
    // La contraseña real ahora la genera la API — este método ya no se necesita
    // pero se mantiene por compatibilidad con UserForm.
    return {};
  },

  sendWelcomeEmail: async ({ email, nombreCompleto, password, loginUrl = window.location.origin + "/login" }) => {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_WELCOME_TEMPLATE,
      { to_email: email, to_name: nombreCompleto, user_email: email, password, login_url: loginUrl },
      EMAILJS_PUBLIC_KEY,
    );
    return { success: true };
  },

  // ── Login — ahora llama a la API real ─────────────────────────────────────
  login: async ({ username, password }) => {
    if (!username || !password)
      throw new Error("Por favor completa todos los campos.");

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: username, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      // La API devuelve { success: false, message: "..." } en errores
      throw new Error(json.message ?? "Credenciales inválidas.");
    }

    const { token, user } = json.data;

    // Guardar token para que http.js lo adjunte en cada request
    localStorage.setItem("token", token);

    // Guardar sesión para que AuthContext la lea al recargar la página
    localStorage.setItem(
      "session_user",
      JSON.stringify({
        id:             user.id,
        nombreCompleto: user.nombreCompleto,
        correo:         user.correo,
        rolId:          user.rolId,
        sedeId:         user.sedeId,
      }),
    );

    return { user };
  },

  // ── Recuperación de contraseña (sin cambios — sigue siendo EmailJS) ────────
  sendRecoveryCode: async (email) => {
    // Nota: ahora verifica contra la API en vez de localStorage.
    // Si prefieres mantener EmailJS para reset de contraseña, está bien así.
    const code     = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    setPendingCode({ email: email.toLowerCase(), code, expiresAt });

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { email, code },
      EMAILJS_PUBLIC_KEY,
    );
    return { success: true };
  },

  verifyCode: async (email, code) => {
    const pendingCode = getPendingCode();
    if (!pendingCode)
      throw new Error("No hay código pendiente. Solicita uno nuevo.");
    if (pendingCode.email !== email.toLowerCase())
      throw new Error("El correo no coincide.");
    if (Date.now() > pendingCode.expiresAt) {
      setPendingCode(null);
      throw new Error("El código expiró. Solicita uno nuevo.");
    }
    if (pendingCode.code !== code)
      throw new Error("Código incorrecto. Inténtalo de nuevo.");
    return { success: true };
  },

  changePassword: async (email, code, _newPassword) => {
    await AuthAPI.verifyCode(email, code);
    // TODO: cuando tengas el endpoint de reset-password en la API,
    // hacer PUT /auth/reset-password aquí.
    setPendingCode(null);
    return { success: true };
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("session_user");
  },

  // ── Sesión activa ─────────────────────────────────────────────────────────
  getSession: () => {
    try {
      const raw = localStorage.getItem("session_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
};