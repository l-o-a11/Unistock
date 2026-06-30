import React, { useState } from 'react';
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from '../../../shared/utils/validationStyles';

/**
 * CategoryForm
 *
 * Props:
 *   category     — objeto para editar (opcional)
 *   onSubmit     — callback con los datos normalizados
 *   onCancel     — callback al cancelar
 *   standalone   — si es true, se envuelve en su propia card/modal (por defecto false)
 *                  Usar true cuando se llama desde ShoppingForm u otro contexto sin card propia.
 *                  Usar false (default) cuando la página ya provee el overlay y la card.
 */
const CategoryForm = ({ category, onSubmit, onCancel, standalone = false }) => {
  const [formData, setFormData] = useState({ nombre: category?.nombre || '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value.trim()) setError('');
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

  // ── Contenido del formulario (compartido en ambos modos) ────────────────
  const formContent = (
    <>
      {/* Header — solo visible en modo standalone */}
      {standalone && (
        <>
          <button onClick={onCancel} style={{
            position: 'absolute', top: 14, right: 14, width: 32, height: 32,
            borderRadius: '50%', border: 'none', background: '#f3f4f6',
            cursor: 'pointer', fontSize: 14, zIndex: 1,
          }}>✕</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
                {category ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Categoría de insumo</p>
            </div>
          </div>
        </>
      )}

      {/* Header modo legacy (página de categorías) */}
      {!standalone && (
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
          {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
        </h2>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: standalone ? 20 : '20px' }}>
          <label style={standalone ? labelStyle : {
            display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px',
          }}>
            Nombre {standalone
              ? <span style={requiredStar}>*</span>
              : <span style={{ color: '#E91E8C', marginLeft: '2px' }}>*</span>}
          </label>
          <input
            type="text" name="nombre" value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Tela"
            autoFocus
            style={standalone ? getInputStyleBox(!!error) : {
              width: '100%', padding: '10px 14px',
              border: `1px solid ${error ? '#E91E8C' : '#d1d5db'}`,
              borderRadius: '8px', fontSize: '14px', outline: 'none',
              transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#E91E8C'; if (standalone) e.target.style.boxShadow = '0 0 0 3px #FF4FD618'; }}
            onBlur={(e) => { e.target.style.borderColor = error ? '#E91E8C' : '#d1d5db'; e.target.style.boxShadow = 'none'; }}
          />
          {error && <span style={standalone ? errMsg : { color: '#E91E8C', fontSize: '11px', marginTop: '4px', display: 'block' }}>⚠ {error}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', ...(standalone ? { borderTop: '1px solid #f3f4f6', paddingTop: 16, marginTop: 4 } : {}) }}>
          <button type="button" onClick={onCancel} style={{
            padding: standalone ? '9px 20px' : '10px 24px',
            backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: standalone ? 13 : '14px',
            color: '#555', cursor: 'pointer', fontWeight: standalone ? 600 : 400,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >Cancelar</button>
          <button type="submit" style={{
            padding: standalone ? '9px 22px' : '10px 24px',
            backgroundColor: '#FF4FD6', border: 'none',
            borderRadius: '8px', fontSize: standalone ? 13 : '14px',
            fontWeight: '700', color: '#fff', cursor: 'pointer',
            boxShadow: '0 4px 12px #FF4FD644',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C9187A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF4FD6')}
          >Guardar categoría</button>
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