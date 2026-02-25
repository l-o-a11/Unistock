import React, { useState } from 'react';

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px',
  };

  const requiredStar = (
    <span style={{ color: '#E91E8C', marginLeft: '2px' }}>*</span>
  );

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
        {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Nombre {requiredStar}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. Camiseta"
            style={inputStyle}
            required
            onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Descripción {requiredStar}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ej. Un jersey negro de cuello redondo hecho de algodón suave y cómodo"
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            required
            onFocus={(e) => (e.target.style.borderColor = '#E91E8C')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 24px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#555',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              backgroundColor: '#FF4FD6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C9187A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF4FD6')}
          >
            {category ? 'Guardar Categoría' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;