import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_nokqz2k";
const EMAILJS_TEMPLATE_ID = "template_rgm176v";
const EMAILJS_PUBLIC_KEY = "5IVlWdQ53cSfiS0i_";

// Código temporal en memoria (expira en 10 minutos)
let pendingCode = null; // { email, code, expiresAt }

const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const AuthAPI = {

    login: async ({ username, password }) => {
        if (!username || !password) throw new Error("Credenciales incorrectas");
        return { token: "mock-token", user: { username } };
    },

    sendRecoveryCode: async (email) => {
        const code = generateCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

        pendingCode = { email, code, expiresAt };

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                email,  // {{email}} en tu plantilla → destinatario
                code,   // {{code}} en tu plantilla → el código
            },
            EMAILJS_PUBLIC_KEY
        );

        return { success: true };
    },

    verifyCode: async (email, code) => {
        if (!pendingCode)
            throw new Error("No hay código pendiente. Solicita uno nuevo.");

        if (pendingCode.email !== email)
            throw new Error("El correo no coincide.");

        if (Date.now() > pendingCode.expiresAt) {
            pendingCode = null;
            throw new Error("El código expiró. Solicita uno nuevo.");
        }

        if (pendingCode.code !== code)
            throw new Error("Código incorrecto.");

        return { success: true };
    },

    changePassword: async (email, code, newPassword) => {
        await AuthAPI.verifyCode(email, code);
        // Aquí conectas con tu backend para guardar la nueva contraseña
        pendingCode = null;
        return { success: true };
    },
};