/**
 * ThirdPartiesSection.jsx
 * Componente para agregar terceros a una orden de producción
 */
import React, { useState, useEffect } from 'react';
import { getInputStyleBox, labelStyle, requiredStar } from '../../../../features/shared/utils/validationStyles';

const getInputStyle = (err) => getInputStyleBox(err);

export const ThirdPartiesSection = ({ terceros, onTercerosChange, loadingThirdParties = false }) => {
  const [availableThirdParties, setAvailableThirdParties] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTercero, setNewTercero] = useState({ id: '', cantidad: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar terceros disponibles
    (async () => {
      try {
        const { thirdPartyAPI } = await import('../../../third_parties/services/thirdPartyAPI');
        const data = await thirdPartyAPI.getAll();
        const normalized = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setAvailableThirdParties(normalized);
      } catch (err) {
        console.error('Error cargando terceros:', err);
      }
    })();
  }, []);

  const addTercero = () => {
    const errs = {};
    if (!newTercero.id) errs.id = 'Selecciona un tercero';
    if (!newTercero.cantidad || Number(newTercero.cantidad) <= 0) errs.cantidad = 'Ingresa una cantidad válida';
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const existing = terceros.find(t => t.id_tercero === newTercero.id);
    if (existing) {
      setErrors({ id: 'Este tercero ya fue agregado' });
      return;
    }

    const selected = availableThirdParties.find(t => t.id === newTercero.id);
    const newAsignacion = {
      id_tercero: newTercero.id,
      tercero_nombre: selected?.nombreEmpresa || selected?.nombre || '',
      cantidad: Number(newTercero.cantidad),
    };

    onTercerosChange([...terceros, newAsignacion]);
    setNewTercero({ id: '', cantidad: '' });
    setErrors({});
    setShowAdd(false);
  };

  const removeTercero = (index) => {
    onTercerosChange(terceros.filter((_, i) => i !== index));
  };

  const updateCantidad = (index, cantidad) => {
    const updated = [...terceros];
    updated[index].cantidad = Number(cantidad) || 0;
    onTercerosChange(updated);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={labelStyle}>Terceros asignados (opcional)</label>
        {terceros.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
            {terceros.length} asignación{terceros.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Lista de terceros agregados */}
      {terceros.length > 0 && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          {terceros.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 10,
                background: '#fff',
                border: '1px solid #f3f4f6',
                borderRadius: 8,
                marginBottom: i < terceros.length - 1 ? 8 : 0,
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#1f2937' }}>
                  {t.tercero_nombre}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>ID: {t.id_tercero}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Cant:</label>
                  <input
                    type="number"
                    value={t.cantidad}
                    onChange={(e) => updateCantidad(i, e.target.value)}
                    min="1"
                    style={{
                      width: 60,
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      fontSize: 12,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTercero(i)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar tercero */}
      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px dashed #d1d5db',
            background: '#fafafa',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: '#4b5563',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.background = '#fafafa';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar tercero
        </button>
      ) : (
        <div
          style={{
            background: '#f9fafb',
            border: '1.5px solid #d1d5db',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div>
            <label style={labelStyle}>Seleccionar tercero <span style={requiredStar}>*</span></label>
            <select
              value={newTercero.id}
              onChange={(e) => {
                setNewTercero((prev) => ({ ...prev, id: e.target.value }));
                if (errors.id) setErrors((prev) => ({ ...prev, id: '' }));
              }}
              style={getInputStyle(errors.id)}
            >
              <option value="">
                {loadingThirdParties ? 'Cargando terceros...' : 'Seleccionar un tercero...'}
              </option>
              {availableThirdParties.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombreEmpresa || t.nombre} ({t.nit})
                </option>
              ))}
            </select>
            {errors.id && <span style={{ fontSize: 11, color: '#dc2626' }}>⚠ {errors.id}</span>}
          </div>

          <div>
            <label style={labelStyle}>Cantidad a asignar <span style={requiredStar}>*</span></label>
            <input
              type="number"
              value={newTercero.cantidad}
              onChange={(e) => {
                setNewTercero((prev) => ({ ...prev, cantidad: e.target.value }));
                if (errors.cantidad) setErrors((prev) => ({ ...prev, cantidad: '' }));
              }}
              min="1"
              placeholder="Ej: 100"
              style={getInputStyle(errors.cantidad)}
            />
            {errors.cantidad && <span style={{ fontSize: 11, color: '#dc2626' }}>⚠ {errors.cantidad}</span>}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={addTercero}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: '#ff4fd6',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setNewTercero({ id: '', cantidad: '' });
                setErrors({});
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#6b7280',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartiesSection;
