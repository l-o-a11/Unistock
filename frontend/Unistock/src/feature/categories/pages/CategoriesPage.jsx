import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import CategoryTable from '../components/CategoryTable';
import CategorySearch from '../components/CategorySearch';
import AddCategoryButton from '../components/AddCategoryButton';
import CategoryForm from '../components/CategoryForm';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const itemsPerPage = 7;

  // Filtrar categorías por búsqueda
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Build page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowEditForm(true);
  };

  const handleAddCategory = () => {
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingCategory(null);
  };

  const handleCreateSubmit = async (categoryData) => {
    try {
      await createCategory(categoryData);
      handleCloseForm();
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  };

  const handleEditSubmit = async (categoryData) => {
    try {
      await updateCategory(editingCategory.id, categoryData);
      handleCloseForm();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
    }
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    if (category.productCount > 0) {
      alert('No se puede eliminar una categoría con productos asociados');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert(error.message);
      }
    }
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
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex', 
      flexDirection: 'column', 
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
          Categorías
        </h1>
        <CategorySearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* ── Row 2: Add button (in white card) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '12px 20px',
        marginBottom: '20px',
      }}>
        <AddCategoryButton onClick={handleAddCategory} />
      </div>

      {/* ── Table ── */}
      <CategoryTable
        categories={paginatedCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ── MODAL: Crear Categoría ── */}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 1002,
            pointerEvents: 'auto'
          }}>
            <CategoryForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* ── MODAL: Editar Categoría ── */}
      {showEditForm && editingCategory && (
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 1002,
            pointerEvents: 'auto'
          }}>
            <CategoryForm
              category={editingCategory}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {filteredCategories.length > 0 && (
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

export default CategoriesPage;