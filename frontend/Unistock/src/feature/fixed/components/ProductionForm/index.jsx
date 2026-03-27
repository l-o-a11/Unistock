/**
 * @file ProductionForm/index.jsx
 * @description Formulario modal para crear una nueva orden de producción.
 *
 * PROPS:
 *   onSubmit      {function(data)} — recibe los datos del formulario al confirmar
 *   onCancel      {function}       — cierra el formulario sin guardar
 *   initialData   {object|null}    — datos pre-llenados (desde productos dañados)
 *   damageNotice  {object|null}    — aviso de origen por daño
 *     { originalOrderNumber, originalOrderStatus, damagedCount, totalDamagedQty }
 */
import React, { useState, useEffect, useRef } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';
import { validators } from '../../../shared/utils/validators';
import { blockInput } from '../../../shared/utils/blockInput';
import TechnicalSheet from '../TechnicalSheet';
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from '../../../shared/utils/validationStyles';

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const getInputStyle = (err) => getInputStyleBox(err);

const typeBox = (active) => ({
  flex: 1, border: active ? '2px solid #ff4fd6' : '1.5px solid #e5e7eb',
  borderRadius: 12, padding: 14, cursor: 'pointer',
  background: active ? '#fff0fb' : '#fafafa', transition: 'all 0.15s',
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: FILA DE ARTÍCULO EXTRA
// ─────────────────────────────────────────────────────────────────────────────
const ExtraRefRow = ({ index, data, onChange, onRemove, errors = {} }) => (
  <div style={{
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: '#fff8fe', border: '1px solid #f9a8d4',
    borderRadius: 10, padding: '12px 12px 10px', marginBottom: 8, position: 'relative',
  }}>
    <span style={{ position: 'absolute', top: 7, left: 12, fontSize: 10, color: '#ff4fd6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      Artículo #{index + 2}
    </span>
    <div style={{ flex: 1, marginTop: 20 }}>
      <label style={labelStyle}>Cantidad <span style={requiredStar}>*</span></label>
      <input
        type="text" inputMode="numeric" value={data.cantidad}
        onChange={e => { if (!blockInput.onlyNumbers(e)) return; if (e.target.value === "0") return; onChange(index, 'cantidad', e.target.value); }}
        style={getInputStyle(errors.cantidad)} placeholder="Ej: 100"
      />
      {errors.cantidad && <span style={errMsg}>{errors.cantidad}</span>}
    </div>
    <div style={{ flex: 1, marginTop: 20 }}>
      <label style={labelStyle}>Color <span style={requiredStar}>*</span></label>
      <input
        type="text" value={data.color}
        onChange={e => { if (!blockInput.onlyLetters(e)) return; onChange(index, 'color', e.target.value); }}
        style={getInputStyle(errors.color)} placeholder="Ej: Rojo"
      />
      {errors.color && <span style={errMsg}>{errors.color}</span>}
    </div>
    <div style={{ flex: 1, marginTop: 20 }}>
      <label style={labelStyle}>Fecha de entrega <span style={requiredStar}>*</span></label>
      <input type="date" value={data.fecha}
        onChange={e => onChange(index, 'fecha', e.target.value)}
        style={getInputStyle(errors.fecha)}
      />
      {errors.fecha && <span style={errMsg}>{errors.fecha}</span>}
    </div>
    <button type="button" onClick={() => onRemove(index)}
      style={{ marginTop: 36, width: 28, height: 28, borderRadius: '50%', background: '#fff0fb', border: '1px solid #ff4fd6', color: '#ff4fd6', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      ×
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ProductionForm = ({ onSubmit, onCancel, initialData = null, damageNotice = null }) => {
  const modalRef = useRef(null);

  const [type,          setType]         = useState('produccion');
  const [products,      setProducts]     = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [extraRefs,     setExtraRefs]    = useState(
    (initialData?.referencias || []).map(r => ({
      cantidad: String(r.cantidad || ''),
      color:    r.color || '',
      fecha:    '',
    }))
  );
  const [extraErrors,   setExtraErrors]  = useState(
    (initialData?.referencias || []).map(() => ({}))
  );
  const [showConfirm,   setShowConfirm]  = useState(false);
  const [showTechSheet, setShowTechSheet]= useState(false);
  const [techSheetData, setTechSheetData]= useState(null);
  const [techSheetPreview, setTechSheetPreview] = useState(null);
  const [loadingSheet,  setLoadingSheet] = useState(false);
  const [savedColors,   setSavedColors]  = useState([]);
  const [savedClients,  setSavedClients] = useState([]);
  const [designImages,  setDesignImages] = useState([]); // base64 strings para tipo diseño

  const [formData, setFormData] = useState({
    referencia:     initialData?.referencia     || '',
    producto:       initialData?.producto       || '',
    cantidad:       String(initialData?.cantidad || ''),
    color:          initialData?.color          || '',
    cliente:        initialData?.cliente        || '',
    fechaSolicitud: '',
  });

  const [errors,      setErrors]      = useState({});
  const [alertConfig, setAlertConfig] = useState({ open: false, type: 'warning', title: '', message: '', onConfirm: null });

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

  useEffect(() => {
    if (type !== 'produccion' || !formData.referencia) { setTechSheetPreview(null); return; }
    setLoadingSheet(true);
    setTechSheetPreview(null);
    (async () => {
      try {
        const { productAPI } = await import('../../../products/services/productAPI');
        const versions = await productAPI.getTechnicalSheetVersions(formData.referencia);
        setTechSheetPreview(versions && versions.length > 0 ? versions[0] : null);
      } catch { setTechSheetPreview(null); }
      finally { setLoadingSheet(false); }
    })();
  }, [formData.referencia, type]);

  useEffect(() => {
    setSavedColors(JSON.parse(localStorage.getItem('productionColors') || '[]'));
    setSavedClients(JSON.parse(localStorage.getItem('productionClients') || '[]'));
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleCancelClick(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const saveColor  = (c) => { if (c && !savedColors.includes(c))  { const u = [c, ...savedColors].slice(0,10);  setSavedColors(u);  localStorage.setItem('productionColors',  JSON.stringify(u)); } };
  const saveClient = (c) => { if (c && !savedClients.includes(c)) { const u = [c, ...savedClients].slice(0,10); setSavedClients(u); localStorage.setItem('productionClients', JSON.stringify(u)); } };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (name === 'referencia') {
      const sel = products.find(p => p.reference === value || p.id === value);
      setFormData(prev => ({ ...prev, referencia: value, producto: sel ? sel.name : value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addExtraRef    = () => { setExtraRefs(p => [...p, { cantidad: '', color: '', fecha: '' }]); setExtraErrors(p => [...p, {}]); };
  const removeExtraRef = (i) => { setExtraRefs(p => p.filter((_,idx) => idx !== i)); setExtraErrors(p => p.filter((_,idx) => idx !== i)); };
  const updateExtraRef = (i, f, v) => {
    setExtraRefs(p => p.map((r,idx) => idx === i ? { ...r, [f]: v } : r));
    setExtraErrors(p => p.map((e,idx) => idx === i ? { ...e, [f]: undefined } : e));
  };

  const totalCantidad = (Number(formData.cantidad) || 0) + extraRefs.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);

  const validate = () => {
    const newErrors = {}; const missing = []; const newExtraErr = extraRefs.map(() => ({}));
    if (!formData.referencia) { newErrors.referencia = 'Selecciona un producto'; missing.push('Producto / Artículo'); }
    const cantErr = validators.positiveInteger(formData.cantidad);
    if (cantErr) { newErrors.cantidad = cantErr; missing.push('Cantidad'); }
    const colorErr = validators.required(formData.color) || validators.onlyLetters(formData.color);
    if (colorErr) { newErrors.color = colorErr; missing.push('Color'); }
    const clientErr = validators.required(formData.cliente) || validators.onlyLetters(formData.cliente);
    if (clientErr) { newErrors.cliente = clientErr; missing.push('Cliente'); }
    if (!formData.fechaSolicitud) { newErrors.fechaSolicitud = 'Selecciona una fecha'; missing.push('Fecha de entrega'); }
    extraRefs.forEach((r, i) => {
      const ce = validators.positiveInteger(r.cantidad);
      if (ce) { newExtraErr[i].cantidad = ce; missing.push(`Artículo #${i+2} — Cantidad`); }
      const coe = validators.required(r.color) || validators.onlyLetters(r.color);
      if (coe) { newExtraErr[i].color = coe; missing.push(`Artículo #${i+2} — Color`); }
      if (!r.fecha) { newExtraErr[i].fecha = 'Requerida'; missing.push(`Artículo #${i+2} — Fecha`); }
    });
    setErrors(newErrors); setExtraErrors(newExtraErr);
    if (missing.length > 0) {
      setAlertConfig({ open: true, type: 'warning', title: `Faltan ${missing.length} campo${missing.length > 1 ? 's' : ''} por completar`, message: missing.map(m => `• ${m}`).join('\n'), onConfirm: null });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) setShowConfirm(true); };

  const handleConfirm = () => {
    saveColor(formData.color); saveClient(formData.cliente);
    onSubmit({
      tipo: type, ...formData, referencias: extraRefs,
      techSheet: type === 'diseno' ? techSheetData : null,
      designImages: type === 'diseno' ? designImages : [],
      ...(damageNotice ? { fromDamaged: true, originalOrderNumber: damageNotice.originalOrderNumber } : {}),
    });
    setShowConfirm(false);
    setAlertConfig({ open: true, type: 'success', title: 'Orden creada', message: 'La orden de producción fue creada correctamente.', onConfirm: null });
  };

  const handleCancelClick = () => {
    setAlertConfig({
      open: true, type: 'confirm', title: 'Cancelar',
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
        <div ref={modalRef} style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', position: 'relative' }}>

          {damageNotice && (
            <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', borderBottom: '3px solid #f59e0b', padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#92400e' }}>Nueva orden por productos dañados</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>
                  Esta orden se crea a partir de{' '}
                  <strong>{damageNotice.damagedCount} artículo{damageNotice.damagedCount !== 1 ? 's' : ''}</strong>{' '}
                  ({damageNotice.totalDamagedQty} uds) dañados durante el paso{' '}
                  <strong>{damageNotice.originalOrderStatus}</strong> de la orden{' '}
                  <strong>#{damageNotice.originalOrderNumber}</strong>.
                </p>
              </div>
            </div>
          )}

          <div style={{ padding: '28px 30px' }}>
            <button onClick={handleCancelClick} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 14, zIndex: 1 }}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: damageNotice ? '#f59e0b' : '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {damageNotice ? (
                  <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <polyline points="9,15 12,18 15,15"/>
                  </svg>
                )}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
                  {damageNotice ? 'Nueva orden (reposición por daño)' : 'Nueva orden de producción'}
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
                  {damageNotice ? `Reposición de orden #${damageNotice.originalOrderNumber}` : 'Completa todos los campos obligatorios'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {sectionTitle('Tipo de solicitud')}
              <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                {[['produccion','Producción','Artículo con ficha técnica existente'],['diseno','Diseño','Nuevo diseño o boceto a crear']].map(([val, label, desc]) => (
                  <div key={val} style={typeBox(type === val)} onClick={() => setType(val)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${type === val ? '#ff4fd6' : '#d1d5db'}`, background: type === val ? '#ff4fd6' : 'transparent', flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{label}</span>
                    </div>
                    <small style={{ fontSize: 11, color: '#9ca3af', display: 'block', paddingLeft: 24 }}>{desc}</small>
                  </div>
                ))}
              </div>

              {sectionTitle('Artículo principal')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Producto / Artículo <span style={requiredStar}>*</span></label>
                  <select name="referencia" value={formData.referencia} onChange={handleChange} style={getInputStyle(errors.referencia)}>
                    <option value="">{loadingProducts ? 'Cargando productos...' : 'Seleccionar producto...'}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.reference || p.id}>{p.reference} — {p.name}</option>
                    ))}
                  </select>
                  {errors.referencia && <span style={errMsg}>⚠ {errors.referencia}</span>}
                  {type === 'produccion' && formData.referencia && (
                    <p style={{ margin: '5px 0 0', fontSize: 11, color: loadingSheet ? '#9ca3af' : techSheetPreview ? '#16a34a' : '#f59e0b' }}>
                      {loadingSheet ? '⏳ Buscando ficha técnica...' : techSheetPreview ? `✓ Ficha técnica disponible (v${techSheetPreview.version})` : '⚠ Sin ficha técnica registrada'}
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>
                    Cantidad
                    {extraRefs.length > 0 && totalCantidad > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4fd6', background: '#fff0fb', padding: '2px 8px', borderRadius: 10, marginLeft: 6 }}>
                        Total: {totalCantidad}
                      </span>
                    )}
                    <span style={requiredStar}> *</span>
                  </label>
                  <input
                    name="cantidad" type="text" inputMode="numeric"
                    value={formData.cantidad}
                    onChange={e => {
                      if (!blockInput.onlyNumbers(e)) return;
                      if (e.target.value === "0") return; // no permitir 0
                      handleChange(e);
                    }}
                    style={getInputStyle(errors.cantidad)} placeholder="Ej: 100"
                  />
                  {errors.cantidad && <span style={errMsg}>⚠ {errors.cantidad}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Color <span style={requiredStar}>*</span></label>
                  <input
                    list="colorList" name="color" value={formData.color}
                    onChange={e => { if (!blockInput.onlyLetters(e)) return; handleChange(e); }}
                    style={getInputStyle(errors.color)} placeholder="Ej: Negro, Blanco..."
                  />
                  <datalist id="colorList">{savedColors.map((c, i) => <option key={i} value={c} />)}</datalist>
                  {errors.color && <span style={errMsg}>⚠ {errors.color}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Cliente <span style={requiredStar}>*</span></label>
                  <input
                    list="clientList" name="cliente" value={formData.cliente}
                    onChange={e => { if (!blockInput.onlyLetters(e)) return; handleChange(e); }}
                    style={getInputStyle(errors.cliente)} placeholder="Ej: Juan Pérez"
                  />
                  <datalist id="clientList">{savedClients.map((c, i) => <option key={i} value={c} />)}</datalist>
                  {errors.cliente && <span style={errMsg}>⚠ {errors.cliente}</span>}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Fecha de entrega <span style={requiredStar}>*</span></label>
                <input
                  type="date" name="fechaSolicitud" value={formData.fechaSolicitud}
                  onChange={handleChange}
                  style={{ ...getInputStyle(errors.fechaSolicitud), maxWidth: 220 }}
                />
                {errors.fechaSolicitud && <span style={errMsg}>⚠ {errors.fechaSolicitud}</span>}
              </div>

              {type === 'produccion' && formData.referencia && techSheetPreview && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Ficha técnica vinculada</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#4ade80' }}>{techSheetPreview.type || 'Ficha del producto'} · Versión {techSheetPreview.version}</p>
                    </div>
                    <Button variant="ghost" type="button" onClick={() => setShowTechSheet(true)}>Vista previa</Button>
                  </div>
                </div>
              )}

              {type === 'diseno' && (
                <div style={{ background: '#fdf4ff', border: '1.5px dashed #e879f9', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#9333ea' }}>
                    📸 Imágenes del diseño
                    <span style={{ fontWeight: 400, color: '#a78bfa', marginLeft: 6 }}>— Sube bocetos o referencias visuales (opcional)</span>
                  </p>

                  {/* Miniaturas de imágenes ya cargadas */}
                  {designImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {designImages.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '2px solid #f0abfc' }}>
                          <img src={src} alt={`Diseño ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setDesignImages(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón subir */}
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: 9,
                    border: '1.5px solid #e879f9', background: '#fff',
                    color: '#9333ea', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {designImages.length > 0 ? 'Agregar más imágenes' : 'Subir imágenes del diseño'}
                    <input
                      type="file" accept="image/*" multiple style={{ display: 'none' }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setDesignImages(prev => [...prev, ev.target.result]);
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {designImages.length > 0 && (
                    <span style={{ marginLeft: 10, fontSize: 11, color: '#9ca3af' }}>
                      {designImages.length} imagen{designImages.length !== 1 ? 'es' : ''} seleccionada{designImages.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

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
                  <span style={{ fontWeight: 800, color: '#ff4fd6', fontSize: 15 }}>{totalCantidad} uds</span>
                </div>
              )}

              <button type="button" onClick={addExtraRef}
                style={{ background: 'none', border: '1.5px dashed #f9a8d4', borderRadius: 8, color: '#ff4fd6', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '8px 14px', marginBottom: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                + Agregar otro artículo a la orden
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4, borderTop: '1px solid #f3f4f6' }}>
                <Button type="button" variant="secondary" onClick={handleCancelClick}>Cancelar</Button>
                <Button type="submit" variant="primary">Revisar y guardar</Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showTechSheet && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '95%', maxWidth: 1100, maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>📋 Ficha Técnica</h3>
                {type === 'produccion' && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>Solo lectura · Se vinculará automáticamente al crear la orden</p>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button type="button" variant="secondary" onClick={() => setShowTechSheet(false)}>Cerrar</Button>
                {type === 'diseno' && (
                  <Button type="button" variant="primary" onClick={() => {
                    setAlertConfig({ open: true, type: 'success', title: 'Ficha guardada', message: 'La ficha técnica fue asociada a la orden.', onConfirm: null });
                    setShowTechSheet(false);
                  }}>
                    Guardar ficha
                  </Button>
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

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 26, width: 460, maxWidth: '92%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: damageNotice ? '#fef3c7' : '#fff0fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {damageNotice ? '⚠️' : '📋'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1f2937' }}>
                  {damageNotice ? 'Confirmar orden de reposición' : 'Confirmar nueva orden'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>Revisa los datos antes de guardar</p>
              </div>
            </div>

            {damageNotice && (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#92400e' }}>
                ⚠️ Reposición de <strong>{damageNotice.damagedCount} artículo{damageNotice.damagedCount !== 1 ? 's' : ''}</strong> dañados de la orden <strong>#{damageNotice.originalOrderNumber}</strong>
              </div>
            )}

            <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f5d0fe' }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo</span>
                <span style={{ background: type === 'produccion' ? '#fce7f3' : '#f3e8ff', color: type === 'produccion' ? '#be185d' : '#7c3aed', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {type === 'produccion' ? 'Producción' : 'Diseño'}
                </span>
              </div>
              {[
                ['Producto',  formData.referencia ? `${formData.referencia} — ${formData.producto || ''}` : '—'],
                ['Cantidad' + (extraRefs.length > 0 ? ' total' : ''), totalCantidad > 0 ? `${totalCantidad} uds` : '—', extraRefs.length > 0],
                ['Color',     formData.color || '—'],
                ['Cliente',   formData.cliente || '—'],
                ['Entrega',   formData.fechaSolicitud || '—'],
              ].map(([label, value, hl]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: hl ? '#ff4fd6' : '#1f2937', fontSize: 13 }}>{value}</span>
                </div>
              ))}
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
