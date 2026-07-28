import React, { useState } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';

import { MODULOS_PREDETERMINADOS, PRIVILEGIOS_PREDETERMINADOS } from "../../services/RolesAPI";

// ─────────────────────────────────────────────────
// Validaciones
// ─────────────────────────────────────────────────
const validators = {
  required: (v) => (!v || !v.toString().trim() ? 'Este campo es obligatorio' : ''),
  minLength: (min) => (v) =>
    v && v.trim().length < min ? `Mínimo ${min} caracteres` : '',
  maxLength: (max) => (v) =>
    v && v.trim().length > max ? `Máximo ${max} caracteres` : '',
  noNumbers: (v) =>
    /\d/.test(v) ? 'No debe contener números' : '',
};

// ─────────────────────────────────────────────────
// Tokens de estilo
// ─────────────────────────────────────────────────
const PINK        = '#ff4fd6';
const PINK_LIGHT  = '#fff0fb';
const PINK_BORDER = '#f9a8d4';

// Input igual al ProductionForm: fondo blanco, borde gris, border-radius 10
const fieldStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  border: `2px solid ${hasError ? PINK : '#e5e7eb'}`,
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: '#ffffff',
  resize: 'vertical',
  fontFamily: 'inherit',
  color: '#1f2937',
});

// Label: sentence case (primera mayúscula, resto normal), igual a ProductionForm
const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '5px',
};

const errorStyle = {
  color: PINK,
  fontSize: '11px',
  marginTop: '4px',
  display: 'block',
  fontWeight: '500',
};

// Título de sección — UPPERCASE pequeño, igual a ProductionForm
const sectionTitle = (text) => (
  <p style={{
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: '20px 0 10px',
  }}>
    {text}
  </p>
);

const req = <span style={{ color: PINK }}> *</span>;

// Handlers de focus/blur sin cambiar el fondo (fondo siempre blanco)
const onFocusField = (e) => {
  e.target.style.borderColor = PINK;
  e.target.style.boxShadow = '0 0 0 3px rgba(255,79,214,0.1)';
};
const onBlurField = (e) => {
  e.target.style.borderColor = '#e5e7eb';
  e.target.style.boxShadow = 'none';
};

