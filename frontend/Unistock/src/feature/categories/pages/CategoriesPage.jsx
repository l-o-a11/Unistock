import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import Alert from '../components/Alert';
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
  
  // Estados para alertas
  const [successAlert, setSuccessAlert] = useState({
    open: false,
    key: Date.now(),
    title: "",
    message: "",
  });

  const [errorAlert, setErrorAlert] = useState({
    open: false,
    key: Date.now(),
    title: "",
    message: "",
  });

  const [warningAlert, setWarningAlert] = useState({
    open: false,
    key: Date.now(),
    title: "",
    message: "",
  });

  const [confirmAlert, setConfirmAlert] = useState({
    open: false,
    key: Date.now(),
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: null,
  });

  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    step: "confirm",
    categoryId: null,
    categoryName: "",
    productCount: 0,
    key: Date.now()
  });

  const itemsPerPage = 7;

  // Filtrar categorías por búsqueda (nombre, descripción y cantidad)
  const filteredCategories = categories.filter(cat => {
    const searchLower = searchTerm.toLowerCase();
    
    // Buscar por nombre
    const matchesName = cat.name.toLowerCase().includes(searchLower);
    
    // Buscar por descripción
    const matchesDescription = cat.description.toLowerCase().includes(searchLower);
    
    // Buscar por cantidad (convertir número a string para buscar)
    const matchesCount = cat.productCount?.toString().includes(searchTerm);
    
    return matchesName || matchesDescription || matchesCount;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Funciones para alertas
  const handleShowAlert = ({ type, title, message }) => {
    if (type === "success") {
      setSuccessAlert({ open: false, key: Date.now() });
      setTimeout(() => {
        setSuccessAlert({
          open: true,
          key: Date.now(),
          title,
          message
        });
      }, 50);
    } else if (type === "error") {
      setErrorAlert({ open: false, key: Date.now() });
      setTimeout(() => {
        setErrorAlert({
          open: true,
          key: Date.now(),
          title,
          message
        });
      }, 50);
    } else if (type === "warning") {
      setWarningAlert({ open: false, key: Date.now() });
      setTimeout(() => {
        setWarningAlert({
          open: true,
          key: Date.now(),
          title,
          message
        });
      }, 50);
    }
  };

  const handleShowConfirm = ({ title, message, confirmText, cancelText, onConfirm }) => {
    setConfirmAlert({ open: false, key: Date.now() });
    setTimeout(() => {
      setConfirmAlert({
        open: true,
        key: Date.now(),
        title,
        message,
        confirmText: confirmText || "Confirmar",
        cancelText: cancelText || "Cancelar",
        onConfirm,
      });
    }, 50);
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
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Categoría creada correctamente"
      });
    } catch (error) {
      handleCloseForm();
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: error.message || "Error al crear categoría"
      });
    }
  };

  const handleEditSubmit = async (categoryData) => {
    try {
      await updateCategory(editingCategory.id, categoryData);
      handleCloseForm();
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Categoría actualizada correctamente"
      });
    } catch (error) {
      handleCloseForm();
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: error.message || "Error al actualizar categoría"
      });
    }
  };

  const handleDeleteClick = (id) => {
    const category = categories.find(c => c.id === id);
    
    if (category.productCount > 0) {
      handleShowAlert({
        type: "warning",
        title: "No se puede eliminar",
        message: `La categoría "${category.name}" tiene ${category.productCount} producto(s) asociado(s)`
      });
      return;
    }

    setDeleteAlert({
      open: true,
      step: "confirm",
      categoryId: id,
      categoryName: category.name,
      productCount: category.productCount,
      key: Date.now()
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(deleteAlert.categoryId);
      setDeleteAlert({ open: false, step: "confirm", categoryId: null, categoryName: "", productCount: 0, key: Date.now() });
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Categoría eliminada correctamente"
      });
    } catch (error) {
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: error.message || "Error al eliminar categoría"
      });
      setDeleteAlert({ open: false, step: "confirm", categoryId: null, categoryName: "", productCount: 0, key: Date.now() });
    }
  };

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

  const paginationBtn = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  };

  // 🔥 MODALES CON Z-INDEX REDUCIDO (menor que las alertas)
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,  // 👈 REDUCIDO de 1000 a 100
    pointerEvents: 'none'
  };

  const modalBackgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    pointerEvents: 'auto',
    zIndex: 101,  // 👈 REDUCIDO de 1001 a 101
  };

  const modalContentStyle = {
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
    zIndex: 102,  // 👈 REDUCIDO de 1002 a 102
    pointerEvents: 'auto'
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
        onDelete={handleDeleteClick}
      />

      {/* ── MODAL: Crear Categoría ── */}
      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div style={modalContentStyle}>
            <CategoryForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
            />
          </div>
        </div>
      )}

      {/* ── MODAL: Editar Categoría ── */}
      {showEditForm && editingCategory && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div style={modalContentStyle}>
            <CategoryForm
              category={editingCategory}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
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

      {/* Alertas - SIN CONTENEDOR ADICIONAL */}
      {/* Alerta de éxito */}
      <Alert
        key={`success-${successAlert.key}`}
        isOpen={successAlert.open}
        type="success"
        title={successAlert.title}
        message={successAlert.message}
        onConfirm={() => setSuccessAlert({ ...successAlert, open: false })}
        onCancel={() => setSuccessAlert({ ...successAlert, open: false })}
      />

      {/* Alerta de error */}
      <Alert
        key={`error-${errorAlert.key}`}
        isOpen={errorAlert.open}
        type="error"
        title={errorAlert.title}
        message={errorAlert.message}
        onConfirm={() => setErrorAlert({ ...errorAlert, open: false })}
        onCancel={() => setErrorAlert({ ...errorAlert, open: false })}
      />

      {/* Alerta de advertencia */}
      <Alert
        key={`warning-${warningAlert.key}`}
        isOpen={warningAlert.open}
        type="warning"
        title={warningAlert.title}
        message={warningAlert.message}
        onConfirm={() => setWarningAlert({ ...warningAlert, open: false })}
        onCancel={() => setWarningAlert({ ...warningAlert, open: false })}
      />

      {/* Alerta de confirmación */}
      <Alert
        key={`confirm-${confirmAlert.key}`}
        isOpen={confirmAlert.open}
        type="confirm"
        title={confirmAlert.title}
        message={confirmAlert.message}
        confirmText={confirmAlert.confirmText}
        cancelText={confirmAlert.cancelText}
        onConfirm={() => {
          if (confirmAlert.onConfirm) {
            confirmAlert.onConfirm();
          }
          setConfirmAlert({ ...confirmAlert, open: false });
        }}
        onCancel={() => setConfirmAlert({ ...confirmAlert, open: false })}
      />

      {/* Alerta de eliminación - paso confirmación */}
      <Alert
        key={`delete-confirm-${deleteAlert.key}`}
        isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
        type="confirm"
        title="Confirmar eliminación"
        message={`¿Seguro que deseas eliminar la categoría "${deleteAlert.categoryName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => setDeleteAlert({ ...deleteAlert, step: "password", key: Date.now() })}
        onCancel={() => setDeleteAlert({ open: false, step: "confirm", categoryId: null, categoryName: "", productCount: 0, key: Date.now() })}
      />

      {/* Alerta de eliminación - paso contraseña */}
      <Alert
        key={`delete-password-${deleteAlert.key}`}
        isOpen={deleteAlert.open && deleteAlert.step === "password"}
        type="password"
        title="Confirmar eliminación"
        message="Ingresa la contraseña de administrador"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteAlert({ open: false, step: "confirm", categoryId: null, categoryName: "", productCount: 0, key: Date.now() })}
      />
    </div>
  );
};

export default CategoriesPage;