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
  const [downloadModal, setDownloadModal] = useState(false);

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

  const handleDownloadExcel = () => {
    setDownloadModal(false);
    const rows = [
      ['Orden', 'Cliente', 'Estado', 'Entrega', 'Referencia', 'Cantidad', 'Color'],
      ...filteredProductions.map((p) => [
        p.orderNumber || '',
        p.client || '',
        p.status || '',
        p.deliveryDate || '',
        p.referencia || '',
        p.quantity || 0,
        p.color || '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ordenes-produccion.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    setDownloadModal(false);
    const now   = new Date();
    const fecha = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
    const hora  = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    // Resumen por estado
    const statusSummary = filteredProductions.reduce((acc, p) => {
      const s = p.status || 'Sin estado';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const totalUnidades = filteredProductions.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

    const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const statusColor = (s) => {
      const map = {
        'Entregado':   { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
        'Producción':  { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
        'Corte':       { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
        'Anulada':     { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
        'Diseño':      { bg: '#f3e8ff', color: '#6b21a8', dot: '#a855f7' },
        'Terminado':   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
      };
      return map[s] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
    };

    const tableRows = filteredProductions.map((p, i) => {
      const sc = statusColor(p.status);
      return `
        <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="td-order"><span class="order-num">#${esc(p.orderNumber)}</span></td>
          <td class="td-product">
            <span class="product-name">${esc(p.producto || p.referencia || '—')}</span>
            ${p.referencia ? `<span class="product-ref">Ref: ${esc(p.referencia)}</span>` : ''}
          </td>
          <td class="td-client">${esc(p.client || '—')}</td>
          <td class="td-qty"><span class="qty-badge">${esc(p.quantity ?? 0)}</span><span class="qty-label">uds</span></td>
          <td class="td-color">
            <span class="color-pill">${esc(p.color || '—')}</span>
          </td>
          <td class="td-date">${esc(p.deliveryDate || '—')}</td>
          <td class="td-status">
            <span class="status-badge" style="background:${sc.bg};color:${sc.color};">
              <span class="status-dot" style="background:${sc.dot};"></span>
              ${esc(p.status || '—')}
            </span>
          </td>
        </tr>`;
    }).join('');

    const summaryCards = Object.entries(statusSummary).map(([s, n]) => {
      const sc = statusColor(s);
      return `<div class="sum-card" style="border-left:4px solid ${sc.dot};">
        <span class="sum-count" style="color:${sc.dot};">${n}</span>
        <span class="sum-label">${esc(s)}</span>
      </div>`;
    }).join('');

    const filterInfo = [
      filterStatus !== 'Todos' ? `Estado: <strong>${esc(filterStatus)}</strong>` : '',
      filterClient !== 'Todos' ? `Cliente: <strong>${esc(filterClient)}</strong>` : '',
      filterDateFrom ? `Desde: <strong>${esc(filterDateFrom)}</strong>` : '',
      filterDateTo   ? `Hasta: <strong>${esc(filterDateTo)}</strong>` : '',
      searchTerm     ? `Búsqueda: <strong>"${esc(searchTerm)}"</strong>` : '',
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Órdenes de Producción — ${fecha}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #f0f2f5;
    color: #1a1a2e;
    font-size: 11px;
  }

  /* ── Página ── */
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #fff;
    padding: 0;
  }

  /* ── Encabezado ── */
  .header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    color: #fff;
    padding: 28px 32px 22px;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 140px; height: 140px;
    border-radius: 50%;
    background: rgba(255,79,214,0.18);
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -20px; right: 60px;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(255,79,214,0.1);
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .brand-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #ff4fd6;
    box-shadow: 0 0 8px rgba(255,79,214,0.6);
  }
  .brand-name {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .doc-title {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .doc-subtitle {
    font-size: 12px;
    color: rgba(255,255,255,0.55);
    margin-top: 4px;
  }
  .header-meta {
    text-align: right;
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
  }
  .header-meta strong { color: rgba(255,255,255,0.85); }
  .doc-id {
    display: inline-block;
    background: rgba(255,79,214,0.25);
    color: #ff9ee8;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid rgba(255,79,214,0.4);
    margin-top: 6px;
    letter-spacing: 0.06em;
  }

  /* ── Cuerpo ── */
  .body { padding: 22px 32px 28px; }

  /* Filtros activos */
  .filter-bar {
    background: #f8f9fb;
    border: 1px solid #e8eaf0;
    border-radius: 8px;
    padding: 8px 14px;
    margin-bottom: 18px;
    font-size: 10px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .filter-bar strong { color: #374151; }
  .filter-icon { color: #9ca3af; }

  /* Resumen de estados */
  .summary {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .sum-card {
    flex: 1;
    min-width: 90px;
    background: #fafbfc;
    border: 1px solid #e8eaf0;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sum-count {
    font-size: 20px;
    font-weight: 800;
    line-height: 1;
  }
  .sum-label {
    font-size: 9.5px;
    color: #9ca3af;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Totales destacados */
  .totals-row {
    display: flex;
    gap: 12px;
    margin-bottom: 22px;
  }
  .total-card {
    flex: 1;
    background: linear-gradient(135deg, #1a1a2e, #0f3460);
    border-radius: 10px;
    padding: 14px 18px;
    color: #fff;
  }
  .total-card.pink {
    background: linear-gradient(135deg, #ff4fd6, #c026d3);
  }
  .total-val {
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .total-label {
    font-size: 10px;
    color: rgba(255,255,255,0.65);
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Tabla */
  .section-title {
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5px;
  }
  thead tr {
    background: #1a1a2e;
  }
  thead th {
    padding: 9px 10px;
    text-align: left;
    color: rgba(255,255,255,0.7);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  thead th:first-child { border-radius: 6px 0 0 0; }
  thead th:last-child  { border-radius: 0 6px 0 0; }

  .row-even { background: #fff; }
  .row-odd  { background: #f9fafb; }

  tbody tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.1s;
  }

  td { padding: 9px 10px; vertical-align: middle; }

  .td-order .order-num {
    font-size: 12px;
    font-weight: 800;
    color: #ff4fd6;
    letter-spacing: -0.02em;
  }
  .td-product .product-name {
    display: block;
    font-weight: 600;
    color: #111827;
    font-size: 10.5px;
  }
  .td-product .product-ref {
    display: block;
    font-size: 9px;
    color: #9ca3af;
    margin-top: 1px;
  }
  .td-client { color: #374151; font-weight: 500; }
  .td-qty {
    text-align: right;
    white-space: nowrap;
  }
  .qty-badge {
    font-size: 12px;
    font-weight: 800;
    color: #111827;
  }
  .qty-label {
    font-size: 9px;
    color: #9ca3af;
    margin-left: 2px;
  }
  .td-color .color-pill {
    background: #f3f4f6;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 9.5px;
    color: #4b5563;
    font-weight: 500;
  }
  .td-date { color: #6b7280; font-variant-numeric: tabular-nums; }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 9.5px;
    font-weight: 700;
    white-space: nowrap;
  }
  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Separador de página interna */
  .divider {
    border: none;
    border-top: 2px dashed #e5e7eb;
    margin: 22px 0;
  }

  /* Sección de reparto */
  .reparto-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .reparto-card {
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 14px;
    background: #fff;
    page-break-inside: avoid;
  }
  .reparto-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  .reparto-order {
    font-size: 14px;
    font-weight: 800;
    color: #ff4fd6;
  }
  .reparto-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 20px;
    font-size: 8.5px;
    font-weight: 700;
  }
  .reparto-field {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
    font-size: 10px;
  }
  .reparto-key {
    color: #9ca3af;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .reparto-val {
    color: #111827;
    font-weight: 600;
    text-align: right;
    max-width: 60%;
    word-break: break-word;
  }
  .reparto-qty-big {
    font-size: 18px;
    font-weight: 900;
    color: #111;
    letter-spacing: -0.03em;
  }
  .check-box {
    width: 14px; height: 14px;
    border: 1.5px solid #d1d5db;
    border-radius: 3px;
    display: inline-block;
    flex-shrink: 0;
  }
  .reparto-verify {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed #e5e7eb;
    font-size: 9px;
    color: #9ca3af;
  }

  /* ── Footer ── */
  .footer {
    background: #f8f9fb;
    border-top: 2px solid #e5e7eb;
    padding: 14px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: #9ca3af;
    margin-top: auto;
  }
  .footer strong { color: #6b7280; }
  .footer-sig {
    text-align: right;
    line-height: 1.6;
  }

  /* ── Print ── */
  @media print {
    body { background: #fff; }
    .page { width: 100%; margin: 0; box-shadow: none; }
    .no-print { display: none !important; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    .reparto-card { page-break-inside: avoid; }
  }

  /* Botón imprimir (solo pantalla) */
  .print-bar {
    display: flex;
    justify-content: flex-end;
    padding: 12px 32px 0;
    gap: 10px;
  }
  .btn-print {
    background: #1a1a2e;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 9px 20px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-close {
    background: #f3f4f6;
    color: #374151;
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
</head>
<body>

<!-- Barra impresión (solo pantalla) -->
<div class="print-bar no-print">
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
  <button class="btn-print" onclick="window.print()">
    🖨 Imprimir / Guardar PDF
  </button>
</div>

<div class="page">
  <!-- ENCABEZADO -->
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand">
          <div class="brand-dot"></div>
          <span class="brand-name">Sistema de Producción</span>
        </div>
        <div class="doc-title">Órdenes de Producción</div>
        <div class="doc-subtitle">Informe administrativo y de reparto</div>
      </div>
      <div class="header-meta">
        <div><strong>Fecha:</strong> ${fecha}</div>
        <div><strong>Hora:</strong> ${hora}</div>
        <div><strong>Total órdenes:</strong> ${filteredProductions.length}</div>
        <div><span class="doc-id">OP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}</span></div>
      </div>
    </div>
  </div>

  <div class="body">

    <!-- FILTROS ACTIVOS -->
    ${filterInfo ? `<div class="filter-bar">
      <span class="filter-icon">▼</span>
      <strong>Filtros aplicados:</strong> ${filterInfo}
    </div>` : ''}

    <!-- RESUMEN NUMÉRICO -->
    <div class="totals-row">
      <div class="total-card">
        <div class="total-val">${filteredProductions.length}</div>
        <div class="total-label">Total de órdenes</div>
      </div>
      <div class="total-card pink">
        <div class="total-val">${totalUnidades.toLocaleString('es-CO')}</div>
        <div class="total-label">Unidades totales</div>
      </div>
      <div class="total-card" style="background:linear-gradient(135deg,#0f3460,#533483);">
        <div class="total-val">${Object.keys(statusSummary).length}</div>
        <div class="total-label">Estados activos</div>
      </div>
    </div>

    <!-- DESGLOSE POR ESTADO -->
    <div class="section-title">Desglose por estado</div>
    <div class="summary">${summaryCards}</div>

    <!-- ══════════════════════ TABLA ADMINISTRATIVA ══════════════════════ -->
    <div class="section-title" style="margin-top:4px;">Detalle de órdenes</div>
    <table>
      <thead>
        <tr>
          <th style="width:52px">Orden</th>
          <th style="width:140px">Producto / Artículo</th>
          <th>Cliente</th>
          <th style="text-align:right;width:56px">Cant.</th>
          <th style="width:70px">Color</th>
          <th style="width:80px">F. Entrega</th>
          <th style="width:90px">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="7" style="text-align:center;padding:24px;color:#9ca3af;">Sin órdenes para mostrar</td></tr>'}
      </tbody>
    </table>

    <hr class="divider"/>

    <!-- ══════════════════════ SECCIÓN REPARTO ══════════════════════ -->
    <div class="section-title">Tarjetas de reparto</div>
    <div class="reparto-grid">
      ${filteredProductions.map((p) => {
        const sc = statusColor(p.status);
        return `
        <div class="reparto-card">
          <div class="reparto-card-header">
            <div>
              <div class="reparto-order">#${esc(p.orderNumber)}</div>
              <div style="font-size:10px;color:#374151;font-weight:600;margin-top:2px;">${esc(p.producto || p.referencia || '—')}</div>
            </div>
            <div>
              <span class="reparto-status-badge" style="background:${sc.bg};color:${sc.color};">
                <span class="status-dot" style="background:${sc.dot};"></span>
                ${esc(p.status || '—')}
              </span>
            </div>
          </div>
          <div class="reparto-field">
            <span class="reparto-key">Cliente</span>
            <span class="reparto-val">${esc(p.client || '—')}</span>
          </div>
          <div class="reparto-field">
            <span class="reparto-key">Referencia</span>
            <span class="reparto-val">${esc(p.referencia || '—')}</span>
          </div>
          <div class="reparto-field">
            <span class="reparto-key">Color</span>
            <span class="reparto-val">${esc(p.color || '—')}</span>
          </div>
          <div class="reparto-field">
            <span class="reparto-key">Entrega</span>
            <span class="reparto-val">${esc(p.deliveryDate || '—')}</span>
          </div>
          <div class="reparto-field" style="margin-top:6px;">
            <span class="reparto-key">Cantidad</span>
            <span class="reparto-qty-big">${esc(p.quantity ?? 0)} <span style="font-size:10px;font-weight:500;color:#9ca3af;">uds</span></span>
          </div>
          <div class="reparto-verify">
            <span class="check-box"></span>
            Verificado por: ____________________________
          </div>
        </div>`;
      }).join('')}
    </div>

  </div><!-- /body -->

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <strong>Sistema de Gestión de Producción</strong><br/>
      Documento generado automáticamente · ${fecha} ${hora}
    </div>
    <div class="footer-sig">
      <strong>Firma responsable:</strong><br/>
      ___________________________<br/>
      Cargo: ____________________
    </div>
  </div>
</div>

</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
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
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

        /* ── Root padding ── */
        .prod-root { padding: 14px; }
        @media (min-width: 640px)  { .prod-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .prod-root { padding: 24px 32px; } }

        /* ── Header: título izquierda, búsqueda derecha ── */
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
          .prod-filters { flex-direction: row; align-items: center; justify-content: space-between; }
        }

        .prod-filter-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; flex: 1; }
        .prod-filter-right { flex-shrink: 0; }
        @media (max-width: 767px) {
          .prod-filter-right { width: 100%; display: flex; justify-content: flex-end; }
        }

        .prod-select {
          padding: 6px 10px; border-radius: 7px; border: 1px solid #e5e7eb;
          background: #fafafa; font-size: 12px; cursor: pointer;
          flex: 1; min-width: 110px; max-width: 160px;
        }
        @media (max-width: 480px) { .prod-select { max-width: none; width: auto; flex: 1 1 auto; } }

        .prod-date-input { border: none; background: transparent; font-size: 12px; outline: none; cursor: pointer; width: 110px; }
        @media (max-width: 420px) { .prod-date-input { width: 90px; font-size: 11px; } }

        .prod-date-block {
          display: flex; align-items: center; gap: 4px;
          border: 1px solid #e5e7eb; background: #fafafa;
          border-radius: 7px; padding: 4px 8px; flex-wrap: nowrap;
        }
        .prod-date-block.active { border-color: #FF4FD6; background: #fff0fb; }

        /* Botón + Agregar destacado */
        .btn-agregar {
          border: none; border-radius: 8px; background: #ff4fd6; color: #fff;
          font-size: 13px; font-weight: 600; padding: 8px 16px; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          box-shadow: 0 2px 8px rgba(255,79,214,0.3);
          transition: background 0.15s, box-shadow 0.15s;
        }
        .btn-agregar:hover { background: #e040c0; box-shadow: 0 4px 14px rgba(255,79,214,0.4); }

        /* Botones icono (descarga, calendario) */
        .btn-icon {
          border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151;
          font-size: 13px; font-weight: 600; padding: 8px 11px; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-icon:hover { border-color: #d1d5db; background: #f9fafb; }

        /* Modal anulación */
        .cancel-modal {
          border-radius: 16px; padding: 20px 18px;
          background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,0.18);
          border: 2px solid #ef4444; width: calc(100vw - 32px); max-width: 420px;
        }
        @media (min-width: 480px) { .cancel-modal { padding: 24px; } }

        /* Modal de descarga */
        .download-modal {
          border-radius: 16px; padding: 24px;
          background: #fff; box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          width: calc(100vw - 32px); max-width: 360px;
          animation: fadeIn 0.18s ease;
        }
        .download-opt-btn {
          width: 100%; display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 10px; cursor: pointer;
          border: 1.5px solid #e5e7eb; background: #fafafa;
          text-align: left; transition: border-color 0.15s, background 0.15s;
        }
        .download-opt-btn:hover { border-color: #ff4fd6; background: #fff0fb; }
        .download-opt-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* Paginación */
        .prod-page-btn { padding: 6px 11px; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 13px; }
        @media (max-width: 480px) { .prod-page-btn { padding: 5px 8px; font-size: 12px; } }

        .prod-filter-hint { font-size: 10px; color: #9ca3af; font-style: italic; white-space: nowrap; }
        @media (max-width: 400px) { .prod-filter-hint { display: none; } }
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

      {/* Modal selección formato descarga */}
      {downloadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '0 16px' }}>
          <div className="download-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>Descargar órdenes</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>Elige el formato de exportación</p>
              </div>
              <button onClick={() => setDownloadModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Opción Excel/CSV */}
              <button className="download-opt-btn" onClick={handleDownloadExcel}>
                <div className="download-opt-icon" style={{ background: '#e6f4ea' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111' }}>Excel / CSV</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>Tabla editable, compatible con Excel y Sheets</p>
                </div>
              </button>
              {/* Opción PDF */}
              <button className="download-opt-btn" onClick={handleDownloadPDF}>
                <div className="download-opt-icon" style={{ background: '#fef2f2' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111' }}>PDF</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>Documento listo para imprimir o compartir</p>
                </div>
              </button>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#d1d5db', textAlign: 'center' }}>
              {filteredProductions.length} orden{filteredProductions.length !== 1 ? 'es' : ''} se exportará{filteredProductions.length !== 1 ? 'n' : ''}
            </p>
          </div>
        </div>
      )}

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

          {/* Botones acción (derecha) — igual que captura */}
          <div className="prod-filter-right">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
              {/* Botón + Agregar destacado (rosa, con ícono) */}
              <button type="button" className="btn-agregar" onClick={() => setShowCreateForm(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Agregar
              </button>
              {/* Botón descargar (ícono) */}
              <button type="button" className="btn-icon" onClick={() => setDownloadModal(true)} title="Descargar órdenes">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              {/* Botón calendario (ícono) */}
              <button type="button" className="btn-icon" onClick={() => navigate('/layout/produccion/calendario')} title="Abrir calendario">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
            </div>
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