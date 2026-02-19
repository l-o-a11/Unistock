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
  
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCancel();
    }
  };

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
    if (!technicalSheet) {
      alert("Debes crear la ficha técnica para poder crear el producto");
      return;
    }
    onSubmit({ ...formData, technicalSheet });
  };

  // ESTILOS IGUALES A LA FICHA TÉCNICA
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
      }}
      onClick={handleOverlayClick}
    >
      {currentStep === 1 ? (
        <div
          ref={modalRef}
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            width: "100%",
            maxWidth: "1000px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "36px 40px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
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

          {/* CONTENEDOR DE DOS COLUMNAS - CON MÁRGENES CORREGIDAS */}
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Columna izquierda: Campos del formulario en formato tabla */}
            <div style={{ flex: 2 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {/* Referencia */}
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

                  {/* Nombre */}
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

                  {/* Categoría */}
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

                  {/* Valores - Precio y Stock en la misma fila */}
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

            {/* Columna derecha: RECUADRO PARA IMAGEN - MISMO ESTILO QUE FICHA TÉCNICA */}
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

          {/* Mensaje y botones - SIN CAMBIOS */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "14px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#888",
                fontStyle: "italic",
                textAlign: "right",
              }}
            >
              {product
                ? "*Para editar un producto, debes editar la ficha técnica*"
                : "*Para crear un producto, debes crear la ficha técnica*"}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
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
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#d1d5db";
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
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C9187A")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff4fd6")}
              >
                {product ? "Editar Ficha Técnica" : "Crear Ficha Técnica"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={modalRef}
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            width: "100%",
            maxWidth: "1200px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "36px 40px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
              textAlign: "center",
            }}
          >
            {product ? "Editar Producto" : "Crear Nuevo Producto"}
          </h2>

          <TechnicalSheet
            sheet={product?.technicalSheet}
            isEditing={true}
            onChange={handleTechnicalSheetChange}
            onSave={() => handleSubmit()}
          />

          {/* Botones */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
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
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              Cerrar
            </button>

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
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C9187A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff4fd6")}
            >
              Guardar producto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;