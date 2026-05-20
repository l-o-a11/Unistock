import React, { useState } from 'react';
import Alert from '../../../shared/components/Alert';

// ─────────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────────
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
// Estilos
// ─────────────────────────────────────────────────
const fieldStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${hasError ? '#E91E8C' : '#d1d5db'}`,
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background-color 0.2s',
  backgroundColor: 'white',
  resize: 'vertical',
  fontFamily: 'inherit',
});

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#555',
  marginBottom: '6px',
};

const errorStyle = {
  color: '#E91E8C',
  fontWeight: 'bold',
  fontSize: '11px',
  marginTop: '4px',
  display: 'block',
};
const req  = <span style={{ color: "#FF4FD6" }}> *</span>;

// ─────────────────────────────────────────────────
// RolForm
// ─────────────────────────────────────────────────
const RolForm = ({ rol, onSubmit, onCancel, usuariosEnlazados = 0 }) => {
  const [formData, setFormData] = useState({
    nombre: rol?.nombre || '',
    descripcion: rol?.descripcion || '',
    modulos: rol?.modulos || [],
  });

  const [errors, setErrors] = useState({});
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [privilegiosSeleccionados, setPrivilegiosSeleccionados] = useState([]);

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
  });

  // ── Helpers ──────────────────────────────────────
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm) =>
    setAlertConfig({ open: true, type, title, message, onConfirm: onConfirm || closeAlert });

  const getModuloNombre = (id) =>
    MODULOS_PREDETERMINADOS.find((m) => m.id === id)?.nombre || 'Módulo desconocido';

  // ── Validación de campo individual ───────────────
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

  // ── Validación completa del form ─────────────────
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

  // ── Handlers de campos ───────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // ── Módulo selector ──────────────────────────────
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

    const yaExiste = formData.modulos.find(
      (m) => m.moduloId === parseInt(moduloSeleccionado)
    );
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

  // ── Submit ───────────────────────────────────────
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

  // ── Cancelar ─────────────────────────────────────
  const handleCancel = () => {
    showAlert('confirm', '¿Cancelar?', '¿Seguro que deseas cancelar? Los cambios no guardados se perderán.', () => {
      closeAlert();
      onCancel?.();
    });
  };

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* TÍTULO */}
        <h1 className="text-xl font-semibold mb-6">
          {rol ? 'Editar rol' : 'Crear nuevo rol'}
        </h1>

        {/* NOMBRE */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="nombre" style={labelStyle}>
            Nombre del rol{req}
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            style={fieldStyle(!!errors.nombre)}
            onFocus={(e) => {
              e.target.style.borderColor = '#e91e8c';
              e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)';
            }}
          />
          {errors.nombre && <span style={errorStyle}>{errors.nombre}</span>}
        </div>

        {/* DESCRIPCIÓN */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="descripcion" style={labelStyle}>
            Descripción
            <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '6px', fontSize: '12px' }}>
              (máx. 200 caracteres)
            </span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            onBlur={handleBlur}
            rows="3"
            style={fieldStyle(!!errors.descripcion)}
            onFocus={(e) => {
              e.target.style.borderColor = '#e91e8c';
              e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)';
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {errors.descripcion && <span style={errorStyle}>{errors.descripcion}</span>}
            <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
              {formData.descripcion.length}/200
            </span>
          </div>
        </div>

        {/* MÓDULOS ASIGNADOS */}
        {formData.modulos.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              Módulos y privilegios asignados
            </h4>

            {formData.modulos.map((modulo, index) => (
              <div
                key={index}
                style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '10px', border: '1px solid #e5e7eb' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e91e8c' }}>
                    {getModuloNombre(modulo.moduloId)}
                  </h5>
                  <button
                    type="button"
                    onClick={() => handleEliminarModulo(index)}
                    style={{ padding: '4px 8px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '4px', color: '#ef4444', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Eliminar
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {PRIVILEGIOS_PREDETERMINADOS.map((priv) => (
                    <label key={priv.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={modulo.privilegios.includes(priv.id)}
                        onChange={() => handleTogglePrivilegioModulo(index, priv.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#e91e8c' }}
                      />
                      {priv.nombre}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR MÓDULOS */}
        {errors.modulos && (
          <span style={{ ...errorStyle, marginBottom: '12px' }}>{errors.modulos}</span>
        )}

        {/* AGREGAR MÓDULO */}
        <div style={{ marginBottom: '24px', backgroundColor: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '10px', padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Agregar módulo {req}
          </h4>

          <select
            value={moduloSeleccionado}
            onChange={handleModuloChange}
            style={{ ...fieldStyle(false), marginBottom: '12px', cursor: 'pointer' }}
            onFocus={(e) => { e.target.style.borderColor = '#e91e8c'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
          >
            <option value="">Seleccionar módulo</option>
            {MODULOS_PREDETERMINADOS.filter(
              (m) => !formData.modulos.find((fm) => fm.moduloId === m.id)
            ).map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...labelStyle, marginBottom: '10px' }}>Privilegios *</label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {PRIVILEGIOS_PREDETERMINADOS.map((priv) => (
                <label key={priv.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={privilegiosSeleccionados.includes(priv.id)}
                    onChange={() => handlePrivilegioToggle(priv.id)}
                    style={{ width: '16px', height: '16px', accentColor: '#e91e8c', cursor: 'pointer' }}
                  />
                  {priv.nombre}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAgregarModulo}
            style={{ padding: '8px 16px', background: 'white', border: '1px solid #e91e8c', borderRadius: '6px', color: '#e91e8c', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f3ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar módulo
          </button>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow transition-colors"
          >
            {rol ? 'Guardar cambios' : 'Crear rol'}
          </button>
        </div>
      </form>

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { alertConfig.onConfirm?.(); }}
        onCancel={closeAlert}
      />
    </>
  );
};

export default RolForm;