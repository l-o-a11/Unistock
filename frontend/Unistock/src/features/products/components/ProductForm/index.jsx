import React, { useState, useEffect, useCallback } from "react";
import TechnicalSheet from "../TechnicalSheet";
import { productCategoryAPI } from "../../../productCategories/services/productCategoryAPI";
import ProductCategoryForm from "../../../productCategories/components/ProductCategoryForm";
import ImageModal from "./ImageModal";

const normalizeText = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// ✅ USA VARIABLE DE ENTORNO VITE_BACK_URL
const BACKEND_URL = import.meta.env.VITE_BACK_URL || 'http://localhost:3020';

const CategoryDropdown = ({ value, onChange, touched, error, categories = [], onCreateCategory }) => {
  const [open, setOpen] = useState(false);
  
  const filteredCategories = categories.filter((cat) => {
    return Boolean(
      cat?.id ??
      cat?._id ??
      cat?.id_categoria_producto ??
      cat?.id_categorias ??
      cat?.id_categoria
    );
  });
  
  const handleSelect = (category) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", minWidth: "220px" }}>
      <div 
        onClick={() => setOpen((o) => !o)} 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          width: "100%",
          minHeight: "42px",
          boxSizing: "border-box",
          padding: "10px 14px", 
          borderBottom: touched && error ? "2px solid #ff4fd6" : "1.5px solid #d1d5db",
          cursor: "pointer", 
          fontSize: "14px", 
          color: value ? "#333" : "#aaa", 
          userSelect: "none", 
          backgroundColor: touched && error ? "#fff0f7" : (open ? "#fdf0f7" : "transparent"),
          borderRadius: open ? "6px 6px 0 0" : "6px",
          transition: "background-color 0.15s",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "Seleccionar categoria"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0, marginLeft: "10px" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: "260px", overflowY: "auto" }}>
            <div 
              style={{ padding: "10px 14px", fontSize: "14px", backgroundColor: "#ff4fd6", color: "#fff", fontWeight: "500", cursor: "pointer" }} 
              onClick={() => handleSelect("")}
            >
              Seleccionar categoria
            </div>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div 
                  key={cat.id ?? cat._id} 
                  onClick={() => handleSelect(cat)}
                  style={{ 
                    padding: "10px 14px", 
                    fontSize: "14px", 
                    color: "#333", 
                    cursor: "pointer", 
                    backgroundColor: normalizeText(value) === normalizeText(cat.name ?? cat.nombre) ? "#fdf0f7" : "#fff", 
                    borderTop: "1px solid #f5f5f5", 
                    transition: "background-color 0.1s" 
                  }}
                >
                  {cat.icon} {cat.name ?? cat.nombre}
                </div>
              ))
            ) : (
              <div style={{ padding: "10px 14px", fontSize: "13px", color: "#999", textAlign: "center" }}>
                Sin categorías disponibles
              </div>
            )}
            <div
              onClick={() => {
                setOpen(false);
                onCreateCategory?.();
              }}
              style={{
                padding: "12px 14px",
                fontSize: "14px",
                color: "#ff4fd6",
                cursor: "pointer",
                borderTop: "1px solid #f0f0f0",
                backgroundColor: "#fff",
                fontWeight: "600"
              }}
            >
              + Crear nueva categoria
            </div>
          </div>
        </>
      )}
      {touched && error && (
        <span style={{ color: "#ff4fd6", fontSize: "11px", marginLeft: "8px" }}>
          {error}
        </span>
      )}
    </div>
  );
};

