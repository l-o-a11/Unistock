import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
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
import { useSedes } from '../../sedes/hooks/useSedes';
import { useSedeScope, isVisibleBySede } from '../../shared/hooks/useSedeScope';
import { productAPI } from '../services/productAPI';

import putongasLogoUrl from '../../shared/assets/putongasLogo.png';

const ProductsPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { products, loading, createProduct, updateProduct, deleteProduct, toggleProduct, refreshProducts } = useProducts();
  const { searchTerm, handleSearch } = useProductSearch();
  const [currentPage, setCurrentPage] = useState(1);

  // El gerente ve todos los productos; los demás roles se limitan a su sede.
  // ve los de su propia sede (y los que aún no tienen sede asignada, para
  // no ocultar productos creados antes de este cambio). Mismo criterio que
  // Empleados y Producción — ver useSedeScope.
  const { sedes } = useSedes();
  const { isGerente, sedeId } = useSedeScope();
  const sedesActivas = sedes.filter((s) => s.estado !== false);
  const sedesPermitidas = isGerente
    ? sedesActivas
    : sedesActivas.filter((s) => String(s.id) === String(sedeId));

  const productsEnMiSede = useMemo(() => {
    if (!products) return [];
    if (isGerente) return products;
    return products.filter((p) => isVisibleBySede(p, isGerente, sedeId));
  }, [products, isGerente, sedeId]);


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
    productId: null,
    key: 0
  });

  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;

    if (path.endsWith("/productos/crear")) {
      setShowCreateForm(true);
      setEditingProduct(null);
      setShowEditForm(false);
    } else if (path.includes("/productos/editar/")) {
      const id = params.id;
      if (!id) return;

      setShowCreateForm(false);
      setShowEditForm(false);
      setEditingProduct(null);

      productAPI
        .getById(id)
        .then((product) => {
          if (product) {
            setEditingProduct(product);
            setShowEditForm(true);
          } else {
            navigate("/layout/productos", { replace: true });
          }
        })
        .catch(() => {
          navigate("/layout/productos", { replace: true });
        });
    } else {
      setShowCreateForm(false);
      setShowEditForm(false);
      setEditingProduct(null);
    }
  }, [location.pathname, params.id, navigate, productAPI]);

  const filteredProducts = productsEnMiSede.filter(product => {
    const searchLower = searchTerm.toLowerCase().trim();

    if (!searchLower) return true;

    const estaActivo = product.active !== false;

    const esBusquedaActivo = searchLower === "activo" || searchLower === "act" || searchLower === "acti" || searchLower === "activ";
    const esBusquedaInactivo = searchLower === "inactivo" || searchLower === "inac" || searchLower === "inact" || searchLower === "inacti";

    if (esBusquedaActivo && estaActivo) return true;
    if (esBusquedaInactivo && !estaActivo) return true;

    if (!esBusquedaActivo && !esBusquedaInactivo) {
      const matchesName      = product.name?.toLowerCase().includes(searchLower);
      const matchesReference = product.reference?.toLowerCase().includes(searchLower);
      const matchesCategory  = product.category?.toLowerCase().includes(searchLower);
      const matchesPrice     = product.price?.toString().includes(searchTerm);
      const matchesStock     = product.stock?.toString().includes(searchTerm);
      return matchesName || matchesReference || matchesCategory || matchesPrice || matchesStock;
    }

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
        setSuccessAlert({ open: true, key: Date.now(), title, message });
        setTimeout(() => setSuccessAlert(prev => ({ ...prev, open: false })), 3000);
      }, 50);
    } else if (type === "error") {
      setErrorAlert({ open: false, key: Date.now() });
      setTimeout(() => {
        setErrorAlert({ open: true, key: Date.now(), title, message });
        setTimeout(() => setErrorAlert(prev => ({ ...prev, open: false })), 3000);
      }, 50);
    } else if (type === "warning") {
      setWarningAlert({ open: false, key: Date.now() });
      setTimeout(() => {
        setWarningAlert({ open: true, key: Date.now(), title, message });
        setTimeout(() => setWarningAlert(prev => ({ ...prev, open: false })), 3000);
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

  const handleAddProduct = () => setShowCreateForm(true);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingProduct(null);
    const path = location.pathname;
    if (path.endsWith("/productos/crear") || path.includes("/productos/editar/")) {
      navigate("/layout/productos", { replace: true });
    }
  };

  const handleCreateSubmit = async (productData) => {
    try {
      await createProduct(productData);
      handleCloseForm();
      handleShowAlert({ type: "success", title: "¡Éxito!", message: "Producto creado correctamente" });
    } catch (error) {
      const isDuplicate =
        error.message?.includes("duplicate key") ||
        error.message?.includes("E11000") ||
        error.message?.includes("dup key") ||
        error.message?.includes("ya existe");

      if (isDuplicate) {
        handleShowAlert({
          type: "error",
          title: "Producto duplicado",
          message: "Ya existe un producto con ese nombre o referencia. Por favor usa un nombre diferente."
        });
      } else {
        handleCloseForm();
        handleShowAlert({ type: "error", title: "¡Error!", message: error.message || "Error al crear producto" });
      }
    }
  };

  const handleEditSubmit = async (productData) => {
    try {
      await updateProduct(editingProduct.id, productData);
      handleCloseForm();
      handleShowAlert({ type: "success", title: "¡Éxito!", message: "Producto actualizado correctamente" });
    } catch (error) {
      const isDuplicate =
        error.message?.includes("duplicate key") ||
        error.message?.includes("E11000") ||
        error.message?.includes("dup key") ||
        error.message?.includes("ya existe");
      if (isDuplicate) {
        handleShowAlert({
          type: "error",
          title: "Producto duplicado",
          message: "Ya existe un producto con esa referencia o nombre. Por favor usa uno diferente."
        });
      } else {
        handleCloseForm();
        handleShowAlert({ type: "error", title: "¡Error!", message: error.message || "Error al actualizar producto" });
      }
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
      setDeleteAlert({ open: false, productId: null, key: Date.now() });
      handleShowAlert({ type: "success", title: "¡Éxito!", message: "Producto eliminado correctamente" });
    } catch (error) {
      const isInvalidPassword = error?.status === 401 || /contraseñ|password/i.test(String(error?.message || ""));
      handleShowAlert({
        type: "error",
        title: isInvalidPassword ? "Contraseña incorrecta" : "¡Error!",
        message: isInvalidPassword
          ? "La contraseña no coincide con tu usuario actual."
          : (error.message || "Error al eliminar producto")
      });
      setDeleteAlert(prev => ({ ...prev, open: isInvalidPassword }));
    }
  };

  const handleDeleteClick = (id) => {
    const product = productsEnMiSede.find(p => p.id === id);

    if (product?.technicalSheet) {
      handleShowAlert({
        type: "warning",
        title: "No se puede eliminar",
        message: `El producto "${product.name}" tiene una ficha técnica asociada.`
      });
      return;
    }

    setDeleteAlert({ open: true, productId: id, key: Date.now() });
  };

// Activar o desactivar un producto requiere validar la contraseña del
  // usuario logueado (igual que la eliminación). El ProductTable envía la
  // contraseña capturada en su Alert de confirmación.
  const handleToggle = async (id, nextActive, password) => {
    try {
      await AuthAPI.verifyPassword(password);
      await toggleProduct(id, nextActive);
      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: nextActive ? "Producto activado correctamente" : "Producto inactivado correctamente"
      });
    } catch (error) {
      const isInvalidPassword =
        error?.status === 401 || /contraseñ|password/i.test(String(error?.message || ""));
      handleShowAlert({
        type: "error",
        title: isInvalidPassword ? "Contraseña incorrecta" : "¡Error!",
        message: isInvalidPassword
          ? "La contraseña no coincide con tu usuario actual."
          : (error.message || "Error al cambiar el estado del producto")
      });
    }
  };

  const handleStockChange = async (id, delta) => {
    const product = productsEnMiSede.find(p => p.id === id);
    if (!product) return;

    const currentStock = Number(product.stock) || 0;
    const newStock = Math.max(0, currentStock + delta);

    if (newStock === currentStock) return;

    // ⚠️ Validar stock máximo antes de actualizar
    if (delta > 0 && currentStock >= 100) {
      handleShowAlert({
        type: "warning",
        title: "Stock máximo alcanzado",
        message: `El producto "${product.name}" ya tiene el stock máximo (100 unidades). No se pueden agregar más unidades.`
      });
      return;
    }

    try {
      await updateProduct(id, { ...product, stock: newStock });

      // ✅ Mostrar alerta según el nuevo stock
      if (newStock === 5) {
        handleShowAlert({
          type: "warning",
          title: "Stock mínimo alcanzado",
          message: `El producto "${product.name}" ha llegado al stock mínimo (5 unidades).`
        });
      } else if (newStock === 100) {
        handleShowAlert({
          type: "success",
          title: "Stock máximo alcanzado",
          message: `El producto "${product.name}" ha llegado al stock máximo (100 unidades).`
        });
      }
    } catch (error) {
      handleShowAlert({ type: "error", title: "¡Error!", message: error.message || "Error al actualizar el stock" });
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
   * DESCARGA EXCEL — estilos iguales a producción
   * Se conserva la lógica de exportación y solo se ajusta el diseño visual.
   * ══════════════════════════════════════════════════════════════════════ */
  const handleDownloadExcel = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "UniStock";
    wb.created = new Date();

    const ws = wb.addWorksheet("Productos", {
      pageSetup: { orientation: "landscape", fitToPage: true },
    });

    const now = new Date();
    const fecha = now.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    ws.columns = [
      { key: "referencia", width: 14 },
      { key: "nombre", width: 28 },
      { key: "categoria", width: 18 },
      { key: "precio", width: 12 },
      { key: "stock", width: 10 },
      { key: "estado", width: 12 },
    ];

    const ARGB = (hex) => "FF" + hex.replace("#", "").toUpperCase();
    const fillSolid = (hex) => ({ type: "pattern", pattern: "solid", fgColor: { argb: ARGB(hex) } });
    const thinBorder = (hex = "#FF4FD6") => {
      const c = { style: "thin", color: { argb: ARGB(hex) } };
      return { top: c, bottom: c, left: c, right: c };
    };

    let logoLoaded = false;

    try {
      const logoRes = await fetch(putongasLogoUrl);
      if (logoRes.ok) {
        const blob = await logoRes.blob();
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const logoId = wb.addImage({ base64, extension: putongasLogoUrl.toLowerCase().endsWith(".jpg") || putongasLogoUrl.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png" });
        ws.addImage(logoId, { tl: { col: 0.15, row: 0.15 }, ext: { width: 46, height: 60 } });
        logoLoaded = true;
      }
    } catch (e) {
      console.warn("No se pudo cargar el logo:", e);
    }

    if (logoLoaded) {
      ws.mergeCells("B1:F1");
      ws.mergeCells("B2:F2");
    } else {
      ws.mergeCells("A1:F1");
      ws.mergeCells("A2:F2");
    }

    ws.getRow(1).height = 30;
    ws.getRow(2).height = 18;
    ws.getRow(3).height = 6;

    ["A1", "B1", "C1", "D1", "E1", "F1", "A2", "B2", "C2", "D2", "E2", "F2", "A3", "B3", "C3", "D3", "E3", "F3"].forEach((ref) => {
      ws.getCell(ref).fill = fillSolid("#FFFFFF");
    });

    const titleCell = ws.getCell(logoLoaded ? "B1" : "A1");
    titleCell.value = "Productos — Sistema de Gestión UniStock";
    titleCell.font = { name: "Arial", size: 15, bold: true, color: { argb: "FF000000" } };
    titleCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    const subCell = ws.getCell(logoLoaded ? "B2" : "A2");
    subCell.value = `Generado el ${fecha} · ${filteredProducts.length} producto${filteredProducts.length !== 1 ? "s" : ""}`;
    subCell.font = { name: "Arial", size: 10, color: { argb: "FF000000" } };
    subCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    ws.getCell(logoLoaded ? "B2" : "A2").border = { bottom: { style: "thin", color: { argb: ARGB("#FF4FD6") } } };

    const headerRow = ws.getRow(4);
    headerRow.height = 26;

    ["Referencia", "Nombre", "Categoría", "Precio", "Stock", "Estado"].forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: ARGB("#FF4FD6") } };
      cell.fill = fillSolid("#FFFFFF");
      cell.alignment = { horizontal: i >= 3 ? "right" : "left", vertical: "middle", indent: i >= 3 ? 0 : 1 };
      const pinkThin = { style: "thin", color: { argb: ARGB("#FF4FD6") } };
      cell.border = { top: pinkThin, left: pinkThin, right: pinkThin, bottom: { style: "medium", color: { argb: ARGB("#FF4FD6") } } };
    });

    filteredProducts.forEach((p, i) => {
      const row = ws.getRow(5 + i);
      row.height = 20;
      const values = [
        p.reference || "—",
        p.name || "—",
        p.category || "—",
        p.price ?? 0,
        p.stock ?? 0,
        p.active !== false ? "Activo" : "Inactivo",
      ];

      values.forEach((v, c) => {
        const cell = row.getCell(c + 1);
        cell.value = v;
        cell.fill = fillSolid("#FFFFFF");
        cell.border = thinBorder();
        cell.alignment = { horizontal: c >= 3 ? "right" : "left", vertical: "middle", indent: c >= 3 ? 0 : 1 };
        cell.font = { name: "Arial", size: 10, color: { argb: "FF374151" } };
      });

      row.getCell(1).font = { name: "Arial", size: 10, bold: true, color: { argb: ARGB("#FF4FD6") } };
      row.getCell(5).font = { name: "Arial", size: 10, bold: true, color: { argb: ARGB("#a858d6") } };
    });

    const totalRowIdx = filteredProducts.length + 6;
    const totalStock = filteredProducts.reduce((s, p) => s + (Number(p.stock) || 0), 0);
    const totalRow = ws.getRow(totalRowIdx);

    const totalLabelCell = totalRow.getCell(2);
    totalLabelCell.value = "Total stock";
    totalLabelCell.font = { name: "Arial", size: 10, bold: true, color: { argb: ARGB("#363636") } };
    totalLabelCell.fill = fillSolid("#FFFFFF");
    totalLabelCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    totalLabelCell.border = { top: { style: "medium", color: { argb: ARGB("#FF4FD6") } } };

    const totalValueCell = totalRow.getCell(5);
    totalValueCell.value = totalStock;
    totalValueCell.font = { name: "Arial", size: 11, bold: true, color: { argb: ARGB("#a858d6") } };
    totalValueCell.fill = fillSolid("#FFFFFF");
    totalValueCell.alignment = { horizontal: "right", vertical: "middle" };
    totalValueCell.border = { top: { style: "medium", color: { argb: ARGB("#FF4FD6") } } };

    [1, 3, 4, 6].forEach((col) => {
      const c = totalRow.getCell(col);
      c.fill = fillSolid("#FFFFFF");
      c.border = { top: { style: "medium", color: { argb: ARGB("#FF4FD6") } } };
    });

    try {
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "productos.xlsx";
      link.click();
      URL.revokeObjectURL(url);

      handleShowAlert({
        type: "success",
        title: "¡Éxito!",
        message: "Archivo exportado correctamente",
      });
    } catch (e) {
      console.error(e);
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

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    pointerEvents: 'none'
  };

  const modalBackgroundStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    pointerEvents: 'auto',
    zIndex: 1001
  };

  const modalContentStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '94vw',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflowX: 'hidden',
    overflowY: 'auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    zIndex: 1002,
    pointerEvents: 'auto',
    boxSizing: 'border-box'
  };

  // ── Estado de carga inicial ────────────────────────────────────────────
  // El skeleton replica el layout del header, buscador y barra de acciones
  // para que no haya "salto" visual cuando los datos ya cargaron.
  if (loading && products.length === 0) return (
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
          Productos
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          gap: '4px',
          width: isMobile ? '100%' : 'auto',
        }}>
          <div style={{
            width: 400, maxWidth: '100%', height: 38, borderRadius: 10,
            background: '#f3f4f6', border: '1px solid #e5e7eb',
            animation: 'pskeleton-pulse 1.6s ease-in-out infinite',
          }} />
          <div style={{
            width: 260, height: 11, borderRadius: 6, background: '#f3f4f6',
            animation: 'pskeleton-pulse 1.6s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* BARRA BLANCA CON EXPORTAR + BOTÓN AGREGAR */}
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
        gap: isMobile ? '10px' : '0px',
      }}>
        <div style={{
          width: 84, height: 18, borderRadius: 6, background: '#f3f4f6',
          animation: 'pskeleton-pulse 1.6s ease-in-out infinite',
        }} />
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
      position: 'relative',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      minHeight: 'calc(100vh - 90px)',
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-end',
          gap: '4px',
          width: '100%',
        }}>
          <ProductSearch value={searchTerm} onChange={handleSearch} width="400px" maxWidth="100%" isLoading={loading} />
          <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: isMobile ? 'normal' : 'nowrap', textAlign: isMobile ? 'left' : 'right', display: 'block', width: '400px', maxWidth: '100%' }}>
            Escribe <strong>activo</strong> para ver registros activos · <strong>inactivo</strong> para ver registros inactivos
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '12px 20px',
        marginBottom: '20px',
        gap: isMobile ? '12px' : '0px',
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <button
             onClick={handleDownloadExcel}
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
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
               <polyline points="7 10 12 15 17 10" />
               <line x1="12" y1="15" x2="12" y2="3" />
             </svg>
             <span style={{ fontSize: '14px', fontWeight: '500' }}>Exportar</span>
           </button>
         </div>

         <AddProductButton onClick={handleAddProduct} />
       </div>

      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto' }}>
        <ProductTable
          products={paginatedProducts}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggle={handleToggle}
          onStockChange={handleStockChange}
        />
      </div>

      {filteredProducts.length > 0 && (
        <div style={{
          marginTop: isMobile ? '24px' : 'auto',
          marginBottom: isMobile ? '16px' : '20px',
          display: "flex",
          justifyContent: "center",
          gap: isMobile ? '4px' : '6px',
          alignItems: "center",
        }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
          >
            ‹
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: isMobile ? '4px 6px' : '6px 10px', fontSize: isMobile ? '12px' : '14px', color: "#999" }}>...</span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  padding: isMobile ? '4px 10px' : '6px 12px',
                  borderRadius: "6px",
                  border: p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd",
                  background: p === currentPage ? "#FF4FD6" : "#fff",
                  cursor: "pointer",
                  fontSize: isMobile ? '12px' : '14px',
                  color: p === currentPage ? "#fff" : "#333",
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
              padding: isMobile ? '4px 10px' : '6px 12px',
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: "#fff",
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: isMobile ? '12px' : '14px',
              color: currentPage === totalPages ? '#ccc' : '#333',
            }}
          >
            ›
          </button>
        </div>
      )}

      {showCreateForm && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div className="roles-modal-scroll" style={modalContentStyle}>
            <ProductForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
              existingProducts={products}
              sedes={sedesPermitidas}
            />
          </div>
        </div>
      )}

      {showEditForm && editingProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalBackgroundStyle} onClick={handleCloseForm} />
          <div className="roles-modal-scroll" style={modalContentStyle}>
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
              onShowAlert={handleShowAlert}
              onShowConfirm={handleShowConfirm}
              existingProducts={products}
              sedes={sedesPermitidas}
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
            if (confirmAlert.onConfirm) confirmAlert.onConfirm();
            setConfirmAlert({ ...confirmAlert, open: false });
          }}
          onCancel={() => setConfirmAlert({ ...confirmAlert, open: false })}
        />

        <Alert
          key={`delete-password-${deleteAlert.key}`}
          isOpen={deleteAlert.open}
          type="password"
          title="Confirmar eliminación"
          message="Ingresa la contraseña de administrador para eliminar este producto"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteAlert({ open: false, productId: null, key: Date.now() })}
        />
      </div>
    </div>
  );
};

export default ProductsPage;