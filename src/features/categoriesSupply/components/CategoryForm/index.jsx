import React, { useState } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';

// ─────────────────────────────────────────────────
// Tokens de estilo — alineados con ProductionForm / RolForm
// ─────────────────────────────────────────────────
const PINK = '#ff4fd6';

const fieldStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${hasError ? PINK : '#e5e7eb'}`,
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: '#ffffff',
  fontFamily: 'inherit',
  color: '#1f2937',
});

// Label: sentence case, igual a ProductionForm / RolForm
const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '5px',
};

const sectionTitle = (text) => (
  <p style={{
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: '0 0 10px',
  }}>
    {text}
  </p>
);

const req = <span style={{ color: PINK }}> *</span>;

const onFocusField = (e) => {
  e.target.style.borderColor = PINK;
  e.target.style.boxShadow = '0 0 0 3px rgba(255,79,214,0.1)';
};
const onBlurField = (e) => {
  e.target.style.borderColor = '#e5e7eb';
  e.target.style.boxShadow = 'none';
};

// ─────────────────────────────────────────────────
// CategoryForm
// ─────────────────────────────────────────────────
const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const initialFormData = {
    nombre: category?.nombre || '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    const normalizado = {
      ...formData,
      nombre: formData.nombre.trim().charAt(0).toUpperCase() +
        formData.nombre.trim().slice(1).toLowerCase(),
    };
    onSubmit(normalizado);
  };

  const handleCancel = () => {
    const hasChanges = Object.keys(initialFormData).some((key) => {
      const currentValue = formData[key];
      const initialValue = initialFormData[key];
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

  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          alertConfig.onConfirm?.();
          closeAlert();
        }}
        onCancel={closeAlert}
      />
      <form onSubmit={handleSubmit} noValidate style={{ padding: '28px 30px', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: PINK,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M20.59 13.41 11 22 2 13l8.59-8.59A2 2 0 0 1 12 4h7a2 2 0 0 1 2 2v7a2 2 0 0 1-.59 1.41z" />
            <circle cx="16.5" cy="8.5" r="1.2" fill="#fff" stroke="none" />
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
            {category ? 'Editar categoría' : 'Crear nueva categoría'}
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
            Completa el campo obligatorio
          </p>
        </div>
      </div>

      {/* SECCIÓN: INFO BÁSICA */}
      {sectionTitle('Información de la categoría')}

      {/* NOMBRE */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="nombre" style={labelStyle}>
          Nombre{req}
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Tela"
          style={fieldStyle(false)}
          onFocus={onFocusField}
          onBlur={onBlurField}
          required
        />
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
          Guardar categoría
        </Button>
      </div>

    </form>
    </>
  );

  // Modo standalone: envuelve en su propia card
  if (standalone) {
    return (
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)', position: 'relative', padding: '28px 30px',
      }}>
        {formContent}
      </div>
    );
  }

  // Modo legacy: solo el contenido, sin card (la página ya provee el contenedor)
  return <div style={{ padding: '32px' }}>{formContent}</div>;
};

export default CategoryForm;