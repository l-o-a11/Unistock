/**
 * @file pages/ProductionPage.jsx
 *
 * LÓGICA DE PRODUCTOS DAÑADOS:
 *   Al anular una orden que estaba en "Corte" o "Producción":
 *
 *   A) "Nueva ficha técnica":
 *      - Crea una NUEVA orden copiando todos los datos de la anulada
 *      - Navega al detalle con state: { openTechSheet: true }
 *
 *   B) "Nueva orden":
 *      - Abre ProductionForm pre-llenado + banner de aviso de daño
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';
import ProductionTable from '../components/ProductionTable';
import ProductionSearch from '../components/ProductionSearch';
import AddProductionButton from '../components/AddProductionButton';
import ProductionForm from '../components/ProductionForm';
import DamagedProductsModal from '../components/DamagedProductsModal';

const DAMAGED_TRIGGER_STEPS = ['Corte', 'Producción'];

const ProductionsPage = () => {
  const navigate = useNavigate();
  const { Productions: productions, createProduction, cancelProduction } = useProductions();

  const [activeTab,      setActiveTab]      = useState('producciones');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState('Todos');
  const [filterClient,   setFilterClient]   = useState('Todos');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);

  const [cancelModal,    setCancelModal]    = useState({ open: false, id: null, motivo: '' });
  const [motivoError,    setMotivoError]    = useState('');
  const [damagedModal,   setDamagedModal]   = useState({ open: false, production: null });
  const [damagedOrderForm, setDamagedOrderForm] = useState({ open: false, initialData: null, notice: null });
  const [creatingNewOrder, setCreatingNewOrder] = useState(false);

  const itemsPerPage = 7;
  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status).filter(Boolean))];
  const uniqueClients  = ['Todos', ...new Set((productions || []).map(p => p.client).filter(Boolean))];

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
    || (prod?.details || []).some(d => [d?.ref, d?.refCorte, d?.color, d?.status].some(v => (v || '').toLowerCase().includes(term)))
    || (prod?.history || []).some(h => (h?.motivo || '').toLowerCase().includes(term));
    const matchesStatus = filterStatus === 'Todos' || prod?.status === filterStatus;
    const matchesClient = filterClient === 'Todos' || prod?.client === filterClient;
    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to   = filterDateTo   ? new Date(filterDateTo)   : null;
      const inRange = (d) => { if (!d) return false; if (from && to) return d >= from && d <= to; if (from) return d >= from; if (to) return d <= to; return true; };
      matchesDate = inRange(parseDate(prod?.deliveryDate)) || inRange(parseDate(prod?.statusDate));
    }
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  const totalPages           = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex           = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  // ── Anulación ────────────────────────────────────────────────────────────
  const openCancelModal  = (id) => { setCancelModal({ open: true, id, motivo: '' }); setMotivoError(''); };
  const closeCancelModal = ()   => { setCancelModal({ open: false, id: null, motivo: '' }); setMotivoError(''); };

  const confirmCancel = async () => {
    if (!cancelModal.motivo.trim()) { setMotivoError('El motivo es obligatorio'); return; }
    const prodBefore = (productions || []).find(p => p.id === cancelModal.id);
    const wasDamaged = prodBefore && DAMAGED_TRIGGER_STEPS.includes(prodBefore.status);
    try {
      const updated = await cancelProduction(cancelModal.id, cancelModal.motivo.trim());
      closeCancelModal();
      if (wasDamaged) setDamagedModal({ open: true, production: updated || { ...prodBefore, status: 'Anulada' } });
    } catch (e) { console.error(e); }
  };

  // ── Desde dañados: nueva ORDEN ───────────────────────────────────────────
  const handleNewOrderFromDamaged = (damagedDetails) => {
    const source = damagedModal.production;
    setDamagedModal({ open: false, production: null });
    if (!damagedDetails.length) return;
    const primary = damagedDetails[0];
    setDamagedOrderForm({
      open: true,
      initialData: {
        referencia:  source?.referencia || '',
        producto:    source?.producto   || '',
        cantidad:    String(primary.quantity || ''),
        color:       primary.color || '',
        cliente:     source?.client || '',
        referencias: damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '', fecha: '' })),
      },
      notice: {
        originalOrderNumber: source?.orderNumber,
        originalOrderStatus: source?.status || 'producción',
        damagedCount:        damagedDetails.length,
        totalDamagedQty:     damagedDetails.reduce((s, d) => s + (Number(d.quantity) || 0), 0),
      },
    });
  };

  // ── Desde dañados: nueva FICHA TÉCNICA ───────────────────────────────────
  const handleNewTechSheetFromDamaged = async (damagedDetails) => {
    const source = damagedModal.production;
    setDamagedModal({ open: false, production: null });
    if (!damagedDetails.length || !source) return;
    setCreatingNewOrder(true);
    try {
      const primary = damagedDetails[0];
      const newOrder = await createProduction({
        tipo:           'produccion',
        referencia:     source.referencia || '',
        producto:       source.producto   || '',
        cantidad:       String(primary.quantity || ''),
        color:          primary.color || '',
        cliente:        source.client || '',
        fechaSolicitud: '',
        referencias:    damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '', fecha: '' })),
        fromDamaged:         true,
        originalOrderId:     source.id,
        originalOrderNumber: source.orderNumber,
        originalOrderStatus: source.status,
      });
      // Navegar al detalle con flag para abrir la ficha técnica
      navigate(`/layout/produccion/detalle/${newOrder.id}`, {
        state: {
          openTechSheet:       true,
          fromDamaged:         true,
          originalOrderNumber: source.orderNumber,
          originalOrderStatus: source.status,
        },
      });
    } catch (e) {
      console.error('Error creando orden de reposición:', e);
    } finally {
      setCreatingNewOrder(false);
    }
  };

  const handleDamagedOrderSubmit = async (data) => {
    await createProduction(data);
    setDamagedOrderForm({ open: false, initialData: null, notice: null });
  };

  const handleCreateSubmit = async (data) => { await createProduction(data); };

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

      {/* Spinner creando orden */}
      {creatingNewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#E91E8C', borderRadius: '50%', animation: 'pSpin 0.7s linear infinite' }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>Creando orden de reposición...</p>
            <style>{`@keyframes pSpin { to { transform: rotate(360deg); }}`}</style>
          </div>
        </div>
      )}

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

            {(() => {
              const prod = (productions || []).find(p => p.id === cancelModal.id);
              return prod && DAMAGED_TRIGGER_STEPS.includes(prod.status) ? (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fcd34d', marginBottom: 14, fontSize: 12, color: '#92400e', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>⚠️</span>
                  <span>Esta orden está en <strong>{prod.status}</strong>. Al anularla podrás gestionar los artículos dañados y crear una reposición.</span>
                </div>
              ) : null;
            })()}

            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Motivo de anulación *</label>
            <textarea
              value={cancelModal.motivo}
              onChange={(e) => { setCancelModal(p => ({ ...p, motivo: e.target.value })); setMotivoError(''); }}
              placeholder="Describe el motivo..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box', border: motivoError ? '2px solid #E91E8C' : '1.5px solid #d1d5db', fontSize: 13, resize: 'vertical', outline: 'none' }}
            />
            {motivoError && <p style={{ color: '#E91E8C', fontSize: 11, marginTop: 4, fontWeight: 'bold' }}>{motivoError}</p>}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeCancelModal} style={{ border: 'none', background: '#f3f4f6', color: '#555', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>Cancelar</button>
              <button onClick={confirmCancel} style={{ border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '8px 18px', borderRadius: 8 }}>Confirmar anulación</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal productos dañados */}
      <DamagedProductsModal
        isOpen={damagedModal.open}
        production={damagedModal.production}
        onClose={() => setDamagedModal({ open: false, production: null })}
        onNewOrder={handleNewOrderFromDamaged}
        onNewTechSheet={handleNewTechSheetFromDamaged}
      />

      {/* Formulario nueva orden desde dañados */}
      {damagedOrderForm.open && (
        <ProductionForm
          initialData={damagedOrderForm.initialData}
          damageNotice={damagedOrderForm.notice}
          onSubmit={handleDamagedOrderSubmit}
          onCancel={() => setDamagedOrderForm({ open: false, initialData: null, notice: null })}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Orden de producción</h1>
        <ProductionSearch value={searchTerm} onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['producciones', 'terceros'].map(tab => (
          <button key={tab} onClick={() => tab === 'terceros' ? navigate('/Layout/terceros') : setActiveTab(tab)}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: activeTab === tab ? '#E91E8C' : '#eaeaea', color: activeTab === tab ? '#fff' : '#444', cursor: 'pointer', fontWeight: 500, fontSize: 13, textTransform: 'capitalize' }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', gap: 10, flexWrap: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', minWidth: 0 }}>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fafafa', fontSize: 12, cursor: 'pointer', minWidth: 0 }}>
            {uniqueStatuses.map((s, i) => <option key={i} value={s}>{s === 'Todos' ? 'Estado: Todos' : s}</option>)}
          </select>
          <select value={filterClient} onChange={(e) => { setFilterClient(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fafafa', fontSize: 12, cursor: 'pointer', minWidth: 0 }}>
            {uniqueClients.map((c, i) => <option key={i} value={c}>{c === 'Todos' ? 'Cliente: Todos' : c}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: hasDateFilter ? '1px solid #E91E8C' : '1px solid #e5e7eb', background: hasDateFilter ? '#fff0fb' : '#fafafa', borderRadius: 7, padding: '4px 8px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={hasDateFilter ? '#E91E8C' : '#aaa'} strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input type="date" value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }} title="Fecha desde" style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', cursor: 'pointer', width: 120 }} />
            <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>→</span>
            <input type="date" value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }} title="Fecha hasta" style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', cursor: 'pointer', width: 120 }} />
            {hasDateFilter && <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E91E8C', fontSize: 15, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>}
          </div>
          {(searchTerm || filterStatus !== 'Todos' || filterClient !== 'Todos' || hasDateFilter) && (
            <span style={{ fontSize: 11, color: '#E91E8C', fontWeight: 700, whiteSpace: 'nowrap' }}>{filteredProductions.length} resultado{filteredProductions.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <AddProductionButton productions={filteredProductions} onCreateProduction={handleCreateSubmit} onFilterByDate={(date) => { setFilterDateFrom(date); setFilterDateTo(date); setCurrentPage(1); }} />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '6px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
        <ProductionTable productions={paginatedProductions} onCancel={openCancelModal} />
      </div>

      {/* Paginación */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pageBtn}>‹</button>
        {getPageNumbers().map((p, i) =>
          p === '...'
            ? <span key={i} style={{ padding: '6px 4px', fontSize: 13 }}>…</span>
            : <button key={p} onClick={() => setCurrentPage(p)} style={{ ...pageBtn, background: p === currentPage ? '#E91E8C' : '#fff', color: p === currentPage ? '#fff' : '#333', border: p === currentPage ? '1px solid #E91E8C' : '1px solid #ddd' }}>{p}</button>
        )}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pageBtn}>›</button>
      </div>
    </div>
  );
};

const pageBtn = { padding: '6px 11px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 };
export default ProductionsPage;