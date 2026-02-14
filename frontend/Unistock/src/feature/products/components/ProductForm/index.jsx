import React, { useState, useEffect, useRef } from "react"; // ✅ Agregamos useRef y useEffect
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
          {/* Click-outside overlay */}
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
            {/* "Seleccionar categoría" header — pink background */}
            <div
              style={{
                padding: "10px 14px",
                fontSize: "14px",
                backgroundColor: "#E91E8C",
                color: "#fff",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={() => { onChange(""); setOpen(false); }}
            >
              Seleccionar categoría
            </div>

            {/* Category options */}
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
  
  // ✅ Referencia para el modal
  const modalRef = useRef(null);

  // ✅ Efecto para cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // ✅ Manejar clic fuera del modal
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

  // ── Shared input style ──────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "none",
    borderBottom: "1.5px solid #d1d5db",
    borderRadius: 0,
    fontSize: "14px",
    color: "#333",
    outline: "none",
    background: "transparent",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "4px",
  };

  const requiredStar = (
    <span style={{ color: "#E91E8C", marginLeft: "2px" }}>*</span>
  );

  return (
    /* Full-screen overlay con detección de clic fuera */
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
      onClick={handleOverlayClick} // ✅ Clic en overlay cierra el modal
    >
      {currentStep === 1 ? (
        /* ── STEP 1: Modal card ───────────────────────────────────────────── */
        <div
          ref={modalRef} // ✅ Referencia para no cerrar al hacer clic dentro
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            width: "100%",
            maxWidth: "860px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "36px 40px",
            boxSizing: "border-box",
            position: "relative", // ✅ Para posicionar la X
          }}
        >
          {/* ✅ Botón X para cerrar */}
          <button
            onClick={onCancel}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#f3f4f6",
              color: "#666",
              fontSize: "18px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            aria-label="Cerrar"
          >
            ✕
          </button>

          {/* Title */}
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

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            {/* LEFT: form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Referencia */}
              <div>
                <label style={labelStyle}>Referencia {requiredStar}</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Ej. 3 4 5"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre {requiredStar}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Crop Top Morado"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Categoría — custom dropdown */}
              <div>
                <label style={labelStyle}>Categoría {requiredStar}</label>
                <CategoryDropdown
                  value={formData.category}
                  onChange={(val) =>
                    handleInputChange({ target: { name: "category", value: val } })
                  }
                />
              </div>

              {/* Valores label */}
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#333",
                    margin: "0 0 12px 0",
                  }}
                >
                  Valores
                </p>

                {/* Precio + Stock side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Precio {requiredStar}</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Ej. $40,000"
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock {requiredStar}</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="Ej. 10"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: image upload */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ ...labelStyle, marginBottom: "10px" }}>
                Imagen del producto
              </label>

              <label
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #e0e0e0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  padding: "24px",
                  backgroundColor: "#fafafa",
                  minHeight: "180px",
                  boxSizing: "border-box",
                  gap: "10px",
                }}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
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
                        background: "none",
                        border: "none",
                        color: "#E91E8C",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar imagen
                    </button>
                  </>
                ) : (
                  <>
                    {/* Upload arrow icon */}
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#bbb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p style={{ margin: 0, fontSize: "13px", color: "#555", textAlign: "center" }}>
                      <span style={{ color: "#E91E8C", fontWeight: "500" }}>Sube un archivo</span>
                      {" "}o arrastra y suelta PNG, JPG, GIF
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>has 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Footer note + CTA button */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#888",
                fontStyle: "italic",
              }}
            >
              {product
                ? "*Para editar un producto, debes editar la ficha técnica*"
                : "*Para crear un producto, debes crear la ficha técnica*"}
            </p>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                padding: "11px 32px",
                backgroundColor: "#E91E8C",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C9187A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E91E8C")}
            >
              {product ? "Editar Ficha Técnica" : "Crear Ficha Técnica"}
            </button>
          </div>
        </div>
      ) : (
        /* ── STEP 2: Technical Sheet ──────────────────────────────────────── */
        <div
          ref={modalRef} // ✅ Referencia para no cerrar al hacer clic dentro
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            width: "100%",
            maxWidth: "960px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "36px 40px",
            boxSizing: "border-box",
            position: "relative", // ✅ Para posicionar la X
          }}
        >
          {/* ✅ Botón X para cerrar */}
          <button
            onClick={onCancel}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#f3f4f6",
              color: "#666",
              fontSize: "18px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            aria-label="Cerrar"
          >
            ✕
          </button>

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

          {/* Bottom actions */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#555",
                cursor: "pointer",
              }}
            >
              ← Volver
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                padding: "11px 32px",
                backgroundColor: "#E91E8C",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C9187A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E91E8C")}
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