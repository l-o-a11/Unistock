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
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProductCategory, setEditingProductCategory] = useState(null);

  // 🔥 ALERTAS (SIN KEYS - no son listas dinámicas)
  const [successAlert, setSuccessAlert] = useState({ open: false, title: "", message: "" });
  const [errorAlert, setErrorAlert] = useState({ open: false, title: "", message: "" });
  const [warningAlert, setWarningAlert] = useState({ open: false, title: "", message: "" });

  const [confirmAlert, setConfirmAlert] = useState({
    open: false,
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
    productCount: 0
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

    setter({ open: false });

    setTimeout(() => {
      setter({
        open: true,
        title,
        message
      });
    }, 50);
  };

  const handleShowConfirm = ({ title, message, confirmText, cancelText, onConfirm }) => {
    setConfirmAlert({ open: false });

    setTimeout(() => {
      setConfirmAlert({
        open: true,
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
      productCount: pc.productCount
    });
  };

  const handleDeleteConfirm = async (password) => {
    try {
      await AuthAPI.verifyPassword(password);
      await deleteProductCategory(deleteAlert.productCategoryId);

      setDeleteAlert({
        open: false,
        step: "confirm"
      });

      handleShowAlert({
        type: "success",
        title: "Eliminado",
        message: "Categoría eliminada correctamente"
      });

    } catch (error) {
      const isInvalidPassword = error?.status === 401 || /contraseñ|password/i.test(String(error?.message || ""));

      handleShowAlert({
        type: "error",
        title: isInvalidPassword ? "Contraseña incorrecta" : "Error",
        message: isInvalidPassword
          ? "La contraseña no coincide con tu usuario actual."
          : error.message
      });

      setDeleteAlert((prev) => ({
        ...prev,
        open: isInvalidPassword,
        step: isInvalidPassword ? "password" : "confirm"
      }));
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

        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          width="400px"
          maxWidth="400px"
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

      {/* ── ALERTAS (SIN KEYS - No son listas dinámicas) ── */}
      
      {/* ✅ Success Alert */}
      <Alert
        isOpen={successAlert.open}
        title={successAlert.title}
        message={successAlert.message}
        type="success"
        onConfirm={() => setSuccessAlert({ ...successAlert, open: false })}
        onCancel={() => setSuccessAlert({ ...successAlert, open: false })}
      />

      {/* ✅ Error Alert */}
      <Alert
        isOpen={errorAlert.open}
        title={errorAlert.title}
        message={errorAlert.message}
        type="error"
        onConfirm={() => setErrorAlert({ ...errorAlert, open: false })}
        onCancel={() => setErrorAlert({ ...errorAlert, open: false })}
      />

      {/* ✅ Warning Alert */}
      <Alert
        isOpen={warningAlert.open}
        title={warningAlert.title}
        message={warningAlert.message}
        type="warning"
        onConfirm={() => setWarningAlert({ ...warningAlert, open: false })}
        onCancel={() => setWarningAlert({ ...warningAlert, open: false })}
      />

      {/* ✅ Confirm Alert */}
      <Alert
        isOpen={confirmAlert.open}
        title={confirmAlert.title}
        message={confirmAlert.message}
        type="confirm"
        confirmText={confirmAlert.confirmText}
        cancelText={confirmAlert.cancelText}
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

      {/* ✅ Delete Confirm */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
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

      {/* ✅ Delete Password */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "password"}
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