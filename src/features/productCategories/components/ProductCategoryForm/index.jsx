import React, { useState, useEffect } from 'react';

const ProductCategoryForm = ({ productCategory, onSubmit, onCancel, onShowAlert, onShowConfirm, existingCategories = [] }) => {
  const initialData = {
    nombre: productCategory?.nombre ?? productCategory?.name ?? '',
    descripcion: productCategory?.descripcion ?? productCategory?.description ?? '',
  };

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({
    nombre: '',
    descripcion: '',
  });
  const [touched, setTouched] = useState({});

  const hasChanges = () => {
    const initialNombre = productCategory?.nombre ?? productCategory?.name ?? '';
    const initialDescripcion = productCategory?.descripcion ?? productCategory?.description ?? '';

    return formData.nombre !== initialNombre || formData.descripcion !== initialDescripcion;
  };

  const validateNombre = (value) => {
    if (!value.trim()) return "El nombre es obligatorio";
    if (/\d/.test(value)) return "El nombre no puede contener números";
    if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    const currentId = productCategory?.id ?? productCategory?._id ?? productCategory?.id_categoria_producto ?? productCategory?.id_categorias;
    const isDuplicate = existingCategories.some((cat) => {
      const catId = cat.id ?? cat._id ?? cat.id_categoria_producto ?? cat.id_categorias;
      const catName = cat.name ?? cat.nombre ?? '';
      return catName.toLowerCase().trim() === value.trim().toLowerCase() && String(catId) !== String(currentId);
    });
    if (isDuplicate) return "Ya existe una categoría con ese nombre";
    return "";
  };

  const validateDescripcion = (value) => {
    if (!value.trim()) return "La descripción es obligatoria";
    if (value.trim().length < 10) return "La descripción debe tener al menos 10 caracteres";
    return "";
  };

  const validateField = (fieldName, value) => {
    let error = '';
    if (fieldName === 'nombre') error = validateNombre(value);
    if (fieldName === 'descripcion') error = validateDescripcion(value);
    
    setErrors(prev => ({ ...prev, [fieldName]: error }));
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
    const nombreError = validateNombre(formData.nombre);
    const descripcionError = validateDescripcion(formData.descripcion);
    
    setErrors({
      nombre: nombreError,
      descripcion: descripcionError,
    });

    setTouched({
      nombre: true,
      descripcion: true
    });

    if (nombreError || descripcionError) {
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
    
    // 🔍 DEBUG: Ver qué se envía
    console.log('📤 Enviando datos:', formData);
    console.log('📤 Nombre:', formData.nombre);
    console.log('📤 Descripción:', formData.descripcion);
    console.log('📤 Longitud descripción:', formData.descripcion.length);
    
    onSubmit(formData);
  };

  const handleCancelClick = () => {
    if (!hasChanges()) {
      onCancel();
      return;
    }

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

  // ─────────────────────────────────────────────────────────────────────────
  // ESTILOS (alineados con ProductionForm)
  // ─────────────────────────────────────────────────────────────────────────
  const getInputStyle = (field) => {
    const baseStyle = {
      width: '100%',
      padding: '10px 14px',
      border: '1.5px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      outline: 'none',
      background: '#fff',
      transition: 'border-color 0.15s, background-color 0.15s',
    };

    if ((touched[field] || formData[field]) && errors[field]) {
      return {
        ...baseStyle,
        borderColor: '#ff4fd6',
      };
    }
    return baseStyle;
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '6px',
  };

  const requiredStar = (
    <span style={{ color: '#ff4fd6', marginLeft: '2px' }}>*</span>
  );

  const errorStyle = {
    color: '#ff4fd6',
    fontSize: '11px',
    marginLeft: '4px',
    marginTop: '4px',
    display: 'block',
    fontWeight: '700',
  };

  const sectionTitleStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: '0 0 14px',
  };

  return (
    <div style={{ padding: '28px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
            {productCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
            {productCategory ? 'Actualiza el nombre o la descripción' : 'Completa todos los campos obligatorios'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <p style={sectionTitleStyle}>Información de la categoría</p>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Nombre {requiredStar}</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={() => handleBlur('nombre')}
            placeholder="Ej. Camiseta"
            style={getInputStyle('nombre')}
            onFocus={(e) => !errors.nombre && (e.target.style.borderColor = '#ff4fd6')}
          />
          {(touched.nombre || formData.nombre) && errors.nombre && (
            <span style={errorStyle}>⚠ {errors.nombre}</span>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Descripción {requiredStar}</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            onBlur={() => handleBlur('descripcion')}
            placeholder="Ej. Un jersey negro de cuello redondo hecho de algodón suave y cómodo"
            style={{
              ...getInputStyle('descripcion'),
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => !errors.descripcion && (e.target.style.borderColor = '#ff4fd6')}
          />
          {(touched.descripcion || formData.descripcion) && errors.descripcion && (
            <span style={errorStyle}>⚠ {errors.descripcion}</span>
          )}
          {/* 🔍 DEBUG: Mostrar longitud */}
          <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
            {formData.descripcion.length} caracteres
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
          <button
            type="button"
            onClick={handleCancelClick}
            style={{
              padding: '10px 24px',
              backgroundColor: '#f3f4f6',
              border: '1.5px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
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
              backgroundColor: '#ff4fd6',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              opacity: (errors.nombre || errors.descripcion) ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C9187A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff4fd6')}
            disabled={errors.nombre || errors.descripcion}
          >
            {productCategory ? 'Guardar Categoría' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCategoryForm;
