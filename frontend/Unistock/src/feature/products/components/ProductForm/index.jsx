import React, { useState, useEffect, useRef } from "react";
import TechnicalSheet from "../TechnicalSheet";
import { Categories } from "../../types/constants";

// ── Custom category dropdown ──────────────────────────────────────────────────
const CategoryDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1.5px solid #d1d5db",
          cursor: "pointer",
          fontSize: "14px",
          color: value ? "#333" : "#aaa",
          userSelect: "none",
          backgroundColor: open ? "#fdf0f7" : "transparent",
          borderRadius: open ? "6px 6px 0 0" : "0",
          transition: "background-color 0.15s",
        }}
      >
        <span>{value || "Seleccionar categoría"}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="#888" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown list */}
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 20,
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0 0 8px 8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                fontSize: "14px",
                backgroundColor: "#ff4fd6",
                color: "#fff",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={() => { onChange(""); setOpen(false); }}
            >
              Seleccionar categoría
            </div>

            {Categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => { onChange(cat.name); setOpen(false); }}
                style={{
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#333",
                  cursor: "pointer",
                  backgroundColor: value === cat.name ? "#fdf0f7" : "#fff",
                  borderTop: "1px solid #f5f5f5",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf0f7")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === cat.name ? "#fdf0f7" : "#fff")}
              >
                {cat.icon} {cat.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    reference: product?.reference || "",
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    stock: product?.stock || "",
    image: product?.image || null,
  });

  const [technicalSheet, setTechnicalSheet] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  
  // Estados SOLO para edición
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  
  const modalRef = useRef(null);

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

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!technicalSheet && currentStep === 2) {
      alert("Debes crear la ficha técnica para poder crear el producto");
      return;
    }
    if (currentStep === 2) {
      onSubmit({ ...formData, technicalSheet });
    }
  };

  const handleDeleteVersion = () => {
    if (window.confirm('¿Estás seguro de eliminar esta versión?')) {
      console.log('Eliminar última versión');
      setShowVersions(false);
    }
  };

  const handleVersionSelect = (versionNum) => {
    setSelectedVersion(versionNum);
    setViewMode(versionNum !== (product?.technicalSheetVersions || 1));
    setShowVersions(false);
  };

  // ESTILOS
  const cellStyle = {
    border: "1px solid #e5e7eb",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#333",
  };

  const headerCellStyle = {
    ...cellStyle,
    backgroundColor: "#f9f9f9",
    fontWeight: "600",
    fontSize: "12px",
    color: "#444",
  };

  const inputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#333",
    background: "transparent",
    padding: "4px 0",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "4px",
  };

  const requiredStar = (
    <span style={{ color: "#ff4fd6", marginLeft: "2px" }}>*</span>
  );

  // Determinar si la versión actual es la última (solo para edición)
  const isLastVersion = product ? (!selectedVersion || selectedVersion === (product?.technicalSheetVersions || 1)) : true;

  return (
    <div ref={modalRef} style={{ padding: "36px 40px" }}>
      <h2
        style={{
          margin: "0 0 28px 0",
          fontSize: "20px",
          fontWeight: "600",
          color: "#1a1a1a",
          textAlign: "center",
        }}
      >
        {product ? "Editar Producto" : "Crear Nuevo Producto"}
      </h2>

      {currentStep === 1 ? (
        <>
          {/* Paso 1: Datos del producto */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 2 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={headerCellStyle}>Referencia:</td>
                    <td style={cellStyle} colSpan={5}>
                      <input 
                        style={inputStyle} 
                        value={formData.reference} 
                        onChange={handleInputChange} 
                        name="reference"
                        placeholder="Ej. 3 4 5"
                      />
                      {requiredStar}
                    </td>
                  </tr>
                  <tr>
                    <td style={headerCellStyle}>Nombre:</td>
                    <td style={cellStyle} colSpan={5}>
                      <input 
                        style={inputStyle} 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        name="name"
                        placeholder="Ej. Crop Top Morado"
                      />
                      {requiredStar}
                    </td>
                  </tr>
                  <tr>
                    <td style={headerCellStyle}>Categoría:</td>
                    <td style={cellStyle} colSpan={5}>
                      <CategoryDropdown
                        value={formData.category}
                        onChange={(val) =>
                          handleInputChange({ target: { name: "category", value: val } })
                        }
                      />
                      {requiredStar}
                    </td>
                  </tr>
                  <tr>
                    <td style={headerCellStyle}>Precio:</td>
                    <td style={cellStyle}>
                      <input 
                        style={inputStyle} 
                        type="number"
                        value={formData.price} 
                        onChange={handleInputChange} 
                        name="price"
                        placeholder="Ej. 40000"
                      />
                      {requiredStar}
                    </td>
                    <td style={headerCellStyle}>Stock:</td>
                    <td style={cellStyle} colSpan={3}>
                      <input 
                        style={inputStyle} 
                        type="number"
                        value={formData.stock} 
                        onChange={handleInputChange} 
                        name="stock"
                        placeholder="Ej. 10"
                      />
                      {requiredStar}
                    </td>
                  </tr>
                </tbody>
              </table>
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
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image: null }));
                      }}
                      style={{
                        marginTop: "10px",
                        padding: "4px 12px",
                        backgroundColor: "#ff4fd6",
                        border: "1px solid #ff4fd6",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <>
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
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
                      <span style={{ color: "#E91E8C", fontWeight: "500" }}>
                        Sube una imagen
                      </span>
                      <br />
                      o arrastra y suelta
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
                      PNG, JPG, GIF hasta 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      style={{
                        marginTop: "10px",
                        padding: "6px 16px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#555",
                        cursor: "pointer"
                      }}
                    >
                      Seleccionar archivo
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* MENSAJE Y BOTONES */}
          <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#888", fontStyle: "italic", textAlign: "right" }}>
              {product
                ? "*Para editar un producto, debes editar la ficha técnica*"
                : "*Para crear un producto, debes crear la ficha técnica*"}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "10px 32px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#555",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  padding: "11px 32px",
                  backgroundColor: "#ff4fd6",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {product ? "Editar Ficha Técnica" : "Crear Ficha Técnica"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* SELECTOR DE VERSIONES - SOLO EN EDICIÓN */}
          {product && product?.technicalSheetVersions > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Fecha versión {new Date().toLocaleDateString('es-CO')}
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowVersions(!showVersions)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#fdf0f7',
                    border: '1px solid #ff4fd6'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#ff4fd6' }}>
                    {viewMode ? 'Viendo versión' : 'Editando versión'} {selectedVersion || product?.technicalSheetVersions || 1}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#E91E8C"
                    strokeWidth="2"
                    style={{
                      transform: showVersions ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {showVersions && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 5
                      }}
                      onClick={() => setShowVersions(false)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        minWidth: '200px'
                      }}
                    >
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

          {/* Mensaje de modo vista - SOLO EN EDICIÓN */}
          {product && viewMode && (
            <div style={{
              backgroundColor: '#fdf0f7',
              border: '1px solid #ff4fd6',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#333' }}>
                Estás viendo una versión anterior. No se pueden realizar cambios.
                <button
                  onClick={() => handleVersionSelect(product?.technicalSheetVersions || 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff4fd6',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    textDecoration: 'underline'
                  }}
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
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                padding: "10px 32px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#555",
                cursor: "pointer",
              }}
            >
              ← Volver
            </button>

            {/* Botón Eliminar - SOLO EN EDICIÓN Y SOLO PARA ÚLTIMA VERSIÓN */}
            {product && isLastVersion && !viewMode && (
              <button
                type="button"
                onClick={handleDeleteVersion}
                style={{
                  padding: "11px 32px",
                  backgroundColor: "#ff4fd6",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Eliminar versión
              </button>
            )}

            {/* Botón Guardar - SIEMPRE EN CREACIÓN, O EN EDICIÓN SOLO ÚLTIMA VERSIÓN */}
            {(!product || (isLastVersion && !viewMode)) && (
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  padding: "11px 32px",
                  backgroundColor: "#ff4fd6",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
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