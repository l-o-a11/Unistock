/**
 * @file pages/ProductionPage.jsx
 * CAMBIOS: Fix responsive móvil — filtros, tabla, paginación, modal anulación
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';
import ProductionTable from '../components/ProductionTable';
import ProductionSearch from '../components/ProductionSearch';
import ProductionForm from '../components/ProductionForm';
import DamagedProductsModal from '../components/DamagedProductsModal';
import Alert from '../../shared/components/Alert';

const DAMAGED_TRIGGER_STEPS = ['Corte', 'Producción'];

const ProductionsPage = () => {
  const navigate = useNavigate();
  const { Productions: productions, createProduction, cancelProduction, fetchAndSetDetails, changeProductionStatus } = useProductions();

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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const itemsPerPage = 7;
  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status).filter(Boolean))];
  const uniqueClients  = ['Todos', ...new Set((productions || []).map(p => p.client).filter(Boolean))];

  const parseDate = (str) => {
    if (!str) return null;
    const p = str.split('/');
    if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`);
    return new Date(str);
  };

  const HIDDEN_STATUSES = ['Anulada', 'Entregado'];

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
    const visibleByDefault = filterStatus === 'Todos'
      ? !HIDDEN_STATUSES.includes(prod?.status)
      : true;
    const matchesClient = filterClient === 'Todos' || prod?.client === filterClient;
    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to   = filterDateTo   ? new Date(filterDateTo)   : null;
      const inRange = (d) => { if (!d) return false; if (from && to) return d >= from && d <= to; if (from) return d >= from; if (to) return d <= to; return true; };
      matchesDate = inRange(parseDate(prod?.deliveryDate)) || inRange(parseDate(prod?.statusDate));
    }
    return matchesSearch && matchesStatus && matchesClient && matchesDate && visibleByDefault;
  });

  const totalPages           = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex           = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  const openCancelModal  = (id) => { setCancelModal({ open: true, id, motivo: '' }); setMotivoError(''); };
  const closeCancelModal = ()   => { setCancelModal({ open: false, id: null, motivo: '' }); setMotivoError(''); };

  const [cancelAlert, setCancelAlert] = useState({ open: false, type: 'success', title: '', message: '' });

  const confirmCancel = async () => {
    if (!cancelModal.motivo.trim()) { setMotivoError('El motivo es obligatorio'); return; }
    const prodBefore = (productions || []).find(p => p.id === cancelModal.id);
    const wasDamaged = prodBefore && DAMAGED_TRIGGER_STEPS.includes(prodBefore.status);
    try {
      const updated = await cancelProduction(cancelModal.id, cancelModal.motivo.trim());
      closeCancelModal();
      setCancelAlert({ open: true, type: 'success', title: 'Orden anulada', message: `La orden #${prodBefore?.orderNumber || ''} fue anulada correctamente.` });
      if (wasDamaged) setDamagedModal({ open: true, production: updated || { ...prodBefore, status: 'Anulada' } });
    } catch (e) {
      console.error(e);
      closeCancelModal();
      setCancelAlert({ open: true, type: 'error', title: 'Error al anular', message: 'No se pudo anular la orden. Intenta de nuevo.' });
    }
  };

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

  const handleNewTechSheetFromDamaged = async (damagedDetails) => {
    const source = damagedModal.production;
    setDamagedModal({ open: false, production: null });
    if (!damagedDetails.length || !source) return;
    setCreatingNewOrder(true);
    try {
      const primary = damagedDetails[0];
      const newOrder = await createProduction({
        tipo:           'diseno',
        referencia:     source.referencia || '',
        producto:       source.producto   || '',
        cantidad:       String(primary.quantity || ''),
        color:          primary.color || '',
        cliente:        source.client || '',
        fechaSolicitud: '',
        referencias:    damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '' })),
        fromDamaged:    true,
      });
      if (newOrder?.id) {
        navigate(`/layout/produccion/detalle/${newOrder.id}`, { state: { openTechSheet: true } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingNewOrder(false);
    }
  };

  const handleDamagedOrderSubmit = async (data) => {
    await createProduction(data);
    setDamagedOrderForm({ open: false, initialData: null, notice: null });
  };

  const handleCreateSubmit = async (data) => { await createProduction(data); };
  const handleCreateFromModal = async (data) => {
    await handleCreateSubmit(data);
    setShowCreateForm(false);
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
  const hasAnyFilter  = searchTerm || filterStatus !== 'Todos' || filterClient !== 'Todos' || hasDateFilter;

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f8', fontFamily: 'sans-serif' }}>

      <style>{`
        @keyframes pSpin { to { transform: rotate(360deg); } }

        /* ── Root padding ── */
        .prod-root { padding: 14px; }
        @media (min-width: 640px)  { .prod-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .prod-root { padding: 24px 32px; } }

        /* ── Header: stack en móvil ── */
        .prod-header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        @media (min-width: 640px) {
          .prod-header { flex-direction: row; justify-content: space-between; align-items: center; }
        }

        /* ── Barra de filtros ── */
        .prod-filters {
          background: #fff; border-radius: 10px; padding: 10px 14px;
          margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          display: flex; flex-direction: column; gap: 10px;
        }
        @media (min-width: 768px) {
          .prod-filters {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        /* Grupo izquierdo: filtros wrapeados */
        .prod-filter-left {
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap; min-width: 0; flex: 1;
        }

        /* Grupo derecho: botones acción */
        .prod-filter-right { flex-shrink: 0; }

        /* En móvil el grupo derecho va abajo y centrado */
        @media (max-width: 767px) {
          .prod-filter-right {
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
        }

        /* Selects adaptados */
        .prod-select {
          padding: 6px 10px; border-radius: 7px; border: 1px solid #e5e7eb;
          background: #fafafa; font-size: 12px; cursor: pointer;
          flex: 1; min-width: 110px; max-width: 160px;
        }
        @media (max-width: 480px) {
          .prod-select { max-width: none; width: auto; flex: 1 1 auto; }
        }

        /* Inputs de fecha */
        .prod-date-input {
          border: none; background: transparent;
          font-size: 12px; outline: none; cursor: pointer;
          width: 110px;
        }
        @media (max-width: 420px) {
          .prod-date-input { width: 90px; font-size: 11px; }
        }

        /* Bloque de fechas: stack vertical en pantallas muy pequeñas */
        .prod-date-block {
          display: flex; align-items: center; gap: 4px;
          border: 1px solid #e5e7eb; background: #fafafa;
          border-radius: 7px; padding: 4px 8px;
          flex-wrap: nowrap;
        }
        .prod-date-block.active { border-color: #FF4FD6; background: #fff0fb; }

        /* Modal de anulación: ancho adaptativo */
        .cancel-modal {
          border-radius: 16px; padding: 20px 18px;
          background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,0.18);
          border: 2px solid #ef4444;
          width: calc(100vw - 32px); max-width: 420px;
        }
        @media (min-width: 480px) {
          .cancel-modal { padding: 24px; }
        }

        /* Paginación: más compacta en móvil */
        .prod-page-btn {
          padding: 6px 11px; border-radius: 6px;
          border: 1px solid #ddd; background: #fff;
          cursor: pointer; font-size: 13px;
        }
        @media (max-width: 480px) {
          .prod-page-btn { padding: 5px 8px; font-size: 12px; }
        }

        /* Texto de hint de filtros: oculto en móvil muy pequeño */
        .prod-filter-hint { font-size: 10px; color: #9ca3af; font-style: italic; white-space: nowrap; }
        @media (max-width: 400px) {
          .prod-filter-hint { display: none; }
        }
      `}</style>

      {/* Alert anulación éxito/error */}
      <Alert
        isOpen={cancelAlert.open}
        type={cancelAlert.type}
        title={cancelAlert.title}
        message={cancelAlert.message}
        onConfirm={() => setCancelAlert(p => ({ ...p, open: false }))}
        onCancel={() => setCancelAlert(p => ({ ...p, open: false }))}
      />

      {/* Spinner creando orden */}
      {creatingNewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: '0 16px' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#FF4FD6', borderRadius: '50%', animation: 'pSpin 0.7s linear infinite' }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>Creando orden de reposición...</p>
          </div>
        </div>
      )}

      {/* Modal anulación */}
      {cancelModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '0 16px' }}>
          <div className="cancel-modal">
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box', border: motivoError ? '2px solid #ff4fd6' : '1.5px solid #d1d5db', fontSize: 13, resize: 'vertical', outline: 'none' }}
            />
            {motivoError && <p style={{ color: '#ff4fd6', fontSize: 11, marginTop: 4, fontWeight: 'bold' }}>{motivoError}</p>}
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

      {showCreateForm && (
        <ProductionForm
          onSubmit={handleCreateFromModal}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="prod-root">
        {/* Header */}
        <div className="prod-header">
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Orden de producción</h1>
          <ProductionSearch value={searchTerm} onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['producciones', 'terceros'].map(tab => (
            <button key={tab} onClick={() => tab === 'terceros' ? navigate('/Layout/terceros') : setActiveTab(tab)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: activeTab === tab ? '#ff4fd6' : '#eaeaea', color: activeTab === tab ? '#fff' : '#444', cursor: 'pointer', fontWeight: 500, fontSize: 13, textTransform: 'capitalize' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="prod-filters">
          <div className="prod-filter-left">

            {/* Select Estado */}
            <select
              className="prod-select"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              {uniqueStatuses.map((s, i) => (
                <option key={i} value={s}>{s === 'Todos' ? 'Estado: Activas' : s}</option>
              ))}
            </select>

            {/* Hint órdenes ocultas */}
            {filterStatus === 'Todos' && (
              <span className="prod-filter-hint">
                Anuladas y entregadas ocultas
              </span>
            )}

            {/* Select Cliente */}
            <select
              className="prod-select"
              value={filterClient}
              onChange={(e) => { setFilterClient(e.target.value); setCurrentPage(1); }}>
              {uniqueClients.map((c, i) => (
                <option key={i} value={c}>{c === 'Todos' ? 'Cliente: Todos' : c}</option>
              ))}
            </select>

            {/* Rango de fechas */}
            <div className={`prod-date-block${hasDateFilter ? ' active' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={hasDateFilter ? '#FF4FD6' : '#aaa'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input
                className="prod-date-input"
                type="date"
                value={filterDateFrom}
                onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                title="Fecha desde"
              />
              <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500, flexShrink: 0 }}>→</span>
              <input
                className="prod-date-input"
                type="date"
                value={filterDateTo}
                onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                title="Fecha hasta"
              />
              {hasDateFilter && (
                <button
                  onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#FF4FD6', fontSize: 15, lineHeight: 1, padding: 0, marginLeft: 2, flexShrink: 0 }}>
                  ×
                </button>
              )}
            </div>

            {/* Contador resultados */}
            {hasAnyFilter && (
              <span style={{ fontSize: 11, color: '#FF4FD6', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {filteredProductions.length} resultado{filteredProductions.length !== 1 ? 's' : ''}
              </span>
            )}

            {/* Botón limpiar filtros */}
            {hasAnyFilter && (
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus('Todos'); setFilterClient('Todos'); setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpiar
              </button>
            )}
          </div>

          {/* Botones acción (derecha) */}
          <div className="prod-filter-right">
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              style={{
                border: 'none',
                borderRadius: 8,
                background: '#ff4fd6',
                color: '#fff',
                fontWeight: 600,
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              + Nueva orden
            </button>
          </div>
        </div>

        {/* Tabla — scroll horizontal en móvil */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '6px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
          <ProductionTable productions={paginatedProductions} onCancel={openCancelModal} onExpandRow={fetchAndSetDetails} />
        </div>

        {/* Paginación */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="prod-page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
            ‹
          </button>
          {getPageNumbers().map((p, i) =>
            p === '...'
              ? <span key={i} style={{ padding: '6px 4px', fontSize: 13 }}>…</span>
              : <button
                  key={p}
                  className="prod-page-btn"
                  onClick={() => setCurrentPage(p)}
                  style={{
                    background: p === currentPage ? '#ff4fd6' : '#fff',
                    color:      p === currentPage ? '#fff'    : '#333',
                    border:     p === currentPage ? '1px solid #ff4fd6' : '1px solid #ddd',
                  }}>
                  {p}
                </button>
          )}
          <button
            className="prod-page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionsPage;