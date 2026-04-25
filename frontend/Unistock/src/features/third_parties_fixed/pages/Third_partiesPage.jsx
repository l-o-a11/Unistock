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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThird_partie, setSelectedThird_partie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingThird_partie, setEditingThird_partie] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ open: false, id: null });
  const [errorAlert, setErrorAlert] = useState({ open: false, message: '' });

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
      // 🔹 Filtro rápido por estado
      if (term === "a") return t.estado !== false;
      if (term === "i") return t.estado === false;

      // 🔹 Estado como texto
      const estadoLabel =
        t.estado === true
          ? "activo"
          : t.estado === false
            ? "inactivo"
            : "";

      // 🔹 Buscar en todos los campos
      const enCampos = Object.values(t).some((value) =>
        String(value).toLowerCase().includes(term)
      );

      return enCampos || estadoLabel.includes(term);
    });
  }, [Third_parties, searchTerm]);

  const ITEMS = 7;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS));
  const paginated = filtered.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

  const handleView = (t) => setSelectedThird_partie(t);
  const handleEdit = (t) => { setEditingThird_partie(t); setShowForm(true); };
  const handleAdd = () => { setEditingThird_partie(null); setShowForm(true); };
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
    // Bloquear si está activo
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
      if (selectedThird_partie?.id === deleteAlert.id) setSelectedThird_partie(null);
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
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      {/* Font Nunito — misma que todas las páginas de producción */}
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Alerts globales — solo el Page maneja el flujo completo */}
      <Alert isOpen={deleteAlert.open} type="password" title="Eliminar tercero"
        message={`¿Estás seguro de eliminar a "${deleteAlert.name}"? Esta acción no se puede deshacer. Ingresa la contraseña de administrador.`}
        onConfirm={confirmDelete} onCancel={() => setDeleteAlert({ open: false, id: null, name: '' })}
      />
      <Alert isOpen={errorAlert.open} type={errorAlert.type || "error"} title={errorAlert.title || "No se puede eliminar"} message={errorAlert.message}
        onConfirm={() => setErrorAlert({ open: false, message: '', type: undefined, title: undefined })}
        onCancel={() => setErrorAlert({ open: false, message: '', type: undefined, title: undefined })}
      />

      {/* ── Header: título + buscador — mismo patrón que ProductionPage ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: "#1f2937",
            margin: 0,
          }}
        >
          Gestión de terceros
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <div style={{ width: "260px" }}>
            <Third_partieSearch
              value={searchTerm}
              onChange={(v) => {
                setSearchTerm(v);
                setCurrentPage?.(1); // por si tienes paginación
              }}
              placeholder="Buscar terceros..."
            />
          </div>

          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            Escribe <strong>a</strong> para ver activos · <strong>i</strong> para inactivos
          </span>
        </div>
      </div>

      {/* ── Tabs de navegación — color único #FF4FD6, sin gradiente ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/Layout/produccion')}
          style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Producciones
        </button>
        <button onClick={() => navigate('/Layout/terceros')}
          style={{ background: '#FF4FD6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Terceros
        </button>
      </div>

      {/* ── Layout 2 columnas: tabla izquierda / detalle derecha ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* ── Tabla — card estandarizada: bg-white rounded-2xl shadow-sm ── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
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
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pgBtn}>‹</button>
              {getPages().map((p, i) => p === '...' ? <span key={i} style={{ padding: '6px 4px' }}>…</span> : (
                <button key={p} onClick={() => setCurrentPage(p)}
                  style={{ ...pgBtn, background: p === currentPage ? '#FF4FD6' : '#fff', color: p === currentPage ? '#fff' : '#374151', border: `1px solid ${p === currentPage ? '#FF4FD6' : '#e5e7eb'}` }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pgBtn}>›</button>
            </div>
          )}
        </div>

        {/* ── Panel de detalle — misma card ── */}
        <div style={{ background: '#fff', borderRadius: 16, minHeight: 400, alignSelf: 'start', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {selectedThird_partie
            ? <Third_partieDetail Third_partie={selectedThird_partie} onEdit={handleEdit} onDelete={handleDelete} onClose={() => setSelectedThird_partie(null)} />
            : <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40, fontSize: 13 }}>Selecciona un tercero</p>}
        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <Third_partieForm Third_partie={editingThird_partie} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
};

const pgBtn = { padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151' };

export default Third_partiePage;
