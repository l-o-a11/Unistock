import React, { useState, useCallback, useEffect, useRef } from "react";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Alert from "../../../shared/components/Alert";
import { validators } from "../../../shared/utils/Validaciones";

const UserForm = ({ user, roles = [], sedes = [], onSubmit, onCancel }) => {
  const modalRef = useRef(null);

  // Inicializa directamente desde la prop — sin useEffect para evitar setState en efecto
  const [formData, setFormData] = useState(() => user ?? {
    documentType:   "",
    documentNumber: "",
    name:           "",
    email:          "",
    role:           "",
    sede:           "",
  });

  const [errors,      setErrors]      = useState({});
  const [alertConfig, setAlertConfig] = useState({
    open: false, type: "confirm", title: "", message: "", onConfirm: null,
  });

  const closeAlert = useCallback(
    () => setAlertConfig((prev) => ({ ...prev, open: false })),
    []
  );

  // Declarado con useCallback ANTES del useEffect del ESC para evitar "used before declared"
  const handleCancelClick = useCallback(() => {
    setAlertConfig({
      open: true, type: "confirm",
      title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, open: false }));
        onCancel();
      },
    });
  }, [onCancel]);

  /* Cerrar con ESC — handleCancelClick ya está declarado arriba */
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleCancelClick]);

  /* Cerrar clic afuera del modal */
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  /* ── Validación por campo ─────────────────────────────────────────────── */
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "documentType":   error = validators.required(value); break;
      case "documentNumber": error = validators.required(value) || validators.numbers(value); break;
      case "name":           error = validators.required(value); break;
      case "email":          error = validators.required(value) || validators.email(value); break;
      case "role":           error = validators.required(value); break;
      case "sede":           error = validators.required(value); break;
      default: break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateAll = () => {
    let newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAll()) {
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
      setAlertConfig({
        open: true, type: "success",
        title: user ? "Usuario actualizado" : "Usuario creado",
        message: user
          ? "El usuario fue actualizado correctamente."
          : "El usuario fue creado correctamente.",
        onConfirm: null,
      });
    } catch {
      setAlertConfig({
        open: true, type: "error",
        title: "Error al guardar",
        message: "No se pudo guardar el usuario. Intenta de nuevo.",
        onConfirm: null,
      });
    }
  };

  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          else closeAlert();
        }}
        onCancel={() => {
          closeAlert();
          // Si era toast de éxito, cerramos el modal al cerrar la alerta
          if (alertConfig.type === "success") onCancel();
        }}
      />

      {/* Overlay con cierre al hacer clic afuera */}
      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 50,
        }}
      >
        <div
          ref={modalRef}
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            width: "100%", maxWidth: "560px",
            padding: "36px 40px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          {/* Botón cerrar ✕ */}
          <button
            onClick={handleCancelClick}
            style={{
              position: "absolute", top: "16px", right: "16px",
              width: "32px", height: "32px", borderRadius: "50%",
              border: "none", backgroundColor: "#f3f4f6", cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✕
          </button>

          <h2 style={{ textAlign: "center", marginBottom: "28px" }}>
            {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h2>

          <form onSubmit={handleSubmit}>

            {/* DOCUMENTO */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <Input
                label="Tipo de documento *"
                as="select"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.documentType}
              >
                <option value="">Seleccionar Tipo</option>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
              </Input>

              <Input
                label="Número de documento *"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.documentNumber}
              />
            </div>

            {/* NOMBRE */}
            <div className="mb-6">
              <Input
                label="Nombre completo *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
              />
            </div>

            {/* CORREO */}
            <div className="mb-6">
              <Input
                type="email"
                label="Correo electrónico *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
              />
            </div>

            {/* ROL */}
            <div className="mb-6">
              <Input
                label="Rol *"
                as="select"
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.role}
              >
                <option value="">Seleccionar rol</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Input>
            </div>

            {/* SEDE */}
            <div className="mb-6">
              <Input
                label="Sede *"
                as="select"
                name="sede"
                value={formData.sede}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.sede}
              >
                <option value="">Seleccionar sede</option>
                {sedes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Input>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="secondary" onClick={handleCancelClick}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar Usuario
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserForm;
