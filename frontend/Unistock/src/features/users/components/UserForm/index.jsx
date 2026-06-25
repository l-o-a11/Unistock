import React, { useState, useCallback, useEffect, useRef } from "react";
import Alert from "../../../shared/components/Alert";
import { validators } from "../../../shared/utils/validators";

/* ── Estilos compartidos ───────────────────────────────────────────────── */
const S = {
  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50,
  },
  modal: {
    background: "#f5f5f5", borderRadius: "16px", width: "100%", maxWidth: "620px",
    padding: "28px 32px 24px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    position: "relative", maxHeight: "90vh", overflowY: "auto",
  },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" },
  iconBox: {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "#FF4FD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  title: { fontSize: "18px", fontWeight: 700, color: "#111", margin: 0 },
  subtitle: { fontSize: "13px", color: "#888", margin: "2px 0 0", },
  closeBtn: {
    position: "absolute", top: "18px", right: "18px",
    background: "none", border: "none", fontSize: "20px", color: "#bbb",
    cursor: "pointer", lineHeight: 1, padding: "2px 6px",
  },
  sectionLabel: {
    fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em",
    textTransform: "uppercase", margin: "20px 0 12px",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" },
  fieldWrap: { display: "flex", flexDirection: "column", marginBottom: "14px" },
  label: { fontSize: "13px", fontWeight: 500, color: "#444", marginBottom: "5px" },
  req: { color: "#FF4FD6", marginLeft: "2px" },
  input: (err) => ({
    background: "#fff", border: `1px solid ${err ? "#FF4FD6" : "#ddd"}`,
    borderRadius: "8px", padding: "9px 12px", fontSize: "13px",
    color: "#333", outline: "none", width: "100%", boxSizing: "border-box",
    transition: "border-color .15s",
  }),
  error: { fontSize: "11px", color: "#FF4FD6", fontWeight: 600, marginTop: "4px" },
  footer: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" },
  btnCancel: {
    padding: "9px 22px", borderRadius: "8px", border: "1px solid #ddd",
    background: "#fff", color: "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer",
  },
  btnSave: (disabled) => ({
    padding: "9px 24px", borderRadius: "8px", border: "none",
    background: disabled ? "#f0c4e8" : "#FF4FD6", color: "#fff",
    fontSize: "13px", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 4px 12px #FF4FD644",
  }),
};

const Field = ({ label, required, error, children }) => (
  <div style={S.fieldWrap}>
    <label style={S.label}>{label}{required && <span style={S.req}>*</span>}</label>
    {children}
    {error && <span style={S.error}>⚠ {error}</span>}
  </div>
);

const StyledInput = ({ error, ...props }) => (
  <input
    style={S.input(error)}
    onFocus={(e) => { e.target.style.borderColor = "#FF4FD6"; e.target.style.boxShadow = "0 0 0 3px #FF4FD618"; }}
    onBlur={(e) => { e.target.style.borderColor = error ? "#FF4FD6" : "#ddd"; e.target.style.boxShadow = "none"; if (props.onBlur) props.onBlur(e); }}
    {...props}
  />
);

const StyledSelect = ({ error, children, ...props }) => (
  <select
    style={{ ...S.input(error), appearance: "auto" }}
    onFocus={(e) => { e.target.style.borderColor = "#FF4FD6"; e.target.style.boxShadow = "0 0 0 3px #FF4FD618"; }}
    onBlur={(e) => { e.target.style.borderColor = error ? "#FF4FD6" : "#ddd"; e.target.style.boxShadow = "none"; if (props.onBlur) props.onBlur(e); }}
    {...props}
  >{children}</select>
);

/* ── Componente principal ──────────────────────────────────────────────── */
const UserForm = ({ user, roles = [], sedes = [], onSubmit, onCancel }) => {
  const modalRef = useRef(null);

  const [formData, setFormData] = useState(() => user ?? {
    documentType: "", documentNumber: "", name: "", email: "", role: "", sede: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, type: "confirm", title: "", message: "", onConfirm: null });

  const closeAlert = useCallback(() => setAlertConfig((p) => ({ ...p, open: false })), []);

  useEffect(() => {
    if (pendingClose && !alertConfig.open) { setPendingClose(false); onCancel(); }
  }, [alertConfig.open, pendingClose, onCancel]);

  const handleCancelClick = useCallback(() => {
    setAlertConfig({
      open: true, type: "confirm", title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => { setAlertConfig((p) => ({ ...p, open: false })); onCancel(); },
    });
  }, [onCancel]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handleCancelClick]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "documentType": error = validators.required(value); break;
      case "documentNumber":
        error = validators.required(value) || validators.numbers(value)
          || (value && value.toString().trim().length < 5 ? "Mínimo 5 dígitos" : "")
          || (value && value.toString().trim().length > 12 ? "Máximo 12 dígitos" : "");
        break;
      case "name":
        error = validators.required(value)
          || (value && value.trim().length < 3 ? "Mínimo 3 caracteres" : "")
          || validators.noNumbers(value);
        break;
      case "email": error = validators.required(value) || validators.email(value); break;
      case "role": error = validators.required(value); break;
      case "sede": error = validators.required(value); break;
    }
    setErrors((p) => ({ ...p, [name]: error }));
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([k, v]) => { const e = validateField(k, v); if (e) newErrors[k] = e; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name] !== undefined) validateField(name, value);
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setAlertConfig({ open: true, type: "warning", title: "Campos incompletos", message: "Corrige los campos marcados antes de continuar.", onConfirm: null });
      return;
    }
    const payload = {
      tipoDocumento: formData.documentType, numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.name, correo: formData.email,
      rolId: formData.role || null, sedeId: formData.sede || null,
    };
    try {
      setSending(true);
      await Promise.resolve(onSubmit(payload));
      setPendingClose(true);
      setAlertConfig({
        open: true, type: "success",
        title: user ? "Usuario actualizado" : "Usuario creado",
        message: user ? "El usuario fue actualizado correctamente."
          : `Usuario creado. Se envió un correo a ${formData.email} con las credenciales de acceso.`,
        onConfirm: null,
      });
    } catch (err) {
      setAlertConfig({
        open: true, type: "error", title: "Error al guardar",
        message: err?.message || err?.data?.message || "No se pudo guardar el usuario. Intenta nuevamente.",
        onConfirm: null,
      });
    } finally { setSending(false); }
  };

  return (
    <>
      <Alert isOpen={alertConfig.open} type={alertConfig.type} title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else closeAlert(); }}
        onCancel={closeAlert} />

      <div style={S.overlay} onClick={handleOverlayClick}>
        <div ref={modalRef} style={S.modal}>
          {/* Header */}
          <div style={S.header}>
            <div style={S.iconBox}>
              <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p style={S.title}>{user ? "Editar usuario" : "Nuevo usuario"}</p>
              <p style={S.subtitle}>Completa todos los campos obligatorios</p>
            </div>
          </div>
          <button style={S.closeBtn} onClick={handleCancelClick}>✕</button>

          <form onSubmit={handleSubmit}>
            {/* Sección documento */}
            <p style={S.sectionLabel}>Datos personales</p>
            <div style={S.grid2}>
              <Field label="Tipo de documento" required error={errors.documentType}>
                <StyledSelect name="documentType" value={formData.documentType} onChange={handleChange} onBlur={handleBlur} error={errors.documentType}>
                  <option value="">Seleccionar tipo</option>
                  <option value="CC">CC</option><option value="TI">TI</option>
                  <option value="CE">CE</option><option value="PEP">PEP</option>
                  <option value="PAS">PAS</option><option value="PPT">PPT</option>
                </StyledSelect>
              </Field>
              <Field label="Número de documento" required error={errors.documentNumber}>
                <StyledInput type="number" name="documentNumber" value={formData.documentNumber}
                  onChange={handleChange} onBlur={handleBlur} error={errors.documentNumber}
                  placeholder="Ej: 1234567890" />
              </Field>
            </div>

            <Field label="Nombre completo" required error={errors.name}>
              <StyledInput name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur}
                error={errors.name} placeholder="Ej: Carlos Ramírez" />
            </Field>

            <Field label="Correo electrónico" required error={errors.email}>
              <StyledInput type="email" name="email" value={formData.email} onChange={handleChange}
                onBlur={handleBlur} error={errors.email} placeholder="Ej: carlos@empresa.com" />
            </Field>

            {/* Sección rol y sede */}
            <p style={S.sectionLabel}>Acceso y ubicación</p>
            <div style={S.grid2}>
              <Field label="Rol" required error={errors.role}>
                <StyledSelect name="role" value={formData.role} onChange={handleChange} onBlur={handleBlur} error={errors.role}>
                  <option value="">Seleccionar rol</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </StyledSelect>
              </Field>
              <Field label="Sede" required error={errors.sede}>
                <StyledSelect name="sede" value={formData.sede} onChange={handleChange} onBlur={handleBlur} error={errors.sede}>
                  <option value="">Seleccionar sede</option>
                  {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </StyledSelect>
              </Field>
            </div>

            <div style={S.footer}>
              <button type="button" style={S.btnCancel} onClick={handleCancelClick}>Cancelar</button>
              <button type="submit" style={S.btnSave(sending)} disabled={sending}>
                {sending ? "Guardando..." : user ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserForm;