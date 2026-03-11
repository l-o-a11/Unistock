import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EVENT_TYPES = {
  inicio:  { label: "Inicio de producción", color: "#1d4ed8", bg: "#dbeafe" },
  calidad: { label: "Control de calidad",   color: "#d97706", bg: "#fef3c7" },
  entrega: { label: "Fecha de entrega",      color: "#16a34a", bg: "#dcfce7" },
};

// Eventos semilla — incluyen orderId para navegar al detalle
const INITIAL_EVENTS = [
  { id: 1, date: "2025-12-16", type: "inicio",  title: "Inicio producción #21", orderId: 1 },
  { id: 2, date: "2025-12-23", type: "calidad", title: "Control calidad #21",   orderId: 1 },
  { id: 3, date: "2025-12-30", type: "entrega", title: "Entrega orden #22",      orderId: 2 },
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS   = ["LU","MA","MI","JU","VI","SÁ","DO"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { return (new Date(y, m, 1).getDay() + 6) % 7; }
function pad(n)               { return String(n).padStart(2, "0"); }
function toStr(y, m, d)       { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function isToday(y, m, d)     { const t = new Date(); return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d; }

export default function ProduccionCalendario({ onClose, productions = [] }) {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); });
  const [viewMode,    setViewMode]    = useState("mensual");
  const [events,      setEvents]      = useState(INITIAL_EVENTS);
  const [filterType,  setFilterType]  = useState("Todos");
  const [search,      setSearch]      = useState("");
  const [addModal,    setAddModal]    = useState({ open: false, day: null });
  const [detailModal, setDetailModal] = useState({ open: false, event: null });
  const [newEvent,    setNewEvent]    = useState({ type: "inicio", title: "", orderId: "" });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const eventsForDay = (d) => {
    const ds = toStr(year, month, d);
    return events.filter(e => {
      if (e.date !== ds) return false;
      if (filterType !== "Todos" && e.type !== filterType) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setEvents(prev => [...prev, {
      id: Date.now(),
      date: toStr(year, month, addModal.day),
      type: newEvent.type,
      title: newEvent.title,
      orderId: newEvent.orderId ? Number(newEvent.orderId) : null,
    }]);
    setNewEvent({ type: "inicio", title: "", orderId: "" });
    setAddModal({ open: false, day: null });
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setDetailModal({ open: false, event: null });
  };

  // Navegar al detalle de la orden asociada
  const goToOrder = (orderId) => {
    if (!orderId) return;
    setDetailModal({ open: false, event: null });
    if (onClose) onClose();
    navigate(`/layout/produccion/detalle/${orderId}`);
  };

  // Cuadrícula mensual
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Semana actual
  const todayObj   = new Date();
  const startOfWeek = todayObj.getDate() - ((todayObj.getDay() + 6) % 7);
  const weekDays    = Array.from({ length: 7 }, (_, i) => {
    const d = startOfWeek + i;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  const upcomingEvents = [...events]
    .filter(e => filterType === "Todos" || e.type === filterType)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 7);

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: "#f8f9fb", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Toolbar ── */}
      <div style={{ background: "#fff", padding: "12px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#FF4FD6,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>Calendario de Producción</h2>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{events.length} evento{events.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Buscador */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              style={{ paddingLeft: 24, paddingRight: 8, paddingTop: 6, paddingBottom: 6, border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", width: 140 }} />
          </div>

          {/* Filtro tipo */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none" }}>
            <option value="Todos">Todos</option>
            {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          {/* Vista toggle */}
          <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 7, overflow: "hidden" }}>
            {["mensual", "semanal"].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ padding: "6px 11px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                  background: viewMode === v ? "#FF4FD6" : "#fff", color: viewMode === v ? "#fff" : "#6b7280" }}>
                {v === "mensual" ? "Mes" : "Semana"}
              </button>
            ))}
          </div>

          {/* Cerrar */}
          <button onClick={onClose || (() => navigate("/layout/produccion"))}
            style={{ padding: "6px 13px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, fontWeight: 600, background: "#fff", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cerrar
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Calendario */}
        <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>

          {/* Nav mes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
                {MONTHS[month]} <span style={{ color: "#9ca3af", fontWeight: 400 }}>{year}</span>
              </h3>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
            <button onClick={() => setCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid #FF4FD6", background: "#fff0fb", color: "#FF4FD6", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Hoy
            </button>
          </div>

          {/* Cabeceras días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderTop: "1px solid #f0f0f0", borderLeft: "1px solid #f0f0f0" }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", padding: "7px 0", fontSize: 11, fontWeight: 700, color: "#9ca3af", borderRight: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>{d}</div>
            ))}
          </div>

          {/* Vista mensual */}
          {viewMode === "mensual" && (
            <div style={{ borderLeft: "1px solid #f0f0f0" }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                  {week.map((day, di) => {
                    const dayEvs  = day ? eventsForDay(day) : [];
                    const todayD  = day && isToday(year, month, day);
                    return (
                      <div key={di}
                        onClick={() => day && setAddModal({ open: true, day })}
                        onMouseEnter={(e) => { if (day) e.currentTarget.style.background = "#fdf4ff"; }}
                        onMouseLeave={(e) => { if (day) e.currentTarget.style.background = "#fff"; }}
                        style={{ minHeight: 70, padding: "4px 4px", cursor: day ? "pointer" : "default",
                          background: day ? "#fff" : "#f9fafb",
                          borderBottom: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0" }}>
                        {day && (
                          <>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 20, height: 20, borderRadius: "50%",
                              background: todayD ? "#FF4FD6" : "transparent",
                              color: todayD ? "#fff" : "#374151",
                              fontSize: 11, fontWeight: todayD ? 800 : 500 }}>{day}</span>
                            <div style={{ marginTop: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                              {dayEvs.slice(0, 2).map(ev => (
                                <div key={ev.id}
                                  onClick={(e) => { e.stopPropagation(); setDetailModal({ open: true, event: ev }); }}
                                  title={ev.orderId ? `Ir a orden #${ev.orderId}` : ev.title}
                                  style={{
                                    background: EVENT_TYPES[ev.type]?.bg, color: EVENT_TYPES[ev.type]?.color,
                                    fontSize: 10, fontWeight: 600, padding: "2px 4px", borderRadius: 4,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    borderLeft: ev.orderId ? `2px solid ${EVENT_TYPES[ev.type]?.color}` : "none",
                                  }}>
                                  {ev.orderId && <span style={{ marginRight: 3, opacity: 0.7 }}>🔗</span>}
                                  {ev.title}
                                </div>
                              ))}
                              {dayEvs.length > 2 && (
                                <span style={{ fontSize: 9, color: "#FF4FD6", fontWeight: 700, paddingLeft: 2 }}>+{dayEvs.length - 2} más</span>
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
            <div style={{ borderLeft: "1px solid #f0f0f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {weekDays.map((day, di) => {
                  const dayEvs = day ? eventsForDay(day) : [];
                  const todayD = day && isToday(year, month, day);
                  return (
                    <div key={di}
                      onClick={() => day && setAddModal({ open: true, day })}
                      onMouseEnter={(e) => { if (day) e.currentTarget.style.background = "#fdf4ff"; }}
                      onMouseLeave={(e) => { if (day) e.currentTarget.style.background = "#fff"; }}
                      style={{ minHeight: 160, padding: "6px 5px", cursor: day ? "pointer" : "default",
                        background: day ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0" }}>
                      {day && (
                        <>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 24, height: 24, borderRadius: "50%",
                            background: todayD ? "#FF4FD6" : "transparent",
                            color: todayD ? "#fff" : "#374151",
                            fontSize: 12, fontWeight: todayD ? 800 : 600, marginBottom: 5 }}>{day}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {dayEvs.map(ev => (
                              <div key={ev.id}
                                onClick={(e) => { e.stopPropagation(); setDetailModal({ open: true, event: ev }); }}
                                style={{ background: EVENT_TYPES[ev.type]?.bg, color: EVENT_TYPES[ev.type]?.color,
                                  fontSize: 10, fontWeight: 600, padding: "3px 5px", borderRadius: 4, cursor: "pointer",
                                  borderLeft: ev.orderId ? `2px solid ${EVENT_TYPES[ev.type]?.color}` : "none" }}>
                                {ev.orderId && <span style={{ marginRight: 3, opacity: 0.7 }}>🔗</span>}
                                {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 200, background: "#fff", borderLeft: "1px solid #f0f0f0", padding: 12, display: "flex", flexDirection: "column", gap: 14, flexShrink: 0, overflowY: "auto" }}>

          {/* Leyenda */}
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tipos</p>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setFilterType(filterType === k ? "Todos" : k)}
                style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "6px 8px", borderRadius: 7,
                  border: filterType === k ? `1.5px solid ${v.color}` : "1px solid #f0f0f0",
                  background: v.bg, cursor: "pointer", textAlign: "left", marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: v.color, lineHeight: 1.3 }}>{v.label}</span>
              </button>
            ))}
          </div>

          {/* Próximos eventos */}
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Próximos</p>
            {upcomingEvents.length === 0
              ? <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>Sin eventos</p>
              : upcomingEvents.map(ev => (
                <div key={ev.id}
                  onClick={() => setDetailModal({ open: true, event: ev })}
                  style={{ padding: "6px 8px", borderRadius: 7, background: EVENT_TYPES[ev.type]?.bg,
                    cursor: "pointer", marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: EVENT_TYPES[ev.type]?.color,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.orderId && "🔗 "}{ev.title}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#9ca3af" }}>{ev.date}</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── Modal agregar evento ── */}
      {addModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}
          onClick={() => setAddModal({ open: false, day: null })}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 22, width: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Agregar evento</h3>
            <p style={{ margin: "0 0 14px", fontSize: 11, color: "#9ca3af" }}>{MONTHS[month]} {addModal.day}, {year}</p>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Tipo</label>
              <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, outline: "none" }}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Título *</label>
              <input type="text" value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
                placeholder="Ej: Inicio producción orden 23"
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>
                Vincular a orden (ID)
                <span style={{ fontWeight: 400, color: "#aaa", marginLeft: 5 }}>opcional</span>
              </label>
              <input type="number" value={newEvent.orderId}
                onChange={(e) => setNewEvent({ ...newEvent, orderId: e.target.value })}
                placeholder="Ej: 1, 2, 21..."
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af" }}>Si vinculas una orden, el evento mostrará un enlace directo a su detalle.</p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAddModal({ open: false, day: null })}
                style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={addEvent}
                style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#FF4FD6", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal detalle evento ── */}
      {detailModal.open && detailModal.event && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}
          onClick={() => setDetailModal({ open: false, event: null })}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 22, width: 300, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}>

            <div style={{ width: 38, height: 38, borderRadius: 9, background: EVENT_TYPES[detailModal.event.type]?.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>📅</span>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>{detailModal.event.title}</h3>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280" }}>
              <strong>Tipo:</strong> {EVENT_TYPES[detailModal.event.type]?.label}
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
              <strong>Fecha:</strong> {detailModal.event.date}
            </p>

            {/* Botón "Ver orden" si hay orderId */}
            {detailModal.event.orderId && (
              <button
                onClick={() => goToOrder(detailModal.event.orderId)}
                style={{ width: "100%", marginBottom: 10, padding: "9px 0", borderRadius: 9, border: "none",
                  background: "linear-gradient(135deg,#FF4FD6,#c026d3)", color: "#fff",
                  cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h6v6M10 14L21 3"/><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
                Ver orden #{detailModal.event.orderId}
              </button>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDetailModal({ open: false, event: null })}
                style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                Cerrar
              </button>
              <button onClick={() => deleteEvent(detailModal.event.id)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
