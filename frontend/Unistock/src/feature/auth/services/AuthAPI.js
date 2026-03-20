import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_nokqz2k";
const EMAILJS_TEMPLATE_ID = "template_rgm176v";
const EMAILJS_PUBLIC_KEY = "5IVlWdQ53cSfiS0i_";

const STORAGE_KEY = "app_users";
const PENDING_CODE_KEY = "auth_pending_code";
const GLOBAL_KEY = "12345678";

const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

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

// Carga los usuarios desde localStorage (igual que mockUsers)
const getStoredUsers = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return [];
};

export const AuthAPI = {

    // Valida que el usuario exista en localStorage y esté activo
    login: async ({ username, password }) => {
        if (!username || !password)
            throw new Error("Por favor completa todos los campos.");

        const users = getStoredUsers();

        // Busca por correo o nombre completo (insensible a mayúsculas)
        const found = users.find(
            (u) =>
                u.correo?.toLowerCase() === username.toLowerCase() ||
                u.nombreCompleto?.toLowerCase() === username.toLowerCase()
        );

        if (!found)
            throw new Error("Usuario no encontrado. Verifica tus datos.");

        if (found.estado === false)
            throw new Error("Tu cuenta está desactivada. Contacta al administrador.");

        // --- Lógica de contraseña ---
        // Si ya tiene contraseña personal, debe usarla (no puede volver a la global)
        if (found.password) {
            if (password !== found.password)
                throw new Error("Contraseña incorrecta.");
        } else {
            // Sin contraseña personal → solo acepta la clave global
            if (password !== GLOBAL_KEY)
                throw new Error("Contraseña incorrecta.");
        }

        // Guarda la sesión en localStorage
        localStorage.setItem("session_user", JSON.stringify({
            id: found.id,
            nombre: found.nombreCompleto,
            correo: found.correo,
            rol: found.rol,
            sede: found.sede,
        }));

        // Si entró con la clave global, avisar para forzar cambio
        const requiresPasswordChange = !found.password;
        return { user: found, requiresPasswordChange };
    },

    // Guarda la contraseña personal del usuario (primera vez o cambio forzado)
    savePersonalPassword: (userId, newPassword) => {
        const users = getStoredUsers();
        const updated = users.map((u) =>
            String(u.id) === String(userId)
                ? { ...u, password: newPassword }
                : u
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Actualizar sesión activa
        const raw = localStorage.getItem("session_user");
        if (raw) {
            const session = JSON.parse(raw);
            localStorage.setItem("session_user", JSON.stringify(session));
        }
    },

    // Valida que el correo exista en los usuarios antes de enviar el código
    sendRecoveryCode: async (email) => {
        const users = getStoredUsers();
        const found = users.find(
            (u) => u.correo?.toLowerCase() === email.toLowerCase()
        );

        if (!found)
            throw new Error("No existe ningún usuario con ese correo.");

        if (found.estado === false)
            throw new Error("Esta cuenta está desactivada.");

        const code = generateCode();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        setPendingCode({ email: email.toLowerCase(), code, expiresAt });

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            { email, code },
            EMAILJS_PUBLIC_KEY
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
        // Guardar la nueva contraseña en el usuario correspondiente
        const users = getStoredUsers();
        const found = users.find((u) => u.correo?.toLowerCase() === email.toLowerCase());
        if (found) {
            AuthAPI.savePersonalPassword(found.id, newPassword);
        }
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