// ─────────────────────────────────────────────────
// RolForm
// ─────────────────────────────────────────────────
const RolForm = ({ rol, onSubmit, onCancel, usuariosEnlazados = 0 }) => {
  const initialFormData = {
    nombre: rol?.nombre || '',
    descripcion: rol?.descripcion || '',
    modulos: rol?.modulos || [],
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [privilegiosSeleccionados, setPrivilegiosSeleccionados] = useState([]);

  const [alertConfig, setAlertConfig] = useState({
    open: false, type: 'success', title: '', message: '', onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm) =>
    setAlertConfig({ open: true, type, title, message, onConfirm: onConfirm || closeAlert });

  const getModuloNombre = (id) =>
    MODULOS_PREDETERMINADOS.find((m) => m.id === id)?.nombre || 'Módulo desconocido';

  // ── Validación ────────────────────────────────────
  const validateField = (name, value) => {
    let error = '';
    if (name === 'nombre') {
      error =
        validators.required(value) ||
        validators.noNumbers(value) ||
        validators.minLength(3)(value) ||
        validators.maxLength(50)(value);
    }
    if (name === 'descripcion' && value) {
      error = validators.maxLength(200)(value);
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateAll = () => {
    const nameError = validateField('nombre', formData.nombre);
    const descError = validateField('descripcion', formData.descripcion);
    let modulosError = '';
    if (formData.modulos.length === 0) {
      modulosError = 'Debes agregar al menos un módulo con sus privilegios';
      setErrors((prev) => ({ ...prev, modulos: modulosError }));
    } else {
      setErrors((prev) => ({ ...prev, modulos: '' }));
    }
    return !nameError && !descError && !modulosError;
  };

  // ── Handlers ──────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleModuloChange = (e) => {
    setModuloSeleccionado(e.target.value);
    setPrivilegiosSeleccionados([]);
  };

  const handlePrivilegioToggle = (id) => {
    setPrivilegiosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAgregarModulo = () => {
    if (!moduloSeleccionado) {
      showAlert('warning', 'Campo requerido', 'Debes seleccionar un módulo antes de agregarlo.');
      return;
    }
    if (privilegiosSeleccionados.length === 0) {
      showAlert('warning', 'Campo requerido', 'Debes seleccionar al menos un privilegio para el módulo.');
      return;
    }
    const yaExiste = formData.modulos.find((m) => m.moduloId === parseInt(moduloSeleccionado));
    if (yaExiste) {
      showAlert('warning', 'Módulo duplicado', 'Este módulo ya está agregado al rol. Edita sus privilegios directamente en la lista.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      modulos: [
        ...prev.modulos,
        { moduloId: parseInt(moduloSeleccionado), privilegios: privilegiosSeleccionados },
      ],
    }));
    setErrors((prev) => ({ ...prev, modulos: '' }));
    setModuloSeleccionado('');
    setPrivilegiosSeleccionados([]);
  };

  const handleTogglePrivilegioModulo = (moduloIndex, privilegioId) => {
    const nuevosModulos = formData.modulos.map((m, i) => {
      if (i !== moduloIndex) return m;
      const yaIncluye = m.privilegios.includes(privilegioId);
      return {
        ...m,
        privilegios: yaIncluye
          ? m.privilegios.filter((p) => p !== privilegioId)
          : [...m.privilegios, privilegioId],
      };
    }).filter((m) => m.privilegios.length > 0);
    setFormData((prev) => ({ ...prev, modulos: nuevosModulos }));
  };

  const handleEliminarModulo = (moduloIndex) => {
    showAlert(
      'confirm',
      'Eliminar módulo',
      `¿Eliminar el módulo "${getModuloNombre(formData.modulos[moduloIndex].moduloId)}" del rol?`,
      () => {
        setFormData((prev) => ({
          ...prev,
          modulos: prev.modulos.filter((_, i) => i !== moduloIndex),
        }));
        closeAlert();
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateAll();
    if (!isValid) {
      showAlert('warning', 'Campos incompletos', 'Corrige los campos marcados antes de guardar.');
      return;
    }
    const dataNormalizada = {
      ...formData,
      nombre: formData.nombre.trim()
        ? formData.nombre.trim().charAt(0).toUpperCase() + formData.nombre.trim().slice(1).toLowerCase()
        : formData.nombre,
    };
    onSubmit(dataNormalizada);
  };

  const handleCancel = () => {
    const hasChanges = Object.keys(initialFormData).some((key) => {
      const currentValue = formData[key];
      const initialValue = initialFormData[key];

      if (Array.isArray(currentValue) || Array.isArray(initialValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
      }

      return String(currentValue ?? '').trim() !== String(initialValue ?? '').trim();
    });

    if (!hasChanges) {
      onCancel?.();
      return;
    }

    showAlert('confirm', '¿Cancelar?', 'Los cambios realizados se perderán.', () => {
      closeAlert();
      onCancel?.();
    });
  };

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { alertConfig.onConfirm?.(); }}
        onCancel={closeAlert}
      />

      <form onSubmit={handleSubmit} noValidate>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: PINK,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
              {rol ? 'Editar rol' : 'Crear nuevo rol'}
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
              {rol
                ? `Editando rol · ${usuariosEnlazados} usuario${usuariosEnlazados !== 1 ? 's' : ''} vinculado${usuariosEnlazados !== 1 ? 's' : ''}`
                : 'Completa todos los campos obligatorios'}
            </p>
          </div>
        </div>

        {/* SECCIÓN: INFO BÁSICA */}
        {sectionTitle('Información del rol')}

        {/* NOMBRE */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="nombre" style={labelStyle}>
            Nombre del rol{req}
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={(e) => { handleBlur(e); onBlurField(e); }}
            style={fieldStyle(!!errors.nombre)}
            placeholder="Ej: Administrador de bodega"
            onFocus={onFocusField}
          />
          {errors.nombre && <span style={errorStyle}>⚠ {errors.nombre}</span>}
        </div>

        {/* DESCRIPCIÓN */}
        <div style={{ marginBottom: 5 }}>
          <label htmlFor="descripcion" style={labelStyle}>
            Descripción
            <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 6, fontSize: 11 }}>
              (opcional · máx. 200 caracteres)
            </span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            onBlur={(e) => { handleBlur(e); onBlurField(e); }}
            rows={3}
            placeholder="Describe las responsabilidades de este rol..."
            style={fieldStyle(!!errors.descripcion)}
            onFocus={onFocusField}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {errors.descripcion
              ? <span style={errorStyle}>⚠ {errors.descripcion}</span>
              : <span />
            }
            <span style={{ fontSize: 11, color: formData.descripcion.length > 180 ? PINK : '#9ca3af' }}>
              {formData.descripcion.length}/200
            </span>
          </div>
        </div>

        {/* MÓDULOS ASIGNADOS */}
        {formData.modulos.length > 0 && (
          <>
            {sectionTitle(`Módulos asignados (${formData.modulos.length})`)}
            <div style={{ marginBottom: 5 }}>
              {formData.modulos.map((modulo, index) => (
                <div
                  key={index}
                  style={{
                    background: '#fff8fe',
                    border: `1px solid ${PINK_BORDER}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 8,
                    position: 'relative',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 7, left: 14,
                    fontSize: 10, color: PINK, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    Módulo #{index + 1}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
                    <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1f2937' }}>
                      {getModuloNombre(modulo.moduloId)}
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleEliminarModulo(index)}
                      style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: PINK_LIGHT, border: `1px solid ${PINK}`,
                        color: PINK, cursor: 'pointer', fontSize: 15,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, lineHeight: 1,
                      }}
                      title="Eliminar módulo"
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PRIVILEGIOS_PREDETERMINADOS.map((priv) => {
                      const checked = modulo.privilegios.includes(priv.id);
                      return (
                        <label
                          key={priv.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            cursor: 'pointer', fontSize: 13,
                            padding: '4px 10px', borderRadius: 20,
                            border: `2px solid ${checked ? PINK : '#e5e7eb'}`,
                            background: checked ? PINK_LIGHT : '#fff',
                            color: checked ? PINK : '#6b7280',
                            fontWeight: checked ? 600 : 400,
                            transition: 'all 0.15s', userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePrivilegioModulo(index, priv.id)}
                            style={{ display: 'none' }}
                          />
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {priv.nombre}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ERROR MÓDULOS */}
        {errors.modulos && (
          <span style={{ ...errorStyle, marginBottom: 12, display: 'block' }}>⚠ {errors.modulos}</span>
        )}

        {/* AGREGAR MÓDULO */}
        {sectionTitle('Agregar módulo')}
        <div style={{
          marginBottom: 10,
          background: '#fafafa',
          border: `1.5px dashed ${PINK_BORDER}`,
          borderRadius: 12,
          padding: 16,
        }}>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Módulo{req}</label>
            <select
              value={moduloSeleccionado}
              onChange={handleModuloChange}
              style={{ ...fieldStyle(false), cursor: 'pointer' }}
              onFocus={onFocusField}
              onBlur={onBlurField}
            >
              <option value="">Seleccionar módulo...</option>
              {MODULOS_PREDETERMINADOS.filter(
                (m) => !formData.modulos.find((fm) => fm.moduloId === m.id)
              ).map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Privilegios{req}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {PRIVILEGIOS_PREDETERMINADOS.map((priv) => {
                const checked = privilegiosSeleccionados.includes(priv.id);
                return (
                  <label
                    key={priv.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      cursor: 'pointer', fontSize: 13,
                      padding: '5px 12px', borderRadius: 20,
                      border: `1.5px solid ${checked ? PINK : '#e5e7eb'}`,
                      background: checked ? PINK_LIGHT : '#ffffff',
                      color: checked ? PINK : '#6b7280',
                      fontWeight: checked ? 600 : 400,
                      transition: 'all 0.15s', userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handlePrivilegioToggle(priv.id)}
                      style={{ display: 'none' }}
                    />
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {priv.nombre}
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAgregarModulo}
            style={{
              background: 'none',
              border: `1.5px dashed ${PINK}`,
              borderRadius: 8,
              color: PINK, cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              padding: '8px 14px', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = PINK_LIGHT; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar módulo a este rol
          </button>
        </div>

        {/* BOTONES */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          paddingTop: 16, borderTop: '1px solid #f3f4f6',
        }}>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {rol ? 'Guardar cambios' : 'Crear rol'}
          </Button>
        </div>

      </form>
    </>
  );
};

export default RolForm;