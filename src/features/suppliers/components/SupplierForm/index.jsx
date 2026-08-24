/**
 * @file SupplierForm/index.jsx
 * @description Formulario modal para crear o editar un proveedor.
 *              Estilo visual alineado con ProductionForm (UniStock design system).
 *
 * NUEVO: al igual que ProductionForm distingue "Producción" vs "Diseño",
 * este formulario distingue el TIPO DE PROVEEDOR:
 *   - juridica → Empresa (Persona Jurídica): razón social, NIT, sitio web,
 *                sección de "Persona de contacto" separada.
 *   - natural  → Persona Natural: nombre completo, cédula, sin razón social
 *                ni sección de contacto (el proveedor ES el contacto).
 *
 * CAMPOS Y SUS VALIDACIONES:
 *   tipoProveedor  — 'juridica' | 'natural', obligatorio (default: 'juridica')
 *   nombreEmpresa  — texto libre, obligatorio (Razón social / Nombre completo)
 *   nit            — juridica: 8-12 dígitos, opcional guión (ej: 900123456-7)
 *                     natural : 6-10 dígitos (cédula), sin guión
 *   direccion      — texto libre, obligatorio
 *   correoEmpresa  — formato email, obligatorio (juridica y natural)
 *   sitioWeb       — texto libre, opcional (solo juridica)
 *   nombreContacto — texto libre, obligatorio (solo juridica)
 *   telefono       — solo dígitos, exactamente 10, obligatorio
 *   correoContacto — formato email, opcional (solo juridica)
 *
 * PROPS:
 *   supplier     {object|null}  — proveedor a editar; null para crear nuevo
 *   onSubmit     {function}     — recibe los datos del formulario
 *   onCancel     {function}     — cierra el modal sin guardar
 *   allSuppliers {array}        — lista completa para validación de duplicados
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import { validators } from "../../../shared/utils/validators";
import { blockInput } from "../../../shared/utils/blockInput";
import { get } from "../../../shared/utils/httpClient";
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from "../../../shared/utils/validationStyles";

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS LOCALES (alineados con ProductionForm)
// ─────────────────────────────────────────────────────────────────────────────
const getInputStyle = (err) => getInputStyleBox(err);

/** Título de sección — uppercase pequeño gris, igual que ProductionForm */
const sectionTitle = (text) => (
  <p style={{
    fontSize: 11, fontWeight: 700, color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.06em",
    margin: "18px 0 10px",
  }}>
    {text}
  </p>
);

/** Caja de selección de tipo — mismo patrón visual que typeBox en ProductionForm */
const tipoBox = (active) => ({
  flex: 1, border: active ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb",
  borderRadius: 12, padding: 14, cursor: "pointer",
  background: active ? "#fff0fb" : "#fafafa", transition: "all 0.15s",
});

// ─────────────────────────────────────────────────────────────────────────────
// FIELD — componente de campo genérico (definido FUERA para evitar remount)
// ─────────────────────────────────────────────────────────────────────────────
const Field = React.memo(({
  label, name, type = "text", required = false,
  disabled = false, hint = null, placeholder = "",
  value, onChange, onBlur, error,
}) => {
  const inputStyle = useMemo(() => getInputStyle(error), [error]);
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required
          ? <span style={requiredStar}> *</span>
          : <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>(opcional)</span>
        }
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={disabled ? undefined : onChange}
        onBlur={disabled ? undefined : onBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          ...inputStyle,
          ...(disabled ? { background: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" } : {}),
        }}
      />
      {error && <span style={errMsg}>⚠ {error}</span>}
      {hint && <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af" }}>{hint}</p>}
    </div>
  );
});

Field.displayName = "Field";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const SupplierForm = ({ supplier, onSubmit, onCancel, allSuppliers = [] }) => {
  const modalRef = useRef(null);
  const initializedRef = useRef(false);

  // ── Tipo de proveedor: 'juridica' (empresa) | 'natural' (persona natural) ─
  const [tipoProveedor, setTipoProveedor] = useState(supplier?.tipoProveedor || "juridica");
  const esJuridica = tipoProveedor === "juridica";

  // ── NIT/Cédula bloqueado si ya tiene compras ─────────────────────────────
  const [nitBloqueado, setNitBloqueado] = useState(false);
  useEffect(() => {
    if (!supplier?.id) { setNitBloqueado(false); return; }
    let cancelled = false;
    get(`/suppliers/${supplier.id}/has-purchases`)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        setNitBloqueado(Boolean(data?.hasPurchases));
      })
      .catch(() => { if (!cancelled) setNitBloqueado(false); });
    return () => { cancelled = true; };
  }, [supplier?.id]);

  // ── Estado del formulario ─────────────────────────────────────────────────
  const buildInitialFormData = (s) => {
    if (s) {
      return {
        nombreEmpresa:  s.nombreEmpresa  || "",
        nit:            s.nit            || "",
        tipoDocumento:  s.tipoDocumento  || (s.tipoProveedor === "natural" ? "Cédula de ciudadanía" : "NIT"),
        direccion:      s.direccion      || "",
        correoEmpresa:  s.correoEmpresa  || s.email || "",
        sitioWeb:       s.sitioWeb       || s.sitioweb || "",
        nombreContacto: s.nombreContacto || "",
        telefono:       s.telefono != null ? String(s.telefono) : "",
        telefonoContacto:   s.telefonoContacto   || "",
        correoContacto: s.correoContacto || "",
      };
    }
    return {
      nombreEmpresa:  "",
      nit:            "",
      tipoDocumento:  "NIT",
      direccion:      "",
      correoEmpresa:  "",
      sitioWeb:       "",
      nombreContacto: "",
      telefono:       "",
      telefonoContacto:   "",
      correoContacto: "",
    };
  };

  const [formData, setFormData] = useState(() => buildInitialFormData(supplier));

  const [errors,       setErrors]       = useState({});
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({
    open: false, type: "confirm", title: "", message: "", onConfirm: null,
  });

  // ── Cargar datos en modo edición (solo cuando cambia el proveedor) ────────
  useEffect(() => {
    if (supplier?.id && supplier.id !== initializedRef.current) {
      initializedRef.current = supplier.id;
      setTipoProveedor(supplier.tipoProveedor || "juridica");
      setFormData(buildInitialFormData(supplier));
    }
    if (!supplier) {
      initializedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier]);

  // Cierra el modal cuando el Alert de éxito se cierra
  useEffect(() => {
    if (pendingClose && !alertConfig.open) {
      setPendingClose(false);
      onCancel();
    }
  }, [alertConfig.open, pendingClose, onCancel]);

  // ── Cambiar de tipo solo actualiza el tipo y limpia campos exclusivos ──────
  const handleTipoChange = useCallback((nuevoTipo) => {
    if (nuevoTipo === tipoProveedor) return;
    setTipoProveedor(nuevoTipo);
    setErrors({});
    if (nuevoTipo === "natural") {
      setFormData((prev) => ({
        ...prev,
        tipoDocumento: "Cédula de ciudadanía",
        sitioWeb: "",
        nombreContacto: "",
        telefonoContacto: "",
        correoContacto: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, tipoDocumento: "NIT" }));
    }
  }, [tipoProveedor]);

  const isFormBlank = useCallback(() => {
    const allEmpty = !formData.nombreEmpresa && !formData.nit && !formData.direccion
      && !formData.correoEmpresa && !formData.sitioWeb && !formData.nombreContacto
      && !formData.telefono && !formData.telefonoContacto && !formData.correoContacto;
    if (supplier) {
      const initial = buildInitialFormData(supplier);
      const unchanged = Object.keys(initial).every((key) => formData[key] === initial[key]);
      return unchanged;
    }
    return allEmpty;
  }, [formData, supplier]);

  const handleCancelClick = useCallback(() => {
    if (isFormBlank()) { onCancel(); return; }
    setAlertConfig({
      open: true, type: "confirm",
      title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, open: false }));
        onCancel();
      },
    });
  }, [onCancel, isFormBlank]);

  // ESC cierra el modal
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCancelClick]);

  const handleOverlayClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  }, [handleCancelClick]);

  // ── Validación de duplicados ──────────────────────────────────────────────
  const UNIQUE_FIELDS = useMemo(() => ({
    nit:           (s) => s?.nit,
    correoEmpresa: (s) => s?.correoEmpresa || s?.email,
    telefono:      (s) => s?.telefono,
    nombreEmpresa: (s) => (s?.nombreEmpresa || "").toLowerCase().trim(),
  }), []);

  const isDuplicate = useCallback((name, value) => {
    if (!value || !String(value).trim()) return false;
    const getter = UNIQUE_FIELDS[name];
    if (!getter) return false;
    const normalized = name === "nombreEmpresa"
      ? String(value).toLowerCase().trim()
      : String(value).trim();
    return allSuppliers.some((s) => {
      if (supplier && s.id === supplier.id) return false;
      const existing = name === "nombreEmpresa"
        ? String(getter(s) || "").toLowerCase().trim()
        : String(getter(s) || "").trim();
      return existing === normalized;
    });
  }, [allSuppliers, supplier, UNIQUE_FIELDS]);

  // ── Validación individual (depende del tipo de proveedor) ─────────────────
  const validateField = useCallback((name, value) => {
    let error = "";
    switch (name) {
      case "nombreEmpresa":
        error = validators.required(value);
        if (!error && isDuplicate("nombreEmpresa", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "nit":
        if (esJuridica) {
          error = validators.required(value) || validators.nit(value);
        } else {
          error = validators.required(value) || validators.numbers(value);
          if (!error && (String(value).trim().length < 6 || String(value).trim().length > 10)) {
            error = "La cédula debe tener entre 6 y 10 dígitos";
          }
        }
        if (!error && isDuplicate("nit", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "tipoDocumento":
        error = validators.required(value);
        break;
      case "direccion":
        error = validators.required(value);
        break;
      case "correoEmpresa":
        // Obligatorio tanto para persona jurídica como para persona natural.
        error = validators.required(value) || validators.email(value);
        if (!error && isDuplicate("correoEmpresa", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "telefono":
        error = validators.required(value) || validators.numbers(value);
        if (!error && String(value).trim().length !== 10)
          error = "Debe tener exactamente 10 dígitos";
        if (!error && isDuplicate("telefono", value))
          error = "El proveedor ya se encuentra registrado";
        break;
      case "nombreContacto":
        if (esJuridica) error = validators.required(value);
        break;
      case "telefonoContacto":
        if (esJuridica && value) error = validators.telefono(value);
        break;
      case "correoContacto":
        error = value ? validators.email(value) : "";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  }, [isDuplicate, esJuridica]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "telefono") { if (!blockInput.onlyNumbers(e)) return; }
    else if (name === "nit") {
      // Persona jurídica permite guión (NIT); persona natural solo dígitos (cédula)
      if (esJuridica) { if (!blockInput.nit(e)) return; }
      else { if (!blockInput.onlyNumbers(e)) return; }
    }
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [errors, esJuridica]);

  const handleBlur = useCallback((e) => validateField(e.target.name, e.target.value), [validateField]);

  // ── Validación completa ───────────────────────────────────────────────────
  const validateAll = useCallback(() => {
    const required = esJuridica
      ? ["tipoDocumento", "nit", "nombreEmpresa", "direccion", "correoEmpresa", "telefono", "nombreContacto"]
      : ["tipoDocumento", "nit", "nombreEmpresa", "direccion", "correoEmpresa", "telefono"];

    let newErrors = {};
    required.forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    const dupFields = esJuridica
      ? ["nombreEmpresa", "nit", "correoEmpresa", "telefono"]
      : ["nombreEmpresa", "nit", "correoEmpresa", "telefono"];
    const anyDuplicate = dupFields.some((f) => isDuplicate(f, formData[f]));
    if (anyDuplicate && !Object.values(newErrors).some((e) => e === "El proveedor ya se encuentra registrado")) {
      newErrors.nombreEmpresa = "El proveedor ya se encuentra registrado";
    }

    if (esJuridica && formData.correoContacto) {
      const emailErr = validators.email(formData.correoContacto);
      if (emailErr) newErrors.correoContacto = emailErr;
    }
    setErrors(newErrors);

    const LABELS = esJuridica
      ? {
          tipoDocumento:  "Tipo de documento",
          nit:            "NIT",
          nombreEmpresa:  "Nombre de empresa",
          direccion:      "Dirección",
          correoEmpresa:  "Correo empresa",
          telefono:       "Teléfono",
          nombreContacto: "Nombre de contacto",
          telefonoContacto: "Teléfono del contacto",
          correoContacto: "Correo de contacto",
        }
      : {
          tipoDocumento:  "Tipo de documento",
          nit:            "Cédula",
          nombreEmpresa:  "Nombre completo",
          direccion:      "Dirección",
          correoEmpresa:  "Correo",
          telefono:       "Teléfono",
        };
    const missing = Object.entries(newErrors)
      .filter(([, v]) => v)
      .map(([k]) => LABELS[k] || k);

    if (missing.length > 0) {
      setAlertConfig({
        open: true, type: "warning",
        title: `Faltan ${missing.length} campo${missing.length > 1 ? "s" : ""} por completar`,
        message: missing.map((m) => `• ${m}`).join("\n"),
        onConfirm: null,
      });
      return false;
    }
    return true;
  }, [formData, validateField, isDuplicate, esJuridica]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      setIsSubmitting(true);
      // Para persona natural, el contacto ES el proveedor: se replican los
      // datos para no romper integraciones que esperen nombreContacto/correoContacto.
      const payload = {
        ...formData,
        tipoProveedor,
        nombreContacto: esJuridica ? formData.nombreContacto : formData.nombreEmpresa,
        correoContacto: esJuridica ? formData.correoContacto : formData.correoEmpresa,
        telefonoContacto: esJuridica ? formData.telefonoContacto : formData.telefono,
      };
      await onSubmit(payload);
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
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, supplier, validateAll, tipoProveedor, esJuridica]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PRINCIPAL
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
          else setAlertConfig((prev) => ({ ...prev, open: false }));
        }}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
      />

      {/* ── Overlay ── */}
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
            borderRadius: 16,
            width: "100%",
            maxWidth: 700,
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            position: "relative",
          }}
          className="roles-modal-scroll"
        >
          <div style={{ padding: "28px 30px" }}>

            {/* ── Botón cerrar ── */}
            <button
              onClick={handleCancelClick}
              style={{
                position: "absolute", top: 14, right: 14,
                width: 32, height: 32, borderRadius: "50%",
                border: "none", background: "#f3f4f6",
                cursor: "pointer", fontSize: 14, zIndex: 1,
              }}
            >
              ✕
            </button>

            {/* ── Header con ícono — mismo patrón que ProductionForm ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "#ff4fd6",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {esJuridica ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                    <line x1="12" y1="12" x2="12" y2="16"/>
                    <line x1="8"  y1="12" x2="8"  y2="12.01"/>
                    <line x1="16" y1="12" x2="16" y2="12.01"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1f2937" }}>
                  {supplier ? "Editar proveedor" : "Nuevo proveedor"}
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                  {supplier
                    ? `Editando: ${supplier.nombreEmpresa || "proveedor"}`
                    : "Completa todos los campos obligatorios"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* ══════════════════════════════════════════════════
                  SECCIÓN 0 — TIPO DE PROVEEDOR
              ══════════════════════════════════════════════════ */}
              {sectionTitle("Tipo de proveedor")}
              <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                {[
                  ["juridica", "Empresa", "Persona jurídica — razón social y NIT"],
                  ["natural",  "Persona natural", "Proveedor independiente — cédula"],
                ].map(([val, label, desc]) => (
                  <div
                    key={val}
                    style={tipoBox(tipoProveedor === val)}
                    onClick={() => handleTipoChange(val)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: `2px solid ${tipoProveedor === val ? "#ff4fd6" : "#d1d5db"}`,
                        background: tipoProveedor === val ? "#ff4fd6" : "transparent",
                        flexShrink: 0,
                      }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{label}</span>
                    </div>
                    <small style={{ fontSize: 11, color: "#9ca3af", display: "block", paddingLeft: 24 }}>{desc}</small>
                  </div>
                ))}
              </div>

              {/* ══════════════════════════════════════════════════
                  SECCIÓN 1 — DATOS DEL PROVEEDOR
              ══════════════════════════════════════════════════ */}
              {sectionTitle(esJuridica ? "Datos de la empresa" : "Datos de la persona")}

              {/* Fila 1: Tipo de documento + NIT/Cédula + Nombre/Razón social */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14, marginBottom: 14,
              }}>
                {/* Tipo de documento + NIT/Cédula */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Tipo de documento</label>
                    <select
                      name="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={esJuridica}
                      style={{
                        ...getInputStyle(errors.tipoDocumento),
                        padding: "9px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: esJuridica ? "#f3f4f6" : "#fff",
                        fontSize: 13,
                        color: "#1f2937",
                        width: "100%",
                        cursor: esJuridica ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="NIT">NIT</option>
                      <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                      <option value="Cédula de extranjería">Cédula de extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {esJuridica && (
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af" }}>
                        Para empresas, el tipo de documento es NIT.
                      </p>
                    )}
                  </div>

                  {/* NIT/Cédula — tiene lógica especial de bloqueo */}
                  <div>
                    <label style={labelStyle}>
                      {esJuridica ? "NIT" : "Cédula de ciudadanía"} <span style={requiredStar}>*</span>
                      {nitBloqueado && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: "#d97706",
                          background: "#fef3c7", padding: "2px 7px",
                          borderRadius: 8, marginLeft: 6,
                        }}>
                          🔒 Bloqueado
                        </span>
                      )}
                    </label>
                    <input
                      type="text" name="nit"
                      value={formData.nit}
                      onChange={nitBloqueado ? undefined : handleChange}
                      onBlur={nitBloqueado ? undefined : handleBlur}
                      disabled={nitBloqueado}
                      placeholder={esJuridica ? "Ej: 900123456-7" : "Ej: 1035421789"}
                      autoComplete="off"
                      style={{
                        ...getInputStyle(errors.nit),
                        ...(nitBloqueado
                          ? { background: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" }
                          : {}),
                      }}
                    />
                    {errors.nit && <span style={errMsg}>⚠ {errors.nit}</span>}
                    {nitBloqueado && (
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "#d97706" }}>
                        No editable: este proveedor ya tiene compras asociadas.
                      </p>
                    )}
                  </div>
                </div>

                {/* Nombre/Razón social */}
                <Field
                  label={esJuridica ? "Nombre de empresa" : "Nombre completo"}
                  name="nombreEmpresa"
                  required
                  placeholder={esJuridica ? "Ej: Textiles S.A.S." : "Ej: María Fernanda Gómez"}
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombreEmpresa}
                />
              </div>

              {/* Fila 2: Correo + Teléfono */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14, marginBottom: 14,
              }}>
                <Field
                  label={esJuridica ? "Correo empresa" : "Correo"}
                  name="correoEmpresa"
                  type="email"
                  required
                  placeholder={esJuridica ? "Ej: ventas@empresa.com" : "Ej: maria.gomez@correo.com"}
                  value={formData.correoEmpresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoEmpresa}
                />
                <Field
                  label="Teléfono" name="telefono"
                  required placeholder="Ej: 3001234567"
                  hint="Exactamente 10 dígitos, sin espacios ni guiones"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                />
              </div>

              {/* Fila 3: Dirección (ancho completo) */}
              <div style={{ marginBottom: 14 }}>
                <Field
                  label="Dirección" name="direccion"
                  required placeholder="Ej: Calle 50 #30-20, Medellín"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.direccion}
                />
              </div>

              {/* Fila 4: Sitio web — solo persona jurídica */}
              {esJuridica && (
                <div style={{ marginBottom: 4 }}>
                  <Field
                    label="Sitio web" name="sitioWeb"
                    placeholder="Ej: www.empresa.com"
                    value={formData.sitioWeb}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.sitioWeb}
                  />
                </div>
              )}

              {/* ══════════════════════════════════════════════════
                  SECCIÓN 2 — PERSONA DE CONTACTO (solo persona jurídica;
                  en persona natural el proveedor mismo es el contacto)
              ══════════════════════════════════════════════════ */}
              {esJuridica && (
                <>
                  {sectionTitle("Persona de contacto")}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 14, marginBottom: 14,
                  }}>
                    <Field
                      label="Nombre del contacto" name="nombreContacto"
                      required placeholder="Ej: Carlos Ramírez"
                      value={formData.nombreContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.nombreContacto}
                    />
                    <Field
                      label="Teléfono del contacto" name="telefonoContacto"
                      placeholder="Ej: 3001234567"
                      hint="Solo números"
                      value={formData.telefonoContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.telefonoContacto}
                    />
                    <Field
                      label="Correo del contacto" name="correoContacto"
                      type="email" placeholder="Ej: carlos@empresa.com"
                      value={formData.correoContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.correoContacto}
                    />
                  </div>
                </>
              )}

              {!esJuridica && (
                <div style={{
                  background: "#fdf4ff", border: "1px dashed #ff4fd6",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                  fontSize: 11, color: "#ff4fd6",
                }}>
                   Como persona natural, el correo y teléfono ingresados arriba se usarán también como datos de contacto.
                </div>
              )}

              {/* ── Botones ── */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                paddingTop: 16, borderTop: "1px solid #f3f4f6",
              }}>
                <Button type="button" variant="secondary" onClick={handleCancelClick} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Guardando...">
                  {supplier ? "Guardar cambios" : "Guardar proveedor"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>

    </>
  );
};

export default SupplierForm;
