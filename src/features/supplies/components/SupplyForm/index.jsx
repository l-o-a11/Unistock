/**
 * @file SupplyForm/index.jsx
 * @description Formulario modal para crear o editar un insumo.
 *              Estilo visual alineado con ProductionForm (UniStock design system).
 */
import React, { useState } from "react";
import Alert from "../../../shared/components/Alert";
import Button from "../../../shared/components/Button";
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from "../../../shared/utils/validationStyles";

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS LOCALES
// ─────────────────────────────────────────────────────────────────────────────
const getInputStyle = (err) => getInputStyleBox(err);

const sectionTitle = (text) => (
  <p style={{
    fontSize: 11, fontWeight: 700, color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.06em",
    margin: "18px 0 10px",
  }}>
    {text}
  </p>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const SupplyForm = ({
  supply,
  medidas = [],
  propiedades = [],
  categorias = [],
  onSubmit,
  onCancel,
  onCreateCategory = () => {},
}) => {
  const isEdit = Boolean(supply);

  const initialFormData = {
    nombre:         supply?.nombre      || "",
    categoriaId:    supply?.categoriaId || "",
    stock:          supply?.stock       ?? "",
    valorMedida:    supply?.valorMedida ?? "",
    medidaId:       supply?.medidaId    || "",
    propiedades:
      supply?.propiedades?.map((p) => ({
        propiedadId: String(p.propiedadId ?? p.clave ?? ""),
        valor: p.valor || "",
      })) || [],
    imageFile:      null,
    eliminarImagen: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors,          setErrors]          = useState({});
  const [propiedadId,     setPropiedadId]     = useState("");
  const [valorPropiedad,  setValorPropiedad]  = useState("");
  const [imagePreview,    setImagePreview]    = useState(supply?.imagen ?? null);
  const [alertConfig,     setAlertConfig]     = useState({
    open: false, type: "success", title: "", message: "", onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert  = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  // ── Validaciones ──────────────────────────────────────────────────────────
  const validators = {
    required:       (v) => (!v && v !== 0 ? "Este campo es obligatorio" : ""),
    positiveNumber: (v) => isNaN(v) || Number(v) <= 0 ? "Debe ser un número mayor a 0" : "",
    cannotDecreaseStock: (v) =>
      isEdit && supply?.stock !== undefined && Number(v) < Number(supply.stock)
        ? "No puedes disminuir el stock al editar el insumo"
        : "",
    nombreValido:   (v) => v && !/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s\-/#.,']+$/.test(v) ? "El nombre contiene caracteres no permitidos" : "",
    minLength:      (v) => v && v.trim().length < 3 ? "Mínimo 3 caracteres" : "",
    maxLength:      (v) => v && v.trim().length > 100 ? "Máximo 100 caracteres" : "",
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        error = validators.required(value) || validators.nombreValido(value) || validators.minLength(value) || validators.maxLength(value);
        break;
      case "categoriaId":
      case "medidaId":
        error = validators.required(value);
        break;
      case "stock":
      case "valorMedida":
        error = validators.required(value) || validators.positiveNumber(value);
        if (name === "stock") {
          error = error || validators.cannotDecreaseStock(value);
        }
        break;
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

  // ── Propiedades ───────────────────────────────────────────────────────────
  const agregarPropiedad = () => {
    if (!propiedadId) {
      showAlert("warning", "Campo requerido", "Selecciona una propiedad antes de agregar.");
      return;
    }
    if (!valorPropiedad.trim()) {
      showAlert("warning", "Campo requerido", "Ingresa un valor para la propiedad.");
      return;
    }
    if (formData.propiedades.find((p) => p.propiedadId === propiedadId)) {
      showAlert("warning", "Propiedad duplicada", "Esta propiedad ya fue agregada. Edita su valor directamente en la tabla.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      propiedades: [...prev.propiedades, { propiedadId, valor: valorPropiedad.trim() }],
    }));
    setPropiedadId("");
    setValorPropiedad("");
  };

  const eliminarPropiedad = (pid) =>
    setFormData((prev) => ({
      ...prev,
      propiedades: prev.propiedades.filter((p) => p.propiedadId !== pid),
    }));

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, imageFile: file, eliminarImagen: false }));
  };

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageFile: null, eliminarImagen: !!supply?.imagen }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const fields    = ["nombre", "categoriaId", "stock", "valorMedida", "medidaId"];
    const newErrors = {};
    fields.forEach((f) => { const err = validateField(f, formData[f]); if (err) newErrors[f] = err; });

    if (formData.propiedades.length === 0) {
      newErrors.propiedades = "Debes agregar al menos una propiedad";
      setErrors((prev) => ({ ...prev, propiedades: newErrors.propiedades }));
    }

    setErrors(newErrors);

    // Alert con lista de campos faltantes — patrón ProductionForm
    const LABELS = {
      nombre: "Nombre", categoriaId: "Categoría", stock: "Stock",
      valorMedida: "Valor de medida", medidaId: "Medida",
      propiedades: "Propiedades (mínimo 1)",
    };
    const missing = Object.entries(newErrors).filter(([, v]) => v).map(([k]) => LABELS[k] || k);
    if (missing.length > 0) {
      showAlert("warning",
        `Faltan ${missing.length} campo${missing.length > 1 ? "s" : ""} por completar`,
        missing.map((m) => `• ${m}`).join("\n"),
      );
      return;
    }

    const propiedadesParaAPI = formData.propiedades.map((fp) => {
      const def = propiedades.find((p) => String(p.id) === String(fp.propiedadId));
      return {
        clave: def?.clave ?? def?.id ?? String(fp.propiedadId),
        label: def?.label ?? def?.nombre ?? String(fp.propiedadId),
        valor: fp.valor,
      };
    });

    try {
      await onSubmit({
        nombre:         formData.nombre.trim(),
        categoriaId:    formData.categoriaId,
        medidaId:       formData.medidaId,
        stock:          parseFloat(formData.stock)      || 0,
        valorMedida:    parseFloat(formData.valorMedida) || 0,
        propiedades:    propiedadesParaAPI,
        imageFile:      formData.imageFile || null,
        eliminarImagen: formData.eliminarImagen,
      });
    } catch (error) {
      showAlert("error", "Error al guardar", error.message || "No se pudo guardar el insumo.");
    }
  };

  const handleCancel = () => {
    const hasChanges = Object.keys(initialFormData).some((key) => {
      const currentValue = formData[key];
      const initialValue = initialFormData[key];

      if (Array.isArray(currentValue) || Array.isArray(initialValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
      }

      if (currentValue instanceof File || initialValue instanceof File) {
        return currentValue !== initialValue;
      }

      return String(currentValue ?? "").trim() !== String(initialValue ?? "").trim();
    });

    if (!hasChanges) {
      onCancel?.();
      return;
    }

    showAlert("confirm", "¿Cancelar?", "Los cambios realizados se perderán.", () => {
      closeAlert();
      onCancel?.();
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { alertConfig.onConfirm?.(); closeAlert(); }}
        onCancel={closeAlert}
      />

      {/* El SupplyForm se renderiza dentro de un modal externo — no tiene overlay propio */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 800,
        maxHeight: "90vh",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        position: "relative",
      }}>
        <div className="roles-modal-scroll" style={{ padding: "28px 30px", overflowY: "auto", maxHeight: "90vh", boxSizing: "border-box", WebkitOverflowScrolling: "touch" }}>

          {/* ── Header con ícono — patrón ProductionForm ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "#ff4fd6",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* Ícono: caja / insumo */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1f2937" }}>
                {isEdit ? "Editar insumo" : "Nuevo insumo"}
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                {isEdit
                  ? `Editando: ${supply?.nombre || "insumo"}`
                  : "Completa todos los campos obligatorios"}
              </p>
            </div>
          </div>

          {/* ── Layout: dos columnas ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

            {/* ════════════════════════════════════════
                COLUMNA IZQUIERDA — campos del insumo
            ════════════════════════════════════════ */}
            <div>

              {sectionTitle("Datos del insumo")}

              {/* Nombre */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Nombre <span style={requiredStar}>*</span>
                </label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Hilo de algodón"
                  style={getInputStyle(errors.nombre)}
                />
                {errors.nombre && <span style={errMsg}>⚠ {errors.nombre}</span>}
              </div>

              {/* Categoría + Stock */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 14, marginBottom: 14, alignItems: "start",
              }}>
                <div>
                  <label style={labelStyle}>
                    Categoría <span style={requiredStar}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      name="categoriaId"
                      value={formData.categoriaId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ ...getInputStyle(errors.categoriaId), flex: 1 }}
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={onCreateCategory}
                      title="Crear nueva categoría"
                      style={{
                        width: 34, height: 34, borderRadius: "50%",
                        border: "none", background: "#ff4fd6",
                        color: "#fff", fontSize: 20, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, boxShadow: "0 2px 8px rgba(255,79,214,0.3)",
                      }}
                    >
                      +
                    </button>
                  </div>
                  {errors.categoriaId && <span style={errMsg}>⚠ {errors.categoriaId}</span>}
                </div>
              </div>

              {/* Stock */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Stock <span style={requiredStar}>*</span>
                </label>
                <input
                  type="number" name="stock"
                  min={isEdit ? supply?.stock : 1}
                  step="1"
                  value={formData.stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: 130"
                  style={getInputStyle(errors.stock)}
                />
                {errors.stock && <span style={errMsg}>⚠ {errors.stock}</span>}
              </div>

              {/* Medida + Valor medida */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14, marginBottom: 4,
              }}>
                <div>
                  <label style={labelStyle}>
                    Medida <span style={requiredStar}>*</span>
                  </label>
                  <select
                    name="medidaId"
                    value={formData.medidaId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={getInputStyle(errors.medidaId)}
                  >
                    <option value="">Seleccionar...</option>
                    {medidas.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                  {errors.medidaId && <span style={errMsg}>⚠ {errors.medidaId}</span>}
                </div>
                <div>
                  <label style={labelStyle}>
                    Valor medida <span style={requiredStar}>*</span>
                  </label>
                  <input
                    type="number" name="valorMedida"
                    value={formData.valorMedida}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 20"
                    style={getInputStyle(errors.valorMedida)}
                  />
                  {errors.valorMedida && <span style={errMsg}>⚠ {errors.valorMedida}</span>}
                </div>
              </div>

              {/* ── Propiedades ── */}
              {sectionTitle("Propiedades")}

              {/* Selector + valor + botón agregar */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Propiedad <span style={requiredStar}>*</span></label>
                  <select
                    value={propiedadId}
                    onChange={(e) => setPropiedadId(e.target.value)}
                    style={getInputStyle(false)}
                  >
                    <option value="">Seleccionar...</option>
                    {propiedades
                      .filter((p) => !formData.propiedades.find((fp) => String(fp.propiedadId) === String(p.id)))
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Valor<span style={requiredStar}>*</span></label>
                  <input
                    placeholder="Ej: Rojo"
                    value={valorPropiedad}
                    onChange={(e) => setValorPropiedad(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarPropiedad())}
                    style={getInputStyle(false)}
                  />
                </div>
                <button
                  type="button"
                  onClick={agregarPropiedad}
                  style={{
                    padding: "0 16px", height: 42, flexShrink: 0,
                    background: "#ff4fd6", color: "#fff",
                    border: "none", borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Agregar
                </button>
              </div>

              {/* Tabla de propiedades */}
              {formData.propiedades.length > 0 ? (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fff0fb" }}>
                        {["Propiedad", "Valor", ""].map((h, i) => (
                          <th key={i} style={{
                            padding: "9px 12px",
                            textAlign: i === 2 ? "center" : "left",
                            fontSize: 11, fontWeight: 700,
                            color: "#ff4fd6", letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #f9a8d4",
                            width: i === 2 ? 44 : undefined,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.propiedades.map((prop, idx) => {
                        const def = propiedades.find((p) => String(p.id) === String(prop.propiedadId));
                        const isLast = idx === formData.propiedades.length - 1;
                        const cell = {
                          padding: "9px 12px", fontSize: 13, color: "#374151",
                          borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                          background: idx % 2 === 0 ? "#fff" : "#fafafa",
                        };
                        return (
                          <tr key={prop.propiedadId}>
                            <td style={cell}>{def?.label ?? def?.nombre ?? prop.propiedadId}</td>
                            <td style={cell}>{prop.valor}</td>
                            <td style={{ ...cell, textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => eliminarPropiedad(prop.propiedadId)}
                                style={{
                                  background: "none", border: "none",
                                  cursor: "pointer", color: "#ff4fd6",
                                  fontSize: 18, fontWeight: 700, padding: "0 4px",
                                }}
                                title="Eliminar propiedad"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{
                    padding: "7px 12px", background: "#fff0fb",
                    borderTop: "1px solid #f9a8d4",
                    fontSize: 11, color: "#ff4fd6", fontWeight: 700, textAlign: "right",
                  }}>
                    {formData.propiedades.length} propiedad{formData.propiedades.length !== 1 ? "es" : ""}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: "16px", borderRadius: 10, textAlign: "center",
                  fontSize: 13, marginTop: 4,
                  background: errors.propiedades ? "#fff5f5" : "#fafafa",
                  border: `1.5px dashed ${errors.propiedades ? "#ef4444" : "#e5e7eb"}`,
                  color: errors.propiedades ? "#ef4444" : "#9ca3af",
                }}>
                  {errors.propiedades
                    ? "⚠ Debes agregar al menos una propiedad"
                    : "Aún no hay propiedades agregadas"}
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════
                COLUMNA DERECHA — imagen del insumo
            ════════════════════════════════════════ */}
            <div style={{ display: "flex", flexDirection: "column" }}>

              {sectionTitle("Imagen del insumo")}

              {/* Drop zone / preview */}
              {imagePreview ? (
                <div style={{
                  border: "1.5px solid #f9a8d4", borderRadius: 12,
                  padding: 16, background: "#fff0fb",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 12,
                }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%", maxHeight: 200,
                      objectFit: "contain", borderRadius: 8,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      padding: "6px 16px", background: "#fff",
                      border: "1.5px solid #ff4fd6",
                      borderRadius: 8, fontSize: 12,
                      color: "#ff4fd6", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    × Eliminar imagen
                  </button>
                </div>
              ) : (
                <label style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 10, padding: "32px 20px", borderRadius: 12,
                  border: "2px dashed #f9a8d4", background: "#fafafa",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fff0fb"; e.currentTarget.style.borderColor = "#ff4fd6"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f9a8d4"; }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke="#ff4fd6" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ff4fd6" }}>
                      Subir imagen del insumo
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }}>
                      PNG, JPG, GIF — hasta 5 MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <span style={{
                    padding: "6px 16px", background: "#f3f4f6",
                    border: "1.5px solid #e5e7eb", borderRadius: 8,
                    fontSize: 12, color: "#6b7280", cursor: "pointer",
                  }}>
                    Seleccionar archivo
                  </span>
                </label>
              )}

              {/* Espaciador para empujar botones al fondo */}
              <div style={{ flex: 1 }} />

              {/* ── Botones ── */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                paddingTop: 16, marginTop: 20,
                borderTop: "1px solid #f3f4f6",
              }}>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="button" variant="primary" onClick={handleSubmit}>
                  {isEdit ? "Guardar insumo" : "Crear insumo"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplyForm;