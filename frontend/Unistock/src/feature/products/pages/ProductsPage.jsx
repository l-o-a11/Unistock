import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useProductSearch } from '../hooks/useProductSearch';
import Alert from '../components/Alert';
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
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showTechnicalSheet, setShowTechnicalSheet] = useState(false);
  const [selectedProductForSheet, setSelectedProductForSheet] = useState(null);
  
  // Alertas separadas por tipo
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
    productId: null,
    key: Date.now()
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // 🔥 FUNCIONES CORREGIDAS PARA COINCIDIR CON ProductForm
  const handleShowAlert = ({ type, title, message }) => {
    // Cerrar cualquier alerta del mismo tipo
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

  const handleShowConfirm = ({ title, message, confirmText, cancelText, onConfirm, type = "default" }) => {
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
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Producto creado correctamente"
      });
    } catch (error) {
      handleCloseForm();
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: error.message || "Error al crear producto"
      });
    }
  };

  const handleEditSubmit = async (productData) => {
    try {
      await updateProduct(editingProduct.id, productData);
      handleCloseForm();
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Producto actualizado correctamente"
      });
    } catch (error) {
      handleCloseForm();
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: error.message || "Error al actualizar producto"
      });
    }
  };

  const handleView = (product) => {
    setSelectedProductForSheet(product);
    setShowTechnicalSheet(true);
  };

  const handleCloseTechnicalSheet = () => {
    setShowTechnicalSheet(false);
    setSelectedProductForSheet(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(deleteAlert.productId);
      setDeleteAlert({ open: false, step: "confirm", productId: null, key: Date.now() });
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Producto eliminado correctamente"
      });
    } catch (error) {
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: error.message || "Error al eliminar producto"
      });
      setDeleteAlert({ open: false, step: "confirm", productId: null, key: Date.now() });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteAlert({
      open: true,
      step: "confirm",
      productId: id,
      key: Date.now()
    });
  };
  
  const handleDownload = () => {
    try {
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
      
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Archivo exportado correctamente"
      });
    } catch (error) {
      handleShowAlert({
        type: "error",
        title: "¡Error!",
        message: "Error al exportar archivo"
      });
    }
  };

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

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
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
    zIndex: 1001
  };

  const modalContentStyle = {
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
  };

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0', 
      padding: '24px 32px' 
    }}>

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

      <ProductTable
        products={paginatedProducts}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggle={toggleProduct}
      />

      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div style={modalContentStyle}>
            <ProductForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
            />
          </div>
        </div>
      )}

      {showEditForm && editingProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div style={modalContentStyle}>
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
            />
          </div>
        </div>
      )}

      {showTechnicalSheet && (
        <TechnicalSheetModal
          product={selectedProductForSheet}
          onClose={handleCloseTechnicalSheet}
        />
      )}

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

      {/* Alertas */}
      <div style={{ position: 'relative', zIndex: 9999 }}>
        {/* Alerta de éxito */}
        <Alert
          key={`success-${successAlert.key}`}
          isOpen={successAlert.open}
          type="success"
          title={successAlert.title}
          message={successAlert.message}
          onConfirm={() => setSuccessAlert({ ...successAlert, open: false })}
        />

        {/* Alerta de error */}
        <Alert
          key={`error-${errorAlert.key}`}
          isOpen={errorAlert.open}
          type="error"
          title={errorAlert.title}
          message={errorAlert.message}
          onConfirm={() => setErrorAlert({ ...errorAlert, open: false })}
        />

        {/* Alerta de advertencia */}
        <Alert
          key={`warning-${warningAlert.key}`}
          isOpen={warningAlert.open}
          type="warning"
          title={warningAlert.title}
          message={warningAlert.message}
          onConfirm={() => setWarningAlert({ ...warningAlert, open: false })}
        />

        {/* Alerta de confirmación genérica */}
        <Alert
          key={`confirm-${confirmAlert.key}`}
          isOpen={confirmAlert.open}
          type="confirm"
          title={confirmAlert.title}
          message={confirmAlert.message}
          confirmText={confirmAlert.confirmText}
          cancelText={confirmAlert.cancelText}
          confirmButtonColor="#ff4fd6"
          onConfirm={() => {
            if (confirmAlert.onConfirm) {
              confirmAlert.onConfirm();
            }
            setConfirmAlert({ ...confirmAlert, open: false });
          }}
          onCancel={() => setConfirmAlert({ ...confirmAlert, open: false })}
        />

        {/* Alerta de eliminación de producto - paso confirmación */}
        <Alert
          key={`delete-confirm-${deleteAlert.key}`}
          isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
          type="confirm"
          title="Confirmar eliminación"
          message="¿Seguro que deseas eliminar este producto?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmButtonColor="#ff4fd6"
          onConfirm={() => setDeleteAlert({ ...deleteAlert, step: "password", key: Date.now() })}
          onCancel={() => setDeleteAlert({ open: false, step: "confirm", productId: null, key: Date.now() })}
        />

        {/* Alerta de eliminación de producto - paso contraseña */}
        <Alert
          key={`delete-password-${deleteAlert.key}`}
          isOpen={deleteAlert.open && deleteAlert.step === "password"}
          type="password"
          title="Confirmar eliminación"
          message="Ingresa la contraseña de administrador"
          confirmText="Eliminar"
          cancelText="Cancelar"
          confirmButtonColor="#ff4fd6"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteAlert({ open: false, step: "confirm", productId: null, key: Date.now() })}
        />
      </div>
    </div>
  );
};

export default ProductsPage;