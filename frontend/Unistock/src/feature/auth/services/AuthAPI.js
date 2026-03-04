// Simulación de llamadas a la API de autenticación
// Reemplaza las URLs con las de tu backend real

const BASE_URL = '/api/auth';

export const AuthAPI = {
    login: async ({ username, password }) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) throw new Error('Credenciales incorrectas');
        return response.json();
    },

    sendRecoveryCode: async (email) => {
        const response = await fetch(`${BASE_URL}/recover-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error('No se pudo enviar el código');
        return response.json();
    },

    verifyCode: async (email, code) => {
        const response = await fetch(`${BASE_URL}/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });
        if (!response.ok) throw new Error('Código incorrecto');
        return response.json();
    },

    changePassword: async (email, code, newPassword) => {
        const response = await fetch(`${BASE_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
        });
        if (!response.ok) throw new Error('No se pudo cambiar la contraseña');
        return response.json();
    },
};