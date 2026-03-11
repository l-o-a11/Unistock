import React, { useState, useEffect, useRef } from 'react';
import Alert from '../../../shared/components/Alert';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { validators } from '../../../shared/utils/Validaciones';
import TechnicalSheet from '../TechnicalSheet';

// ── helpers ───────────────────────────────────────────────────────────────────
const getInputStyle = (err) => ({
  width: '100%', padding: '10px 14px', borderRadius: 8,
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
  border: err ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
  background: err ? '#fff8f8' : '#fff', transition: 'border 0.15s',
});
const labelStyle  = { fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5, display: 'block' };
const errMsg      = { fontSize: 11, color: '#ef4444', marginTop: 3, margin: '3px 0 0' };
const typeBox     = (active) => ({
  flex: 1, border: active ? '2px solid #FF4FD6' : '1.5px solid #e5e7eb',
  borderRadius: 12, padding: 14, cursor: 'pointer',
  background: active ? '#fff0fb' : '#fafafa', transition: 'all 0.15s',
});

// ── Fila artículo extra ──────────────────────────────────────────────────────
const ExtraRefRow = ({ index, data, onChange, onRemove, errors = {} }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff8fe', border: '1px solid #f9a8d4', borderRadius: 10, padding: '12px 12px 10px', marginBottom: 8, position: 'relative' }}>
    <span style={{ position: 'absolute', top: 7, left: 12, fontSize: 10, color: '#ec4899', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      Artículo #{index + 2}
    </span>
    <div style={{ flex: 1, marginTop: 20 }}>
      <label style={labelStyle}>Cantidad *</label>
      <input type="number" min="1" value={data.cantidad}
        onChange={e => onChange(index, 'cantidad', e.target.value)}
        style={getInputStyle(errors.cantidad)} placeholder="Ej: 100" />
      {errors.cantidad && <p style={errMsg}>{errors.cantidad}</p>}
    </div>
    <div style={{ flex: 1, marginTop: 20 }}>
      <label style={labelStyle}>Color *</label>
      <input type="text" value={data.color}
        onChange={e => onChange(index, 'color', e.target.value)}
        style={getInputStyle(errors.color)} placeholder="Ej: Rojo" />
      {errors.color && <p style={errMsg}>{errors.color}</p>}
    </div>
    <div style={{ flex: 1, marginTop: 20 }}>
      <label style={labelStyle}>Fecha de entrega *</label>
      <input type="date" value={data.fecha}
        onChange={e => onChange(index, 'fecha', e.target.value)}
        style={getInputStyle(errors.fecha)} />
      {errors.fecha && <p style={errMsg}>{errors.fecha}</p>}
    </div>
    <button type="button" onClick={() => onRemove(index)}
      style={{ marginTop: 36, width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      ×
    </button>
  </div>
);

// ── Componente principal ─────────────────────────────────────────────────────
const ProductionForm = ({ onSubmit, onCancel }) => {
  const modalRef = useRef(null);

  const [type, setType]             = useState('produccion');
  const [products, setProducts]     = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [extraRefs, setExtraRefs]   = useState([]);
  const [extraErrors, setExtraErrors] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTechSheet, setShowTechSheet] = useState(false);
  const [techSheetData, setTechSheetData] = useState(null);
  const [techSheetPreview, setTechSheetPreview] = useState(null); // ficha del producto seleccionado
  const [loadingSheet, setLoadingSheet] = useState(false);

  const [savedColors,  setSavedColors]  = useState([]);
  const [savedClients, setSavedClients] = useState([]);

  const [formData, setFormData] = useState({
    referencia: '', producto: '', cantidad: '', color: '', cliente: '', fechaSolicitud: '',
  });
  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({ open: false, type: 'warning', title: '', message: '', onConfirm: null });

  // ── Cargar productos ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { productAPI } = await import('../../../products/services/productAPI');
        const data = await productAPI.getAll();
        setProducts(data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // ── Cargar ficha técnica cuando se selecciona un producto tipo "produccion" ──
  useEffect(() => {
    if (type !== 'produccion' || !formData.referencia) {
      setTechSheetPreview(null);
      return;
    }
    setLoadingSheet(true);
    setTechSheetPreview(null);
    (async () => {
      try {
        const { productAPI } = await import('../../../products/services/productAPI');
        const versions = await productAPI.getTechnicalSheetVersions(formData.referencia);
        setTechSheetPreview(versions && versions.length > 0 ? versions[0] : null);
      } catch {
        setTechSheetPreview(null);
      } finally {
        setLoadingSheet(false);
      }
    })();
  }, [formData.referencia, type]);

  // ── Autocomplete de colores y clientes ───────────────────────────────────
  useEffect(() => {
    setSavedColors(JSON.parse(localStorage.getItem('productionColors') || '[]'));
    setSavedClients(JSON.parse(localStorage.getItem('productionClients') || '[]'));
  }, []);

  // ── ESC + overlay ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleCancelClick(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const saveColor  = (c) => { if (c && !savedColors.includes(c))  { const u = [c,...savedColors].slice(0,10); setSavedColors(u);  localStorage.setItem('productionColors', JSON.stringify(u)); } };
  const saveClient = (c) => { if (c && !savedClients.includes(c)) { const u = [c,...savedClients].slice(0,10); setSavedClients(u); localStorage.setItem('productionClients', JSON.stringify(u)); } };

  // ── Cambio de campo ───────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
    if (name === 'referencia') {
      const sel = products.find(p => p.reference === value || p.id === value);
      setFormData(prev => ({ ...prev, referencia: value, producto: sel ? sel.name : value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ── Extras ────────────────────────────────────────────────────────────────
  const addExtraRef    = () => { setExtraRefs(p => [...p, { cantidad: '', color: '', fecha: '' }]); setExtraErrors(p => [...p, {}]); };
  const updateExtraRef = (i, f, v) => {
    setExtraRefs(p => p.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
    setExtraErrors(p => p.map((e, idx) => idx === i ? { ...e, [f]: undefined } : e));
  };
  const removeExtraRef = (i) => { setExtraRefs(p => p.filter((_,idx) => idx !== i)); setExtraErrors(p => p.filter((_,idx) => idx !== i)); };

  const totalCantidad = (Number(formData.cantidad) || 0) + extraRefs.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);

  // ── Validación ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const missing   = [];
    const newExtraErr = extraRefs.map(() => ({}));

    if (!formData.referencia) { newErrors.referencia = 'Selecciona un producto'; missing.push('Producto / Artículo'); }
    if (!formData.cantidad || Number(formData.cantidad) < 1) { newErrors.cantidad = 'Ingresa una cantidad válida'; missing.push('Cantidad'); }
    if (!formData.color.trim())         { newErrors.color    = 'Ingresa un color';          missing.push('Color'); }
    if (!formData.cliente.trim())       { newErrors.cliente  = 'Ingresa el cliente';         missing.push('Cliente'); }
    if (!formData.fechaSolicitud)       { newErrors.fechaSolicitud = 'Selecciona fecha';     missing.push('Fecha de entrega'); }

    extraRefs.forEach((r, i) => {
      if (!r.cantidad || Number(r.cantidad) < 1) { newExtraErr[i].cantidad = 'Requerida'; missing.push(`Artículo #${i+2} — Cantidad`); }
      if (!r.color.trim())  { newExtraErr[i].color = 'Requerido'; missing.push(`Artículo #${i+2} — Color`); }
      if (!r.fecha)         { newExtraErr[i].fecha = 'Requerida'; missing.push(`Artículo #${i+2} — Fecha`); }
    });

    setErrors(newErrors);
    setExtraErrors(newExtraErr);

    if (missing.length > 0) {
      setAlertConfig({ open: true, type: 'warning', title: `Faltan ${missing.length} campo${missing.length>1?'s':''} por completar`, message: missing.map(m => `• ${m}`).join('\n'), onConfirm: null });
      return false;
    }
    return true;
  };

  const handleSubmit  = (e) => { e.preventDefault(); if (validate()) setShowConfirm(true); };

  const handleConfirm = () => {
    saveColor(formData.color);
    saveClient(formData.cliente);
    // Para "produccion": la ficha técnica viene del producto (ProductionAPI.create la busca)
    // Para "diseno": la ficha viene de techSheetData (lo que el usuario creó)
    onSubmit({ tipo: type, ...formData, referencias: extraRefs, techSheet: type === 'diseno' ? techSheetData : null });
    setShowConfirm(false);
    setAlertConfig({ open: true, type: 'success', title: 'Orden creada', message: 'La orden de producción fue creada correctamente.', onConfirm: null });
  };

  const handleCancelClick = () => {
    setAlertConfig({
      open: true, type: 'confirm',
      title: 'Cancelar',
      message: '¿Seguro que deseas cancelar? Se perderán los cambios.',
      onConfirm: () => { setAlertConfig(prev => ({ ...prev, open: false })); onCancel(); },
    });
  };

  const sectionTitle = (t) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>{t}</p>
  );

  return (
    <>
      <Alert
        isOpen={alertConfig.open} type={alertConfig.type}
        title={alertConfig.title} message={alertConfig.message}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else setAlertConfig(prev => ({ ...prev, open: false })); }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      <div onClick={handleOverlayClick} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
        <div ref={modalRef} style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', padding: '28px 30px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', position: 'relative' }}>

          {/* Cerrar */}
          <button onClick={handleCancelClick} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 14 }}>✕</button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#FF4FD6,#c026d3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9,15 12,18 15,15"/></svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>Nueva orden de producción</h2>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Completa todos los campos obligatorios</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* TIPO */}
            {sectionTitle('Tipo de solicitud')}
            <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
              {[['produccion','Producción','Artículo con ficha técnica existente'],['diseno','Diseño','Nuevo diseño o boceto a crear']].map(([val, label, desc]) => (
                <div key={val} style={typeBox(type === val)} onClick={() => setType(val)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${type===val?'#FF4FD6':'#d1d5db'}`, background: type===val?'#FF4FD6':'transparent', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{label}</span>
                  </div>
                  <small style={{ fontSize: 11, color: '#9ca3af', display: 'block', paddingLeft: 24 }}>{desc}</small>
                </div>
              ))}
            </div>

            {/* PRODUCTO */}
            {sectionTitle('Artículo principal')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Producto / Artículo <span style={{color:'#ef4444'}}>*</span></label>
                <select name="referencia" value={formData.referencia} onChange={handleChange} style={getInputStyle(errors.referencia)}>
                  <option value="">
                    {loadingProducts ? 'Cargando productos...' : 'Seleccionar producto...'}
                  </option>
                  {products.map(p => (
                    <option key={p.id} value={p.reference || p.id}>
                      {p.reference} — {p.name}
                    </option>
                  ))}
                </select>
                {errors.referencia && <p style={errMsg}>⚠ {errors.referencia}</p>}
                {/* Indicador de ficha técnica para tipo "produccion" */}
                {type === 'produccion' && formData.referencia && (
                  <p style={{ margin: '5px 0 0', fontSize: 11, color: loadingSheet ? '#9ca3af' : techSheetPreview ? '#16a34a' : '#f59e0b' }}>
                    {loadingSheet
                      ? '⏳ Buscando ficha técnica...'
                      : techSheetPreview
                        ? `✓ Ficha técnica disponible (v${techSheetPreview.version})`
                        : '⚠ Sin ficha técnica registrada para este producto'}
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>
                  Cantidad
                  {extraRefs.length > 0 && totalCantidad > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#FF4FD6', background: '#fff0fb', padding: '2px 8px', borderRadius: 10, marginLeft: 6 }}>Total: {totalCantidad}</span>}
                  <span style={{color:'#ef4444'}}> *</span>
                </label>
                <input name="cantidad" type="number" min="1" value={formData.cantidad} onChange={handleChange} style={getInputStyle(errors.cantidad)} placeholder="Ej: 100" />
                {errors.cantidad && <p style={errMsg}>⚠ {errors.cantidad}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Color <span style={{color:'#ef4444'}}>*</span></label>
                <input list="colorList" name="color" value={formData.color} onChange={handleChange} style={getInputStyle(errors.color)} placeholder="Ej: Negro, Blanco..." />
                <datalist id="colorList">{savedColors.map((c,i) => <option key={i} value={c}/>)}</datalist>
                {errors.color && <p style={errMsg}>⚠ {errors.color}</p>}
              </div>
              <div>
                <label style={labelStyle}>Cliente <span style={{color:'#ef4444'}}>*</span></label>
                <input list="clientList" name="cliente" value={formData.cliente} onChange={handleChange} style={getInputStyle(errors.cliente)} placeholder="Ej: Juan Pérez" />
                <datalist id="clientList">{savedClients.map((c,i) => <option key={i} value={c}/>)}</datalist>
                {errors.cliente && <p style={errMsg}>⚠ {errors.cliente}</p>}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Fecha de entrega <span style={{color:'#ef4444'}}>*</span></label>
              <input type="date" name="fechaSolicitud" value={formData.fechaSolicitud} onChange={handleChange} style={{ ...getInputStyle(errors.fechaSolicitud), maxWidth: 220 }} />
              {errors.fechaSolicitud && <p style={errMsg}>⚠ {errors.fechaSolicitud}</p>}
            </div>

            {/* FICHA TÉCNICA — tipo producción: preview del producto */}
            {type === 'produccion' && formData.referencia && techSheetPreview && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Ficha técnica vinculada</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#4ade80' }}>
                      {techSheetPreview.type || 'Ficha del producto'} · Versión {techSheetPreview.version}
                    </p>
                  </div>
                  <button type="button" onClick={() => setShowTechSheet(true)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #bbf7d0', background: '#dcfce7', color: '#15803d', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    Vista previa
                  </button>
                </div>
              </div>
            )}

            {/* FICHA TÉCNICA — tipo diseño */}
            {type === 'diseno' && (
              <div style={{ background: '#fdf4ff', border: '1.5px dashed #e879f9', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#9333ea' }}>Ficha técnica</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#a78bfa' }}>
                      {techSheetData ? '✓ Ficha técnica creada' : 'Opcional: crea la ficha del nuevo diseño'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setShowTechSheet(true)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#9333ea', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {techSheetData ? 'Ver / Editar' : 'Crear ficha técnica'}
                  </button>
                </div>
              </div>
            )}

            {/* ARTÍCULOS EXTRA */}
            {extraRefs.length > 0 && (
              <>
                {sectionTitle(`Artículos adicionales (${extraRefs.length})`)}
                {extraRefs.map((ref, i) => (
                  <ExtraRefRow key={i} index={i} data={ref} onChange={updateExtraRef} onRemove={removeExtraRef} errors={extraErrors[i] || {}} />
                ))}
              </>
            )}

            {extraRefs.length > 0 && (
              <div style={{ background: '#fff0fb', border: '1px solid #f9a8d4', borderRadius: 8, padding: '9px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Total ({1 + extraRefs.length} artículos)</span>
                <span style={{ fontWeight: 800, color: '#FF4FD6', fontSize: 15 }}>{totalCantidad} uds</span>
              </div>
            )}

            <button type="button" onClick={addExtraRef}
              style={{ background: 'none', border: '1.5px dashed #f9a8d4', borderRadius: 8, color: '#FF4FD6', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '8px 14px', marginBottom: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              + Agregar otro artículo a la orden
            </button>

            {/* BOTONES */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4, borderTop: '1px solid #f3f4f6' }}>
              <Button type="button" variant="secondary" onClick={handleCancelClick}>Cancelar</Button>
              <Button type="submit" variant="primary">Revisar y guardar</Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── MODAL FICHA TÉCNICA ─────────────────────────────────────────────── */}
      {showTechSheet && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '95%', maxWidth: 1100, maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>📋 Ficha Técnica</h3>
                {type === 'produccion' && (
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>Solo lectura · Se vinculará automáticamente al crear la orden</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowTechSheet(false)}
                  style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#555', cursor: 'pointer', fontSize: 13 }}>
                  Cerrar
                </button>
                {type === 'diseno' && (
                  <button type="button" onClick={() => {
                    setAlertConfig({ open: true, type: 'success', title: 'Ficha guardada', message: 'La ficha técnica fue asociada a la orden.', onConfirm: null });
                    setShowTechSheet(false);
                  }}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#FF4FD6,#c026d3)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    Guardar ficha
                  </button>
                )}
              </div>
            </div>
            <TechnicalSheet
              sheet={type === 'produccion' ? techSheetPreview : (techSheetData || null)}
              isEditing={type === 'diseno'}
              onChange={(data) => { if (type === 'diseno') setTechSheetData(data); }}
            />
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR ─────────────────────────────────────────────────── */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 26, width: 460, maxWidth: '92%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff0fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1f2937' }}>Confirmar nueva orden</h3>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>Revisa los datos antes de guardar</p>
              </div>
            </div>
            <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f5d0fe' }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</span>
                <span style={{ background: type==='produccion'?'#fce7f3':'#f3e8ff', color: type==='produccion'?'#be185d':'#7c3aed', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {type === 'produccion' ? 'Producción' : 'Diseño'}
                </span>
              </div>
              {[
                ['Producto', formData.referencia ? `${formData.referencia} — ${formData.producto || ''}` : '—'],
                ['Cantidad' + (extraRefs.length > 0 ? ' total' : ''), totalCantidad > 0 ? `${totalCantidad} uds` : '—', extraRefs.length > 0],
                ['Color', formData.color || '—'],
                ['Cliente', formData.cliente || '—'],
                ['Fecha de entrega', formData.fechaSolicitud || '—'],
              ].map(([label, value, hl]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: hl ? '#FF4FD6' : '#1f2937', fontSize: 13 }}>{value}</span>
                </div>
              ))}
              {type === 'produccion' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>Ficha técnica</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: techSheetPreview ? '#16a34a' : '#f59e0b' }}>
                    {techSheetPreview ? `✓ v${techSheetPreview.version}` : 'Sin ficha'}
                  </span>
                </div>
              )}
              {type === 'diseno' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>Ficha técnica</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: techSheetData ? '#9333ea' : '#9ca3af' }}>
                    {techSheetData ? '✓ Incluida' : 'Sin ficha'}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)}>Volver a editar</Button>
              <Button type="button" variant="primary" onClick={handleConfirm}>Confirmar y crear</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductionForm;
