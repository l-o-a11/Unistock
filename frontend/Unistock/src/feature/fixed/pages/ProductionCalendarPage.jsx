/**
 * @file pages/ProductionCalendarPage.jsx
 * @description Página independiente del Calendario de Producción.
 *
 * Diseño idéntico al detalle de producción:
 *   - bg-white rounded-2xl shadow para cada sección
 *   - Badges de estado/tipo igual al stepper
 *   - Grid de info igual a "Información general"
 *   - Historial de eventos igual al historial de la orden
 *   - Al hacer clic en un evento → card de detalle con la misma estructura
 *
 * Google Calendar: vinculación directa via OAuth 2.0 (sin .ics)
 * Búsqueda: por orden, proceso o fecha con selector de modo
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CALENDAR CONFIG
// Agrega tu Client ID en .env: VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
// ─────────────────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "";
const GCAL_SCOPES      = "https://www.googleapis.com/auth/calendar.events";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const EVENT_TYPES = {
  inicio:  { label: "Inicio de producción", color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", dot: "#ec4899",  gcalColor: "1"  },
  calidad: { label: "Control de calidad",   color: "#d97706", bg: "#fffbeb", border: "#fcd34d", dot: "#d97706",  gcalColor: "5"  },
  entrega: { label: "Fecha de entrega",      color: "#16a34a", bg: "#f0fdf4", border: "#86efac", dot: "#16a34a",  gcalColor: "10" },
  diseno:  { label: "Diseño",               color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd", dot: "#7c3aed",  gcalColor: "3"  },
  corte:   { label: "Corte",                color: "#0891b2", bg: "#ecfeff", border: "#67e8f9", dot: "#0891b2",  gcalColor: "7"  },
};

const INITIAL_EVENTS = [
  { id: 1,  date: "2026-03-14", type: "diseno",  title: "Diseño orden #23",       orderId: 3, notes: "Revisión inicial con diseñador" },
  { id: 2,  date: "2026-03-16", type: "inicio",  title: "Inicio producción #21",  orderId: 1, notes: "Revisión con el equipo de producción" },
  { id: 3,  date: "2026-03-18", type: "corte",   title: "Corte tela orden #21",   orderId: 1, notes: "" },
  { id: 4,  date: "2026-03-23", type: "calidad", title: "Control calidad #21",    orderId: 1, notes: "" },
  { id: 5,  date: "2026-03-30", type: "entrega", title: "Entrega orden #22",       orderId: 2, notes: "Cliente: Sorelly Santana" },
  { id: 6,  date: "2026-04-05", type: "inicio",  title: "Inicio producción #24",  orderId: 4, notes: "" },
  { id: 7,  date: "2026-04-10", type: "calidad", title: "Control calidad #23",    orderId: 3, notes: "" },
];

const MONTHS     = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_SHORT = ["LU","MA","MI","JU","VI","SÁ","DO"];
const DAYS_FULL  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;
const pad            = (n)    => String(n).padStart(2, "0");
const toStr          = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const isToday        = (y, m, d) => {
  const t = new Date();
  return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
};
const formatDateES = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CALENDAR OAUTH
// ─────────────────────────────────────────────────────────────────────────────
const getGoogleToken = () =>
  new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("Configura VITE_GOOGLE_CLIENT_ID en tu .env para usar esta función."));
      return;
    }
    const params = new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      redirect_uri:  window.location.origin,
      response_type: "token",
      scope:         GCAL_SCOPES,
      prompt:        "select_account",
    });
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      "gcal-auth",
      "width=500,height=620,left=300,top=100"
    );
    if (!popup) { reject(new Error("Popup bloqueado. Permite popups para este sitio.")); return; }
    const interval = setInterval(() => {
      try {
        const url  = new URL(popup.location.href);
        const hash = new URLSearchParams(url.hash.slice(1));
        const token = hash.get("access_token");
        if (token) { clearInterval(interval); popup.close(); resolve(token); }
        if (hash.get("error")) { clearInterval(interval); popup.close(); reject(new Error(hash.get("error"))); }
      } catch { /* cross-origin, seguir esperando */ }
      if (popup.closed) { clearInterval(interval); reject(new Error("Popup cerrado sin autorizar")); }
    }, 300);
  });

const createGCalEvent = async (token, event) => {
  const body = {
    summary:     event.title,
    description: `Proceso: ${EVENT_TYPES[event.type]?.label || event.type}${event.orderId ? ` | Orden #${event.orderId}` : ""}${event.notes ? `\n${event.notes}` : ""}`,
    start: { date: event.date },
    end:   { date: event.date },
    colorId: EVENT_TYPES[event.type]?.gcalColor || "1",
  };
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`Error Google Calendar API: ${res.status}`);
  return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ProductionCalendarPage = () => {
  const navigate = useNavigate();

  // Calendario
  const [currentDate, setCurrentDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [viewMode,   setViewMode]   = useState("mensual");
  const [events,     setEvents]     = useState(INITIAL_EVENTS);
  const [filterType, setFilterType] = useState("Todos");
  const [search,     setSearch]     = useState("");
  const [searchMode, setSearchMode] = useState("todo");

  // Google Calendar
  const [gcalToken,     setGcalToken]     = useState(null);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalLoading,   setGcalLoading]   = useState(false);

  // UI
  const [addModal,       setAddModal]       = useState({ open: false, day: null });
  const [selectedEvent,  setSelectedEvent]  = useState(null);
  const [confirmDelete,  setConfirmDelete]  = useState(null);
  const [newEvent,       setNewEvent]       = useState({ type: "inicio", title: "", orderId: "", notes: "" });
  const [toast,          setToast]          = useState({ show: false, msg: "", type: "success" });
  const [gcalBtnLoading, setGcalBtnLoading] = useState(false);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Google Calendar ───────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 4000);
  };

  const connectGoogle = async () => {
    setGcalLoading(true);
    try {
      const token = await getGoogleToken();
      setGcalToken(token);
      setGcalConnected(true);
      showToast("Google Calendar conectado correctamente", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setGcalLoading(false);
    }
  };

  const pushToGcal = async (event) => {
    if (!gcalToken) { showToast("Primero conecta Google Calendar", "warning"); return; }
    setGcalBtnLoading(true);
    try {
      await createGCalEvent(gcalToken, event);
      showToast(`"${event.title}" agregado a Google Calendar ✓`, "success");
    } catch (err) {
      if (err.message.includes("401")) {
        setGcalToken(null); setGcalConnected(false);
        showToast("Sesión expirada. Reconecta Google Calendar.", "warning");
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setGcalBtnLoading(false);
    }
  };

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const matchesSearch = (ev) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    if (searchMode === "orden")   return String(ev.orderId || "").includes(q) || ev.title.toLowerCase().includes(`#${q}`);
    if (searchMode === "proceso") return (EVENT_TYPES[ev.type]?.label?.toLowerCase() || "").includes(q) || ev.type.toLowerCase().includes(q);
    if (searchMode === "fecha")   return ev.date.includes(q);
    return ev.title.toLowerCase().includes(q) || String(ev.orderId || "").includes(q) ||
           (EVENT_TYPES[ev.type]?.label?.toLowerCase() || "").includes(q) || ev.date.includes(q);
  };

  const eventsForDay = (day) =>
    events.filter(e =>
      e.date === toStr(year, month, day) &&
      (filterType === "Todos" || e.type === filterType) &&
      matchesSearch(e)
    );

  const filteredEvents = events.filter(e =>
    (filterType === "Todos" || e.type === filterType) && matchesSearch(e)
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    const ev = {
      id: Date.now(),
      date: toStr(year, month, addModal.day),
      type: newEvent.type,
      title: newEvent.title,
      orderId: newEvent.orderId ? Number(newEvent.orderId) : null,
      notes: newEvent.notes,
    };
    setEvents(prev => [...prev, ev]);
    setNewEvent({ type: "inicio", title: "", orderId: "", notes: "" });
    setAddModal({ open: false, day: null });
    if (gcalConnected) pushToGcal(ev);
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
    setConfirmDelete(null);
  };

  // ── Cuadrícula ────────────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const todayObj    = new Date();
  const startOfWeek = todayObj.getDate() - ((todayObj.getDay() + 6) % 7);
  const weekDays    = Array.from({ length: 7 }, (_, i) => {
    const d = startOfWeek + i;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  const upcomingEvents = [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);

  // ─────────────────────────────────────────────────────────────────────────
  // SUB-COMPONENTES
  // ─────────────────────────────────────────────────────────────────────────

  /* Chip de tipo — igual al badge de estado del detalle de producción */
  const TypeBadge = ({ type, size = "sm" }) => {
    const t = EVENT_TYPES[type] || EVENT_TYPES.inicio;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: size === "lg" ? "5px 14px" : "3px 10px",
        borderRadius: 20,
        background: t.bg, color: t.color, border: `1px solid ${t.border}`,
        fontSize: size === "lg" ? 12 : 10, fontWeight: 700,
        whiteSpace: "nowrap",
      }}>
        <span style={{ width: size === "lg" ? 7 : 6, height: size === "lg" ? 7 : 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
        {t.label}
      </span>
    );
  };

  /* Card de detalle de evento — misma estructura que el detalle de producción */
  const EventDetailCard = ({ event, onClose }) => {
    const t = EVENT_TYPES[event.type] || EVENT_TYPES.inicio;
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        onClick={onClose}
      >
        <div
          style={{ background: "#f6f6f8", borderRadius: 20, width: "100%", maxWidth: 540, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", overflow: "hidden", fontFamily: "sans-serif" }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header — igual al detalle de producción ── */}
          <div style={{ background: "#fff", padding: "18px 22px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `linear-gradient(135deg,${t.dot},${t.color}bb)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 14px ${t.dot}44`, flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>{event.title}</h2>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                    {formatDateES(event.date)}{event.orderId ? ` · Orden #${event.orderId}` : ""}
                  </p>
                </div>
              </div>
              <TypeBadge type={event.type} size="lg" />
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Info general — idéntico al grid de detalle de producción */}
            <div className="bg-white rounded-2xl p-4 shadow">
              <h3 className="font-semibold mb-3 text-sm text-gray-700">Información del evento</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Fecha",    formatDateES(event.date)],
                  ["Proceso",  EVENT_TYPES[event.type]?.label || "—"],
                  ["Orden",    event.orderId ? `#${event.orderId}` : "—"],
                  ["ID evento", `EVT-${event.id}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide block">{label}</span>
                    <span className="text-gray-700 font-medium">{value || "—"}</span>
                  </div>
                ))}
                {event.notes && (
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide block">Notas</span>
                    <span className="text-gray-700 font-medium">{event.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción principales */}
            <div style={{ display: "flex", gap: 8 }}>
              {gcalConnected ? (
                <button
                  onClick={() => pushToGcal(event)}
                  disabled={gcalBtnLoading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md"
                  style={{
                    background: gcalBtnLoading ? "#e5e7eb" : "linear-gradient(135deg,#4285F4,#1a73e8)",
                    color: gcalBtnLoading ? "#9ca3af" : "#fff",
                    border: "none", cursor: gcalBtnLoading ? "not-allowed" : "pointer",
                    boxShadow: gcalBtnLoading ? "none" : "0 4px 12px rgba(66,133,244,0.35)",
                  }}
                >
                  {gcalBtnLoading
                    ? <><SpinnerIcon color="#9ca3af" /> Agregando...</>
                    : <><GCalIcon color="#fff" /> Agregar a Google Calendar</>
                  }
                </button>
              ) : (
                <button
                  onClick={async () => { onClose(); await connectGoogle(); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm border transition flex items-center justify-center gap-2"
                  style={{ borderColor: "#4285F4", background: "#fff", color: "#4285F4", cursor: "pointer" }}
                >
                  <GCalIcon color="#4285F4" /> Conectar Google Calendar
                </button>
              )}

              {event.orderId && (
                <button
                  onClick={() => { onClose(); navigate(`/layout/produccion/detalle/${event.orderId}`); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#ec4899,#d946ef)", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(236,72,153,0.3)" }}
                >
                  Ver orden #{event.orderId} →
                </button>
              )}
            </div>

            {/* Botones secundarios */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 font-medium transition">
                Cerrar
              </button>
              <button onClick={() => { setConfirmDelete(event.id); onClose(); }}
                className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-sm text-red-500 hover:bg-red-100 font-medium transition flex items-center gap-2">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f8", padding: "24px 28px", fontFamily: "sans-serif" }}>

      {/* ── TOAST ── */}
      {toast.show && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: "#fff",
          border: `1.5px solid ${toast.type === "error" ? "#fecaca" : toast.type === "warning" ? "#fde68a" : "#bbf7d0"}`,
          borderRadius: 12, padding: "12px 18px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: 10, maxWidth: 380,
        }}>
          <span style={{ fontSize: 18 }}>{toast.type === "error" ? "❌" : toast.type === "warning" ? "⚠️" : "✅"}</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>{toast.msg}</p>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Eliminar evento</h3>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 font-medium transition">
                Cancelar
              </button>
              <button onClick={() => deleteEvent(confirmDelete)}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AGREGAR EVENTO ── */}
      {addModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setAddModal({ open: false, day: null })}>
          <div style={{ background: "#f6f6f8", borderRadius: 20, width: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.22)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: "#fff", padding: "18px 22px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Nuevo evento</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                {DAYS_FULL[getFirstDay(year, month)]} {addModal.day} de {MONTHS[month]}, {year}
              </p>
            </div>
            <div style={{ padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="bg-white rounded-2xl p-4 shadow">
                {[
                  { label: "Proceso / Tipo", field: "type",    type: "select" },
                  { label: "Título *",        field: "title",   placeholder: "Ej: Inicio producción orden 23" },
                  { label: "Orden (ID)",      field: "orderId", placeholder: "Ej: 21",  numeric: true },
                  { label: "Notas",           field: "notes",   placeholder: "Observaciones..." },
                ].map(({ label, field, type, placeholder, numeric }) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide block mb-1.5">{label}</span>
                    {type === "select" ? (
                      <select value={newEvent[field]}
                        onChange={e => setNewEvent({ ...newEvent, [field]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-pink-400">
                        {Object.entries(EVENT_TYPES).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" inputMode={numeric ? "numeric" : "text"}
                        value={newEvent[field]}
                        onChange={e => {
                          const v = e.target.value;
                          if (numeric && v !== "" && !/^\d+$/.test(v)) return;
                          setNewEvent({ ...newEvent, [field]: v });
                        }}
                        onKeyDown={e => e.key === "Enter" && field === "title" && addEvent()}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-pink-400"
                      />
                    )}
                  </div>
                ))}
              </div>
              {gcalConnected && (
                <div style={{ padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 11, color: "#1d4ed8", fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                  <GCalIcon color="#1d4ed8" size={13} /> El evento se agregará automáticamente a tu Google Calendar
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setAddModal({ open: false, day: null })}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 font-medium transition">
                  Cancelar
                </button>
                <button onClick={addEvent} disabled={!newEvent.title.trim()}
                  className="flex-2 px-6 py-2.5 rounded-xl font-bold text-sm transition"
                  style={{
                    flex: 2,
                    background: newEvent.title.trim() ? "linear-gradient(135deg,#ec4899,#d946ef)" : "#f3f4f6",
                    color: newEvent.title.trim() ? "#fff" : "#9ca3af",
                    border: "none", cursor: newEvent.title.trim() ? "pointer" : "not-allowed",
                    boxShadow: newEvent.title.trim() ? "0 4px 12px rgba(236,72,153,0.3)" : "none",
                  }}>
                  Agregar evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD DETALLE EVENTO ── */}
      {selectedEvent && <EventDetailCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* ══════════════════════════════════════════════════════
          PÁGINA PRINCIPAL
          ══════════════════════════════════════════════════ */}

      {/* Volver */}
      <button onClick={() => navigate("/layout/produccion")}
        className="mb-4 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 font-medium shadow-sm transition flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Volver a Producciones
      </button>

      {/* ── Header — idéntico al de detalle de producción ── */}
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Calendario de Producción</h2>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-200 text-pink-700">
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Google Calendar status / botón conectar */}
        {gcalConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 10, border: "1.5px solid #bbf7d0", background: "#f0fdf4" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>Google Calendar conectado</span>
            <button onClick={() => { setGcalToken(null); setGcalConnected(false); showToast("Desconectado de Google Calendar", "warning"); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontSize: 17, lineHeight: 1, padding: "0 0 0 4px", fontWeight: 700 }} title="Desconectar">
              ×
            </button>
          </div>
        ) : (
          <button onClick={connectGoogle} disabled={gcalLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition"
            style={{
              border: "1.5px solid #4285F4", background: "#fff", color: "#4285F4",
              cursor: gcalLoading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (!gcalLoading) e.currentTarget.style.background = "#EAF0FB"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          >
            {gcalLoading ? <SpinnerIcon color="#4285F4" /> : <GCalIcon color="#4285F4" />}
            {gcalLoading ? "Conectando..." : "Conectar Google Calendar"}
          </button>
        )}
      </div>

      {/* ── CONTROLES: búsqueda + filtros + vista ── */}
      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>

          {/* Búsqueda con modo */}
          <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            <select value={searchMode} onChange={e => setSearchMode(e.target.value)}
              className="border-none text-xs font-bold text-gray-600 outline-none cursor-pointer"
              style={{ padding: "8px 10px", borderRight: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <option value="todo">Todo</option>
              <option value="orden">Orden #</option>
              <option value="proceso">Proceso</option>
              <option value="fecha">Fecha</option>
            </select>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <svg style={{ position: "absolute", left: 10, pointerEvents: "none" }} width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={searchMode === "orden" ? "Ej: 21, 22..." : searchMode === "proceso" ? "Ej: corte, diseño..." : searchMode === "fecha" ? "2026-03..." : "Buscar eventos..."}
                className="border-none outline-none text-sm text-gray-700"
                style={{ paddingLeft: 32, paddingRight: search ? 28 : 12, paddingTop: 8, paddingBottom: 8, width: 200, background: "transparent" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 17, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>
          </div>

          {/* Chips de tipo — igual a los badges del detalle */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setFilterType("Todos")}
              style={{
                padding: "5px 12px", borderRadius: 20, border: "1px solid",
                borderColor: filterType === "Todos" ? "#ec4899" : "#e5e7eb",
                background: filterType === "Todos" ? "#fdf2f8" : "#fff",
                color: filterType === "Todos" ? "#ec4899" : "#9ca3af",
                fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              }}>
              Todos
            </button>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setFilterType(filterType === k ? "Todos" : k)}
                style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid",
                  borderColor: filterType === k ? v.color : "#e5e7eb",
                  background: filterType === k ? v.bg : "#fff",
                  color: filterType === k ? v.color : "#9ca3af",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: filterType === k ? v.color : "#d1d5db" }} />
                {v.label}
              </button>
            ))}
          </div>

          {/* Toggle Mes / Semana + Hoy */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              {["mensual", "semanal"].map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{
                    padding: "7px 16px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                    background: viewMode === v ? "#ec4899" : "#fff",
                    color: viewMode === v ? "#fff" : "#6b7280",
                    transition: "all 0.15s",
                  }}>
                  {v === "mensual" ? "Mes" : "Semana"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID: cuadrícula principal + sidebar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>

        {/* ── CUADRÍCULA DEL CALENDARIO ── */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* Navegación mes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-pink-400 transition cursor-pointer">
                <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937", minWidth: 220, textAlign: "center" }}>
                {MONTHS[month]} <span style={{ color: "#9ca3af", fontWeight: 400 }}>{year}</span>
              </h3>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-pink-400 transition cursor-pointer">
                <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date(todayObj.getFullYear(), todayObj.getMonth(), 1))}
              className="px-3 py-1 rounded-full border border-pink-300 bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition">
              Hoy
            </button>
          </div>

          {/* Encabezados días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #f0f0f0" }}>
            {DAYS_SHORT.map((d, i) => (
              <div key={d} className="text-center py-2.5"
                style={{ fontSize: 11, fontWeight: 700, color: i >= 5 ? "#ec4899" : "#9ca3af", background: "#fafafa" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Vista mensual */}
          {viewMode === "mensual" && (
            <div>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: wi < weeks.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  {week.map((day, di) => {
                    const dayEvs = day ? eventsForDay(day) : [];
                    const todayD = day && isToday(year, month, day);
                    const isWknd = di >= 5;
                    return (
                      <div key={di}
                        onClick={() => day && setAddModal({ open: true, day })}
                        style={{
                          minHeight: 90, padding: "6px 5px",
                          borderRight: di < 6 ? "1px solid #f0f0f0" : "none",
                          cursor: day ? "pointer" : "default",
                          background: day ? (todayD ? "#fff0fb" : isWknd ? "#fafbfd" : "#fff") : "#f9fafb",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => { if (day) e.currentTarget.style.background = "#fdf4ff"; }}
                        onMouseLeave={e => { if (day) e.currentTarget.style.background = todayD ? "#fff0fb" : isWknd ? "#fafbfd" : "#fff"; }}
                      >
                        {day && (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 26, height: 26, borderRadius: "50%",
                                background: todayD ? "#ec4899" : "transparent",
                                color: todayD ? "#fff" : isWknd ? "#ec4899" : "#374151",
                                fontSize: 12, fontWeight: todayD ? 800 : 500,
                              }}>{day}</span>
                              {dayEvs.length > 0 && (
                                <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>{dayEvs.length}</span>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              {dayEvs.slice(0, 2).map(ev => {
                                const t = EVENT_TYPES[ev.type];
                                return (
                                  <div key={ev.id}
                                    onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                                    style={{
                                      background: t.bg, color: t.color, fontSize: 10, fontWeight: 600,
                                      padding: "2px 6px", borderRadius: 6, borderLeft: `3px solid ${t.color}`,
                                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                      cursor: "pointer", transition: "filter 0.1s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.93)"}
                                    onMouseLeave={e => e.currentTarget.style.filter = "none"}
                                  >
                                    {ev.orderId && <span style={{ marginRight: 3, fontSize: 9 }}>🔗</span>}
                                    {ev.title}
                                  </div>
                                );
                              })}
                              {dayEvs.length > 2 && (
                                <span style={{ fontSize: 9, color: "#ec4899", fontWeight: 700, paddingLeft: 6 }}>
                                  +{dayEvs.length - 2} más
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Vista semanal */}
          {viewMode === "semanal" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
              {weekDays.map((day, di) => {
                const dayEvs = day ? eventsForDay(day) : [];
                const todayD = day && isToday(year, month, day);
                return (
                  <div key={di}
                    onClick={() => day && setAddModal({ open: true, day })}
                    style={{
                      minHeight: 280, padding: "10px 8px",
                      borderRight: di < 6 ? "1px solid #f0f0f0" : "none",
                      cursor: day ? "pointer" : "default",
                      background: todayD ? "#fff0fb" : "#fff",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { if (day) e.currentTarget.style.background = "#fdf4ff"; }}
                    onMouseLeave={e => { if (day) e.currentTarget.style.background = todayD ? "#fff0fb" : "#fff"; }}
                  >
                    {day && (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10, gap: 2 }}>
                          <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>{DAYS_SHORT[di]}</span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 32, height: 32, borderRadius: "50%",
                            background: todayD ? "#ec4899" : "transparent",
                            color: todayD ? "#fff" : "#374151",
                            fontSize: 15, fontWeight: todayD ? 800 : 600,
                          }}>{day}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {dayEvs.map(ev => {
                            const t = EVENT_TYPES[ev.type];
                            return (
                              <div key={ev.id}
                                onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                                style={{
                                  background: t.bg, color: t.color, fontSize: 10, fontWeight: 600,
                                  padding: "5px 7px", borderRadius: 8, borderLeft: `3px solid ${t.color}`,
                                  cursor: "pointer", transition: "filter 0.1s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.93)"}
                                onMouseLeave={e => e.currentTarget.style.filter = "none"}
                              >
                                {ev.orderId && <span style={{ marginRight: 3, fontSize: 9 }}>🔗</span>}
                                {ev.title}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Google Calendar card */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Google Calendar</h3>
            {gcalConnected ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                  <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>Conectado</span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>
                  Los nuevos eventos se agregarán automáticamente a tu Google Calendar.
                </p>
                <button onClick={() => { setGcalToken(null); setGcalConnected(false); }}
                  className="w-full py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition cursor-pointer">
                  Desconectar
                </button>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>
                  Conecta tu cuenta para agregar eventos directamente sin descargar archivos.
                </p>
                <button onClick={connectGoogle} disabled={gcalLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                  style={{
                    background: gcalLoading ? "#f3f4f6" : "#4285F4",
                    color: gcalLoading ? "#9ca3af" : "#fff",
                    border: "none", cursor: gcalLoading ? "not-allowed" : "pointer",
                  }}>
                  {gcalLoading ? <><SpinnerIcon color="#9ca3af" size={12}/> Conectando...</> : <><GCalIcon color="#fff" size={14}/> Conectar</>}
                </button>
                {!GOOGLE_CLIENT_ID && (
                  <p style={{ margin: "6px 0 0", fontSize: 9, color: "#f59e0b", lineHeight: 1.4, textAlign: "center" }}>
                    ⚠️ Agrega VITE_GOOGLE_CLIENT_ID en .env
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Próximos / Resultados — igual al historial de la orden */}
          <div className="bg-white rounded-2xl shadow p-4 overflow-auto" style={{ flex: 1 }}>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">
              {search ? `Resultados (${filteredEvents.length})` : "Próximos eventos"}
            </h3>
            {upcomingEvents.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>Sin eventos</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcomingEvents.map(ev => {
                  const t = EVENT_TYPES[ev.type];
                  return (
                    <div key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      style={{
                        padding: "9px 11px", borderRadius: 12, background: t.bg,
                        cursor: "pointer", border: `1px solid ${t.border}`,
                        transition: "filter 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.95)"}
                      onMouseLeave={e => e.currentTarget.style.filter = "none"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: t.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {ev.orderId && "🔗 "}{ev.title}
                        </p>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af" }}>{formatDateES(ev.date)}</p>
                      <div style={{ marginTop: 5 }}>
                        <TypeBadge type={ev.type} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Iconos pequeños ───────────────────────────────────────────────────────────
const GCalIcon = ({ color = "#4285F4", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="8"  y1="2" x2="8"  y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="3"  y1="10" x2="21" y2="10" stroke={color} strokeWidth="2"/>
    <text x="12" y="20" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold" fontFamily="Arial">G</text>
  </svg>
);

const SpinnerIcon = ({ color = "#fff", size = 14 }) => (
  <span style={{
    width: size, height: size, border: `2px solid ${color}33`,
    borderTopColor: color, borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite", flexShrink: 0,
  }} />
);

export default ProductionCalendarPage;
