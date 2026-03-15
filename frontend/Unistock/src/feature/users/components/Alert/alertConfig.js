// ─────────────────────────────────────────────────────────────
//  Alert/alertConfig.js
//  Configuración centralizada de tipos, colores e iconos.
//  Compartido por ToastAlert y ModalAlert.
// ─────────────────────────────────────────────────────────────

export const ALERT_CONFIG = {
  success:  { color: "#22c55e", icon: "✓" },
  error:    { color: "#ef4444", icon: "✕" },
  warning:  { color: "#f59e0b", icon: "⚠" },
  confirm:  { color: "#6366f1", icon: "?" },
  password: { color: "#E91E8C", icon: "🔒" },
};

export const TOAST_TYPES = ["success", "error", "warning"];

// Inyecta los keyframes una sola vez en el <head>
export const injectShrinkKeyframes = () => {
  if (document.getElementById("alert-shrink-keyframes")) return;
  const style = document.createElement("style");
  style.id = "alert-shrink-keyframes";
  style.innerHTML = `
    @keyframes shrink {
      from { width: 100%; }
      to   { width: 0%;   }
    }
  `;
  document.head.appendChild(style);
};
