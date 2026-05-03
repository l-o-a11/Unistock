/**
 * @file pages/ProductionCalendarPage.jsx
 *
 * DEPENDENCIAS:
 *   npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
 *
 * CAMBIOS v2:
 *   - Buscador con filtros por orden y proceso
 *   - Click en fecha → muestra TODOS los eventos/órdenes de ese día
 *   - Botón "Agregar evento" separado en el header
 *   - Google Calendar sigue funcionando igual
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin     from '@fullcalendar/daygrid';
import timeGridPlugin    from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate }   from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';

const GOOGLE_CLIENT_ID   = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '';
const GCAL_SCOPES        = 'https://www.googleapis.com/auth/calendar.events';
const LS_EVENTS_KEY      = 'production_calendar_events';

const EVENT_TYPES = {
  creacion:   { label: 'Creación de orden',    color: '#6366f1', bg: '#eef2ff', border: '#a5b4fc', gcalColor: '9'  },
  diseno:     { label: 'Diseño / Ficha',        color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', gcalColor: '3'  },
  corte:      { label: 'Corte',                 color: '#0891b2', bg: '#ecfeff', border: '#67e8f9', gcalColor: '7'  },
  calidad:    { label: 'Compras / Calidad',     color: '#d97706', bg: '#fffbeb', border: '#fcd34d', gcalColor: '5'  },
  produccion: { label: 'En producción',         color: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4', gcalColor: '1'  },
  transporte: { label: 'Transporte / Recepción',color: '#0d9488', bg: '#f0fdfa', border: '#5eead4', gcalColor: '2'  },
  entrega:    { label: 'Fecha de entrega',       color: '#16a34a', bg: '#f0fdf4', border: '#86efac', gcalColor: '10' },
};

const getEventType = (type) => EVENT_TYPES[type] || EVENT_TYPES.creacion;

const pad          = (n)    => String(n).padStart(2, '0');
const formatDateES = (str)  => { if (!str) return '—'; const [y,m,d] = str.split('-'); return `${d}/${m}/${y}`; };
const ddmmyyyyToISO = (str) => {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const p = str.split('/');
  if (p.length === 3) return `${p[2]}-${pad(Number(p[1]))}-${pad(Number(p[0]))}`;
  return null;
};
const statusToEventType = (s = '') => {
  const l = s.toLowerCase();
  if (l.includes('diseño') || l.includes('ficha'))                             return 'diseno';
  if (l.includes('corte'))                                                      return 'corte';
  if (l.includes('compras'))                                                    return 'calidad';
  if (l.includes('producción') || l.includes('produccion') || l === 'inicio') return 'produccion';
  if (l.includes('recepción') || l.includes('recepcion') || l.includes('transporte')) return 'transporte';
  if (l.includes('entregado') || l.includes('entrega'))                        return 'entrega';
  if (l.includes('calidad'))                                                    return 'calidad';
  return 'creacion';
};

const toFCEvent = (ev) => {
  const t = getEventType(ev.type);
  return {
    id:              String(ev.id),
    title:           ev.title,
    date:            ev.date,
    backgroundColor: t.color,
    borderColor:     t.color,
    textColor:       '#fff',
    extendedProps:   { type: ev.type, orderId: ev.orderId, notes: ev.notes, rawId: ev.id },
  };
};

const loadManualEvents = () => {
  try { const raw = localStorage.getItem(LS_EVENTS_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
};
const saveManualEvents = (events) => {
  try { const manual = events.filter(e => !String(e.id).startsWith('auto-')); localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(manual)); }
  catch {}
};

const loadGIS = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.oauth2) { resolve(); return; }
  const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  if (existing) { existing.addEventListener('load', resolve); return; }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true; script.onload = resolve;
  script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
  document.head.appendChild(script);
});

const getGoogleTokenGIS = async () => {
  if (!GOOGLE_CLIENT_ID) throw new Error('Falta VITE_GOOGLE_CLIENT_ID en .env.');
  await loadGIS();
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: GCAL_SCOPES,
      callback: (r) => { if (r.error) reject(new Error(r.error_description || r.error)); else resolve(r.access_token); },
      error_callback: (err) => reject(new Error(err?.message || 'Error al conectar con Google')),
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const createGCalEvent = async (token, ev) => {
  const body = {
    summary: ev.title,
    description: `Proceso: ${getEventType(ev.type).label || ev.type}${ev.orderId ? ` | Orden #${ev.orderId}` : ''}${ev.notes ? `\n${ev.notes}` : ''}`,
    start: { date: ev.date }, end: { date: ev.date },
    colorId: getEventType(ev.type).gcalColor || '1',
  };
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events',
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Error Google Calendar API: ${res.status}`); }
  return res.json();
};

const FC_STYLES = `
  .fc { font-family: sans-serif; }
  .fc .fc-toolbar { padding: 12px 16px; background: #fff; border-bottom: 1px solid #f0f0f0; margin: 0 !important; }
  .fc .fc-toolbar-title { font-size: 16px !important; font-weight: 800 !important; color: #1f2937; }
  .fc .fc-button-primary { background: #fff !important; border: 1.5px solid #e5e7eb !important; color: #555 !important; border-radius: 8px !important; font-size: 12px !important; font-weight: 700 !important; padding: 6px 12px !important; box-shadow: none !important; transition: all 0.15s !important; }
  .fc .fc-button-primary:hover { border-color: #FF4FD6 !important; color: #FF4FD6 !important; background: #fff0fb !important; }
  .fc .fc-button-primary:not(:disabled).fc-button-active { background: #FF4FD6 !important; border-color: #FF4FD6 !important; color: #fff !important; }
  .fc .fc-today-button { background: #fdf2f8 !important; border-color: #f9a8d4 !important; color: #ec4899 !important; border-radius: 20px !important; font-size: 11px !important; padding: 4px 12px !important; }
  .fc .fc-col-header-cell-cushion { font-size: 11px !important; font-weight: 700 !important; color: #9ca3af !important; text-transform: uppercase !important; text-decoration: none !important; padding: 10px 0 !important; }
  .fc .fc-col-header-cell { background: #fafafa; border-color: #f0f0f0 !important; }
  .fc .fc-daygrid-day { cursor: pointer; transition: background 0.12s; }
  .fc .fc-daygrid-day:hover { background: #fdf4ff !important; }
  .fc .fc-day-today { background: #fff0fb !important; }
  .fc .fc-daygrid-day-number { font-size: 12px !important; font-weight: 500 !important; color: #374151 !important; text-decoration: none !important; padding: 6px 8px !important; }
  .fc .fc-day-today .fc-daygrid-day-number { background: #ec4899; color: #fff !important; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: 800 !important; }
  .fc .fc-event { border-radius: 6px !important; font-size: 10px !important; font-weight: 700 !important; padding: 2px 6px !important; cursor: pointer !important; border-left-width: 3px !important; transition: filter 0.1s !important; }
  .fc .fc-event:hover { filter: brightness(0.9); }
  .fc .fc-daygrid-more-link { font-size: 9px !important; color: #ec4899 !important; font-weight: 700 !important; }
  .fc td, .fc th { border-color: #f0f0f0 !important; }
  @keyframes calSpin { to { transform: rotate(360deg); } }
`;

const GCalIcon    = ({ color = '#4285F4', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="8"  y1="2" x2="8"  y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="3"  y1="10" x2="21" y2="10" stroke={color} strokeWidth="2"/>
    <text x="12" y="20" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold" fontFamily="Arial">G</text>
  </svg>
);
const SpinnerIcon = ({ color = '#fff', size = 14 }) => (
  <span style={{ width: size, height: size, border: `2px solid ${color}33`, borderTopColor: color, borderRadius: '50%', display: 'inline-block', animation: 'calSpin 0.7s linear infinite', flexShrink: 0 }} />
);
const SearchIcon = ({ color = '#9ca3af', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const PlusIcon = ({ color = '#fff', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CalIcon = ({ color = '#6b7280', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ProductionCalendarPage = () => {
  const navigate    = useNavigate();
  const calendarRef = useRef(null);
  const { Productions: productions = [] } = useProductions();

  const [events,     setEvents]     = useState(() => loadManualEvents());
  const [filterType, setFilterType] = useState('Todos');

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('todos');
  const [sortOrder,   setSortOrder]   = useState('fecha');

  // Google Calendar
  const [gcalToken,      setGcalToken]      = useState(null);
  const [gcalConnected,  setGcalConnected]  = useState(false);
  const [gcalLoading,    setGcalLoading]    = useState(false);
  const [gcalBtnLoading, setGcalBtnLoading] = useState(false);

  // Modales
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addModal,      setAddModal]      = useState({ open: false, dateStr: null });
  const [newEvent,      setNewEvent]      = useState({ type: 'creacion', title: '', orderId: '', notes: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast,         setToast]         = useState({ show: false, msg: '', type: 'success' });
  const [dateModal,     setDateModal]     = useState({ open: false, dateStr: null });

  // Auto-generar eventos desde órdenes
  useEffect(() => {
    if (!productions.length) return;
    const generated = [];
    productions.forEach((prod) => {
      const orderId = prod.id, orderNum = prod.orderNumber, history = prod.history || [];
      const firstEntry = history[0];
      if (firstEntry) {
        const iso = ddmmyyyyToISO(firstEntry.date);
        if (iso) generated.push({ id: `auto-${orderId}-creacion`, date: iso, type: 'creacion', title: `Orden #${orderNum} creada`, orderId, notes: `Cliente: ${prod.client || '—'} · Producto: ${prod.producto || prod.referencia || '—'}` });
      }
      const entregaISO = ddmmyyyyToISO(prod.deliveryDate);
      if (entregaISO) generated.push({ id: `auto-${orderId}-entrega`, date: entregaISO, type: 'entrega', title: `Entrega orden #${orderNum}`, orderId, notes: `Cliente: ${prod.client || '—'}` });
      history.forEach((h, idx) => {
        if (idx === 0) return;
        const dateISO = ddmmyyyyToISO(h.date);
        if (!dateISO) return;
        generated.push({ id: `auto-${orderId}-hist-${idx}`, date: dateISO, type: statusToEventType(h.status), title: `${h.status} — #${orderNum}`, orderId, notes: h.motivo || (h.user ? `Por: ${h.user}` : '') });
      });
      if (prod.status && prod.statusDate) {
        const statusDateISO = ddmmyyyyToISO(prod.statusDate);
        const covered = history.some(h => ddmmyyyyToISO(h.date) === statusDateISO && h.status === prod.status);
        if (statusDateISO && !covered) generated.push({ id: `auto-${orderId}-status`, date: statusDateISO, type: statusToEventType(prod.status), title: `${prod.status} — #${orderNum}`, orderId, notes: `Estado actual · Cliente: ${prod.client || '—'}` });
      }
      (prod.details || []).forEach((det, idx) => {
        const detISO = ddmmyyyyToISO(det.statusDate);
        if (!detISO || !det.status) return;
        const covered = generated.some(g => g.orderId === orderId && g.date === detISO && g.title.startsWith(det.status));
        if (!covered) generated.push({ id: `auto-${orderId}-det-${idx}`, date: detISO, type: statusToEventType(det.status), title: `${det.status} ref.${det.ref || idx + 1} — #${orderNum}`, orderId, notes: [det.color && `Color: ${det.color}`, det.quantity && `${det.quantity} uds`].filter(Boolean).join(' · ') });
      });
    });
    setEvents(prev => { const manual = prev.filter(e => !String(e.id).startsWith('auto-')); return [...manual, ...generated]; });
  }, [productions]);

  useEffect(() => { saveManualEvents(events); }, [events]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  }, []);

  const connectGoogle = async () => {
    setGcalLoading(true);
    try { const token = await getGoogleTokenGIS(); setGcalToken(token); setGcalConnected(true); showToast('Google Calendar conectado correctamente ✓', 'success'); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setGcalLoading(false); }
  };

  const pushToGcal = async (ev) => {
    if (!gcalToken) { showToast('Primero conecta Google Calendar', 'warning'); return; }
    setGcalBtnLoading(true);
    try { await createGCalEvent(gcalToken, ev); showToast(`"${ev.title}" agregado a Google Calendar ✓`, 'success'); }
    catch (err) {
      if (err.message.includes('401') || err.message.includes('invalid_credentials')) { setGcalToken(null); setGcalConnected(false); showToast('Sesión expirada. Reconecta Google Calendar.', 'warning'); }
      else showToast(err.message, 'error');
    } finally { setGcalBtnLoading(false); }
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    const ev = { id: Date.now(), date: addModal.dateStr, type: newEvent.type, title: newEvent.title, orderId: newEvent.orderId ? Number(newEvent.orderId) : null, notes: newEvent.notes };
    setEvents(prev => [...prev, ev]);
    setNewEvent({ type: 'creacion', title: '', orderId: '', notes: '' });
    setAddModal({ open: false, dateStr: null });
    if (gcalConnected) pushToGcal(ev);
    showToast('Evento creado correctamente', 'success');
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => String(e.id) !== String(id)));
    setSelectedEvent(null); setConfirmDelete(null);
    showToast('Evento eliminado', 'success');
  };

  // Filtrado y búsqueda
  const filteredEvents = useMemo(() => {
    let r = events;
    if (filterType !== 'Todos') r = r.filter(ev => ev.type === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      r = r.filter(ev => {
        if (searchField === 'orden') return String(ev.orderId || '').includes(q) || ev.title.toLowerCase().includes(`#${q}`);
        if (searchField === 'proceso') return getEventType(ev.type).label.toLowerCase().includes(q) || ev.type.toLowerCase().includes(q);
        return ev.title.toLowerCase().includes(q) || String(ev.orderId || '').includes(q) || getEventType(ev.type).label.toLowerCase().includes(q) || (ev.notes || '').toLowerCase().includes(q);
      });
    }
    return r;
  }, [events, filterType, searchQuery, searchField]);

  const todayISO = new Date().toISOString().slice(0, 10);

  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .filter(ev => ev.date >= todayISO)
      .sort((a, b) => sortOrder === 'proceso' ? getEventType(a.type).label.localeCompare(getEventType(b.type).label) || a.date.localeCompare(b.date) : a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [filteredEvents, todayISO, sortOrder]);

  const dateEvents = useMemo(() => {
    if (!dateModal.dateStr) return [];
    return events.filter(ev => ev.date === dateModal.dateStr)
      .sort((a, b) => sortOrder === 'proceso' ? getEventType(a.type).label.localeCompare(getEventType(b.type).label) : 0);
  }, [events, dateModal.dateStr, sortOrder]);

  const fcEvents = filteredEvents.map(toFCEvent);

  const handleDateClick  = (info) => setDateModal({ open: true, dateStr: info.dateStr });
  const handleEventClick = (info) => {
    const rawId = info.event.extendedProps.rawId;
    const found = events.find(e => String(e.id) === String(rawId));
    if (found) setSelectedEvent(found);
  };

  const renderEventContent = (eventInfo) => {
    const { orderId } = eventInfo.event.extendedProps;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 4px', overflow: 'hidden' }}>
        {orderId && <span style={{ fontSize: 8, flexShrink: 0 }}>🔗</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 700 }}>{eventInfo.event.title}</span>
      </div>
    );
  };

  // Sub-componentes
  const TypeBadge = ({ type, size = 'sm' }) => {
    const t = getEventType(type);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: size === 'lg' ? '5px 14px' : '3px 10px', borderRadius: 20, background: t.bg, color: t.color, border: `1px solid ${t.border}`, fontSize: size === 'lg' ? 12 : 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />{t.label}
      </span>
    );
  };

  const EventDetailCard = ({ event, onClose }) => {
    const t = getEventType(event.type);
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
        <div style={{ background: '#f6f6f8', borderRadius: 20, width: 'calc(100vw - 24px)', maxWidth: 540, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ background: '#fff', padding: '18px 22px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${t.color}18`, border: `1.5px solid ${t.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CalIcon color={t.color} size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{event.title}</h2>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>{formatDateES(event.date)}{event.orderId ? ` · Orden #${event.orderId}` : ''}</p>
                </div>
              </div>
              <TypeBadge type={event.type} size="lg" />
            </div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#374151' }}>Información del evento</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {[['Fecha', formatDateES(event.date)], ['Proceso', getEventType(event.type).label || '—'], ['Orden', event.orderId ? `#${event.orderId}` : '—'], ['ID evento', `EVT-${event.id}`]].map(([label, value]) => (
                  <div key={label}>
                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{value || '—'}</span>
                  </div>
                ))}
                {event.notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Notas</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{event.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {gcalConnected ? (
                <button onClick={() => pushToGcal(event)} disabled={gcalBtnLoading}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 12, border: 'none', background: gcalBtnLoading ? '#e5e7eb' : 'linear-gradient(135deg,#4285F4,#1a73e8)', color: gcalBtnLoading ? '#9ca3af' : '#fff', cursor: gcalBtnLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  {gcalBtnLoading ? <><SpinnerIcon color="#9ca3af" /> Agregando...</> : <><GCalIcon color="#fff" /> Agregar a Google Calendar</>}
                </button>
              ) : (
                <button onClick={async () => { onClose(); await connectGoogle(); }}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 12, border: '1.5px solid #4285F4', background: '#fff', color: '#4285F4', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <GCalIcon color="#4285F4" /> Conectar Google Calendar
                </button>
              )}
              {event.orderId && (
                <button onClick={() => { onClose(); navigate(`/layout/produccion/detalle/${event.orderId}`, { state: { from: 'calendar' } }); }}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 12, border: 'none', background: '#FF4FD6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 12px rgba(255,79,214,0.3)' }}>
                  Ver orden #{event.orderId} →
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Cerrar</button>
              <button onClick={() => { setConfirmDelete(event.id); onClose(); }}
                style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', fontSize: 13, color: '#ef4444', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de eventos de una fecha
  const DateEventsModal = ({ dateStr, onClose }) => {
    const evs = dateEvents;
    const openAdd = () => { onClose(); setAddModal({ open: true, dateStr }); setNewEvent({ type: 'creacion', title: '', orderId: '', notes: '' }); };
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
        <div style={{ background: '#f6f6f8', borderRadius: 20, width: 'calc(100vw - 24px)', maxWidth: 580, maxHeight: '85vh', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ background: '#fff', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fce7f3', border: '1.5px solid #f9a8d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CalIcon color="#ec4899" size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>{formatDateES(dateStr)}</h2>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>
                    {evs.length === 0 ? 'Sin eventos este día' : `${evs.length} ${evs.length === 1 ? 'evento' : 'eventos'}`}
                  </p>
                </div>
              </div>
              <button onClick={openAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, border: 'none', background: '#FF4FD6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(255,79,214,0.35)', flexShrink: 0 }}>
                <PlusIcon size={13} /> Agregar evento
              </button>
            </div>
          </div>

          {/* Lista */}
          <div style={{ overflowY: 'auto', padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {evs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}></div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#374151' }}>Sin eventos en este día</p>
                <p style={{ margin: '6px 0 20px', fontSize: 13, color: '#9ca3af' }}>¿Quieres registrar algo para esta fecha?</p>
                <button onClick={openAdd}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 12, border: 'none', background: '#FF4FD6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(255,79,214,0.3)' }}>
                  <PlusIcon size={13} /> Agregar primer evento
                </button>
              </div>
            ) : (
              evs.map(ev => {
                const t = getEventType(ev.type);
                return (
                  <div key={ev.id}
                    style={{ background: '#fff', borderRadius: 14, padding: '13px 16px', boxShadow: '0 1px 5px rgba(0,0,0,0.07)', borderLeft: `4px solid ${t.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.1s' }}
                    onClick={() => { onClose(); setSelectedEvent(ev); }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.color }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.orderId && <span style={{ marginRight: 4 }}></span>}{ev.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          <TypeBadge type={ev.type} />
                          {ev.orderId && <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: 8 }}>Orden #{ev.orderId}</span>}
                        </div>
                        {ev.notes && <p style={{ margin: '5px 0 0', fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.notes}</p>}
                      </div>
                    </div>
                    {ev.orderId && (
                      <button onClick={e => { e.stopPropagation(); onClose(); navigate(`/layout/produccion/detalle/${ev.orderId}`, { state: { from: 'calendar' } }); }}
                        style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: '#FF4FD6', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(255,79,214,0.3)' }}>
                        Ver →
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ background: '#fff', padding: '12px 20px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
            <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f8', padding: '24px 28px', fontFamily: 'sans-serif' }}>
      <style>{FC_STYLES}</style>

      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: '#fff', border: `1.5px solid ${toast.type === 'error' ? '#fecaca' : toast.type === 'warning' ? '#fde68a' : '#bbf7d0'}`, borderRadius: 12, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400 }}>
          <span style={{ fontSize: 18 }}>{toast.type === 'error' ? 'x' : toast.type === 'warning' ? '!' : 'v'}</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#374151' }}>{toast.msg}</p>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Eliminar evento</h3>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280' }}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
              <button onClick={() => deleteEvent(confirmDelete)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo evento */}
      {addModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 650, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setAddModal({ open: false, dateStr: null })}>
          <div style={{ background: '#f6f6f8', borderRadius: 20, width: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.22)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#fff', padding: '18px 22px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusIcon color="#ec4899" size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1f2937' }}>Nuevo evento</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{addModal.dateStr ? formatDateES(addModal.dateStr) : '—'}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {[
                  { label: 'Proceso / Tipo', field: 'type', type: 'select' },
                  { label: 'Título *', field: 'title', placeholder: 'Ej: Inicio producción orden 23' },
                  { label: 'Orden (ID)', field: 'orderId', placeholder: 'Ej: 21', numeric: true },
                  { label: 'Notas', field: 'notes', placeholder: 'Observaciones...' },
                ].map(({ label, field, type, placeholder, numeric }) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>{label}</span>
                    {type === 'select' ? (
                      <select value={newEvent[field]} onChange={e => setNewEvent({ ...newEvent, [field]: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', outline: 'none' }}>
                        {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    ) : (
                      <input type="text" inputMode={numeric ? 'numeric' : 'text'} value={newEvent[field]}
                        onChange={e => { const v = e.target.value; if (numeric && v !== '' && !/^\d+$/.test(v)) return; setNewEvent({ ...newEvent, [field]: v }); }}
                        onKeyDown={e => e.key === 'Enter' && field === 'title' && addEvent()}
                        placeholder={placeholder}
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', outline: 'none', boxSizing: 'border-box' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              {gcalConnected && (
                <div style={{ padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 11, color: '#1d4ed8', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <GCalIcon color="#1d4ed8" size={13} /> El evento se agregará a Google Calendar automáticamente
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setAddModal({ open: false, dateStr: null })} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
                <button onClick={addEvent} disabled={!newEvent.title.trim()}
                  style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', background: newEvent.title.trim() ? '#FF4FD6' : '#f3f4f6', color: newEvent.title.trim() ? '#fff' : '#9ca3af', cursor: newEvent.title.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, boxShadow: newEvent.title.trim() ? '0 4px 12px rgba(255,79,214,0.3)' : 'none' }}>
                  Agregar evento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de fecha */}
      {dateModal.open && <DateEventsModal dateStr={dateModal.dateStr} onClose={() => setDateModal({ open: false, dateStr: null })} />}

      {/* Detalle de evento individual */}
      {selectedEvent && <EventDetailCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* Volver */}
      <button onClick={() => navigate('/layout/produccion')} style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Volver a Producciones
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Calendario de Producción</h2>
          <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#fce7f3', color: '#ec4899' }}>
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* BOTÓN AGREGAR EVENTO */}
          <button
            onClick={() => { setAddModal({ open: true, dateStr: todayISO }); setNewEvent({ type: 'creacion', title: '', orderId: '', notes: '' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 10, border: 'none', background: '#FF4FD6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(255,79,214,0.35)' }}>
            <PlusIcon size={14} /> Agregar evento
          </button>
          {/* Google Calendar */}
          {gcalConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 10, border: '1.5px solid #bbf7d0', background: '#f0fdf4' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Google Calendar conectado</span>
              <button onClick={() => { setGcalToken(null); setGcalConnected(false); showToast('Desconectado de Google Calendar', 'warning'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontSize: 17, fontWeight: 700, padding: '0 0 0 4px' }}>×</button>
            </div>
          ) : (
            <button onClick={connectGoogle} disabled={gcalLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: '1.5px solid #4285F4', background: '#fff', color: '#4285F4', cursor: gcalLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}>
              {gcalLoading ? <SpinnerIcon color="#4285F4" /> : <GCalIcon color="#4285F4" />}
              {gcalLoading ? 'Conectando...' : 'Conectar Google Calendar'}
            </button>
          )}
        </div>
      </div>

      {/* ── BUSCADOR + FILTROS ─────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Input */}
        <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 12px', background: '#fafafa' }}>
          <SearchIcon />
          <input
            type="text"
            placeholder={searchField === 'orden' ? 'Buscar por número de orden...' : searchField === 'proceso' ? 'Buscar por proceso...' : 'Buscar eventos, órdenes, procesos...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', width: '100%', minWidth: 0 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
          )}
        </div>

        {/* Buscar en */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, whiteSpace: 'nowrap' }}>EN:</span>
          {[['todos', 'Todo'], ['orden', 'Orden'], ['proceso', 'Proceso']].map(([val, label]) => (
            <button key={val} onClick={() => setSearchField(val)}
              style={{ padding: '5px 11px', borderRadius: 20, border: '1px solid', borderColor: searchField === val ? '#6366f1' : '#e5e7eb', background: searchField === val ? '#eef2ff' : '#fff', color: searchField === val ? '#6366f1' : '#9ca3af', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Ordenar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, whiteSpace: 'nowrap' }}>ORDEN:</span>
          {[['fecha', ' Fecha'], ['proceso', ' Proceso']].map(([val, label]) => (
            <button key={val} onClick={() => setSortOrder(val)}
              style={{ padding: '5px 11px', borderRadius: 20, border: '1px solid', borderColor: sortOrder === val ? '#ec4899' : '#e5e7eb', background: sortOrder === val ? '#fdf2f8' : '#fff', color: sortOrder === val ? '#ec4899' : '#9ca3af', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {searchQuery && (
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, padding: '4px 10px', background: '#f3f4f6', borderRadius: 8, whiteSpace: 'nowrap' }}>
            {filteredEvents.length} resultado{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

     

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>

        {/* FullCalendar */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
            buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana' }}
            events={fcEvents}
            eventContent={renderEventContent}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            dayMaxEvents={3}
            firstDay={1}
            height="auto"
            eventDisplay="block"
          />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Google Calendar card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#374151' }}>Google Calendar</h3>
            {gcalConnected ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Conectado</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>Los nuevos eventos se agregarán automáticamente.</p>
                <button onClick={() => { setGcalToken(null); setGcalConnected(false); }} style={{ width: '100%', padding: '8px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}>Desconectar</button>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>Conecta tu cuenta para sincronizar eventos directamente.</p>
                <button onClick={connectGoogle} disabled={gcalLoading}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: gcalLoading ? '#f3f4f6' : '#4285F4', color: gcalLoading ? '#9ca3af' : '#fff', cursor: gcalLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  {gcalLoading ? <><SpinnerIcon color="#9ca3af" size={12}/> Conectando...</> : <><GCalIcon color="#fff" size={14}/> Conectar</>}
                </button>
                {!GOOGLE_CLIENT_ID && (
                  <p style={{ margin: '8px 0 0', fontSize: 10, color: '#f59e0b', lineHeight: 1.5, textAlign: 'center', background: '#fef3c7', padding: '6px 8px', borderRadius: 6 }}>
                    ⚠️ Agrega VITE_GOOGLE_CLIENT_ID en .env<br/>
                    <span style={{ color: '#92400e' }}>Google Cloud → APIs → OAuth 2.0</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Próximos eventos */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Próximos eventos</h3>
              {upcomingEvents.length > 0 && (
                <span style={{ fontSize: 10, color: '#ec4899', fontWeight: 700, background: '#fce7f3', padding: '2px 8px', borderRadius: 10 }}>{upcomingEvents.length}</span>
              )}
            </div>
            {upcomingEvents.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Sin eventos próximos</p>
                <p style={{ fontSize: 11, color: '#d1d5db', margin: '4px 0 0' }}>Haz clic en un día del calendario</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingEvents.map(ev => {
                  const t = getEventType(ev.type);
                  return (
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                      style={{ padding: '9px 11px', borderRadius: 12, background: t.bg, cursor: 'pointer', border: `1px solid ${t.border}`, transition: 'filter 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: t.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.orderId && '🔗 '}{ev.title}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                        <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{formatDateES(ev.date)}</p>
                        <span style={{ fontSize: 9, color: t.color, fontWeight: 700 }}>{t.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <p style={{ textAlign: 'center', margin: '14px 0 0', fontSize: 11, color: '#d1d5db' }}>
        Haz clic en cualquier día para ver sus eventos · Usa el buscador para filtrar por orden o proceso
      </p>
    </div>
  );
};

export default ProductionCalendarPage;
