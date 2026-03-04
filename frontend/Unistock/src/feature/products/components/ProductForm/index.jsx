import React, { useState, useEffect } from "react";
import TechnicalSheet from "../TechnicalSheet";
import { Categories } from "../../types/constants";

const CategoryDropdown = ({ value, onChange, onBlur, touched, error }) => {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (catName) => {
    onChange(catName);
    setOpen(false);
    if (onBlur) onBlur();
  };

  return (
    <div style={{ position: "relative" }}>
      <div 
        onClick={() => setOpen((o) => !o)} 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
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
        <span>{value || "Seleccionar categoría"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "0 0 8px 8px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", overflow: "hidden" }}>
            <div 
              style={{ padding: "10px 14px", fontSize: "14px", backgroundColor: "#ff4fd6", color: "#fff", fontWeight: "500", cursor: "pointer" }} 
              onClick={() => handleSelect("")}
            >
              Seleccionar categoría
            </div>
            {Categories.map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => handleSelect(cat.name)} 
                style={{ 
                  padding: "10px 14px", 
                  fontSize: "14px", 
                  color: "#333", 
                  cursor: "pointer", 
                  backgroundColor: value === cat.name ? "#fdf0f7" : "#fff", 
                  borderTop: "1px solid #f5f5f5", 
                  transition: "background-color 0.1s" 
                }}
              >
                {cat.icon} {cat.name}
              </div>
            ))}
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
  const [formData, setFormData] = useState({
    reference: product?.reference || "",
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    stock: product?.stock || "",
    image: product?.image || null,
  });

  const [touched, setTouched] = useState({});
  const [technicalSheet, setTechnicalSheet] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // Detectar si hay cambios sin guardar en paso 1
  const hasChangesInStep1 = () => {
    if (!product) {
      // Creación: hay cambios si algún campo no está vacío
      return formData.reference.trim() !== "" || 
             formData.name.trim() !== "" || 
             formData.category !== "" || 
             formData.price !== "" || 
             formData.stock !== "" || 
             imagePreview !== null;
    } else {
      // Edición: comparar con valores originales del producto
      return formData.reference !== product.reference ||
             formData.name !== product.name ||
             formData.category !== product.category ||
             formData.price !== product.price ||
             formData.stock !== product.stock ||
             imagePreview !== product.image;
    }
  };

  // Validar un campo específico
  const isFieldValid = (field) => {
    if (field === 'reference') return formData.reference.trim() !== '';
    if (field === 'name') return formData.name.trim() !== '';
    if (field === 'category') return formData.category !== '';
    if (field === 'price') return formData.price.toString().trim() !== '';
    if (field === 'stock') return formData.stock.toString().trim() !== '';
    return true;
  };

  // Obtener mensaje de error para un campo
  const getFieldError = (field) => {
    if (!touched[field]) return null;
    if (field === 'reference' && !formData.reference.trim()) return "La referencia es obligatoria";
    if (field === 'name' && !formData.name.trim()) return "El nombre es obligatorio";
    if (field === 'category' && !formData.category) return "Selecciona una categoría";
    if (field === 'price' && !formData.price) return "El precio es obligatorio";
    if (field === 'stock' && !formData.stock) return "El stock es obligatorio";
    return null;
  };

  // Marcar campo como tocado
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Estilo para inputs con error
  const getInputStyle = (field) => {
    if (touched[field] && !isFieldValid(field)) {
      return {
        ...inputStyle,
        borderBottom: "2px solid #ff4fd6",
        backgroundColor: "#fff0f7"
      };
    }
    return inputStyle;
  };

  // Renderizar input con label y error
  const renderField = (field, label, placeholder, type = "text", colSpan = 5) => {
    const error = getFieldError(field);
    return (
      <tr>
        <td style={headerCellStyle}>{label}:</td>
        <td style={cellStyle} colSpan={colSpan}>
          <div>
            <input 
              style={getInputStyle(field)}
              type={type}
              value={formData[field]} 
              onChange={handleInputChange} 
              name={field} 
              placeholder={placeholder}
              onBlur={() => handleBlur(field)}
              min={type === "number" ? "0" : undefined}
            />
            {requiredStar}
            {error && (
              <span style={{ color: "#ff4fd6", fontSize: "11px", marginLeft: "8px", display: "block", marginTop: "4px" }}>
                ⚠️ {error}
              </span>
            )}
          </div>
        </td>
      </tr>
    );
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleCancelClick();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const validateStep1 = () => {
    // Marcar todos los campos como tocados
    setTouched({
      reference: true,
      name: true,
      category: true,
      price: true,
      stock: true
    });

    const errors = [];
    if (!formData.reference.trim()) errors.push("La referencia es obligatoria");
    if (!formData.name.trim()) errors.push("El nombre es obligatorio");
    if (!formData.category) errors.push("La categoría es obligatoria");
    if (!formData.price) errors.push("El precio es obligatorio");
    if (!formData.stock) errors.push("El stock es obligatorio");
    
    if (errors.length > 0) {
      onShowAlert({
        type: "warning",
        title: "Campos requeridos",
        message: errors.join(". ")
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (isValid) {
        setCurrentStep(2);
      }
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

  // 🔥 FUNCIÓN CORREGIDA: SIEMPRE muestra la alerta de confirmación
  const handleCancelClick = () => {
    console.log("🖱️ Clic en Cancelar - Mostrando alerta siempre");
    
    // SIEMPRE mostrar confirmación, sin importar si hay cambios o no
    onShowConfirm({
      title: "¿Seguro que deseas cancelar?",
      message: "Si cancelas, perderás todos los cambios no guardados.",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: onCancel
    });
  };

  const handleDeleteVersionClick = () => {
    onShowConfirm({
      title: "Confirmar eliminación",
      message: "¿Seguro que deseas eliminar esta versión?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: handleDeleteVersion
    });
  };

  const cellStyle = { border: "1px solid #e5e7eb", padding: "8px 12px", fontSize: "13px", color: "#333" };
  const headerCellStyle = { ...cellStyle, backgroundColor: "#f9f9f9", fontWeight: "600", fontSize: "12px", color: "#444", whiteSpace: "nowrap" };
  const inputStyle = { width: "100%", border: "none", outline: "none", fontSize: "13px", color: "#333", background: "transparent", padding: "4px 0", transition: "all 0.2s" };
  const requiredStar = <span style={{ color: "#ff4fd6", marginLeft: "2px" }}>*</span>;

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
    return !isFieldValid('reference') || !isFieldValid('name') || !isFieldValid('category') || !isFieldValid('price') || !isFieldValid('stock');
  };

  return (
    <div style={{ padding: "36px 40px" }}>
      <h2 style={{ margin: "0 0 28px 0", fontSize: "20px", fontWeight: "600", color: "#1a1a1a", textAlign: "center" }}>
        {product ? "Editar Producto" : "Crear Nuevo Producto"}
      </h2>

      {currentStep === 1 ? (
        <>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 2 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {renderField("reference", "Referencia", "Ej. 3 4 5")}
                  {renderField("name", "Nombre", "Ej. Crop Top Morado")}
                  
                  {/* Campo Categoría (personalizado) */}
                  <tr>
                    <td style={headerCellStyle}>Categoría:</td>
                    <td style={cellStyle} colSpan={5}>
                      <CategoryDropdown 
                        value={formData.category} 
                        onChange={(val) => {
                          handleInputChange({ target: { name: "category", value: val } });
                          handleBlur("category");
                        }}
                        onBlur={() => handleBlur("category")}
                        touched={touched.category}
                        error={getFieldError("category")}
                      />
                      {requiredStar}
                    </td>
                  </tr>

                  <tr>
                    <td style={headerCellStyle}>Precio:</td>
                    <td style={cellStyle}>
                      <div>
                        <input 
                          style={getInputStyle("price")}
                          type="number" 
                          value={formData.price} 
                          onChange={handleInputChange} 
                          name="price" 
                          placeholder="Ej. 40000" 
                          onBlur={() => handleBlur("price")}
                          min="0"
                        />
                        {requiredStar}
                        {getFieldError("price") && (
                          <span style={{ color: "#ff4fd6", fontSize: "11px", marginLeft: "8px", display: "block", marginTop: "4px" }}>
                            ⚠️ {getFieldError("price")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={headerCellStyle}>Stock:</td>
                    <td style={cellStyle} colSpan={3}>
                      <div>
                        <input 
                          style={getInputStyle("stock")}
                          type="number" 
                          value={formData.stock} 
                          onChange={handleInputChange} 
                          name="stock" 
                          placeholder="Ej. 10" 
                          onBlur={() => handleBlur("stock")}
                          min="0"
                        />
                        {requiredStar}
                        {getFieldError("stock") && (
                          <span style={{ color: "#ff4fd6", fontSize: "11px", marginLeft: "8px", display: "block", marginTop: "4px" }}>
                            ⚠️ {getFieldError("stock")}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {/* Mensaje resumen si hay campos pendientes */}
              {hasInvalidFields() && (
                <div style={{ 
                  marginTop: "16px", 
                  padding: "8px 12px", 
                  backgroundColor: "#fff0f7", 
                  border: "1px solid #ff4fd6",
                  borderRadius: "6px",
                  color: "#ff4fd6", 
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>⚠️</span>
                  <span>Completa todos los campos requeridos para continuar a la ficha técnica</span>
                </div>
              )}
            </div>

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
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
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
                    // Marcar todos los campos como tocados para mostrar errores
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
                disabled={hasInvalidFields()}
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
    </div>
  );
};

export default ProductForm;