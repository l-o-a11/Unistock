import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useProductSearch } from '../hooks/useProductSearch';
import ProductTable from '../components/ProductTable';
import ProductSearch from '../components/ProductSearch';
import AddProductButton from '../components/AddProductButton';
import ProductForm from '../components/ProductForm';
import TechnicalSheetModal from '../components/TechnicalSheetModal';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, createProduct, updateProduct, deleteProduct, toggleProduct } = useProducts();
  const { searchTerm, handleSearch } = useProductSearch();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados para modales
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showTechnicalSheet, setShowTechnicalSheet] = useState(false);
  const [selectedProductForSheet, setSelectedProductForSheet] = useState(null);

  // Filter
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Handlers para formularios
  const handleAddProduct = () => {
    setShowCreateForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingProduct(null);
  };

  const handleCreateSubmit = async (productData) => {
    try {
      await createProduct(productData);
      handleCloseForm();
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  const handleEditSubmit = async (productData) => {
    try {
      await updateProduct(editingProduct.id, productData);
      handleCloseForm();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  // Handler para ficha técnica
  const handleView = (product) => {
    setSelectedProductForSheet(product);
    setShowTechnicalSheet(true);
  };

  const handleCloseTechnicalSheet = () => {
    setShowTechnicalSheet(false);
    setSelectedProductForSheet(null);
  };

  const handleViewTechnicalSheet = (product) => {
    setSelectedProductForSheet(product);
    setShowTechnicalSheet(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  const handleToggle = (id) => toggleProduct?.(id);
  
  // Download handler (export)
  const handleDownload = () => {
    const csv = [
      ['Referencia', 'Nombre', 'Categoría', 'Precio', 'Stock'],
      ...filteredProducts.map(p => [p.reference, p.name, p.category, p.price, p.stock])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const paginationBtn = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0', 
      padding: '24px 32px' 
    }}>

      {/* ── Row 1: Title + Search ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
          Productos
        </h1>
        <ProductSearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* ── Row 2: Download icon + Add button — inside white card ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '12px 20px',
        marginBottom: '20px',
      }}>
        {/* Download / export icon */}
        <button
          onClick={handleDownload}
          title="Exportar productos"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <AddProductButton onClick={handleAddProduct} />
      </div>

      {/* ── Table ── */}
      <ProductTable
        products={paginatedProducts}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ── MODAL: Crear Producto ── */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            zIndex: 1001
          }} onClick={handleCloseForm} />
          
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 1002,
            pointerEvents: 'auto'
          }}>
            <ProductForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* ── MODAL: Editar Producto ── */}
      {showEditForm && editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            zIndex: 1001
          }} onClick={handleCloseForm} />
          
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 1002,
            pointerEvents: 'auto'
          }}>
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}



      {/* ── MODAL: Ficha Técnica ── */}
      {showTechnicalSheet && (
        <TechnicalSheetModal
          product={selectedProductForSheet}
          onClose={handleCloseTechnicalSheet}
        />
      )}

      {/* ── Pagination ── */}
      {filteredProducts.length > 0 && (
        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          alignItems: "center",
        }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              ...paginationBtn,
              color: currentPage === 1 ? '#ccc' : '#333',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ‹
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: "6px 10px", fontSize: "14px", color: "#999" }}>
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  ...paginationBtn,
                  backgroundColor: p === currentPage ? "#FF4FD6" : "#fff",
                  color: p === currentPage ? "#fff" : "#333",
                  border: p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd",
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              ...paginationBtn,
              color: currentPage === totalPages ? '#ccc' : '#333',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;