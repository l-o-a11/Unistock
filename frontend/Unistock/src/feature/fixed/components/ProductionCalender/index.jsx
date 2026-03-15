/**
 * @file ProductionCalender/index.jsx
 * @description Calendario de producción — diseño igual al detalle de producción.
 *
 * - Misma estética: bg-white rounded-2xl shadow, badges pink, stepper, grids
 * - Vinculación directa con Google Calendar via OAuth 2.0 (sin descarga .ics)
 * - Búsqueda por orden, proceso y fecha
 * - Al hacer clic en un evento → card estilo "detalle de producción"
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG GOOGLE CALENDAR API
// Reemplaza GOOGLE_CLIENT_ID con tu OAuth 2.0 Client ID de Google Cloud Console
// ─────────────────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "";
const GCAL_SCOPES      = "https://www.googleapis.com/auth/calendar.events";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const EVENT_TYPES = {
  inicio:  { label: "Inicio de producción", color: "#ec4899", bg: "#fdf2f8",  border: "#f9a8d4", dot: "#ec4899" },
  calidad: { label: "Control de calidad",   color: "#d97706", bg: "#fffbeb",  border: "#fcd34d", dot: "#d97706" },
  entrega: { label: "Fecha de entrega",      color: "#16a34a", bg: "#f0fdf4",  border: "#86efac", dot: "#16a34a" },
  diseno:  { label: "Diseño",               color: "#7c3aed", bg: "#faf5ff",  border: "#c4b5fd", dot: "#7c3aed" },
  corte:   { label: "Corte",                color: "#0891b2", bg: "#ecfeff",  border: "#67e8f9", dot: "#0891b2" },
};

const STEPS_COLORS = {
  "Inicio de producción": "from-pink-400 to-fuchsia-500",
  "Control de calidad":   "from-amber-400 to-orange-500",
  "Fecha de entrega":     "from-emerald-400 to-green-500",
  "Diseño":               "from-violet-400 to-purple-500",
  "Corte":                "from-cyan-400 to-sky-500",
};

const INITIAL_EVENTS = [
  { id: 1, date: "2026-03-16", type: "inicio",  title: "Inicio producción #21", orderId: 1, notes: "Revisión inicial con el equipo de producción" },
  { id: 2, date: "2026-03-23", type: "calidad", title: "Control calidad #21",   orderId: 1, notes: "" },
  { id: 3, date: "2026-03-30", type: "entrega", title: "Entrega orden #22",      orderId: 2, notes: "Cliente: Sorelly Santana" },
  { id: 4, date: "2026-03-14", type: "diseno",  title: "Diseño orden #23",       orderId: 3, notes: "" },
  { id: 5, date: "2026-03-18", type: "corte",   title: "Corte tela orden #21",   orderId: 1, notes: "" },
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_FULL = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAYS_SHORT = ["LU","MA","MI","JU","VI","SÁ","DO"];

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
// GOOGLE CALENDAR OAUTH — vinculación directa
// ─────────────────────────────────────────────────────────────────────────────

/** Inicia el flujo OAuth de Google y devuelve el access_token */
const getGoogleToken = () =>
  new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("VITE_GOOGLE_CLIENT_ID no configurado. Agrega tu Client ID de Google Cloud Console."));
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
      "width=500,height=600,left=300,top=100"
    );
    if (!popup) { reject(new Error("Popup bloqueado. Permite popups para este sitio.")); return; }

    const interval = setInterval(() => {
      try {
        const url = new URL(popup.location.href);
        const hash = new URLSearchParams(url.hash.slice(1));
        const token = hash.get("access_token");
        if (token) {
          clearInterval(interval);
          popup.close();
          resolve(token);
        }
        if (hash.get("error")) {
          clearInterval(interval);
          popup.close();
          reject(new Error(hash.get("error")));
        }
      } catch {
        /* origen distinto — sigue esperando */
      }
      if (popup.closed) { clearInterval(interval); reject(new Error("Popup cerrado sin autorizar")); }
    }, 300);
  });

