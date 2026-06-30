import React, { useState } from "react";
import Alert from "../../../shared/components/Alert";
import Button from "../../../shared/components/Button";

// ─────────────────────────────────────────────────
// Tokens de estilo — alineados con ProductionForm / RolForm / CategoryForm
// ─────────────────────────────────────────────────
const PINK = "#ff4fd6";

const fieldStyle = (hasError) => ({
  width: "100%",
  padding: "10px 14px",
  border: `1.5px solid ${hasError ? PINK : "#e5e7eb"}`,
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
  backgroundColor: "#ffffff",
  fontFamily: "inherit",
  color: "#1f2937",
});

// Label sentence case, igual al resto del sistema
const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "5px",
};

const errorStyle = {
  color: PINK,
  fontSize: "11px",
  marginTop: "4px",
  display: "block",
  fontWeight: "500",
};

const sectionTitle = (text) => (
  <p
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: "#9ca3af",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      margin: "0 0 10px",
    }}
  >
    {text}
  </p>
);

const req = <span style={{ color: PINK }}> *</span>;

const onFocusField = (e) => {
  e.target.style.borderColor = PINK;
  e.target.style.boxShadow = "0 0 0 3px rgba(255,79,214,0.1)";
};

// ─────────────────────────────────────────────────
// SedeForm
// ─────────────────────────────────────────────────
const SedeForm = ({ sede, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: sede?.nombre || "",
    ciudad: sede?.ciudad || "",
    barrio: sede?.barrio || "",
    direccion: sede?.direccion || "",
    telefono: sede?.telefono || "",
  });

  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  // ── Validaciones ────────────────────────────────────────────────────────
  const validators = {
    required: (v) => (!v?.trim() ? "Este campo es obligatorio" : ""),
    minLength: (v) => (v && v.trim().length < 3 ? "Mínimo 3 caracteres" : ""),
    telefono: (v) =>
      v && !/^\d{7,15}$/.test(v.trim())
        ? "Solo números, entre 7 y 15 dígitos"
        : "",
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        error = validators.required(value) || validators.minLength(value);
        break;
      case "ciudad":
        error = validators.required(value);
        break;
      case "barrio":
        error = validators.required(value);
        break;
      case "direccion":
        error = validators.required(value);
        break;
      case "telefono":
        error = validators.required(value) || validators.telefono(value);
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
    e.target.style.borderColor = errors[name] ? PINK : "#e5e7eb";
    e.target.style.boxShadow = "none";
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const fields = ["nombre", "ciudad", "barrio", "direccion", "telefono"];
    let newErrors = {};
    fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) {
      showAlert(
        "warning",
        "Campos inválidos",
        "Corrige los campos marcados antes de guardar."
      );
      return;
    }

    try {
      onSubmit(formData);
    } catch (error) {
      showAlert(
        "error",
        "Error al guardar",
        error.message || "No se pudo guardar la sede."
      );
    }
  };

  const handleCancel = () => {
    showAlert(
      "confirm",
      "¿Cancelar?",
      "Los datos ingresados se perderán.",
      () => {
        closeAlert();
        onCancel?.();
      }
    );
  };

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <>
      <form onSubmit={handleSubmit} noValidate style={{ padding: "12px 14px", boxSizing: "border-box" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: PINK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1f2937" }}>
              {sede ? "Editar sede" : "Crear nueva sede"}
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
              Completa todos los campos obligatorios
            </p>
          </div>
        </div>

        {/* SECCIÓN: INFO BÁSICA */}
        {sectionTitle("Información de la sede")}

        {/* NOMBRE */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="nombre" style={labelStyle}>
            Nombre{req}
          </label>
          <input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={onFocusField}
            placeholder="Ej: Putonga"
            style={fieldStyle(!!errors.nombre)}
          />
          {errors.nombre && <span style={errorStyle}>⚠ {errors.nombre}</span>}
        </div>

        {/* CIUDAD + BARRIO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label htmlFor="ciudad" style={labelStyle}>
              Ciudad{req}
            </label>
            <input
              id="ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocusField}
              placeholder="Ej: Medellín"
              style={fieldStyle(!!errors.ciudad)}
            />
            {errors.ciudad && <span style={errorStyle}>⚠ {errors.ciudad}</span>}
          </div>
          <div>
            <label htmlFor="barrio" style={labelStyle}>
              Barrio{req}
            </label>
            <input
              id="barrio"
              name="barrio"
              value={formData.barrio}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocusField}
              placeholder="Ej: Buenos aires"
              style={fieldStyle(!!errors.barrio)}
            />
            {errors.barrio && <span style={errorStyle}>⚠ {errors.barrio}</span>}
          </div>
        </div>

        {/* DIRECCIÓN + TELÉFONO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <label htmlFor="direccion" style={labelStyle}>
              Dirección{req}
            </label>
            <input
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocusField}
              placeholder="Ej: Carrera 123 # 12 - 34"
              style={fieldStyle(!!errors.direccion)}
            />
            {errors.direccion && <span style={errorStyle}>⚠ {errors.direccion}</span>}
          </div>
          <div>
            <label htmlFor="telefono" style={labelStyle}>
              Teléfono{req}
            </label>
            <input
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocusField}
              placeholder="Ej: 4670000"
              style={fieldStyle(!!errors.telefono)}
            />
            {errors.telefono && <span style={errorStyle}>⚠ {errors.telefono}</span>}
          </div>
        </div>

        {/* BOTONES */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 16,
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {sede ? "Guardar cambios" : "Guardar sede"}
          </Button>
        </div>
      </form>

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          alertConfig.onConfirm?.();
          closeAlert();
        }}
        onCancel={closeAlert}
      />
    </>
  );
};

export default SedeForm;