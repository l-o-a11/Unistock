import React, { useState } from 'react';
import { useProductCategories } from '../hooks/useProductCategories';
import Alert from '../../shared/components/Alert';
import { AuthAPI } from '../../auth/services/AuthAPI';
import ProductCategoryTable from '../components/ProductCategoryTable';
import SearchInput from '../../shared/components/SearchInput';
import ProductCategoryForm from '../components/ProductCategoryForm';
import AddProductCategoryButton from '../components/AddProductCategoryButton';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';

const getProductCategoryId = (category) =>
  category?.id ?? category?._id ?? category?.id_categoria_producto ?? category?.id_categorias;

const sameProductCategoryId = (left, right) => String(left) === String(right);

const ProductCategoriesPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    productCategories,
    loading,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProductCategory, setEditingProductCategory] = useState(null);

  const [successAlert, setSuccessAlert] = useState({ open: false, title: '', message: '' });
  const [errorAlert,   setErrorAlert]   = useState({ open: false, title: '', message: '' });
  const [warningAlert, setWarningAlert] = useState({ open: false, title: '', message: '' });

  const [confirmAlert, setConfirmAlert] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
  });

  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    productCategoryId: null,
    key: 0,
  });

  const itemsPerPage = 7;

  // 🔍 FILTRO
  const filteredProductCategories = productCategories.filter(pc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pc.name?.toLowerCase().includes(searchLower) ||
      pc.descripcion?.toLowerCase().includes(searchLower) ||
      pc.productCount?.toString().includes(searchTerm)
    );
  });

  // 📄 PAGINACIÓN
  const totalPages = Math.max(1, Math.ceil(filteredProductCategories.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductCategories = filteredProductCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );



  // 🔔 ALERT HANDLERS
  const handleShowAlert = ({ type, title, message }) => {
    const setter = { success: setSuccessAlert, error: setErrorAlert, warning: setWarningAlert }[type];
    if (!setter) return;
    setter({ open: false });
    setTimeout(() => setter({ open: true, title, message }), 50);
  };

  const handleShowConfirm = ({ title, message, confirmText, cancelText, onConfirm }) => {
    setConfirmAlert({ open: false });
    setTimeout(() => {
      setConfirmAlert({
        open: true,
        title,
        message,
        confirmText: confirmText || 'Confirmar',
        cancelText: cancelText || 'Cancelar',
        onConfirm,
      });
    }, 50);
  };

  // 🔥 ACCIONES
  const handleEdit = (pc) => {
    setEditingProductCategory(pc);
    setShowEditForm(true);
  };

  const handleAdd = () => setShowCreateForm(true);

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingProductCategory(null);
  };

  const handleCreateSubmit = async (data) => {
    try {
      await createProductCategory(data);
      handleCloseForm();
      setCurrentPage(1);
      handleShowAlert({ type: 'success', title: '¡Éxito!', message: 'Categoría creada correctamente' });
    } catch (error) {
      handleCloseForm();
      handleShowAlert({ type: 'error', title: 'Error', message: error.message });
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateProductCategory(getProductCategoryId(editingProductCategory), data);
      handleCloseForm();
      handleShowAlert({ type: 'success', title: '¡Éxito!', message: 'Categoría actualizada correctamente' });
    } catch (error) {
      handleCloseForm();
      handleShowAlert({ type: 'error', title: 'Error', message: error.message });
    }
  };

  // Eliminación: va directo a contraseña, sin confirmación previa
  const handleDeleteClick = (id) => {
    const pc = productCategories.find(c => sameProductCategoryId(getProductCategoryId(c), id));
    if (!pc) return;

    if (pc.productCount > 0) {
      handleShowAlert({
        type: 'warning',
        title: 'No se puede eliminar',
        message: `Tiene ${pc.productCount} producto(s) asociados`,
      });
      return;
    }

    setDeleteAlert({ open: true, productCategoryId: id, key: Date.now() });
  };

  const handleDeleteConfirm = async (password) => {
    try {
      await AuthAPI.verifyPassword(password);
      await deleteProductCategory(deleteAlert.productCategoryId);
      setDeleteAlert({ open: false, productCategoryId: null, key: Date.now() });
      handleShowAlert({ type: 'success', title: 'Eliminado', message: 'Categoría eliminada correctamente' });
    } catch (error) {
      const isInvalidPassword = error?.status === 401 || /contraseñ|password/i.test(String(error?.message || ''));
      handleShowAlert({
        type: 'error',
        title: isInvalidPassword ? 'Contraseña incorrecta' : 'Error',
        message: isInvalidPassword
          ? 'La contraseña no coincide con tu usuario actual.'
          : error.message,
      });
      setDeleteAlert(prev => ({ ...prev, open: isInvalidPassword }));
    }
  };

  // 🎨 MODAL STYLES
  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, pointerEvents: 'none',
  };
  const modalBackgroundStyle = { position: 'absolute', inset: 0, pointerEvents: 'auto', zIndex: 101 };
  const modalContentStyle = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '600px',
    backgroundColor: '#fff', borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    zIndex: 102, pointerEvents: 'auto',
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
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
      position: 'relative',  backgroundColor: '#f5f5f5',
      display: 'flex', flexDirection: 'column',
      padding: isMobile ? '16px 12px' : '24px 32px',
    }}>

      {/* ── ROW 1: Título + Search ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0px', marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#1a1a1a' }}>
          Categorías de productos
        </h1>
        <SearchInput value={searchTerm} onChange={setSearchTerm} width="400px" maxWidth="400px" />
      </div>

      {/* ── ROW 2: Botón en card ── */}
      <div style={{
        display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end',
        width: '100%', backgroundColor: '#ffffff', borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '12px 20px',
        marginBottom: '20px', gap: '10px',
      }}>
        <AddProductCategoryButton onClick={handleAdd} />
      </div>

      {/* ── TABLA ── */}
      <ProductCategoryTable
        productCategories={paginatedProductCategories}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* ── PAGINADOR ── */}
      {filteredProductCategories.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ ...paginationBtn, color: currentPage === 1 ? '#ccc' : '#333', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >‹</button>

          {getPageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={i} style={{ padding: '6px 10px', fontSize: '14px', color: '#999' }}>...</span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  ...paginationBtn,
                  backgroundColor: p === currentPage ? '#FF4FD6' : '#fff',
                  color: p === currentPage ? '#fff' : '#333',
                  border: p === currentPage ? '1px solid #FF4FD6' : '1px solid #ddd',
                }}
              >{p}</button>
            )
          )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ ...paginationBtn, color: currentPage === totalPages ? '#ccc' : '#333', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >›</button>
        </div>
      )}

      {/* ── MODALES ── */}
      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div style={modalContentStyle}>
            <ProductCategoryForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
            />
          </div>
        </div>
      )}

      {showEditForm && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div style={modalContentStyle}>
            <ProductCategoryForm
              productCategory={editingProductCategory}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
            />
          </div>
        </div>
      )}

      {/* ── ALERTAS (SIN KEYS - No son listas dinámicas) ── */}
      
      {/* ✅ Success Alert */}
      <Alert
        isOpen={successAlert.open} type="success"
        title={successAlert.title} message={successAlert.message}
        onConfirm={() => setSuccessAlert(prev => ({ ...prev, open: false }))}
        onCancel={() => setSuccessAlert(prev => ({ ...prev, open: false }))}
      />
      <Alert
        isOpen={errorAlert.open} type="error"
        title={errorAlert.title} message={errorAlert.message}
        onConfirm={() => setErrorAlert(prev => ({ ...prev, open: false }))}
        onCancel={() => setErrorAlert(prev => ({ ...prev, open: false }))}
      />
      <Alert
        isOpen={warningAlert.open} type="warning"
        title={warningAlert.title} message={warningAlert.message}
        onConfirm={() => setWarningAlert(prev => ({ ...prev, open: false }))}
        onCancel={() => setWarningAlert(prev => ({ ...prev, open: false }))}
      />
      <Alert
        isOpen={confirmAlert.open} type="confirm"
        title={confirmAlert.title} message={confirmAlert.message}
        confirmText={confirmAlert.confirmText} cancelText={confirmAlert.cancelText}
        onConfirm={() => { confirmAlert.onConfirm?.(); setConfirmAlert(prev => ({ ...prev, open: false })); }}
        onCancel={() => setConfirmAlert(prev => ({ ...prev, open: false }))}
      />

      {/* ✅ Delete — solo contraseña, sin confirmación previa */}
      <Alert
        key={`delete-${deleteAlert.key}`}
        isOpen={deleteAlert.open}
        type="password"
        title="Confirmar eliminación"
        message="Ingresa la contraseña de administrador para eliminar esta categoría"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteAlert(prev => ({ ...prev, open: false }))}
      />

    </div>
  );
};

export default ProductCategoriesPage;
