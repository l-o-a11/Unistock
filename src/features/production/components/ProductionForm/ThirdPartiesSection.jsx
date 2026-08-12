/**
 * ThirdPartiesSection.jsx
 * Sección para asignar terceros a una orden de producción.
 *
 * FIXES:
 *  - Key única: usa `t.id ?? t.nit ?? index` como key de los <option>
 *  - Alerta visual inline si se intenta agregar un tercero cuyo nombre
 *    (nombreEmpresa) ya está en la lista de asignados
 *  - Identificador visible cambiado de código interno → NIT
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
    (async () => {
      try {
        const { thirdPartyAPI } = await import('../../../third_parties/services/thirdPartyAPI');
        const data = await thirdPartyAPI.getAll();
        const normalized = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        // Solo terceros con id válido para evitar keys duplicadas en el select
        setAvailableThirdParties(normalized.filter(t => t.id != null && t.id !== ''));
      } catch (err) {
        console.error('Error cargando terceros:', err);
      }
    })();
  }, []);

  const getOptionKey = (t, idx) => {
    if (t.id != null && t.id !== '') return `tp-${t.id}`;
    if (t.nit)                         return `nit-${t.nit}`;
    return `idx-${idx}`;
  };

  const addTercero = () => {
    const errs = {};
    if (!newTercero.id) errs.id = 'Selecciona un tercero';
    if (!newTercero.cantidad || Number(newTercero.cantidad) <= 0)
      errs.cantidad = 'Ingresa una cantidad válida';

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const selected = availableThirdParties.find(t => String(t.id) === String(newTercero.id));
    if (!selected) { setErrors({ id: 'Tercero no encontrado, recarga la página' }); return; }

    const nombreSeleccionado = (selected.nombreEmpresa || selected.nombre || '').trim().toLowerCase();

    // ── Alerta visual: nombre de empresa ya está en la lista ──────────────
    const nombreDuplicado = terceros.find(t =>
      (t.tercero_nombre || '').trim().toLowerCase() === nombreSeleccionado
    );
    if (nombreDuplicado) {
      setErrors({
        id: `"${selected.nombreEmpresa || selected.nombre}" ya está asignado a esta orden`,
      });
      return;
    }

    // ── Mismo id también se previene ─────────────────────────────────────
    if (terceros.find(t => String(t.id_tercero) === String(selected.id))) {
      setErrors({ id: 'Este tercero ya fue agregado' });
      return;
    }

    onTercerosChange([
      ...terceros,
      {
        id_tercero:     selected.id,
        tercero_nombre: selected.nombreEmpresa || selected.nombre || '',
        tercero_nit:    selected.nit || '',
        cantidad:       Number(newTercero.cantidad),
      },
    ]);
    setNewTercero({ id: '', cantidad: '' });
    setErrors({});
    setShowAdd(false);
  };

  const removeTercero = (index) => onTercerosChange(terceros.filter((_, i) => i !== index));

  const updateCantidad = (index, cantidad) => {
    const updated = [...terceros];
    updated[index].cantidad = Number(cantidad) || 0;
    onTercerosChange(updated);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={labelStyle}>Terceros asignados <span style={{ color: '#9ca3af', fontSize: 10, fontWeight: 400 }}>(opcional)</span></label>
        {terceros.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
            {terceros.length} asignación{terceros.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Lista de terceros ya asignados */}
      {terceros.length > 0 && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          {terceros.map((t, i) => (
            <div
              key={`asignado-${t.id_tercero}-${i}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                background: '#fff', border: '1px solid #f3f4f6', borderRadius: 8,
                marginBottom: i < terceros.length - 1 ? 8 : 0,
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#1f2937' }}>
                  {t.tercero_nombre}
                </p>
                {/* Muestra NIT en vez del código interno */}
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
                  NIT: {t.tercero_nit || '—'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Cant:</label>
                  <input
                    type="number" value={t.cantidad}
                    onChange={(e) => updateCantidad(i, e.target.value)}
                    min="1"
                    style={{ width: 60, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                  />
                </div>
                <button
                  type="button" onClick={() => removeTercero(i)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón / Formulario agregar */}
      {!showAdd ? (
        <button
          type="button" onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px dashed #d1d5db', background: '#fafafa', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#4b5563', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.background = '#f3f4f6'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafafa'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar tercero
        </button>
      ) : (
        <div style={{ background: '#f9fafb', border: '1.5px solid #d1d5db', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={labelStyle}>Seleccionar tercero <span style={requiredStar}>*</span></label>
            <select
              value={newTercero.id}
              onChange={(e) => { setNewTercero(p => ({ ...p, id: e.target.value })); if (errors.id) setErrors(p => ({ ...p, id: '' })); }}
              style={getInputStyle(errors.id)}
            >
              <option value="">
                {loadingThirdParties ? 'Cargando terceros...' : availableThirdParties.length === 0 ? 'Sin terceros disponibles' : 'Seleccionar un tercero...'}
              </option>
              {availableThirdParties.map((t, idx) => {
                const key = getOptionKey(t, idx);
                const nombre = t.nombreEmpresa || t.nombre || 'Sin nombre';
                const nit = t.nit ? ` — NIT ${t.nit}` : '';
                return (
                  <option key={key} value={String(t.id)}>
                    {nombre}{nit}
                  </option>
                );
              })}
            </select>

            {/* Alerta visual de duplicado */}
            {errors.id && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 5, padding: '7px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>{errors.id}</span>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Cantidad a asignar <span style={requiredStar}>*</span></label>
            <input
              type="number" value={newTercero.cantidad}
              onChange={(e) => { setNewTercero(p => ({ ...p, cantidad: e.target.value })); if (errors.cantidad) setErrors(p => ({ ...p, cantidad: '' })); }}
              min="1" placeholder="Ej: 100"
              style={getInputStyle(errors.cantidad)}
            />
            {errors.cantidad && <span style={{ fontSize: 11, color: '#dc2626' }}>⚠ {errors.cantidad}</span>}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={addTercero}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ff4fd6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
              Agregar
            </button>
            <button type="button"
              onClick={() => { setShowAdd(false); setNewTercero({ id: '', cantidad: '' }); setErrors({}); }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartiesSection;
