import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useProducts } from '../hooks/useProducts';
import { useProductSearch } from '../hooks/useProductSearch';
import Alert from '../../shared/components/Alert';
import { AuthAPI } from '../../auth/services/AuthAPI';
import ProductTable from '../components/ProductTable';
import ProductSearch from '../components/ProductSearch';
import AddProductButton from '../components/AddProductButton';
import ProductForm from '../components/ProductForm';
import TechnicalSheetModal from '../components/TechnicalSheetModal';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';

const ProductsPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { products, createProduct, updateProduct, deleteProduct, toggleProduct, refreshProducts } = useProducts();
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
    key: 0,
    title: "",
    message: "",
  });

  const [errorAlert, setErrorAlert] = useState({
    open: false,
    key: 0,
    title: "",
    message: "",
  });

  const [warningAlert, setWarningAlert] = useState({
    open: false,
    key: 0,
    title: "",
    message: "",
  });

  const [confirmAlert, setConfirmAlert] = useState({
    open: false,
    key: 0,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: null,
    type: "confirm",
  });

  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    step: "password",
    productId: null,
    key: 0
  });

  // 🔥 FILTRO MEJORADO - busca en TODOS los campos INCLUYENDO ESTADO
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase().trim();

    // Si no hay término de búsqueda, mostrar todos
    if (!searchLower) return true;

    // 🔥 BUSCAR POR ESTADO - BÚSQUEDA EXACTA
    const estaActivo = product.active !== false;

    // Verificar si el término de búsqueda coincide con "activo" o sus variantes
    const esBusquedaActivo = searchLower === "activo" || searchLower === "act" || searchLower === "acti" || searchLower === "activ";
    const esBusquedaInactivo = searchLower === "inactivo" || searchLower === "inac" || searchLower === "inact" || searchLower === "inacti";

    // Si está buscando activo y el producto está activo
    if (esBusquedaActivo && estaActivo) {
      return true;
    }
    // Si está buscando inactivo y el producto está inactivo
    if (esBusquedaInactivo && !estaActivo) {
      return true;
    }

    // Si NO está buscando por estado, buscar en los demás campos
    if (!esBusquedaActivo && !esBusquedaInactivo) {
      // Buscar por nombre
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      // Buscar por referencia
      const matchesReference = product.reference?.toLowerCase().includes(searchLower);
      // Buscar por categoría
      const matchesCategory = product.category?.toLowerCase().includes(searchLower);
      // Buscar por precio (convertir número a string)
      const matchesPrice = product.price?.toString().includes(searchTerm);
      // Buscar por stock (convertir número a string)
      const matchesStock = product.stock?.toString().includes(searchTerm);

      return matchesName || matchesReference || matchesCategory || matchesPrice || matchesStock;
    }

    // Si es búsqueda de estado pero no coincide con el estado del producto
    return false;
  });

  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

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
        setTimeout(() => {
          setSuccessAlert(prev => ({ ...prev, open: false }));
        }, 3000);
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
        setTimeout(() => {
          setErrorAlert(prev => ({ ...prev, open: false }));
        }, 3000);
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
        setTimeout(() => {
          setWarningAlert(prev => ({ ...prev, open: false }));
        }, 3000);
      }, 50);
    }
  };

  const handleShowConfirm = ({ title, message, confirmText, cancelText, onConfirm, type = "confirm" }) => {
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
        type,
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
      // Detectar error de duplicado de MongoDB
      const isDuplicate =
        error.message?.includes("duplicate key") ||
        error.message?.includes("E11000") ||
        error.message?.includes("dup key") ||
        error.message?.includes("ya existe");

      // No cerrar el formulario si es duplicado — el usuario puede corregir
      if (isDuplicate) {
        handleShowAlert({
          type: "error",
          title: "Producto duplicado",
          message: "Ya existe un producto con ese nombre o referencia. Por favor usa un nombre diferente."
        });
      } else {
        handleCloseForm();
        handleShowAlert({
          type: "error",
          title: "¡Error!",
          message: error.message || "Error al crear producto"
        });
      }
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

  const handleDeleteConfirm = async (password) => {
    try {
      await AuthAPI.verifyPassword(password);
      await deleteProduct(deleteAlert.productId);
      setDeleteAlert({ open: false, step: "password", productId: null, key: Date.now() });
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Producto eliminado correctamente"
      });
    } catch (error) {
      const isInvalidPassword = error?.status === 401 || /contraseñ|password/i.test(String(error?.message || ""));
      handleShowAlert({
        type: "error",
        title: isInvalidPassword ? "Contraseña incorrecta" : "¡Error!",
        message: isInvalidPassword
          ? "La contraseña no coincide con tu usuario actual."
          : (error.message || "Error al eliminar producto")
      });
      setDeleteAlert((prev) => ({
        ...prev,
        open: isInvalidPassword,
        step: "password",
      }));
    }
  };

  const handleDeleteClick = (id) => {
    const product = products.find(p => p.id === id);

    if (product?.technicalSheet) {
      handleShowAlert({
        type: "warning",
        title: "No se puede eliminar",
        message: `El producto "${product.name}" tiene una ficha técnica asociada.`
      });
      return;
    }

    setDeleteAlert({
      open: true,
      step: "password",
      productId: id,
      key: Date.now()
    });
  };

  const handleDownload = () => {
    try {
      const data = filteredProducts.map(p => ({
        'Referencia': p.reference,
        'Nombre': p.name,
        'Categoría': p.category,
        'Precio': p.price,
        'Stock': p.stock,
        'Estado': p.active !== false ? 'Activo' : 'Inactivo'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);

      const columnWidths = [
        { wch: 15 },
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `productos_${fecha}.xlsx`);

      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Archivo exportado correctamente"
      });
    } catch (error) {
      console.error('Error al exportar:', error);
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
      padding: isMobile ? '16px 12px' : '24px 32px'
    }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: '#1a1a1a' }}>
          Productos
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '4px' }}>
          <ProductSearch value={searchTerm} onChange={handleSearch} />
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
            Escribe <strong>activo</strong> para ver registros activos ·{" "}
            <strong>inactivo</strong> para ver registros inactivos
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '12px 20px',
        marginBottom: '20px',
      }}>
        <button
          onClick={handleDownload}
          title="Exportar"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
        >
          <svg
            width="20"
            height="20"
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
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Exportar</span>
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
              existingProducts={products}
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
          onTechnicalSheetChanged={() => refreshProducts()}
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
        <Alert
          key={`success-${successAlert.key}`}
          isOpen={successAlert.open}
          type="success"
          title={successAlert.title}
          message={successAlert.message}
          onConfirm={() => setSuccessAlert({ ...successAlert, open: false })}
        />

        <Alert
          key={`error-${errorAlert.key}`}
          isOpen={errorAlert.open}
          type="error"
          title={errorAlert.title}
          message={errorAlert.message}
          onConfirm={() => setErrorAlert({ ...errorAlert, open: false })}
        />

        <Alert
          key={`warning-${warningAlert.key}`}
          isOpen={warningAlert.open}
          type="warning"
          title={warningAlert.title}
          message={warningAlert.message}
          onConfirm={() => setWarningAlert({ ...warningAlert, open: false })}
        />

        <Alert
          key={`confirm-${confirmAlert.key}`}
          isOpen={confirmAlert.open}
          type={confirmAlert.type || "confirm"}
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

        <Alert
          key={`delete-password-${deleteAlert.key}`}
          isOpen={deleteAlert.open && deleteAlert.step === "password"}
          type="password"
          title="Confirmar eliminación"
          message="Ingresa la contraseña de administrador"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteAlert({ open: false, step: "password", productId: null, key: Date.now() })}
        />
      </div>
    </div>
  );
};

export default ProductsPage;