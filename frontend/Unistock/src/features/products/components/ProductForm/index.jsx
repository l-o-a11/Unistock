import React, { useState, useEffect, useCallback } from "react";
import TechnicalSheet from "../TechnicalSheet";
import { Categories } from "../../types/constants";
import { productCategoryAPI } from "../../../productCategories/services/productCategoryAPI";
import ProductCategoryForm from "../../../productCategories/components/ProductCategoryForm";

const normalizeText = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const CategoryDropdown = ({ value, onChange, onBlur, touched, error, categories = Categories, onCreateCategory }) => {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (catName) => {
    onChange(catName);
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
            {categories.map((cat) => (
              <div 
                key={cat.id ?? cat._id} 
                onClick={() => handleSelect(cat.name ?? cat.nombre)} 
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
            ))}
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

const ProductForm = ({ product, onSubmit, onCancel, onShowAlert, onShowConfirm }) => {
  // Guardar valores iniciales para comparar
  const initialData = {
    reference: product?.reference || "",
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    stock: product?.stock || "",
    image: product?.image || null,
  };

  const [formData, setFormData] = useState(initialData);
  const [categories, setCategories] = useState(Categories);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [errors, setErrors] = useState({
    reference: "",
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  const [touched, setTouched] = useState({});
  const [technicalSheet, setTechnicalSheet] = useState(product?.technicalSheet || null);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const apiCategories = await productCategoryAPI.getAll();
      if (Array.isArray(apiCategories) && apiCategories.length > 0) {
        setCategories(apiCategories);
      }
    } catch {
      setCategories(Categories);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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

  // �Y"� DETECTAR SI HAY CAMBIOS EN EL PRODUCTO
  const hasProductChanges = () => {
    if (!product) return true; // En creación siempre hay cambios potenciales
    return (
      formData.reference !== product.reference ||
      formData.name !== product.name ||
      formData.category !== product.category ||
      formData.price !== product.price ||
      formData.stock !== product.stock ||
      imagePreview !== product.image
    );
  };

  // �Y"� DETECTAR SI HAY CAMBIOS EN LA FICHA T�?CNICA
  const hasTechnicalSheetChanges = () => {
    if (!product) return !!technicalSheet; // En creación, hay cambios si existe technicalSheet
    return technicalSheet !== product.technicalSheet;
  };

  // �Y"� VALIDACIONES EN TIEMPO REAL
  const validateReference = (value) => {
    if (!value.trim()) return "La referencia es obligatoria";
    if (value.trim().length < 3) return "La referencia debe tener al menos 3 caracteres";
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

  // Validar campo específico y actualizar errores
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

  // Validar todos los campos antes de enviar
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
    return [sheet.fabrics, sheet.cups, sheet.closures, sheet.accessories, sheet.measurements]
      .some((items) => Array.isArray(items) && items.some(hasAnyValue));
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
    
    // �Y"� VALIDACI�"N DE FICHA T�?CNICA
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

    // �Y"� VALIDACI�"N DE CAMBIOS (solo para edición)
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
    
    onSubmit({ ...formData, technicalSheet });
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

  // �Y"� TAMBI�?N CAMBIADO A "confirm" PARA CONSISTENCIA
  const handleDeleteVersionClick = () => {
    onShowConfirm({
      type: "confirm", // �Y'^ CAMBIADO DE "cancel" A "confirm"
      title: "Confirmar eliminación",
      message: "¿Seguro que deseas eliminar esta versión?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: handleDeleteVersion
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTechnicalSheetChange = (sheetData) => {
    setTechnicalSheet(sheetData);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // �Y"� AHORA USA "confirm" PARA EL DISE�'O ORIGINAL (AZUL CON ?)
  const handleCancelClick = useCallback(() => {
    onShowConfirm({
      type: "confirm", // �Y'^ CAMBIADO DE "cancel" A "confirm"
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

  // �Y"� ESTILO PARA INPUTS CON ERROR - SOLO BORDE ROSA, SIN FONDO
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

  // �Y"� ESTILO PARA MENSAJES DE ERROR EN NEGRITA
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
  };

  const btnSecondary = {
    padding: "10px 32px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#f3f4f6",
    color: "#555",
    cursor: "pointer",
  };

  // Verificar si hay campos inválidos
  const hasInvalidFields = () => {
    return errors.reference || errors.name || errors.category || errors.price || errors.stock;
  };

  return (
    <div style={{ padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "600", color: "#1a1a1a", textAlign: "center" }}>
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
                  {/* Referencia */}
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
                        <span style={errorStyle}>
                          {errors.reference}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Nombre */}
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
                        <span style={errorStyle}>
                          {errors.name}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Categoría */}
                  <tr>
                    <td style={headerCellStyle}>Categoria:</td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) auto", alignItems: "center", gap: "8px", width: "100%" }}>
                        <CategoryDropdown 
                          value={formData.category} 
                          onChange={(val) => {
                            setFormData((prev) => ({ ...prev, category: val }));
                            setTouched((prev) => ({ ...prev, category: true }));
                            setErrors((prev) => ({ ...prev, category: validateCategory(val) }));
                          }}
                          onBlur={() => handleBlur("category")}
                          touched={touched.category}
                          error={errors.category}
                          categories={categories}
                          onCreateCategory={() => setShowCategoryForm(true)}
                        />
                        {requiredStar}
                      </div>
                      {(touched.category || formData.category) && errors.category && (
                        <span style={errorStyle}>
                          {errors.category}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Precio y Stock */}
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
                        <span style={errorStyle}>
                          {errors.price}
                        </span>
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
                        <span style={errorStyle}>
                          {errors.stock}
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ flex: 1 }}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                  border: isDragging ? "2px dashed #ff4fd6" : "1px solid #e5e7eb", 
                  borderRadius: "8px", 
                  padding: "16px", 
                  backgroundColor: isDragging ? "#fdf0f7" : "#fafafa", 
                  minHeight: "250px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}>
                {imagePreview ? (
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "4px" }} 
                    />
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setImagePreview(null); 
                        setFormData((prev) => ({ ...prev, image: null })); 
                      }} 
                      style={{ marginTop: "10px", padding: "4px 12px", backgroundColor: "#ff4fd6", border: "1px solid #ff4fd6", borderRadius: "4px", fontSize: "12px", color: "#fff", cursor: "pointer" }}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#ff4fd6" : "#aaa"} strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                      <line x1="8" y1="2" x2="8" y2="22" />
                      <line x1="16" y1="2" x2="16" y2="22" />
                      <line x1="2" y1="8" x2="22" y2="8" />
                      <line x1="2" y1="16" x2="22" y2="16" />
                    </svg>
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
                      <span style={{ color: "#E91E8C", fontWeight: "500" }}>Sube una imagen</span><br />o arrastra y suelta
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>PNG, JPG, GIF hasta 10MB</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: "none" }} 
                      id="product-image-upload" 
                    />
                    <label 
                      htmlFor="product-image-upload" 
                      style={{ marginTop: "10px", padding: "6px 16px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", color: "#555", cursor: "pointer" }}
                    >
                      Seleccionar archivo
                    </label>
                  </>
                )}
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
                  if (!hasInvalidFields()) {
                    setCurrentStep(2);
                  } else {
                    setTouched({
                      reference: true,
                      name: true,
                      category: true,
                      price: true,
                      stock: true
                    });
                    onShowAlert({
                      type: "warning",
                      title: "Campos incompletos",
                      message: "Completa todos los campos requeridos antes de continuar"
                    });
                  }
                }}
                // disabled={hasInvalidFields()}  // �Y'^ ELIMINADO PARA QUE EL ONCLICK FUNCIONE
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
            sheet={product && selectedVersion ? { ...product?.technicalSheet, version: selectedVersion } : product?.technicalSheet}
            isEditing={product ? (isLastVersion && !viewMode) : true}
            onChange={handleTechnicalSheetChange}
          />

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" style={btnSecondary} onClick={() => setCurrentStep(1)}>
              ← Volver
            </button>

            {product && isLastVersion && !viewMode && (
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
    </div>
  );
};

export default ProductForm;
