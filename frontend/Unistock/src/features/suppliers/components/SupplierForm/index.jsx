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
import { validators } from "../../../shared/utils/validators";
import { blockInput } from "../../../shared/utils/blockInput";

/**
 * @param {object}      props
 * @param {object|null} [props.supplier]  — datos del proveedor existente (edición)
 * @param {function}    props.onSubmit
 * @param {function}    props.onCancel
 */
const SupplierForm = ({ supplier, onSubmit, onCancel, allSuppliers = [] }) => {

  const modalRef = useRef(null);

  // ── Verificar si el NIT está bloqueado (el proveedor ya tiene compras) ──
  const nitBloqueado = Boolean(supplier) && (() => {
    try {
      const compras = JSON.parse(localStorage.getItem("app_shoppings") || "[]");
      return compras.some((c) => c.proveedorId === supplier.id || c.proveedorId === String(supplier.id));
    } catch { return false; }
  })();

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
        correoEmpresa:  supplier.correoEmpresa  || supplier.email || "",
        sitioWeb:       supplier.sitioWeb       || supplier.sitioweb || "",
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
  // Campos que deben ser únicos entre proveedores
  const UNIQUE_FIELDS = {
    nit:           (s) => s?.nit,
    correoEmpresa: (s) => s?.correoEmpresa || s?.email,
    telefono:      (s) => s?.telefono,
    nombreEmpresa: (s) => (s?.nombreEmpresa || "").toLowerCase().trim(),
  };

  const isDuplicate = (name, value) => {
    if (!value || typeof value !== "string" || !value.trim()) return false;

    const getter = UNIQUE_FIELDS[name];
    if (!getter) return false;

    const normalized =
      name === "nombreEmpresa" ? value.toLowerCase().trim() : value.trim();

    return allSuppliers.some((s) => {
      // Skip the supplier being edited
      if (supplier && s.id === supplier.id) return false;

      const raw = getter(s);
      // If API returns non-string values, normalize to string safely.
      const existing = raw === null || raw === undefined
        ? ""
        : String(raw).toLowerCase().trim();

      const normalizedExisting = name === "nombreEmpresa"
        ? existing // already lowercased
        : String(raw).toLowerCase().trim();

      // For non-nombreEmpresa fields, compare without forcing lowercase (except we already lowercased).
      // email/nit/telefono are case-insensitive for our purposes.
      return normalizedExisting === (name === "nombreEmpresa" ? normalized : normalized.toLowerCase());
    });
  };


  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombreEmpresa":
        error = validators.required(value);
        if (!error && isDuplicate("nombreEmpresa", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "nit":
        error = validators.required(value) || validators.numbers(value);
        if (!error && (value.length < 8 || value.length > 12))
          error = "Debe tener entre 8 y 12 dígitos";
        if (!error && isDuplicate("nit", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "direccion":
        error = validators.required(value);
        break;
      case "correoEmpresa":
        error = validators.required(value) || validators.email(value);
        if (!error && isDuplicate("correoEmpresa", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "telefono":
        error = validators.required(value) || validators.numbers(value);
        if (!error && value.length !== 10) error = "Debe tener exactamente 10 dígitos";
        if (!error && isDuplicate("telefono", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "nombreContacto":
        error = validators.required(value);
        break;
      case "correoContacto":
        error = value ? validators.email(value) : "";
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

    // Check global uniqueness — if ANY unique field matches an existing supplier, show one error
    const anyDuplicate = ["nombreEmpresa", "nit", "correoEmpresa", "telefono"].some(
      f => isDuplicate(f, formData[f])
    );
    if (anyDuplicate && !Object.values(newErrors).some(e => e === "El proveedor ya se encuentra registrado")) {
      newErrors.nombreEmpresa = "El proveedor ya se encuentra registrado";
    }

    // correoContacto: opcional — solo valida si tiene valor
    if (formData.correoContacto) {
      const emailError = validators.email(formData.correoContacto);
      if (emailError) newErrors.correoContacto = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateAll()){ 
      return;
    }
    try {
      await onSubmit(formData);
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
            width: "100%", maxWidth: "860px",
            padding: "28px 32px",
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

          {/* Título estandarizado: 18px bold — igual al de Third_partiesForm */}
          <h2 style={{ textAlign: "center", marginBottom: "22px", fontSize: 18, fontWeight: 800, color: "#1f2937" }}>
            {supplier ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Gap reducido de 40px→28px para consistencia con otros forms de 2 columnas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>

              {/* ── COLUMNA IZQUIERDA ── */}
              {/* gap entre campos: 16px (antes 18px) — estandarizado con Third_partiesForm */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderRight: "1px solid #e5e7eb", paddingRight: "24px" }}>

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
                <div>
                  <Input
                    label={`NIT * (solo dígitos, 8-12 caracteres)${nitBloqueado ? " 🔒" : ""}`}
                    name="nit"
                    value={formData.nit}
                    onChange={nitBloqueado ? undefined : handleChange}
                    onBlur={nitBloqueado ? undefined : handleBlur}
                    error={errors.nit}
                    disabled={nitBloqueado}
                    style={nitBloqueado ? { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#9ca3af" } : {}}
                  />
                  {nitBloqueado && (
                    <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      ⚠️ El NIT no puede editarse porque este proveedor ya tiene compras asociadas.
                    </p>
                  )}
                </div>

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

              {/* ── COLUMNA DERECHA — mismo gap que columna izquierda ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Nombre contacto — opcional */}
                <Input
                  label="Nombre Contacto *"
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombreContacto}
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
            {/* Botones — margen superior estandarizado 24px */}
            <div className="flex justify-end gap-3 mt-6">
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
