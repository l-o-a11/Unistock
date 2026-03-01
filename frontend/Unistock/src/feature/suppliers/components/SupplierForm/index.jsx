import React, { useState, useEffect, useRef } from "react";
import Alert from "../Alert";

/**
 * SupplierForm - Modal form component for creating and editing suppliers
 * 
 * This component provides a comprehensive form for managing supplier information including:
 * - Company details (name, NIT, address, website)
 * - Contact information (contact person, phone, email)
 * 
 * Features:
 * - Real-time field validation with instant error feedback
 * - Confirmation alerts for save and cancel operations
 * - Keyboard support (ESC to close, onFocus/onBlur for visual feedback)
 * - Click-outside detection to close modal
 * - Customizable styling with pink theme (#E91E8C)
 * 
 * @param {Object} supplier - Supplier object for editing (optional). If not provided, form is in create mode
 * @param {Function} onSubmit - Callback when form is submitted with validated data
 * @param {Function} onCancel - Callback when form is cancelled
 */
const SupplierForm = ({ supplier, onSubmit, onCancel }) => {

  const [formData, setFormData] = useState({
    nombreEmpresa: supplier?.nombreEmpresa || "",
    nit: supplier?.nit || "",
    direccion: supplier?.direccion || "",
    correoEmpresa: supplier?.correoEmpresa || "",
    sitioWeb: supplier?.sitioWeb || "",
    nombreContacto: supplier?.nombreContacto || "",
    telefono: supplier?.telefono || "",
    correoContacto: supplier?.correoContacto || "",
  });

  const [errors, setErrors] = useState({});
  const [alertType, setAlertType] = useState(null);
  const modalRef = useRef(null);

  /**
   * Close modal when Escape key is pressed
   */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleCancelClick();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /**
   * Close modal when clicking outside the form
   */
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCancelClick();
    }
  };

  /**
   * Validate a single field based on its name and value
   * Validation rules:
   * - nombreEmpresa: Required, must be non-empty
   * - nit: Required, numeric only, 8-12 digits
   * - direccion: Required, non-empty string
   * - correoEmpresa: Required, valid email format
   * - telefono: Required, numeric only, exactly 10 digits
   * - correoContacto: Optional, but must be valid email if provided
   * - sitioWeb, nombreContacto: Optional fields
   */
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nombreEmpresa":
        if (!value.trim()) error = "El nombre es obligatorio";
        break;

      case "nit":
        if (!value.trim()) error = "El NIT es obligatorio";
        else if (!/^[0-9]+$/.test(value)) error = "Solo números permitidos";
        else if (value.length < 8 || value.length > 12)
          error = "Debe tener entre 8 y 12 dígitos";
        break;

      case "direccion":
        if (!value.trim()) error = "La dirección es obligatoria";
        break;

      case "correoEmpresa":
        if (!value.trim()) error = "El correo es obligatorio";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Correo inválido";
        break;

      case "telefono":
        if (!value.trim()) error = "El teléfono es obligatorio";
        else if (!/^[0-9]+$/.test(value)) error = "Solo números permitidos";
        else if (value.length !== 10) error = "Debe tener 10 dígitos";
        break;

      case "correoContacto":
        if (value && !/\S+@\S+\.\S+/.test(value))
          error = "Correo inválido";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /**
   * Handle input change and validate field in real-time
   * Restricts numeric input for phone and NIT fields to numbers only
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono" || name === "nit") {
      if (!/^[0-9]*$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  /**
   * Validate all form fields and return whether form is valid
   * Returns true if all required fields pass validation
   */
  const validateAll = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      validateField(key, value);
      if (errors[key]) newErrors[key] = errors[key];
    });

    return Object.values(newErrors).every((e) => e === "");
  };

  /**
   * Handle form submission
   * Validates all fields and shows confirmation alert before saving
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    validateAll();

    const hasErrors = Object.values(errors).some((e) => e !== "");
    if (hasErrors) return;

    setAlertType("confirmSave");
  };

  /**
   * Confirm and save supplier data
   */
  const confirmSave = () => {
    setAlertType(null);
    onSubmit(formData);
  };

  /**
   * Handle cancel button click
   * Shows confirmation alert before closing
   */
  const handleCancelClick = () => {
    setAlertType("confirmCancel");
  };

  /**
   * Confirm and close form
   */
  const confirmCancel = () => {
    setAlertType(null);
    onCancel();
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "6px",
    display: "block",
  };

  const requiredStar = <span style={{ color: "#E91E8C" }}>*</span>;

  return (
    <>
      {/*  ALERTAS */}
      {alertType === "confirmSave" && (
        <Alert
          type="confirm"
          title="Guardar proveedor"
          message="¿Deseas guardar este proveedor?"
          onConfirm={confirmSave}
          onCancel={() => setAlertType(null)}
        />
      )}

      {alertType === "confirmCancel" && (
        <Alert
          type="confirm"
          title="Cancelar"
          message="¿Seguro que deseas cancelar? Se perderán los cambios."
          onConfirm={confirmCancel}
          onCancel={() => setAlertType(null)}
        />
      )}

      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
        }}
      >
        <div
          ref={modalRef}
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "900px",
            padding: "36px 40px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          <button
            onClick={handleCancelClick}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#f3f4f6",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          <h2 style={{ textAlign: "center", marginBottom: "28px" }}>
            {supplier ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
          </h2>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>

              {/* IZQUIERDA */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", borderRight: "1px solid #e5e7eb", paddingRight: "30px" }}>

                <div>
                  <label style={labelStyle}>Nombre Empresa {requiredStar}</label>
                  <input 
                    name="nombreEmpresa" 
                    value={formData.nombreEmpresa} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.nombreEmpresa && <div style={errorStyle}>{errors.nombreEmpresa}</div>}
                </div>

                <div>
                  <label style={labelStyle}>NIT {requiredStar}</label>
                  <input 
                    name="nit" 
                    value={formData.nit} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.nit && <div style={errorStyle}>{errors.nit}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Dirección {requiredStar}</label>
                  <input 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.direccion && <div style={errorStyle}>{errors.direccion}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Correo Empresa {requiredStar}</label>
                  <input 
                    name="correoEmpresa" 
                    value={formData.correoEmpresa} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.correoEmpresa && <div style={errorStyle}>{errors.correoEmpresa}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Sitio Web</label>
                  <input 
                    name="sitioWeb" 
                    value={formData.sitioWeb} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>
              </div>

              {/* DERECHA */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Nombre Contacto</label>
                  <input 
                    name="nombreContacto" 
                    value={formData.nombreContacto} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Teléfono {requiredStar}</label>
                  <input 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.telefono && <div style={errorStyle}>{errors.telefono}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Correo Contacto</label>
                  <input 
                    name="correoContacto" 
                    value={formData.correoContacto} 
                    onChange={handleChange} 
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.correoContacto && <div style={errorStyle}>{errors.correoContacto}</div>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
              <button type="button" onClick={onCancel} style={{ padding: "10px 22px", borderRadius: "8px" }}>
                Cancelar
              </button>

              <button type="submit" style={{ padding: "10px 28px", borderRadius: "8px", backgroundColor: "#E91E8C", color: "#fff" }}>
                Guardar Proveedor
              </button>
            </div>
          </form>
        </div>
      </div>


    </>
  );
};

export default SupplierForm;