import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_nokqz2k";
const EMAILJS_TEMPLATE_ID = "template_rgm176v"; // recuperación (ya existente)
const EMAILJS_WELCOME_TEMPLATE = "template_7pb7ues"; // ← nueva plantilla de bienvenida
const EMAILJS_PUBLIC_KEY = "5IVlWdQ53cSfiS0i_";

const STORAGE_KEY = "app_users";
const PENDING_CODE_KEY = "auth_pending_code";

// ── Generadores ────────────────────────────────────────────────────────────

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Genera una contraseña aleatoria de 8 caracteres
 * con al menos 1 mayúscula, 1 minúscula y 1 número.
 * Ejemplo: "aR7kXm2P"
 */
const generatePassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const all = upper + lower + numbers;

  // Garantiza al menos 1 de cada tipo
  const pick = (str) => str[Math.floor(Math.random() * str.length)];
  const required = [pick(upper), pick(lower), pick(numbers)];

  // Rellena los 5 restantes con cualquier carácter
  const rest = Array.from({ length: 5 }, () => pick(all));

  // Mezcla el array para que no siempre empiece igual
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
};

// ── localStorage helpers ───────────────────────────────────────────────────

const getPendingCode = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_CODE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setPendingCode = (value) => {
  if (value === null) {
    sessionStorage.removeItem(PENDING_CODE_KEY);
  } else {
    sessionStorage.setItem(PENDING_CODE_KEY, JSON.stringify(value));
  }
};

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // error leyendo localStorage
  }
  return [];
};

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// ── API ────────────────────────────────────────────────────────────────────

export const AuthAPI = {
  /**
   * Genera contraseña aleatoria, la guarda en el usuario y
   * envía el correo de bienvenida con EmailJS.
   *
   * Llamar desde UserForm al crear un usuario nuevo.
   * Parámetros: { email, nombreCompleto, loginUrl }
   */
  // Genera la contraseña — llamar ANTES de crear el usuario
  prepareWelcome: (email) => {
    const password = generatePassword();
    return { email, password };
  },

  // Envía el correo de bienvenida — la contraseña ya viene generada desde afuera
  sendWelcomeEmail: async ({
    email,
    nombreCompleto,
    password,
    loginUrl = window.location.origin + "/login",
  }) => {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_WELCOME_TEMPLATE,
      {
        to_email: email,
        to_name: nombreCompleto,
        user_email: email,
        password,
        login_url: loginUrl,
      },
      EMAILJS_PUBLIC_KEY,
    );

    return { success: true };
  },

  // ── Login ──────────────────────────────────────────────────────────────
  login: async ({ username, password }) => {
    if (!username || !password)
      throw new Error("Por favor completa todos los campos.");

    const users = getStoredUsers();

    const found = users.find(
      (u) =>
        u.correo?.toLowerCase() === username.toLowerCase() ||
        u.nombreCompleto?.toLowerCase() === username.toLowerCase(),
    );

    if (!found) throw new Error("Usuario no encontrado. Verifica tus datos.");

    if (found.estado === false)
      throw new Error("Tu cuenta está desactivada. Contacta al administrador.");

    if (!found.password)
      throw new Error("Tu cuenta aún no ha sido activada. Revisa tu correo.");

    if (password !== found.password) throw new Error("Contraseña incorrecta.");

    localStorage.setItem(
      "session_user",
      JSON.stringify({
        id: found.id,
        nombre: found.nombreCompleto,
        correo: found.correo,
        rol: found.rol,
        sede: found.sede,
      }),
    );

    return { user: found };
  },

  // ── Guardar contraseña personal ────────────────────────────────────────
  savePersonalPassword: (userId, newPassword) => {
    const users = getStoredUsers();
    const updated = users.map((u) =>
      String(u.id) === String(userId) ? { ...u, password: newPassword } : u,
    );
    saveUsers(updated);
  },

  // ── Recuperación de contraseña ─────────────────────────────────────────
  sendRecoveryCode: async (email) => {
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.correo?.toLowerCase() === email.toLowerCase(),
    );

    if (!found) throw new Error("No existe ningún usuario con ese correo.");

    if (found.estado === false)
      throw new Error("Esta cuenta está desactivada.");

    const code = generateCode();
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

  changePassword: async (email, code, newPassword) => {
    await AuthAPI.verifyCode(email, code);
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.correo?.toLowerCase() === email.toLowerCase(),
    );
    if (found) AuthAPI.savePersonalPassword(found.id, newPassword);
    setPendingCode(null);
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem("session_user");
  },

  getSession: () => {
    try {
      const raw = localStorage.getItem("session_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};