import React, { useState, useEffect, useRef } from "react";
import Alert from "../../../shared/components/Alert";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { validators } from "../../../shared/utils/Validaciones";

const Third_partieForm = ({ Third_partie, onSubmit, onCancel }) => {
  const isEdit = Boolean(Third_partie);

  const [formData, setFormData] = useState({
    nombre:    "",
    nit:       "",
    direccion: "",
    telefono:  "",
    contacto:  "",
    correo:    "",
  });

  const [errors,       setErrors]       = useState({});
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({ open: false, type: "success", title: "", message: "", onConfirm: null });
  const modalRef = useRef(null);

  // Cargar datos al editar (código es solo lectura, se muestra pero no se edita)
  useEffect(() => {
    if (Third_partie) {
      setFormData({
        nombre:    Third_partie.nombreEmpresa || Third_partie.nombre    || "",
        nit:       Third_partie.nit       || "",
        direccion: Third_partie.direccion || "",
        telefono:  Third_partie.telefono  || "",
        contacto:  Third_partie.nombreContacto || Third_partie.contacto || "",
        correo:    Third_partie.correo    || Third_partie.email || "",
      });
    }
  }, [Third_partie]);

  useEffect(() => {
    if (pendingClose && !alertConfig.open) { setPendingClose(false); onCancel(); }
  }, [alertConfig.open, pendingClose]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":    error = validators.required(value); break;
      case "direccion": error = validators.required(value); break;
      case "contacto":  error = validators.required(value); break;
      case "telefono":
        error = validators.required(value) || validators.phone(value);
        break;
      case "nit":
        if (value && !/^[0-9.\-]+$/.test(value)) error = "Ej: 900.123.456-7";
        break;
      case "correo":
        if (value) error = validators.email(value);
        break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const validateAll = () => {
    const required = ["nombre", "direccion", "telefono", "contacto"];
    const newErrors = {};
    required.forEach(k => { const e = validateField(k, formData[k]); if (e) newErrors[k] = e; });
    if (formData.nit)    { const e = validateField("nit",    formData.nit);    if (e) newErrors.nit    = e; }
    if (formData.correo) { const e = validateField("correo", formData.correo); if (e) newErrors.correo = e; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setAlertConfig({ open: true, type: "warning", title: "Campos incompletos", message: "Corrige los campos marcados antes de continuar.", onConfirm: null });
      return;
    }
    try {
      // Mapear a estructura esperada por el hook
      onSubmit({
        nombreEmpresa:  formData.nombre,
        nombre:         formData.nombre,
        nit:            formData.nit,
        direccion:      formData.direccion,
        telefono:       formData.telefono,
        nombreContacto: formData.contacto,
        contacto:       formData.contacto,
        correo:         formData.correo,
        email:          formData.correo,
      });
      setPendingClose(true);
      setAlertConfig({
        open: true, type: "success",
        title: isEdit ? "Tercero actualizado" : "Tercero creado",
        message: isEdit ? "El tercero fue actualizado correctamente." : "El tercero fue creado correctamente.",
        onConfirm: null,
      });
    } catch {
      setAlertConfig({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar. Intenta de nuevo.", onConfirm: null });
    }
  };

  const handleCancelClick = () => {
    setAlertConfig({
      open: true, type: "confirm",
      title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => { setAlertConfig(prev => ({ ...prev, open: false })); onCancel(); },
    });
  };

  return (
    <>
      <Alert
        isOpen={alertConfig.open} type={alertConfig.type}
        title={alertConfig.title} message={alertConfig.message}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else setAlertConfig(prev => ({ ...prev, open: false })); }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      <div onClick={handleOverlayClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
        <div ref={modalRef} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 860, padding: "32px 36px", boxShadow: "0 12px 48px rgba(0,0,0,0.18)", position: "relative" }}>

          {/* ✕ */}
          <button onClick={handleCancelClick} style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 14 }}>
            ✕
          </button>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1f2937" }}>
              {isEdit ? "Editar tercero" : "Nuevo tercero"}
            </h2>
            {isEdit && Third_partie?.codigo && (
              <span style={{ display: "inline-block", marginTop: 6, fontSize: 12, fontWeight: 700, color: "#E91E8C", background: "#fce7f3", padding: "2px 10px", borderRadius: 20 }}>
                Código: {Third_partie.codigo}
              </span>
            )}
            {!isEdit && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
                El código se asignará automáticamente al crear el tercero.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px" }}>

              {/* Columna izquierda */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, borderRight: "1px solid #f0f0f0", paddingRight: 28 }}>
                <Input label="Nombre empresa *" name="nombre" value={formData.nombre}
                  onChange={handleChange} onBlur={handleBlur} error={errors.nombre} />
                <Input label="NIT" name="nit" value={formData.nit}
                  onChange={handleChange} onBlur={handleBlur} error={errors.nit} />
                <Input label="Dirección *" name="direccion" value={formData.direccion}
                  onChange={handleChange} onBlur={handleBlur} error={errors.direccion} />
              </div>

              {/* Columna derecha */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Contacto principal *" name="contacto" value={formData.contacto}
                  onChange={handleChange} onBlur={handleBlur} error={errors.contacto} />
                <Input label="Teléfono *" name="telefono" value={formData.telefono}
                  onChange={handleChange} onBlur={handleBlur} error={errors.telefono} />
                <Input label="Correo" type="email" name="correo" value={formData.correo}
                  onChange={handleChange} onBlur={handleBlur} error={errors.correo} />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button type="button" variant="secondary" onClick={handleCancelClick}>Cancelar</Button>
              <Button type="submit" variant="primary">{isEdit ? "Guardar cambios" : "Crear tercero"}</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Third_partieForm;
