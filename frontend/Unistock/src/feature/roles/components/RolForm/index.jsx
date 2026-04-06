import React, { useState } from 'react';
import Alert from '../../../shared/components/Alert';
import { MODULOS_PREDETERMINADOS, PRIVILEGIOS_PREDETERMINADOS } from '../../services/RolesAPI';

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

const req = <span style={{ color: "#FF4FD6" }}> *</span>;

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
      showAlert('warning', 'Módulo duplicado', 'Este módulo ya está agregado al rol.');
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
      `¿Eliminar el módulo "${getModuloNombre(formData.modulos[moduloIndex].moduloId)}"?`,
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

    if (!validateAll()) {
      showAlert('warning', 'Campos incompletos', 'Corrige los errores.');
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
    showAlert('confirm', '¿Cancelar?', 'Se perderán los cambios.', () => {
      closeAlert();
      onCancel?.();
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>{rol ? 'Editar rol' : 'Crear rol'}</h1>
        {/* (resto del JSX igual al tuyo, no cambia nada) */}
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