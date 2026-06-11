import { post, get, put } from "../../shared/utils/httpClient";

/**
 * authService: métodos para autenticación usando httpClient
 */
export const authService = {
  // login acepta dos formas: (correo, password) o ({ username, password })
  login: async (correoOrPayload, password) => {
    try {
      let correo = correoOrPayload;
      // forma: handleLogin pasa un objeto { username, password }
      if (correoOrPayload && typeof correoOrPayload === "object") {
        correo = correoOrPayload.username || correoOrPayload.correo || correoOrPayload.email;
        password = correoOrPayload.password;
      }

      const res = await post("/auth/login", { correo, password }, { skipAuth: true });
      const payload = res?.data ?? res;
      const token = payload?.token ?? payload?.data?.token ?? null;
      const user = payload?.user ?? payload?.data?.user ?? payload ?? null;

      if (token) {
        // El objeto `user` de BD no incluye rolNombre; viene dentro del JWT.
        // Lo leemos decodificando el payload (sin verificar firma, solo claims).
        let rolNombreFromToken = null;
        try {
          const claims = JSON.parse(atob(token.split(".")[1]));
          rolNombreFromToken = claims?.rolNombre ?? null;
        } catch { /* token malformado — ignorar */ }

        const session = {
          id: user?.id ?? user?._id,
          nombre: user?.nombreCompleto ?? user?.nombre ?? user?.name,
          correo: user?.correo,
          rolId: user?.rolId ?? user?.rol_id ?? user?.role ?? null,
          rolNombre: user?.rolNombre ?? rolNombreFromToken ?? null,
          sedeId: user?.sedeId ?? user?.sede_id ?? null,
          token,
        };
        localStorage.setItem("session_user", JSON.stringify(session));
      } else if (user) {
        localStorage.setItem(
          "session_user",
          JSON.stringify({ id: user?.id ?? user?._id, nombre: user?.nombreCompleto ?? user?.nombre, correo: user?.correo, token: null })
        );
      }

      return { token, user };
    } catch (err) {
      throw err?.data || err;
    }
  },

  logout: () => {
    localStorage.removeItem("session_user");
    sessionStorage.removeItem("session_user");
  },

  // kept for compatibility with older code
  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem("session_user") || sessionStorage.getItem("session_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // compat shim: getSession alias (some modules call AuthAPI.getSession())
  getSession: () => {
    return authService.getCurrentUser();
  },

  getProfile: async () => {
    try {
      const res = await get("/auth/profile");
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await put("/auth/profile", data);
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  // FIX: UserForm llama AuthAPI.prepareWelcome() para generar la contraseña temporal.
  // La API expone POST /auth/prepare-welcome y devuelve { password }.
  prepareWelcome: async (email) => {
    try {
      const res = await post("/auth/prepare-welcome", { email }, { skipAuth: false });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  // FIX: UserForm llama AuthAPI.sendWelcomeEmail() tras crear el usuario.
  // La API maneja el envío del correo directamente en CreateUser (use-case),
  // por lo que este método es un no-op seguro para no romper el flujo del form.
  // Si en el futuro la API expone un endpoint dedicado, reemplazar aquí.
  sendWelcomeEmail: async ({ email, nombreCompleto, password }) => {
    // El backend ya envía el correo en POST /users (CreateUser use-case).
    // No se necesita un segundo llamado — retornamos éxito silenciosamente.
    return { sent: true };
  },

  // Guarda la nueva contraseña personal del usuario (primer login con contraseña temporal)
  savePersonalPassword: async (userId, newPassword) => {
    try {
      const res = await put("/auth/change-password", { newPassword });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  sendRecoveryCode: async (correo) => {
    try {
      const res = await post("/auth/forgot-password", { correo }, { skipAuth: true });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  verifyCode: async (correo, code) => {
    try {
      // FIX: la API espera el campo "codigo", no "code"
      const res = await post("/auth/verify-code", { correo, codigo: code }, { skipAuth: true });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  // FIX: la API espera { resetToken, password, confirmarPassword }
  // resetToken lo devuelve verifyCode y lo guarda useAuth en verifiedCode
  changePassword: async (resetToken, newPassword) => {
    try {
      const res = await post("/auth/reset-password", {
        resetToken,
        password: newPassword,
        confirmarPassword: newPassword,
      }, { skipAuth: true });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },

  // Valida la contraseña del usuario autenticado para acciones sensibles.
  verifyPassword: async (password) => {
    try {
      const res = await post("/auth/verify-password", { password });
      return res?.data ?? res;
    } catch (err) {
      throw err?.data || err;
    }
  },
};

// Exportar también con el nombre esperado por muchos módulos: AuthAPI
export const AuthAPI = authService;

export default authService;