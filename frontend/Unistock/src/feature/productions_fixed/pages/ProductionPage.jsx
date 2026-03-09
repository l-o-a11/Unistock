import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';
import ProductionTable from '../components/ProductionTable';
import ProductionSearch from '../components/ProductionSearch';
import AddProductionButton from '../components/AddProductionButton';
import ProductionForm from '../components/ProductionForm';
import Alert from '../components/Alert';

const ProductionsPage = () => {
  const navigate = useNavigate();
  const { Productions: productions, createProduction, updateProduction } = useProductions();

  const [activeTab,      setActiveTab]      = useState("producciones");
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState('Todos');
  const [filterClient,   setFilterClient]   = useState('Todos');
  const [filterDate,     setFilterDate]     = useState('Todos');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ✅ Fix: Alert propio en lugar de window.confirm para anular
  const [cancelAlert, setCancelAlert] = useState({ open: false, id: null });

  const itemsPerPage = 7;

  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status))];
  const uniqueClients  = ['Todos', ...new Set((productions || []).map(p => p.client))];
  const uniqueDates    = ['Todos', ...new Set((productions || []).map(p => p.statusDate))];

  const filteredProductions = (productions || []).filter(prod => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (prod?.client || '').toLowerCase().includes(term) ||
      (prod?.status || '').toLowerCase().includes(term) ||
      String(prod?.orderNumber || '').includes(term);
    const matchesStatus = filterStatus === 'Todos' || prod?.status === filterStatus;
    const matchesClient = filterClient === 'Todos' || prod?.client === filterClient;
    const matchesDate   = filterDate   === 'Todos' || prod?.statusDate === filterDate;
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  const totalPages           = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex           = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Fix: abre Alert en lugar de window.confirm
  const handleCancelProduction = (id) => {
    setCancelAlert({ open: true, id });
  };

  const confirmCancel = async () => {
    try {
      await updateProduction(cancelAlert.id, { status: 'Anulada' });
    } catch (error) {
      console.error('Error al anular la producción:', error);
    }
    setCancelAlert({ open: false, id: null });
  };

  // ✅ Fix: handleCloseForm existente y conectado
  const handleCloseForm = () => setShowCreateForm(false);

  const handleCreateSubmit = async (data) => {
    await createProduction(data);
    // El formulario se cierra solo via su pendingClose + Alert de éxito
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

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f8', padding: '24px 32px', fontFamily: 'sans-serif' }}>

      {/* Alert para anular producción */}
      <Alert
        isOpen={cancelAlert.open}
        type="confirm"
        title="Anular orden"
        message="¿Seguro que deseas anular esta orden de producción? Esta acción no se puede deshacer."
        onConfirm={confirmCancel}
        onCancel={() => setCancelAlert({ open: false, id: null })}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Orden de producción</h1>
        <ProductionSearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <button
          onClick={() => setActiveTab('producciones')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none',
            background: activeTab === 'producciones' ? '#ff4fd6' : '#eaeaea',
            color: activeTab === 'producciones' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 500 }}
        >
          Producciones
        </button>
        <button
          onClick={() => navigate('/Layout/terceros')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none',
            background: activeTab === 'terceros' ? '#ff4fd6' : '#eaeaea',
            color: activeTab === 'terceros' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 500 }}
        >
          Terceros
        </button>
      </div>

      {/* Filtros + botón */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
        boxShadow: '0 1px 5px rgba(0,0,0,0.08)' }}>

        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fafafa' }}>
            {uniqueStatuses.map((s, i) => <option key={i} value={s}>Estado: {s}</option>)}
          </select>
          <select value={filterClient} onChange={(e) => { setFilterClient(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fafafa' }}>
            {uniqueClients.map((c, i) => <option key={i} value={c}>Cliente: {c}</option>)}
          </select>
          <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fafafa' }}>
            {uniqueDates.map((d, i) => <option key={i} value={d}>Fecha: {d}</option>)}
          </select>
        </div>

        {/* ✅ Fix: props correctas para AddProductionButton */}
        <AddProductionButton
          productions={filteredProductions}
          onCreateProduction={handleCreateSubmit}
          onFilterByDate={(date) => setFilterDate(date)}
        />
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 10, boxShadow: '0 1px 5px rgba(0,0,0,0.08)' }}>
        <ProductionTable
          productions={paginatedProductions}
          onCancel={handleCancelProduction}
        />
      </div>

      {/* Paginación */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={pageBtn}>‹</button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? <span key={i} style={{ padding: '6px 4px' }}>...</span> : (
            <button key={p} onClick={() => setCurrentPage(p)} style={{
              ...pageBtn,
              background: p === currentPage ? '#ff4fd6' : '#fff',
              color:      p === currentPage ? '#fff'    : '#333',
              border:     p === currentPage ? '1px solid #ff4fd6' : '1px solid #ddd',
            }}>{p}</button>
          )
        )}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={pageBtn}>›</button>
      </div>

      {/* Modal crear */}
      {showCreateForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <ProductionForm onSubmit={handleCreateSubmit} onCancel={handleCloseForm} />
          </div>
        </div>
      )}
    </div>
  );
};

const pageBtn    = { padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' };
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle   = { background: '#fff', padding: 20, borderRadius: 12, width: '90%', maxWidth: 600 };

export default ProductionsPage;
