import React, { useState, useMemo, useEffect } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';
import { useSuppliers } from '../../../suppliers/hooks/mockSuppliers';
import { useSupplies } from '../../../supplies/hooks/useSupplies';
import SupplyForm from '../../../supplies/components/SupplyForm';
import SupplierForm from '../../../suppliers/components/SupplierForm';
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from '../../../shared/utils/validationStyles';

const sectionTitle = (t) => (
  <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>{t}</p>
);

const inp = (err) => getInputStyleBox(err);
const ddStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 100, maxHeight: 160, overflowY: 'auto', marginTop: 2,
};

const ShoppingForm = ({ onSubmit, onCancel }) => {
  const { suppliers, createSupplier } = useSuppliers();
  const { supplies, medidas, propiedades, categorias, createSupply } = useSupplies();

  const [formData, setFormData] = useState({
    numeroFactura: '', proveedorId: '', proveedor: '', fecha: '',
    observaciones: '', costoTotal: '', detalles: [],
  });
  const [errors, setErrors] = useState({});
  const [detalleActual, setDetalleActual] = useState({
    supplyId: '', nombre: '', medida: '', cantidad: '',
    costo: '', costoUnitario: '', descripcionAdicional: '',
  });
  const [insumoSearch, setInsumoSearch] = useState('');
  const [showInsumoDD, setShowInsumoDD] = useState(false);
  const [showCreateSupply, setShowCreateSupply] = useState(false);
  const [proveedorSearch, setProveedorSearch] = useState('');
  const [showProveedorDD, setShowProveedorDD] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });

  const closeAlert = () => setAlertConfig((p) => ({ ...p, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  const totalDetalles = useMemo(
    () => formData.detalles.reduce((a, d) => a + (d.costo || 0), 0),
    [formData.detalles]
  );
  useEffect(() => {
    if (formData.detalles.length > 0) {
      setFormData((p) => ({ ...p, costoTotal: totalDetalles.toFixed(2) }));
      setErrors((p) => ({ ...p, costoTotal: '' }));
    }
  }, [totalDetalles, formData.detalles.length]);

  const vReq = (v) => (!v && v !== 0 ? 'Este campo es obligatorio' : '');
  const vPos = (v) => (isNaN(v) || Number(v) <= 0 ? 'Debe ser mayor a 0' : '');

  const validateField = (name, value) => {
    let e = '';
    if (name === 'numeroFactura') e = vReq(value);
    if (name === 'proveedorId') e = vReq(value);
    if (name === 'fecha') e = vReq(value);
    if (name === 'costoTotal') e = vReq(value) || vPos(value);
    setErrors((p) => ({ ...p, [name]: e }));
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    validateField(name, value);
  };

  /* Proveedor */
  const filteredSuppliers = useMemo(() => {
    if (!proveedorSearch.trim()) return suppliers;
    return suppliers.filter((s) => s.nombreEmpresa?.toLowerCase().includes(proveedorSearch.toLowerCase()));
  }, [suppliers, proveedorSearch]);

  const handleSelectProveedor = (s) => {
    setFormData((p) => ({ ...p, proveedorId: s.id, proveedor: s.nombreEmpresa }));
    setProveedorSearch(s.nombreEmpresa);
    setShowProveedorDD(false);
    setErrors((p) => ({ ...p, proveedorId: '' }));
  };

  /* Insumo */
  const filteredSupplies = useMemo(() => {
    if (!insumoSearch.trim()) return supplies;
    return supplies.filter((s) => s.nombre?.toLowerCase().includes(insumoSearch.toLowerCase()));
  }, [supplies, insumoSearch]);

  const handleSelectInsumo = (s) => {
    setDetalleActual((p) => ({ ...p, supplyId: s.id, nombre: s.nombre, medida: s.medida || '' }));
    setInsumoSearch(s.nombre);
    setShowInsumoDD(false);
  };

  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    setDetalleActual((p) => {
      const u = { ...p, [name]: value };
      if (name === 'costo' || name === 'cantidad') {
        const c = parseFloat(name === 'costo' ? value : p.costo) || 0;
        const q = parseFloat(name === 'cantidad' ? value : p.cantidad) || 0;
        u.costoUnitario = q > 0 ? (c / q).toFixed(2) : '';
      }
      return u;
    });
  };

  const handleAgregarDetalle = () => {
    if (!detalleActual.nombre.trim()) { showAlert('warning', 'Campo requerido', 'Selecciona un producto o insumo.'); return; }
    if (!detalleActual.cantidad || Number(detalleActual.cantidad) <= 0) { showAlert('warning', 'Campo requerido', 'Ingresa una cantidad válida.'); return; }
    if (!detalleActual.costo || Number(detalleActual.costo) <= 0) { showAlert('warning', 'Campo requerido', 'Ingresa un costo válido.'); return; }
    setFormData((p) => ({
      ...p, detalles: [...p.detalles, {
        id: Date.now(), supplyId: detalleActual.supplyId || null,
        nombre: detalleActual.nombre.trim(), medida: detalleActual.medida || null,
        cantidad: parseFloat(detalleActual.cantidad), costo: parseFloat(detalleActual.costo),
        costoUnitario: parseFloat(detalleActual.costoUnitario) || 0,
        descripcionAdicional: detalleActual.descripcionAdicional.trim(),
      }],
    }));
    setDetalleActual({ supplyId: '', nombre: '', medida: '', cantidad: '', costo: '', costoUnitario: '', descripcionAdicional: '' });
    setInsumoSearch('');
  };

  const handleEliminarDetalle = (id) =>
    setFormData((p) => ({ ...p, detalles: p.detalles.filter((d) => d.id !== id) }));

  const handleCreateSupplierSubmit = async (data) => {
    try {
      const s = await createSupplier(data);
      handleSelectProveedor(s);
      setShowCreateSupplier(false);
      showAlert('success', 'Proveedor creado', `"${s.nombreEmpresa}" fue creado y seleccionado.`);
    } catch (e) { showAlert('error', 'Error', e.message || 'No se pudo crear el proveedor.'); }
  };

  const handleCreateSupplySubmit = async (data) => {
    try {
      const s = await createSupply(data);
      handleSelectInsumo(s);
      setShowCreateSupply(false);
      showAlert('success', 'Insumo creado', `"${s.nombre}" fue creado y seleccionado.`);
    } catch (e) { showAlert('error', 'Error', e.message || 'No se pudo crear el insumo.'); }
  };

  const handleSubmit = async () => {
    const fields = ['numeroFactura', 'proveedorId', 'fecha', 'costoTotal'];
    const newErrors = {};
    fields.forEach((f) => { const e = validateField(f, formData[f]); if (e) newErrors[f] = e; });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) { showAlert('warning', 'Campos inválidos', 'Corrige los campos marcados antes de guardar.'); return; }
    if (formData.detalles.length === 0) { showAlert('warning', 'Sin detalles', 'Agrega al menos un producto o insumo.'); return; }
    try {
      await onSubmit({ ...formData, costoTotal: parseFloat(formData.costoTotal) });
    } catch (e) { showAlert('error', 'Error al guardar', e.message || 'No se pudo guardar la compra.'); }
  };

  const handleCancel = () =>
    showAlert('confirm', '¿Cancelar?', 'Los datos ingresados se perderán.', () => { closeAlert(); onCancel?.(); });

  if (showCreateSupplier) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <SupplierForm onSubmit={handleCreateSupplierSubmit} onCancel={() => setShowCreateSupplier(false)} />
    </div>
  );
  if (showCreateSupply) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <SupplyForm categorias={categorias} medidas={medidas} propiedades={propiedades}
        onSubmit={handleCreateSupplySubmit} onCancel={() => setShowCreateSupply(false)} />
    </div>
  );

  const plusBtn = (onClick, title) => (
    <button type="button" onClick={onClick} title={title}
      style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#ff4fd6', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px #FF4FD644' }}>+</button>
  );

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: 16 }}>
        <div style={{ display: 'flex', backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 940, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', maxHeight: '92vh' }}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <div style={{ flex: '0 0 430px', padding: '28px 26px', overflowY: 'auto', maxHeight: '92vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>Crear nueva compra</h2>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Completa todos los campos obligatorios</p>
              </div>
            </div>

            {sectionTitle('Datos de la factura')}

            {/* Número de factura */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Número de factura <span style={requiredStar}>*</span></label>
              <input type="number" name="numeroFactura" value={formData.numeroFactura}
                onChange={handleChange} onBlur={(e) => validateField('numeroFactura', e.target.value)}
                placeholder="Ej: 0231" style={inp(errors.numeroFactura)} />
              {errors.numeroFactura && <span style={errMsg}>⚠ {errors.numeroFactura}</span>}
            </div>

            {/* Proveedor */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Proveedor <span style={requiredStar}>*</span></label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input value={proveedorSearch} placeholder="Buscar proveedor..."
                    style={inp(errors.proveedorId)}
                    onChange={(e) => { setProveedorSearch(e.target.value); setShowProveedorDD(true); if (!e.target.value) setFormData((p) => ({ ...p, proveedorId: '', proveedor: '' })); }}
                    onFocus={() => setShowProveedorDD(true)}
                    onBlur={() => setTimeout(() => setShowProveedorDD(false), 150)} />
                  {showProveedorDD && (
                    <div style={ddStyle}>
                      {filteredSuppliers.length > 0 ? filteredSuppliers.map((s) => (
                        <div key={s.id} onMouseDown={() => handleSelectProveedor(s)}
                          style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: '#333', borderBottom: '1px solid #f5f5f5' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf0f7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>{s.nombreEmpresa}</div>
                      )) : <div style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af' }}>Sin resultados</div>}
                    </div>
                  )}
                </div>
                {plusBtn(() => setShowCreateSupplier(true), 'Nuevo proveedor')}
              </div>
              {errors.proveedorId && <span style={errMsg}>⚠ {errors.proveedorId}</span>}
            </div>

            {/* Fecha + Observaciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Fecha <span style={requiredStar}>*</span></label>
                <input type="date" name="fecha" value={formData.fecha}
                  onChange={handleChange} onBlur={(e) => validateField('fecha', e.target.value)}
                  style={inp(errors.fecha)} />
                {errors.fecha && <span style={errMsg}>⚠ {errors.fecha}</span>}
              </div>
              <div>
                <label style={labelStyle}>Observaciones <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 10 }}>(opcional)</span></label>
                <input name="observaciones" value={formData.observaciones}
                  onChange={handleChange} placeholder="Ej. Compra urgente..."
                  style={inp(false)} />
              </div>
            </div>

            {/* Costo total */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>
                Costo total <span style={requiredStar}>*</span>
                {formData.detalles.length > 0 && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 10 }}>calculado automáticamente</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: formData.detalles.length > 0 ? '#ff4fd6' : '#9ca3af', fontWeight: 600 }}>$</span>
                <input type="number" name="costoTotal" value={formData.costoTotal}
                  onChange={formData.detalles.length === 0 ? handleChange : undefined}
                  readOnly={formData.detalles.length > 0}
                  placeholder="0.00"
                  style={{
                    ...inp(errors.costoTotal), paddingLeft: 24,
                    background: formData.detalles.length > 0 ? '#fdf4ff' : '#fff',
                    color: formData.detalles.length > 0 ? '#ff4fd6' : '#333',
                    fontWeight: formData.detalles.length > 0 ? 700 : 400,
                    cursor: formData.detalles.length > 0 ? 'default' : 'text',
                  }} />
              </div>
              {errors.costoTotal && <span style={errMsg}>⚠ {errors.costoTotal}</span>}
            </div>

            {sectionTitle('Detalles de la compra')}

            {/* Insumo */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Producto o insumo</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input value={insumoSearch} placeholder="Buscar insumo..."
                    style={inp(false)}
                    onChange={(e) => { setInsumoSearch(e.target.value); setShowInsumoDD(true); }}
                    onFocus={() => setShowInsumoDD(true)}
                    onBlur={() => setTimeout(() => setShowInsumoDD(false), 150)} />
                  {showInsumoDD && (
                    <div style={ddStyle}>
                      {filteredSupplies.length > 0 ? filteredSupplies.map((s) => (
                        <div key={s.id} onMouseDown={() => handleSelectInsumo(s)}
                          style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: '#333', borderBottom: '1px solid #f5f5f5' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf0f7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>{s.nombre}</div>
                      )) : <div style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af' }}>Sin resultados</div>}
                    </div>
                  )}
                </div>
                {plusBtn(() => setShowCreateSupply(true), 'Nuevo insumo')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Costo <span style={requiredStar}>*</span></label>
                <input type="number" name="costo" value={detalleActual.costo}
                  onChange={handleDetalleChange} placeholder="Ej: 20" style={inp(false)} />
              </div>
              <div>
                <label style={labelStyle}>Medida</label>
                <select name="medida" value={detalleActual.medida} onChange={handleDetalleChange} style={inp(false)}>
                  <option value="">Seleccionar...</option>
                  {medidas.map((m) => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Cantidad <span style={requiredStar}>*</span></label>
                <input type="number" name="cantidad" value={detalleActual.cantidad}
                  onChange={handleDetalleChange} style={inp(false)} />
              </div>
              <div>
                <label style={labelStyle}>Costo unitario <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 10 }}>auto</span></label>
                <input type="number" name="costoUnitario" value={detalleActual.costoUnitario}
                  readOnly placeholder="—"
                  style={{ ...inp(false), background: '#f9fafb', color: '#9ca3af', cursor: 'default' }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Descripción adicional <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 10 }}>(opcional)</span></label>
              <input name="descripcionAdicional" value={detalleActual.descripcionAdicional}
                onChange={handleDetalleChange} placeholder="Ej. Cajas de 12, presentación 500ml..."
                style={inp(false)} />
            </div>

            <button type="button" onClick={handleAgregarDetalle}
              style={{ background: 'none', border: '1.5px dashed #f9a8d4', borderRadius: 8, color: '#ff4fd6', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '8px 14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              + Agregar otro producto
            </button>
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div style={{ flex: 1, background: '#fafafa', borderLeft: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '28px 20px', overflowY: 'auto' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#333' }}>
                Resumen de compra
                <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>IVA incluido</span>
              </p>

              {formData.detalles.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      {['#', 'Producto', 'Medida', 'Cant.', 'Unitario', 'Subtotal', ''].map((h, i) => (
                        <th key={i} style={{ padding: '8px 6px', textAlign: i >= 3 ? 'right' : 'left', color: '#9ca3af', fontWeight: 600, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalles.map((d, idx) => {
                      const medidaLabel = medidas.find((m) => m.valor === d.medida)?.label ?? d.medida ?? '—';
                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '10px 6px', color: '#d1d5db', fontSize: 11, fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '10px 6px', color: '#1f2937' }}>
                            <div style={{ fontWeight: 500 }}>{d.nombre}</div>
                            {d.descripcionAdicional && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{d.descripcionAdicional}</div>}
                          </td>
                          <td style={{ padding: '10px 6px', color: '#6b7280' }}>{medidaLabel}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', color: '#6b7280' }}>{d.cantidad}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', color: '#6b7280' }}>${Number(d.costoUnitario).toFixed(2)}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600, color: '#1f2937' }}>${Number(d.costo).toFixed(2)}</td>
                          <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                            <button type="button" onClick={() => handleEliminarDetalle(d.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16 }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1d5db')}>×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#d1d5db', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🧾</div>
                  Los productos agregados aparecerán aquí
                </div>
              )}
            </div>

            {/* Footer derecha */}
            <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px' }}>
              {formData.detalles.length > 0 && (
                <div style={{ textAlign: 'right', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '0.05em' }}>TOTAL </span>
                  <span style={{ color: '#ff4fd6', fontWeight: 800, fontSize: 18, marginLeft: 6 }}>
                    ${totalDetalles.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button type="button" variant="secondary" onClick={handleCancel}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={handleSubmit}>Guardar Compra</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Alert isOpen={alertConfig.open} type={alertConfig.type} title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { alertConfig.onConfirm?.(); closeAlert(); }}
        onCancel={closeAlert} />
    </>
  );
};

export default ShoppingForm;