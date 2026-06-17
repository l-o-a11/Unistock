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

  const [activeTab, setActiveTab] = useState('producciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterClient, setFilterClient] = useState('Todos');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [cancelModal, setCancelModal] = useState({ open: false, id: null, motivo: '' });
  const [motivoError, setMotivoError] = useState('');
  const [damagedModal, setDamagedModal] = useState({ open: false, production: null });
  const [damagedOrderForm, setDamagedOrderForm] = useState({ open: false, initialData: null, notice: null });
  const [creatingNewOrder, setCreatingNewOrder] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);

  const itemsPerPage = 7;
  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status).filter(Boolean))];
  const uniqueClients = ['Todos', ...new Set((productions || []).map(p => p.client).filter(Boolean))];

  const parseDate = (str) => {
    if (!str) return null;
    const p = str.split('/');
    if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`);
    return new Date(str);
  };

  const HIDDEN_STATUSES = ['Anulada', 'Enviado'];

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
      const to = filterDateTo ? new Date(filterDateTo) : null;
      const inRange = (d) => { if (!d) return false; if (from && to) return d >= from && d <= to; if (from) return d >= from; if (to) return d <= to; return true; };
      matchesDate = inRange(parseDate(prod?.deliveryDate)) || inRange(parseDate(prod?.statusDate));
    }
    return matchesSearch && matchesStatus && matchesClient && matchesDate && visibleByDefault;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  const openCancelModal = (id) => { setCancelModal({ open: true, id, motivo: '' }); setMotivoError(''); };
  const closeCancelModal = () => { setCancelModal({ open: false, id: null, motivo: '' }); setMotivoError(''); };

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
        referencia: source?.referencia || '',
        producto: source?.producto || '',
        cantidad: String(primary.quantity || ''),
        color: primary.color || '',
        cliente: source?.client || '',
        referencias: damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '', fecha: '' })),
      },
      notice: {
        originalOrderNumber: source?.orderNumber,
        originalOrderStatus: source?.status || 'producción',
        damagedCount: damagedDetails.length,
        totalDamagedQty: damagedDetails.reduce((s, d) => s + (Number(d.quantity) || 0), 0),
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
        tipo: 'diseno',
        referencia: source.referencia || '',
        producto: source.producto || '',
        cantidad: String(primary.quantity || ''),
        color: primary.color || '',
        cliente: source.client || '',
        fechaSolicitud: '',
        referencias: damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '' })),
        fromDamaged: true,
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
    const now = new Date();
    const fecha = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    // Resumen por estado
    const statusSummary = filteredProductions.reduce((acc, p) => {
      const s = p.status || 'Sin estado';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const totalUnidades = filteredProductions.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const statusColor = (s) => {
      const map = {
        'Enviado': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
        'Producción': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
        'Corte': { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
        'Anulada': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
        'Diseño': { bg: '#f3e8ff', color: '#6b21a8', dot: '#a855f7' },
        'Terminado': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
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
      filterDateTo ? `Hasta: <strong>${esc(filterDateTo)}</strong>` : '',
      searchTerm ? `Búsqueda: <strong>"${esc(searchTerm)}"</strong>` : '',
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
  .brand-logo {
    width: 28px; height: 28px;
    object-fit: contain;
    filter: drop-shadow(0 0 6px rgba(255,79,214,0.5));
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
          <img src="data:image/png;base64,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" alt="Logo" class="brand-logo" />
          <span class="brand-name">Sistema de Producción</span>
        </div>
        <div class="doc-title">Órdenes de Producción</div>
        <div class="doc-subtitle">Informe administrativo y de reparto</div>
      </div>
      <div class="header-meta">
        <div><strong>Fecha:</strong> ${fecha}</div>
        <div><strong>Hora:</strong> ${hora}</div>
        <div><strong>Total órdenes:</strong> ${filteredProductions.length}</div>
        <div><span class="doc-id">OP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}</span></div>
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
  const hasAnyFilter = searchTerm || filterStatus !== 'Todos' || filterClient !== 'Todos' || hasDateFilter;

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
                    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
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
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
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
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Agregar
              </button>
              {/* Botón descargar (ícono) */}
              <button type="button" className="btn-icon" onClick={() => setDownloadModal(true)} title="Descargar órdenes">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              {/* Botón calendario (ícono) */}
              <button type="button" className="btn-icon" onClick={() => navigate('/layout/produccion/calendario')} title="Abrir calendario">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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
                  color: p === currentPage ? '#fff' : '#333',
                  border: p === currentPage ? '1px solid #ff4fd6' : '1px solid #ddd',
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