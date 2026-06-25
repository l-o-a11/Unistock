/**
 * @file components/ProductionToolbar/index.jsx
 *
 * Barra de herramientas completa para la página "Orden de producción".
 * Incluye:
 *  - Tabs: Producciones / Terceros
 *  - Filtros: Estado, Cliente, Rango de fechas
 *  - Contador de resultados + Limpiar filtros
 *  - Botones: Agregar, Descargar (PDF/Excel), Calendario
 *  - Buscador global (esquina superior derecha)
 *
 * Props:
 *  activeTab         'producciones' | 'terceros'
 *  onTabChange       (tab) => void
 *  statusFilter      string   — valor del select de estado
 *  onStatusChange    (val) => void
 *  clientFilter      string   — valor del select de cliente
 *  onClientChange    (val) => void
 *  clients           string[] — lista de nombres de clientes
 *  dateFrom          string   — fecha inicio (YYYY-MM-DD)
 *  onDateFromChange  (val) => void
 *  dateTo            string   — fecha fin   (YYYY-MM-DD)
 *  onDateToChange    (val) => void
 *  resultCount       number   — cuántos resultados muestra la tabla
 *  hasActiveFilters  boolean  — true si hay algún filtro activo
 *  onClearFilters    () => void
 *  onAdd             () => void
 *  onDownloadPDF     () => void
 *  onDownloadExcel   () => void
 *  onCalendar        () => void  — navega al calendario
 *  searchQuery       string
 *  onSearchChange    (val) => void
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Paleta ────────────────────────────────────────────────────────────────
const PINK   = '#FF4FD6';
const PINK_S = '#fdf2f8';

// ─── Íconos ────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconX = ({ size = 14, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconFilePDF = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <text x="7" y="19" fontSize="6" fontWeight="800" fill="currentColor"
      stroke="none" fontFamily="sans-serif">PDF</text>
  </svg>
);

const IconFileXLS = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <text x="6" y="19" fontSize="5.5" fontWeight="800" fill="currentColor"
      stroke="none" fontFamily="sans-serif">XLS</text>
  </svg>
);

// ─── Dropdown de descarga ───────────────────────────────────────────────────
const DownloadDropdown = ({ onDownloadPDF, onDownloadExcel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        title="Descargar"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: 10,
          border: '1.5px solid #e5e7eb', background: '#fff',
          color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = PINK; e.currentTarget.style.color = PINK; e.currentTarget.style.background = PINK_S; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = '#fff'; }}
      >
        <IconDownload />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0, zIndex: 200,
          background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
          border: '1px solid #f0f0f0', minWidth: 160, overflow: 'hidden',
        }}>
          {/* PDF */}
          <button
            onClick={() => { onDownloadPDF?.(); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px',
              border: 'none', background: 'transparent',
              fontSize: 13, color: '#374151', cursor: 'pointer',
              fontWeight: 600, textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fdf4ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: '#ef4444' }}><IconFilePDF /></span>
            Descargar PDF
          </button>

          {/* Excel */}
          <button
            onClick={() => { onDownloadExcel?.(); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 16px',
              border: 'none', background: 'transparent',
              fontSize: 13, color: '#374151', cursor: 'pointer',
              fontWeight: 600, textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fdf4ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: '#16a34a' }}><IconFileXLS /></span>
            Descargar Excel
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Estilos compartidos ────────────────────────────────────────────────────
const selectStyle = {
  padding: '7px 30px 7px 12px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  fontSize: 13,
  color: '#374151',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  minWidth: 130,
  height: 38,
  boxSizing: 'border-box',
};

const dateInputStyle = {
  padding: '7px 10px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  fontSize: 13,
  color: '#374151',
  background: '#fff',
  outline: 'none',
  height: 38,
  boxSizing: 'border-box',
  width: 130,
};

// ─── Constantes ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  'Todos los estados',
  'Diseño',
  'Ficha Técnica',
  'Corte',
  'Compras',
  'Producción',
  'Recepción', // ✅ Fix: antes "Empaque"
  'Enviado',
  'Anulada',
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
const ProductionToolbar = ({
  // Tabs
  activeTab        = 'producciones',
  onTabChange,
  // Filtros
  statusFilter     = '',
  onStatusChange,
  clientFilter     = '',
  onClientChange,
  clients          = [],
  dateFrom         = '',
  onDateFromChange,
  dateTo           = '',
  onDateToChange,
  // Resultados
  resultCount      = 0,
  hasActiveFilters = false,
  onClearFilters,
  // Acciones
  onAdd,
  onDownloadPDF,
  onDownloadExcel,
  onCalendar,
  // Búsqueda global
  searchQuery      = '',
  onSearchChange,
}) => {
  const navigate = useNavigate();

  const handleCalendar = () => {
    if (onCalendar) onCalendar();
    else navigate('/layout/produccion/calendario');
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>

      {/* ── FILA 1: Título + Búsqueda global ─────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, gap: 16, flexWrap: 'wrap',
      }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1f2937' }}>
          Orden de producción
        </h1>

        {/* Buscador global */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1.5px solid #e5e7eb', borderRadius: 12,
          padding: '8px 14px', background: '#fff',
          width: 260, boxSizing: 'border-box',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = PINK}
          onBlurCapture={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <IconSearch />
          <input
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            style={{
              border: 'none', outline: 'none',
              fontSize: 13, color: '#374151',
              background: 'transparent', width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <IconX size={12} color="#9ca3af" />
            </button>
          )}
        </div>
      </div>

      {/* ── FILA 2: Tabs ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['producciones', 'terceros'].map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              style={{
                padding: '9px 20px',
                borderRadius: 10,
                border: isActive ? 'none' : '1.5px solid #e5e7eb',
                background: isActive ? PINK : '#fff',
                color: isActive ? '#fff' : '#6b7280',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 4px 14px rgba(255,79,214,0.35)' : 'none',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ── FILA 3: Barra de filtros + Acciones ──────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap',
        background: '#fff',
        borderRadius: 14,
        padding: '12px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        marginBottom: 16,
      }}>

        {/* ─ Lado izquierdo: filtros ─ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

          {/* Select Estado */}
          <select
            value={statusFilter}
            onChange={e => onStatusChange?.(e.target.value)}
            style={selectStyle}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s === 'Todos los estados' ? '' : s}>
                {s === 'Todos los estados' ? s : s}
              </option>
            ))}
          </select>

          {/* Select Cliente */}
          <select
            value={clientFilter}
            onChange={e => onClientChange?.(e.target.value)}
            style={{ ...selectStyle, minWidth: 150 }}
          >
            <option value="">Cliente: Todos</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Rango de fechas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Fecha desde */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute', left: 10, pointerEvents: 'none', color: '#9ca3af',
              }}>
                <IconCalendar />
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => onDateFromChange?.(e.target.value)}
                style={{ ...dateInputStyle, paddingLeft: 32 }}
              />
            </div>

            {/* Flecha separadora */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>

            {/* Fecha hasta */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute', left: 10, pointerEvents: 'none', color: '#9ca3af',
              }}>
                <IconCalendar />
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={e => onDateToChange?.(e.target.value)}
                style={{ ...dateInputStyle, paddingLeft: 32 }}
              />
            </div>
          </div>

          {/* Contador de resultados */}
          {hasActiveFilters && (
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: PINK,
              whiteSpace: 'nowrap',
            }}>
              {resultCount} resultado{resultCount !== 1 ? 's' : ''}
            </span>
          )}

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                border: '1.5px solid #fecaca',
                background: '#fff5f5',
                color: '#ef4444',
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; }}
            >
              <IconX size={12} color="#ef4444" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ─ Lado derecho: acciones ─ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Botón Agregar */}
          <button
            onClick={onAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 10,
              border: 'none', background: PINK, color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,79,214,0.35)',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.92)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <IconPlus />
            Agregar
          </button>

          {/* Botón Descargar (PDF / Excel) */}
          <DownloadDropdown
            onDownloadPDF={onDownloadPDF}
            onDownloadExcel={onDownloadExcel}
          />

          {/* Botón Calendario */}
          <button
            title="Ir al Calendario"
            onClick={handleCalendar}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', height: 38,
              borderRadius: 10,
              border: '1.5px solid #e5e7eb',
              background: '#fff', color: '#6b7280',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = PINK;
              e.currentTarget.style.color = PINK;
              e.currentTarget.style.background = PINK_S;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <IconCalendar />
            Calendario
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionToolbar;



/* ═══════════════════════════════════════════════════════════════════════════
 * EJEMPLO DE USO en ProductionPage.jsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * import ProductionToolbar from '../components/ProductionToolbar';
 *
 * const [activeTab,     setActiveTab]     = useState('producciones');
 * const [statusFilter,  setStatusFilter]  = useState('');
 * const [clientFilter,  setClientFilter]  = useState('');
 * const [dateFrom,      setDateFrom]      = useState('');
 * const [dateTo,        setDateTo]        = useState('');
 * const [searchQuery,   setSearchQuery]   = useState('');
 *
 * const hasActiveFilters = !!(statusFilter || clientFilter || dateFrom || dateTo);
 * const filteredProductions = productions.filter(p => {
 *   if (statusFilter && p.status !== statusFilter) return false;
 *   if (clientFilter && p.client !== clientFilter) return false;
 *   // … rango de fechas …
 *   return true;
 * });
 *
 * <ProductionToolbar
 *   activeTab={activeTab}         onTabChange={setActiveTab}
 *   statusFilter={statusFilter}   onStatusChange={setStatusFilter}
 *   clientFilter={clientFilter}   onClientChange={setClientFilter}
 *   clients={uniqueClients}
 *   dateFrom={dateFrom}           onDateFromChange={setDateFrom}
 *   dateTo={dateTo}               onDateToChange={setDateTo}
 *   resultCount={filteredProductions.length}
 *   hasActiveFilters={hasActiveFilters}
 *   onClearFilters={() => { setStatusFilter(''); setClientFilter(''); setDateFrom(''); setDateTo(''); }}
 *   onAdd={() => setShowForm(true)}
 *   onDownloadPDF={handleDownloadPDF}
 *   onDownloadExcel={handleDownloadExcel}
 *   searchQuery={searchQuery}     onSearchChange={setSearchQuery}
 * />
 */