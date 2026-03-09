import React, { useState, useEffect, useRef } from "react";
import Alert from "../Alert";

const Third_partieForm = ({ Third_partie, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo:    Third_partie?.codigo    || "",
    nombre:    Third_partie?.nombre    || "",
    nit:       Third_partie?.nit       || "",
    direccion: Third_partie?.direccion || "",
    telefono:  Third_partie?.telefono  || "",
    contacto:  Third_partie?.contacto  || "",
    correo:    Third_partie?.correo    || "",
  });

  const [errors,       setErrors]       = useState({});
  // ✅ Fix: pendingClose para cerrar el modal DESPUÉS de que el Alert de éxito se cierre
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({
    open:      false,
    type:      "success",
    title:     "",
    message:   "",
    onConfirm: null,
  });

  const modalRef = useRef(null);

  // ✅ Fix: cuando la alerta de éxito se cierra y pendingClose está activo → cerrar modal
  useEffect(() => {
    if (pendingClose && !alertConfig.open) {
      setPendingClose(false);
      onCancel();
    }
  }, [alertConfig.open, pendingClose]);

  // ✅ Fix: ESC ahora abre alerta de confirmación en lugar de cerrar directo
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ✅ Fix: clic afuera también usa alerta de confirmación
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "codigo":
        if (!value.trim()) error = "Ej: COD-001";
        break;
      case "nombre":
        if (!value.trim()) error = "Ej: Confecciones Modernas S.A.S.";
        break;
      case "direccion":
        if (!value.trim()) error = "Ej: Calle 10 # 42-15, Medellín";
        break;
      case "telefono":
        if (!/^[0-9\s]+$/.test(value))
          error = "Solo números Ej: 3001234567";
        else if (value.length < 7)
          error = "Mínimo 7 dígitos";
        break;
      case "correo":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Ej: contacto@empresa.com";
        break;
      case "nit":
        if (value && !/^[0-9.\-]+$/.test(value))
          error = "Ej: 900.123.456-7";
        break;
      case "contacto":
        if (!value.trim()) error = "Ej: Ana Pérez";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["codigo", "nombre", "direccion", "telefono", "contacto"];
    let newErrors = {};
    requiredFields.forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    // correo y nit son opcionales — solo validar formato si tienen valor
    if (formData.correo) {
      const err = validateField("correo", formData.correo);
      if (err) newErrors.correo = err;
    }
    if (formData.nit) {
      const err = validateField("nit", formData.nit);
      if (err) newErrors.nit = err;
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) {
      setAlertConfig({
        open: true, type: "warning",
        title: "Campos incompletos",
        message: "Corrige los campos marcados antes de continuar.",
        onConfirm: null,
      });
      return;
    }

    try {
      onSubmit(formData);
      // ✅ Fix: activar pendingClose para que el modal se cierre tras el Alert
      setPendingClose(true);
      setAlertConfig({
        open: true, type: "success",
        title: Third_partie ? "Tercero actualizado" : "Tercero creado",
        message: Third_partie
          ? "El tercero fue actualizado correctamente."
          : "El tercero fue creado correctamente.",
        onConfirm: null,
      });
    } catch {
      setAlertConfig({
        open: true, type: "error",
        title: "Error al guardar",
        message: "No se pudo guardar el tercero. Intenta de nuevo.",
        onConfirm: null,
      });
    }
  };

  // ✅ Fix: función dedicada para cancelar con alerta de confirmación
  const handleCancelClick = () => {
    setAlertConfig({
      open: true, type: "confirm",
      title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, open: false }));
        onCancel();
      },
    });
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const inputError = { ...inputStyle, borderColor: "#ef4444" };
  const errorText  = { color: "#ef4444", fontSize: "12px", marginTop: "4px" };
  const labelStyle = { fontSize: "13px", fontWeight: "500", color: "#555", marginBottom: "6px", display: "block" };
  const btnPrimary   = { padding: "9px 24px", borderRadius: "10px", border: "none", background: "#E91E8C", color: "#fff", fontWeight: "600", cursor: "pointer" };
  const btnSecondary = { padding: "9px 22px", borderRadius: "10px", border: "none", background: "#e4e4e4", color: "#555", cursor: "pointer" };
  const required = <span style={{ color: "#E91E8C" }}>*</span>;

  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          else setAlertConfig(prev => ({ ...prev, open: false }));
        }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.25)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 50,
        }}
      >
        <div
          ref={modalRef}
          style={{
            width: "100%", maxWidth: "900px",
            background: "#f3f3f3",
            borderRadius: "10px",
            padding: "28px 32px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            position: "relative",
          }}
        >
          {/* Botón cerrar ✕ */}
          <button
            onClick={handleCancelClick}
            style={{
              position: "absolute", top: "16px", right: "16px",
              width: "32px", height: "32px", borderRadius: "50%",
              border: "none", backgroundColor: "#e4e4e4", cursor: "pointer", fontSize: "14px",
            }}
          >
            ✕
          </button>

          <h2 style={{ textAlign: "center", marginBottom: "28px" }}>
            {Third_partie ? "Editar tercero" : "Crear nuevo tercero"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Código */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Código {required}</label>
              <input
                name="codigo"
                placeholder="Ej: COD-001"
                value={formData.codigo}
                onChange={handleChange}
                style={errors.codigo ? inputError : inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                onBlur={(e) => (e.target.style.borderColor = errors.codigo ? "#ef4444" : "#d1d5db")}
              />
              {errors.codigo && <span style={errorText}>{errors.codigo}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 30px" }}>
              <div>
                <label style={labelStyle}>Nombre {required}</label>
                <input
                  name="nombre"
                  placeholder="Ej: Confecciones Modernas S.A.S."
                  value={formData.nombre}
                  onChange={handleChange}
                  style={errors.nombre ? inputError : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                  onBlur={(e) => (e.target.style.borderColor = errors.nombre ? "#ef4444" : "#d1d5db")}
                />
                {errors.nombre && <span style={errorText}>{errors.nombre}</span>}
              </div>

              <div>
                <label style={labelStyle}>NIT</label>
                <input
                  name="nit"
                  placeholder="Ej: 900.123.456-7"
                  value={formData.nit}
                  onChange={handleChange}
                  style={errors.nit ? inputError : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                  onBlur={(e) => (e.target.style.borderColor = errors.nit ? "#ef4444" : "#d1d5db")}
                />
                {errors.nit && <span style={errorText}>{errors.nit}</span>}
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={labelStyle}>Dirección {required}</label>
                <input
                  name="direccion"
                  placeholder="Ej: Calle 10 # 42-15, Medellín"
                  value={formData.direccion}
                  onChange={handleChange}
                  style={errors.direccion ? inputError : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                  onBlur={(e) => (e.target.style.borderColor = errors.direccion ? "#ef4444" : "#d1d5db")}
                />
                {errors.direccion && <span style={errorText}>{errors.direccion}</span>}
              </div>

              <div>
                <label style={labelStyle}>Teléfono {required}</label>
                <input
                  name="telefono"
                  placeholder="Ej: 3001234567"
                  value={formData.telefono}
                  onChange={handleChange}
                  style={errors.telefono ? inputError : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                  onBlur={(e) => (e.target.style.borderColor = errors.telefono ? "#ef4444" : "#d1d5db")}
                />
                {errors.telefono && <span style={errorText}>{errors.telefono}</span>}
              </div>

              <div>
                <label style={labelStyle}>Contacto {required}</label>
                <input
                  name="contacto"
                  placeholder="Ej: Ana Pérez"
                  value={formData.contacto}
                  onChange={handleChange}
                  style={errors.contacto ? inputError : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                  onBlur={(e) => (e.target.style.borderColor = errors.contacto ? "#ef4444" : "#d1d5db")}
                />
                {errors.contacto && <span style={errorText}>{errors.contacto}</span>}
              </div>

              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={labelStyle}>Correo</label>
                <input
                  name="correo"
                  placeholder="Ej: contacto@empresa.com"
                  value={formData.correo}
                  onChange={handleChange}
                  style={errors.correo ? inputError : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E91E8C")}
                  onBlur={(e) => (e.target.style.borderColor = errors.correo ? "#ef4444" : "#d1d5db")}
                />
                {errors.correo && <span style={errorText}>{errors.correo}</span>}
              </div>
            </div>

            <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "14px" }}>
              {/* ✅ Fix: Cancelar usa handleCancelClick con alerta de confirmación */}
              <button type="button" style={btnSecondary} onClick={handleCancelClick}>
                Cancelar
              </button>
              <button type="submit" style={btnPrimary}>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Third_partieForm;
