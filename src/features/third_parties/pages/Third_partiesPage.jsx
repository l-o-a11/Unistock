import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThird_parties } from '../hooks/mockThird_parties';

import Third_partieForm from '../components/Third_partiesForm';
import Third_partieTable from '../components/Third_partiesTable';
import Third_partieSearch from '../components/Third_partiesSearch';
import AddThird_partieButton from '../components/AddThird_partiesButton';
import Third_partieDetail from '../components/Third_partiesDetail';
import Alert from '../../shared/components/Alert';

const Third_partiePage = () => {
  const navigate = useNavigate();
  const { Third_parties, loading, deleteThird_partie, toggleThird_partie, createThird_partie, updateThird_partie } = useThird_parties();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThird_partie, setSelectedThird_partie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingThird_partie, setEditingThird_partie] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ open: false, id: null });
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });
  // Controla si el panel de detalle está visible en móvil (overlay)
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Auto-seleccionar primer tercero
  useEffect(() => {
    if (Third_parties.length > 0 && !selectedThird_partie) setSelectedThird_partie(Third_parties[0]);
  }, [Third_parties]);

  // Sincronizar panel derecho si el tercero fue editado
  useEffect(() => {
    if (selectedThird_partie) {
      const updated = Third_parties.find(t => t.id === selectedThird_partie.id);
      if (updated) setSelectedThird_partie(updated);
    }
  }, [Third_parties]);

  // Búsqueda: Código, Nombre empresa, Contacto
  const filtered = useMemo(() => {
    if (!Third_parties) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return Third_parties;

    return Third_parties.filter((t) => {
      if (term === 'activo') return t.estado !== false;
      if (term === 'inactivo') return t.estado === false;

      const estadoLabel = t.estado === true ? 'activo' : t.estado === false ? 'inactivo' : '';

      // Solo buscar en campos visibles/relevantes, no en todo el objeto
      const camposBuscables = [
        t.codigo,
        t.nit,
        t.nombreEmpresa,
        t.nombreContacto ?? t.contacto,
        t.telefono,
        t.correo ?? t.correoEmpresa ?? t.email,
      ];

      const enCampos = camposBuscables.some((v) => v?.toString().toLowerCase().includes(term));

      return enCampos || estadoLabel.includes(term);
    });
  }, [Third_parties, searchTerm]);

  const ITEMS = 7;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS));
  const paginated = filtered.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

  const handleView = (t) => {
    setSelectedThird_partie(t);
    setShowDetailPanel(true); // en móvil muestra el panel como overlay
  };
  const handleEdit = (t) => { setEditingThird_partie(t); setShowForm(true); };
  const handleAdd = () => { setEditingThird_partie(null); setShowForm(true); };

  const ESTADOS_POST_PRODUCCION = ['Recepción', 'Empaque', 'Enviado', 'Anulada'];

  const handleToggle = async (id) => {
    const t = Third_parties.find(tp => tp.id === id);
    const activas = (t?.producciones || []).filter((p) => {
      const estado = (p?.estado || '').toString();
      return estado && !ESTADOS_POST_PRODUCCION.includes(estado);
    });
    if (activas.length > 0) {
      setErrorAlert({ open: true, message: `Este tercero tiene ${activas.length} producción(es) activa(s). No se puede cambiar su estado.` });
      return;
    }
    try {
      await toggleThird_partie?.(id);
      const nombre = t?.nombreEmpresa || 'Tercero';
      const nuevoEstado = t?.estado === false ? 'activado' : 'inactivado';
      setErrorAlert({ open: true, type: 'success', title: 'Estado actualizado', message: `"${nombre}" fue ${nuevoEstado} correctamente.` });
    } catch (e) {
      setErrorAlert({ open: true, message: e?.message || 'No se pudo cambiar el estado del tercero.' });
    }
  };

  const handleDelete = (id) => {
    const t = Third_parties.find(x => x.id === id);
    if (t?.estado === true) {
      setErrorAlert({ open: true, message: `El tercero "${t.nombreEmpresa}" está activo. Inactívalo primero antes de eliminarlo.` });
      return;
    }
    const activas = (t?.producciones || []).filter((p) => {
      const estado = (p?.estado || '').toString();
      return estado && !ESTADOS_POST_PRODUCCION.includes(estado);
    });
    if (activas.length > 0) {
      setErrorAlert({ open: true, message: `Este tercero tiene ${activas.length} producción(es) activa(s) y no puede eliminarse.` });
      return;
    }
    setDeleteAlert({ open: true, id, name: t?.nombreEmpresa || '' });
  };

  const confirmDelete = () => {
    const name = deleteAlert.name;
    try {
      deleteThird_partie(deleteAlert.id);
      if (selectedThird_partie?.id === deleteAlert.id) {
        setSelectedThird_partie(null);
        setShowDetailPanel(false);
      }
      setDeleteAlert({ open: false, id: null, name: '' });
      setTimeout(() => {
        setErrorAlert({ open: true, type: 'success', title: 'Tercero eliminado', message: `El tercero "${name}" fue eliminado correctamente.` });
      }, 100);
    } catch (e) {
      setDeleteAlert({ open: false, id: null, name: '' });
      setErrorAlert({ open: true, message: e?.message || 'No se puede eliminar.' });
    }
  };

  const handleFormSubmit = async (data) => {
    if (editingThird_partie) await updateThird_partie(editingThird_partie.id, data);
    else await createThird_partie(data);
  };

  const getPages = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const p = [1];
    if (currentPage > 3) p.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) p.push(i);
    if (currentPage < totalPages - 2) p.push('...');
    p.push(totalPages);
    return p;
  };

  // ── Estado de carga inicial ────────────────────────────────────────────
  // El skeleton replica el layout ya cargado: header (título + buscador +
  // texto de ayuda), tabs de navegación, la barra del botón "Agregar" (ahora
  // separada, arriba de la tarjeta de tabla), tarjeta de tabla con filas
  // placeholder, y el sidebar de detalle en desktop — así no hay salto
  // visual cuando termina de cargar.
  if (loading && Third_parties.length === 0) return (
    <div style={{ minHeight: '100vh', fontFamily: "'Nunito', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes uloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
        @keyframes uskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .tp-skel-root { padding: 14px; }
        @media (min-width: 640px)  { .tp-skel-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .tp-skel-root { padding: 24px 32px; } }

        .tp-skel-layout { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .tp-skel-layout { grid-template-columns: 2fr 1fr; } }

        .tp-skel-sidebar { display: none; }
        @media (min-width: 768px) { .tp-skel-sidebar { display: block; } }
      `}</style>

      <div className="tp-skel-root">
        {/* HEADER: título + search — mismo layout que el estado ya cargado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Terceros</h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {/* mismo alto/ancho/radio que Third_partieSearch (width="400px") */}
            <div style={{
              width: 400, maxWidth: '100%', height: 38, borderRadius: 10,
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
            }} />
            <div style={{
              width: 260, height: 11, borderRadius: 6, background: '#f3f4f6',
              animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* TABS — mismas dimensiones que "Producciones" / "Terceros" */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 110, height: 32, borderRadius: 8, background: '#eaeaea',
            animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
          }} />
          <div style={{
            width: 90, height: 32, borderRadius: 8, background: '#fbcfec',
            animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
          }} />
        </div>

        {/* BARRA DEL BOTÓN "Agregar" — ahora separada, con su propio fondo blanco */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          background: '#fff', borderRadius: 16, padding: '12px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 14,
        }}>
          <div style={{
            width: 150, height: 38, borderRadius: 20,
            background: 'linear-gradient(90deg, #ff8fe0, #FF4FD6)',
            opacity: 0.4, animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
          }} />
        </div>

        <div className="tp-skel-layout">
          {/* barra de progreso */}
            <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)', animation: 'uloadbar 1.6s ease-in-out infinite' }} />
            </div>

          {/* SIDEBAR DE DETALLE — solo visible en desktop, igual que el real */}
          <div className="tp-skel-sidebar" style={{
            background: '#fff', borderRadius: 16, minHeight: 200,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 20,
          }}>
            <div style={{
              width: '10%', height: 16, borderRadius: 6, background: '#f3f4f6',
              marginBottom: 14, animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
            }} />
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                width: '100%', height: 12, borderRadius: 6, background: '#f9fafb',
                marginBottom: 10, animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Nunito', sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

        /* ── Root padding ── */
        .tp-root { padding: 14px; }
        @media (min-width: 640px)  { .tp-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .tp-root { padding: 24px 32px; } }

        /* ── Header ── */
        .tp-header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        @media (min-width: 640px) {
          .tp-header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
        }

        .tp-title { font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0; }
        @media (min-width: 640px) { .tp-title { font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0; } }

        /* ── Search: full width en móvil ── */
        .tp-search-wrap { width: 100%; }
        @media (max-width: 639px) {
          .tp-header { align-items: stretch; }
          .tp-title { text-align: center; }
          .tp-search-wrap { align-items: stretch !important; }
          .tp-search-wrap > div:first-child { width: 100% !important; max-width: 100% !important; }
          .tp-search-wrap > span { align-self: flex-start; width: 100%; text-align: left; white-space: normal !important; }
        }
        @media (min-width: 640px) { .tp-search-wrap { width: 260px; } }

        /* ── Barra del botón "Agregar" (separada de la tarjeta de la tabla) ── */
        .tp-actions-bar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          background: #fff;
          border-radius: 16px;
          padding: 12px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          margin-bottom: 14px;
        }
        @media (min-width: 640px) { .tp-actions-bar { padding: 14px 20px; } }

        /* ── Layout principal ──
           Móvil:   1 columna; el panel detalle aparece como drawer/overlay
           Desktop: 2 columnas lado a lado                                    */
        .tp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .tp-layout { grid-template-columns: 2fr 1fr; }
        }

        /* ── Tabla card ── */
        .tp-table-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          min-width: 0;        /* fix: permite que el ítem de grid se encoja */
          overflow: hidden;    /* fix: contiene el desborde horizontal */
        }
        @media (min-width: 640px) { .tp-table-card { padding: 20px; } }

        /* ── Panel de detalle:
             - Móvil:   overlay fijo que cubre toda la pantalla desde abajo
             - Desktop: columna lateral estática                              */
        .tp-detail-overlay {
          /* oculto por defecto en móvil */
          display: none;
          position: fixed;
          inset: 0;
          z-index: 300;
          background: rgba(0,0,0,0.4);
          align-items: flex-end;
          justify-content: stretch;
        }
        .tp-detail-overlay.visible { display: flex; }

        .tp-detail-drawer {
          background: #fff;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.15);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }

        /* Drag handle visual en el drawer */
        .tp-drawer-handle {
          width: 40px; height: 4px;
          background: #e5e7eb; border-radius: 99px;
          margin: 10px auto 0; cursor: pointer;
        }

        /* En desktop el panel detalle se muestra como columna lateral */
        .tp-detail-sidebar {
          display: none;
          background: #fff;
          border-radius: 16px;
          min-height: 200px;
          align-self: start;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          position: sticky;
          top: 16px;
        }
        @media (min-width: 768px) {
          .tp-detail-sidebar { display: block; }
          .tp-detail-overlay { display: none !important; }
        }

        /* ── Botón "Volver" — solo en móvil ── */
        .tp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #FF4FD6;
          padding: 12px 16px 0; font-family: inherit;
        }
        @media (min-width: 768px) { .tp-back-btn { display: none; } }

        /* ── Paginación ── */
        .tp-pagination {
          display: flex; justify-content: center;
          gap: 6px; align-items: center;
          flex-wrap: wrap; margin-top: 14px;
        }
        .tp-pg-btn {
          padding: 6px 11px; border-radius: 8px;
          border: 1px solid #e5e7eb; background: #fff;
          cursor: pointer; font-size: 13px; color: #374151;
          font-family: inherit;
        }
        @media (max-width: 400px) {
          .tp-pg-btn { padding: 5px 8px; font-size: 12px; }
        }

        /* ── "Ver detalle" fab en móvil ──
           Cuando hay un tercero seleccionado y el drawer está cerrado,
           aparece un fab flotante en la esquina inferior derecha           */
        .tp-fab {
          display: none;
          position: fixed;
          bottom: 24px; right: 20px;
          z-index: 200;
          background: #FF4FD6;
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(255,79,214,0.4);
          display: flex; align-items: center; gap: 8px;
          font-family: inherit;
          animation: fabIn 0.3s ease;
        }
        @keyframes fabIn {
          from { transform: scale(0.8) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);      opacity: 1; }
        }
        @media (min-width: 768px) { .tp-fab { display: none !important; } }

        /* ── Tabs compactos en móvil ── */
        .tp-tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .tp-tab-btn {
          padding: 7px 14px; border-radius: 8px; border: none;
          cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit;
        }
      `}</style>

      <div className="tp-root">
        {/* ── Alerts ── */}
        <Alert
          isOpen={deleteAlert.open}
          type="password"
          title="Eliminar tercero"
          message={`¿Estás seguro de eliminar a "${deleteAlert.name}"? Esta acción no se puede deshacer. Ingresa la contraseña de administrador.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteAlert({ open: false, id: null, name: '' })}
        />
        <Alert
          isOpen={errorAlert.open}
          type={errorAlert.type || 'error'}
          title={errorAlert.title || 'No se puede eliminar'}
          message={errorAlert.message}
          onConfirm={() => setErrorAlert({ open: false, message: '', type: undefined, title: undefined })}
          onCancel={() => setErrorAlert({ open: false, message: '', type: undefined, title: undefined })}
        />

        {/* ── Header ── */}
        <div className="tp-header">
          <h1 className="tp-title">Terceros</h1>
          <div className="tp-search-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <Third_partieSearch
              value={searchTerm}
              onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
              placeholder="Buscar"
              width="400px"
              maxWidth="400px"
            />
            <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
              Escribe <strong>activo</strong> para ver registros activos ·{" "}
              <strong>inactivo</strong> para ver registros inactivos
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tp-tabs style">
          <button className="tp-tab-btn "
            style={{ background: 'rgba(68, 68, 68, 0.06)', color: '#2d3137d9' }}
            onClick={() => navigate('/Layout/produccion')}>
            Producciones
          </button>
          <button className="tp-tab-btn"
            style={{ background: '#FF4FD6', color: '#fff' }}
            onClick={() => navigate('/Layout/terceros')}>
            Terceros
          </button>
        </div>

        {/* ── Barra del botón "Agregar" — ahora FUERA de la tarjeta de tabla ── */}
        <div className="tp-actions-bar">
          <AddThird_partieButton onClick={handleAdd} />
        </div>

        {/* ── Layout 2 col ── */}
        <div className="tp-layout">

          {/* ── Tabla (la tarjeta ahora solo contiene tabla + paginación) ── */}
          <div className="tp-table-card">
            <Third_partieTable
              Third_parties={paginated}
              selectedId={selectedThird_partie?.id}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />

            {filtered.length > 0 && (
              <div className="tp-pagination">
                <button className="tp-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
                {getPages().map((p, i) =>
                  p === '...'
                    ? <span key={i} style={{ padding: '6px 4px', fontSize: 13 }}>…</span>
                    : <button key={p} className="tp-pg-btn"
                      onClick={() => setCurrentPage(p)}
                      style={{
                        background: p === currentPage ? '#FF4FD6' : '#fff',
                        color: p === currentPage ? '#fff' : '#374151',
                        border: `1px solid ${p === currentPage ? '#FF4FD6' : '#e5e7eb'}`,
                      }}>
                      {p}
                    </button>
                )}
                <button className="tp-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
              </div>
            )}
          </div>

          {/* ── Panel detalle DESKTOP (columna lateral) ── */}
          <div className="tp-detail-sidebar">
            {selectedThird_partie ? (
              <Third_partieDetail
                Third_partie={selectedThird_partie}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={() => setSelectedThird_partie(null)}
              />
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40, fontSize: 13, padding: 20 }}>
                Selecciona un tercero para ver el detalle
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Panel detalle MÓVIL (drawer/overlay desde abajo) ── */}
      <div
        className={`tp-detail-overlay${showDetailPanel && selectedThird_partie ? ' visible' : ''}`}
        onClick={() => setShowDetailPanel(false)}>
        <div
          className="tp-detail-drawer"
          onClick={e => e.stopPropagation()}>
          {/* Handle visual */}
          <div
            className="tp-drawer-handle"
            onClick={() => setShowDetailPanel(false)}
          />
          {/* Botón volver */}
          <button className="tp-back-btn" onClick={() => setShowDetailPanel(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Volver a la lista
          </button>
          {selectedThird_partie && (
            <Third_partieDetail
              Third_partie={selectedThird_partie}
              onEdit={(t) => { setShowDetailPanel(false); handleEdit(t); }}
              onDelete={(id) => { setShowDetailPanel(false); handleDelete(id); }}
              onClose={() => { setSelectedThird_partie(null); setShowDetailPanel(false); }}
            />
          )}
        </div>
      </div>

      {/* ── FAB móvil: "Ver detalle" cuando hay seleccionado y drawer cerrado ── */}
      {selectedThird_partie && !showDetailPanel && (
        <button className="tp-fab" onClick={() => setShowDetailPanel(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver detalle
        </button>
      )}

      {/* ── Modal formulario ── */}
      {showForm && (
        <Third_partieForm
          Third_partie={editingThird_partie}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          allThirdParties={Third_parties}
        />
      )}
    </div>
  );
};

export default Third_partiePage;