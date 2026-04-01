import React, { useState } from "react";
import Alert from "../../../shared/components/Alert";


const SupplyForm = ({
  supply,
  medidas = [],
  propiedades = [],
  categorias = [],
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    nombre: supply?.nombre || "",
    categoriaId: supply?.categoriaId || "",
    stock: supply?.stock || "",
    valorMedida: supply?.valorMedida || "",
    medidaId: supply?.medidaId || "",
    propiedades:
      supply?.propiedades?.map((p) => ({
        propiedadId: p.propiedadId,
        valor: p.valor,
      })) || [],
    image: supply?.image || null,
  });

  const [errors, setErrors] = useState({});
  const [propiedadId, setPropiedadId] = useState("");
  const [valorPropiedad, setValorPropiedad] = useState("");
  const [imagePreview, setImagePreview] = useState(supply?.image || null);

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ open: true, type, title, message, onConfirm });
  };

  // ── Validaciones ───────────────────────────────────────────────────────────
  const validators = {
    required: (v) => (!v && v !== 0 ? "Este campo es obligatorio" : ""),
    positiveNumber: (v) =>
      isNaN(v) || Number(v) <= 0 ? "Debe ser un número mayor a 0" : "",
    // Permite letras, números, espacios y caracteres comunes en nombres de insumos
    nombreValido: (v) =>
      v && !/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s\-/#.,']+$/.test(v)
        ? "El nombre contiene caracteres no permitidos"
        : "",
    minLength: (v) =>
      v && v.trim().length < 3 ? "Mínimo 3 caracteres" : "",
    maxLength: (v) =>
      v && v.trim().length > 100 ? "Máximo 100 caracteres" : "",
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        error =
          validators.required(value) ||
          validators.nombreValido(value) ||
          validators.minLength(value) ||
          validators.maxLength(value);
        break;
      case "categoriaId":
        error = validators.required(value);
        break;
      case "stock":
        error = validators.required(value) || validators.positiveNumber(value);
        break;
      case "valorMedida":
        error = validators.required(value) || validators.positiveNumber(value);
        break;
      case "medidaId":
        error = validators.required(value);
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
  };

  // ── Propiedades ────────────────────────────────────────────────────────────
  const agregarPropiedad = () => {
    if (!propiedadId) {
      showAlert("warning", "Campo requerido", "Selecciona una propiedad antes de agregar.");
      return;
    }
    if (!valorPropiedad.trim()) {
      showAlert("warning", "Campo requerido", "Ingresa un valor para la propiedad.");
      return;
    }
    const existe = formData.propiedades.find(
      (p) => p.propiedadId === parseInt(propiedadId)
    );
    if (existe) {
      showAlert("warning", "Propiedad duplicada", "Esta propiedad ya fue agregada. Edita su valor directamente en la tabla.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      propiedades: [
        ...prev.propiedades,
        { propiedadId: parseInt(propiedadId), valor: valorPropiedad.trim() },
      ],
    }));
    setPropiedadId("");
    setValorPropiedad("");
  };

  const eliminarPropiedad = (pid) => {
    setFormData((prev) => ({
      ...prev,
      propiedades: prev.propiedades.filter((p) => p.propiedadId !== pid),
    }));
  };

  // ── Imagen ─────────────────────────────────────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const fields = ["nombre", "categoriaId", "stock", "valorMedida", "medidaId"];
    let newErrors = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);

    // Validar mínimo 1 propiedad
    if (formData.propiedades.length === 0) {
      newErrors.propiedades = "Debes agregar al menos una propiedad";
      setErrors((prev) => ({ ...prev, propiedades: "Debes agregar al menos una propiedad" }));
    }

    if (Object.values(newErrors).some((e) => e)) {
      showAlert("warning", "Campos inválidos", "Corrige los campos marcados antes de guardar.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      categoriaId: parseInt(formData.categoriaId) || 0,
      medidaId: parseInt(formData.medidaId) || 0,
      stock: parseFloat(formData.stock) || 0,
      valorMedida: parseFloat(formData.valorMedida) || 0,
    };

    try {
      // Awaitar el onSubmit del padre — si lanza error (ej. duplicado) lo capturamos
      await onSubmit(dataToSubmit);
      // El padre maneja la alerta de éxito — no la mostramos aquí también
    } catch (error) {
      showAlert("error", "Error al guardar", error.message || "No se pudo guardar el insumo.");
    }
  };

  // ── Cancelar ───────────────────────────────────────────────────────────────
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

  // ── Estilos ────────────────────────────────────────────────────────────────
  const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${hasError ? '#E91E8C' : '#d1d5db'}`,
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s, background-color 0.2s',
});

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "6px",
  };
 const errorStyle = {
  color: '#E91E8C',
   fontWeight: 'bold', 
  fontSize: '11px',
  marginTop: '4px',
  display: 'block',
};
  
  const requiredStar = <span style={{ color: "#ff4fd6", marginLeft: "2px" }}>*</span>;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ display: "flex", gap: "40px", padding: "30px", background: "#fff", borderRadius: "10px", width: "100%", maxWidth: "1100px", maxHeight: "90vh", overflow: "hidden" }}>

        {/* COLUMNA IZQUIERDA */}
        <div style={{ flex: 1, overflowY: "auto", scrollbarGutter: "stable", paddingRight: "12px"}}>
          <h2 style={{ marginBottom: "24px", fontSize: "20px", fontWeight: "600", color: "#1a1a1a" }}>
            {supply ? "Editar insumo" : "Crear nuevo insumo"}
          </h2>

          {/* Nombre */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Nombre {requiredStar}</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej. Hilo de algodón"
              style={inputStyle(errors.nombre)}
            />
            {errors.nombre && <p style={errorStyle}>{errors.nombre}</p>}
          </div>

          {/* Categoría + Stock */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Categoría {requiredStar}</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                onBlur={handleBlur}
                style={inputStyle(errors.categoriaId)}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              {errors.categoriaId && <p style={errorStyle}>{errors.categoriaId}</p>}
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stock {requiredStar}</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej. 130"
                style={inputStyle(errors.stock)}
              />
              {errors.stock && <p style={errorStyle}>{errors.stock}</p>}
            </div>
          </div>

          {/* Valor medida + Medida */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Valor medida {requiredStar}</label>
              <input
                type="number"
                name="valorMedida"
                value={formData.valorMedida}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej. 20"
                style={inputStyle(errors.valorMedida)}
              />
              {errors.valorMedida && <p style={errorStyle}>{errors.valorMedida}</p>}
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Medida {requiredStar}</label>
              <select
                name="medidaId"
                value={formData.medidaId}
                onChange={handleChange}
                onBlur={handleBlur}
                style={inputStyle(errors.medidaId)}
              >
                <option value="">Seleccionar medida</option>
                {medidas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
              {errors.medidaId && <p style={errorStyle}>{errors.medidaId}</p>}
            </div>
          </div>

          {/* Propiedades */}
          <div style={{ marginBottom: "10px" }}>
            <label style={labelStyle}>Propiedades</label>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px", marginBottom: "20px" }}>
              <select
                value={propiedadId}
                onChange={(e) => setPropiedadId(e.target.value)}
                style={{ ...inputStyle(errors.propiedades ? "#ef4444" : false), flex: 1 }}
              >
                <option value="">Seleccionar propiedad</option>
                {propiedades
                  .filter((p) => !formData.propiedades.find((fp) => fp.propiedadId === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
              </select>
              <input
                placeholder="Valor (Ej. rojo)"
                value={valorPropiedad}
                onChange={(e) => setValorPropiedad(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarPropiedad())}
                style={{ ...inputStyle(false), flex: 1 }}
              />
              <button
                type="button"
                onClick={agregarPropiedad}
                style={{ padding: "10px 24px", backgroundColor: "#ff4fd6", color: "#fff", fontSize: "14px", fontWeight: "500", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Agregar
              </button>
            </div>

            {formData.propiedades.length > 0 ? (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#fdf0f7" }}>
                      {["Propiedad", "Valor", "Acción"].map((h, i) => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: i === 2 ? "center" : "left", fontSize: "12px", fontWeight: "600", color: "#ff4fd6", borderBottom: "1px solid #ff4fd6", width: i === 2 ? "60px" : undefined }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.propiedades.map((prop, index) => {
                      const propData = propiedades.find((p) => p.id === prop.propiedadId);
                      const isLast = index === formData.propiedades.length - 1;
                      const cellStyle = { padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: isLast ? "none" : "1px solid #e5e7eb", backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa" };
                      return (
                        <tr key={prop.propiedadId}>
                          <td style={cellStyle}>{propData?.nombre || `Propiedad ${prop.propiedadId}`}</td>
                          <td style={cellStyle}>{prop.valor}</td>
                          <td style={{ ...cellStyle, textAlign: "center" }}>
                            <button type="button" onClick={() => eliminarPropiedad(prop.propiedadId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4fd6", fontSize: "18px", fontWeight: "bold", padding: "0 4px" }} title="Eliminar propiedad">×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ padding: "8px 12px", backgroundColor: "#f9f9f9", borderTop: "1px solid #e5e7eb", fontSize: "12px", color: "#666", textAlign: "right" }}>
                  Total: {formData.propiedades.length} propiedad(es)
                </div>
              </div>
            ) : (
              <div style={{ padding: "18px", backgroundColor: errors.propiedades ? "#fff5f5" : "#fafafa", border: `1px dashed ${errors.propiedades ? "#ef4444" : "#e5e7eb"}`, borderRadius: "8px", textAlign: "center", fontSize: "13px", color: errors.propiedades ? "#ef4444" : "#999", marginTop: "8px" }}>
                {errors.propiedades ? "⚠ Debes agregar al menos una propiedad" : "No hay propiedades agregadas."}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA — Imagen + Botones */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", backgroundColor: "#fafafa", minHeight: "250px", width: "300px", marginTop: "20%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {imagePreview ? (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "4px" }} />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setFormData((prev) => ({ ...prev, image: null })); }}
                    style={{ marginTop: "10px", padding: "4px 12px", backgroundColor: "#ff4fd6", border: "1px solid #ff4fd6", borderRadius: "4px", fontSize: "12px", color: "#fff", cursor: "pointer" }}
                  >
                    Eliminar imagen
                  </button>
                </div>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="8" y1="2" x2="8" y2="22" /><line x1="16" y1="2" x2="16" y2="22" />
                    <line x1="2" y1="8" x2="22" y2="8" /><line x1="2" y1="16" x2="22" y2="16" />
                  </svg>
                  <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
                    <span style={{ color: "#E91E8C", fontWeight: "500" }}>Sube una imagen</span><br />o arrastra y suelta
                  </p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>PNG, JPG, GIF hasta 10MB</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} id="product-image-upload" />
                  <label htmlFor="product-image-upload" style={{ marginTop: "10px", padding: "6px 16px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", color: "#555", cursor: "pointer" }}>
                    Seleccionar archivo
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "30px" }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{ padding: "10px 32px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", color: "#555", cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={{ padding: "11px 32px", backgroundColor: "#ff4fd6", color: "#fff", fontSize: "14px", fontWeight: "600", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              {supply ? "Guardar insumo" : "Crear insumo"}
            </button>
          </div>
        </div>
      </div>

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

export default SupplyForm;