/** Crea un evento directamente en Google Calendar del usuario */
const createGCalEvent = async (token, event) => {
  const dateStr = event.date; // YYYY-MM-DD
  const body = {
    summary:     event.title,
    description: `Tipo: ${EVENT_TYPES[event.type]?.label || event.type}${event.orderId ? ` | Orden #${event.orderId}` : ""}${event.notes ? `\n${event.notes}` : ""}`,
    start: { date: dateStr },
    end:   { date: dateStr },
    colorId: event.type === "entrega" ? "10" : event.type === "calidad" ? "5" : "1",
  };
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`Error Google Calendar: ${res.status}`);
  return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ProduccionCalendario({ productions = [] }) {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [viewMode,      setViewMode]      = useState("mensual");
  const [events,        setEvents]        = useState(INITIAL_EVENTS);
  const [filterType,    setFilterType]    = useState("Todos");
  const [search,        setSearch]        = useState("");
  const [searchMode,    setSearchMode]    = useState("todo");

  // Estado de Google Calendar
  const [gcalToken,     setGcalToken]     = useState(null);
  const [gcalLoading,   setGcalLoading]   = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalToast,     setGcalToast]     = useState({ show: false, msg: "", type: "success" });

  // Modales
  const [addModal,      setAddModal]      = useState({ open: false, day: null });
  const [selectedEvent, setSelectedEvent] = useState(null); // card de detalle
  const [newEvent,      setNewEvent]      = useState({ type: "inicio", title: "", orderId: "", notes: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Conectar Google Calendar ─────────────────────────────────────────────
  const connectGoogleCalendar = async () => {
    setGcalLoading(true);
    try {
      const token = await getGoogleToken();
      setGcalToken(token);
      setGcalConnected(true);
      showToast("¡Google Calendar conectado! Ya puedes agregar eventos.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setGcalLoading(false);
    }
  };

  const addToGoogleCalendar = async (event) => {
    if (!gcalConnected || !gcalToken) {
      showToast("Primero conecta tu Google Calendar", "warning");
      return;
    }
    try {
      await createGCalEvent(gcalToken, event);
      showToast(`"${event.title}" agregado a Google Calendar ✓`, "success");
    } catch (err) {
      if (err.message.includes("401")) {
        setGcalToken(null);
        setGcalConnected(false);
        showToast("Sesión expirada. Vuelve a conectar Google Calendar.", "warning");
      } else {
        showToast(`Error: ${err.message}`, "error");
      }
    }
  };

  const showToast = (msg, type = "success") => {
    setGcalToast({ show: true, msg, type });
    setTimeout(() => setGcalToast({ show: false, msg: "", type: "success" }), 4000);
  };

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const matchesSearch = (ev) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    if (searchMode === "orden")   return String(ev.orderId || "").includes(q) || ev.title.toLowerCase().includes(`#${q}`);
    if (searchMode === "proceso") return (EVENT_TYPES[ev.type]?.label?.toLowerCase() || "").includes(q) || ev.type.toLowerCase().includes(q);
    if (searchMode === "fecha")   return ev.date.includes(q);
    return ev.title.toLowerCase().includes(q) || String(ev.orderId || "").includes(q) ||
           (EVENT_TYPES[ev.type]?.label?.toLowerCase() || "").includes(q) || ev.date.includes(q);
  };

  const eventsForDay = (day) => {
    const ds = toStr(year, month, day);
    return events.filter(e => e.date === ds && (filterType === "Todos" || e.type === filterType) && matchesSearch(e));
  };

  const filteredEvents = events.filter(e =>
    (filterType === "Todos" || e.type === filterType) && matchesSearch(e)
  );

  // ── CRUD eventos ─────────────────────────────────────────────────────────
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
    // Si está conectado a Google Calendar, ofrecer agregar
    if (gcalConnected) addToGoogleCalendar(ev);
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

  const upcomingEvents = [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  // ─────────────────────────────────────────────────────────────────────────
  // CARD DE DETALLE DE EVENTO — estilo ProductionDetailsPage
  // ─────────────────────────────────────────────────────────────────────────
  const EventDetailCard = ({ event, onClose }) => {
    const type = EVENT_TYPES[event.type] || EVENT_TYPES.inicio;
    const [addingToGcal, setAddingToGcal] = useState(false);

    const handleAddGcal = async () => {
      setAddingToGcal(true);
      await addToGoogleCalendar(event);
      setAddingToGcal(false);
    };

    return (
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        onClick={onClose}
      >
        <div
          style={{ background: "#f6f6f8", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 60px rgba(0,0,0,0.22)", overflow: "hidden", fontFamily: "sans-serif" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header — igual al detalle de producción */}
          <div style={{ background: "#fff", padding: "18px 22px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `linear-gradient(135deg, ${type.dot}, ${type.color}cc)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 12px ${type.dot}44`,
                }}>
                  <span style={{ fontSize: 18 }}>📅</span>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                    {event.title}
                  </h2>
                  {event.orderId && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
                      Vinculado a Orden #{event.orderId}
                    </p>
                  )}
                </div>
              </div>
              {/* Badge tipo — igual al badge de estado de producción */}
              <span style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: type.bg, color: type.color, border: `1px solid ${type.border}`,
                flexShrink: 0,
              }}>
                {type.label}
              </span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Info general — grid 2 col igual que en detalle */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Información del evento
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  ["Fecha",   formatDateES(event.date)],
                  ["Proceso", EVENT_TYPES[event.type]?.label || event.type],
                  ["Orden #", event.orderId ? `#${event.orderId}` : "—"],
                  ["ID",      `EVT-${event.id}`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{val}</span>
                  </div>
                ))}
              </div>
              {event.notes && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    Notas
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{event.notes}</p>
                </div>
              )}
            </div>

            {/* Barra de progreso del tipo — referencia visual al stepper */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tipo de proceso</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: type.color }}>{type.label}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <div key={k} style={{
                    flex: 1, height: 6, borderRadius: 6,
                    background: k === event.type ? v.color : "#f3f4f6",
                    transition: "background 0.2s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <span key={k} style={{ fontSize: 8, color: k === event.type ? v.color : "#d1d5db", fontWeight: k === event.type ? 700 : 400, flex: 1, textAlign: "center" }}>
                    {v.label.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 8 }}>
              {/* Google Calendar — vinculación directa */}
              {gcalConnected ? (
                <button
                  onClick={handleAddGcal}
                  disabled={addingToGcal}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                    background: addingToGcal ? "#e5e7eb" : "linear-gradient(135deg,#4285F4,#1a73e8)",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: addingToGcal ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: addingToGcal ? "none" : "0 4px 12px rgba(66,133,244,0.35)",
                    transition: "all 0.15s",
                  }}
                >
                  {addingToGcal ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 12, height: 12, border: "2px solid #fff3", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Agregando...
                    </span>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#fff" strokeWidth="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="#fff" strokeWidth="2"/>
                        <text x="12" y="19.5" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold" fontFamily="Arial">G</text>
                      </svg>
                      Agregar a Google Cal
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={async () => { onClose(); await connectGoogleCalendar(); }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12,
                    border: "1.5px solid #4285F4", background: "#fff",
                    color: "#4285F4", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#4285F4" strokeWidth="2"/>
                  </svg>
                  Conectar Google Cal
                </button>
              )}

              {event.orderId && (
                <button
                  onClick={() => { onClose(); navigate(`/layout/produccion/detalle/${event.orderId}`); }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#ec4899,#d946ef)",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(236,72,153,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  Ver orden #{event.orderId} →
                </button>
              )}
            </div>

            {/* Botones secundarios */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10,
                  border: "1px solid #e5e7eb", background: "#fff",
                  color: "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                Cerrar
              </button>
              <button onClick={() => setConfirmDelete(event.id)}
                style={{
                  padding: "9px 18px", borderRadius: 10,
                  border: "1px solid #fecaca", background: "#fef2f2",
                  color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
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
  // RENDER PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "sans-serif" }}>

      {/* ── TOAST ── */}
      {gcalToast.show && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: gcalToast.type === "error" ? "#fef2f2" : gcalToast.type === "warning" ? "#fffbeb" : "#fff",
          border: `1.5px solid ${gcalToast.type === "error" ? "#fecaca" : gcalToast.type === "warning" ? "#fde68a" : "#bbf7d0"}`,
          borderRadius: 12, padding: "12px 18px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: 10,
          maxWidth: 360,
        }}>
          <span style={{ fontSize: 18 }}>
            {gcalToast.type === "error" ? "❌" : gcalToast.type === "warning" ? "⚠️" : "✅"}
          </span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: gcalToast.type === "error" ? "#dc2626" : gcalToast.type === "warning" ? "#d97706" : "#16a34a" }}>
            {gcalToast.msg}
          </p>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Eliminar evento</h3>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => deleteEvent(confirmDelete)}
                style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AGREGAR EVENTO ── */}
      {addModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setAddModal({ open: false, day: null })}>
          <div style={{ background: "#f6f6f8", borderRadius: 20, width: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.22)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ background: "#fff", padding: "18px 22px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Nuevo evento</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                {DAYS_FULL[getFirstDay(year, month)] && ""}{addModal.day} de {MONTHS[month]}, {year}
              </p>
            </div>

            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {[
                  {
                    label: "Proceso / Tipo", field: "type", type: "select",
                    options: Object.entries(EVENT_TYPES).map(([k, v]) => ({ value: k, label: v.label }))
                  },
                  { label: "Título del evento *", field: "title", placeholder: "Ej: Inicio producción orden 23" },
                  { label: "Vincular a orden (ID)", field: "orderId", placeholder: "Ej: 21, 22...", numeric: true },
                  { label: "Notas", field: "notes", placeholder: "Observaciones adicionales..." },
                ].map(({ label, field, type, options, placeholder, numeric }) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                      {label}
                    </label>
                    {type === "select" ? (
                      <select value={newEvent[field]} onChange={e => setNewEvent({ ...newEvent, [field]: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff", color: "#1f2937" }}>
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text" inputMode={numeric ? "numeric" : "text"}
                        value={newEvent[field]}
                        onChange={e => {
                          const v = e.target.value;
                          if (numeric && v !== "" && !/^\d+$/.test(v)) return;
                          setNewEvent({ ...newEvent, [field]: v });
                        }}
                        onKeyDown={e => e.key === "Enter" && field === "title" && addEvent()}
                        placeholder={placeholder}
                        style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                        onFocus={e => (e.target.style.borderColor = "#ec4899")}
                        onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Aviso Google Calendar */}
              {gcalConnected && (
                <div style={{ padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 11, color: "#1d4ed8", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="#1d4ed8" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#1d4ed8" strokeWidth="2"/></svg>
                  El evento se agregará automáticamente a tu Google Calendar
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setAddModal({ open: false, day: null })}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={addEvent} disabled={!newEvent.title.trim()}
                  style={{
                    flex: 2, padding: "10px", borderRadius: 12, border: "none",
                    background: newEvent.title.trim() ? "linear-gradient(135deg,#ec4899,#d946ef)" : "#f3f4f6",
                    color: newEvent.title.trim() ? "#fff" : "#9ca3af",
                    fontSize: 13, fontWeight: 700, cursor: newEvent.title.trim() ? "pointer" : "not-allowed",
                    boxShadow: newEvent.title.trim() ? "0 4px 12px rgba(236,72,153,0.3)" : "none",
                    transition: "all 0.15s",
                  }}>
                  Agregar evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD DETALLE EVENTO ── */}
      {selectedEvent && (
        <EventDetailCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CUERPO PRINCIPAL DEL CALENDARIO
          ══════════════════════════════════════════════════════════════════════ */}

      {/* Header — igual al de detalle de producción */}
      <div className="bg-white rounded-2xl p-5 shadow mb-4">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* ── BOTÓN REGRESAR ── */}
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: "1.5px solid #e5e7eb", background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#ec4899";
                e.currentTarget.style.background = "#fdf2f8";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.background = "#fff";
              }}
              title="Regresar"
            >
              <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>

            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#FF4FD6,#c026d3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255,79,214,0.35)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1f2937" }}>Calendario de Producción</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
                {search ? ` · búsqueda: "${search}"` : ""}
              </p>
            </div>
          </div>

          {/* Controles lado derecho */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

            {/* Búsqueda */}
            <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <select value={searchMode} onChange={e => setSearchMode(e.target.value)}
                style={{ padding: "7px 8px", border: "none", borderRight: "1px solid #e5e7eb", fontSize: 11, outline: "none", background: "#f9fafb", color: "#374151", fontWeight: 700, cursor: "pointer" }}>
                <option value="todo">Todo</option>
                <option value="orden">Orden #</option>
                <option value="proceso">Proceso</option>
                <option value="fecha">Fecha</option>
              </select>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg style={{ position: "absolute", left: 9, pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={searchMode === "orden" ? "Ej: 21..." : searchMode === "proceso" ? "Ej: corte..." : searchMode === "fecha" ? "2026-03..." : "Buscar..."}
                  style={{ paddingLeft: 28, paddingRight: search ? 26 : 10, paddingTop: 7, paddingBottom: 7, border: "none", fontSize: 12, outline: "none", width: 155, background: "transparent" }}
                  onFocus={e => (e.target.parentElement.parentElement.style.borderColor = "#ec4899")}
                  onBlur={e => (e.target.parentElement.parentElement.style.borderColor = "#e5e7eb")}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 6, border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 17, lineHeight: 1, padding: 0 }}>×</button>
                )}
              </div>
            </div>

            {/* Toggle vista */}
            <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              {["mensual", "semanal"].map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{
                    padding: "7px 14px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                    background: viewMode === v ? "#ec4899" : "#fff",
                    color: viewMode === v ? "#fff" : "#6b7280",
                    transition: "all 0.15s",
                  }}>
                  {v === "mensual" ? "Mes" : "Semana"}
                </button>
              ))}
            </div>

            {/* Google Calendar botón */}
            {gcalConnected ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 10,
                border: "1.5px solid #bbf7d0", background: "#f0fdf4",
                color: "#16a34a", fontSize: 12, fontWeight: 700,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Google Calendar conectado
                <button onClick={() => { setGcalToken(null); setGcalConnected(false); }}
                  style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontSize: 15, lineHeight: 1, padding: 0, fontWeight: 700 }}
                  title="Desconectar">×</button>
              </div>
            ) : (
              <button onClick={connectGoogleCalendar} disabled={gcalLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 10,
                  border: "1.5px solid #4285F4", background: gcalLoading ? "#f9fafb" : "#fff",
                  color: "#4285F4", fontSize: 12, fontWeight: 700,
                  cursor: gcalLoading ? "not-allowed" : "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!gcalLoading) e.currentTarget.style.background = "#EAF0FB"; }}
                onMouseLeave={e => { e.currentTarget.style.background = gcalLoading ? "#f9fafb" : "#fff"; }}
              >
                {gcalLoading ? (
                  <span style={{ width: 14, height: 14, border: "2px solid #4285F433", borderTopColor: "#4285F4", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#4285F4" strokeWidth="2"/>
                    <text x="12" y="19.5" textAnchor="middle" fontSize="8" fill="#4285F4" fontWeight="bold" fontFamily="Arial">G</text>
                  </svg>
                )}
                {gcalLoading ? "Conectando..." : "Conectar Google Calendar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de mes — card blanca */}
      <div className="bg-white rounded-2xl px-5 py-3 shadow mb-4" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#ec4899"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
            <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937", minWidth: 200, textAlign: "center" }}>
            {MONTHS[month]} <span style={{ color: "#9ca3af", fontWeight: 400 }}>{year}</span>
          </h3>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#ec4899"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
            <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Chips de filtro tipo — como badges de estado */}
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setFilterType("Todos")}
              style={{
                padding: "4px 10px", borderRadius: 20, border: "1px solid",
                borderColor: filterType === "Todos" ? "#ec4899" : "#e5e7eb",
                background: filterType === "Todos" ? "#fdf2f8" : "#fff",
                color: filterType === "Todos" ? "#ec4899" : "#9ca3af",
                fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              }}>
              Todos
            </button>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <button key={k}
                onClick={() => setFilterType(filterType === k ? "Todos" : k)}
                style={{
                  padding: "4px 10px", borderRadius: 20, border: `1px solid`,
                  borderColor: filterType === k ? v.color : "#e5e7eb",
                  background: filterType === k ? v.bg : "#fff",
                  color: filterType === k ? v.color : "#9ca3af",
                  fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: filterType === k ? v.color : "#d1d5db" }} />
                {v.label.split(" ")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="px-3 py-1 rounded-full border border-pink-300 bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition">
            Hoy
          </button>
        </div>
      </div>

      {/* Grid de dos columnas: calendario + sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16 }}>

        {/* ── CUADRÍCULA DEL CALENDARIO ── */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* Encabezados días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #f0f0f0" }}>
            {DAYS_SHORT.map((d, i) => (
              <div key={d} style={{
                textAlign: "center", padding: "10px 0",
                fontSize: 11, fontWeight: 700,
                color: i >= 5 ? "#ec4899" : "#9ca3af",
                background: "#fafafa",
              }}>
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
                    const isWeekend = di >= 5;
                    return (
                      <div key={di}
                        onClick={() => day && setAddModal({ open: true, day })}
                        style={{
                          minHeight: 88, padding: "6px",
                          borderRight: di < 6 ? "1px solid #f0f0f0" : "none",
                          cursor: day ? "pointer" : "default",
                          background: day ? (todayD ? "#fff0fb" : isWeekend ? "#fafbfd" : "#fff") : "#f9fafb",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => { if (day) e.currentTarget.style.background = "#fdf4ff"; }}
                        onMouseLeave={e => { if (day) e.currentTarget.style.background = todayD ? "#fff0fb" : isWeekend ? "#fafbfd" : "#fff"; }}
                      >
                        {day && (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 24, height: 24, borderRadius: "50%",
                                background: todayD ? "#ec4899" : "transparent",
                                color: todayD ? "#fff" : isWeekend ? "#ec4899" : "#374151",
                                fontSize: 12, fontWeight: todayD ? 800 : 500,
                              }}>
                                {day}
                              </span>
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
                                      background: t.bg, color: t.color,
                                      fontSize: 10, fontWeight: 600,
                                      padding: "2px 6px", borderRadius: 6,
                                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                      cursor: "pointer",
                                      borderLeft: `3px solid ${t.color}`,
                                      transition: "filter 0.1s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.93)"}
                                    onMouseLeave={e => e.currentTarget.style.filter = "none"}
                                  >
                                    {ev.orderId && <span style={{ marginRight: 2, fontSize: 9 }}>🔗</span>}
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
                      minHeight: 260, padding: "10px 8px",
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
                        <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>
                            {DAYS_SHORT[di]}
                          </span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 30, height: 30, borderRadius: "50%",
                            background: todayD ? "#ec4899" : "transparent",
                            color: todayD ? "#fff" : "#374151",
                            fontSize: 15, fontWeight: todayD ? 800 : 600,
                          }}>
                            {day}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {dayEvs.map(ev => {
                            const t = EVENT_TYPES[ev.type];
                            return (
                              <div key={ev.id}
                                onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                                style={{
                                  background: t.bg, color: t.color,
                                  fontSize: 10, fontWeight: 600,
                                  padding: "5px 7px", borderRadius: 8,
                                  cursor: "pointer", borderLeft: `3px solid ${t.color}`,
                                  transition: "filter 0.1s",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Google Calendar status */}
          <div className="bg-white rounded-2xl shadow p-4">
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Google Calendar
            </p>
            {gcalConnected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Conectado</span>
              </div>
            ) : (
              <>
                <p style={{ margin: "0 0 8px", fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
                  Conecta para agregar eventos directamente a tu calendario.
                </p>
                <button onClick={connectGoogleCalendar} disabled={gcalLoading}
                  style={{
                    width: "100%", padding: "8px 0",
                    background: gcalLoading ? "#f3f4f6" : "#4285F4",
                    color: gcalLoading ? "#9ca3af" : "#fff",
                    border: "none", borderRadius: 9,
                    fontSize: 11, fontWeight: 700, cursor: gcalLoading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                  {gcalLoading
                    ? <><span style={{ width: 11, height: 11, border: "2px solid #9ca3af33", borderTopColor: "#9ca3af", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Conectando...</>
                    : <>Conectar con Google</>
                  }
                </button>
                {!GOOGLE_CLIENT_ID && (
                  <p style={{ margin: "6px 0 0", fontSize: 9, color: "#f59e0b", lineHeight: 1.4 }}>
                    ⚠️ Configura VITE_GOOGLE_CLIENT_ID en tu .env
                  </p>
                )}
              </>
            )}
          </div>

          {/* Próximos eventos */}
          <div className="bg-white rounded-2xl shadow p-4">
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {search ? "Resultados" : "Próximos"}
            </p>
            {upcomingEvents.length === 0
              ? <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>Sin eventos</p>
              : upcomingEvents.map(ev => {
                const t = EVENT_TYPES[ev.type];
                return (
                  <div key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      padding: "8px 10px", borderRadius: 10, background: t.bg,
                      cursor: "pointer", marginBottom: 6, border: `1px solid ${t.border}`,
                      transition: "filter 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.95)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "none"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: t.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {ev.orderId && "🔗 "}{ev.title}
                      </p>
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af" }}>{formatDateES(ev.date)}</p>
                    <span style={{ fontSize: 9, fontWeight: 700, color: t.color, background: "#fff", padding: "1px 6px", borderRadius: 10, border: `1px solid ${t.border}`, display: "inline-block", marginTop: 4 }}>
                      {t.label}
                    </span>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      {/* Spinner CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}