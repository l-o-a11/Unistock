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

  const [mainAlert, setMainAlert] = useState({ open: false, type: 'success', title: '', message: '' });

  const showAlert = (type, title, message) => {
    setMainAlert({ open: false });
    setTimeout(() => setMainAlert({ open: true, type, title, message }), 50);
  };

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

  const filteredProductCategories = productCategories.filter(pc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pc.name?.toLowerCase().includes(searchLower) ||
      pc.descripcion?.toLowerCase().includes(searchLower) ||
      pc.productCount?.toString().includes(searchTerm)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredProductCategories.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductCategories = filteredProductCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );



  const handleShowAlert = ({ type, title, message }) => showAlert(type, title, message);

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

  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const modalBackgroundStyle = { position: 'absolute', inset: 0, pointerEvents: 'auto', zIndex: 1101 };
  const modalContentStyle = {
    position: 'relative',
    width: '90%', maxWidth: '600px',
    backgroundColor: '#fff', borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    zIndex: 1102, pointerEvents: 'auto',
    maxHeight: '90vh', overflowY: 'auto',
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

  // ── Estado de carga inicial ────────────────────────────────────────────
  // Skeleton que replica el layout del header, buscador y barra de acciones
  // para evitar el "salto" visual cuando los datos ya cargaron.
  if (loading && productCategories.length === 0) return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 32px' }}>
      <style>{`
        @keyframes ploadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
        @keyframes pskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* HEADER: título + search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#1a1a1a' }}>
          Categorías de productos
        </h1>
        <div style={{
          width: 400, maxWidth: '100%', height: 38, borderRadius: 10,
          background: '#f3f4f6', border: '1px solid #e5e7eb',
          animation: 'pskeleton-pulse 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* BARRA BLANCA CON BOTÓN AGREGAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : 'flex-end',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '12px 20px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: 168, height: 38, borderRadius: 20,
          background: 'linear-gradient(90deg, #ff8fe0, #FF4FD6)',
          opacity: 0.4, animation: 'pskeleton-pulse 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* barra de progreso */}
      <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)',
          animation: 'ploadbar 1.6s ease-in-out infinite',
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'relative',  backgroundColor: '#f5f5f5',
      display: 'flex', flexDirection: 'column',
      minHeight: 'calc(100vh - 90px)',
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
        <SearchInput value={searchTerm} onChange={setSearchTerm} width="400px" maxWidth="100%" isLoading={loading} />
      </div>

      {/* ── ROW 2: Botón en card ── */}
      <div style={{
        display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end',
        width: '100%', backgroundColor: '#ffffff', borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '12px 20px',
        marginBottom: '20px', gap: '10px',
      }}>
        <AddProductCategoryButton onClick={handleAdd} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ flex: '1 1 auto' }}>
          <ProductCategoryTable
            productCategories={paginatedProductCategories}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>

        {filteredProductCategories.length > 0 && (
          <div style={{
            marginTop: isMobile ? '28px' : '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '4px' : '6px',
            alignItems: 'center',
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: isMobile ? '4px 10px' : '6px 12px',
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: "#fff",
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                color: currentPage === 1 ? '#ccc' : '#333',
              }}
            >‹</button>

            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={i} style={{ padding: isMobile ? '4px 6px' : '6px 10px', fontSize: isMobile ? '12px' : '14px', color: '#999' }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    padding: isMobile ? '4px 10px' : '6px 12px',
                    borderRadius: "6px",
                    border: p === currentPage ? '1px solid #FF4FD6' : '1px solid #ddd',
                    background: p === currentPage ? '#FF4FD6' : '#fff',
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '14px',
                    color: p === currentPage ? '#fff' : '#333',
                  }}
                >{p}</button>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: isMobile ? '4px 10px' : '6px 12px',
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: "#fff",
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                color: currentPage === totalPages ? '#ccc' : '#333',
              }}
            >›</button>
          </div>
        )}
      </div>

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
               existingCategories={productCategories}
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
              existingCategories={productCategories}
            />
          </div>
        </div>
      )}

      {/* ── ALERTAS ── */}

      {/* ✅ Main Alert (success / error / warning) — patrón ProductionPage */}
      <Alert
        isOpen={mainAlert.open}
        type={mainAlert.type}
        title={mainAlert.title}
        message={mainAlert.message}
        onConfirm={() => setMainAlert(p => ({ ...p, open: false }))}
        onCancel={() => setMainAlert(p => ({ ...p, open: false }))}
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