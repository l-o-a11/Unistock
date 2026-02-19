import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useProductSearch } from '../hooks/useProductSearch';
import ProductTable from '../components/ProductTable';
import ProductSearch from '../components/ProductSearch';
import AddProductButton from '../components/AddProductButton';
import { useProductDetail } from '../hooks/useProductDetail';
import ProductDetail from '../components/ProductDetail';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, deleteProduct, toggleProduct } = useProducts();
  const { searchTerm, handleSearch } = useProductSearch();
  const { selectedProduct, isOpen, openDetail, closeDetail } = useProductDetail();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  // ✅ CAMBIADO: Ahora va DIRECTAMENTE a la ficha técnica
  const handleView = (product) => {
    navigate(`/productos/ficha-tecnica/${product.id}`);
  };
  
  const handleEdit = (product) => navigate(`/productos/editar/${product.id}`);
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
    }
  };
  const handleToggle = (id) => toggleProduct?.(id);
  const handleAddProduct = () => navigate('/productos/crear');
  
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
    if (totalPages <= 5) return [...Array(Math.max(1, totalPages))].map((_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '24px 32px' }}>

      {/* ── Row 1: Title + Search ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
          Productos
        </h1>

        <ProductSearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* ── Row 2: Download icon + Add button — inside white card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          padding: '12px 20px',
          marginBottom: '20px',
        }}
      >
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
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4fd6')}
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
        onView={handleView}  // ✅ Ahora llama directamente a ficha técnica
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ── ProductDetail Modal ── */}
      {isOpen && (
        <ProductDetail
          product={selectedProduct}
          onClose={closeDetail}
          onEdit={handleEdit}
        />
      )}

      {/* ── Pagination ── */}
      {filteredProducts.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '24px',
          }}
        >
          {/* ‹ prev */}
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              fontSize: '16px',
              color: currentPage === 1 ? '#ccc' : '#555',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              borderRadius: '50%',
            }}
          >
            ‹
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, i) =>
            page === '...' ? (
              <span
                key={`ellipsis-${i}`}
                style={{ fontSize: '13px', color: '#aaa', padding: '0 2px' }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: '13px',
                  fontWeight: currentPage === page ? '700' : '400',
                  backgroundColor: currentPage === page ? '#ff4fd6' : 'transparent',
                  color: currentPage === page ? '#fff' : '#555',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) e.currentTarget.style.backgroundColor = '#fdf0f7';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {page}
              </button>
            )
          )}

          {/* › next */}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              fontSize: '16px',
              color: currentPage === totalPages ? '#ccc' : '#555',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              borderRadius: '50%',
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