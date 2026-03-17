/**
 * @file Third_partiesForm/index.jsx
 * @description Formulario modal para crear o editar un tercero.
 *
 * CAMPOS Y SUS VALIDACIONES:
 *   nombre    — texto libre, obligatorio
 *   nit       — formato NIT colombiano (dígitos, puntos, guion), opcional
 *   direccion — texto libre, obligatorio
 *   contacto  — texto libre, obligatorio (nombre de la persona de contacto)
 *   telefono  — solo dígitos (bloqueado en onChange), exactamente 10, obligatorio
 *   correo    — formato email, opcional (solo valida si tiene valor)
 *
 * PROPS:
 *   Third_partie {object|null}  — tercero a editar; null para crear nuevo
 *   onSubmit     {function}     — recibe los datos mapeados al formato del hook
 *   onCancel     {function}     — cierra el modal sin guardar
 */
import React, { useState, useEffect, useRef } from "react";
import Alert from "../../../shared/components/Alert";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { validators, blockInput } from "../../../shared/utils/Validaciones";

/**
 * @param {object}      props
 * @param {object|null} [props.Third_partie]  — tercero existente (modo edición)
 * @param {function}    props.onSubmit
 * @param {function}    props.onCancel
 */
const Third_partieForm = ({ Third_partie, onSubmit, onCancel }) => {
  const isEdit = Boolean(Third_partie);

  // ── Estado del formulario ─────────────────────────────────────────────────
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
  const [alertConfig,  setAlertConfig]  = useState({
    open: false, type: "success", title: "", message: "", onConfirm: null,
  });
  const modalRef = useRef(null);

  // ── Cargar datos del tercero al editar ────────────────────────────────────
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

  /**
   * Cierra el modal cuando el Alert de éxito/error se cierra.
   * Se activa solo cuando pendingClose está en true (submit exitoso).
   */
  useEffect(() => {
    if (pendingClose && !alertConfig.open) { setPendingClose(false); onCancel(); }
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
   * Llamado en onBlur y también durante validateAll.
   *
   * @param {string} name
   * @param {string} value
   * @returns {string} mensaje de error o ""
   */
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        // Obligatorio, texto libre (nombre de empresa)
        error = validators.required(value);
        break;
      case "direccion":
        // Obligatorio, texto libre
        error = validators.required(value);
        break;
      case "contacto":
        // Obligatorio, nombre de la persona de contacto
        error = validators.required(value);
        break;
      case "telefono":
        // Obligatorio + solo dígitos + exactamente 10 caracteres
        error = validators.required(value) || validators.phone(value);
        break;
      case "nit":
        // Opcional — si tiene valor, valida formato NIT colombiano
        // Formato aceptado: dígitos, puntos y guiones (Ej: 900.123.456-7)
        if (value) error = validators.nit(value);
        break;
      case "correo":
        // Opcional — si tiene valor, valida formato de email
        if (value) error = validators.email(value);
        break;
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
   * Maneja el cambio de cualquier campo.
   *
   * Para "telefono": bloqueo a nivel de carácter — solo dígitos pasan.
   * Para "nit":      bloqueo con formato NIT — dígitos, puntos y guión pasan.
   * Para los demás:  acepta cualquier texto y re-valida si había un error previo.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ── Bloqueo a nivel de carácter según tipo de campo ────────────────────
    if (name === "telefono") {
      // Solo dígitos para el teléfono
      if (!blockInput.onlyNumbers(e)) return;
    } else if (name === "nit") {
      // Solo dígitos, puntos y guión para NIT
      if (!blockInput.nit(e)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Re-validar en tiempo real si el campo ya tenía un error visible
    if (errors[name]) validateField(name, value);
  };

  /** Dispara la validación de campo al salir del input */
  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDACIÓN COMPLETA
  // ─────────────────────────────────────────────────────────────────────────────
  /**
   * Valida todos los campos antes del submit.
   * Los campos opcionales (nit, correo) solo se validan si tienen valor.
   * @returns {boolean} true si el formulario es válido
   */
  const validateAll = () => {
    // Campos obligatorios
    const required = ["nombre", "direccion", "telefono", "contacto"];
    const newErrors = {};
    required.forEach(k => {
      const e = validateField(k, formData[k]);
      if (e) newErrors[k] = e;
    });

    // Campos opcionales con validación condicional
    if (formData.nit)    { const e = validateField("nit",    formData.nit);    if (e) newErrors.nit    = e; }
    if (formData.correo) { const e = validateField("correo", formData.correo); if (e) newErrors.correo = e; }

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
      /**
       * Mapeamos al formato que espera el hook useThird_parties.
       * Se incluyen ambas claves (nombreEmpresa/nombre, nombreContacto/contacto)
       * para compatibilidad con el backend y la tabla de listado.
       */
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
        message: isEdit
          ? "El tercero fue actualizado correctamente."
          : "El tercero fue creado correctamente.",
        onConfirm: null,
      });
    } catch {
      setAlertConfig({
        open: true, type: "error",
        title: "Error al guardar",
        message: "No se pudo guardar. Intenta de nuevo.",
        onConfirm: null,
      });
    }
  };

  /** Confirma cancelación con Alert antes de cerrar */
  const handleCancelClick = () => {
    setAlertConfig({
      open: true, type: "confirm",
      title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => { setAlertConfig(prev => ({ ...prev, open: false })); onCancel(); },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Alert
        isOpen={alertConfig.open} type={alertConfig.type}
        title={alertConfig.title} message={alertConfig.message}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else setAlertConfig(prev => ({ ...prev, open: false })); }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      {/* Overlay del modal */}
      <div
        onClick={handleOverlayClick}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}
      >
        <div
          ref={modalRef}
          style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 860,
            // Padding estandarizado: 28px vertical, 32px horizontal — igual a SupplierForm
            padding: "28px 32px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.18)", position: "relative", maxHeight: "92vh", overflowY: "auto",
          }}
        >

          {/* Botón cerrar ✕ */}
          <button
            onClick={handleCancelClick}
            style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 14 }}
          >
            ✕
          </button>

          {/* Header del modal */}
          <div style={{ marginBottom: 22 }}>
            {/* Título: 18px bold — igual a SupplierForm */}
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1f2937" }}>
              {isEdit ? "Editar tercero" : "Nuevo tercero"}
            </h2>
            {/* En edición muestra el código asignado */}
            {isEdit && Third_partie?.codigo && (
              <span style={{ display: "inline-block", marginTop: 6, fontSize: 12, fontWeight: 700, color: "#E91E8C", background: "#fce7f3", padding: "2px 10px", borderRadius: 20 }}>
                Código: {Third_partie.codigo}
              </span>
            )}
            {/* En creación avisa que el código se asigna automáticamente */}
            {!isEdit && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
                El código se asignará automáticamente al crear el tercero.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Gap horizontal 28px — igual a SupplierForm */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px" }}>

              {/* ── COLUMNA IZQUIERDA — gap 16px entre campos, paddingRight 24px ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, borderRight: "1px solid #f0f0f0", paddingRight: 24 }}>

                {/* Nombre empresa — texto libre, obligatorio */}
                <Input
                  label="Nombre empresa *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombre}
                />

                {/* NIT — opcional, formato: dígitos + puntos + guión */}
                <Input
                  label="NIT (opcional)"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nit}
                />

                {/* Dirección — texto libre, obligatorio */}
                <Input
                  label="Dirección *"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.direccion}
                />
              </div>

              {/* ── COLUMNA DERECHA ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Contacto principal — texto libre, obligatorio */}
                <Input
                  label="Contacto principal *"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.contacto}
                />

                {/* Teléfono — solo dígitos (bloqueado), exactamente 10, obligatorio */}
                <Input
                  label="Teléfono * (10 dígitos)"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                />

                {/* Correo — opcional, formato email */}
                <Input
                  label="Correo (opcional)"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correo}
                />
              </div>
            </div>

            {/* ── BOTONES ── */}
            {/* Botones — margen top 24px, gap 3 — igual a SupplierForm */}
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={handleCancelClick}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {isEdit ? "Guardar cambios" : "Crear tercero"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Third_partieForm;
