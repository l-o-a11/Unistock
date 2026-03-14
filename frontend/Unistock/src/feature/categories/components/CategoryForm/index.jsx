import React, { useState, useEffect } from 'react';

const CategoryForm = ({ category, onSubmit, onCancel, onShowAlert, onShowConfirm }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });

  const [touched, setTouched] = useState({});

  // 🔥 VALIDACIONES EN TIEMPO REAL
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

  // Validar campo específico y actualizar errores
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
    // Validar en tiempo real mientras escribe
    validateField(name, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Validar al salir del campo
    validateField(field, formData[field]);
  };

  // Validar todos los campos antes de enviar
  const validateForm = () => {
    const nameError = validateName(formData.name);
    const descriptionError = validateDescription(formData.description);
    
    setErrors({
      name: nameError,
      description: descriptionError,
    });

    // Marcar todos como tocados
    setTouched({
      name: true,
      description: true
    });

    const hasErrors = nameError || descriptionError;
    
    if (hasErrors) {
      // Mostrar alerta con los errores
      const errorMessages = [];
      if (nameError) errorMessages.push(nameError);
      if (descriptionError) errorMessages.push(descriptionError);
      
      onShowAlert({
        type: "warning",
        title: "Campos inválidos",
        message: errorMessages.join(". ")
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  // ALERTA DE CONFIRMACIÓN al cancelar
  const handleCancelClick = () => {
    onShowConfirm({
      title: "¿Seguro que deseas cancelar?",
      message: "Los cambios no guardados se perderán.",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: onCancel
    });
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleCancelClick();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Estilo para inputs con error
  const getInputStyle = (field) => {
    const baseStyle = {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
    };

    if ((touched[field] || formData[field]) && errors[field]) {
      return {
        ...baseStyle,
        borderColor: '#E91E8C',
        backgroundColor: '#fff0f7'
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
            onBlur={() => handleBlur('name')}
            placeholder="Ej. Camiseta"
            style={getInputStyle('name')}
            onFocus={(e) => !errors.name && (e.target.style.borderColor = '#E91E8C')}
          />
          {/* Mensaje de error en tiempo real */}
          {(touched.name || formData.name) && errors.name && (
            <span style={{ color: '#E91E8C', fontSize: '11px', marginLeft: '8px', marginTop: '4px', display: 'block' }}>
              ⚠ {errors.name}
            </span>
          )}
        </div>

        {/* Descripción */}
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
          {/* Mensaje de error en tiempo real */}
          {(touched.description || formData.description) && errors.description && (
            <span style={{ color: '#E91E8C', fontSize: '11px', marginLeft: '8px', marginTop: '4px', display: 'block' }}>
              ⚠ {errors.description}
            </span>
          )}
        </div>

        {/* Mensaje general si hay errores */}
        {(errors.name || errors.description) && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '8px 12px', 
            backgroundColor: '#fff0f7', 
            border: '1px solid #E91E8C',
            borderRadius: '6px',
            color: '#E91E8C', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Corrige los campos marcados</span>
          </div>
        )}

        {/* Botones */}
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
            {category ? 'Guardar Categoría' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;