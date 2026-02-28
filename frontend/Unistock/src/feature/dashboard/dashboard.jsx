import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// ── Datos ─────────────────────────────────────────────────────────
const dataByView = {
  Semana: [
    { label: 'Lun', terceros: 185, sede1: 245, sede2: 215 },
    { label: '', terceros: 270, sede1: 155, sede2: 195 },
    { label: '', terceros: 215, sede1: 175, sede2: 165 },
    { label: 'Mar', terceros: 305, sede1: 240, sede2: 170 },
    { label: '', terceros: 195, sede1: 155, sede2: 160 },
    { label: '', terceros: 230, sede1: 230, sede2: 75 },
    { label: 'Mié', terceros: 275, sede1: 185, sede2: 210 },
    { label: '', terceros: 270, sede1: 155, sede2: 205 },
    { label: '', terceros: 210, sede1: 250, sede2: 155 },
    { label: 'Jue', terceros: 265, sede1: 210, sede2: 180 },
    { label: '', terceros: 210, sede1: 145, sede2: 145 },
    { label: 'Vie', terceros: 205, sede1: 270, sede2: 130 },
    { label: '', terceros: 270, sede1: 250, sede2: 185 },
    { label: 'Sáb', terceros: 275, sede1: 145, sede2: 145 },
    { label: '', terceros: 330, sede1: 205, sede2: 63 },
    { label: 'Dom', terceros: 250, sede1: 240, sede2: 210 },
  ],
  Mes: [
    { label: 'Semana 1', terceros: 185, sede1: 245, sede2: 215 },
    { label: '', terceros: 230, sede1: 190, sede2: 175 },
    { label: '', terceros: 270, sede1: 155, sede2: 140 },
    { label: '', terceros: 215, sede1: 175, sede2: 165 },
    { label: 'Semana 2', terceros: 305, sede1: 240, sede2: 170 },
    { label: '', terceros: 195, sede1: 155, sede2: 160 },
    { label: '', terceros: 250, sede1: 210, sede2: 95 },
    { label: '', terceros: 230, sede1: 230, sede2: 75 },
    { label: 'Semana 3', terceros: 275, sede1: 185, sede2: 210 },
    { label: '', terceros: 210, sede1: 145, sede2: 145 },
    { label: '', terceros: 255, sede1: 240, sede2: 35 },
    { label: '', terceros: 220, sede1: 185, sede2: 125 },
    { label: 'Semana 4', terceros: 275, sede1: 145, sede2: 145 },
    { label: '', terceros: 330, sede1: 205, sede2: 63 },
    { label: '', terceros: 250, sede1: 240, sede2: 210 },
    { label: '', terceros: 295, sede1: 190, sede2: 160 },
  ],
  Año: [
    { label: 'Ene', terceros: 210, sede1: 180, sede2: 150 },
    { label: 'Feb', terceros: 240, sede1: 210, sede2: 130 },
    { label: 'Mar', terceros: 195, sede1: 230, sede2: 175 },
    { label: 'Abr', terceros: 270, sede1: 160, sede2: 200 },
    { label: 'May', terceros: 300, sede1: 195, sede2: 145 },
    { label: 'Jun', terceros: 255, sede1: 270, sede2: 90 },
    { label: 'Jul', terceros: 310, sede1: 240, sede2: 185 },
    { label: 'Ago', terceros: 280, sede1: 210, sede2: 160 },
    { label: 'Sep', terceros: 230, sede1: 175, sede2: 220 },
    { label: 'Oct', terceros: 290, sede1: 250, sede2: 130 },
    { label: 'Nov', terceros: 320, sede1: 200, sede2: 175 },
    { label: 'Dic', terceros: 295, sede1: 230, sede2: 195 },
  ],
};

const barData = [
  { name: 'En espera', value: 50 },
  { name: 'Tráfico entre sedes', value: 25 },
  { name: 'Ficha técnica', value: 15 },
  { name: 'Corte', value: 5 },
  { name: 'Diseño', value: 15 },
  { name: 'En producción', value: 10 },
  { name: 'Bodega', value: 20 },
  { name: 'Mercadeo', value: 13 },
  { name: 'Cancelado', value: 3 },
  { name: 'Compras', value: 10 },
  { name: 'Recepción', value: 2 },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const YEARS = [2022, 2023, 2024, 2025, 2026];

// ── Componentes pequeños ──────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-5 ${className}`} style={{ border: "1.5px solid #e5e7eb" }}>{children}</div>
);

// Íconos por proceso para el eje X de la barra
const barIcons = {
  'En espera': 'M12 2a10 10 0 1 0 4.95 18.66M12 6v6l3 1.5',
  'Tráfico entre sedes': 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  'Ficha técnica': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8',
  'Corte': 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
  'Diseño': 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z',
  'En producción': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
  'Bodega': 'M2 20h20M4 20V10l8-6 8 6v10M10 20v-6h4v6',
  'Mercadeo': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  'Cancelado': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM15 9l-6 6M9 9l6 6',
  'Compras': 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  'Recepción': 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
};
const barIconKeys = Object.keys(barIcons);

const BarTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {words.map((w, i) => (
        <text key={i} x={0} dy={13 + i * 13} textAnchor="middle" fill="#4b5563" fontSize={10}>{w}</text>
      ))}
    </g>
  );
};

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 border border-pink-300 rounded-xl px-3 py-1 text-sm font-medium text-gray-800 bg-white">
        {value}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-pink-300 rounded-2xl shadow z-50 py-1 min-w-full">
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-pink-50 ${String(opt) === String(value) ? 'text-fuchsia-600 font-semibold' : 'text-gray-700'}`}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────
export default function ProductionDashboard() {
  const [viewMode, setViewMode] = useState('Todas');
  const [timeView, setTimeView] = useState('Mes');
  const [selectedMonth, setSelectedMonth] = useState('Enero');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedBarYear, setSelectedBarYear] = useState(2026);
  const [selectedBarMonth, setSelectedBarMonth] = useState('Enero');
  const [barTimeView, setBarTimeView] = useState('Año');

  const lineData = dataByView[timeView];
  const showTerceros = viewMode === 'Todas' || viewMode === 'Terceros';
  const showSede1 = viewMode === 'Todas' || viewMode === 'Sede 1';
  const showSede2 = viewMode === 'Todas' || viewMode === 'Sede 2';

  // ── Selector de tiempo global ──────────────────────────────────
  const GlobalTimeFilter = () => (
    <div className="flex items-center gap-2">
      {timeView === 'Semana' && <>
        <Dropdown value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} />
        <Dropdown value={selectedYear} options={YEARS} onChange={setSelectedYear} />
      </>}
      {timeView === 'Mes' && (
        <Dropdown value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} />
      )}
      {timeView === 'Año' && (
        <Dropdown value={selectedYear} options={YEARS} onChange={setSelectedYear} />
      )}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5">
        {['Semana', 'Mes', 'Año'].map((p) => (
          <button key={p} onClick={() => setTimeView(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timeView === p ? 'bg-fuchsia-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-5" style={{ background: "#fdf6fc" }}>

      {/* ── Encabezado con filtro global ── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Dashboard de Producción</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Período:</span>
          <GlobalTimeFilter />
        </div>
      </div>

      {/* Fila 1: stats */}
      <Card className="mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-4">Estado general de producción</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: 'Producciones actuales', value: '10', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
              ), color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200'
            },
            {
              label: 'Completadas este mes', value: '8', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
              ), color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200'
            },
            {
              label: 'Por iniciar', value: '2', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              ), color: 'text-pink-600 bg-pink-50 border-pink-200'
            },
            {
              label: 'Tiempo promedio', value: '4 días', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              ), color: 'text-pink-500 bg-pink-50 border-pink-200'
            },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-xl px-4 py-3 bg-white" style={{ border: "1.5px solid #e5e7eb" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${color}`}>{icon}</div>
                <p className="text-xs font-medium text-gray-700">{label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Fila 2: gráfica + panel derecho */}
      <div className="flex gap-4 mb-4">

        <Card className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comportamiento de la producción en las sedes</h2>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Último mes</span>

              <button onClick={() => setViewMode('Todas')}
                className={`px-3 py-0.5 rounded-full text-sm font-medium border transition-colors ${viewMode === 'Todas' ? 'bg-fuchsia-500 text-white border-fuchsia-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                Todas
              </button>

              <button onClick={() => setViewMode('Terceros')}
                className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium bg-white border transition-colors ${viewMode === 'Terceros' ? 'border-green-400 text-gray-800' : 'border-gray-200 text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 10 10">
                  <polygon points="5,0 10,10 0,10" fill="#22c55e" />
                </svg>
                Terceros
              </button>

              <button onClick={() => setViewMode('Sede 1')}
                className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium bg-white border transition-colors ${viewMode === 'Sede 1' ? 'border-fuchsia-400 text-gray-800' : 'border-gray-200 text-gray-600'}`}>
                <span className="w-3 h-3 inline-block rounded-sm bg-fuchsia-500" />
                Sede 1
              </button>

              <button onClick={() => setViewMode('Sede 2')}
                className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium bg-white border transition-colors ${viewMode === 'Sede 2' ? 'border-pink-300 text-gray-800' : 'border-gray-200 text-gray-600'}`}>
                <span className="w-3 h-3 inline-block rounded-full bg-pink-300" />
                Sede 2
              </button>
            </div>
            {/* Indicador del período activo (solo lectura, controlado globalmente) */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                Período: <span className="font-semibold text-fuchsia-600">
                  {timeView === 'Semana' ? `${selectedMonth} ${selectedYear} — por semana` :
                    timeView === 'Mes' ? `${selectedMonth} ${selectedYear}` :
                      `Año ${selectedYear}`}
                </span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F5D8F5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 330]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]}
                tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false}
                label={{
                  value: 'Órdenes de producción', angle: -90, position: 'insideLeft',
                  dx: 10, style: { fontSize: 10, fill: '#d946ef', textAnchor: 'middle' }
                }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #fce7f3', fontSize: 12, color: '#111827' }} />
              {showSede2 && <Line type="monotone" dataKey="sede2" stroke="#f0a0d8" strokeWidth={1.5} dot={false} name="Sede 2" />}
              {showSede1 && <Line type="monotone" dataKey="sede1" stroke="#e040b8" strokeWidth={2} dot={false} name="Sede 1" />}
              {showTerceros && <Line type="monotone" dataKey="terceros" stroke="#22c55e" strokeWidth={2} dot={false} name="Terceros" />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Panel derecho */}
        <div className="w-72 flex flex-col gap-4">

          <Card className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Estado general de producción</h3>
            <div className="flex items-end justify-around h-48">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold">2</span>
                <div className="w-10 h-2 rounded-lg bg-pink-200" />
                <p className="text-xs text-center text-gray-700 font-medium mt-1">Producciones<br />con retraso</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold">45</span>
                <div className="w-10 h-30 rounded-lg bg-green-400" />
                <p className="text-xs text-center text-gray-700 font-medium mt-1">Todo en<br />orden</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">Insumos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 40 25" fill="none">
                      <path d="M38.4998 11.5371C38.5507 11.2879 38.5133 11.035 38.3902 10.795C38.2671 10.555 38.0609 10.3332 37.7853 10.1442C37.5063 9.95377 37.1628 9.80111 36.7778 9.69642C36.3928 9.59174 35.9751 9.53743 35.5523 9.53711H3.57694C3.15421 9.53743 2.73645 9.59174 2.35145 9.69642C1.96644 9.80111 1.62301 9.95377 1.34402 10.1442C1.06833 10.3332 0.862201 10.555 0.739078 10.795C0.615955 11.035 0.578611 11.2879 0.629483 11.5371L2.8624 22.2513C2.95016 22.6869 3.30217 23.0878 3.85128 23.3776C4.4004 23.6675 5.10819 23.8259 5.83963 23.8227H33.3492C34.0806 23.8259 34.7884 23.6675 35.3375 23.3776C35.8866 23.0878 36.2387 22.6869 36.3264 22.2513L38.4998 11.5371Z" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.16748 9.53595V8.64309C6.16748 6.5119 7.579 4.468 10.0915 2.96102C12.604 1.45403 16.0118 0.607422 19.565 0.607422C23.1182 0.607422 26.5259 1.45403 29.0385 2.96102C31.551 4.468 32.9625 6.5119 32.9625 8.64309V9.53595" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.6099 14.8945V18.4659" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M25.5181 14.8945V18.4659" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Por adquisición</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 h-px bg-pink-200 inline-block" />
                  <span className="text-sm font-semibold text-gray-900">120</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="15" viewBox="0 0 44 27" fill="none">
                      <path d="M39.6436 0.607422H3.86044C2.06385 0.607422 0.607422 1.47356 0.607422 2.542V23.8224C0.607422 24.8908 2.06385 25.757 3.86044 25.757H39.6436C41.4402 25.757 42.8966 24.8908 42.8966 23.8224V2.542C42.8966 1.47356 41.4402 0.607422 39.6436 0.607422Z" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M28.2572 0.607422V10.2803C28.2572 10.5369 28.0858 10.7829 27.7808 10.9643C27.4757 11.1457 27.062 11.2476 26.6307 11.2476H16.8716C16.4402 11.2476 16.0265 11.1457 15.7215 10.9643C15.4165 10.7829 15.2451 10.5369 15.2451 10.2803V0.607422" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M26.6318 20.9194H34.7644" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Almacenamiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 h-px bg-pink-200 inline-block" />
                  <span className="text-sm font-semibold text-gray-900">115</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-500 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="17" viewBox="0 0 48 31" fill="none">
                      <path d="M43.0099 7.76605H33.2673V6.61077C33.2673 2.95238 29.6238 0 25.1089 0H22.8119C18.297 0 14.6535 2.95238 14.6535 6.61077V7.76605H4.9901C2.29703 7.76605 0 9.56315 0 11.8095V26.9565C0 29.1387 2.21782 31 4.9901 31H43.0099C45.703 31 48 29.2029 48 26.9565V11.7453C48 9.56315 45.703 7.76605 43.0099 7.76605ZM18.297 6.61077C18.297 4.55694 20.3564 2.8882 22.8911 2.8882H25.1881C27.7228 2.8882 29.7822 4.55694 29.7822 6.61077V7.76605H18.297V6.61077ZM4.9901 10.6542H43.0099C43.802 10.6542 44.4356 11.1677 44.4356 11.8095V15.4037H39.7624V14.1843C39.7624 13.4141 38.9703 12.7081 37.9406 12.7081C36.9109 12.7081 36.1188 13.3499 36.1188 14.1843V15.4037H11.8812V14.1843C11.8812 13.4141 11.0891 12.7081 10.0594 12.7081C9.0297 12.7081 8.23762 13.3499 8.23762 14.1843V15.4037H3.64356V11.8095C3.64356 11.1677 4.19802 10.6542 4.9901 10.6542ZM43.0099 28.0476H4.9901C4.19802 28.0476 3.56436 27.5342 3.56436 26.8923V18.2277H8.23762V19.4472C8.23762 20.2174 9.0297 20.9234 10.0594 20.9234C11.0891 20.9234 11.8812 20.2816 11.8812 19.4472V18.2277H36.1188V19.4472C36.1188 20.2174 36.9109 20.9234 37.9406 20.9234C38.9703 20.9234 39.7624 20.2816 39.7624 19.4472V18.2277H44.4356V26.8923C44.4356 27.5342 43.802 28.0476 43.0099 28.0476Z" fill="white" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">Producción</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 h-px bg-pink-200 inline-block" />
                  <span className="text-sm font-semibold text-gray-900">105</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Fila 3: barras */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Estado general de los procesos de producción</h3>
          {/* Indicador del período activo (solo lectura, controlado globalmente) */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Período: <span className="font-semibold text-fuchsia-600">
                {timeView === 'Semana' ? `${selectedMonth} ${selectedYear} — por semana` :
                  timeView === 'Mes' ? `${selectedMonth} ${selectedYear}` :
                    `Año ${selectedYear}`}
              </span>
            </span>
          </div>
        </div>

        {/* Fila de íconos sobre el gráfico */}
        <div className="flex mb-4 pl-14 pr-2">
          {barIconKeys.map((name) => (
            <div key={name} className="flex-1 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={barIcons[name]} />
              </svg>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="2 4" stroke="#F5D8F5" vertical={false} />
            <XAxis dataKey="name" tick={<BarTick />} axisLine={false} tickLine={false} interval={0} />
            <YAxis
              domain={[0, 55]}
              ticks={[0, 15, 30, 45, 60]}
              tick={{ fontSize: 11, fill: '#4b5563' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Cantidad',
                angle: -90,
                position: 'insideLeft',
                dx: -2,
                style: { fontSize: 10, fill: '#d946ef', textAnchor: 'middle' }
              }}
            />
            <Tooltip formatter={(v) => [v, 'Cantidad']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 11, fill: '#374151', fontWeight: 600 }}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.value >= 25 ? '#E8B4E8' : '#7BE87B'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <p className="text-center text-sm font-bold mt-1" style={{ color: '#c026d3' }}>Procesos</p>

        {/* Alerta de referencia de color */}
        <div className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50">
          <div className="w-5 h-5 rounded-md shrink-0" style={{ background: '#E8B4E8', border: '1.5px solid #d946ef' }} />
          <p className="text-xs text-fuchsia-700 font-medium">
            Los procesos con <span className="font-bold">25 o más unidades</span> se muestran en <span className="font-bold">morado</span>. Estos pueden requerir atención o revisión de capacidad.
          </p>
        </div>
      </Card>
    </div>
  );
}