/**
 * @file Third_partiesForm/index.jsx
 * @description Formulario modal para crear o editar un tercero.
 *              Estilo visual alineado con ProductionForm (UniStock design system).
 *
 * FIX: El componente Field fue movido fuera de Third_partieForm para que React
 * no lo desmonte/remonte en cada render (lo que causaba pérdida de foco tras
 * escribir un solo carácter).
 */
import React, { useState, useEffect, useRef } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';
import { validators } from '../../../shared/utils/validators';
import { blockInput } from '../../../shared/utils/blockInput';
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from '../../../shared/utils/validationStyles';

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS LOCALES
// ─────────────────────────────────────────────────────────────────────────────
const getInputStyle = (err) => getInputStyleBox(err);

const sectionTitle = (text) => (
  <p style={{
    fontSize: 11, fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    margin: '18px 0 10px',
  }}>
    {text}
  </p>
);

// ─────────────────────────────────────────────────────────────────────────────
// FIELD — definido fuera del componente para que React no lo desmonte en cada
// render. Recibe formData, errors y handlers como props explícitas.
// ─────────────────────────────────────────────────────────────────────────────
const Field = ({ label, name, type = 'text', required = false, placeholder = '', hint = null, formData, errors, onChange, onBlur }) => (
  <div>
    <label style={labelStyle}>
      {label}
      {required
        ? <span style={requiredStar}> *</span>
        : <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>(opcional)</span>
      }
    </label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete="off"
      style={getInputStyle(errors[name])}
    />
    {errors[name] && <span style={errMsg}>⚠ {errors[name]}</span>}
    {hint && <p style={{ margin: '3px 0 0', fontSize: 10, color: '#9ca3af' }}>{hint}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const Third_partieForm = ({ Third_partie, onSubmit, onCancel }) => {
  const isEdit   = Boolean(Third_partie);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '', nit: '', direccion: '',
    telefono: '', contacto: '', correo: '',
  });
  const [errors,       setErrors]       = useState({});
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({
    open: false, type: 'success', title: '', message: '', onConfirm: null,
  });

  // ── Cargar datos en modo edición ──────────────────────────────────────────
  useEffect(() => {
    if (Third_partie) {
      setFormData({
        nombre:    Third_partie.nombreEmpresa || Third_partie.nombre    || '',
        nit:       Third_partie.nit       || '',
        direccion: Third_partie.direccion || '',
        telefono:  Third_partie.telefono  || '',
        contacto:  Third_partie.nombreContacto || Third_partie.contacto || '',
        correo:    Third_partie.correo    || Third_partie.email || '',
      });
    }
  }, [Third_partie]);

  useEffect(() => {
    if (pendingClose && !alertConfig.open) { setPendingClose(false); onCancel(); }
  }, [alertConfig.open, pendingClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleCancelClick(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  // ── Validación ────────────────────────────────────────────────────────────
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'nombre':    error = validators.required(value); break;
      case 'direccion': error = validators.required(value); break;
      case 'contacto':  error = validators.required(value); break;
      case 'telefono':  error = validators.required(value) || validators.phone(value); break;
      case 'nit':       if (value) error = validators.nit(value); break;
      case 'correo':    if (value) error = validators.email(value); break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono' && !blockInput.onlyNumbers(e)) return;
    if (name === 'nit'      && !blockInput.nit(e))         return;
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const validateAll = () => {
    const required  = ['nombre', 'direccion', 'telefono', 'contacto'];
    const newErrors = {};
    required.forEach(k => {
      const e = validateField(k, formData[k]);
      if (e) newErrors[k] = e;
    });
    if (formData.nit)    { const e = validateField('nit',    formData.nit);    if (e) newErrors.nit    = e; }
    if (formData.correo) { const e = validateField('correo', formData.correo); if (e) newErrors.correo = e; }
    setErrors(newErrors);

    const LABELS = {
      nombre: 'Nombre empresa', direccion: 'Dirección',
      telefono: 'Teléfono', contacto: 'Contacto principal',
      nit: 'NIT', correo: 'Correo',
    };
    const missing = Object.entries(newErrors)
      .filter(([, v]) => v)
      .map(([k]) => LABELS[k] || k);

    if (missing.length > 0) {
      setAlertConfig({
        open: true, type: 'warning',
        title: `Faltan ${missing.length} campo${missing.length > 1 ? 's' : ''} por completar`,
        message: missing.map(m => `• ${m}`).join('\n'),
        onConfirm: null,
      });
      return false;
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      setIsSubmitting(true);
      Promise.resolve(onSubmit({
        nombreEmpresa:  formData.nombre,
        nombre:         formData.nombre,
        nit:            formData.nit,
        direccion:      formData.direccion,
        telefono:       formData.telefono,
        nombreContacto: formData.contacto,
        contacto:       formData.contacto,
        correo:         formData.correo,
        email:          formData.correo,
      })).then(() => {
        setPendingClose(true);
        setAlertConfig({
          open: true, type: 'success',
          title:   isEdit ? 'Tercero actualizado' : 'Tercero creado',
          message: isEdit ? 'El tercero fue actualizado correctamente.' : 'El tercero fue creado correctamente.',
          onConfirm: null,
        });
      }).catch((err) => {
        setAlertConfig({ open: true, type: 'error', title: 'Error al guardar', message: err?.message || 'No se pudo guardar. Intenta de nuevo.', onConfirm: null });
      }).finally(() => {
        setIsSubmitting(false);
      });
    } catch (err) {
      setIsSubmitting(false);
      setAlertConfig({ open: true, type: 'error', title: 'Error al guardar', message: err?.message || 'No se pudo guardar. Intenta de nuevo.', onConfirm: null });
    }
  };

  const handleCancelClick = () => {
    const INITIAL_VALUES = { nombre: '', nit: '', direccion: '', telefono: '', contacto: '', correo: '' };
    const initialData = isEdit
      ? {
          nombre:    Third_partie?.nombreEmpresa || Third_partie?.nombre    || '',
          nit:       Third_partie?.nit       || '',
          direccion: Third_partie?.direccion || '',
          telefono:  Third_partie?.telefono  || '',
          contacto:  Third_partie?.nombreContacto || Third_partie?.contacto || '',
          correo:    Third_partie?.correo    || Third_partie?.email || '',
        }
      : INITIAL_VALUES;

    const hasChanges = Object.keys(formData).some(k => formData[k] !== initialData[k]);
    if (!hasChanges) { onCancel(); return; }

    setAlertConfig({
      open: true, type: 'confirm', title: 'Cancelar',
      message: '¿Seguro que deseas cancelar? Se perderán los cambios.',
      onConfirm: () => { setAlertConfig(prev => ({ ...prev, open: false })); onCancel(); },
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

      {/* ── Overlay ── */}
      <div
        onClick={handleOverlayClick}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 50,
        }}
      >
        <div
          ref={modalRef}
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 660,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            position: 'relative',
          }}
        >
          <div style={{ padding: '28px 30px' }}>

            {/* ── Botón cerrar ── */}
            <button
              onClick={handleCancelClick}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 32, height: 32, borderRadius: '50%',
                border: 'none', background: '#f3f4f6',
                cursor: 'pointer', fontSize: 14, zIndex: 1,
              }}
            >
              ✕
            </button>

            {/* ── Header con ícono ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#ff4fd6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
                  {isEdit ? 'Editar tercero' : 'Nuevo tercero'}
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
                  {isEdit
                    ? `Editando: ${Third_partie?.nombreEmpresa || Third_partie?.nombre || 'tercero'}`
                    : 'Completa todos los campos obligatorios'}
                </p>
              </div>
              {isEdit && Third_partie?.nit && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  color: '#ff4fd6', background: '#fff0fb',
                  padding: '3px 10px', borderRadius: 20,
                  border: '1px solid #f9a8d4', whiteSpace: 'nowrap',
                }}>
                  NIT: {Third_partie.nit}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {sectionTitle('Datos de la empresa')}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14, marginBottom: 14,
              }}>
                <Field label="Nombre empresa" name="nombre" required placeholder="Ej: Confecciones López S.A.S."
                  formData={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
                <Field label="NIT" name="nit" placeholder="Ej: 900123456-7" hint="8-12 dígitos, guión opcional"
                  formData={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
              </div>

              <div style={{ marginBottom: 4 }}>
                <Field label="Dirección" name="direccion" required placeholder="Ej: Carrera 45 #10-30, Medellín"
                  formData={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
              </div>

              {sectionTitle('Persona de contacto')}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14, marginBottom: 14,
              }}>
                <Field label="Contacto principal" name="contacto" required placeholder="Ej: María González"
                  formData={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
                <Field label="Teléfono" name="telefono" required placeholder="Ej: 3001234567" hint="Exactamente 10 dígitos"
                  formData={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Field label="Correo" name="correo" type="email" placeholder="Ej: contacto@empresa.com"
                  formData={formData} errors={errors} onChange={handleChange} onBlur={handleBlur} />
              </div>

              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 10,
                paddingTop: 16, borderTop: '1px solid #f3f4f6',
              }}>
                <Button type="button" variant="secondary" onClick={handleCancelClick} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Guardando...">
                  {isEdit ? 'Guardar cambios' : 'Crear tercero'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Third_partieForm;
