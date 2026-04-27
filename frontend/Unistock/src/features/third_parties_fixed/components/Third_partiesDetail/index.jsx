/**
 * @file Third_partiesDetail/index.jsx
 * @description Panel de detalle de un tercero — con mejoras responsive para móvil.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Third_partieDetail = ({ Third_partie, onEdit, onDelete, onClose }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');

  if (!Third_partie) return null;

  const isActive    = Third_partie.estado !== false;
  const producciones = Third_partie.producciones || [];
  const hasProd     = producciones.length > 0;

  const handleDeleteClick = () => {
    if (hasProd) return;
    onDelete?.(Third_partie.id);
  };

  return (
    <div style={{ padding: 'clamp(14px, 4vw, 28px)' }}>

      <style>{`
        /* ── Info grid: 2 cols en escritorio, 1 col en móvil estrecho ── */
        .tp-info-grid {
          display: grid;
          grid-template-columns: min(110px, 38%) 1fr;
          gap: 10px 8px;
          margin-top: 18px;
        }
        @media (max-width: 360px) {
          .tp-info-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }
          .tp-info-label { margin-top: 6px; }
        }

        /* ── Tabla producciones: scroll horizontal en móvil ── */
        .tp-prod-table-wrap { overflow-x: auto; margin-top: 20px; }
        .tp-prod-table { width: 100%; border-collapse: collapse; min-width: 220px; }
        .tp-prod-th {
          text-align: left; font-size: 11px; font-weight: 700;
          color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em;
          padding: 0 0 8px; border-bottom: 1px solid #f0f0f0;
          white-space: nowrap;
        }
        .tp-prod-td {
          padding: 11px 0; font-size: 13px; color: #333;
          border-bottom: 1px solid #f8f8f8; white-space: nowrap;
        }
        .tp-prod-td:not(:last-child) { padding-right: 16px; }

        /* ── Botones acción: full width en móvil pequeño ── */
        .tp-actions {
          margin-top: 28px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }
        @media (max-width: 360px) {
          .tp-actions { flex-direction: column-reverse; }
          .tp-actions button { width: 100%; justify-content: center; }
        }

        /* ── Tabs: wrapping en pantallas muy pequeñas ── */
        .tp-detail-tabs {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }
        .tp-detail-tab {
          background: none; border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer; padding: 8px 0;
          font-size: 13px; font-weight: 600;
          font-family: inherit; white-space: nowrap;
          transition: color 0.15s;
        }
        .tp-detail-tab.active {
          border-bottom-color: #FF4FD6;
          color: #FF4FD6;
        }
        .tp-detail-tab:not(.active) { color: #555; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span style={{
            fontSize: 11, color: '#FF4FD6', fontWeight: 700,
            background: '#fce7f3', padding: '2px 8px', borderRadius: 6,
            display: 'inline-block', marginBottom: 6, flexShrink: 0,
          }}>
            {Third_partie.codigo || `#${Third_partie.id}`}
          </span>
          {/* Badge de estado */}
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            flexShrink: 0,
            backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
            color:           isActive ? '#16a34a' : '#6b7280',
          }}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: '#1f2937', wordBreak: 'break-word' }}>
          {Third_partie.nombreEmpresa || Third_partie.nombre}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af', wordBreak: 'break-word' }}>
          {Third_partie.nombreContacto || Third_partie.contacto}
        </p>
      </div>

      {/* ── AVISO bloqueo con producciones ── */}
      {hasProd && (
        <div style={{
          margin: '12px 0', padding: '10px 14px', borderRadius: 10,
          background: '#fff7ed', border: '1px solid #fed7aa',
          fontSize: 12, color: '#c2410c', fontWeight: 600,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Este tercero tiene {producciones.length} producción(es). Desvincula primero antes de eliminar.</span>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="tp-detail-tabs">
        {['info', 'prod'].map(t => (
          <button
            key={t}
            className={`tp-detail-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'info' ? 'Información general' : `Producciones${hasProd ? ` (${producciones.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── PESTAÑA INFO ── */}
      {tab === 'info' && (
        <div className="tp-info-grid">
          <LV label="NIT"       value={Third_partie.nit} />
          <LV label="Dirección" value={Third_partie.direccion} />
          <LV label="Teléfono"  value={Third_partie.telefono} />
          <LV label="Correo"    value={Third_partie.correo || Third_partie.email} />
        </div>
      )}

      {/* ── PESTAÑA PRODUCCIONES ── */}
      {tab === 'prod' && (
        <div className="tp-prod-table-wrap">
          {producciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
              <p style={{ fontSize: 13 }}>No hay producciones asociadas</p>
            </div>
          ) : (
            <table className="tp-prod-table">
              <thead>
                <tr>
                  <th className="tp-prod-th">Orden</th>
                  <th className="tp-prod-th">Fecha</th>
                  <th className="tp-prod-th">Ver</th>
                </tr>
              </thead>
              <tbody>
                {producciones.map((prod, i) => (
                  <tr key={i}>
                    <td className="tp-prod-td">
                      <span style={{ fontWeight: 700, color: '#FF4FD6', fontSize: 13 }}>
                        #{prod.orden || prod.orderNumber}
                      </span>
                    </td>
                    <td className="tp-prod-td">{prod.fecha || '—'}</td>
                    <td className="tp-prod-td">
                      {prod.produccionId && (
                        <button
                          onClick={() => navigate(`/layout/produccion/detalle/${prod.produccionId}`)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#FF4FD6', fontSize: 12, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ACCIONES ── */}
      <div className="tp-actions">
        <button
          style={{
            background: '#fef2f2', color: '#ef4444',
            border: '1px solid #fecaca',
            padding: '9px 20px', borderRadius: 10,
            fontWeight: 600, fontSize: 13,
            fontFamily: 'inherit',
            opacity: hasProd ? 0.4 : 1,
            cursor: hasProd ? 'not-allowed' : 'pointer',
          }}
          onClick={handleDeleteClick}
          disabled={hasProd}
          title={hasProd ? 'Desvincular producciones primero' : 'Eliminar tercero'}>
          Eliminar
        </button>
        <button
          style={{
            background: '#FF4FD6', color: '#fff',
            border: 'none', padding: '9px 24px',
            borderRadius: 10, cursor: 'pointer',
            fontWeight: 700, fontSize: 13,
            fontFamily: 'inherit',
          }}
          onClick={() => onEdit?.(Third_partie)}>
          Editar
        </button>
      </div>
    </div>
  );
};

const LV = ({ label, value }) => (
  <>
    <div className="tp-info-label" style={{
      fontWeight: 600, fontSize: 11, color: '#9ca3af',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      alignSelf: 'center',
    }}>
      {label}
    </div>
    <div style={{ fontSize: 13, color: '#1f2937', wordBreak: 'break-word' }}>
      {value || '—'}
    </div>
  </>
);

export default Third_partieDetail;