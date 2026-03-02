import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductions } from '../hooks/useProduction';
import ProductionTable from '../components/ProductionTable';
import ProductionSearch from '../components/ProductionSearch';
import AddProductionButton from '../components/AddProductionButton';
import ProductionForm from '../components/ProductionForm';

/**
 * ProductionsPage - Main page for managing production orders
 * 
 * This component displays a list of production orders with comprehensive management features:
 * - Real-time search across client, status, and order number fields
 * - Multiple filter options: status, client, and date
 * - Pagination with configurable items per page
 * - Modal form for creating new production orders
 * - Ability to cancel production orders with confirmation
 * - Navigation to production details view
 * 
 * Features:
 * - Combined filter logic: search term + status + client + date filters
 * - Dynamic filter options generated from production data
 * - Responsive pagination with page buttons
 * - Pink theme styling (#ff4fd6) for primary actions
 */
const ProductionsPage = () => {
  const navigate = useNavigate();

  // Destructure Productions hook with proper naming
  const { Productions: productions, createProduction, updateProduction, deleteProduction } = useProductions();

  const [activeTab, setActiveTab] = useState("producciones");
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterClient, setFilterClient] = useState('Todos');
  const [filterDate, setFilterDate] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);

  const itemsPerPage = 7;

  /**
   * Generate unique filter values from productions data
   * Used to populate dropdown filter options
   */
  const uniqueStatuses = ['Todos', ...new Set((productions || []).map(p => p.status))];
  const uniqueClients = ['Todos', ...new Set((productions || []).map(p => p.client))];
  const uniqueDates = ['Todos', ...new Set((productions || []).map(p => p.statusDate))];

  /**
   * Combined filter logic:
   * 1. Search filter - checks client, status, and orderNumber for search term match
   * 2. Status filter - matches production status if not "Todos"
   * 3. Client filter - matches production client if not "Todos"
   * 4. Date filter - matches production date if not "Todos"
   * 
   * Returns filtered array based on all active filters
   */
  const filteredProductions = (productions || []).filter(prod => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = (
      (prod?.client || '').toLowerCase().includes(term) ||
      (prod?.status || '').toLowerCase().includes(term) ||
      String(prod?.orderNumber || '').includes(term)
    );
    const matchesStatus = filterStatus === 'Todos' || prod?.status === filterStatus;
    const matchesClient = filterClient === 'Todos' || prod?.client === filterClient;
    const matchesDate = filterDate === 'Todos' || prod?.statusDate === filterDate;

    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  /**
   * Calculate pagination values
   * totalPages - maximum page number based on filtered results
   * startIndex, paginatedProductions - slice of data for current page
   */
  const totalPages = Math.max(1, Math.ceil(filteredProductions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductions = filteredProductions.slice(startIndex, startIndex + itemsPerPage);

  /**
   * Open create production form modal
   */
  const handleAddProduction = () => setShowCreateForm(true);

  /**
   * Close all modals and reset editing state
   */
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingProduction(null);
  };

  /**
   * Cancel a production order
   * Requires user confirmation before updating status to "Anulada"
   * @param {string} id - Production ID to cancel
   */
  const handleCancelProduction = async (id) => {
    const ok = window.confirm("¿Seguro que deseas anular esta orden de producción?");
    if (!ok) return;

    try {
      await updateProduction(id, { status: "Anulada" });
    } catch (error) {
      console.error("Error al anular la producción:", error);
      alert("No se pudo anular la producción");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f6f6f8',
      padding: '24px 32px',
      fontFamily: 'sans-serif'
    }}>

      {/* Page header with title and search bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Orden de producción</h1>
        <ProductionSearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* Navigation tabs: Producciones and Terceros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <button
          onClick={() => setActiveTab("producciones")}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === "producciones" ? '#ff4fd6' : '#eaeaea',
            color: activeTab === "producciones" ? '#fff' : '#333',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Producciones
        </button>

        <button
          onClick={() => navigate("/terceros")}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === "terceros" ? '#ff4fd6' : '#eaeaea',
            color: activeTab === "terceros" ? '#fff' : '#333',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Terceros
        </button>
      </div>

      {/* Filters and add button section */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        boxShadow: '0 1px 5px rgba(0,0,0,0.08)'
      }}>

        {/* Filter dropdowns for Status, Client, and Date */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Status filter dropdown */}
          <select 
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: '#fafafa'
            }}>
            {uniqueStatuses.map((status, i) => (
              <option key={i} value={status}>Estado: {status}</option>
            ))}
          </select>

          {/* Client filter dropdown */}
          <select 
            value={filterClient}
            onChange={(e) => {
              setFilterClient(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: '#fafafa'
            }}>
            {uniqueClients.map((client, i) => (
              <option key={i} value={client}>Cliente: {client}</option>
            ))}
          </select>

          {/* Date filter dropdown */}
          <select 
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: '#fafafa'
            }}>
            {uniqueDates.map((date, i) => (
              <option key={i} value={date}>Fecha: {date}</option>
            ))}
          </select>
        </div>

        {/* Add new production button */}
        <button
          onClick={handleAddProduction}
          style={{
            background: '#ff4fd6',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
        >
          + Agregar nueva producción
        </button>
      </div>

      {/* Data table displaying paginated production records */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 10,
        boxShadow: '0 1px 5px rgba(0,0,0,0.08)'
      }}>
        <ProductionTable
          productions={paginatedProductions}
          onCancel={handleCancelProduction}
        />
      </div>

      {/* Pagination controls */}
      <div style={{
        marginTop: 20,
        display: 'flex',
        justifyContent: 'center',
        gap: 8
      }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: p === currentPage ? '#ff4fd6' : '#fff',
              color: p === currentPage ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Modal form for creating new production orders */}
      {showCreateForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <ProductionForm onSubmit={createProduction} onCancel={handleCloseForm}/>
          </div>
        </div>
      )}

    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#fff',
  padding: 20,
  borderRadius: 12,
  width: '90%',
  maxWidth: 600
};

export default ProductionsPage;