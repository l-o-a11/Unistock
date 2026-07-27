import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../../shared/components/LoadingState';
import { useSedeScope } from '../../../shared/hooks/useSedeScope';
import { ProductionAPIClient } from '../../services/ProductionAPIClient';

// ── Icons ───────────────────────────────────────────────────────────────────
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);
const IconBan = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IconPackage = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l9 4.9V17L12 22 3 17V6.9z" /><polyline points="3,6.9 12,12 21,6.9" /><line x1="12" y1="12" x2="12" y2="22" />
  </svg>
);
const IconUser = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  'Diseño': { bg: '#f3e8ff', color: '#7c3aed', dot: '#a855f7' },
  'Ficha Técnica': { bg: '#e0f2fe', color: '#0369a1', dot: '#38bdf8' },
  'Corte': { bg: '#dbeafe', color: '#1d4ed8', dot: '#60a5fa' },
  'Compras': { bg: '#fef3c7', color: '#b45309', dot: '#fbbf24' },
  'Producción': { bg: '#fce7f3', color: '#be185d', dot: '#f472b6' },
  // ✅ Fix: "Empaque" renombrado a "Recepción" — se mantiene la entrada
  // legada para órdenes antiguas que aún tengan ese estado guardado en BD.
  'Recepción': { bg: '#dcfce7', color: '#15803d', dot: '#4ade80' },
  'Empaque': { bg: '#dcfce7', color: '#15803d', dot: '#4ade80' },
  'Enviado': { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  'Anulada': { bg: '#fee2e2', color: '#dc2626', dot: '#f87171' },
  'En producción': { bg: '#fce7f3', color: '#be185d', dot: '#f472b6' },
  'En corte': { bg: '#dbeafe', color: '#1d4ed8', dot: '#60a5fa' },
};

const getStatus = (s) => STATUS_MAP[s] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };

const StatusBadge = ({ status, small }) => {
  const s = getStatus(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      padding: small ? '3px 8px' : '4px 10px',
      borderRadius: 20, fontSize: small ? 10 : 11,
      fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const ProductionTable = ({ productions = [], onCancel, onExpandRow, onConfirmar }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, prod: null });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();
  const { isGerente, isAdministrador, isEmpleado } = useSedeScope();
  const esEmpleado = isEmpleado;

  if (!productions || productions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
        <p style={{ margin: 0, fontWeight: 500 }}>No hay producciones para mostrar</p>
        <p style={{ margin: '0 0 0', fontSize: 12 }}>Crea una nueva orden usando el botón "Agregar"</p>
      </div>
    );
  }

  const TH = ({ children, center, minWidth }) => (
    <th style={{
      padding: '11px 14px', textAlign: center ? 'center' : 'left',
      fontSize: 11, fontWeight: 700, color: '#9ca3af',
      background: '#f9fafb', borderBottom: '1px solid #f0f0f0',
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
      minWidth: minWidth || undefined,
    }}>{children}</th>
  );

  return (
    <>
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
        <thead>
          <tr>
            <TH>Orden</TH>
            <TH>Producto / Artículo</TH>
            <TH center>Cant.</TH>
            <TH>Color</TH>
            <TH>Entrega</TH>
            <TH>Estado</TH>
            <TH>Cliente</TH>
            <TH center minWidth={180}>Acciones</TH>
          </tr>
        </thead>
        <tbody>
          {productions.map((prod, idx) => {
            const isOpen = expandedRow === prod.id;
            const isAnulada = prod.status === 'Anulada';
            const rowBg = isOpen ? '#fdf4ff' : (idx % 2 === 0 ? '#fff' : '#fdfcff');

            return (
              <React.Fragment key={prod.id}>
                {/* ── Fila principal ── */}
                <tr
                  style={{ background: rowBg, transition: 'background 0.15s', cursor: 'default' }}
                  onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = '#fef9ff'; }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = rowBg; }}
                >
                  {/* # Orden */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 44, height: 26, borderRadius: 7,
                      background: isAnulada ? '#fee2e2' : '#fdf4ff',
                      color: '#FF4FD6',
                      fontSize: 12, fontWeight: 800, letterSpacing: '0.02em',
                    }}>#{prod.orderNumber}</span>
                  </td>

                  {/* Producto */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconPackage />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>
                          {prod.producto || prod.referencia || '—'}
                        </div>
                        {prod.referencia && prod.producto !== prod.referencia && (
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Ref: {prod.referencia}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cantidad */}
                  <td style={{ padding: '12px 14px', textAlign: 'center', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                      {(prod.quantity || 0).toLocaleString('es-CO')}
                    </span>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>uds</div>
                  </td>

                  {/* Color — todos los colores de la orden */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6' }}>
                    {(() => {
                      const allColors = [
                        ...(prod.color ? [prod.color] : []),
                        ...((prod.details || []).map(d => d.color).filter(Boolean)),
                      ];
                      const uniqueColors = [...new Set(allColors.map(c => c.trim()))];
                      return (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {uniqueColors.length > 0 ? uniqueColors.map((c, ci) => (
                            <span key={`${prod.id}-color-${c}-${ci}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '2px 7px', fontSize: 10, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
                              {c}
                            </span>
                          )) : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Fecha entrega */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                      <IconCalendar />
                      <span style={{ fontSize: 12 }}>{prod.deliveryDate || '—'}</span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6' }}>
                    <StatusBadge status={prod.status} />
                    {prod.statusDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                        <IconCalendar />
                        <span style={{ fontSize: 10, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                          {prod.statusDate}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Cliente */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6', maxWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconUser />
                      </div>
                      <span style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.client || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '12px 14px', borderBottom: isOpen ? 'none' : '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' }}>

                      {esEmpleado ? (
                        <>
                          {/* Empleado: botón de acordeón para ver artículos */}
                          <button
                            title={isOpen ? 'Ocultar artículos' : 'Ver artículos'}
                            disabled={loadingDetailId === prod.id}
                            onClick={async () => {
                              const next = isOpen ? null : prod.id;
                              setExpandedRow(next);
                              if (next && typeof onExpandRow === 'function') {
                                setLoadingDetailId(prod.id);
                                try {
                                  await Promise.resolve(onExpandRow(prod.id));
                                } catch (err) {
                                  console.error('[ProductionTable] Error cargando detalles:', err);
                                } finally {
                                  setLoadingDetailId(null);
                                }
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 8px', borderRadius: 7,
                              border: `1px solid ${isOpen ? '#f6b8e7' : '#e5e7eb'}`,
                              background: isOpen ? '#fffff4' : '#fff',
                              color: isOpen ? '#FF4FD6' : '#6b7280',
                              cursor: loadingDetailId === prod.id ? 'wait' : 'pointer',
                              fontSize: 10, fontWeight: 700,
                              transition: 'all 0.15s',
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                          >
                            {loadingDetailId === prod.id ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                <Spinner size={14} color="#FF4FD6" trackColor="#fde6f7" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF4FD6' }}>Cargando...</span>
                              </span>
                            ) : (
                              <>
                                <IconChevron open={isOpen} />
                                {(prod.details || []).length > 0 && (
                                  <span style={{
                                    minWidth: 16, height: 16, borderRadius: 8,
                                    background: isOpen ? '#FF4FD6' : '#e5e7eb',
                                    color: isOpen ? '#fff' : '#6b7280',
                                    fontSize: 9, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s', flexShrink: 0,
                                  }}>
                                    {(prod.details || []).length}
                                  </span>
                                )}
                              </>
                            )}
                          </button>

                          {/* Empleado: botón de detalle */}
                          <button
                            title="Ver detalle"
                            disabled={isAnulada}
                            onClick={() => !isAnulada && navigate(`/layout/produccion/detalle/${prod.id}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 7,
                              border: '1px solid #e5e7eb', background: isAnulada ? '#f9fafb' : '#fff',
                              color: isAnulada ? '#d1d5db' : '#6b7280',
                              cursor: isAnulada ? 'not-allowed' : 'pointer',
                              fontSize: 11, fontWeight: 600,
                              transition: 'all 0.15s',
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                            onMouseEnter={(e) => { if (!isAnulada) { e.currentTarget.style.background = '#fdf4ff'; e.currentTarget.style.color = '#FF4FD6'; e.currentTarget.style.borderColor = '#FF4FD6'; } }}
                            onMouseLeave={(e) => { if (!isAnulada) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; } }}
                          >
                            <IconEye />
                          </button>

                          {/* Empleado: botón confirmar avance de etapa (cambiar estado) */}
                          <button
                            title="Confirmar finalización de etapa"
                            disabled={isAnulada}
                            onClick={() => !isAnulada && setConfirmModal({ open: true, prod })}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                              padding: '6px 14px', borderRadius: 7, border: 'none',
                              background: isAnulada ? '#f3f4f6' : '#FF4FD6',
                              color: isAnulada ? '#9ca3af' : '#fff',
                              cursor: isAnulada ? 'not-allowed' : 'pointer',
                              fontSize: 11, fontWeight: 700,
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                          >
                            Confirmar
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Ver detalle — Gerente y Administrador (observador) */}
                          <button
                            title="Ver detalle"
                            onClick={() => navigate(`/layout/produccion/detalle/${prod.id}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 7,
                              border: '1px solid #e5e7eb', background: '#fff',
                              color: '#6b7280', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                              transition: 'all 0.15s',
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf4ff'; e.currentTarget.style.color = '#FF4FD6'; e.currentTarget.style.borderColor = '#FF4FD6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                          >
                            <IconEye />
                          </button>

                          {/* Anular — exclusivo de Gerente, el Administrador solo observa */}
                          {isGerente && (
                            <button
                              title={isAnulada ? 'Ya anulada' : 'Anular orden'}
                              disabled={isAnulada}
                              onClick={() => !isAnulada && onCancel?.(prod.id)}
                              style={{
                                display: 'flex', alignItems: 'center',
                                padding: '5px 8px', borderRadius: 7,
                                border: '1px solid #e5e7eb',
                                background: isAnulada ? '#f9fafb' : '#fff',
                                color: isAnulada ? '#d1d5db' : '#262747',
                                cursor: isAnulada ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => { if (!isAnulada) { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444'; } }}
                              onMouseLeave={(e) => { if (!isAnulada) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; } }}
                            >
                              <IconBan />
                            </button>
                          )}

                          {/* Acordeón toggle */}
                          <button
                            title={isOpen ? 'Ocultar artículos' : 'Ver artículos'}
                            disabled={loadingDetailId === prod.id}
                            onClick={async () => {
                              const next = isOpen ? null : prod.id;
                              setExpandedRow(next);
                              if (next && typeof onExpandRow === 'function') {
                                setLoadingDetailId(prod.id);
                                try {
                                  await Promise.resolve(onExpandRow(prod.id));
                                } catch (err) {
                                  console.error('[ProductionTable] Error cargando detalles:', err);
                                } finally {
                                  setLoadingDetailId(null);
                                }
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 8px', borderRadius: 7,
                              border: `1px solid ${isOpen ? '#f6b8e7' : '#e5e7eb'}`,
                              background: isOpen ? '#fffff4' : '#fff',
                              color: isOpen ? '#FF4FD6' : '#6b7280',
                              cursor: loadingDetailId === prod.id ? 'wait' : 'pointer', fontSize: 10, fontWeight: 700,
                              transition: 'all 0.15s',
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                            onMouseEnter={(e) => { if (!isOpen && loadingDetailId !== prod.id) { e.currentTarget.style.background = '#fdf4ff'; e.currentTarget.style.color = '#d4c3d0'; e.currentTarget.style.borderColor = '#120b11'; } }}
                            onMouseLeave={(e) => { if (!isOpen && loadingDetailId !== prod.id) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; } }}
                          >
                            {loadingDetailId === prod.id ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                <Spinner size={14} color="#FF4FD6" trackColor="#fde6f7" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF4FD6' }}>Cargando...</span>
                              </span>
                            ) : (
                              <>
                                <IconChevron open={isOpen} />
                                {(prod.details || []).length > 0 && (
                                  <span style={{
                                    minWidth: 16, height: 16, borderRadius: 8,
                                    background: isOpen ? '#FF4FD6' : '#e5e7eb',
                                    color: isOpen ? '#fff' : '#6b7280',
                                    fontSize: 9, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s', flexShrink: 0,
                                  }}>
                                    {(prod.details || []).length}
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>

                {/* ── Fila acordeón ── */}
                {isOpen && (
                  <tr>
                    <td colSpan="8" style={{ padding: 0, background: '#fcf7ff', borderBottom: '2px solid #f5ddfb' }}>

                      {/* Header del panel */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 18px 8px',
                        borderBottom: '1px solid #f3e8ff',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 4, height: 16, borderRadius: 2, background: '#FF4FD6' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#6b21a8', letterSpacing: '0.04em' }}>
                            ARTÍCULOS DE LA ORDEN #{prod.orderNumber}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#FF4FD6',
                            background: '#fff', border: '1px solid #f5d0fe',
                            padding: '1px 7px', borderRadius: 10,
                          }}>
                            {(prod.details || []).length} artículo{(prod.details || []).length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Info resumen rápido */}
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}>
                            <IconUser />
                            <span>{prod.client}</span>
                          </div>
                          <StatusBadge status={prod.status} small />
                          <button
                            onClick={() => navigate(`/layout/produccion/detalle/${prod.id}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '5px 12px', borderRadius: 7,
                              border: 'none', background: '#FF4FD6',
                              color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            <IconEye />
                            Ver detalle completo
                          </button>
                        </div>
                      </div>

                      {/* Sub-tabla artículos */}
                      {(prod.details || []).length === 0 ? (
                        <div style={{ padding: '16px 18px', color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
                          Sin artículos registrados
                        </div>
                      ) : (
                        <div style={{ padding: '8px 18px 14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                            <thead>
                              <tr>
                                {['#', 'Ref_corte', 'Referencia', 'Estado', 'Cantidad', 'Color'].map(h => (
                                  <th key={h} style={{
                                    padding: '7px 10px', textAlign: 'left',
                                    fontSize: 10, fontWeight: 700, color: '#a78bfa',
                                    letterSpacing: '0.05em', textTransform: 'uppercase',
                                    borderBottom: '1px solid #eeeaf3',
                                    whiteSpace: 'nowrap',
                                  }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(prod.details || []).map((d, i) => (
                                <tr key={`${prod.id}-detail-${i}`}
                                  style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.5)' }}>
                                  <td style={{ padding: '7px 10px' }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc' }}>#{i + 1}</span>
                                  </td>
                                  <td style={{ padding: '7px 10px' }}>
                                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b21a8', background: '#f5f3ff', padding: '2px 6px', borderRadius: 4 }}>
                                      {d.refCorte}
                                    </span>
                                  </td>
                                  <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#374151' }}>{d.ref}</td>
                                  <td style={{ padding: '7px 10px' }}>
                                    <StatusBadge status={d.status} small />
                                  </td>

                                  <td style={{ padding: '7px 10px' }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                                      {(d.quantity || 0).toLocaleString('es-CO')}
                                      <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af', marginLeft: 3 }}>uds</span>
                                    </span>
                                  </td>
                                  <td style={{ padding: '7px 10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                      <span style={{
                                        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                                        background: d.color?.toLowerCase() || '#e5e7eb',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                      }} />
                                      <span style={{ fontSize: 11, color: '#4b5563' }}>{d.color || '—'}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            {/* Pie de tabla — totales */}
                            <tfoot>
                              <tr>
                                <td colSpan="5" style={{ padding: '8px 10px', borderTop: '1px solid #f3e8ff', fontSize: 11, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  Total artículos: {(prod.details || []).length}
                                </td>
                                <td colSpan="2" style={{ padding: '8px 10px', borderTop: '1px solid #f3e8ff', fontSize: 11, fontWeight: 700, color: '#6b21a8', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                  {(prod.details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0).toLocaleString('es-CO')} uds total
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}

                      {/* Banner anulación */}
                      {isAnulada && (() => {
                        const entry = [...(prod.history || [])].reverse().find(h => h.status === 'Anulada');
                        return entry?.motivo ? (
                          <div style={{
                            margin: '0 18px 12px', padding: '8px 12px',
                            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8,
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>Motivo de anulación: </span>
                              <span style={{ fontSize: 11, color: '#b91c1c' }}>{entry.motivo}</span>
                              {entry.date && <span style={{ fontSize: 10, color: '#ef4444', marginLeft: 8 }}>({entry.date})</span>}
                            </div>
                          </div>
                        ) : null;
                      })()}

                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>

      {/* ── Modal de confirmación para el empleado ── */}
      {confirmModal.open && confirmModal.prod && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => !confirmLoading && setConfirmModal({ open: false, prod: null })}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
              Confirmar finalización
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
¿Confirmas que terminaste tu parte de la etapa <strong>"{confirmModal.prod.status}"</strong>?
              Se avisará al gerente y la orden pasará a la siguiente etapa.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmModal({ open: false, prod: null })} disabled={confirmLoading}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}>
                Cancelar
              </button>
              <button onClick={async () => {
                setConfirmLoading(true);
                try {
                  await ProductionAPIClient.confirmarEtapa(confirmModal.prod.id);
                  setConfirmModal({ open: false, prod: null });
                  // Recargar la lista para reflejar el cambio
                  if (typeof onExpandRow === 'function') {
                    await onExpandRow(confirmModal.prod.id);
                  }
                } catch (err) {
                  alert(err?.message || "No se pudo confirmar la finalización de la etapa");
                } finally {
                  setConfirmLoading(false);
                }
              }} disabled={confirmLoading}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#FF4FD6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: confirmLoading ? "not-allowed" : "pointer", opacity: confirmLoading ? 0.6 : 1 }}>
                {confirmLoading ? "Confirmando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductionTable;