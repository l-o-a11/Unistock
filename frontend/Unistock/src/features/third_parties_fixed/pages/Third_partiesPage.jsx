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
  const { Third_parties, deleteThird_partie, toggleThird_partie, createThird_partie, updateThird_partie } = useThird_parties();

  const [searchTerm,          setSearchTerm]          = useState('');
  const [selectedThird_partie, setSelectedThird_partie] = useState(null);
  const [currentPage,         setCurrentPage]         = useState(1);
  const [showForm,            setShowForm]            = useState(false);
  const [editingThird_partie, setEditingThird_partie] = useState(null);
  const [deleteAlert,         setDeleteAlert]         = useState({ open: false, id: null });
  const [errorAlert,          setErrorAlert]          = useState({ open: false, message: '' });
  // Controla si el panel de detalle está visible en móvil (overlay)
  const [showDetailPanel,     setShowDetailPanel]     = useState(false);

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
    return Third_parties.filter((t) => {
      if (term === 'a') return t.estado !== false;
      if (term === 'i') return t.estado === false;
      const estadoLabel = t.estado === true ? 'activo' : t.estado === false ? 'inactivo' : '';
      const enCampos = Object.values(t).some((value) => String(value).toLowerCase().includes(term));
      return enCampos || estadoLabel.includes(term);
    });
  }, [Third_parties, searchTerm]);

  const ITEMS      = 7;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

  const handleView = (t) => {
    setSelectedThird_partie(t);
    setShowDetailPanel(true); // en móvil muestra el panel como overlay
  };
  const handleEdit = (t) => { setEditingThird_partie(t); setShowForm(true); };
  const handleAdd  = () => { setEditingThird_partie(null); setShowForm(true); };

  const handleToggle = (id) => {
    const t = Third_parties.find(tp => tp.id === id);
    if (t?.producciones?.length > 0) {
      setErrorAlert({ open: true, message: `Este tercero tiene ${t.producciones.length} producción(es) asignada(s). No se puede cambiar su estado.` });
      return;
    }
    toggleThird_partie?.(id);
  };

  const handleDelete = (id) => {
    const t = Third_parties.find(x => x.id === id);
    if (t?.estado === true) {
      setErrorAlert({ open: true, message: `El tercero "${t.nombreEmpresa}" está activo. Inactívalo primero antes de eliminarlo.` });
      return;
    }
    if (t?.producciones?.length > 0) {
      setErrorAlert({ open: true, message: `Este tercero tiene ${t.producciones.length} producción(es) asignada(s) y no puede eliminarse.` });
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

  return (
    <div style={{  minHeight: '100vh', fontFamily: "'Nunito', sans-serif", overflowX: 'hidden' }}>

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

        .tp-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0; }
        @media (min-width: 640px) { .tp-title { font-size: 24px; } }

        /* ── Search: full width en móvil ── */
        .tp-search-wrap { width: 100%; }
        @media (min-width: 640px) { .tp-search-wrap { width: 260px; } }

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
          <h1 className="tp-title">Gestión de terceros</h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <div className="tp-search-wrap">
              <Third_partieSearch
                value={searchTerm}
                onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                placeholder="Buscar terceros..."
              />
            </div>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              Escribe <strong>a</strong> para activos · <strong>i</strong> para inactivos
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tp-tabs">
          <button className="tp-tab-btn"
            style={{ background: '#f3f4f6', color: '#6b7280' }}
            onClick={() => navigate('/Layout/produccion')}>
            Producciones
          </button>
          <button className="tp-tab-btn"
            style={{ background: '#FF4FD6', color: '#fff' }}
            onClick={() => navigate('/Layout/terceros')}>
            Terceros
          </button>
        </div>

        {/* ── Layout 2 col ── */}
        <div className="tp-layout">

          {/* ── Tabla ── */}
          <div className="tp-table-card">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <AddThird_partieButton onClick={handleAdd} />
            </div>

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
                          color:      p === currentPage ? '#fff'    : '#374151',
                          border:     `1px solid ${p === currentPage ? '#FF4FD6' : '#e5e7eb'}`,
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
              <path d="M15 18l-6-6 6-6"/>
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
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
        />
      )}
    </div>
  );
};

export default Third_partiePage;