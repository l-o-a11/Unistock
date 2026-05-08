import React, { useState, useEffect } from 'react';

const ProductCategoryForm = ({ productCategory, onSubmit, onCancel, onShowAlert, onShowConfirm }) => {
  const initialData = {
    name: productCategory?.name || '',
    description: productCategory?.description || '',
  };

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });
  const [touched, setTouched] = useState({});

  const hasChanges = () => {
    if (!productCategory) return true;
    return formData.name !== productCategory.name || formData.description !== productCategory.description;
  };

  const validateName = (value) => {
    if (!value.trim()) return "El nombre es obligatorio";
    if (/\d/.test(value)) return "El nombre no puede contener números";
    if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    return "";
  };

  const validateDescription = (value) => {
    if (!value.trim()) return "La descripción es obligatoria";
    if (value.trim().length < 10) return "La descripción debe tener al menos 10 caracteres";
    return "";
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') error = validateName(value);
    if (name === 'description') error = validateDescription(value);
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateForm = () => {
    const nameError = validateName(formData.name);
    const descriptionError = validateDescription(formData.description);
    
    setErrors({
      name: nameError,
      description: descriptionError,
    });

    setTouched({
      name: true,
      description: true
    });

    if (nameError || descriptionError) {
      onShowAlert({
        type: "warning",
        title: "Campos inválidos",
        message: "Corrige los campos marcados antes de continuar"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    if (productCategory && !hasChanges()) {
      onShowAlert({
        type: "warning",
        title: "Sin cambios",
        message: "No has realizado ningún cambio para guardar"
      });
      return;
    }
    
    onSubmit(formData);
  };

  const handleCancelClick = () => {
    onShowConfirm({
      title: "¿Seguro que deseas cancelar?",
      message: "Los cambios no guardados se perderán.",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: onCancel
    });
  };

  const handleEscapeKey = (e) => e.key === "Escape" && handleCancelClick();

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [handleCancelClick, handleEscapeKey]);

  const getInputStyle = (field) => {
    const baseStyle = {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s, background-color 0.2s',
    };

    if ((touched[field] || formData[field]) && errors[field]) {
      return {
        ...baseStyle,
        borderColor: '#E91E8C',
      };
    }
    return baseStyle;
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

  const errorStyle = {
    color: '#E91E8C',
    fontSize: '11px',
    marginLeft: '8px',
    marginTop: '4px',
    display: 'block',
    fontWeight: 'bold', 
  };

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
        {productCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Nombre {requiredStar}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="Ej. Camiseta"
            style={getInputStyle('name')}
            onFocus={(e) => !errors.name && (e.target.style.borderColor = '#E91E8C')}
          />
          {(touched.name || formData.name) && errors.name && (
            <span style={errorStyle}>{errors.name}</span>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Descripción {requiredStar}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={() => handleBlur('description')}
            placeholder="Ej. Un jersey negro de cuello redondo hecho de algodón suave y cómodo"
            style={{
              ...getInputStyle('description'),
              minHeight: '100px',
              resize: 'vertical',
            }}
            onFocus={(e) => !errors.description && (e.target.style.borderColor = '#E91E8C')}
          />
          {(touched.description || formData.description) && errors.description && (
            <span style={errorStyle}>{errors.description}</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCancelClick}
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
              opacity: (errors.name || errors.description) ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C9187A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF4FD6')}
            disabled={errors.name || errors.description}
          >
            {productCategory ? 'Guardar Categoría' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCategoryForm;