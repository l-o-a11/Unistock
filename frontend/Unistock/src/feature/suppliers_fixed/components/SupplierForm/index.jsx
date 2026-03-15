/**
 * @file SupplierForm/index.jsx
 * @description Formulario modal para crear o editar un proveedor.
 *
 * CAMPOS Y SUS VALIDACIONES:
 *   nombreEmpresa  — texto libre, obligatorio
 *   nit            — solo dígitos (bloqueado en onChange), 8-12 dígitos, obligatorio
 *   direccion      — texto libre, obligatorio
 *   correoEmpresa  — formato email, obligatorio
 *   sitioWeb       — texto libre, opcional
 *   nombreContacto — texto libre, opcional
 *   telefono       — solo dígitos (bloqueado en onChange), exactamente 10, obligatorio
 *   correoContacto — formato email, opcional (solo valida si tiene valor)
 *
 * PROPS:
 *   supplier  {object|null}  — proveedor a editar; null para crear nuevo
 *   onSubmit  {function}     — recibe los datos del formulario
 *   onCancel  {function}     — cierra el modal sin guardar
 */
import React, { useState, useEffect, useRef } from "react";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Alert from "../../../shared/components/Alert";
import { validators, blockInput } from "../../../shared/utils/Validaciones";

/**
 * @param {object}      props
 * @param {object|null} [props.supplier]  — datos del proveedor existente (edición)
 * @param {function}    props.onSubmit
 * @param {function}    props.onCancel
 */
const SupplierForm = ({ supplier, onSubmit, onCancel }) => {

  const modalRef = useRef(null);

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    nombreEmpresa:  "",
    nit:            "",
    direccion:      "",
    correoEmpresa:  "",
    sitioWeb:       "",
    nombreContacto: "",
    telefono:       "",
    correoContacto: "",
  });

  const [errors,       setErrors]       = useState({});
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({
    open:      false,
    type:      "confirm",
    title:     "",
    message:   "",
    onConfirm: null,
  });

  // ── Cargar datos del proveedor si es modo edición ─────────────────────────
  useEffect(() => {
    if (supplier) {
      setFormData({
        nombreEmpresa:  supplier.nombreEmpresa  || "",
        nit:            supplier.nit            || "",
        direccion:      supplier.direccion      || "",
        correoEmpresa:  supplier.correoEmpresa  || "",
        sitioWeb:       supplier.sitioWeb       || "",
        nombreContacto: supplier.nombreContacto || "",
        telefono:       supplier.telefono       || "",
        correoContacto: supplier.correoContacto || "",
      });
    }
  }, [supplier]);

  /**
   * Cierra el modal después de que el Alert de éxito/error se cierre.
   * pendingClose se activa cuando el submit fue exitoso.
   */
  useEffect(() => {
    if (pendingClose && !alertConfig.open) {
      setPendingClose(false);
      onCancel();
    }
  }, [alertConfig.open, pendingClose]);

  // ── ESC para cerrar ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /** Cierra si el clic fue fuera del modal */
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDACIÓN DE CAMPO INDIVIDUAL
  // ─────────────────────────────────────────────────────────────────────────────
  /**
   * Valida un campo específico y actualiza el estado de errores.
   * Se llama en onBlur para mostrar el error al salir del campo.
   *
   * @param {string} name  — nombre del campo
   * @param {string} value — valor actual
   * @returns {string} mensaje de error o ""
   */
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombreEmpresa":
        // Obligatorio, texto libre
        error = validators.required(value);
        break;
      case "nit":
        // Obligatorio + solo dígitos + longitud 8-12
        error = validators.required(value) || validators.numbers(value);
        if (!error && (value.length < 8 || value.length > 12))
          error = "Debe tener entre 8 y 12 dígitos";
        break;
      case "direccion":
        // Obligatorio, texto libre
        error = validators.required(value);
        break;
      case "correoEmpresa":
        // Obligatorio + formato email
        error = validators.required(value) || validators.email(value);
        break;
      case "telefono":
        // Obligatorio + solo dígitos + exactamente 10 caracteres
        error = validators.required(value) || validators.numbers(value);
        if (!error && value.length !== 10) error = "Debe tener exactamente 10 dígitos";
        break;
      case "correoContacto":
        // Opcional — solo valida formato si el usuario escribió algo
        error = value ? validators.email(value) : "";
        break;
      // sitioWeb y nombreContacto son completamente opcionales
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLER DE CAMBIO DE CAMPO
  // ─────────────────────────────────────────────────────────────────────────────
  /**
   * Maneja el cambio de cualquier campo del formulario.
   *
   * Para "nit" y "telefono": bloquea en tiempo real cualquier carácter que
   * no sea dígito. El bloqueo es inmediato (no espera al onBlur).
   * Esto se hace comprobando con blockInput.onlyNumbers antes de actualizar el estado.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ── Bloqueo a nivel de carácter para campos numéricos ──────────────────
    // Si blockInput.onlyNumbers retorna false, el carácter no es un dígito
    // y simplemente retornamos sin actualizar el estado.
    if (name === "telefono" || name === "nit") {
      if (!blockInput.onlyNumbers(e)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /** Dispara la validación de campo al salir del input */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDACIÓN COMPLETA (antes del submit)
  // ─────────────────────────────────────────────────────────────────────────────
  /**
   * Valida todos los campos obligatorios y los opcionales con valor.
   * @returns {boolean} true si no hay errores
   */
  const validateAll = () => {
    const requiredFields = ["nombreEmpresa", "nit", "direccion", "correoEmpresa", "telefono"];
    let newErrors = {};

    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // correoContacto: opcional — solo valida si tiene valor
    if (formData.correoContacto) {
      const emailError = validators.email(formData.correoContacto);
      if (emailError) newErrors.correoContacto = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
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
      // pendingClose = true hace que el modal se cierre cuando el Alert de éxito se cierre
      setPendingClose(true);
      setAlertConfig({
        open: true, type: "success",
        title: supplier ? "Proveedor actualizado" : "Proveedor creado",
        message: supplier
          ? "El proveedor fue actualizado correctamente."
          : "El proveedor fue creado correctamente.",
        onConfirm: null,
      });
    } catch {
      setAlertConfig({
        open: true, type: "error",
        title: "Error al guardar",
        message: "No se pudo guardar el proveedor. Intenta de nuevo.",
        onConfirm: null,
      });
    }
  };

  /** Confirma cancelación con Alert antes de cerrar si hay cambios */
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
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          else setAlertConfig(prev => ({ ...prev, open: false }));
        }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      {/* Overlay del modal */}
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
            backgroundColor: "#fff", borderRadius: "16px",
            width: "100%", maxWidth: "900px",
            padding: "36px 40px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            position: "relative",
            maxHeight: "92vh", overflowY: "auto",
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

          <h2 style={{ textAlign: "center", marginBottom: "28px", fontSize: 20, fontWeight: 800, color: "#1f2937" }}>
            {supplier ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>

              {/* ── COLUMNA IZQUIERDA ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", borderRight: "1px solid #e5e7eb", paddingRight: "30px" }}>

                {/* Nombre empresa — texto libre */}
                <Input
                  label="Nombre Empresa *"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombreEmpresa}
                />

                {/* NIT — solo dígitos (bloqueado + validado) */}
                <Input
                  label="NIT * (solo dígitos, 8-12 caracteres)"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nit}
                />

                {/* Dirección — texto libre */}
                <Input
                  label="Dirección *"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.direccion}
                />

                {/* Correo empresa — formato email */}
                <Input
                  label="Correo Empresa *"
                  type="email"
                  name="correoEmpresa"
                  value={formData.correoEmpresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoEmpresa}
                />

                {/* Sitio web — opcional */}
                <Input
                  label="Sitio Web"
                  name="sitioWeb"
                  value={formData.sitioWeb}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {/* ── COLUMNA DERECHA ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* Nombre contacto — opcional */}
                <Input
                  label="Nombre Contacto"
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {/* Teléfono — solo dígitos (bloqueado + validado), exactamente 10 */}
                <Input
                  label="Teléfono * (10 dígitos)"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                />

                {/* Correo contacto — opcional, solo valida formato si tiene valor */}
                <Input
                  label="Correo Contacto"
                  type="email"
                  name="correoContacto"
                  value={formData.correoContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoContacto}
                />
              </div>
            </div>

            {/* ── BOTONES ── */}
            <div className="flex justify-end gap-4 mt-8">
              <Button type="button" variant="secondary" onClick={handleCancelClick}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {supplier ? "Guardar cambios" : "Guardar Proveedor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SupplierForm;
