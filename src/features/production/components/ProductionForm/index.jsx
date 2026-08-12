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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';
import { validators } from '../../../shared/utils/validators';
import { blockInput } from '../../../shared/utils/blockInput';
import TechnicalSheet from '../../../products/components/TechnicalSheet';
import ThirdPartiesSection from './ThirdPartiesSection';
import { clientAPI } from '../../../shared/services/clientAPI';
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

const normalizeText = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getDefaultDeliveryDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: DROPDOWN DE CLIENTE (mismo diseño/estilo que ProductForm)
// ─────────────────────────────────────────────────────────────────────────────
const ClientDropdown = ({ value, onChange, clients = [], onCreateClient, touched, error }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (client) => {
    onChange(client);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", minWidth: "220px" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minHeight: "42px",
          boxSizing: "border-box",
          padding: "10px 14px",
          borderBottom: touched && error ? "2px solid #ff4fd6" : "1.5px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "14px",
          color: value ? "#1f2937" : "#9ca3af",
          userSelect: "none",
          backgroundColor: touched && error ? "#fff0fb" : (open ? "#fff0fb" : "transparent"),
          borderRadius: open ? "10px 10px 0 0" : "10px",
          transition: "background-color 0.15s",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "Seleccionar cliente"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginLeft: "10px" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxHeight: "260px", overflowY: "auto" }}>
            <div
              style={{ padding: "10px 14px", fontSize: "14px", backgroundColor: "#ff4fd6", color: "#fff", fontWeight: "600", cursor: "pointer" }}
              onClick={() => handleSelect(null)}
            >
              Seleccionar cliente
            </div>
            {clients.length > 0 ? (
              clients.map((client) => {
                const clientKey = client.id ?? client._id ?? client.documento;
                const isSelected = normalizeText(value) === normalizeText(client.nombre);
                return (
                  <div
                    key={clientKey}
                    onClick={() => handleSelect(client)}
                    style={{
                      padding: "10px 14px",
                      fontSize: "14px",
                      color: "#1f2937",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#fdf4ff" : "#fff",
                      borderTop: "1px solid #f3f4f6",
                      transition: "background-color 0.1s"
                    }}
                  >
                    <div>{client.nombre}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>{client.documento || "Sin documento"}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "10px 14px", fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
                Sin clientes disponibles
              </div>
            )}
            <div
              onClick={() => {
                setOpen(false);
                onCreateClient?.();
              }}
              style={{
                padding: "12px 14px",
                fontSize: "14px",
                color: "#ff4fd6",
                cursor: "pointer",
                borderTop: "1px solid #f3f4f6",
                backgroundColor: "#fff",
                fontWeight: "700"
              }}
            >
              + Crear nuevo cliente
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: FILA DE ARTÍCULO EXTRA
// ─────────────────────────────────────────────────────────────────────────────
const ExtraRefRow = ({ index, data, onChange, onRemove, errors = {}, savedColors = [] }) => {
  const [colorOpen, setColorOpen] = React.useState(false);
  return (
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
      <div style={{ flex: 1, marginTop: 20, position: 'relative' }}>
        <label style={labelStyle}>Color <span style={requiredStar}>*</span></label>
        <input
          type="text" value={data.color}
          onChange={e => { if (!blockInput.onlyLetters(e)) return; onChange(index, 'color', e.target.value); setColorOpen(false); }}
          onFocus={() => savedColors.length > 0 && setColorOpen(true)}
          style={getInputStyle(errors.color)} placeholder="Ej: Rojo"
          autoComplete="off"
        />
        {savedColors.length > 0 && (
          <button type="button" onClick={() => setColorOpen(v => !v)}
            style={{ position: 'absolute', right: 8, top: '62%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: colorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
        {colorOpen && savedColors.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: 2 }}>
            {savedColors.map((c, i) => (
              <button key={i} type="button"
                onClick={() => { onChange(index, 'color', c); setColorOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', border: 'none', background: data.color === c ? '#fdf4ff' : '#fff', cursor: 'pointer', fontSize: 12, color: '#374151', textAlign: 'left' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#e5e7eb', border: '1px solid rgba(0,0,0,0.08)' }} />
                {c}
              </button>
            ))}
          </div>
        )}
        {errors.color && <span style={errMsg}>{errors.color}</span>}
      </div>
      <button type="button" onClick={() => onRemove(index)}
        style={{ marginTop: 36, width: 28, height: 28, borderRadius: '50%', background: '#fff0fb', border: '1px solid #ff4fd6', color: '#ff4fd6', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        ×
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ProductionForm = ({ onSubmit, onCancel, initialData = null, damageNotice = null, defaultType = 'produccion' }) => {
  const modalRef = useRef(null);
  const colorRef = useRef(null);
  const [colorAccordionOpen, setColorAccordionOpen] = useState(false);

  // Cierra el accordion de color al hacer clic fuera de él
  useEffect(() => {
    if (!colorAccordionOpen) return;
    const handler = (e) => {
      if (colorRef.current && !colorRef.current.contains(e.target)) {
        setColorAccordionOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [colorAccordionOpen]);

  const [type, setType] = useState(defaultType || 'produccion');
  useEffect(() => {
    setType(defaultType || 'produccion');
  }, [defaultType]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [extraRefs, setExtraRefs] = useState(
    (initialData?.referencias || []).map(r => ({
      cantidad: String(r.cantidad || ''),
      color: r.color || '',
      fecha: '',
    }))
  );
  const [extraErrors, setExtraErrors] = useState(
    (initialData?.referencias || []).map(() => ({}))
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTechSheet, setShowTechSheet] = useState(false);
  const [techSheetData, setTechSheetData] = useState(null);
  const [techSheetPreview, setTechSheetPreview] = useState(null);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savedColors, setSavedColors] = useState([]);
  const [clientCatalog, setClientCatalog] = useState([]);
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [clientDraft, setClientDraft] = useState({ nombre: '', documento: '', telefono: '', correo: '' });
  const [clientFormError, setClientFormError] = useState('');
  const [designImages, setDesignImages] = useState([]);
  const [terceros, setTerceros] = useState([]);

  // Load saved colors from localStorage
  useEffect(() => {
    const savedColors = localStorage.getItem('productionColors');
    if (savedColors) {
      try {
        setSavedColors(JSON.parse(savedColors));
      } catch (e) {
        console.error('Error parsing saved colors', e);
      }
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const clients = await clientAPI.list();
      setClientCatalog(Array.isArray(clients) ? clients : []);
    } catch (err) {
      console.error('Error cargando clientes', err);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // ── Nueva referencia (solo tipo diseño) ───────────────────────────────────
  const [nuevaRefOpen, setNuevaRefOpen] = useState(false);
  const [nuevaRef, setNuevaRef] = useState({
    reference: '', name: '', category: '', description: '', price: '',
  });
  const [nuevaRefErrors, setNuevaRefErrors] = useState({});
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    referencia: initialData?.referencia || '',
    producto: initialData?.producto || '',
    cantidad: String(initialData?.cantidad || ''),
    color: initialData?.color || '',
    cliente: initialData?.cliente || initialData?.client || initialData?.cliente_name || initialData?.rawData?.cliente || '',
    fechaSolicitud: initialData?.fechaSolicitud || initialData?.fecha_entrega || initialData?.deliveryDate || (damageNotice ? getDefaultDeliveryDate() : ''),
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        referencia: initialData?.referencia || prev.referencia || '',
        producto: initialData?.producto || prev.producto || '',
        cantidad: initialData?.cantidad ? String(initialData.cantidad) : prev.cantidad,
        color: initialData?.color || prev.color || '',
        cliente: initialData?.cliente || initialData?.client || initialData?.cliente_name || initialData?.rawData?.cliente || prev.cliente || '',
        fechaSolicitud: initialData?.fechaSolicitud || initialData?.fecha_entrega || initialData?.deliveryDate || prev.fechaSolicitud || (damageNotice ? getDefaultDeliveryDate() : ''),
      }));
    }
  }, [initialData, damageNotice]);

  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({ open: false, type: 'warning', title: '', message: '', onConfirm: null });

  const loadProducts = async () => {
    if (productsLoaded || loadingProducts) return;
    setLoadingProducts(true);
try {
      const { productAPI } = await import('../../../products/services/productAPI');
      const data = await productAPI.getSummaries();
      // ✅ Solo mostrar productos activos en el selector al crear producción.
      const normalized = Array.isArray(data) ? data.filter(p => p.active !== false) : [];

      if (normalized.length === 0) {
        console.warn('[ProductionForm] ⚠️ No hay productos cargados');
      } else {
        console.log('[ProductionForm] ✓ Productos cargados:', normalized.length);
      }

      setProducts(normalized);
      setProductsLoaded(true);
    } catch (err) {
      console.error('[ProductionForm] ❌ Error cargando productos:', err?.message || err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { productCategoryAPI } = await import('../../../productCategories/services/productCategoryAPI');
        const cats = await productCategoryAPI.getAll();
        console.log('[ProductionForm] Categorías cargadas:', cats?.length || 0, 'items'); // DEBUG

        const categoryNames = (cats || []).map(c => c.name);
        if (categoryNames.length === 0) {
          console.warn('[ProductionForm] ⚠️ No hay categorías, usando fallback');
          setCategories(['Crop Top', 'Buzos', 'Body', 'Enterizos', 'Vestidos']);
        } else {
          console.log('[ProductionForm] ✓ Categorías cargadas:', categoryNames);
          setCategories(categoryNames);
        }
      } catch (err) {
        console.error('[ProductionForm] ❌ Error cargando categorías:', err?.message || err);
        setCategories(['Crop Top', 'Buzos', 'Body', 'Enterizos', 'Vestidos']);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { productCategoryAPI } = await import('../../../productCategories/services/productCategoryAPI');
        const cats = await productCategoryAPI.getAll();
        console.log('[ProductionForm] Categorías cargadas:', cats?.length || 0, 'items'); // DEBUG

        const categoryNames = (cats || []).map(c => c.name);
        if (categoryNames.length === 0) {
          console.warn('[ProductionForm] ⚠️ No hay categorías, usando fallback');
          setCategories(['Crop Top', 'Buzos', 'Body', 'Enterizos', 'Vestidos']);
        } else {
          console.log('[ProductionForm] ✓ Categorías cargadas:', categoryNames);
          setCategories(categoryNames);
        }
      } catch (err) {
        console.error('[ProductionForm] ❌ Error cargando categorías:', err?.message || err);
        setCategories(['Crop Top', 'Buzos', 'Body', 'Enterizos', 'Vestidos']);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (type !== 'produccion' || !formData.referencia) { return; }

      setLoadingSheet(true);
      try {
        const { productAPI } = await import('../../../products/services/productAPI');
        const versions = await productAPI.getTechnicalSheetVersions(formData.referencia);
        setTechSheetPreview(versions && versions.length > 0 ? versions[0] : null);
      } catch { setTechSheetPreview(null); }
      finally { setLoadingSheet(false); }
    })();
  }, [formData.referencia, type]);

  const isFormBlank = () => {
    const mainEmpty = !formData.referencia && !formData.cantidad && !formData.color && !formData.cliente && !formData.fechaSolicitud && !formData.producto;
    const extrasEmpty = extraRefs.every((r) => !r.cantidad && !r.color);
    const nuevaRefEmpty = !nuevaRefOpen || (
      !String(nuevaRef.reference || '').trim() &&
      !String(nuevaRef.name || '').trim() &&
      !String(nuevaRef.category || '').trim() &&
      !String(nuevaRef.price || '').trim() &&
      !String(nuevaRef.description || '').trim()
    );
    return mainEmpty && extrasEmpty && nuevaRefEmpty;
  };

  const handleCancelClick = useCallback(() => {
    if (isFormBlank()) {
      onCancel();
      return;
    }

    setAlertConfig({
      open: true, type: 'confirm', title: 'Cancelar',
      message: '¿Seguro que deseas cancelar? Se perderán los cambios.',
      onConfirm: () => { setAlertConfig(prev => ({ ...prev, open: false })); onCancel(); },
    });
  }, [onCancel, formData, extraRefs, nuevaRefOpen, nuevaRef]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleCancelClick(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCancelClick]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const saveColor = (c) => { if (c && !savedColors.includes(c)) { const u = [c, ...savedColors].slice(0, 10); setSavedColors(u); localStorage.setItem('productionColors', JSON.stringify(u)); } };

  // ✅ Cliente actualmente seleccionado (o null si no hay match) — mismo patrón que ProductForm
  const getSelectedClientObject = () => {
    const clientName = formData.cliente;
    if (!clientName) return null;
    return clientCatalog.find((c) => normalizeText(c.nombre) === normalizeText(clientName)) || null;
  };

  const openCreateClientModal = () => {
    setEditingClientId(null);
    setClientDraft({ nombre: '', documento: '', telefono: '', correo: '' });
    setClientFormError('');
    setClientFormOpen(true);
  };

  const openEditClientModal = () => {
    const client = getSelectedClientObject();
    if (!client) return;
    setEditingClientId(client.id || client._id || null);
    setClientDraft({
      nombre: client.nombre || '',
      documento: client.documento || '',
      telefono: client.telefono || '',
      correo: client.correo || '',
    });
    setClientFormError('');
    setClientFormOpen(true);
  };

  const closeClientModal = () => {
    setClientFormOpen(false);
    setClientFormError('');
    setEditingClientId(null);
  };

  const handleClientCreate = async (e) => {
    e.preventDefault();
    if (!clientDraft.nombre.trim() || !clientDraft.documento.trim()) {
      setClientFormError('Nombre y documento son obligatorios');
      return;
    }
    try {
      const payload = {
        nombre: clientDraft.nombre.trim(),
        documento: clientDraft.documento.trim(),
        telefono: clientDraft.telefono.trim(),
        correo: clientDraft.correo.trim(),
      };
      const saved = editingClientId
        ? await clientAPI.update(editingClientId, payload)
        : await clientAPI.create(payload);
      const nextClient = saved?.nombre || clientDraft.nombre.trim();
      setFormData(prev => ({ ...prev, cliente: nextClient }));
      if (errors.cliente) setErrors(prev => { const n = { ...prev }; delete n.cliente; return n; });
      await loadClients();
      setClientDraft({ nombre: '', documento: '', telefono: '', correo: '' });
      setEditingClientId(null);
      setClientFormError('');
      setClientFormOpen(false);
    } catch (err) {
      setClientFormError(err?.message || 'No se pudo guardar el cliente');
    }
  };

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

  const addExtraRef = () => { setExtraRefs(p => [...p, { cantidad: '', color: '' }]); setExtraErrors(p => [...p, {}]); };
  const removeExtraRef = (i) => { setExtraRefs(p => p.filter((_, idx) => idx !== i)); setExtraErrors(p => p.filter((_, idx) => idx !== i)); };
  const updateExtraRef = (i, f, v) => {
    setExtraRefs(p => p.map((r, idx) => idx === i ? { ...r, [f]: v } : r));
    setExtraErrors(p => p.map((e, idx) => idx === i ? { ...e, [f]: undefined } : e));
  };

  const totalCantidad = (Number(formData.cantidad) || 0) + extraRefs.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);

  const validateNuevaRef = () => {
    const errs = {};
    if (!nuevaRef.reference.trim()) errs.reference = 'La referencia es obligatoria';
    if (!nuevaRef.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!nuevaRef.category.trim()) errs.category = 'La categoría es obligatoria';
    // ✅ Fix: el precio ahora es obligatorio (antes era opcional)
    if (!nuevaRef.price || Number(nuevaRef.price) <= 0) errs.price = 'El precio es obligatorio';

    setNuevaRefErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validate = () => {
    const newErrors = {}; const missing = []; const newExtraErr = extraRefs.map(() => ({}));
    if (!nuevaRefOpen && !formData.referencia) { newErrors.referencia = 'Selecciona un producto'; missing.push('Producto / Artículo'); }
    if (nuevaRefOpen) {
      if (!nuevaRef.reference.trim()) missing.push('Nueva referencia — Código');
      if (!nuevaRef.name.trim()) missing.push('Nueva referencia — Nombre');
      if (!nuevaRef.category.trim()) missing.push('Nueva referencia — Categoría');

    }
    const cantErr = validators.positiveInteger(formData.cantidad);
    if (cantErr) { newErrors.cantidad = cantErr; missing.push('Cantidad'); }
    const colorErr = validators.required(formData.color) || validators.onlyLetters(formData.color);
    if (colorErr) { newErrors.color = colorErr; missing.push('Color'); }
    if (!formData.cliente) { newErrors.cliente = 'Selecciona un cliente'; missing.push('Cliente'); }
    if (!formData.fechaSolicitud) {
      newErrors.fechaSolicitud = 'Selecciona una fecha'; missing.push('Fecha de entrega');
    } else {
      // ✅ Fix: comparar como strings 'YYYY-MM-DD' (mismo formato que produce
      // getDefaultDeliveryDate() y el input date) evita desfases de zona
      // horaria que antes hacían saltar la alerta con fechas ya válidas.
      const minDateStr = getDefaultDeliveryDate();
      if (formData.fechaSolicitud < minDateStr) {
        newErrors.fechaSolicitud = 'La fecha debe ser al menos 1 mes desde hoy';
        missing.push('Fecha de entrega (mínimo 1 mes)');
      }
    }
    extraRefs.forEach((r, i) => {
      const ce = validators.positiveInteger(r.cantidad);
      if (ce) { newExtraErr[i].cantidad = ce; missing.push(`Artículo #${i + 2} — Cantidad`); }
      const coe = validators.required(r.color) || validators.onlyLetters(r.color);
      if (coe) { newExtraErr[i].color = coe; missing.push(`Artículo #${i + 2} — Color`); }

    });
    if (type === 'diseno' && !hasTechnicalSheetMaterials(techSheetData)) {
      missing.push('Ficha técnica — completa al menos un material o medida');
    }
    setErrors(newErrors); setExtraErrors(newExtraErr);
    if (nuevaRefOpen) validateNuevaRef();
    if (missing.length > 0) {
      setAlertConfig({ open: true, type: 'warning', title: `Faltan ${missing.length} campo${missing.length > 1 ? 's' : ''} por completar`, message: missing.map(m => `• ${m}`).join('\n'), onConfirm: null });
      return false;
    }
    return true;
  };

  const hasTechnicalSheetMaterials = (sheet) => {
    if (!sheet) return false;
    const items = [
      ...(sheet.fabrics || []),
      ...(sheet.cups || []),
      ...(sheet.closures || []),
      ...(sheet.accessories || []),
      ...(sheet.measurements || []),
    ];
    return items.some((item) => {
      if (!item) return false;
      return Object.values(item).some((value) => {
        if (Array.isArray(value)) return value.some((v) => String(v || "").trim() !== "");
        return String(value || "").trim() !== "";
      });
    });
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) setShowConfirm(true); };

  const [isCreating, setIsCreating] = useState(false);
  const handleConfirm = async () => {
    setIsCreating(true);
    try {
      saveColor(formData.color);
      // ✅ Fix: el color de los artículos adicionales nunca se guardaba en
      // localStorage — solo se guardaba el del artículo principal.
      extraRefs.forEach((r) => { if (r.color) saveColor(r.color); });
      let referenciaFinal = formData.referencia;
      let productoFinal = formData.producto;
      const shouldCreateReference = type === 'diseno' && nuevaRefOpen && nuevaRef.reference.trim();
      const canCreateProduct = shouldCreateReference && hasTechnicalSheetMaterials(techSheetData);

      if (shouldCreateReference && canCreateProduct) {
        try {
          const { productAPI } = await import('../../../products/services/productAPI');
          const created = await productAPI.create({
            reference: nuevaRef.reference.trim(),
            name: nuevaRef.name.trim(),
            category: nuevaRef.category.trim(),
            price: Number(nuevaRef.price) || 0,
            description: nuevaRef.description.trim(),
            stock: totalCantidad,
            technicalSheet: techSheetData,
          });
          referenciaFinal = created.reference || created.id || referenciaFinal;
          productoFinal = created.name || productoFinal;
        } catch (err) {
          console.error('Error creando referencia:', err);
          setAlertConfig({ open: true, type: 'error', title: 'Error al crear referencia', message: 'No se pudo registrar la nueva referencia. Intenta de nuevo.', onConfirm: null });
          setShowConfirm(false);
          return;
        }
      } else if (shouldCreateReference) {
        referenciaFinal = nuevaRef.reference.trim();
        productoFinal = nuevaRef.name.trim();
      }

      onSubmit({
        tipo: type,
        ...formData,
        referencia: referenciaFinal,
        producto: productoFinal,
        referencias: extraRefs,
        terceros,
        techSheet: type === 'diseno' ? techSheetData : null,
        designImages: type === 'diseno' ? designImages : [],
        nuevaRef: type === 'diseno' && nuevaRefOpen ? nuevaRef : null,
        ...(damageNotice ? {
          fromDamaged: true,
          originalOrderNumber: damageNotice.originalOrderNumber,
          originalOrderStatus: damageNotice.originalOrderStatus,
        } : {}),
      });
      setShowConfirm(false);
      setAlertConfig({ open: true, type: 'success', title: 'Orden creada', message: 'La orden de producción fue creada correctamente.', onConfirm: null });
    } finally {
      setIsCreating(false);
    }
  };

  const sectionTitle = (t) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>{t}</p>
  );

  const btnSecondary = {
    padding: '10px 24px',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    background: '#f3f4f6',
    color: '#374151',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const btnPrimary = {
    padding: '11px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#ff4fd6',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  };

  const selectedClient = getSelectedClientObject();
  const selectedProduct = products.find(p => p.reference === formData.referencia || p.id === formData.referencia);

  return (
    <>
      <Alert
        isOpen={alertConfig.open} type={alertConfig.type}
        title={alertConfig.title} message={alertConfig.message}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else setAlertConfig(prev => ({ ...prev, open: false })); }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      <div onClick={handleOverlayClick} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
        <div ref={modalRef} className="roles-modal-scroll" style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', position: 'relative' }}>

          {damageNotice && (
            <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', borderBottom: '3px solid #f59e0b', padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#92400e' }}>
                  {defaultType === 'diseno' ? 'Ficha técnica por productos dañados' : 'Nueva orden por productos dañados'}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>
                  Esta {defaultType === 'diseno' ? 'ficha técnica' : 'orden'} se crea a partir de{' '}
                  <strong>{damageNotice.damagedCount} artículo{damageNotice.damagedCount !== 1 ? 's' : ''}</strong>{' '}
                  ({damageNotice.totalDamagedQty} uds) dañados durante el paso{' '}
                  <strong>{damageNotice.originalOrderStatus}</strong> de la orden{' '}
                  <strong>#{damageNotice.originalOrderNumber}</strong>.
                  {damageNotice.replacementOrderNumber && (
                    <> La reposición de las unidades buenas ya se creó como la orden <strong>#{damageNotice.replacementOrderNumber}</strong> (Corte).</>
                  )}
                </p>
              </div>
            </div>
          )}

          <div style={{ padding: '28px 30px' }}>
            <button onClick={handleCancelClick} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 14, zIndex: 1 }}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: damageNotice ? '#f59e0b' : '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {damageNotice ? (
                  <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9,15 12,18 15,15" />
                  </svg>
                )}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
                  {damageNotice ? (defaultType === 'diseno' ? 'Nueva ficha técnica (por daño)' : 'Nueva orden (reposición por daño)') : 'Nueva orden de producción'}
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
                  {damageNotice ? `${defaultType === 'diseno' ? 'Ficha técnica' : 'Reposición'} de orden #${damageNotice.originalOrderNumber}` : 'Completa todos los campos obligatorios'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {sectionTitle('Tipo de solicitud')}
              <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                {[['produccion', 'Producción', 'Artículo con ficha técnica existente'], ['diseno', 'Diseño', 'Nuevo diseño o boceto a crear']].map(([val, label, desc]) => (
                  <div key={val} style={typeBox(type === val)} onClick={() => {
                    setType(val);
                    if (val !== 'diseno') { setNuevaRefOpen(false); setNuevaRef({ reference: '', name: '', category: '', description: '', price: '' }); setNuevaRefErrors({}); }
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${type === val ? '#ff4fd6' : '#d1d5db'}`, background: type === val ? '#ff4fd6' : 'transparent', flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{label}</span>
                    </div>
                    <small style={{ fontSize: 11, color: '#9ca3af', display: 'block', paddingLeft: 24 }}>{desc}</small>
                  </div>
                ))}
              </div>

              {sectionTitle('Artículo principal')}

              {/* ── Acordeón "Nueva Referencia" (solo tipo diseño) ─────────── */}
              {type === 'diseno' && (
                <div style={{ marginBottom: 14 }}>
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setNuevaRefOpen(v => !v);
                      if (!nuevaRefOpen) {
                        // Al abrir, limpiar el selector existente
                        setFormData(prev => ({ ...prev, referencia: '', producto: '' }));
                      } else {
                        // Al cerrar, limpiar los datos de nueva ref
                        setNuevaRef({ reference: '', name: '', category: '', description: '', price: '' });
                        setNuevaRefErrors({});
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: nuevaRefOpen ? '2px solid #ff4fd6' : '1.5px solid #e5e7eb',
                      background: nuevaRefOpen ? '#fdf4ff' : '#fafafa',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: nuevaRefOpen ? '#ff4fd6' : '#e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'background 0.15s',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                          {nuevaRefOpen
                            ? <line x1="5" y1="12" x2="19" y2="12" />
                            : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                          }
                        </svg>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: nuevaRefOpen ? '#ff4fd6' : '#374151' }}>
                        Nueva referencia
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>
                        — Crea un nuevo producto en el catálogo
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
                      style={{ transform: nuevaRefOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Campos de nueva referencia */}
                  {nuevaRefOpen && (
                    <div style={{
                      border: '1.5px solid #f0abfc', borderTop: 'none',
                      borderRadius: '0 0 10px 10px', padding: '16px 14px 12px',
                      background: '#fdf4ff', display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {/* Código / Referencia — generado automáticamente */}
                        <div>
                          <label style={labelStyle}>Código de referencia <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(auto-generado)</span></label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              value={nuevaRef.reference}
                              readOnly
                              style={{ ...getInputStyle(false), background: '#f3f4f6', color: '#6b7280', cursor: 'default', flex: 1 }}
                              placeholder="Se generará al guardar"
                            />
                            <button type="button"
                              onClick={() => {
                                const ts = Date.now().toString().slice(-5);
                                const prefix = nuevaRef.name ? nuevaRef.name.substring(0, 2).toUpperCase() : 'NR';
                                setNuevaRef(p => ({ ...p, reference: `${prefix}-${ts}` }));
                              }}
                              style={{ padding: '8px 10px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#ff4fd6', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              ↻ Generar
                            </button>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: 10, color: '#ff4fd6' }}>El código se genera automáticamente basado en el nombre.</p>
                        </div>
                        {/* Nombre */}
                        <div>
                          <label style={labelStyle}>Nombre del producto <span style={requiredStar}>*</span></label>
                          <input
                            value={nuevaRef.name}
                            onChange={e => {
                              const nombre = e.target.value;
                              const ts = Date.now().toString().slice(-5);
                              const prefix = nombre ? nombre.substring(0, 2).toUpperCase() : 'NR';
                              setNuevaRef(p => ({ ...p, name: nombre, reference: `${prefix}-${ts}` }));
                              setNuevaRefErrors(p => ({ ...p, name: undefined }));
                            }}
                            placeholder="Ej: Crop Top Negro"
                            style={getInputStyle(nuevaRefErrors.name)}
                          />
                          {nuevaRefErrors.name && <span style={errMsg}>⚠ {nuevaRefErrors.name}</span>}
                        </div>
                        {/* Categoría — del catálogo existente */}
                        <div>
                          <label style={labelStyle}>Categoría <span style={requiredStar}>*</span></label>
                          <select
                            value={nuevaRef.category}
                            onChange={e => { setNuevaRef(p => ({ ...p, category: e.target.value })); setNuevaRefErrors(p => ({ ...p, category: undefined })); }}
                            style={getInputStyle(nuevaRefErrors.category)}
                          >
                            <option value="">Seleccionar categoría...</option>
                            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                          </select>
                          {nuevaRefErrors.category && <span style={errMsg}>⚠ {nuevaRefErrors.category}</span>}
                        </div>

                      </div>
                      {/* Descripción */}
                      <div>
                        <label style={labelStyle}>Descripción <span style={{ color: '#9ca3af', fontSize: 10 }}>(opcional)</span></label>
                        <textarea
                          value={nuevaRef.description}
                          onChange={e => setNuevaRef(p => ({ ...p, description: e.target.value }))}
                          placeholder="Describe brevemente el nuevo diseño..."
                          rows={2}
                          style={{ ...getInputStyle(false), resize: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                      {/* Precio */}
                      <div>
                        <label style={labelStyle}>
                          Precio unitario (COP) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={nuevaRef.price}
                          onChange={e => setNuevaRef(p => ({ ...p, price: e.target.value }))}
                          min="0"
                          placeholder="Ej: 45000"
                          style={getInputStyle(nuevaRefErrors.price)}
                        />
                        {nuevaRefErrors.price && <span style={errMsg}>⚠ {nuevaRefErrors.price}</span>}
                        <p style={{ margin: '3px 0 0', fontSize: 10, color: '#ff4fd6' }}>
                          El stock inicial se tomará de la cantidad total de la orden.
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#fff', borderRadius: 8, border: '1px solid #f0abfc' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" /><line x1="12" y1="11" x2="12" y2="16" />
                        </svg>
                        <span style={{ fontSize: 11, color: '#ff4fd6' }}>
                          Esta referencia se registrará automáticamente en el catálogo de productos al crear la orden.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>
                    {type === 'diseno' && !nuevaRefOpen ? 'Producto / Artículo ' : type === 'diseno' && nuevaRefOpen ? 'Producto base (opcional) ' : 'Producto / Artículo '}
                    {!nuevaRefOpen && <span style={requiredStar}>*</span>}
                  </label>
                  <select
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    onFocus={loadProducts}
                    onClick={loadProducts}
                    style={{ ...getInputStyle(errors.referencia), opacity: loadingProducts ? 0.7 : 1 }}
                    disabled={loadingProducts || (type === 'diseno' && nuevaRefOpen)}
                  >
                    <option value="" disabled>
                      {loadingProducts ? 'Cargando productos...' : type === 'diseno' && nuevaRefOpen ? '— Nueva referencia —' : 'Seleccionar producto...'}
                    </option>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Color <span style={requiredStar}>*</span></label>
                  <div ref={colorRef} style={{ position: 'relative' }}>
                    <input
                      name="color" value={formData.color}
                      onChange={e => { if (!blockInput.onlyLetters(e)) return; handleChange(e); setColorAccordionOpen(false); }}
                      onFocus={() => savedColors.length > 0 && setColorAccordionOpen(true)}
                      style={getInputStyle(errors.color)} placeholder="Ej: Negro, Blanco..."
                      autoComplete="off"
                    />
                    {savedColors.length > 0 && (
                      <button type="button" onClick={() => setColorAccordionOpen(v => !v)}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          style={{ transform: colorAccordionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                    {colorAccordionOpen && savedColors.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: 2 }}>
                        <p style={{ margin: 0, padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6' }}>Colores usados anteriormente</p>
                        {savedColors.map((c, i) => (
                          <button key={i} type="button"
                            onClick={() => { setFormData(prev => ({ ...prev, color: c })); setColorAccordionOpen(false); if (errors.color) setErrors(prev => { const n = { ...prev }; delete n.color; return n; }); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: formData.color === c ? '#fdf4ff' : '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left', transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fdf4ff'}
                            onMouseLeave={e => e.currentTarget.style.background = formData.color === c ? '#fdf4ff' : '#fff'}>
                            <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#e5e7eb', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                            {c}
                            {formData.color === c && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="3" strokeLinecap="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12" /></svg>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.color && <span style={errMsg}>⚠ {errors.color}</span>}
                </div>

                {/* ✅ Campo Cliente — mismo diseño/estilo que ProductForm (ClientDropdown + botón Editar) */}
                <div>
                  <label style={labelStyle}>Cliente <span style={requiredStar}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) auto', alignItems: 'center', gap: 8 }}>
                    <ClientDropdown
                      value={formData.cliente}
                      clients={clientCatalog}
                      onChange={(client) => {
                        const clientName = client ? (client.nombre || '') : '';
                        setFormData(prev => ({ ...prev, cliente: clientName }));
                        if (errors.cliente) setErrors(prev => { const n = { ...prev }; delete n.cliente; return n; });
                      }}
                      onCreateClient={openCreateClientModal}
                      touched={!!errors.cliente}
                      error={errors.cliente}
                    />
                    <button
                      type="button"
                      disabled={!selectedClient}
                      onClick={openEditClientModal}
                      style={{
                        border: '1.5px solid #ff4fd6',
                        background: selectedClient ? '#fff0fb' : '#f9fafb',
                        color: selectedClient ? '#ff4fd6' : '#e5b8dc',
                        borderRadius: 10,
                        padding: '0 16px',
                        minHeight: '42px',
                        fontWeight: 700,
                        cursor: selectedClient ? 'pointer' : 'not-allowed',
                        opacity: selectedClient ? 1 : 0.7,
                        whiteSpace: 'nowrap',
                        transition: '0.15s'
                      }}
                    >
                      Editar
                    </button>
                  </div>
                  {errors.cliente && <span style={errMsg}>⚠ {errors.cliente}</span>}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Fecha de entrega <span style={requiredStar}>*</span>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>(mínimo 1 mes)</span>
                </label>
                <input
                  type="date" name="fechaSolicitud" value={formData.fechaSolicitud}
                  min={getDefaultDeliveryDate()}
                  onChange={e => {
                    // ✅ Fix: comparación de fechas como strings 'YYYY-MM-DD'
                    // (mismo formato que produce getDefaultDeliveryDate() y
                    // que entrega el input type="date"). Antes se comparaban
                    // objetos Date construidos de forma inconsistente (uno con
                    // hora local y otro parseado en UTC), lo que provocaba un
                    // desfase de zona horaria y la alerta saltaba aunque la
                    // fecha elegida ya cumpliera el mínimo (y el calendario ya
                    // la tuviera habilitada vía el atributo min).
                    const minDateStr = getDefaultDeliveryDate();
                    if (e.target.value < minDateStr) {
                      setErrors(prev => ({ ...prev, fechaSolicitud: 'La fecha debe ser al menos 1 mes desde hoy' }));
                    } else {
                      setErrors(prev => { const n = { ...prev }; delete n.fechaSolicitud; return n; });
                    }
                    handleChange(e);
                  }}
                  style={{ ...getInputStyle(errors.fechaSolicitud), maxWidth: 260 }}
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
                <div style={{ background: '#fdf4ff', border: '1.5px dashed #ff4fd6', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#ff4fd6' }}>
                    📸 Imágenes del diseño
                    <span style={{ fontWeight: 400, color: '#ff4fd6', marginLeft: 6 }}>— Sube bocetos o referencias visuales (opcional)</span>
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

                  {/* Drop zone + botón */}
                  {designImages.length === 0 ? (
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, padding: '20px 16px', borderRadius: 10,
                      border: '2px dashed #ff4fd6', background: '#fff',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fdf4ff'; e.currentTarget.style.borderColor = '#c026d3'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ff4fd6'; }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c026d3" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ff4fd6' }}>Subir imágenes del diseño</span>
                      <span style={{ fontSize: 11, color: '#ff4fd6' }}>JPG, PNG — múltiples archivos permitidos</span>
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = ev => setDesignImages(prev => [...prev, ev.target.result]);
                            reader.readAsDataURL(file);
                          });
                          e.target.value = '';
                        }} />
                    </label>
                  ) : (
                    <div>
                      {/* Grid de miniaturas */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                        {designImages.map((src, i) => (
                          <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '2px solid #f0abfc', background: '#fdf4ff' }}>
                            <img src={src} alt={`Diseño ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setDesignImages(prev => prev.filter((_, idx) => idx !== i))}
                              style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                              ×
                            </button>
                            <span style={{ position: 'absolute', bottom: 2, left: 3, fontSize: 9, color: '#fff', fontWeight: 700, background: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: '1px 4px' }}>
                              {i + 1}
                            </span>
                          </div>
                        ))}
                        {/* Agregar más */}
                        <label style={{ aspectRatio: '1', borderRadius: 8, border: '2px dashed #ff4fd6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff', gap: 4, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fdf4ff'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c026d3" strokeWidth="2" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span style={{ fontSize: 9, color: '#ff4fd6', fontWeight: 700 }}>Más</span>
                          <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => {
                                const reader = new FileReader();
                                reader.onload = ev => setDesignImages(prev => [...prev, ev.target.result]);
                                reader.readAsDataURL(file);
                              });
                              e.target.value = '';
                            }} />
                        </label>
                      </div>
                      <p style={{ fontSize: 11, color: '#ff4fd6', margin: 0 }}>
                        {designImages.length} imagen{designImages.length !== 1 ? 'es' : ''} · Haz clic en × para eliminar
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Ficha técnica opcional para diseño */}
              {type === 'diseno' && (
                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: techSheetData ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${techSheetData ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: techSheetData ? '#16a34a' : '#374151' }}>
                      📋 Ficha técnica {techSheetData ? '✓ Creada' : '— Opcional'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>
                      {techSheetData ? 'La ficha será vinculada a esta orden' : 'Puedes crear la ficha técnica del nuevo diseño'}
                    </p>
                  </div>
                  <Button variant={techSheetData ? 'ghost' : 'primary'} type="button" onClick={() => setShowTechSheet(true)}>
                    {techSheetData ? 'Ver / Editar' : 'Crear ficha'}
                  </Button>
                </div>
              )}

              {extraRefs.length > 0 && (
                <>
                  {sectionTitle(`Artículos adicionales (${extraRefs.length})`)}
                  {extraRefs.map((ref, i) => (
                    <ExtraRefRow key={i} index={i} data={ref} onChange={updateExtraRef} onRemove={removeExtraRef} errors={extraErrors[i] || {}} savedColors={savedColors} />
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
          <div className="roles-modal-scroll" style={{ background: '#fff', borderRadius: 14, width: '95%', maxWidth: 1100, maxHeight: '92vh', overflowY: 'auto', padding: 'clamp(14px, 3vw, 28px)', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>📋 Ficha Técnica</h3>
                {type === 'produccion'
                  ? <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>Solo lectura · Se vinculará automáticamente al crear la orden</p>
                  : <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>Edita los campos y guarda para asociar la ficha a la orden</p>
                }
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button type="button" variant="secondary" onClick={() => setShowTechSheet(false)}>Cerrar</Button>
                {type === 'diseno' && (
                  <Button type="button" variant="primary" onClick={() => {
                    if (!hasTechnicalSheetMaterials(techSheetData)) {
                      setAlertConfig({ open: true, type: 'warning', title: 'Ficha técnica vacía', message: 'Completa al menos un material o medida antes de guardar la ficha.', onConfirm: null });
                      return;
                    }
                    setShowTechSheet(false);
                    setAlertConfig({ open: true, type: 'success', title: 'Ficha guardada', message: 'La ficha técnica fue asociada a la orden.', onConfirm: null });
                  }}>
                    💾 Guardar ficha
                  </Button>
                )}
              </div>
            </div>
            <TechnicalSheet
              sheet={type === 'produccion' ? techSheetPreview : (techSheetData && Object.keys(techSheetData).length > 0 ? techSheetData : {
                client: formData.cliente || '',
                ref: nuevaRefOpen ? (nuevaRef.reference || '') : (formData.referencia || ''),
                type: nuevaRefOpen ? (nuevaRef.name || '') : (formData.producto || ''),
                date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                costPerUnit: 0,
              })}
              isEditing={type === 'diseno'}
              onChange={(data) => { if (type === 'diseno') setTechSheetData(data); }}
              productName={nuevaRefOpen ? nuevaRef.name : (selectedProduct?.name || formData.producto || '')}
              categoryDescription={nuevaRefOpen ? nuevaRef.category : (selectedProduct?.category || '')}
              productRef={nuevaRefOpen ? nuevaRef.reference : formData.referencia}
              productImage={nuevaRefOpen ? null : (selectedProduct?.image || null)}
            />
          </div>
        </div>
      )}

      {/* ✅ Modal de cliente (crear/editar) — mismo patrón visual que ProductForm */}
      {clientFormOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={closeClientModal}
          />
          <div style={{
            position: "relative",
            width: "90%",
            maxWidth: "480px",
            maxHeight: "85vh",
            overflowY: "auto",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            zIndex: 1201,
            padding: "28px 32px",
            boxSizing: "border-box"
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 22,
                paddingBottom: 16,
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#ff4fd6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1f2937",
                  }}
                >
                  {editingClientId ? "Editar cliente" : "Crear nuevo cliente"}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "#9ca3af",
                  }}
                >
                  {editingClientId
                    ? "Actualiza los datos del cliente"
                    : "Completa los datos del cliente"}
                </p>
              </div>
            </div>

            <form onSubmit={handleClientCreate}>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Nombre</label>
                  <input
                    value={clientDraft.nombre}
                    onChange={(e) => setClientDraft(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre completo"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Documento</label>
                  <input
                    value={clientDraft.documento}
                    onChange={(e) => setClientDraft(prev => ({ ...prev, documento: e.target.value }))}
                    placeholder="Número de documento"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Teléfono</label>
                  <input
                    value={clientDraft.telefono}
                    onChange={(e) => setClientDraft(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="Teléfono"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, display: "block" }}>Correo</label>
                  <input
                    value={clientDraft.correo}
                    onChange={(e) => setClientDraft(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="Correo electrónico"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e5e7eb", padding: "10px 12px", borderRadius: 10, fontSize: 13, outline: "none" }}
                  />
                </div>
                {clientFormError && (
                  <span style={{ color: "#ff4fd6", fontSize: 11, fontWeight: 700 }}>⚠ {clientFormError}</span>
                )}

                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 14,
                    borderTop: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button type="button" onClick={closeClientModal} style={btnSecondary}>
                    Cancelar
                  </button>
                  <button type="submit" style={btnPrimary}>
                    {editingClientId ? "Actualizar cliente" : "Guardar cliente"}
                  </button>
                </div>
              </div>
            </form>
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
                <span style={{ background: type === 'produccion' ? '#fce7f3' : '#f3e8ff', color: type === 'produccion' ? '#be185d' : '#ff4fd6', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {type === 'produccion' ? 'Producción' : 'Diseño'}
                </span>
              </div>
              {[
                ['Producto', nuevaRefOpen && type === 'diseno'
                  ? `${nuevaRef.reference || '—'} — ${nuevaRef.name || '—'} (nueva ref.)`
                  : formData.referencia ? `${formData.referencia} — ${formData.producto || ''}` : '—'],
                ['Cantidad' + (extraRefs.length > 0 ? ' total' : ''), totalCantidad > 0 ? `${totalCantidad} uds` : '—', extraRefs.length > 0],
                ['Color', (() => {
                  const all = [formData.color, ...extraRefs.map(r => r.color)].filter(Boolean);
                  return [...new Set(all)].join(', ') || '—';
                })()],
                ['Cliente', formData.cliente || '—'],
                ['Entrega', formData.fechaSolicitud || '—'],
              ].map(([label, value, hl]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: hl ? '#ff4fd6' : '#1f2937', fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)} disabled={isCreating}>Volver a editar</Button>
              <Button type="button" variant="primary" onClick={handleConfirm} loading={isCreating} loadingText="Creando...">Confirmar y crear</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductionForm;