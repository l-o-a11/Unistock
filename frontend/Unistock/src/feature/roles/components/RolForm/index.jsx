import React, { useState } from 'react';

// Datos de ejemplo para módulos y privilegios
const MODULOS_PREDETERMINADOS = [
  { id: 1, nombre: 'Usuarios' },
  { id: 2, nombre: 'Productos' },
  { id: 3, nombre: 'Insumos' },
  { id: 4, nombre: 'Compras' },
  { id: 5, nombre: 'Proveedores' },
  { id: 6, nombre: 'Ventas' },
  { id: 7, nombre: 'Reportes' },
  { id: 8, nombre: 'Configuración' }
];

const PRIVILEGIOS_PREDETERMINADOS = [
  { id: 1, nombre: 'Leer', key: 'leer' },
  { id: 2, nombre: 'Crear', key: 'crear' },
  { id: 3, nombre: 'Actualizar', key: 'actualizar' },
  { id: 4, nombre: 'Eliminar', key: 'eliminar' }
];

const RolForm = ({ rol, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: rol?.nombre || '',
    descripcion: rol?.descripcion || '',
    modulos: rol?.modulos || [] // Array de objetos { moduloId, privilegios: [ids] }
  });

  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [privilegiosSeleccionados, setPrivilegiosSeleccionados] = useState([]);

  // Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleModuloChange = (e) => {
    setModuloSeleccionado(e.target.value);
    setPrivilegiosSeleccionados([]);
  };

  const handlePrivilegioToggle = (privilegioId) => {
    setPrivilegiosSeleccionados(prev => {
      if (prev.includes(privilegioId)) {
        return prev.filter(id => id !== privilegioId);
      } else {
        return [...prev, privilegioId];
      }
    });
  };

  const handleAgregarModulo = () => {
    if (!moduloSeleccionado || privilegiosSeleccionados.length === 0) {
      alert('Debes seleccionar un módulo y al menos un privilegio');
      return;
    }

    // Verificar si el módulo ya está agregado
    const moduloExistente = formData.modulos.find(
      m => m.moduloId === parseInt(moduloSeleccionado)
    );

    if (moduloExistente) {
      alert('Este módulo ya está agregado al rol');
      return;
    }

    // Agregar módulo con sus privilegios
    const nuevoModulo = {
      moduloId: parseInt(moduloSeleccionado),
      privilegios: privilegiosSeleccionados
    };

    setFormData({
      ...formData,
      modulos: [...formData.modulos, nuevoModulo]
    });

    // Resetear selección
    setModuloSeleccionado('');
    setPrivilegiosSeleccionados([]);
  };

  const handleTogglePrivilegioModulo = (moduloIndex, privilegioId) => {
    const nuevosModulos = [...formData.modulos];
    const modulo = nuevosModulos[moduloIndex];
    
    if (modulo.privilegios.includes(privilegioId)) {
      // Quitar privilegio
      modulo.privilegios = modulo.privilegios.filter(id => id !== privilegioId);
      // Si no quedan privilegios, eliminar el módulo
      if (modulo.privilegios.length === 0) {
        nuevosModulos.splice(moduloIndex, 1);
      }
    } else {
      // Agregar privilegio
      modulo.privilegios.push(privilegioId);
    }
    
    setFormData({
      ...formData,
      modulos: nuevosModulos
    });
  };

  const handleEliminarModulo = (moduloIndex) => {
    const nuevosModulos = formData.modulos.filter((_, index) => index !== moduloIndex);
    setFormData({
      ...formData,
      modulos: nuevosModulos
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Obtener nombre del módulo por ID
  const getModuloNombre = (moduloId) => {
    const modulo = MODULOS_PREDETERMINADOS.find(m => m.id === moduloId);
    return modulo ? modulo.nombre : 'Módulo desconocido';
  };

  // Obtener nombre del privilegio por ID
  const getPrivilegioNombre = (privilegioId) => {
    const privilegio = PRIVILEGIOS_PREDETERMINADOS.find(p => p.id === privilegioId);
    return privilegio ? privilegio.nombre : 'Desconocido';
  };

  return (
    <form onSubmit={handleSubmit}>
       {/* TITLE */}
        <h1 className="text-xl font-semibold mb-6">
          Crear nuevo rol
        </h1>
      {/* Nombre del rol */}
      <div style={{ marginBottom: '20px' }}>
        <label 
          htmlFor="nombre" 
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          Nombre del rol *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'all 0.2s',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Descripción */}
      <div style={{ marginBottom: '24px' }}>
        <label 
          htmlFor="descripcion" 
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'all 0.2s',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Módulos y privilegios actuales */}
      {formData.modulos.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '12px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            Módulos y privilegios asignados
          </h4>
          
          {formData.modulos.map((modulo, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <h5 style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  fontWeight: '600',
                  color: '#8b5cf6'
                }}>
                  Módulo: {getModuloNombre(modulo.moduloId)}
                </h5>
                <button
                  type="button"
                  onClick={() => handleEliminarModulo(index)}
                  style={{
                    padding: '4px 8px',
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    color: '#ef4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Eliminar
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {PRIVILEGIOS_PREDETERMINADOS.map(privilegio => (
                  <label 
                    key={privilegio.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={modulo.privilegios.includes(privilegio.id)}
                      onChange={() => handleTogglePrivilegioModulo(index, privilegio.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#8b5cf6'
                      }}
                    />
                    {privilegio.nombre}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selector de nuevo módulo */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '12px'
        }}>
          Módulo a agregar *
        </h4>

        <select
          value={moduloSeleccionado}
          onChange={handleModuloChange}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">Seleccionar módulo</option>
          {MODULOS_PREDETERMINADOS.map(modulo => (
            <option key={modulo.id} value={modulo.id}>
              {modulo.nombre}
            </option>
          ))}
        </select>

        {/* Privilegios */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Privilegios *
          </label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {PRIVILEGIOS_PREDETERMINADOS.map(privilegio => (
              <label 
                key={privilegio.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <input
                  type="checkbox"
                  checked={privilegiosSeleccionados.includes(privilegio.id)}
                  onChange={() => handlePrivilegioToggle(privilegio.id)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#8b5cf6'
                  }}
                />
                {privilegio.nombre}
              </label>
            ))}
          </div>
        </div>

        {/* Botón Agregar módulo */}
        <button
          type="button"
          onClick={handleAgregarModulo}
          style={{
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #8b5cf6',
            borderRadius: '6px',
            color: '#8b5cf6',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f3ff';
            e.currentTarget.style.borderColor = '#7c3aed';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#8b5cf6';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar módulo
        </button>
      </div>

      {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white shadow"
          >
            Guardar
          </button>
      </div>
    </form>
  );
};

export default RolForm;