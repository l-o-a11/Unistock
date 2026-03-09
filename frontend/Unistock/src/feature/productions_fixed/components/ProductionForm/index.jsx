import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../products/hooks/useProducts';
import ProductFrom from "../../../products/components/ProductForm";

// ── Estilos base ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#555',
  marginBottom: '6px',
  display: 'block',
};

const boxStyle = (active) => ({
  flex: 1,
  border: active ? '2px solid #FF4FD6' : '1px solid #ddd',
  borderRadius: 12,
  padding: 16,
  cursor: 'pointer',
  background: active ? '#fff0fb' : '#fafafa',
});

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, pointerEvents: 'none',
};
const modalBackgroundStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', pointerEvents: 'auto', zIndex: 1001,
};
const modalContentStyle = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto',
  backgroundColor: '#fff', borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1002, pointerEvents: 'auto',
};

// ── Fila de referencia extra ──────────────────────────────────────────────────
const ExtraRefRow = ({ index, data, onChange, onRemove }) => (
  <div style={{
    display: 'flex', gap: 12, alignItems: 'flex-end',
    background: '#fff8fe', border: '1px solid #f9a8d4',
    borderRadius: 10, padding: '12px 14px', marginBottom: 10,
    position: 'relative',
  }}>
    {/* Número de referencia */}
    <span style={{
      position: 'absolute', top: 8, left: 12,
      fontSize: 11, color: '#ec4899', fontWeight: 600,
    }}>
      Referencia #{index + 2}
    </span>

    {/* Cantidad */}
    <div style={{ flex: 1, marginTop: 18 }}>
      <label style={labelStyle}>Cantidad *</label>
      <input
        type="number" min="1"
        value={data.cantidad}
        onChange={(e) => onChange(index, 'cantidad', e.target.value)}
        style={inputStyle}
        placeholder="Ej: 100"
      />
    </div>

    {/* Color */}
    <div style={{ flex: 1, marginTop: 18 }}>
      <label style={labelStyle}>Color *</label>
      <input
        type="text"
        value={data.color}
        onChange={(e) => onChange(index, 'color', e.target.value)}
        style={inputStyle}
        placeholder="Ej: Rojo"
      />
    </div>

    {/* Fecha */}
    <div style={{ flex: 1, marginTop: 18 }}>
      <label style={labelStyle}>Fecha de entrega *</label>
      <input
        type="date"
        value={data.fecha}
        onChange={(e) => onChange(index, 'fecha', e.target.value)}
        style={inputStyle}
      />
    </div>

    {/* Botón quitar */}
    <button
      type="button"
      onClick={() => onRemove(index)}
      title="Quitar referencia"
      style={{
        marginBottom: 2, marginLeft: 4,
        width: 30, height: 30, borderRadius: '50%',
        background: '#fee2e2', border: 'none',
        color: '#ef4444', cursor: 'pointer',
        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      ×
    </button>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const ProductionForm = ({ Production, onSubmit, onCancel }) => {
  const { products = [] } = useProducts();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [type, setType]                     = useState("produccion");
  const [savedColors, setSavedColors]       = useState([]);
  const [savedClients, setSavedClients]     = useState([]);
  const [extraRefs, setExtraRefs]           = useState([]); // referencias adicionales
  const [showConfirm, setShowConfirm]       = useState(false); // modal confirmación

  const [formData, setFormData] = useState({
    referencia: '', cantidad: '', color: '',
    cliente: '', fechaSolicitud: '', diseno: '',
  });

  useEffect(() => {
    const colors  = JSON.parse(localStorage.getItem('productionColors')  || '[]');
    const clients = JSON.parse(localStorage.getItem('productionClients') || '[]');
    setSavedColors(colors);
    setSavedClients(clients);
  }, []);

  const saveColor  = (c) => { if (c && !savedColors.includes(c))   { const u = [c, ...savedColors].slice(0,10);  setSavedColors(u);  localStorage.setItem('productionColors',  JSON.stringify(u)); } };
  const saveClient = (c) => { if (c && !savedClients.includes(c))  { const u = [c, ...savedClients].slice(0,10); setSavedClients(u); localStorage.setItem('productionClients', JSON.stringify(u)); } };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Refs extra ──────────────────────────────────────────────────────────────
  const addExtraRef = () =>
    setExtraRefs(prev => [...prev, { cantidad: '', color: '', fecha: '' }]);

  const updateExtraRef = (i, field, value) =>
    setExtraRefs(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const removeExtraRef = (i) =>
    setExtraRefs(prev => prev.filter((_, idx) => idx !== i));

  // ── Submit → abre confirmación ──────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // ── Confirmar → guarda y cierra ─────────────────────────────────────────────
  const handleConfirm = () => {
    saveColor(formData.color);
    saveClient(formData.cliente);
    onSubmit({ tipo: type, ...formData, referencias: extraRefs });
    setShowConfirm(false);
  };

  // ── Cancelar confirmación ───────────────────────────────────────────────────
  const handleDeny = () => setShowConfirm(false);

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>Crear nueva orden de producción</h2>

      <form onSubmit={handleSubmit}>

        {/* TIPO */}
        <p style={{ fontWeight: 500, marginBottom: 10 }}>Tipo de Solicitud</p>
        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
          <div style={boxStyle(type === "produccion")} onClick={() => setType("produccion")}>
            <input type="radio" checked={type === "produccion"} readOnly />
            <p style={{ fontWeight: 600 }}>Producción</p>
            <small>Solicitud para la confección de un artículo existente.</small>
          </div>
          <div style={boxStyle(type === "diseno")} onClick={() => setType("diseno")}>
            <input type="radio" checked={type === "diseno"} readOnly />
            <p style={{ fontWeight: 600 }}>Diseño</p>
            <small>Solicitud para crear un nuevo diseño o boceto.</small>
          </div>
        </div>

        {/* REFERENCIA + CANTIDAD/DISEÑO */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Referencia *</label>
            <select name="referencia" style={inputStyle} value={formData.referencia} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {products.length > 0
                ? products.map(p => <option key={p.id} value={p.reference}>{p.reference} - {p.name}</option>)
                : <><option>Ref 001</option><option>Ref 002</option></>
              }
            </select>
          </div>

          {type === "produccion" && (
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Cantidad *</label>
              <input name="cantidad" style={inputStyle} value={formData.cantidad} onChange={handleChange} required />
            </div>
          )}

          {type === "diseno" && (
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Diseño *</label>
              <button type="button" onClick={() => setShowCreateForm(true)}
                style={{ width: '100%', padding: 10, borderRadius: 8, background: '#FF4FD6', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Crear ficha técnica
              </button>
              {showCreateForm && (
                <div style={modalOverlayStyle}>
                  <div style={modalBackgroundStyle} onClick={() => setShowCreateForm(false)} />
                  <div style={modalContentStyle}>
                    <ProductFrom onSubmit={(d) => { console.log("Ficha técnica creada:", d); setShowCreateForm(false); }} onCancel={() => setShowCreateForm(false)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLOR + CLIENTE */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Color *</label>
            <input list="colorList" name="color" style={inputStyle} value={formData.color} onChange={handleChange} placeholder="Ej: Blanco, Negro" required />
            <datalist id="colorList">{savedColors.map((c, i) => <option key={i} value={c} />)}</datalist>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Cliente *</label>
            <input list="clientList" name="cliente" style={inputStyle} value={formData.cliente} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
            <datalist id="clientList">{savedClients.map((c, i) => <option key={i} value={c} />)}</datalist>
          </div>
        </div>

        {/* FECHA SOLICITUD (solo diseño) */}
        {type === "diseno" && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Fecha de solicitud *</label>
            <input type="date" name="fechaSolicitud" style={inputStyle} onChange={handleChange} required />
          </div>
        )}

        {/* ── REFERENCIAS EXTRA ─────────────────────────────────────────────── */}
        {extraRefs.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {extraRefs.map((ref, i) => (
              <ExtraRefRow key={i} index={i} data={ref} onChange={updateExtraRef} onRemove={removeExtraRef} />
            ))}
          </div>
        )}

        {/* Link agregar referencia */}
        <button type="button" onClick={addExtraRef}
          style={{ background: 'none', border: 'none', color: '#FF4FD6', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 20 }}>
          + Agregar otra referencia a la orden
        </button>

        {/* BOTONES */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onCancel}
            style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#eee', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit"
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#FF4FD6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Guardar
          </button>
        </div>

      </form>

      {/* ── MODAL CONFIRMACIÓN ───────────────────────────────────────────────── */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff0fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18 }}>📋</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>Confirmar orden</h3>
            </div>

            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>¿Deseas guardar la siguiente orden de producción?</p>

            {/* Resumen */}
            <div style={{ background: '#fdf4ff', border: '1px solid #f9a8d4', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#9ca3af' }}>Tipo</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#9ca3af' }}>Referencia</span>
                <span style={{ fontWeight: 600 }}>{formData.referencia || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#9ca3af' }}>Cantidad</span>
                <span style={{ fontWeight: 600 }}>{formData.cantidad || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#9ca3af' }}>Color</span>
                <span style={{ fontWeight: 600 }}>{formData.color || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Cliente</span>
                <span style={{ fontWeight: 600 }}>{formData.cliente || '—'}</span>
              </div>

              {/* Referencias adicionales */}
              {extraRefs.length > 0 && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #f9a8d4', margin: '10px 0' }} />
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#ec4899', fontWeight: 600 }}>Referencias adicionales ({extraRefs.length})</p>
                  {extraRefs.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
                      <span style={{ color: '#9ca3af' }}>Ref #{i + 2}</span>
                      <span>{r.cantidad || '—'} uds · {r.color || '—'} · {r.fecha || '—'}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDeny}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>
                Cancelar
              </button>
              <button onClick={handleConfirm}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#FF4FD6', color: '#fff', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(255,79,214,0.3)' }}>
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionForm;