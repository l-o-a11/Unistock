import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';
import ProductionTable from '../components/ProductionTable';
import ProductionSearch from '../components/ProductionSearch';
import AddProductionButton from '../components/AddProductionButton';
import ProductionForm from '../components/ProductionForm';

const ProductionsPage = () => {
  const navigate = useNavigate();
  const { Productions: productions, createProduction, cancelProduction } = useProductions();

  const [activeTab,      setActiveTab]      = useState("producciones");
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState('Todos');
  const [filterClient,   setFilterClient]   = useState('Todos');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);

  // Modal de anulación con motivo
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, motivo: '' });
  const [motivoError, setMotivoError] = useState('');

  const itemsPerPage = 7;

  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status).filter(Boolean))];
  const uniqueClients  = ['Todos', ...new Set((productions || []).map(p => p.client).filter(Boolean))];

  // DD/MM/YYYY → Date
  const parseDate = (str) => {
    if (!str) return null;
    const p = str.split('/');
    if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`);
    return new Date(str);
  };

  const filteredProductions = (productions || []).filter(prod => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = !term || [
      prod?.client, prod?.status, prod?.producto, prod?.referencia,
      prod?.color, prod?.deliveryDate, prod?.statusDate,
      String(prod?.orderNumber || ''), String(prod?.quantity || ''),
    ].some(v => (v || '').toLowerCase().includes(term))
    || (prod?.details || []).some(d =>
      [d?.ref, d?.refCorte, d?.color, d?.status].some(v => (v || '').toLowerCase().includes(term))
    )
    || (prod?.history || []).some(h => (h?.motivo || '').toLowerCase().includes(term));

    const matchesStatus = filterStatus === 'Todos' || prod?.status === filterStatus;
    const matchesClient = filterClient === 'Todos' || prod?.client === filterClient;

    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const from  = filterDateFrom ? new Date(filterDateFrom) : null;
      const to    = filterDateTo   ? new Date(filterDateTo)   : null;
      const inRange = (d) => {
        if (!d) return false;
        if (from && to) return d >= from && d <= to;
        if (from)       return d >= from;
        if (to)         return d <= to;
        return true;
      };
      matchesDate = inRange(parseDate(prod?.deliveryDate)) || inRange(parseDate(prod?.statusDate));
    }

    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  const totalPages           = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex           = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  const openCancelModal = (id) => { setCancelModal({ open: true, id, motivo: '' }); setMotivoError(''); };
  const closeCancelModal = () => { setCancelModal({ open: false, id: null, motivo: '' }); setMotivoError(''); };

  const confirmCancel = async () => {
    if (!cancelModal.motivo.trim()) { setMotivoError('El motivo es obligatorio'); return; }
    try { await cancelProduction(cancelModal.id, cancelModal.motivo.trim()); }
    catch (e) { console.error(e); }
    closeCancelModal();
  };

  const handleCreateSubmit = async (data) => {
    await createProduction(data);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const hasDateFilter = filterDateFrom || filterDateTo;

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f8', padding: '24px 28px', fontFamily: 'sans-serif' }}>

      {/* Modal anulación */}
      {cancelModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ width: 420, borderRadius: 16, padding: 24, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.18)', border: '2px solid #ef4444' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Anular orden de producción</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>Esta acción quedará registrada en el historial.</p>
              </div>
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
              Motivo de anulación *
            </label>
            <textarea
              value={cancelModal.motivo}
              onChange={(e) => { setCancelModal(p => ({ ...p, motivo: e.target.value })); setMotivoError(''); }}
              placeholder="Describe el motivo por el que se anula esta orden..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
                border: motivoError ? '2px solid #ef4444' : '1.5px solid #d1d5db',
                fontSize: 13, resize: 'vertical', outline: 'none',
              }}
            />
            {motivoError && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{motivoError}</p>}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeCancelModal}
                style={{ border: 'none', background: '#f3f4f6', color: '#555', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>
                Cancelar
              </button>
              <button onClick={confirmCancel}
                style={{ border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '8px 18px', borderRadius: 8 }}>
                Confirmar anulación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header — título + buscador en la misma línea */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Orden de producción</h1>
        <ProductionSearch value={searchTerm} onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['producciones', 'terceros'].map(tab => (
          <button key={tab}
            onClick={() => tab === 'terceros' ? navigate('/Layout/terceros') : setActiveTab(tab)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: activeTab === tab ? '#ff4fd6' : '#eaeaea',
              color: activeTab === tab ? '#fff' : '#444',
              cursor: 'pointer', fontWeight: 500, fontSize: 13, textTransform: 'capitalize'
            }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Barra de filtros — 1 sola línea compacta */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', gap: 10, flexWrap: 'nowrap'
      }}>
        {/* Filtros izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', minWidth: 0 }}>

          {/* Estado */}
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fafafa', fontSize: 12, cursor: 'pointer', minWidth: 0 }}>
            {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s === 'Todos' ? 'Estado: Todos' : s}</option>)}
          </select>

          {/* Cliente */}
          <select value={filterClient} onChange={(e) => { setFilterClient(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fafafa', fontSize: 12, cursor: 'pointer', minWidth: 0 }}>
            {uniqueClients.map((c, i) => <option key={i} value={c}>{c === 'Todos' ? 'Cliente: Todos' : c}</option>)}
          </select>

          {/* Rango fechas — compacto, todo inline */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: hasDateFilter ? '1px solid #FF4FD6' : '1px solid #e5e7eb',
            background: hasDateFilter ? '#fff0fb' : '#fafafa',
            borderRadius: 7, padding: '4px 8px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={hasDateFilter ? '#FF4FD6' : '#aaa'} strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input type="date" value={filterDateFrom}
              onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
              title="Fecha desde"
              style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', cursor: 'pointer', width: 120 }} />
            <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>→</span>
            <input type="date" value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
              title="Fecha hasta"
              style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', cursor: 'pointer', width: 120 }} />
            {hasDateFilter && (
              <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }}
                title="Limpiar fechas"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#FF4FD6', fontSize: 15, lineHeight: 1, padding: 0, marginLeft: 2 }}>
                ×
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          {(searchTerm || filterStatus !== 'Todos' || filterClient !== 'Todos' || hasDateFilter) && (
            <span style={{ fontSize: 11, color: '#FF4FD6', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {filteredProductions.length} resultado{filteredProductions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Botones derecha */}
        <div style={{ flexShrink: 0 }}>
          <AddProductionButton
            productions={filteredProductions}
            onCreateProduction={handleCreateSubmit}
            onFilterByDate={(date) => { setFilterDateFrom(date); setFilterDateTo(date); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '6px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
        <ProductionTable
          productions={paginatedProductions}
          onCancel={openCancelModal}
        />
      </div>

      {/* Paginación */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pageBtn}>‹</button>
        {getPageNumbers().map((p, i) =>
          p === '...'
            ? <span key={i} style={{ padding: '6px 4px', fontSize: 13 }}>…</span>
            : <button key={p} onClick={() => setCurrentPage(p)} style={{
                ...pageBtn,
                background: p === currentPage ? '#ff4fd6' : '#fff',
                color:      p === currentPage ? '#fff'    : '#333',
                border:     p === currentPage ? '1px solid #ff4fd6' : '1px solid #ddd',
              }}>{p}</button>
        )}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pageBtn}>›</button>
      </div>
    </div>
  );
};

const pageBtn = { padding: '6px 11px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 };

export default ProductionsPage;
