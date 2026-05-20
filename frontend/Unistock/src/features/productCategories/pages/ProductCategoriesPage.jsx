import React, { useState } from 'react';
import { useProductCategories } from '../hooks/useProductCategories';
import Alert from '../../shared/components/Alert';
import ProductCategoryTable from '../components/ProductCategoryTable';
import ProductCategorySearch from '../components/ProductCategorySearch';
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
    createProductCategory, 
    updateProductCategory, 
    deleteProductCategory 
  } = useProductCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProductCategory, setEditingProductCategory] = useState(null);

  // 🔥 ALERTAS (igual que Categories)
  const [successAlert, setSuccessAlert] = useState({ open: false, key: 0, title: "", message: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, key: 0, title: "", message: "" });
  const [warningAlert, setWarningAlert] = useState({ open: false, key: 0, title: "", message: "" });

  const [confirmAlert, setConfirmAlert] = useState({
    open: false,
    key: 0,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: null,
  });

  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    step: "confirm",
    productCategoryId: null,
    productCategoryName: "",
    productCount: 0,
    key: 0
  });

  const itemsPerPage = 7;

  // 🔍 FILTRO
  const filteredProductCategories = productCategories.filter(pc => {
    const searchLower = searchTerm.toLowerCase();

    return (
      pc.name?.toLowerCase().includes(searchLower) ||
      pc.description?.toLowerCase().includes(searchLower) ||
      pc.productCount?.toString().includes(searchTerm)
    );
  });

  const paginatedProductCategories = filteredProductCategories.slice(0, itemsPerPage);

  // 🔔 ALERT HANDLERS
  const handleShowAlert = ({ type, title, message }) => {
    const setter = {
      success: setSuccessAlert,
      error: setErrorAlert,
      warning: setWarningAlert
    }[type];

    if (!setter) return;

    setter({ open: false, key: Date.now() });

    setTimeout(() => {
      setter({
        open: true,
        key: Date.now(),
        title,
        message
      });
    }, 50);
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

      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Categoría creada correctamente"
      });

    } catch (error) {

      handleCloseForm();

      handleShowAlert({
        type: "error",
        title: "Error",
        message: error.message
      });
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateProductCategory(getProductCategoryId(editingProductCategory), data);

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
        title: "Error",
        message: error.message
      });
    }
  };

  const handleDeleteClick = (id) => {
    const pc = productCategories.find(c => sameProductCategoryId(getProductCategoryId(c), id));

    if (!pc) return;

    if (pc.productCount > 0) {
      handleShowAlert({
        type: "warning",
        title: "No se puede eliminar",
        message: `Tiene ${pc.productCount} producto(s) asociados`
      });

      return;
    }

    setDeleteAlert({
      open: true,
      step: "confirm",
      productCategoryId: id,
      productCategoryName: pc.name,
      productCount: pc.productCount,
      key: Date.now()
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProductCategory(deleteAlert.productCategoryId);

      setDeleteAlert({
        open: false,
        step: "confirm",
        key: Date.now()
      });

      handleShowAlert({
        type: "success",
        title: "Eliminado",
        message: "Categoría eliminada correctamente"
      });

    } catch (error) {

      handleShowAlert({
        type: "error",
        title: "Error",
        message: error.message
      });

      setDeleteAlert({
        open: false,
        step: "confirm",
        key: Date.now()
      });
    }
  };

  // 🎨 MODAL STYLES (igual que Categories)
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    pointerEvents: 'none'
  };

  const modalBackgroundStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'auto',
    zIndex: 101
  };

  const modalContentStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    zIndex: 102,
    pointerEvents: 'auto'
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '16px 12px' : '24px 32px'
      }}
    >

      {/* ── ROW 1: Título + Search ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '0px',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}
        >
          Categorías de productos
        </h1>

        <ProductCategorySearch
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* ── ROW 2: Botón en card ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'flex-end',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          padding: '12px 20px',
          marginBottom: '20px',
        }}
      >
        <AddProductCategoryButton onClick={handleAdd} />
      </div>

      {/* ── TABLA ── */}
      <ProductCategoryTable
        productCategories={paginatedProductCategories}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* ── MODALES ── */}
      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div
            style={modalBackgroundStyle}
            onClick={handleCloseForm}
          />

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
          <div
            style={modalBackgroundStyle}
            onClick={handleCloseForm}
          />

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

      {/* ── ALERTAS (igual que Categories) ── */}
      <Alert
        {...successAlert}
        type="success"
        onConfirm={() => setSuccessAlert({ ...successAlert, open: false })}
        onCancel={() => setSuccessAlert({ ...successAlert, open: false })}
      />

      <Alert
        {...errorAlert}
        type="error"
        onConfirm={() => setErrorAlert({ ...errorAlert, open: false })}
        onCancel={() => setErrorAlert({ ...errorAlert, open: false })}
      />

      <Alert
        {...warningAlert}
        type="warning"
        onConfirm={() => setWarningAlert({ ...warningAlert, open: false })}
        onCancel={() => setWarningAlert({ ...warningAlert, open: false })}
      />

      <Alert
        {...confirmAlert}
        type="confirm"
        onConfirm={() => {
          confirmAlert.onConfirm?.();

          setConfirmAlert({
            ...confirmAlert,
            open: false
          });
        }}
        onCancel={() =>
          setConfirmAlert({
            ...confirmAlert,
            open: false
          })
        }
      />

      <Alert
        open={deleteAlert.open && deleteAlert.step === "confirm"}
        type="confirm"
        title="Confirmar eliminación"
        message={`¿Eliminar "${deleteAlert.productCategoryName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() =>
          setDeleteAlert({
            ...deleteAlert,
            step: "password"
          })
        }
        onCancel={() =>
          setDeleteAlert({
            open: false
          })
        }
      />

      <Alert
        open={deleteAlert.open && deleteAlert.step === "password"}
        type="password"
        title="Confirmar eliminación"
        message="Ingresa la contraseña"
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteAlert({
            open: false
          })
        }
      />

    </div>
  );
};

export default ProductCategoriesPage;
