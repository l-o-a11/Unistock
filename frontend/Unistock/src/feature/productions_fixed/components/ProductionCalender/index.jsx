import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EVENT_TYPES = {
  inicio: { label: "Inicio de producción", color: "bg-blue-200 text-blue-700" },
  calidad: { label: "Control de calidad", color: "bg-yellow-200 text-yellow-700" },
  entrega: { label: "Fecha de entrega", color: "bg-green-200 text-green-700" },
};

const INITIAL_EVENTS = [
  { id: 1, date: "2025-12-16", type: "inicio", title: "Inicio de Produc..." },
  { id: 2, date: "2025-12-23", type: "calidad", title: "Control de Calid..." },
  { id: 3, date: "2025-12-30", type: "entrega", title: "Fecha de Entreg..." },
];

const DAYS = ["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export default function ProduccionCalendario({ onClose }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("mensual");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filterType, setFilterType] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newEvent, setNewEvent] = useState({ type: "inicio", title: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const dateStr = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const eventsForDay = (day) => {
    const ds = dateStr(day);
    return events.filter((e) => {
      if (e.date !== ds) return false;
      if (filterType !== "Todos" && e.type !== filterType) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setNewEvent({ type: "inicio", title: "" });
    setShowModal(true);
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setEvents((prev) => [
      ...prev,
      { id: Date.now(), date: dateStr(selectedDay), type: newEvent.type, title: newEvent.title },
    ]);
    setShowModal(false);
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
  };

  const handleCloseCalendar = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/layout/produccion");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseCalendar();
    }
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const weekStart = 1;
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(d => d <= daysInMonth);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-40 overflow-auto"
      onClick={handleBackdropClick}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-gray-50 p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Producción</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseCalendar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:border-pink-400 hover:text-pink-500 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>

        {/* View toggle + Tabs */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            {["mensual", "semanal"].map((v) => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-4 py-2 text-sm font-semibold transition-all ${viewMode === v ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:bg-gray-50"}`}>
                Vista {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Calendar */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            {/* Month nav */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <div className="font-bold text-gray-700 text-base">{MONTHS[month]}</div>
                <div className="text-gray-400 text-sm">{year}</div>
              </div>
              <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>

            {/* Monthly view */}
            {viewMode === "mensual" && (
              <div className="border-t border-l border-gray-100">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7">
                    {week.map((day, di) => {
                      const dayEvents = day ? eventsForDay(day) : [];
                      return (
                        <div key={di}
                          onClick={() => day && handleDayClick(day)}
                          className={`border-b border-r border-gray-100 min-h-16 p-1 cursor-pointer transition-colors ${day ? "hover:bg-pink-50" : "bg-gray-50"}`}>
                          {day && (
                            <>
                              <span className="text-xs text-gray-500 font-medium">{day}</span>
                              <div className="mt-1 space-y-0.5">
                                {dayEvents.map((ev) => (
                                  <div key={ev.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                                    className={`text-xs px-1.5 py-0.5 rounded-md truncate cursor-pointer ${EVENT_TYPES[ev.type].color}`}>
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
                ))}
              </div>
            )}

            {/* Weekly view */}
            {viewMode === "semanal" && (
              <div className="border-t border-l border-gray-100">
                <div className="grid grid-cols-7">
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = i + 1 <= daysInMonth ? i + 1 : null;
                    const dayEvents = day ? eventsForDay(day) : [];
                    return (
                      <div key={i}
                        onClick={() => day && handleDayClick(day)}
                        className={`border-b border-r border-gray-100 min-h-40 p-2 cursor-pointer transition-colors ${day ? "hover:bg-pink-50" : "bg-gray-50"}`}>
                        {day && (
                          <>
                            <span className="text-sm text-gray-600 font-semibold">{day}</span>
                            <div className="mt-2 space-y-1">
                              {dayEvents.map((ev) => (
                                <div key={ev.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                                  className={`text-xs px-2 py-1 rounded-md cursor-pointer ${EVENT_TYPES[ev.type].color}`}>
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
          <div className="w-52 flex flex-col gap-4">
            {/* Tipo de proceso */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">Tipo de proceso</p>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="Todos">Todos</option>
                <option value="inicio">Inicio de producción</option>
                <option value="calidad">Control de calidad</option>
                <option value="entrega">Fecha de entrega</option>
              </select>
            </div>

            {/* Próximos vencimientos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">Próximos vencimientos</p>
              <div className="flex flex-col gap-2">
                {Object.entries(EVENT_TYPES).map(([key, val]) => (
                  <button key={key}
                    onClick={() => setFilterType(filterType === key ? "Todos" : key)}
                    className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${val.color} ${filterType === key ? "ring-2 ring-offset-1 ring-gray-300" : ""}`}>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Agregar evento — día {selectedDay} de {MONTHS[month]}
            </h2>
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tipo</label>
              <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300">
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Título</label>
              <input type="text" value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ej: Inicio de producción orden 21"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={addEvent}
                className="flex-1 py-2 rounded-xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition shadow-md shadow-pink-200">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-72" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-700 mb-2">{selectedEvent.title}</h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-semibold">Tipo:</span> {EVENT_TYPES[selectedEvent.type].label}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold">Fecha:</span> {selectedEvent.date}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSelectedEvent(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
                Cerrar
              </button>
              <button onClick={() => deleteEvent(selectedEvent.id)}
                className="flex-1 py-2 rounded-xl bg-red-100 text-red-500 text-sm font-semibold hover:bg-red-200 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}