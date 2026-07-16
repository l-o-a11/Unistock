import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';
import ProductionTable from '../components/ProductionTable';
import ProductionSearch from '../components/ProductionSearch';
import ProductionForm from '../components/ProductionForm';
import DamagedProductsModal from '../components/DamagedProductsModal';
import Alert from '../../shared/components/Alert';
import Button from '../../shared/components/Button';
import putongasLogoUrl from '../../shared/assets/putongasLogo.png';

const DAMAGED_TRIGGER_STEPS = ['Corte', 'Producción'];

/* ─── Paleta empresa UniStock ───────────────────────────────────────────── */
const DARK1 = '#FF4FD6';
const DARK3 = '#cab8ec';
const PINK  = '#FF4FD6';

/* ══════════════════════════════════════════════════════════════════════
 * SKELETON — reproduce EXACTAMENTE el layout ya cargado (header, tabs,
 * barra de filtros con selects/fecha y los botones Agregar/Descargar/
 * Calendario, y la tarjeta de tabla) para que no haya salto visual.
 * ══════════════════════════════════════════════════════════════════════ */
const ProductionsSkeleton = () => (
  <div style={{ minHeight: '100vh', background: '#f6f6f8', fontFamily: 'sans-serif' }}>
    <style>{`
      @keyframes uloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
      @keyframes uskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

      .prod-skel-root { padding: 14px; }
      @media (min-width:640px)  { .prod-skel-root { padding: 20px 24px; } }
      @media (min-width:1024px) { .prod-skel-root { padding: 24px 32px; } }

      .prod-skel-header { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
      @media (min-width:640px) { .prod-skel-header { flex-direction:row; justify-content:space-between; align-items:center; } }

      .prod-skel-filters {
        background:#fff; border-radius:10px; padding:10px 14px;
        margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,0.07);
        display:flex; flex-direction:column; gap:10px;
      }
      @media (min-width:768px) { .prod-skel-filters { flex-direction:row; align-items:center; justify-content:space-between; } }

      .prod-skel-filter-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; min-width:0; flex:1; }
      .prod-skel-filter-right { flex-shrink:0; display:flex; gap:8px; justify-content:flex-end; }
      @media (max-width:767px) { .prod-skel-filter-right { width:100%; } }
    `}</style>

    <div className="prod-skel-root">
      {/* Header: título + buscador — mismo layout que ProductionSearch */}
      <div className="prod-skel-header">
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Orden de producción</h1>
        <div style={{
          width: 260, maxWidth: '100%', height: 36, borderRadius: 8,
          background: '#f3f4f6', border: '1px solid #e5e7eb',
          animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* Tabs: Producciones / Terceros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 108, height: 32, borderRadius: 8, background: PINK, opacity: 0.35,
          animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
        }} />
        <div style={{
          width: 84, height: 32, borderRadius: 8, background: '#eaeaea',
          animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* Barra de filtros: selects + fecha a la izq., botones a la der. */}
      <div className="prod-skel-filters">
        <div className="prod-skel-filter-left">
          <div style={{ width: 150, height: 30, borderRadius: 7, background: '#f3f4f6', border: '1px solid #e5e7eb', animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
          <div style={{ width: 150, height: 30, borderRadius: 7, background: '#f3f4f6', border: '1px solid #e5e7eb', animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
          <div style={{ width: 190, height: 30, borderRadius: 7, background: '#f3f4f6', border: '1px solid #e5e7eb', animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
        </div>
        <div className="prod-skel-filter-right">
          <div style={{ width: 100, height: 34, borderRadius: 8, background: PINK, opacity: 0.35, animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
          <div style={{ width: 36, height: 34, borderRadius: 8, background: '#f3f4f6', border: '1.5px solid #e5e7eb', animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
          <div style={{ width: 36, height: 34, borderRadius: 8, background: '#f3f4f6', border: '1.5px solid #e5e7eb', animation: 'uskeleton-pulse 1.6s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Tarjeta de tabla — mismo contenedor blanco redondeado */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 42, borderRadius: 8, background: i % 2 === 0 ? '#f9fafb' : '#fdf6ff',
              animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
              animationDelay: `${i * 0.07}s`,
            }} />
          ))}
        </div>
        <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)', animation: 'uloadbar 1.6s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Paginación */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: 30, height: 30, borderRadius: 6, background: '#f3f4f6', border: '1px solid #e5e7eb',
            animation: 'uskeleton-pulse 1.6s ease-in-out infinite', animationDelay: `${i * 0.05}s`,
          }} />
        ))}
      </div>
    </div>
  </div>
);

const ProductionsPage = () => {
  const navigate = useNavigate();
  const {
    Productions: productions,
    loading,
    createProduction,
    cancelProduction,
    fetchAndSetDetails,
    changeProductionStatus,
  } = useProductions();

  const [activeTab,       setActiveTab]       = useState('producciones');
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterStatus,    setFilterStatus]    = useState('Todos');
  const [filterClient,    setFilterClient]    = useState('Todos');
  const [filterDateFrom,  setFilterDateFrom]  = useState('');
  const [filterDateTo,    setFilterDateTo]    = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);

  const [cancelModal,     setCancelModal]     = useState({ open: false, id: null, motivo: '' });
  const [motivoError,     setMotivoError]     = useState('');
  const [damagedModal,    setDamagedModal]    = useState({ open: false, production: null });
  const [damagedOrderForm,setDamagedOrderForm]= useState({ open: false, initialData: null, notice: null });
  const [creatingNewOrder,setCreatingNewOrder]= useState(false);
  const [showCreateForm,  setShowCreateForm]  = useState(false);
  const [downloadModal,   setDownloadModal]   = useState(false);
  const [cancelAlert,     setCancelAlert]     = useState({ open: false, type: 'success', title: '', message: '' });
  const [isCancelling,   setIsCancelling]    = useState(false);

  const itemsPerPage  = 7;
  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status).filter(Boolean))];
  const uniqueClients  = ['Todos', ...new Set((productions || []).map(p => p.client).filter(Boolean))];

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
      || (prod?.details || []).some(d =>
          [d?.ref, d?.refCorte, d?.color, d?.status].some(v => (v || '').toLowerCase().includes(term)))
      || (prod?.history || []).some(h => (h?.motivo || '').toLowerCase().includes(term));

    const matchesStatus      = filterStatus === 'Todos' || prod?.status === filterStatus;
    const visibleByDefault   = filterStatus === 'Todos' ? !HIDDEN_STATUSES.includes(prod?.status) : true;
    const matchesClient      = filterClient === 'Todos' || prod?.client === filterClient;

    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const from = filterDateFrom ? new Date(filterDateFrom) : null;
      const to   = filterDateTo   ? new Date(filterDateTo)   : null;
      const inRange = (d) => {
        if (!d) return false;
        if (from && to) return d >= from && d <= to;
        if (from) return d >= from;
        if (to)   return d <= to;
        return true;
      };
      matchesDate = inRange(parseDate(prod?.deliveryDate)) || inRange(parseDate(prod?.statusDate));
    }
    return matchesSearch && matchesStatus && matchesClient && matchesDate && visibleByDefault;
  });

  const totalPages          = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex          = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  const openCancelModal  = (id) => { setCancelModal({ open: true, id, motivo: '' }); setMotivoError(''); };
  const closeCancelModal = ()   => { setCancelModal({ open: false, id: null, motivo: '' }); setMotivoError(''); };

  const confirmCancel = async () => {
    if (!cancelModal.motivo.trim()) { setMotivoError('El motivo es obligatorio'); return; }
    setIsCancelling(true);
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
    } finally {
      setIsCancelling(false);
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
        producto:   source?.producto   || '',
        cantidad:   String(primary.quantity || ''),
        color:      primary.color || '',
        cliente:    source?.client || '',
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
        tipo:         'diseno',
        referencia:   source.referencia || '',
        producto:     source.producto   || '',
        cantidad:     String(primary.quantity || ''),
        color:        primary.color || '',
        cliente:      source.client || '',
        fechaSolicitud: '',
        referencias:  damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '' })),
        fromDamaged:  true,
      });
      if (newOrder?.id) navigate(`/layout/produccion/detalle/${newOrder.id}`, { state: { openTechSheet: true } });
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

  const handleCreateFromModal = async (data) => {
    await createProduction(data);
    setShowCreateForm(false);
  };

  /* ══════════════════════════════════════════════════════════════════════
   * DESCARGA EXCEL — ExcelJS con estilos paleta empresa + logo Putongas
   * Sin negros en fondos: header magenta UniStock, filas rosas/blancas
   * ══════════════════════════════════════════════════════════════════════ */
  const handleDownloadExcel = async () => {
    setDownloadModal(false);

    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'UniStock';
    wb.created = new Date();

    const ws = wb.addWorksheet('Órdenes de Producción', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const now   = new Date();
    const fecha = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

    /* ── Columnas ── */
    ws.columns = [
      { key: 'orden',    width: 10 },
      { key: 'producto', width: 30 },
      { key: 'cliente',  width: 24 },
      { key: 'estado',   width: 16 },
      { key: 'cantidad', width: 12 },
      { key: 'color',    width: 16 },
      { key: 'entrega',  width: 16 },
    ];

    const ARGB = (hex) => 'FF' + hex.replace('#', '').toUpperCase();
    const fillSolid = (hex) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: ARGB(hex) } });
    // ✅ Fix: el borde por defecto ahora es rosado (antes blanco/invisible),
    // ya que es el único elemento que debe quedar en color — las celdas
    // siempre llevan fondo blanco.
    const thinBorder = (hex = '#FF4FD6') => {
      const c = { style: 'thin', color: { argb: ARGB(hex) } };
      return { top: c, bottom: c, left: c, right: c };
    };

    /* ── Logo Putongas (filas 1-4, columna A) ── */
    const logoRes = await fetch(putongasLogoUrl);
    const logoBlob = await logoRes.blob();
    const logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(logoBlob);
    });
    const logoImageId = wb.addImage({ base64: logoBase64, extension: 'png' });
    ws.addImage(logoImageId, { tl: { col: 0.15, row: 0.15 }, ext: { width: 46, height: 60 } });

    /* ── Fila 1: título (logo ocupa col A visualmente) ──
       ✅ Fix: fondo blanco (antes #FDF6FF) — para ahorrar tinta al imprimir
       solo el borde inferior queda en rosa, como línea divisoria. */
    ws.mergeCells('B1:G1');
    ws.getRow(1).height = 30;
    const titleCell = ws.getCell('B1');
    titleCell.value = 'Órdenes de Producción — Sistema de Gestión UniStock';
    titleCell.font = { name: 'Arial', size: 15, bold: true, color: { argb: '000000' } };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ['A1','B1','C1','D1','E1','F1','G1'].forEach(ref => { ws.getCell(ref).fill = fillSolid('#FFFFFF'); });

    /* ── Fila 2: subtítulo ── */
    ws.mergeCells('B2:G2');
    ws.getRow(2).height = 18;
    const subCell = ws.getCell('B2');
    subCell.value = `Generado el ${fecha}  ·  ${filteredProductions.length} orden${filteredProductions.length !== 1 ? 'es' : ''}`;
    subCell.font = { name: 'Arial', size: 10, color: { argb: '#000000' } };
    subCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ['A2','B2','C2','D2','E2','F2','G2'].forEach(ref => { ws.getCell(ref).fill = fillSolid('#FFFFFF'); });
    ws.getCell('B2').border = { bottom: { style: 'thin', color: { argb: ARGB('#FF4FD6') } } };

    /* ── Fila 3: separadora ── */
    ws.getRow(3).height = 6;
    ['A3','B3','C3','D3','E3','F3','G3'].forEach(ref => { ws.getCell(ref).fill = fillSolid('#ffffff'); });

    /* ── Fila 4: encabezados de columnas ──
       ✅ Fix: fondo blanco (antes magenta sólido #FF4FD6) — texto en
       magenta bold sobre blanco, con borde rosado grueso abajo y fino
       alrededor de cada celda. Así el único elemento rosado es el borde. */
    const headerRow = ws.getRow(4);
    headerRow.height = 26;
    const headers = ['Orden', 'Producto', 'Cliente', 'Estado', 'Cantidad', 'Color', 'F. Entrega'];
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: ARGB('#FF4FD6') } };
      cell.fill = fillSolid('#FFFFFF');
      cell.alignment = { horizontal: i === 4 ? 'right' : 'left', vertical: 'middle', indent: i === 4 ? 0 : 1 };
      const pinkThin = { style: 'thin', color: { argb: ARGB('#FF4FD6') } };
      cell.border = { top: pinkThin, left: pinkThin, right: pinkThin, bottom: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };
    });

    /* ── Filas de datos ──
       ✅ Fix: antes alternaba blanco/#FDF6FF (zebra rosada). Ahora todas
       las filas son blancas; el grid de celdas queda marcado por el
       borde rosado fino (thinBorder), que es el único color permitido
       fuera del texto. */
    filteredProductions.forEach((p, i) => {
      const row = ws.getRow(5 + i);
      row.height = 20;
      const baseFill = fillSolid('#FFFFFF');

      const values = [
        `#${p.orderNumber || ''}`,
        p.producto || p.referencia || '—',
        p.client   || '—',
        p.status   || '—',
        p.quantity ?? 0,
        p.color    || '—',
        p.deliveryDate || '—',
      ];

      values.forEach((v, ci) => {
        const cell = row.getCell(ci + 1);
        cell.value = v;
        cell.fill = baseFill;
        cell.border = thinBorder();
        cell.alignment = { horizontal: ci === 4 ? 'right' : 'left', vertical: 'middle', indent: ci === 4 ? 0 : 1 };
        cell.font = { name: 'Arial', size: 10, color: { argb: 'FF374151' } };
      });

      /* Número de orden: magenta bold */
      row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: ARGB('#FF4FD6') } };
      /* Cantidad: morado oscuro bold */
      row.getCell(5).font = { name: 'Arial', size: 10, bold: true, color: { argb: ARGB('#a858d6') } };
    });

    /* ── Fila de totales ── */
    const totalRowIdx   = filteredProductions.length + 6;
    const totalUnidades = filteredProductions.reduce((s, p) => s + (Number(p.quantity) || 0), 0);
    const totalRow = ws.getRow(totalRowIdx);

    const totalLabelCell = totalRow.getCell(2);
    totalLabelCell.value = 'Total unidades';
    totalLabelCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: ARGB('#363636') } };
    totalLabelCell.fill = fillSolid('#ffffff');
    totalLabelCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    totalLabelCell.border = { top: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };

    const totalValueCell = totalRow.getCell(5);
    totalValueCell.value = totalUnidades;
    totalValueCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: ARGB('#a858d6') } };
    totalValueCell.fill = fillSolid('#ffffff');
    totalValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
    totalValueCell.border = { top: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };

    /* Resto de celdas de la fila de totales — fondo blanco, borde rosado */
    [1, 3, 4, 6, 7].forEach(col => {
      const c = totalRow.getCell(col);
      c.fill = fillSolid('#FFFFFF');
      c.border = { top: { style: 'medium', color: { argb: ARGB('#FF4FD6') } } };
    });

    /* ── Generar y descargar ── */
    try {
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = 'ordenes-produccion.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generando Excel:', e);
      const rows = [
        ['Orden','Producto','Cliente','Estado','Cantidad','Color','F. Entrega'],
        ...filteredProductions.map((p) => [
          `#${p.orderNumber || ''}`,
          p.producto || p.referencia || '',
          p.client   || '',
          p.status   || '',
          p.quantity ?? 0,
          p.color    || '',
          p.deliveryDate || '',
        ]),
      ];
      const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = 'ordenes-produccion.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
   * DESCARGA PDF — sin degradados, sin negros en fondos, logo Putongas
   * Header: #ff4fd698 (morado suave)
   * Fecha/hora: blanco puro #ffffff
   * Tarjetas totales: rosas/lila planos
   * Color principal: #FF4FD6
   * ══════════════════════════════════════════════════════════════════════ */
  const handleDownloadPDF = () => {
    setDownloadModal(false);

    const now   = new Date();
    const fecha = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
    const hora  = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    const statusSummary = filteredProductions.reduce((acc, p) => {
      const s = p.status || 'Sin estado';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const totalUnidades = filteredProductions.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

    const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const statusBadge = () => ({
      bg:    '#ffffff',
      color: '#000000',
      dot:   '#FF4FD6',
    });

    const tableRows = filteredProductions.map((p, i) => {
      const sc = statusBadge();
      return `
        <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="td-order"><span class="order-num">#${esc(p.orderNumber)}</span></td>
          <td class="td-product">
            <span class="product-name">${esc(p.producto || p.referencia || '—')}</span>
            ${p.referencia ? `<span class="product-ref">Ref: ${esc(p.referencia)}</span>` : ''}
          </td>
          <td class="td-client">${esc(p.client || '—')}</td>
          <td class="td-qty"><span class="qty-badge">${esc(p.quantity ?? 0)}</span><span class="qty-label"> uds</span></td>
          <td class="td-color"><span class="color-pill">${esc(p.color || '—')}</span></td>
          <td class="td-date">${esc(p.deliveryDate || '—')}</td>
          <td class="td-status">
            <span class="status-badge" style="background:${sc.bg};color:${sc.color};">
              <span class="status-dot" style="background:${sc.dot};"></span>
              ${esc(p.status || '—')}
            </span>
          </td>
        </tr>`;
    }).join('');

    const summaryCards = Object.entries(statusSummary).map(([s, n]) => `
      <div class="sum-card">
        <span class="sum-count">${n}</span>
        <span class="sum-label">${esc(s)}</span>
      </div>`
    ).join('');

    const filterInfo = [
      filterStatus !== 'Todos' ? `Estado: <strong>${esc(filterStatus)}</strong>`       : '',
      filterClient !== 'Todos' ? `Cliente: <strong>${esc(filterClient)}</strong>`      : '',
      filterDateFrom           ? `Desde: <strong>${esc(filterDateFrom)}</strong>`      : '',
      filterDateTo             ? `Hasta: <strong>${esc(filterDateTo)}</strong>`        : '',
      searchTerm               ? `Búsqueda: <strong>"${esc(searchTerm)}"</strong>`    : '',
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Órdenes de Producción — ${fecha}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #2d1b4e; font-size: 11px; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; }

  /* ── Header: fondo BLANCO — el único elemento rosado es el borde
     inferior, para ahorrar tinta al imprimir. Antes tenía un fondo rosa
     semitransparente sólido + dos círculos decorativos rosados. ── */
  .header {
    background: #ffffff;
    border-bottom: 3px solid #FF4FD6;
    padding: 24px 32px 22px;
    position: relative;
    overflow: hidden;
  }
  .header-top  { display:flex; justify-content:space-between; align-items:flex-start; }
  .brand       { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .brand-logo  { width:32px; height:auto; display:block; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15)); }
  .brand-name  { font-size:11px; font-weight:600; color:#9ca3af; letter-spacing:0.12em; text-transform:uppercase; }
  .doc-title   { font-size:22px; font-weight:700; color:#2d1b4e; letter-spacing:-0.02em; line-height:1.2; }
  .doc-subtitle{ font-size:12px; color:#6b7280; margin-top:4px; }

  /* Fecha y hora: texto oscuro sobre fondo blanco, bien legible */
  .header-meta        { text-align:right; font-size:11px; color:#2d1b4e; line-height:2; }
  .header-meta strong { color:#2d1b4e; font-weight:700; font-size:12px; letter-spacing:0.02em; }

  .doc-id {
    display:inline-block; background:#ffffff; color:#FF4FD6;
    font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px;
    border:1px solid #FF4FD6; margin-top:6px; letter-spacing:0.06em;
  }

  .body { padding: 22px 32px 28px; }

  .filter-bar {
    background:#ffffff; border:1px solid #FF4FD6; border-radius:8px;
    padding:8px 14px; margin-bottom:18px; font-size:10px; color:#6b7280;
    display:flex; align-items:center; gap:6px; flex-wrap:wrap;
  }
  .filter-bar strong { color:#2d1b4e; }

  /* ── Resumen estados — fondo blanco, borde rosado ── */
  .summary    { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
  .sum-card   {
    flex:1; min-width:90px; background:#ffffff; border:1px solid #FF4FD6;
    border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:2px;
  }
  .sum-count  { font-size:20px; font-weight:800; line-height:1; color:#FF4FD6; }
  .sum-label  { font-size:9.5px; color:#9ca3af; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; }

  /* ── Tarjetas totales: fondo blanco uniforme, solo borde rosado ── */
  .totals-row { display:flex; gap:12px; margin-bottom:22px; }
  .total-card { flex:1; border-radius:10px; padding:14px 18px; background:#ffffff; border:1.5px solid #FF4FD6; }
  .total-val   { font-size:26px; font-weight:800; line-height:1; letter-spacing:-0.03em; color:#FF4FD6; }
  .total-label { font-size:10px; color:#6b7280; margin-top:3px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; }

  /* ── Tabla ── */
  .section-title {
    font-size:10px; font-weight:700; color:#9ca3af;
    text-transform:uppercase; letter-spacing:0.1em;
    margin-bottom:10px; display:flex; align-items:center; gap:7px;
  }
  .section-title::after { content:''; flex:1; height:1px; background:#FF4FD6; }

  /* ✅ Fix: encabezado de tabla con fondo blanco (antes rosa sólido) y
     texto en rosa; el borde inferior grueso rosado marca la separación.
     Las filas ya no alternan zebra rosada — todas quedan en blanco. */
  table           { width:100%; border-collapse:collapse; font-size:10.5px; }
  thead tr        { background:#ffffff; border-bottom:2px solid #FF4FD6; }
  thead th        { padding:9px 10px; text-align:left; color:#FF4FD6; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; }
  .row-even, .row-odd { background:#ffffff; }
  tbody tr        { border-bottom:1px solid #fbcfe8; }
  td              { padding:9px 10px; vertical-align:middle; }

  .td-order .order-num    { font-size:12px; font-weight:800; color:#FF4FD6; letter-spacing:-0.02em; }
  .td-product .product-name { display:block; font-weight:600; color:#2d1b4e; font-size:10.5px; }
  .td-product .product-ref  { display:block; font-size:9px; color:#9ca3af; margin-top:1px; }
  .td-client      { color:#374151; font-weight:500; }
  .td-qty         { text-align:right; white-space:nowrap; }
  .qty-badge      { font-size:12px; font-weight:800; color:#2d1b4e; }
  .qty-label      { font-size:9px; color:#9ca3af; }
  .td-color .color-pill { background:#ffffff; border-radius:4px; padding:2px 7px; font-size:9.5px; color:#000000; font-weight:500; }
  .td-date        { color:#6b7280; font-variant-numeric:tabular-nums; }

  .status-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 8px; border-radius:20px; font-size:9.5px; font-weight:700; white-space:nowrap;
  }
  .status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  .divider { border:none; border-top:2px dashed #FF4FD6; margin:22px 0; }

  /* ── Tarjetas reparto ── */
  .reparto-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .reparto-card { border:1.5px solid #FF4FD6; border-radius:8px; padding:12px 14px; background:#ffffff; page-break-inside:avoid; }
  .reparto-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #fbcfe8; }
  .reparto-order        { font-size:14px; font-weight:800; color:#FF4FD6; }
  .reparto-status-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:20px; font-size:8.5px; font-weight:700; }
  .reparto-field { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px; font-size:10px; }
  .reparto-key   { color:#9ca3af; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  .reparto-val   { color:#2d1b4e; font-weight:600; text-align:right; max-width:60%; word-break:break-word; }
  .reparto-qty-big { font-size:18px; font-weight:900; color:#2d1b4e; letter-spacing:-0.03em; }
  .check-box     { width:14px; height:14px; border:1.5px solid #FF4FD6; border-radius:3px; display:inline-block; flex-shrink:0; }
  .reparto-verify{ display:flex; align-items:center; gap:7px; margin-top:10px; padding-top:8px; border-top:1px dashed #FF4FD6; font-size:9px; color:#9ca3af; }

  /* ── Footer ──
     ✅ Fix: color de texto era #ffffff sobre fondo #ffffff — invisible.
     Ahora es gris oscuro, legible, con borde superior rosado. */
  .footer { background:#ffffff; border-top:2px solid #FF4FD6; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#6b7280; margin-top:auto; }
  .footer strong { color:#2d1b4e; }
  .footer-sig    { text-align:right; line-height:1.6; }
  .footer-brand  { display:flex; align-items:center; gap:8px; }
  .footer-logo   { width:18px; height:auto; display:block; }

  @media print {
    body { background:#fff; }
    .page { width:100%; margin:0; }
    .no-print { display:none !important; }
    thead { display:table-header-group; }
    tr, .reparto-card { page-break-inside:avoid; }
  }
  .print-bar { display:flex; justify-content:flex-end; padding:12px 32px 0; gap:10px; }
  .btn-print { background:#FF4FD6; color:#fff; border:none; border-radius:8px; padding:9px 20px; font-size:12px; font-weight:700; cursor:pointer; }
  .btn-close { background:#ffffff; color:#2d1b4e; border:none; border-radius:8px; padding:9px 16px; font-size:12px; font-weight:600; cursor:pointer; }
</style>
</head>
<body>
<div class="print-bar no-print">
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
  <button class="btn-print" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
</div>

<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand">
          <img class="brand-logo" src="${putongasLogoUrl}" alt="Putongas"/>
          <span class="brand-name">Putongas · Sistema de Producción</span>
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
    ${filterInfo ? `<div class="filter-bar"><strong>Filtros aplicados:</strong> ${filterInfo}</div>` : ''}

    <div class="totals-row">
      <div class="total-card tc-a">
        <div class="total-val">${filteredProductions.length}</div>
        <div class="total-label">Total de órdenes</div>
      </div>
      <div class="total-card tc-b">
        <div class="total-val">${totalUnidades.toLocaleString('es-CO')}</div>
        <div class="total-label">Unidades totales</div>
      </div>
      <div class="total-card tc-c">
        <div class="total-val">${Object.keys(statusSummary).length}</div>
        <div class="total-label">Estados activos</div>
      </div>
    </div>

    <div class="section-title">Desglose por estado</div>
    <div class="summary">${summaryCards}</div>

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
          <th style="width:110px">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="7" style="text-align:center;padding:24px;color:#9ca3af;">Sin órdenes para mostrar</td></tr>'}
      </tbody>
    </table>

    <hr class="divider"/>

    <div class="section-title">Tarjetas de reparto</div>
    <div class="reparto-grid">
      ${filteredProductions.map((p) => {
        const sc = statusBadge();
        return `
        <div class="reparto-card">
          <div class="reparto-card-header">
            <div>
              <div class="reparto-order">#${esc(p.orderNumber)}</div>
              <div style="font-size:10px;color:#2d1b4e;font-weight:600;margin-top:2px;">${esc(p.producto || p.referencia || '—')}</div>
            </div>
            <div>
              <span class="reparto-status-badge" style="background:${sc.bg};color:${sc.color};">
                <span class="status-dot" style="background:${sc.dot};"></span>
                ${esc(p.status || '—')}
              </span>
            </div>
          </div>
          <div class="reparto-field"><span class="reparto-key">Cliente</span><span class="reparto-val">${esc(p.client || '—')}</span></div>
          <div class="reparto-field"><span class="reparto-key">Referencia</span><span class="reparto-val">${esc(p.referencia || '—')}</span></div>
          <div class="reparto-field"><span class="reparto-key">Color</span><span class="reparto-val">${esc(p.color || '—')}</span></div>
          <div class="reparto-field"><span class="reparto-key">Entrega</span><span class="reparto-val">${esc(p.deliveryDate || '—')}</span></div>
          <div class="reparto-field" style="margin-top:6px;">
            <span class="reparto-key">Cantidad</span>
            <span class="reparto-qty-big">${esc(p.quantity ?? 0)}<span style="font-size:10px;font-weight:500;color:#9ca3af;"> uds</span></span>
          </div>
          <div class="reparto-verify">
            <span class="check-box"></span>
            Verificado por: ____________________________
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">
      <img class="footer-logo" src="${putongasLogoUrl}" alt="Putongas"/>
      <div>
        <strong>Putongas · Sistema de Gestión de Producción</strong><br/>
        Documento generado automáticamente · ${fecha} ${hora}
      </div>
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
    if (win) { win.document.write(html); win.document.close(); }
  };

  /* ── Paginación ── */
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

  if (loading && (productions || []).length === 0) return <ProductionsSkeleton />;

  /* ══════════════════════════════════════════════════════════════════════
   * RENDER — idéntico al original
   * ══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f8', fontFamily: 'sans-serif' }}>

      <style>{`
        @keyframes pSpin  { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

        .prod-root { padding: 14px; }
        @media (min-width:640px)  { .prod-root { padding: 20px 24px; } }
        @media (min-width:1024px) { .prod-root { padding: 24px 32px; } }

        .prod-header { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
        @media (min-width:640px) { .prod-header { flex-direction:row; justify-content:space-between; align-items:center; } }

        .prod-filters {
          background:#fff; border-radius:10px; padding:10px 14px;
          margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,0.07);
          display:flex; flex-direction:column; gap:10px;
        }
        @media (min-width:768px) { .prod-filters { flex-direction:row; align-items:center; justify-content:space-between; } }

        .prod-filter-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; min-width:0; flex:1; }
        .prod-filter-right { flex-shrink:0; }
        @media (max-width:767px) { .prod-filter-right { width:100%; display:flex; justify-content:flex-end; } }

        .prod-select { padding:6px 10px; border-radius:7px; border:1px solid #e5e7eb; background:#fafafa; font-size:12px; cursor:pointer; flex:1; min-width:110px; max-width:160px; }
        @media (max-width:480px) { .prod-select { max-width:none; width:auto; flex:1 1 auto; } }

        .prod-date-input { border:none; background:transparent; font-size:12px; outline:none; cursor:pointer; width:110px; }
        @media (max-width:420px) { .prod-date-input { width:90px; font-size:11px; } }

        .prod-date-block { display:flex; align-items:center; gap:4px; border:1px solid #e5e7eb; background:#fafafa; border-radius:7px; padding:4px 8px; flex-wrap:nowrap; }
        .prod-date-block.active { border-color:${PINK}; background:#fff0fb; }

        .btn-agregar {
          border:none; border-radius:8px; background:${PINK}; color:#fff;
          font-size:13px; font-weight:600; padding:8px 16px; cursor:pointer;
          display:flex; align-items:center; gap:6px;
          box-shadow:0 2px 8px rgba(255,79,214,0.3);
          transition:background 0.15s, box-shadow 0.15s;
        }
        .btn-agregar:hover { background:#e040c0; box-shadow:0 4px 14px rgba(255,79,214,0.4); }

        .btn-icon {
          border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#374151;
          font-size:13px; font-weight:600; padding:8px 11px; cursor:pointer;
          display:flex; align-items:center; gap:6px;
          transition:border-color 0.15s, background 0.15s;
        }
        .btn-icon:hover { border-color:#d1d5db; background:#f9fafb; }

        .cancel-modal { border-radius:16px; padding:20px 18px; background:#fff; box-shadow:0 8px 30px rgba(0,0,0,0.18); border:2px solid #ef4444; width:calc(100vw - 32px); max-width:420px; }
        @media (min-width:480px) { .cancel-modal { padding:24px; } }

        .download-modal { border-radius:16px; padding:24px; background:#fff; box-shadow:0 12px 40px rgba(0,0,0,0.18); width:calc(100vw - 32px); max-width:360px; animation:fadeIn 0.18s ease; }
        .download-opt-btn { width:100%; display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:10px; cursor:pointer; border:1.5px solid #e5e7eb; background:#fafafa; text-align:left; transition:border-color 0.15s,background 0.15s; }
        .download-opt-btn:hover { border-color:${PINK}; background:#fff0fb; }
        .download-opt-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        .prod-page-btn { padding:6px 11px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer; font-size:13px; }
        @media (max-width:480px) { .prod-page-btn { padding:5px 8px; font-size:12px; } }

        .prod-filter-hint { font-size:10px; color:#9ca3af; font-style:italic; white-space:nowrap; }
        @media (max-width:400px) { .prod-filter-hint { display:none; } }
      `}</style>

      <Alert
        isOpen={cancelAlert.open}
        type={cancelAlert.type}
        title={cancelAlert.title}
        message={cancelAlert.message}
        onConfirm={() => setCancelAlert(p => ({ ...p, open: false }))}
        onCancel={() => setCancelAlert(p => ({ ...p, open: false }))}
      />

      {/* ── Modal descarga ── */}
      {downloadModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1200, padding:'0 16px' }}>
          <div className="download-modal">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:DARK1 }}>Descargar órdenes</h3>
                <p style={{ margin:'3px 0 0', fontSize:12, color:'#888' }}>Elige el formato de exportación</p>
              </div>
              <button onClick={() => setDownloadModal(false)} style={{ border:'none', background:'none', cursor:'pointer', color:'#9ca3af', fontSize:20, lineHeight:1, padding:4 }}>×</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* Excel */}
              <button className="download-opt-btn" onClick={handleDownloadExcel}>
                <div className="download-opt-icon" style={{ background:'#ffffff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:DARK1 }}>Excel (.xlsx)</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#6b7280' }}>Tabla estilada con colores de la empresa y logo</p>
                </div>
              </button>
              {/* PDF */}
              <button className="download-opt-btn" onClick={handleDownloadPDF}>
                <div className="download-opt-icon" style={{ background:'#ffffff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:DARK1 }}>PDF</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#6b7280' }}>Documento listo para imprimir o compartir, con logo</p>
                </div>
              </button>
            </div>
            <p style={{ margin:'14px 0 0', fontSize:11, color:'#d1d5db', textAlign:'center' }}>
              {filteredProductions.length} orden{filteredProductions.length !== 1 ? 'es' : ''} se exportará{filteredProductions.length !== 1 ? 'n' : ''}
            </p>
          </div>
        </div>
      )}

      {/* ── Spinner creando orden ── */}
      {creatingNewOrder && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1500, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, display:'flex', flexDirection:'column', alignItems:'center', gap:14, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', margin:'0 16px' }}>
            <div style={{ width:40, height:40, border:'3px solid #f3f4f6', borderTopColor:PINK, borderRadius:'50%', animation:'pSpin 0.7s linear infinite' }}/>
            <p style={{ margin:0, fontSize:14, fontWeight:600, color:'#374151' }}>Creando orden de reposición...</p>
          </div>
        </div>
      )}

      {/* ── Modal anulación ── */}
      {cancelModal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1100, padding:'0 16px' }}>
          <div className="cancel-modal">
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Anular orden de producción</h3>
                <p style={{ margin:'3px 0 0', fontSize:12, color:'#888' }}>Esta acción quedará registrada en el historial.</p>
              </div>
            </div>
            {(() => {
              const prod = (productions || []).find(p => p.id === cancelModal.id);
              return prod && DAMAGED_TRIGGER_STEPS.includes(prod.status) ? (
                <div style={{ padding:'8px 12px', borderRadius:8, background:'#fef3c7', border:'1px solid #fcd34d', marginBottom:14, fontSize:12, color:'#92400e', display:'flex', gap:7, alignItems:'flex-start' }}>
                  <span style={{ flexShrink:0 }}>⚠️</span>
                  <span>Esta orden está en <strong>{prod.status}</strong>. Al anularla podrás gestionar los artículos dañados y crear una reposición.</span>
                </div>
              ) : null;
            })()}
            <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:6 }}>Motivo de anulación *</label>
            <textarea
              value={cancelModal.motivo}
              onChange={(e) => { setCancelModal(p => ({ ...p, motivo: e.target.value })); setMotivoError(''); }}
              placeholder="Describe el motivo..."
              rows={3}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, boxSizing:'border-box', border: motivoError ? `2px solid ${PINK}` : '1.5px solid #d1d5db', fontSize:13, resize:'vertical', outline:'none' }}
            />
            {motivoError && <p style={{ color:PINK, fontSize:11, marginTop:4, fontWeight:'bold' }}>{motivoError}</p>}
            <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Button type="button" variant="secondary" onClick={closeCancelModal} disabled={isCancelling}>Cancelar</Button>
              <Button type="button" variant="danger" onClick={confirmCancel} loading={isCancelling} loadingText="Anulando...">Confirmar anulación</Button>
            </div>
          </div>
        </div>
      )}

      <DamagedProductsModal
        isOpen={damagedModal.open}
        production={damagedModal.production}
        onClose={() => setDamagedModal({ open: false, production: null })}
        onNewOrder={handleNewOrderFromDamaged}
        onNewTechSheet={handleNewTechSheetFromDamaged}
      />

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
          <h1 style={{ fontSize:26, fontWeight:700, margin:0 }}>Orden de producción</h1>
          <ProductionSearch value={searchTerm} onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }} />
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {['producciones','terceros'].map(tab => (
            <button key={tab}
              onClick={() => tab === 'terceros' ? navigate('/Layout/terceros') : setActiveTab(tab)}
              style={{ padding:'7px 16px', borderRadius:8, border:'none', background: activeTab === tab ? PINK : '#eaeaea', color: activeTab === tab ? '#fff' : '#444', cursor:'pointer', fontWeight:500, fontSize:13, textTransform:'capitalize' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="prod-filters">
          <div className="prod-filter-left">

            <select className="prod-select" value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              {uniqueStatuses.map((s, i) => (
                <option key={i} value={s}>{s === 'Todos' ? 'Estado: Activas' : s}</option>
              ))}
            </select>

            <select className="prod-select" value={filterClient}
              onChange={(e) => { setFilterClient(e.target.value); setCurrentPage(1); }}>
              {uniqueClients.map((c, i) => (
                <option key={i} value={c}>{c === 'Todos' ? 'Cliente: Todos' : c}</option>
              ))}
            </select>

            <div className={`prod-date-block${hasDateFilter ? ' active' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={hasDateFilter ? PINK : '#aaa'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input className="prod-date-input" type="date" value={filterDateFrom}
                onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }} title="Fecha desde"/>
              <span style={{ fontSize:11, color:'#bbb', fontWeight:500, flexShrink:0 }}>→</span>
              <input className="prod-date-input" type="date" value={filterDateTo}
                onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }} title="Fecha hasta"/>
              {hasDateFilter && (
                <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }}
                  style={{ border:'none', background:'none', cursor:'pointer', color:PINK, fontSize:15, lineHeight:1, padding:0, marginLeft:2, flexShrink:0 }}>×</button>
              )}
            </div>

            {hasAnyFilter && (
              <span style={{ fontSize:11, color:PINK, fontWeight:700, whiteSpace:'nowrap' }}>
                {filteredProductions.length} resultado{filteredProductions.length !== 1 ? 's' : ''}
              </span>
            )}
            {hasAnyFilter && (
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus('Todos'); setFilterClient('Todos'); setFilterDateFrom(''); setFilterDateTo(''); setCurrentPage(1); }}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:7, border:'1.5px solid #fca5a5', background:'#fff5f5', color:'#ef4444', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Limpiar
              </button>
            )}
          </div>

          <div className="prod-filter-right">
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end', alignItems:'center' }}>
              <button type="button" className="btn-agregar" onClick={() => setShowCreateForm(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Agregar
              </button>
              <button type="button" className="btn-icon" onClick={() => setDownloadModal(true)} title="Descargar órdenes">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button type="button" className="btn-icon" onClick={() => navigate('/layout/produccion/calendario')} title="Abrir calendario">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {filterStatus === 'Todos' && (
          <div style={{ marginTop:-6, marginBottom:10 }}>
            <span className="prod-filter-hint">Anuladas y entregadas ocultas</span>
          </div>
        )}

        <div style={{ background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflowX:'auto' }}>
          <ProductionTable productions={paginatedProductions} onCancel={openCancelModal} onExpandRow={fetchAndSetDetails}/>
        </div>

        {/* Paginación */}
        <div style={{ marginTop:16, display:'flex', justifyContent:'center', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          <button className="prod-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
          {getPageNumbers().map((p, i) =>
            p === '...'
              ? <span key={i} style={{ padding:'6px 4px', fontSize:13 }}>…</span>
              : <button key={p} className="prod-page-btn" onClick={() => setCurrentPage(p)}
                  style={{ background: p === currentPage ? PINK : '#fff', color: p === currentPage ? '#fff' : '#333', border: p === currentPage ? `1px solid ${PINK}` : '1px solid #ddd' }}>
                  {p}
                </button>
          )}
          <button className="prod-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
        </div>
      </div>
    </div>
  );
};

export default ProductionsPage;