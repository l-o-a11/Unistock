import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProductionAPIClient } from '../production/services/ProductionAPIClient';
import { sedesAPI } from '../sedes/services/sedesAPI';
import { supplyAPI } from '../supplies/services/supplyAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
// ⚠️ Ajusta esta ruta si la ubicación real de este archivo dentro de
// `features/` tiene otra profundidad (debe apuntar a shared/assets).
import putongasLogoUrl from '../shared/assets/putongasLogo.png';

// ── Constantes ─────────────────────────────────────────────────────
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const YEARS = [2022, 2023, 2024, 2025, 2026];

const BAR_PROCESSES = [
  'En espera', 'Tráfico entre sedes', 'Ficha técnica', 'Corte', 'Diseño',
  'En producción', 'Bodega', 'Mercadeo', 'Cancelado', 'Compras', 'Recepción',
];

// Mapeo estado backend → proceso barra
const ESTADO_TO_PROCESO = {
  'En espera': 'En espera', 'Diseño': 'Diseño',
  'Ficha Técnica': 'Ficha técnica', 'Ficha tecnica': 'Ficha técnica',
  'Corte': 'Corte', 'Producción': 'En producción', 'En producción': 'En producción',
  'Compras': 'Compras', 'Empaque': 'Bodega', 'Enviado': 'Recepción',
  'Anulada': 'Cancelado', 'Tráfico entre sedes': 'Tráfico entre sedes',
  'Mercadeo': 'Mercadeo',
};

// ✅ El backend guarda el estado "en producción" con dos nombres distintos
// según la ruta que lo creó ('Producción' y 'En producción' — ver el
// mapeo de arriba). Los cálculos de stats deben reconocer ambas variantes,
// o subcuentan (y por eso "Producciones actuales" quedaba en 0/"—").
const ESTADOS_EN_PRODUCCION = ['Producción', 'En producción'];

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

const SEDE_COLORS = ['#e040b8', '#f0a0d8', '#a78bfa', '#34d399', '#f59e0b', '#60a5fa'];

// ── Helpers ────────────────────────────────────────────────────────
const sameMonthYear = (val, m, y) => {
  if (!val) return false;
  const d = new Date(val);
  return d.getMonth() === m && d.getFullYear() === y;
};

// Fecha de referencia de una orden para agrupar por período
// Prioridad: fecha de la última transición de estado → updatedAt → createdAt
const orderDate = (o) => {
  const last = (o.historial || []).slice(-1)[0];
  return last?.fecha || o.updatedAt || o.createdAt || null;
};

// Suma de productos (detalles.cantidad) de una orden
const totalProductos = (o) =>
  (o.detalles || []).reduce((s, d) => s + (Number(d.cantidad) || 0), 0);

const calcAvgDays = (orders) => {
  // El "inicio" puede venir en createdAt/updatedAt, pero si el backend no los
  // incluye en la respuesta de la lista (común cuando el endpoint de listado
  // no trae timestamps para aligerar el payload), respaldamos con la primera
  // entrada del historial — igual que ya hace orderDate() para el resto de
  // las stats del dashboard. Antes, si createdAt/updatedAt venían vacíos,
  // esta función SIEMPRE devolvía null (por eso el "—" fijo) aunque el resto
  // de tarjetas sí funcionaran, porque solo ellas usaban ese respaldo.
  const done = orders.filter(o => o.estado === 'Enviado');
  if (!done.length) return null;

  const getStart = (o) => {
    const primera = (o.historial || [])[0];
    return o.createdAt || primera?.fecha || o.updatedAt || null;
  };
  const getEnd = (o) => {
    const h = (o.historial || []).find(hh => hh.estado === 'Enviado');
    const ultima = (o.historial || []).slice(-1)[0];
    return h?.fecha || o.updatedAt || ultima?.fecha || o.createdAt || null;
  };

  let sum = 0;
  let validCount = 0;
  const invalidSamples = [];

  done.forEach((o) => {
    const startRaw = getStart(o);
    const endRaw = getEnd(o);
    const start = startRaw ? new Date(startRaw).getTime() : NaN;
    const end = endRaw ? new Date(endRaw).getTime() : NaN;

    if (Number.isNaN(start) || Number.isNaN(end)) {
      if (invalidSamples.length < 3) {
        invalidSamples.push({ id: o.id || o._id, orderNumber: o.orderNumber, createdAt: o.createdAt, updatedAt: o.updatedAt, historial: o.historial });
      }
      return;
    }
    sum += Math.max(0, Math.round((end - start) / 86400000));
    validCount++;
  });

  if (!validCount) {
    if (invalidSamples.length) {
      // 🔎 Diagnóstico temporal: si esto sigue en "—", revisa en la consola
      // qué campos vienen realmente en las órdenes "Enviado" (createdAt,
      // updatedAt, historial) para confirmar cuál falta en el backend.
      console.warn('[Dashboard] Tiempo promedio: ninguna orden "Enviado" tiene fechas válidas. Ejemplos:', invalidSamples);
    }
    return null;
  }
  return Math.round(sum / validCount);
};

// Función universal de coincidencia por período.
// ✅ Nuevo modo 'Rango': cuando el usuario define un rango de fechas
// personalizado (dateFrom/dateTo) en el filtro superior, este modo
// reemplaza a Semana/Mes/Año en todos los cálculos del dashboard.
const matchPeriod = (val, mode, monthIdx, year, dateFrom, dateTo) => {
  if (!val) return false;
  const d = new Date(val);
  const now = new Date();
  if (mode === 'Rango') {
    if (!dateFrom || !dateTo) return false;
    const from = new Date(`${dateFrom}T00:00:00`);
    const to = new Date(`${dateTo}T23:59:59.999`);
    return d >= from && d <= to;
  }
  if (mode === 'Día') return d.toDateString() === now.toDateString();
  if (mode === 'Semana') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return d >= startOfWeek && d <= endOfWeek;
  }
  if (mode === 'Mes') return d.getMonth() === monthIdx && d.getFullYear() === year;
  if (mode === 'Año') return d.getFullYear() === year;
  return true;
};

// Genera los puntos (días o semanas) de la gráfica de línea cuando hay un
// rango de fechas personalizado activo — reemplaza los "puntos fijos" que
// se usan para Semana/Mes/Año (que asumen un período estándar).
const buildRangePoints = (dateFrom, dateTo) => {
  const from = new Date(`${dateFrom}T00:00:00`);
  const to = new Date(`${dateTo}T23:59:59.999`);
  const totalDays = Math.max(1, Math.round((to - from) / 86400000) + 1);

  if (totalDays <= 31) {
    // Un punto por día
    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      return { start: new Date(d.setHours(0, 0, 0, 0)), end: new Date(new Date(d).setHours(23, 59, 59, 999)), label: d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }) };
    });
  }

  // Rangos más largos: un punto por semana (Lun–Dom)
  const points = [];
  let cursor = new Date(from);
  while (cursor <= to) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const cappedEnd = weekEnd > to ? to : weekEnd;
    points.push({
      start: new Date(weekStart.setHours(0, 0, 0, 0)),
      end: cappedEnd,
      label: `${weekStart.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}–${cappedEnd.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })}`,
    });
    cursor.setDate(cursor.getDate() + 7);
  }
  return points;
};

// ── Componentes base ───────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-5 ${className}`} style={{ border: '1.5px solid #e5e7eb' }}>{children}</div>
);

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 border border-pink-300 rounded-xl px-3 py-1 text-sm font-medium text-gray-800 bg-white">
        {value}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-pink-300 rounded-2xl shadow z-50 py-1 min-w-full max-h-52 overflow-y-auto">
          {options.map(opt => (
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

const BarTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {words.map((w, i) => <text key={i} x={0} dy={13 + i * 13} textAnchor="middle" fill="#4b5563" fontSize={10}>{w}</text>)}
    </g>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────
export default function ProductionDashboard() {
  const [viewMode, setViewMode] = useState('Todas');
  const [timeView, setTimeView] = useState('Mes');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [barTimeView, setBarTimeView] = useState('Año');

  // ── Filtro de rango de fechas personalizado (arriba, junto al botón de
  // descarga). Cuando ambas fechas están definidas, reemplaza por completo
  // al filtro de Período (Semana/Mes/Año) — tanto en las tarjetas/gráfica
  // de arriba como en la gráfica de procesos de abajo — y también acota lo
  // que se incluye en el reporte de Excel.
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const isCustomRange = !!(dateFrom && dateTo);
  const effectiveTimeView = isCustomRange ? 'Rango' : timeView;
  const effectiveBarTimeView = isCustomRange ? 'Rango' : barTimeView;
  const rangeError = isCustomRange && new Date(dateFrom) > new Date(dateTo);

  // Datos crudos del backend
  const [orders, setOrders] = useState([]);
  const [sedesNames, setSedesNames] = useState([]);
  const [supplies, setSupplies] = useState({ adquisicion: 0, almacenamiento: 0, stock: 0 });

  // ── Carga inicial + polling (solo datos crudos) ───────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [ordersRaw, sedesResult, suppliesResult] = await Promise.all([
          ProductionAPIClient.getOrders({ limit: 1000 }),
          sedesAPI.getAll({ limit: 100, estado: true }),
          supplyAPI.getAll({ estado: true, limit: 1000 }),
        ]);
        if (!mounted) return;
        setOrders(Array.isArray(ordersRaw) ? ordersRaw : []);
        setSedesNames((sedesResult?.data || []).map(s => s.nombre).filter(Boolean));
        const allSupplies = Array.isArray(suppliesResult?.data) ? suppliesResult.data
          : Array.isArray(suppliesResult) ? suppliesResult : [];
        setSupplies({
          adquisicion: allSupplies.filter(s => (s.stock ?? 0) === 0).length,           // sin existencias → pendiente compra
          almacenamiento: allSupplies.length,                                              // total de insumos activos
          stock: allSupplies.reduce((sum, s) => sum + (Number(s.stock) || 0), 0), // sumatoria total de stock
        });
      } catch (e) { console.error('[Dashboard]', e); }
    };
    load();
    const id = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // ── Stats: recalculados al cambiar período ────────────────────
  const monthIdx = MONTHS.indexOf(selectedMonth);

  const { stats, generalStatus } = useMemo(() => {
    if (!orders.length || rangeError) return {
      stats: { current: 0, completedThisMonth: 0, pending: 0, avgTime: '—', periodLabel: '', avgPeriodLabel: '' },
      generalStatus: { delayed: 0, onTrack: 0 },
    };

    const nowMs = Date.now();

    // Etiqueta dinámica del período para el label de "Completadas"
    const periodLabel = isCustomRange
      ? `entre ${new Date(`${dateFrom}T00:00:00`).toLocaleDateString('es-CO')} y ${new Date(`${dateTo}T00:00:00`).toLocaleDateString('es-CO')}`
      : timeView === 'Día' ? 'hoy'
        : timeView === 'Semana' ? 'esta semana'
          : timeView === 'Mes' ? `en ${selectedMonth}`
            : `en ${selectedYear}`;

    // Una orden activa pertenece al período si alguna fecha suya cae en él
    const inPeriodActive = (o) => {
      if (matchPeriod(o.updatedAt, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo)) return true;
      if (matchPeriod(o.createdAt, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo)) return true;
      return (o.historial || []).some(h => matchPeriod(h.fecha, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo));
    };

    // ── Producciones actuales: estado "Producción" con actividad en el período ──
    const current = orders.filter(x => ESTADOS_EN_PRODUCCION.includes(x.estado) && inPeriodActive(x)).length;

    // ── Completadas en el período ──────────────────────────────────────────────
    const completedThisMonth = orders.filter(x => {
      if (x.estado !== 'Enviado') return false;
      const h = (x.historial || []).find(h => h.estado === 'Enviado');
      return matchPeriod(h?.fecha || x.updatedAt, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo);
    }).length;

    // ── Por iniciar: Diseño o Ficha Técnica con actividad en el período ────────
    const pending = orders.filter(x =>
      x.estado && x.estado !== 'Anulada' &&
      ['Diseño', 'Ficha Técnica', 'Ficha tecnica'].includes(x.estado) &&
      inPeriodActive(x)
    ).length;

    // ── Tiempo promedio: período ANTERIOR al seleccionado ─────────────────────
    // Con rango personalizado no existe un "período anterior" bien definido
    // (¿anterior a qué?), así que en ese modo se muestra el promedio DENTRO
    // del propio rango en vez de desplazarlo hacia atrás.
    const prevDone = isCustomRange
      ? orders.filter(x => {
        if (x.estado !== 'Enviado') return false;
        const h = (x.historial || []).find(hh => hh.estado === 'Enviado');
        return matchPeriod(h?.fecha || x.updatedAt, 'Rango', monthIdx, selectedYear, dateFrom, dateTo);
      })
      : orders.filter(x => {
        if (x.estado !== 'Enviado') return false;
        const h = (x.historial || []).find(hh => hh.estado === 'Enviado');
        const d = h?.fecha || x.updatedAt;
        if (timeView === 'Año') return new Date(d || 0).getFullYear() === selectedYear - 1;
        const pm = monthIdx === 0 ? 11 : monthIdx - 1;
        const py = monthIdx === 0 ? selectedYear - 1 : selectedYear;
        return sameMonthYear(d, pm, py);
      });

    // Sin respaldo histórico a propósito: si el período anterior no tiene
    // órdenes 'Enviado', se muestra "—" igual que las demás tarjetas cuando
    // no hay datos en el período, en vez de mezclar un promedio de todo el
    // histórico (que confundía, porque el resto del dashboard sí quedaba en
    // "—" mientras esta tarjeta mostraba un número de meses sin relación).
    const avgDays = calcAvgDays(prevDone);

    const avgPeriodLabel = isCustomRange
      ? 'rango seleccionado'
      : timeView === 'Año'
        ? `${selectedYear - 1}`
        : (() => {
          const pm = monthIdx === 0 ? 11 : monthIdx - 1;
          const py = monthIdx === 0 ? selectedYear - 1 : selectedYear;
          return `${MONTHS[pm]} ${py}`;
        })();

    // ── Retrasos: activas con actividad en el período ─────────────────────────
    const active = orders.filter(x =>
      x.estado && x.estado !== 'Anulada' && x.estado !== 'Enviado' && inPeriodActive(x)
    );
    let delayed = 0, onTrack = 0;
    active.forEach(x => {
      let isDelayed = false;
      const fe = x.deliveryDate || x.fecha_entrega;
      if (fe) { const ms = new Date(fe).getTime(); if (!isNaN(ms) && nowMs > ms) isDelayed = true; }
      if (!isDelayed && ESTADOS_EN_PRODUCCION.includes(x.estado) && (x.asignaciones || []).length > 0) {
        const entrada = (x.historial || []).find(h => ESTADOS_EN_PRODUCCION.includes(h.estado));
        const fechaEntrada = entrada?.fecha || x.updatedAt;
        if (fechaEntrada) {
          const dias = Math.round((nowMs - new Date(fechaEntrada).getTime()) / 86400000);
          if (dias > 17) isDelayed = true;
        }
      }
      isDelayed ? delayed++ : onTrack++;
    });

    return {
      stats: { current, completedThisMonth, pending, avgTime: avgDays !== null ? `${avgDays}d` : '—', periodLabel, avgPeriodLabel },
      generalStatus: { delayed, onTrack },
    };
  }, [orders, timeView, monthIdx, selectedYear, selectedMonth, isCustomRange, effectiveTimeView, dateFrom, dateTo, rangeError]);

  // ✅ Fix: las barras de "Estado general de producción" tenían alturas
  // fijas en el JSX (h-2 y h-30 — esta última ni siquiera es una clase
  // válida de Tailwind, el spacing scale salta de h-28 a h-32, así que
  // esa barra quedaba en 0px). Ninguna reflejaba generalStatus.delayed/
  // onTrack, por eso el gráfico nunca se movía. Ahora la altura se calcula
  // en px, proporcional al valor más alto entre ambas barras.
  const GENERAL_BAR_MAX_PX = 140;
  const generalMaxVal = Math.max(generalStatus.delayed, generalStatus.onTrack, 1);
  const delayedBarPx = generalStatus.delayed > 0
    ? Math.max(6, Math.round((generalStatus.delayed / generalMaxVal) * GENERAL_BAR_MAX_PX))
    : 4;
  const onTrackBarPx = generalStatus.onTrack > 0
    ? Math.max(6, Math.round((generalStatus.onTrack / generalMaxVal) * GENERAL_BAR_MAX_PX))
    : 4;

  const lineData = useMemo(() => {
    if (!orders.length || rangeError) return [];

    // Para cada punto temporal, calculamos:
    // - Por cada sede: suma de productos (detalles.cantidad) de órdenes cuya fecha de referencia cae en ese punto
    // - Terceros: cantidad de órdenes con asignaciones activas cuya fecha cae en ese punto
    //
    // La "fecha de referencia" de una orden es la fecha de su última entrada en historial
    // (momento en que se actualizó por última vez), o updatedAt como fallback.

    const refDate = (o) => {
      const last = (o.historial || []).slice(-1)[0];
      const d = last?.fecha || o.updatedAt || o.createdAt;
      return d ? new Date(d) : null;
    };

    // ── Rango personalizado: un punto por día (o por semana si el rango es
    // largo), en vez de los puntos fijos de Semana/Mes/Año ──────────────────
    if (isCustomRange) {
      const rangePoints = buildRangePoints(dateFrom, dateTo);
      return rangePoints.map(({ start, end, label }) => {
        const point = { label };
        sedesNames.forEach(name => { point[name] = 0; });
        point.terceros = 0;

        orders.forEach(o => {
          const d = refDate(o);
          if (!d || d < start || d > end) return;

          const qty = totalProductos(o);
          if ((o.asignaciones || []).length > 0) point.terceros += qty || 1;

          const ORDEN_TERMINADA = ['Empaque', 'Enviado'];
          const asigsSede = o.sedeAsignaciones || o.sede_asignaciones || [];
          if (ORDEN_TERMINADA.includes(o.estado) && asigsSede.length > 0) {
            asigsSede.forEach(a => {
              if (sedesNames.includes(a.option)) point[a.option] = (point[a.option] || 0) + (Number(a.cantidad) || 0);
            });
          } else if (ORDEN_TERMINADA.includes(o.estado) && sedesNames.length > 0) {
            const perSede = Math.round(qty / sedesNames.length) || 1;
            sedesNames.forEach(name => { point[name] = (point[name] || 0) + perSede; });
          }
        });

        return point;
      });
    }

    const matchPoint = (d, pointIndex) => {
      if (!d) return false;
      if (timeView === 'Año') return d.getMonth() === pointIndex && d.getFullYear() === selectedYear;
      if (timeView === 'Mes') return Math.ceil(d.getDate() / 7) === pointIndex + 1 && d.getMonth() === monthIdx && d.getFullYear() === new Date().getFullYear();
      if (timeView === 'Semana') {
        const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
        return dow === pointIndex && d.getMonth() === monthIdx && d.getFullYear() === selectedYear;
      }
      return false;
    };

    let points, labels;
    if (timeView === 'Año') {
      points = MONTHS.length; labels = MONTHS.map(m => m.slice(0, 3));
    } else if (timeView === 'Mes') {
      points = 4; labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    } else {
      points = 7; labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    }

    return Array.from({ length: points }, (_, i) => {
      const point = { label: labels[i] };
      // Por cada sede: suma de productos de órdenes en ese punto temporal
      sedesNames.forEach(name => { point[name] = 0; });
      // Terceros: órdenes con asignaciones en ese punto
      point.terceros = 0;

      orders.forEach(o => {
        const d = refDate(o);
        if (!matchPoint(d, i)) return;

        const qty = totalProductos(o);

        // Terceros: orden tiene asignaciones activas
        if ((o.asignaciones || []).length > 0) {
          point.terceros += qty || 1; // si no hay detalles, contar la orden
        }

        // Sedes: distribuimos los productos entre las sedes según sedeAsignaciones,
        // SOLO contando órdenes que ya terminaron su producción (Empaque o Enviado).
        // Antes se contaba en cualquier estado, lo cual no refleja "al terminar la orden".
        const ORDEN_TERMINADA = ['Empaque', 'Enviado'];
        const asigsSede = o.sedeAsignaciones || o.sede_asignaciones || [];
        if (ORDEN_TERMINADA.includes(o.estado) && asigsSede.length > 0) {
          asigsSede.forEach(a => {
            if (sedesNames.includes(a.option)) {
              point[a.option] = (point[a.option] || 0) + (Number(a.cantidad) || 0);
            }
          });
        } else if (ORDEN_TERMINADA.includes(o.estado) && sedesNames.length > 0) {
          // Fallback: la orden terminó pero no tiene sedeAsignaciones registrada
          // (órdenes antiguas) — repartir por igual entre sedes
          const perSede = Math.round(qty / sedesNames.length) || 1;
          sedesNames.forEach(name => { point[name] = (point[name] || 0) + perSede; });
        }
      });

      return point;
    });
  }, [orders, sedesNames, timeView, selectedMonth, selectedYear, monthIdx, isCustomRange, dateFrom, dateTo, rangeError]);

  // ── Barras: recalculadas al cambiar período de barras ─────────
  const barData = useMemo(() => {
    const counts = Object.fromEntries(BAR_PROCESSES.map(p => [p, 0]));
    if (rangeError) return BAR_PROCESSES.map(name => ({ name, value: 0 }));
    orders.forEach(o => {
      if (!o.estado) return;
      const d = orderDate(o);
      if (!matchPeriod(d, effectiveBarTimeView, monthIdx, selectedYear, dateFrom, dateTo)) return;
      const proceso = ESTADO_TO_PROCESO[o.estado];
      if (proceso) counts[proceso]++;
    });
    return BAR_PROCESSES.map(name => ({ name, value: counts[name] }));
  }, [orders, barTimeView, monthIdx, selectedYear, isCustomRange, effectiveBarTimeView, dateFrom, dateTo, rangeError]);

  const showTerceros = viewMode === 'Todas' || viewMode === 'Terceros';

  // ── Órdenes que caen dentro del filtro activo (rango personalizado si está
  // definido, si no el período de arriba "timeView") — es lo que se exporta
  // en el reporte de Excel, para que el archivo refleje exactamente lo que
  // se está viendo en pantalla.
  const filteredOrdersForExport = useMemo(() => {
    if (rangeError) return [];
    return orders.filter((o) => {
      if (matchPeriod(o.updatedAt, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo)) return true;
      if (matchPeriod(o.createdAt, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo)) return true;
      return (o.historial || []).some(h => matchPeriod(h.fecha, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo));
    });
  }, [orders, effectiveTimeView, monthIdx, selectedYear, dateFrom, dateTo, rangeError]);

  const [downloadingExcel, setDownloadingExcel] = useState(false);

  /* ══════════════════════════════════════════════════════════════════════
   * DESCARGA EXCEL — mismo estilo (ExcelJS + paleta magenta + logo
   * Putongas) que el resto de reportes del sistema (ver ProductionPage.jsx).
   * Incluye: resumen de KPIs del período/rango activo, desglose por
   * proceso, y el detalle de las órdenes incluidas en ese filtro.
   * ══════════════════════════════════════════════════════════════════════ */
  const handleDownloadExcel = async () => {
    if (rangeError || downloadingExcel) return;
    setDownloadingExcel(true);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = 'UniStock';
      wb.created = new Date();

      const ARGB = (hex) => 'FF' + hex.replace('#', '').toUpperCase();
      const fillSolid = (hex) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB(hex) } });
      const thinBorder = (hex = '#FF4FD6') => {
        const c = { style: 'thin', color: { argb: ARGB(hex) } };
        return { top: c, bottom: c, left: c, right: c };
      };
      const now = new Date();
      const fechaGeneracion = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
      const periodoTexto = isCustomRange
        ? `${new Date(`${dateFrom}T00:00:00`).toLocaleDateString('es-CO')} — ${new Date(`${dateTo}T00:00:00`).toLocaleDateString('es-CO')}`
        : (timeView === 'Semana' ? `${selectedMonth} ${selectedYear} (semana actual)`
          : timeView === 'Mes' ? `${selectedMonth} ${selectedYear}`
            : `Año ${selectedYear}`);

      let logoImageId = null;
      try {
        const logoRes = await fetch(putongasLogoUrl);
        const logoBlob = await logoRes.blob();
        const logoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(logoBlob);
        });
        logoImageId = wb.addImage({ base64: logoBase64, extension: 'png' });
      } catch (e) {
        console.warn('[Dashboard] No se pudo cargar el logo para el Excel:', e);
      }

      /* ── Hoja 1: Resumen ── */
      const wsResumen = wb.addWorksheet('Resumen', { pageSetup: { orientation: 'landscape', fitToPage: true } });
      wsResumen.columns = [{ key: 'a', width: 30 }, { key: 'b', width: 20 }, { key: 'c', width: 20 }, { key: 'd', width: 20 }];

      if (logoImageId) wsResumen.addImage(logoImageId, { tl: { col: 0.15, row: 0.15 }, ext: { width: 46, height: 60 } });

      wsResumen.mergeCells('B1:D1');
      wsResumen.getRow(1).height = 30;
      wsResumen.getCell('B1').value = 'Dashboard de Producción — Sistema de Gestión UniStock';
      wsResumen.getCell('B1').font = { name: 'Arial', size: 15, bold: true, color: { argb: '000000' } };
      wsResumen.getCell('B1').alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      ['A1', 'B1', 'C1', 'D1'].forEach(ref => { wsResumen.getCell(ref).fill = fillSolid('#FFFFFF'); });

      wsResumen.mergeCells('B2:D2');
      wsResumen.getRow(2).height = 18;
      wsResumen.getCell('B2').value = `Generado el ${fechaGeneracion}  ·  Período: ${periodoTexto}`;
      wsResumen.getCell('B2').font = { name: 'Arial', size: 10, color: { argb: '#000000' } };
      wsResumen.getCell('B2').alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      ['A2', 'B2', 'C2', 'D2'].forEach(ref => { wsResumen.getCell(ref).fill = fillSolid('#FFFFFF'); });
      wsResumen.getCell('B2').border = { bottom: { style: 'thin', color: { argb: ARGB('#FF4FD6') } } };

      wsResumen.getRow(3).height = 6;
      ['A3', 'B3', 'C3', 'D3'].forEach(ref => { wsResumen.getCell(ref).fill = fillSolid('#ffffff'); });

      // Tabla de KPIs
      const kpiHeaderRow = wsResumen.getRow(4);
      kpiHeaderRow.height = 24;
      ['Indicador', 'Valor', '', ''].forEach((h, i) => {
        const cell = kpiHeaderRow.getCell(i + 1);
        cell.value = h;
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: ARGB('#FF4FD6') } };
        cell.fill = fillSolid('#FFFFFF');
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        const pinkThin = { style: 'thin', color: { argb: ARGB('#FF4FD6') } };
        cell.border = { top: pinkThin, left: pinkThin, right: pinkThin, bottom: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };
      });

      const kpiRows = [
        ['Producciones actuales', stats.current || 0],
        [stats.periodLabel ? `Completadas ${stats.periodLabel}` : 'Completadas', stats.completedThisMonth || 0],
        ['Por iniciar', stats.pending || 0],
        [stats.avgPeriodLabel ? `Tiempo promedio (${stats.avgPeriodLabel})` : 'Tiempo promedio', stats.avgTime || '—'],
        ['Producciones con retraso', generalStatus.delayed || 0],
        ['Producciones en orden', generalStatus.onTrack || 0],
        ['Total de órdenes en el período', filteredOrdersForExport.length],
      ];
      kpiRows.forEach((vals, i) => {
        const row = wsResumen.getRow(5 + i);
        row.height = 20;
        vals.forEach((v, ci) => {
          const cell = row.getCell(ci + 1);
          cell.value = v;
          cell.fill = fillSolid('#FFFFFF');
          cell.border = thinBorder();
          cell.alignment = { horizontal: ci === 1 ? 'right' : 'left', vertical: 'middle', indent: ci === 1 ? 0 : 1 };
          cell.font = ci === 1
            ? { name: 'Arial', size: 10, bold: true, color: { argb: ARGB('#a858d6') } }
            : { name: 'Arial', size: 10, color: { argb: 'FF374151' } };
        });
      });

      // Tabla de procesos (barData) debajo de los KPIs
      const procTitleRowIdx = 5 + kpiRows.length + 1;
      wsResumen.mergeCells(`A${procTitleRowIdx}:D${procTitleRowIdx}`);
      wsResumen.getCell(`A${procTitleRowIdx}`).value = 'Órdenes por proceso';
      wsResumen.getCell(`A${procTitleRowIdx}`).font = { name: 'Arial', size: 12, bold: true, color: { argb: '000000' } };
      wsResumen.getCell(`A${procTitleRowIdx}`).fill = fillSolid('#FFFFFF');
      wsResumen.getCell(`A${procTitleRowIdx}`).alignment = { indent: 1 };

      const procHeaderRowIdx = procTitleRowIdx + 1;
      const procHeaderRow = wsResumen.getRow(procHeaderRowIdx);
      procHeaderRow.height = 22;
      ['Proceso', 'Cantidad', '', ''].forEach((h, i) => {
        const cell = procHeaderRow.getCell(i + 1);
        cell.value = h;
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: ARGB('#FF4FD6') } };
        cell.fill = fillSolid('#FFFFFF');
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        const pinkThin = { style: 'thin', color: { argb: ARGB('#FF4FD6') } };
        cell.border = { top: pinkThin, left: pinkThin, right: pinkThin, bottom: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };
      });
      barData.forEach((p, i) => {
        const row = wsResumen.getRow(procHeaderRowIdx + 1 + i);
        row.height = 18;
        [p.name, p.value].forEach((v, ci) => {
          const cell = row.getCell(ci + 1);
          cell.value = v;
          cell.fill = fillSolid('#FFFFFF');
          cell.border = thinBorder();
          cell.alignment = { horizontal: ci === 1 ? 'right' : 'left', vertical: 'middle', indent: ci === 1 ? 0 : 1 };
          cell.font = { name: 'Arial', size: 10, color: { argb: 'FF374151' } };
        });
      });

      /* ── Hoja 2: Órdenes (detalle) ── */
      const wsOrdenes = wb.addWorksheet('Órdenes', { pageSetup: { orientation: 'landscape', fitToPage: true } });
      wsOrdenes.columns = [
        { key: 'orden', width: 10 },
        { key: 'producto', width: 30 },
        { key: 'cliente', width: 24 },
        { key: 'estado', width: 16 },
        { key: 'cantidad', width: 12 },
        { key: 'fecha', width: 16 },
      ];
      const ordHeaderRow = wsOrdenes.getRow(1);
      ordHeaderRow.height = 24;
      ['Orden', 'Producto', 'Cliente', 'Estado', 'Cantidad', 'Fecha'].forEach((h, i) => {
        const cell = ordHeaderRow.getCell(i + 1);
        cell.value = h;
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: ARGB('#FF4FD6') } };
        cell.fill = fillSolid('#FFFFFF');
        cell.alignment = { horizontal: i === 4 ? 'right' : 'left', vertical: 'middle', indent: i === 4 ? 0 : 1 };
        const pinkThin = { style: 'thin', color: { argb: ARGB('#FF4FD6') } };
        cell.border = { top: pinkThin, left: pinkThin, right: pinkThin, bottom: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };
      });
      filteredOrdersForExport.forEach((o, i) => {
        const row = wsOrdenes.getRow(2 + i);
        row.height = 20;
        const fecha = orderDate(o);
        const values = [
          `#${o.orderNumber || o.numero_orden || ''}`,
          o.producto || o.referencia || '—',
          o.client || o.cliente || '—',
          o.estado || o.status || '—',
          totalProductos(o),
          fecha ? new Date(fecha).toLocaleDateString('es-CO') : '—',
        ];
        values.forEach((v, ci) => {
          const cell = row.getCell(ci + 1);
          cell.value = v;
          cell.fill = fillSolid('#FFFFFF');
          cell.border = thinBorder();
          cell.alignment = { horizontal: ci === 4 ? 'right' : 'left', vertical: 'middle', indent: ci === 4 ? 0 : 1 };
          cell.font = { name: 'Arial', size: 10, color: { argb: 'FF374151' } };
        });
        row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: ARGB('#FF4FD6') } };
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const suffix = isCustomRange ? `${dateFrom}_a_${dateTo}` : `${(timeView || '').toLowerCase()}`;
      link.download = `dashboard-produccion-${suffix}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[Dashboard] Error generando el Excel:', e);
    } finally {
      setDownloadingExcel(false);
    }
  };

  const GlobalTimeFilter = () => (
    <div className="flex items-center gap-2">
      {timeView === 'Semana' && <>
        <Dropdown value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} />
        <Dropdown value={selectedYear} options={YEARS} onChange={setSelectedYear} />
      </>}
      {timeView === 'Mes' && <Dropdown value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} />}
      {timeView === 'Año' && <Dropdown value={selectedYear} options={YEARS} onChange={setSelectedYear} />}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5">
        {['Semana', 'Mes', 'Año'].map(p => (
          <button key={p} onClick={() => setTimeView(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timeView === p ? 'bg-fuchsia-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-5" >
      {/* ✅ Fix: fondo neutro unificado con el resto de la app — antes tenía
          un tinte rosado (#fdf6fc) que no coincidía con ningún otro módulo */}

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a', margin: '0' }}>Dashboard</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* ── Filtro de rango de fechas ──
              Al llenar ambas fechas, reemplaza automáticamente al filtro de
              Período (Semana/Mes/Año) en todas las tarjetas y gráficas. */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
            <span className="text-xs text-gray-500 font-medium pl-1">Del</span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs text-gray-800 border-none outline-none bg-transparent"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-xs text-gray-500 font-medium">al</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs text-gray-800 border-none outline-none bg-transparent"
              style={{ colorScheme: 'light' }}
            />
            {isCustomRange && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                title="Quitar filtro de fechas"
                className="text-gray-400 hover:text-fuchsia-600 px-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>

          <span className="text-sm text-gray-500 font-medium">Período:</span>
          <div style={isCustomRange ? { opacity: 0.4, pointerEvents: 'none' } : undefined} title={isCustomRange ? 'Deshabilitado mientras haya un rango de fechas activo' : undefined}>
            <GlobalTimeFilter />
          </div>

          {/* ── Botón de descarga de reporte Excel ── */}
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel || rangeError}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: '#FF4FD6', opacity: (downloadingExcel || rangeError) ? 0.6 : 1, cursor: (downloadingExcel || rangeError) ? 'not-allowed' : 'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloadingExcel ? 'Generando...' : 'Descargar reporte'}
          </button>
        </div>
      </div>
      {rangeError && (
        <div className="mb-4 px-4 py-2 rounded-xl text-xs font-medium" style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca' }}>
          La fecha "Del" no puede ser posterior a la fecha "al". Corrige el rango para ver los datos.
        </div>
      )}

      {/* Fila 1: Stats */}
      <Card className="mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-4">Estado general de producción</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: 'Producciones actuales', value: stats.current || '—',
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
              color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200'
            },
            {
              label: stats.periodLabel ? `Completadas ${stats.periodLabel}` : 'Completadas', value: stats.completedThisMonth || '—',
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>,
              color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200'
            },
            {
              label: 'Por iniciar', value: stats.pending || '—',
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
              color: 'text-pink-600 bg-pink-50 border-pink-200'
            },
            {
              label: stats.avgPeriodLabel ? `Tiempo promedio (${stats.avgPeriodLabel})` : 'Tiempo promedio', value: stats.avgTime || '—',
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
              color: 'text-pink-500 bg-pink-50 border-pink-200'
            },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-xl px-4 py-3 bg-white" style={{ border: '1.5px solid #e5e7eb' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${color}`}>{icon}</div>
                <p className="text-xs font-medium text-gray-700">{label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Fila 2: gráfica + panel */}
      <div className="flex gap-4 mb-4">
        <Card className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Producción en las sedes</h2>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Último mes</span>
              <button onClick={() => setViewMode('Todas')}
                className={`px-3 py-0.5 rounded-full text-sm font-medium border transition-colors ${viewMode === 'Todas' ? 'bg-fuchsia-500 text-white border-fuchsia-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                Todas
              </button>
              <button onClick={() => setViewMode('Terceros')}
                className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium bg-white border transition-colors ${viewMode === 'Terceros' ? 'border-green-400 text-gray-800' : 'border-gray-200 text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 10 10"><polygon points="5,0 10,10 0,10" fill="#22c55e" /></svg>
                Terceros
              </button>
              {sedesNames.map((name, i) => (
                <button key={name} onClick={() => setViewMode(name)}
                  className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-medium bg-white border transition-colors ${viewMode === name ? 'border-gray-400 text-gray-800' : 'border-gray-200 text-gray-600'}`}>
                  <span className="w-3 h-3 inline-block rounded-sm" style={{ background: SEDE_COLORS[i % SEDE_COLORS.length] }} />
                  {name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Período: <span className="font-semibold text-fuchsia-600">
                {isCustomRange
                  ? `${new Date(`${dateFrom}T00:00:00`).toLocaleDateString('es-CO')} – ${new Date(`${dateTo}T00:00:00`).toLocaleDateString('es-CO')}`
                  : timeView === 'Semana' ? `${selectedMonth} ${selectedYear} — por semana` :
                    timeView === 'Mes' ? `${selectedMonth} ${selectedYear}` : `Año ${selectedYear}`}
              </span></span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F5D8F5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false}
                label={{ value: 'Órdenes de producción', angle: -90, position: 'insideLeft', dx: 10, style: { fontSize: 10, fill: '#d946ef', textAnchor: 'middle' } }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #fce7f3', fontSize: 12, color: '#111827' }} />
              {showTerceros && <Line type="monotone" dataKey="terceros" stroke="#22c55e" strokeWidth={2} dot={false} name="Terceros" />}
              {sedesNames.map((name, i) =>
                (viewMode === 'Todas' || viewMode === name)
                  ? <Line key={name} type="monotone" dataKey={name} stroke={SEDE_COLORS[i % SEDE_COLORS.length]} strokeWidth={i === 0 ? 2 : 1.5} dot={false} name={name} />
                  : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="w-72 flex flex-col gap-4">
          <Card className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Estado general de producción</h3>
            <div className="flex items-end justify-around h-48">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold">{generalStatus.delayed}</span>
                <div className="w-10 rounded-lg bg-pink-300" style={{ height: delayedBarPx, transition: 'height 0.3s ease' }} />
                <p className="text-xs text-center text-gray-700 font-medium mt-1">Producciones<br />con retraso</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold">{generalStatus.onTrack}</span>
                <div className="w-10 rounded-lg bg-green-400" style={{ height: onTrackBarPx, transition: 'height 0.3s ease' }} />
                <p className="text-xs text-center text-gray-700 font-medium mt-1">Todo en<br />orden</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">Insumos</h3>
            <div className="space-y-3">

              {/* Por adquisición */}
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
                  <div>
                    <span className="text-sm font-medium text-gray-800 block">Por adquisición</span>
                    <span className="text-xs text-gray-400">Pendientes de compra</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-px bg-pink-200 inline-block" />
                  <span className={`text-sm font-bold ${supplies.adquisicion > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {supplies.adquisicion}
                  </span>
                </div>
              </div>

              {/* Almacenamiento */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="15" viewBox="0 0 44 27" fill="none">
                      <path d="M39.6436 0.607422H3.86044C2.06385 0.607422 0.607422 1.47356 0.607422 2.542V23.8224C0.607422 24.8908 2.06385 25.757 3.86044 25.757H39.6436C41.4402 25.757 42.8966 24.8908 42.8966 23.8224V2.542C42.8966 1.47356 41.4402 0.607422 39.6436 0.607422Z" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M28.2572 0.607422V10.2803C28.2572 10.5369 28.0858 10.7829 27.7808 10.9643C27.4757 11.1457 27.062 11.2476 26.6307 11.2476H16.8716C16.4402 11.2476 16.0265 11.1457 15.7215 10.9643C15.4165 10.7829 15.2451 10.5369 15.2451 10.2803V0.607422" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M26.6318 20.9194H34.7644" stroke="#e040b8" strokeWidth="1.21519" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800 block">Almacenamiento</span>
                    <span className="text-xs text-gray-400">Total de insumos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-px bg-pink-200 inline-block" />
                  <span className="text-sm font-bold text-gray-900">{supplies.almacenamiento}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-500 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="17" viewBox="0 0 48 31" fill="none">
                      <path d="M43.0099 7.76605H33.2673V6.61077C33.2673 2.95238 29.6238 0 25.1089 0H22.8119C18.297 0 14.6535 2.95238 14.6535 6.61077V7.76605H4.9901C2.29703 7.76605 0 9.56315 0 11.8095V26.9565C0 29.1387 2.21782 31 4.9901 31H43.0099C45.703 31 48 29.2029 48 26.9565V11.7453C48 9.56315 45.703 7.76605 43.0099 7.76605ZM18.297 6.61077C18.297 4.55694 20.3564 2.8882 22.8911 2.8882H25.1881C27.7228 2.8882 29.7822 4.55694 29.7822 6.61077V7.76605H18.297V6.61077ZM4.9901 10.6542H43.0099C43.802 10.6542 44.4356 11.1677 44.4356 11.8095V15.4037H39.7624V14.1843C39.7624 13.4141 38.9703 12.7081 37.9406 12.7081C36.9109 12.7081 36.1188 13.3499 36.1188 14.1843V15.4037H11.8812V14.1843C11.8812 13.4141 11.0891 12.7081 10.0594 12.7081C9.0297 12.7081 8.23762 13.3499 8.23762 14.1843V15.4037H3.64356V11.8095C3.64356 11.1677 4.19802 10.6542 4.9901 10.6542ZM43.0099 28.0476H4.9901C4.19802 28.0476 3.56436 27.5342 3.56436 26.8923V18.2277H8.23762V19.4472C8.23762 20.2174 9.0297 20.9234 10.0594 20.9234C11.0891 20.9234 11.8812 20.2816 11.8812 19.4472V18.2277H36.1188V19.4472C36.1188 20.2174 36.9109 20.9234 37.9406 20.9234C38.9703 20.9234 39.7624 20.2816 39.7624 19.4472V18.2277H44.4356V26.8923C44.4356 27.5342 43.802 28.0476 43.0099 28.0476Z" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blanck block">Stock</span>
                    <span className="text-xs" style={{ color: '#f5d0fe' }}>Unidades totales</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 h-px bg-pink-200 inline-block" />
                  <span className="text-sm font-bold text-gray-900">
                    {supplies.stock.toLocaleString('es-CO')}
                  </span>
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Período: <span className="font-semibold text-fuchsia-600">
              {isCustomRange
                ? `${new Date(`${dateFrom}T00:00:00`).toLocaleDateString('es-CO')} – ${new Date(`${dateTo}T00:00:00`).toLocaleDateString('es-CO')}`
                : barTimeView === 'Día' ? 'Hoy' : barTimeView === 'Mes' ? `${selectedMonth} ${selectedYear}` : `Año ${selectedYear}`}
            </span></span>
            <div style={isCustomRange ? { opacity: 0.4, pointerEvents: 'none' } : undefined} title={isCustomRange ? 'Deshabilitado mientras haya un rango de fechas activo' : undefined}>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5 ml-2">
                {['Día', 'Mes', 'Año'].map(p => (
                  <button key={p} onClick={() => setBarTimeView(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${barTimeView === p ? 'bg-fuchsia-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex mb-4 pl-14 pr-2">
          {barIconKeys.map(name => (
            <div key={name} className="flex-1 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={barIcons[name]} />
              </svg>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="2 4" stroke="#F5D8F5" vertical={false} />
            <XAxis dataKey="name" tick={<BarTick />} axisLine={false} tickLine={false} interval={0} />
            <YAxis domain={[0, 55]} ticks={[0, 15, 30, 45, 60]} tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false}
              label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', dx: -2, style: { fontSize: 10, fill: '#d946ef', textAnchor: 'middle' } }} />
            <Tooltip formatter={v => [v, 'Cantidad']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 11, fill: '#374151', fontWeight: 600 }}>
              {barData.map((entry, i) => {
                const limit = barTimeView === 'Día' ? 10 : barTimeView === 'Mes' ? 24 : 38;
                return <Cell key={i} fill={entry.value >= limit ? '#E8B4E8' : '#7BE87B'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-center text-sm font-bold mt-1" style={{ color: '#c026d3' }}>Procesos</p>
        <div className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50">
          <div className="w-5 h-5 rounded-md shrink-0" style={{ background: '#E8B4E8', border: '1.5px solid #d946ef' }} />
          <p className="text-xs text-fuchsia-700 font-medium">
            Los procesos en <span className="font-bold">rosa</span> superan el límite del período (día ≥ 10 · mes ≥ 24 · año ≥ 38). Pueden requerir atención de capacidad.
          </p>
        </div>
      </Card>
    </div>
  );
}