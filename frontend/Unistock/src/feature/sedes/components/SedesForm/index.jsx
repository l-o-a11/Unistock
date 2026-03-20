import React, { useState } from "react";
import Alert from "../../../shared/components/Alert";

const SedeForm = ({ sede, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre:    sede?.nombre    || "",
    ciudad:    sede?.ciudad    || "",
    barrio:    sede?.barrio    || "",
    direccion: sede?.direccion || "",
    telefono:  sede?.telefono  || "",
  });

  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({ open: false, type: "success", title: "", message: "", onConfirm: null });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert  = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  // ── Validaciones ────────────────────────────────────────────────────────
  const validators = {
    required:  (v) => (!v?.trim() ? "Este campo es obligatorio" : ""),
    minLength: (v) => (v && v.trim().length < 3 ? "Mínimo 3 caracteres" : ""),
    telefono:  (v) => (v && !/^\d{7,15}$/.test(v.trim()) ? "Solo números, entre 7 y 15 dígitos" : ""),
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":    error = validators.required(value) || validators.minLength(value); break;
      case "ciudad":    error = validators.required(value); break;
      case "barrio":    error = validators.required(value); break;
      case "direccion": error = validators.required(value); break;
      case "telefono":  error = validators.required(value) || validators.telefono(value); break;
      default: break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const fields = ["nombre", "ciudad", "barrio", "direccion", "telefono"];
    let newErrors = {};
    fields.forEach((f) => { const err = validateField(f, formData[f]); if (err) newErrors[f] = err; });
    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) {
      showAlert("warning", "Campos inválidos", "Corrige los campos marcados antes de guardar.");
      return;
    }

    try {
      onSubmit(formData);
    } catch (error) {
      showAlert("error", "Error al guardar", error.message || "No se pudo guardar la sede.");
    }
  };

  const handleCancel = () => {
    showAlert("confirm", "¿Cancelar?", "Los datos ingresados se perderán.", () => {
      closeAlert();
      onCancel?.();
    });
  };

  // ── Estilos ──────────────────────────────────────────────────────────────
  const inp = (hasError) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    fontSize: "14px",
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const lbl = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  };

  const errS = { color: "#ef4444", fontSize: "12px", marginTop: "4px" };
  const req  = <span style={{ color: "#FF4FD6" }}> *</span>;

  const onFocus = (e) => {
    e.target.style.borderColor = "#FF4FD6";
    e.target.style.boxShadow   = "0 0 0 3px rgba(255,79,214,0.12)";
  };
  const onBlurStyle = (e) => {
    e.target.style.borderColor = errors[e.target.name] ? "#ef4444" : "#e5e7eb";
    e.target.style.boxShadow   = "none";
  };

  return (
    <>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 700, color: "#111" }}>
          {sede ? "Editar sede" : "Crear nueva sede"}
        </h2>

        {/* Nombre */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Nombre{req}</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={onFocus}
            placeholder="Ej. Putonga"
            style={inp(errors.nombre)}
          />
          {errors.nombre && <p style={errS}>{errors.nombre}</p>}
        </div>

        {/* Ciudad + Barrio */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
          <div>
            <label style={lbl}>Ciudad{req}</label>
            <input
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder="Ej. Medellín"
              style={inp(errors.ciudad)}
            />
            {errors.ciudad && <p style={errS}>{errors.ciudad}</p>}
          </div>
          <div>
            <label style={lbl}>Barrio{req}</label>
            <input
              name="barrio"
              value={formData.barrio}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder="Ej. Buenos aires"
              style={inp(errors.barrio)}
            />
            {errors.barrio && <p style={errS}>{errors.barrio}</p>}
          </div>
        </div>

        {/* Dirección + Teléfono */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          <div>
            <label style={lbl}>Dirección{req}</label>
            <input
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder="Ej. Carrera 123 # 12 - 34"
              style={inp(errors.direccion)}
            />
            {errors.direccion && <p style={errS}>{errors.direccion}</p>}
          </div>
          <div>
            <label style={lbl}>Teléfono{req}</label>
            <input
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder="Ej. 4670000"
              style={inp(errors.telefono)}
            />
            {errors.telefono && <p style={errS}>{errors.telefono}</p>}
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: "10px 24px",
              borderRadius: "50px",
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.backgroundColor = "#fff"; }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "10px 24px",
              borderRadius: "50px",
              border: "none",
              background: "#FF4FD6",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255,79,214,0.35)",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
          >
            {sede ? "Guardar cambios" : "Guardar Categoría"}
          </button>
        </div>
      </div>

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { alertConfig.onConfirm?.(); closeAlert(); }}
        onCancel={closeAlert}
      />
    </>
  );
};

export default SedeForm;