/**
 * @file Third_partiesDetail/index.jsx
 * @description Panel de detalle de un tercero.
 *
 * FIXES:
 *  - useEffect usaba `data.id` antes de que `data` fuera declarado → cambiado a Third_partie.id
 *  - `const data` movido antes del early-return para que siempre esté en scope
 *  - getById se envuelve en try/catch completo para evitar "Could not establish connection"
 *    cuando el backend no está disponible (usa prop como fallback silencioso)
 *  - Pestaña Producciones rediseñada como tabla simple: ORDEN | FECHA | VER
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { thirdPartyAPI } from '../../services/thirdPartyAPI';
import { enrichSingleTercero } from '../../utils/produccionesLocal';

const Third_partieDetail = ({ Third_partie, onEdit, onDelete, onClose }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [freshData, setFreshData] = useState(null);

  // ✅ Fix: usar Third_partie.id (no data.id que aún no existe aquí)
  // ✅ Fix: envolver en try/catch para silenciar "Could not establish connection"
  useEffect(() => {
    if (!Third_partie?.id) return;
    let cancelled = false;
    setFreshData(null);

    (async () => {
      try {
        const d = await thirdPartyAPI.getById(Third_partie.id);
        if (!cancelled && d) {
          setFreshData(enrichSingleTercero(d, [d, Third_partie]));
        }
      } catch {
        // Backend no disponible — se usa la prop enriquecida como fallback
      }
    })();

    return () => { cancelled = true; };
  }, [Third_partie?.id]);

  // ✅ Fix: declarar data ANTES del early-return; siempre enriquecer con producciones locales
  const data = useMemo(
    () => enrichSingleTercero(freshData || Third_partie, [freshData, Third_partie].filter(Boolean)),
    [freshData, Third_partie],
  );

  if (!Third_partie) return null;

  const isActive    = data.estado !== false;
  // Solo mostrar órdenes que aún están en proceso de producción activa
  // (NO mostrar las que ya pasaron a "Recepción" o estados posteriores)
  // ✅ Fix: "Empaque" fue renombrado a "Recepción" — se incluyen ambos
  // valores para que el filtro siga funcionando con órdenes antiguas.
  const ESTADOS_POST_PRODUCCION = ['Recepción', 'Empaque', 'Enviado', 'Anulada'];
  const todasProducciones = data.producciones || [];
  const producciones = todasProducciones.filter((prod) => {
    // Si la producción tiene estado disponible, filtrar las que ya pasaron de "Producción"
    if (prod.estado) {
      return !ESTADOS_POST_PRODUCCION.includes(prod.estado);
    }
    // Si no tiene estado (viene de localStorage / produccionesLocal sin estado), mostrarla
    return true;
  });
  const hasProd     = producciones.length > 0;

  const handleDeleteClick = () => {
    if (hasProd) return;
    onDelete?.(data.id);
  };

  return (
    <div style={{ padding: 'clamp(14px, 4vw, 28px)' }}>

      <style>{`
        /* ── Info grid ── */
        .tp-info-grid {
          display: grid;
          grid-template-columns: min(110px, 38%) 1fr;
          gap: 10px 8px;
          margin-top: 18px;
        }
        @media (max-width: 360px) {
          .tp-info-grid { grid-template-columns: 1fr; gap: 6px; }
          .tp-info-label { margin-top: 6px; }
        }

        /* ── Tabla producciones ── */
        .tp-prod-wrap { overflow-x: auto; margin-top: 8px; }
        .tp-prod-table { width: 100%; border-collapse: collapse; min-width: 200px; }
        .tp-prod-th {
          text-align: left; font-size: 11px; font-weight: 700;
          color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;
          padding: 0 12px 10px 0; border-bottom: 1.5px solid #f0f0f0;
          white-space: nowrap;
        }
        .tp-prod-td {
          padding: 12px 12px 12px 0; font-size: 13px;
          border-bottom: 1px solid #f5f5f5; white-space: nowrap;
          vertical-align: middle;
        }
        .tp-prod-order {
          font-weight: 700; color: #FF4FD6; font-size: 14px;
        }
        .tp-prod-date { color: #374151; }
        .tp-prod-ver-btn {
          display: inline-flex; align-items: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          color: #9ca3af; font-size: 12px; font-weight: 600;
          font-family: inherit; padding: 0;
          transition: color 0.15s;
        }
        .tp-prod-ver-btn:hover { color: #FF4FD6; }

        /* ── Acciones ── */
        .tp-actions {
          margin-top: 28px; display: flex;
          justify-content: flex-end; gap: 10px; flex-wrap: wrap;
        }
        @media (max-width: 360px) {
          .tp-actions { flex-direction: column-reverse; }
          .tp-actions button { width: 100%; justify-content: center; }
        }

        /* ── Tabs ── */
        .tp-detail-tabs {
          display: flex; gap: 16px; margin-top: 16px;
          border-bottom: 1px solid #f0f0f0; flex-wrap: wrap;
        }
        .tp-detail-tab {
          background: none; border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer; padding: 8px 0;
          font-size: 13px; font-weight: 600;
          font-family: inherit; white-space: nowrap;
          transition: color 0.15s;
        }
        .tp-detail-tab.active { border-bottom-color: #FF4FD6; color: #FF4FD6; }
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
            {data.codigo ? `TP-${String(data.codigo).padStart(3,'0')}` : `#${data.id}`}
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
            backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
            color:           isActive ? '#16a34a' : '#6b7280',
          }}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: '#1f2937', wordBreak: 'break-word' }}>
          {data.nombreEmpresa || data.nombre}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af', wordBreak: 'break-word' }}>
          {data.nombreContacto || data.contacto}
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
          <LV label="NIT"       value={data.nit} />
          <LV label="Dirección" value={data.direccion} />
          <LV label="Teléfono"  value={data.telefono} />
          <LV label="Correo"    value={data.correo || data.correoEmpresa || data.email} />
        </div>
      )}

      {/* ── PESTAÑA PRODUCCIONES — tabla estilo imagen de referencia ── */}
      {tab === 'prod' && (
        <div style={{ marginTop: 16 }}>
          {producciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 10px', display: 'block' }}>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Sin producciones asociadas</p>
            </div>
          ) : (
            <div className="tp-prod-wrap">
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
                    <tr key={prod.produccionId || i}>
                      <td className="tp-prod-td">
                        <span className="tp-prod-order">
                          #{prod.orden || prod.orderNumber || '—'}
                        </span>
                      </td>
                      <td className="tp-prod-td tp-prod-date">
                        {prod.fecha || '—'}
                      </td>
                      <td className="tp-prod-td">
                        <button
                          className="tp-prod-ver-btn"
                          onClick={() => {
                            if (prod.produccionId) {
                              navigate(`/layout/produccion/detalle/${prod.produccionId}`);
                              onClose?.();
                            }
                          }}
                          title="Ver detalle de producción"
                        >
                          {/* Icono externo */}
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
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
            fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
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