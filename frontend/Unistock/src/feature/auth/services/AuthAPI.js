import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_nokqz2k";
const EMAILJS_TEMPLATE_ID = "template_rgm176v";
const EMAILJS_PUBLIC_KEY = "5IVlWdQ53cSfiS0i_";

const STORAGE_KEY = "app_users";

let pendingCode = null; // { email, code, expiresAt }

const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

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

        // Como no hay contraseñas reales en mockUsers, cualquier contraseña
        // no vacía se acepta. Cuando tengas backend real, aquí va la validación.
        // Por ahora puedes poner una contraseña fija por usuario si lo necesitas.

        // Guarda la sesión en localStorage
        localStorage.setItem("session_user", JSON.stringify({
            id: found.id,
            nombre: found.nombreCompleto,
            correo: found.correo,
            rol: found.rol,
            sede: found.sede,
        }));

        return { user: found };
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
        pendingCode = { email: email.toLowerCase(), code, expiresAt };

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            { email, code },
            EMAILJS_PUBLIC_KEY
        );

        return { success: true };
    },

    verifyCode: async (email, code) => {
        if (!pendingCode)
            throw new Error("No hay código pendiente. Solicita uno nuevo.");

        if (pendingCode.email !== email.toLowerCase())
            throw new Error("El correo no coincide.");

        if (Date.now() > pendingCode.expiresAt) {
            pendingCode = null;
            throw new Error("El código expiró. Solicita uno nuevo.");
        }

        if (pendingCode.code !== code)
            throw new Error("Código incorrecto. Inténtalo de nuevo.");

        return { success: true };
    },

    changePassword: async (email, code, newPassword) => {
        await AuthAPI.verifyCode(email, code);
        // Aquí conectarías con tu backend para guardar la nueva contraseña
        pendingCode = null;
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