const ProductForm = ({ product, onSubmit, onCancel, onShowAlert, onShowConfirm, existingProducts = [] }) => {
  const initialData = {
    reference: product?.reference || "",
    name: product?.name || "",
    category: product?.category || "",
    categoryId: product?.categoryId || null,
    price: product?.price || "",
    stock: product?.stock || "",
    image: product?.image || null,
    allImages: product?.allImages || [],
  };

  const [formData, setFormData] = useState(initialData);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({
    reference: "",
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  const [touched, setTouched] = useState({});
  const [technicalSheet, setTechnicalSheet] = useState(() => {
    if (!product?.technicalSheet) return null;
    return {
      client:        product.technicalSheet.client        ?? "",
      ref:           product.technicalSheet.ref           ?? "",
      type:          product.technicalSheet.type          ?? "",
      description:   product.technicalSheet.description   ?? "",
      descripciones: product.technicalSheet.descripciones ?? "",
      observations:  product.technicalSheet.observations  ?? "",
      createdBy:     product.technicalSheet.createdBy     ?? "",
      responsable:   product.technicalSheet.responsable   ?? "",
      image:         product.technicalSheet.image         ?? null,
      allImages:     product.technicalSheet.allImages     ?? [],
      date:          product.technicalSheet.date          ?? "",
      fabrics:       product.technicalSheet.fabrics       ?? [],
      cups:          product.technicalSheet.cups          ?? [],
      closures:      product.technicalSheet.closures      ?? [],
      accessories:   product.technicalSheet.accessories   ?? [],
      measurements:  product.technicalSheet.measurements  ?? [],
      id:            product.technicalSheet.id,
      version:       product.technicalSheet.version,
    };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [uploading, setUploading] = useState(false);

  const loadCategories = async () => {
    try {
      const apiCategories = await productCategoryAPI.getAll();
      setCategories(Array.isArray(apiCategories) && apiCategories.length > 0 ? apiCategories : []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    productCategoryAPI.getAll()
      .then((apiCategories) => {
        if (!cancelled) {
          setCategories(Array.isArray(apiCategories) && apiCategories.length > 0 ? apiCategories : []);
        }
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => { cancelled = true; };
  }, []);

  const getSelectedCategoryDescription = () => {
    const selected = categories.find(cat => 
      (cat.name ?? cat.nombre) === formData.category
    );
    return selected?.description ?? selected?.descripcion ?? "";
  };

  const handleCreateCategory = async (categoryData) => {
    const createdCategory = await productCategoryAPI.create(categoryData);
    await loadCategories();
    const categoryName = createdCategory?.name ?? createdCategory?.nombre ?? categoryData.name;
    setFormData((prev) => ({ ...prev, category: categoryName }));
    setTouched((prev) => ({ ...prev, category: true }));
    setErrors((prev) => ({ ...prev, category: "" }));
    setShowCategoryForm(false);
    onShowAlert?.({
      type: "success",
      title: "Exito!",
      message: "Categoria creada correctamente"
    });
  };

  const hasProductChanges = () => {
    if (!product) return true;
    return (
      formData.reference !== product.reference ||
      formData.name !== product.name ||
      formData.category !== product.category ||
      formData.price !== product.price ||
      formData.stock !== product.stock ||
      imagePreview !== product.image ||
      JSON.stringify(formData.allImages) !== JSON.stringify(product.allImages || [])
    );
  };

  const hasTechnicalSheetChanges = () => {
    if (!product) return !!technicalSheet;
    return technicalSheet !== product.technicalSheet;
  };

  const validateReference = (value) => {
    if (!value.trim()) return "La referencia es obligatoria";
    if (value.trim().length < 3) return "La referencia debe tener al menos 3 caracteres";
    const isDuplicate = existingProducts.some(
      (p) => p.reference?.toLowerCase().trim() === value.toLowerCase().trim()
        && p.id !== product?.id
    );
    if (isDuplicate) return "Ya existe un producto con esa referencia";
    return "";
  };

  const validateName = (value) => {
    if (!value.trim()) return "El nombre es obligatorio";
    if (/\d/.test(value)) return "El nombre no puede contener números";
    if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    return "";
  };

  const validateCategory = (value) => {
    if (!value) return "Selecciona una categoria";
    return "";
  };

  const validatePrice = (value) => {
    if (!value) return "El precio es obligatorio";
    if (isNaN(value) || Number(value) <= 0) return "El precio debe ser un número positivo";
    return "";
  };

  const validateStock = (value) => {
    if (!value) return "El stock es obligatorio";
    if (isNaN(value) || Number(value) < 0) return "El stock debe ser un número válido";
    return "";
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'reference') error = validateReference(value);
    if (name === 'name') error = validateName(value);
    if (name === 'category') error = validateCategory(value);
    if (name === 'price') error = validatePrice(value);
    if (name === 'stock') error = validateStock(value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    const referenceError = validateReference(formData.reference);
    const nameError = validateName(formData.name);
    const categoryError = validateCategory(formData.category);
    const priceError = validatePrice(formData.price);
    const stockError = validateStock(formData.stock);
    
    setErrors({
      reference: referenceError,
      name: nameError,
      category: categoryError,
      price: priceError,
      stock: stockError,
    });

    setTouched({
      reference: true,
      name: true,
      category: true,
      price: true,
      stock: true
    });

    const hasErrors = referenceError || nameError || categoryError || priceError || stockError;
    
    if (hasErrors) {
      const errorMessages = [];
      if (referenceError) errorMessages.push(referenceError);
      if (nameError) errorMessages.push(nameError);
      if (categoryError) errorMessages.push(categoryError);
      if (priceError) errorMessages.push(priceError);
      if (stockError) errorMessages.push(stockError);
      
      onShowAlert({
        type: "warning",
        title: "Campos inválidos",
        message: errorMessages.join(". ")
      });
      return false;
    }
    
    return true;
  };

  const hasAnyValue = (value) => {
    if (Array.isArray(value)) return value.some(hasAnyValue);
    if (value && typeof value === "object") return Object.values(value).some(hasAnyValue);
    return value !== null && value !== undefined && String(value).trim() !== "";
  };

  const hasTechnicalSheetMaterials = (sheet) => {
    if (!sheet) return false;
    const hasRealFabrics = Array.isArray(sheet.fabrics) && sheet.fabrics.some(hasAnyValue);
    const hasRealCups = Array.isArray(sheet.cups) && sheet.cups.some(hasAnyValue);
    const hasRealClosures = Array.isArray(sheet.closures) && sheet.closures.some(hasAnyValue);
    const hasRealMeasurements = Array.isArray(sheet.measurements) && sheet.measurements.some(hasAnyValue);
    const hasRealAccessories = Array.isArray(sheet.accessories) && sheet.accessories.some(
      (acc) => acc && Array.isArray(acc.values) && acc.values.some((v) => v && String(v).trim() !== "")
    );
    return hasRealFabrics || hasRealCups || hasRealClosures || hasRealMeasurements || hasRealAccessories;
  };

  const hasTechnicalSheetContent = (sheet) => {
    if (!sheet) return false;
    return [sheet.client, sheet.date, sheet.ref, sheet.type, sheet.description, sheet.observations, sheet.createdBy]
      .some(hasAnyValue) || hasTechnicalSheetMaterials(sheet);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (currentStep === 1) {
      if (!validateForm()) return;
      setCurrentStep(2);
      return;
    }
    
    if (!technicalSheet) {
      onShowAlert({
        type: "warning",
        title: "Ficha técnica requerida",
        message: "Debes crear la ficha técnica para poder guardar el producto"
      });
      return;
    }
    
    if (!hasTechnicalSheetContent(technicalSheet)) {
      onShowAlert({
        type: "warning",
        title: "Ficha tecnica vacia",
        message: "Completa los datos de la ficha tecnica antes de guardar el producto"
      });
      return;
    }

    if (!hasTechnicalSheetMaterials(technicalSheet)) {
      onShowAlert({
        type: "warning",
        title: "Materiales requeridos",
        message: "Agrega al menos un material en la ficha tecnica antes de guardar el producto"
      });
      return;
    }

    if (product) {
      const hasProductChanges_ = hasProductChanges();
      const hasTechnicalSheetChanges_ = hasTechnicalSheetChanges();
      
      if (!hasProductChanges_ && !hasTechnicalSheetChanges_) {
        onShowAlert({
          type: "warning",
          title: "Sin cambios",
          message: "No has realizado ningún cambio para guardar"
        });
        return;
      }
    }
    
    // ✅ SINCRONIZACIÓN: Las imágenes del producto van a la ficha técnica
    const finalTechnicalSheet = {
      ...technicalSheet,
      allImages: formData.allImages,
      image: imagePreview
    };
    
    onSubmit({ 
      ...formData, 
      technicalSheet: finalTechnicalSheet 
    });
  };

  const handleDeleteVersion = () => {
    setShowVersions(false);
    onShowAlert({
      type: "success",
      title: "Versión eliminada",
      message: "Versión eliminada correctamente"
    });
  };

  const handleVersionSelect = (versionNum) => {
    setSelectedVersion(versionNum);
    setViewMode(versionNum !== (product?.technicalSheetVersions || 1));
    setShowVersions(false);
  };

  const handleDeleteVersionClick = () => {
    const totalVersions = product?.technicalSheetVersions || 1;
    if (totalVersions <= 1) {
      onShowAlert({
        type: "warning",
        title: "No permitido",
        message: "No puedes eliminar la única versión de la ficha técnica."
      });
      return;
    }
    onShowConfirm({
      type: "confirm",
      title: "Confirmar eliminación",
      message: "¿Seguro que deseas eliminar esta versión?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: handleDeleteVersion
    });
  };

  // ✅ CLOUDINARY: Subir imágenes usando VITE_BACK_URL
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('files', files[i]);
      }

      // ✅ URL CORREGIDA: /api/upload/upload-multiple (endpoint real del backend)
      const uploadUrl = `${BACKEND_URL}/api/upload/upload-multiple`;
      console.log('🔼 Subiendo a:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        throw new Error(`Error al subir imágenes. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);
      
      const allImages = [...(formData.allImages || []), ...data.images];
      
      // ✅ Actualizar formData con las nuevas imágenes
      setFormData((prev) => ({
        ...prev,
        allImages: allImages,
        image: allImages[0]?.src || prev.image
      }));
      
      setImagePreview(allImages[0]?.src);
      
      // ✅ SINCRONIZACIÓN: Actualizar automáticamente la ficha técnica con las imágenes
      setTechnicalSheet((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          allImages: allImages,
          image: allImages[0]?.src || prev.image
        };
      });
      
      onShowAlert({
        type: "success",
        title: "Imágenes subidas",
        message: `${data.images.length} imagen(es) subida(s) correctamente a Cloudinary`
      });
    } catch (error) {
      console.error('❌ Error:', error);
      onShowAlert({
        type: "error",
        title: "Error al subir",
        message: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const imageToDelete = formData.allImages[index];
    
    // ✅ Eliminar de Cloudinary si tiene public_id
    if (imageToDelete?.public_id) {
      // ✅ URL CORREGIDA: /api/upload/upload/ (endpoint real del backend)
      const deleteUrl = `${BACKEND_URL}/api/upload/upload/${encodeURIComponent(imageToDelete.public_id)}`;
      fetch(deleteUrl, {
        method: 'DELETE'
      }).catch(err => console.error('Error eliminando de Cloudinary:', err));
    }

    const newImages = formData.allImages.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      allImages: newImages,
      image: newImages[0]?.src || null
    }));
    setImagePreview(newImages[0]?.src || null);
    
    // ✅ SINCRONIZACIÓN: Actualizar la ficha técnica
    setTechnicalSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        allImages: newImages,
        image: newImages[0]?.src || null
      };
    });
    
    if (newImages.length === 0) {
      setShowImageModal(false);
    } else if (index >= newImages.length) {
      setSelectedImageIdx(newImages.length - 1);
    }
  };

  const handleDeleteAllImages = async () => {
    // ✅ Eliminar todas de Cloudinary
    for (const img of (formData.allImages || [])) {
      if (img?.public_id) {
        // ✅ URL CORREGIDA: /api/upload/upload/ (endpoint real del backend)
        const deleteUrl = `${BACKEND_URL}/api/upload/upload/${encodeURIComponent(img.public_id)}`;
        fetch(deleteUrl, {
          method: 'DELETE'
        }).catch(err => console.error('Error eliminando:', err));
      }
    }

    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null, allImages: [] }));
    
    // ✅ SINCRONIZACIÓN: Limpiar las imágenes de la ficha técnica
    setTechnicalSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        image: null,
        allImages: []
      };
    });
    
    setShowImageModal(false);
  };

  const handleTechnicalSheetChange = (sheetData) => {
    setTechnicalSheet(prev => {
      const base = prev || {};
      const safeUpdates = Object.fromEntries(
        Object.entries(sheetData || {}).filter(([, v]) => v !== undefined)
      );
      return { ...base, ...safeUpdates };
    });
  };

  const handleCancelClick = useCallback(() => {
    onShowConfirm({
      type: "confirm",
      title: "¿Seguro que deseas cancelar?",
      message: "Los cambios no guardados se perderán.",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: onCancel
    });
  }, [onCancel, onShowConfirm]);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleCancelClick();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleCancelClick]);

  const getInputStyle = (field) => {
    const baseStyle = {
      width: "100%",
      border: "none",
      borderBottom: "1.5px solid #d1d5db",
      outline: "none",
      fontSize: "13px",
      color: "#333",
      background: "transparent",
      padding: "4px 0",
      transition: "all 0.2s"
    };

    if ((touched[field] || formData[field]) && errors[field]) {
      return {
        ...baseStyle,
        borderBottom: "2px solid #ff4fd6",
      };
    }
    return baseStyle;
  };

  const errorStyle = {
    color: "#ff4fd6",
    fontSize: "11px",
    marginTop: "4px",
    display: "block",
    fontWeight: "bold",
  };

  const cellStyle = { 
    border: "1px solid #e5e7eb", 
    padding: "8px 12px", 
    fontSize: "13px", 
    color: "#333",
    verticalAlign: "top"
  };
  
  const headerCellStyle = { 
    ...cellStyle, 
    backgroundColor: "#f9f9f9", 
    fontWeight: "600", 
    fontSize: "12px", 
    color: "#444", 
    whiteSpace: "nowrap",
    width: "100px"
  };

  const requiredStar = <span style={{ color: "#ff4fd6", marginLeft: "2px", display: "inline" }}>*</span>;
  const isLastVersion = product ? (!selectedVersion || selectedVersion === (product?.technicalSheetVersions || 1)) : true;

  const btnPrimary = {
    padding: "11px 32px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4fd6",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
    opacity: uploading ? 0.6 : 1,
  };

  const btnSecondary = {
    padding: "10px 32px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#f3f4f6",
    color: "#555",
    cursor: "pointer",
  };

  const hasInvalidFields = () => {
    return errors.reference || errors.name || errors.category || errors.price || errors.stock;
  };

  return (
    <div style={{ padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 28px 0", fontSize: "20px", fontWeight: "600", color: "#1a1a1a", textAlign: "center" }}>
        {product ? "Editar Producto" : "Crear Nuevo Producto"}
      </h2>

      {/* Indicador de pasos */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: currentStep === 1 ? "#ff4fd6" : "#e9d5f5",
            color: currentStep === 1 ? "#fff" : "#ff4fd6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700"
          }}>1</div>
          <span style={{ fontSize: "13px", fontWeight: currentStep === 1 ? "600" : "400", color: currentStep === 1 ? "#ff4fd6" : "#999" }}>Datos del producto</span>
        </div>
        <div style={{ width: "48px", height: "2px", background: currentStep === 2 ? "#ff4fd6" : "#e5e7eb", margin: "0 8px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: currentStep === 2 ? "#ff4fd6" : "#f3f4f6",
            color: currentStep === 2 ? "#fff" : "#aaa",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700"
          }}>2</div>
          <span style={{ fontSize: "13px", fontWeight: currentStep === 2 ? "600" : "400", color: currentStep === 2 ? "#ff4fd6" : "#aaa" }}>Ficha Técnica</span>
        </div>
      </div>

      {currentStep === 1 ? (
        <>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 2 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={headerCellStyle}>Referencia:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input 
                          style={getInputStyle("reference")}
                          value={formData.reference} 
                          onChange={handleChange} 
                          name="reference" 
                          placeholder="Ej. 3 4 5" 
                          onBlur={() => handleBlur("reference")}
                          autoFocus
                        />
                        {requiredStar}
                      </div>
                      {(touched.reference || formData.reference) && errors.reference && (
                        <span style={errorStyle}>{errors.reference}</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Nombre:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input 
                          style={getInputStyle("name")}
                          value={formData.name} 
                          onChange={handleChange} 
                          name="name" 
                          placeholder="Ej. Crop Top Morado" 
                          onBlur={() => handleBlur("name")}
                        />
                        {requiredStar}
                      </div>
                      {(touched.name || formData.name) && errors.name && (
                        <span style={errorStyle}>{errors.name}</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Categoria:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) auto", alignItems: "center", gap: "8px", width: "100%" }}>
                        <CategoryDropdown 
                          value={formData.category} 
                          onChange={(category) => {
                            const categoryName =
                              category.name ??
                              category.nombre ??
                              "";

                            const categoryId =
                              category.id ??
                              category._id ??
                              category.id_categoria_producto ??
                              category.id_categorias ??
                              category.id_categoria;

                            setFormData((prev) => ({
                              ...prev,
                              category: categoryName,
                              categoryId: categoryId,
                            }));

                            setTouched((prev) => ({
                              ...prev,
                              category: true,
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              category: "",
                            }));
                          }}
                          touched={touched.category}
                          error={errors.category}
                          categories={categories}
                          onCreateCategory={() => setShowCategoryForm(true)}
                        />
                        {requiredStar}
                      </div>
                      {(touched.category || formData.category) && errors.category && (
                        <span style={errorStyle}>{errors.category}</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Precio:</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input 
                          style={getInputStyle("price")}
                          type="number" 
                          value={formData.price} 
                          onChange={handleChange} 
                          name="price" 
                          placeholder="Ej. 40000" 
                          onBlur={() => handleBlur("price")}
                          min="0"
                        />
                        {requiredStar}
                      </div>
                      {(touched.price || formData.price) && errors.price && (
                        <span style={errorStyle}>{errors.price}</span>
                      )}
                    </td>
                    <td style={headerCellStyle}>Stock:</td>
                    <td style={cellStyle} colSpan={3}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input 
                          style={getInputStyle("stock")}
                          type="number" 
                          value={formData.stock} 
                          onChange={handleChange} 
                          name="stock" 
                          placeholder="Ej. 10" 
                          onBlur={() => handleBlur("stock")}
                          min="0"
                        />
                        {requiredStar}
                      </div>
                      {(touched.stock || formData.stock) && errors.stock && (
                        <span style={errorStyle}>{errors.stock}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GALERÍA CON CLOUDINARY */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px", 
                padding: "16px", 
                backgroundColor: "#fafafa", 
                minHeight: "250px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                {(() => {
                  const allImages = formData.allImages || [];
                  return (
                    <div style={{ textAlign: "center", width: "100%" }}>
                      {allImages.length > 0 ? (
                        <>
                          <div
                            onClick={() => {
                              if (allImages.length > 0) {
                                setSelectedImageIdx(0);
                                setShowImageModal(true);
                              }
                            }}
                            style={{
                              width: 150,
                              height: 190,
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 14px rgba(255,79,214,0.15)",
                              cursor: "pointer",
                              position: "relative",
                              margin: "0 auto"
                            }}
                          >
                            {allImages[0]?.src && (
                              <img 
                                src={allImages[0].src} 
                                alt={formData.name} 
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} 
                              />
                            )}
                            {allImages.length > 1 && (
                              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 6 }}>
                                +{allImages.length - 1}
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0)",
                                borderRadius: 12,
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.18)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                            />
                          </div>

                          {allImages.length > 1 && (
                            <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                              {allImages.slice(1, 4).map((img, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    setSelectedImageIdx(i + 1);
                                    setShowImageModal(true);
                                  }}
                                  style={{ 
                                    width: 34, 
                                    height: 34, 
                                    borderRadius: 6, 
                                    overflow: "hidden", 
                                    cursor: "pointer", 
                                    border: "1.5px solid #f9a8d4",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#ff4fd6";
                                    e.currentTarget.style.boxShadow = "0 0 8px rgba(255,79,214,0.2)";
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#f9a8d4";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                >
                                  {img?.src && (
                                    <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImageIdx(0);
                                setShowImageModal(true);
                              }}
                              style={{ padding: "5px 12px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "11px", color: "#555", cursor: "pointer", transition: "all 0.2s" }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = "#e5e7eb";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = "#f3f4f6";
                              }}
                            >
                              Ver imagen
                            </button>

                            <button
                              type="button"
                              onClick={handleDeleteAllImages}
                              style={{ padding: "5px 12px", backgroundColor: "transparent", border: "1px solid #ff4fd6", borderRadius: "6px", fontSize: "11px", color: "#ff4fd6", cursor: "pointer", transition: "all 0.2s" }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = "#fff0f7";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              Eliminar imagen
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                              marginBottom: "10px"
                            }}
                          >
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#aaa"
                              strokeWidth="1.5"
                            >
                              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                              <line x1="8" y1="2" x2="8" y2="22" />
                              <line x1="16" y1="2" x2="16" y2="22" />
                              <line x1="2" y1="8" x2="22" y2="8" />
                              <line x1="2" y1="16" x2="22" y2="16" />
                            </svg>
                          </div>
                          <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
                            <span style={{ color: "#E91E8C", fontWeight: "500" }}>Sube una imagen</span><br />o arrastra y suelta
                          </p>
                          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>PNG, JPG, GIF hasta 10MB</p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{ display: "none" }} 
                            id="product-image-upload" 
                          />
                          <label 
                            htmlFor="product-image-upload" 
                            style={{ 
                              marginTop: "10px", 
                              padding: "6px 16px", 
                              backgroundColor: uploading ? "#e5e7eb" : "#f3f4f6", 
                              border: "1px solid #d1d5db", 
                              borderRadius: "4px", 
                              fontSize: "12px", 
                              color: uploading ? "#999" : "#555", 
                              cursor: uploading ? "not-allowed" : "pointer",
                              pointerEvents: uploading ? "none" : "auto"
                            }}
                          >
                            {uploading ? "Subiendo a Cloudinary..." : "Seleccionar archivo(s)"}
                          </label>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#888", fontStyle: "italic", textAlign: "right" }}>
              {product ? "*Para editar un producto, debes editar la ficha técnica*" : "*Para crear un producto, debes crear la ficha técnica*"}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" style={btnSecondary} onClick={handleCancelClick}>
                Cancelar
              </button>
              <button 
                type="button" 
                style={{
                  ...btnPrimary,
                  opacity: hasInvalidFields() ? 0.7 : 1,
                  cursor: hasInvalidFields() ? "not-allowed" : "pointer"
                }}
                onClick={() => {
                  if (validateForm()) {
                    setCurrentStep(2);
                  }
                }}
              >
                {product ? "Editar Ficha Técnica" : "Crear Ficha Técnica"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {product && product?.technicalSheetVersions > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Fecha versión {new Date().toLocaleDateString('es-CO')}</div>
              <div style={{ position: 'relative' }}>
                <div onClick={() => setShowVersions(!showVersions)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#fdf0f7', border: '1px solid #ff4fd6' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#ff4fd6' }}>
                    {viewMode ? 'Viendo versión' : 'Editando versión'} {selectedVersion || product?.technicalSheetVersions || 1}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E91E8C" strokeWidth="2" style={{ transform: showVersions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {showVersions && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setShowVersions(false)} />
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '200px' }}>
                      {[...Array(product?.technicalSheetVersions || 1)].map((_, i) => {
                        const versionNum = i + 1;
                        const isCurrent = versionNum === (product?.technicalSheetVersions || 1);
                        const isSelected = versionNum === selectedVersion;
                        return (
                          <div 
                            key={versionNum} 
                            onClick={() => handleVersionSelect(versionNum)} 
                            style={{ 
                              padding: '12px 16px', 
                              cursor: 'pointer', 
                              backgroundColor: isSelected ? '#fdf0f7' : 'transparent', 
                              color: isSelected ? '#ff4fd6' : '#333', 
                              borderBottom: '1px solid #f0f0f0', 
                              fontSize: '14px', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center' 
                            }}
                          >
                            <span>Versión {versionNum} {isCurrent && '(Actual)'}</span>
                            {!isCurrent && <span style={{ fontSize: '11px', color: '#999' }}>Solo vista</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {product && viewMode && (
            <div style={{ backgroundColor: '#fdf0f7', border: '1px solid #ff4fd6', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#333' }}>
                Estás viendo una versión anterior. No se pueden realizar cambios.
                <button 
                  onClick={() => handleVersionSelect(product?.technicalSheetVersions || 1)} 
                  style={{ background: 'none', border: 'none', color: '#ff4fd6', fontWeight: '600', cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline' }}
                >
                  Volver a la versión actual
                </button>
              </span>
            </div>
          )}

          <TechnicalSheet
            key={selectedVersion || "current"}
            sheet={product && selectedVersion ? { ...product?.technicalSheet, version: selectedVersion } : technicalSheet || product?.technicalSheet}
            isEditing={product ? (isLastVersion && !viewMode) : true}
            onChange={handleTechnicalSheetChange}
            productName={formData.name}
            categoryDescription={getSelectedCategoryDescription()}
            productRef={formData.reference}
            productImage={imagePreview}
            productImages={formData.allImages}
          />

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" style={btnSecondary} onClick={() => setCurrentStep(1)}>
              ← Volver
            </button>

            {product && isLastVersion && !viewMode && (product?.technicalSheetVersions || 1) > 1 && (
              <button
                type="button"
                style={{
                  ...btnSecondary,
                  background: "#ff4fd6",
                  color: "#fff",
                  borderColor: "#ff4fd6"
                }}
                onClick={handleDeleteVersionClick}
              >
                Eliminar versión
              </button>
            )}

            {(!product || (isLastVersion && !viewMode)) && (
              <button type="button" style={btnPrimary} onClick={handleSubmit}>
                {product ? "Guardar producto" : "Crear producto"}
              </button>
            )}
          </div>
        </>
      )}

      {showCategoryForm && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1200,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          minHeight: "100vh",
          boxSizing: "border-box",
          padding: "32px 20px",
          overflowY: "auto",
          overscrollBehavior: "contain"
        }}>
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setShowCategoryForm(false)}
          />
          <div style={{
            position: "relative",
            width: "90%",
            maxWidth: "600px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            zIndex: 1201
          }}>
            <ProductCategoryForm
              onSubmit={handleCreateCategory}
              onCancel={() => setShowCategoryForm(false)}
              onShowAlert={onShowAlert}
              onShowConfirm={onShowConfirm}
            />
          </div>
        </div>
      )}

      <ImageModal
        isOpen={showImageModal}
        images={formData.allImages}
        selectedIndex={selectedImageIdx}
        onClose={() => setShowImageModal(false)}
        onDeleteImage={handleDeleteImage}
        onDeleteAllImages={handleDeleteAllImages}
        productName={formData.name}
      />
    </div>
  );
};

export default ProductForm;