import React, { useState, useMemo, useEffect } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';
import { useSuppliers } from '../../../suppliers/hooks/mockSuppliers';
import { useSupplies } from '../../../supplies/hooks/useSupplies';
import { useSedes } from '../../../sedes/hooks/useSedes';
import { useSedeScope } from '../../../shared/hooks/useSedeScope';
import SupplyForm from '../../../supplies/components/SupplyForm';
import SupplierForm from '../../../suppliers/components/SupplierForm';
import CategoryForm from '../../../categoriesSupply/components/CategoryForm';
import { categoryAPI } from '../../../categoriesSupply/services/categoryAPI';
import {
  getInputStyleBox,
  errorStyle as errMsg,
  labelStyle,
  requiredStar,
} from '../../../shared/utils/validationStyles';

const sectionTitle = (t) => (
  <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '10px 0 8px' }}>{t}</p>
);

const inp = (err) => getInputStyleBox(err);
const ddStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 100, maxHeight: 160, overflowY: 'auto', marginTop: 2,
};

// FIX RESPONSIVE: estilos responsive centralizados vía <style>, ya que el
// componente usa inline styles y estos no responden a media queries por sí solos.
const responsiveCss = `
  .shf-overlay { overflow-y: auto; }
  .shf-modal { display: flex; }
  @media (max-width: 900px) {
    /* align-items: flex-start se mantiene (no "center") a propósito: si el
       contenido es más alto que la pantalla, centrar verticalmente con
       overflow-y: auto corta la parte de arriba del modal al hacer scroll
       — es un bug conocido de flexbox. Lo que cambiamos es que ya no le
       quitamos el padding al overlay, así el modal conserva el mismo
       margen externo de 16px que EmployeeForm/UserForm en vez de pegarse
       a los bordes de la pantalla. */
    .shf-overlay { align-items: flex-start !important; }
    .shf-modal {
      flex-direction: column !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      max-height: calc(100vh - 32px) !important;
      border-radius: 16px !important;
    }
    .shf-left {
      flex: 1 1 auto !important;
      width: 100% !important;
    }
    .shf-left-scroll {
      padding: 18px 16px 0 !important;
    }
    .shf-left-footer {
      padding: 10px 16px 18px !important;
    }
    .shf-right {
      flex: 1 1 auto !important;
      min-height: 320px !important;
      border-left: none !important;
      border-top: 1px solid #f3f4f6 !important;
    }
  }
  @media (max-width: 480px) {
    .shf-left-scroll { padding: 16px 14px 0 !important; }
    .shf-left-footer { padding: 8px 14px 16px !important; }
    .shf-right-body { padding: 18px 14px !important; }
  }
  @media (max-width: 560px) {
    .shf-grid3 { grid-template-columns: 1fr 1fr !important; }
    .shf-grid4 { grid-template-columns: 1fr 1fr !important; }
    .shf-footer-btns { flex-direction: column-reverse !important; }
    .shf-footer-btns > button { width: 100% !important; }
  }
  @media (max-width: 380px) {
    .shf-grid3 { grid-template-columns: 1fr !important; }
  }
`;

const ShoppingForm = ({ onSubmit, onCancel, existingFacturas = [] }) => {
  // FIX (punto 4): solo activos — antes se mostraban proveedores/insumos
  // inactivados como opción seleccionable en este buscador.
  const { suppliersActivos: suppliers, createSupplier } = useSuppliers();
  const { suppliesActivos: supplies, medidas, propiedades, categorias, createSupply } = useSupplies();
  const { sedes } = useSedes();
  const { isGerente, sedeId: miSedeId } = useSedeScope();

  const [formData, setFormData] = useState({
    numeroFactura: '', proveedorId: '', proveedor: '', fecha: '',
    observaciones: '', costoTotal: '', detalles: [], sedeId: '',
  });

  // Un admin de sede solo registra compras para su propia sede: se precarga
  // y no se deja editar. Gerente sí elige a qué sede pertenece la compra.
  useEffect(() => {
    if (!isGerente && miSedeId && !formData.sedeId) {
      setFormData((p) => ({ ...p, sedeId: miSedeId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGerente, miSedeId]);
  const [errors, setErrors] = useState({});
  const [detalleActual, setDetalleActual] = useState({
    supplyId: '', nombre: '', medida: '', cantidad: '',
    valorUnitario: '', valorTotal: '', descripcionAdicional: '',
  });
  const [insumoSearch, setInsumoSearch] = useState('');
  const [showInsumoDD, setShowInsumoDD] = useState(false);
  const [showCreateSupply, setShowCreateSupply] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [proveedorSearch, setProveedorSearch] = useState('');
  const [showProveedorDD, setShowProveedorDD] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [fotoFactura, setFotoFactura] = useState(null);       // FIX 4: foto de factura
  const [fotoPreview, setFotoPreview] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });

  const closeAlert = () => setAlertConfig((p) => ({ ...p, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  const totalDetalles = useMemo(
    () => formData.detalles.reduce((a, d) => a + (Number(d.valorTotal) || 0), 0),
    [formData.detalles]
  );
  useEffect(() => {
    setFormData((p) => ({ ...p, costoTotal: totalDetalles.toFixed(2) }));
    setErrors((p) => ({ ...p, costoTotal: '' }));
  }, [totalDetalles]);

  const vReq = (v) => (!v && v !== 0 ? 'Este campo es obligatorio' : '');
  const vPos = (v) => (isNaN(v) || Number(v) <= 0 ? 'Debe ser mayor a 0' : '');
  // FIX: numeroFactura ya no exige 4 dígitos numéricos — ahora acepta
  // cualquier caracter (mayúsculas, minúsculas, números, símbolos), en
  // cualquier cantidad. Solo sigue siendo obligatorio (vReq).

  const validateField = (name, value) => {
    let e = '';
    if (name === 'numeroFactura') {
      e = vReq(value);
      // FIX: el duplicado ahora se compara CONTRA EL MISMO PROVEEDOR — el
      // mismo número de factura sí puede repetirse si es de otro proveedor.
      // existingFacturas ahora es [{ numeroFactura, proveedorId }, ...]
      // (antes era un array plano de solo números, sin proveedor).
      if (!e && formData.proveedorId) {
        const yaExiste = existingFacturas.some((f) =>
          String(f.numeroFactura).trim().toLowerCase() === String(value).trim().toLowerCase()
          && String(f.proveedorId) === String(formData.proveedorId),
        );
        if (yaExiste) e = 'Ya existe una factura con este número para este proveedor';
      }
    }
    if (name === 'proveedorId') e = vReq(value);
    if (name === 'fecha') {
      e = vReq(value);
      if (!e && new Date(value) > new Date()) {
        e = 'La fecha no puede ser mayor al día de hoy';
      }
    }
    if (name === 'sedeId') e = isGerente ? vReq(value) : '';
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

  // FIX: el chequeo de "factura duplicada" depende de la combinación
  // numeroFactura + proveedorId. Si el usuario ya escribió un número de
  // factura y LUEGO cambia el proveedor (o viceversa), hay que revalidar —
  // si no, un error de "duplicado" quedaría pegado con el proveedor viejo,
  // o un duplicado real con el proveedor nuevo no se detectaría hasta el
  // submit.
  useEffect(() => {
    if (formData.numeroFactura) validateField('numeroFactura', formData.numeroFactura);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.proveedorId]);

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
      const updated = { ...p, [name]: value };
      const qty = parseFloat(name === 'cantidad' ? value : p.cantidad) || 0;
      const unitPrice = parseFloat(name === 'valorUnitario' ? value : p.valorUnitario) || 0;

      if (name === 'cantidad' || name === 'valorUnitario') {
        updated.valorTotal = qty > 0 && unitPrice > 0 ? (qty * unitPrice).toFixed(2) : '';
      }
      return updated;
    });
  };

  const handleCantidadDetalleChange = (id, value) => {
    const cantidad = parseFloat(value);
    if (value !== '' && (!Number.isFinite(cantidad) || cantidad < 0)) return;

    setFormData((p) => ({
      ...p,
      detalles: p.detalles.map((d) => d.id === id
        ? {
          ...d,
          cantidad: value === '' ? '' : cantidad,
          valorTotal: value === '' ? 0 : cantidad * (Number(d.valorUnitario) || 0),
        }
        : d),
    }));
  };

  const handleAgregarDetalle = () => {
    if (!detalleActual.nombre.trim()) { showAlert('warning', 'Campo requerido', 'Selecciona un producto o insumo.'); return; }
    if (!detalleActual.cantidad || Number(detalleActual.cantidad) <= 0) { showAlert('warning', 'Campo requerido', 'Ingresa una cantidad válida.'); return; }
    if (!detalleActual.valorUnitario || Number(detalleActual.valorUnitario) <= 0) { showAlert('warning', 'Campo requerido', 'Ingresa un valor unitario válido.'); return; }
    if (!detalleActual.valorTotal || Number(detalleActual.valorTotal) <= 0) { showAlert('warning', 'Campo requerido', 'El valor total debe ser mayor a 0.'); return; }
    const nuevoDetalle = {
      id: Date.now(), supplyId: detalleActual.supplyId || null,
      nombre: detalleActual.nombre.trim(), medida: detalleActual.medida || null,
      cantidad: parseFloat(detalleActual.cantidad), valorUnitario: parseFloat(detalleActual.valorUnitario),
      valorTotal: parseFloat(detalleActual.valorTotal), descripcionAdicional: detalleActual.descripcionAdicional.trim(),
    };
    setFormData((p) => {
      const sameSupplyAndMeasure = (d) =>
        String(d.supplyId || d.nombre).trim().toLowerCase() === String(nuevoDetalle.supplyId || nuevoDetalle.nombre).trim().toLowerCase()
        && String(d.medida || '').trim().toLowerCase() === String(nuevoDetalle.medida || '').trim().toLowerCase();
      const existing = p.detalles.find(sameSupplyAndMeasure);

      if (!existing) return { ...p, detalles: [...p.detalles, nuevoDetalle] };

      const cantidad = Number(existing.cantidad) + nuevoDetalle.cantidad;
      const valorTotal = Number(existing.valorTotal) + nuevoDetalle.valorTotal;
      return {
        ...p,
        detalles: p.detalles.map((d) => d.id === existing.id
          ? { ...d, cantidad, valorTotal, valorUnitario: cantidad > 0 ? valorTotal / cantidad : 0 }
          : d),
      };
    });
    setDetalleActual({ supplyId: '', nombre: '', medida: '', cantidad: '', valorUnitario: '', valorTotal: '', descripcionAdicional: '' });
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

  // FIX 1: Crear categoría desde dentro del SupplyForm anidado
  const handleCreateCategorySubmit = async (data) => {
    try {
      const cat = await categoryAPI.create(data);
      // Refrescar el catálogo de categorías en useSupplies
      await categorias; // el hook ya lo tiene; se agrega optimistamente
      setShowCreateCategory(false);
      showAlert('success', 'Categoría creada', `"${cat.nombre}" fue creada. Selecciónala en el formulario de insumo.`);
    } catch (e) { showAlert('error', 'Error', e.message || 'No se pudo crear la categoría.'); }
  };

  // FIX 4: Manejar foto de factura
  const handleFotoFactura = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(fotoPreview);
    setFotoFactura(file);
    setFotoPreview(URL.createObjectURL(file));
  };
  const handleRemoveFoto = () => {
    if (fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(fotoPreview);
    setFotoFactura(null);
    setFotoPreview(null);
  };

  const handleSubmit = async () => {
    const fields = ['numeroFactura', 'proveedorId', 'fecha', 'sedeId'];
    const newErrors = {};
    fields.forEach((f) => { const e = validateField(f, formData[f]); if (e) newErrors[f] = e; });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) { showAlert('warning', 'Campos inválidos', 'Corrige los campos marcados antes de guardar.'); return; }
    if (formData.detalles.length === 0) { showAlert('warning', 'Sin detalles', 'Agrega al menos un producto o insumo.'); return; }
    if (formData.detalles.some((d) => !Number(d.cantidad) || Number(d.cantidad) <= 0)) {
      showAlert('warning', 'Cantidad inválida', 'Cada insumo debe tener una cantidad mayor a 0.');
      return;
    }
    try {
      await onSubmit({ ...formData, costoTotal: parseFloat(formData.costoTotal), fotoFactura });
    } catch (e) { showAlert('error', 'Error al guardar', e.message || 'No se pudo guardar la compra.'); }
  };

  // Detecta si el formulario tiene algún dato ingresado
  const isFormBlank = () => {
    const mainEmpty = !formData.numeroFactura && !formData.proveedorId && !formData.fecha
      && !formData.observaciones && formData.detalles.length === 0;
    const detalleEmpty = !detalleActual.nombre && !detalleActual.valorUnitario && !detalleActual.cantidad;
    return mainEmpty && detalleEmpty;
  };

  const handleCancel = () => {
    // Si no hay ningún dato ingresado, cerrar directamente sin modal
    if (isFormBlank()) { onCancel?.(); return; }
    showAlert('confirm', '¿Cancelar?', 'Los datos ingresados se perderán.', () => { closeAlert(); onCancel?.(); });
  };

  if (showCreateSupplier) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <SupplierForm onSubmit={handleCreateSupplierSubmit} onCancel={() => setShowCreateSupplier(false)} />
    </div>
  );
  // FIX 1: CategoryForm se muestra con zIndex más alto que SupplyForm para apilarse encima
  if (showCreateCategory) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <CategoryForm standalone={true} onSubmit={handleCreateCategorySubmit} onCancel={() => setShowCreateCategory(false)} />
    </div>
  );
  if (showCreateSupply) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <SupplyForm categorias={categorias} medidas={medidas} propiedades={propiedades}
        onSubmit={handleCreateSupplySubmit} onCancel={() => setShowCreateSupply(false)}
        onCreateCategory={() => setShowCreateCategory(true)} />
    </div>
  );

  const plusBtn = (onClick, title) => (
    <button type="button" onClick={onClick} title={title}
      style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#ff4fd6', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px #FF4FD644' }}>+</button>
  );

  // Fecha máxima seleccionable en el input date = hoy, en formato yyyy-mm-dd
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  return (
    <>
      {/* FIX RESPONSIVE: media queries para que el modal se apile y no se rompa en móvil */}
      <style>{responsiveCss}</style>

      <div className="shf-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: 16 }}>
        <div className="shf-modal" style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 1140, height: 'auto', maxHeight: 'calc(100vh - 32px)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>

          {/* ── COLUMNA IZQUIERDA ──
              FIX: se separa en dos zonas — un área que scrollea (shf-left-scroll)
              y un footer fijo (shf-left-footer) que siempre contiene el botón
              "Agregar a la compra" completo y visible, sin que el overflow del
              contenido lo corte. Mismo patrón que ya usa la columna derecha. */}
          <div className="shf-left" style={{ flex: '0 0 520px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

            {/* FIX SCROLL: overflow cambiado de 'hidden' a overflowY: 'auto'.
                Antes, en pantallas grandes (>900px) este contenedor tenía
                overflow: 'hidden' por defecto y solo pasaba a 'auto' dentro
                del media query de 900px. Si el contenido (última fila de
                Cantidad/Medida/Valor unitario/Valor total) no cabía en el
                alto disponible del modal, se recortaba en vez de poder
                scrollear, quedando tapado por el footer fijo y sin poder
                digitar en el campo Cantidad. Con overflowY: 'auto' siempre
                activo, el usuario puede scrollear internamente en cualquier
                tamaño de pantalla y el footer nunca tapa contenido. */}
            <div className="roles-modal-scroll shf-left-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 26px 0', scrollbarGutter: 'stable', WebkitOverflowScrolling: 'touch' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1f2937' }}>Crear nueva compra</h2>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Completa todos los campos obligatorios</p>
                </div>
              </div>

              {sectionTitle('Datos de la factura')}

              {/* Número de factura + Fecha + Sede */}
              <div className="shf-grid3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>Número de factura <span style={requiredStar}>*</span></label>
                  <input type="text" name="numeroFactura" value={formData.numeroFactura}
                    onChange={handleChange} onBlur={(e) => validateField('numeroFactura', e.target.value)}
                    placeholder="Ej: A-0231" style={inp(errors.numeroFactura)} />
                  {errors.numeroFactura && <span style={errMsg}>⚠ {errors.numeroFactura}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Fecha de la factura <span style={requiredStar}>*</span></label>
                  <input type="date" name="fecha" value={formData.fecha} max={todayStr}
                    onChange={handleChange} onBlur={(e) => validateField('fecha', e.target.value)}
                    style={inp(errors.fecha)} />
                  {errors.fecha && <span style={errMsg}>⚠ {errors.fecha}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Sede {isGerente && <span style={requiredStar}>*</span>}</label>
                  {isGerente ? (
                    <select name="sedeId" value={formData.sedeId} onChange={handleChange} style={inp(errors.sedeId)}>
                      <option value="">Seleccionar...</option>
                      {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  ) : (
                    <input value={sedes.find((s) => String(s.id) === String(formData.sedeId))?.nombre || '—'}
                      readOnly style={{ ...inp(false), background: '#f9fafb', color: '#6b7280', cursor: 'default' }} />
                  )}
                </div>
              </div>

              {/* Proveedor */}
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Proveedor <span style={requiredStar}>*</span></label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
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

              {/* Observaciones */}
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Observaciones <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 10 }}>(opcional)</span></label>
                <textarea name="observaciones" value={formData.observaciones}
                  onChange={handleChange} placeholder="Ej. Compra urgente..."
                  rows={2} style={{ ...inp(false), minHeight: 56, resize: 'vertical' }} />
              </div>

              {sectionTitle('Detalles de la compra')}

              {/* FIX 3: DOS BOTONES — buscar existente vs crear nuevo */}
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Insumo</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                    <input value={insumoSearch} placeholder="Buscar insumo existente..."
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
                  {/* Botón crear nuevo insumo — mismo círculo que proveedor */}
                  <button type="button" onClick={() => setShowCreateSupply(true)} title="Crear nuevo insumo"
                    style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#ff4fd6', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px #FF4FD644' }}>+</button>
                </div>
              </div>

              <div className="shf-grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 6 }}>
                <div>
                  <label style={labelStyle}>Cantidad <span style={requiredStar}>*</span></label>
                  <input type="number" name="cantidad" value={detalleActual.cantidad}
                    onChange={handleDetalleChange} style={inp(false)} />
                </div>
                <div>
                  <label style={labelStyle}>Medida</label>
                  <select name="medida" value={detalleActual.medida} onChange={handleDetalleChange} style={inp(false)}>
                    <option value="">Seleccionar...</option>
                    {medidas.map((m) => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Valor unitario <span style={requiredStar}>*</span></label>
                  <input type="number" name="valorUnitario" value={detalleActual.valorUnitario}
                    onChange={handleDetalleChange} placeholder="Ej: 20" style={inp(false)} />
                </div>
                <div>
                  <label style={labelStyle}>Valor total <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 10 }}>auto</span></label>
                  <input type="number" name="valorTotal" value={detalleActual.valorTotal}
                    readOnly placeholder="0.00" style={{ ...inp(false), background: '#f9fafb', color: '#9ca3af', cursor: 'default' }} />
                </div>
              </div>

            </div>

            {/* Footer fijo de la columna izquierda: siempre visible, nunca se corta */}
            <div className="shf-left-footer" style={{ padding: '10px 26px 18px', borderTop: '1px solid #f3f4f6' }}>
              {/* FIX 3: botón de agregar detalle claramente diferenciado del de "crear nuevo" */}
              <button type="button" onClick={handleAgregarDetalle}
                style={{ background: '#ff4fd6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '9px 14px', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px #ff4fd644' }}>
                ⊕ Agregar a la compra
              </button>
            </div>
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div className="shf-right" style={{ flex: 1, minWidth: 0, minHeight: 0, background: '#fafafa', borderLeft: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
            <div className="shf-right-body" style={{ flex: 1, minHeight: 0, padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#333' }}>
                Resumen de compra
                <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>IVA incluido</span>
              </p>

              {formData.detalles.length > 0 ? (
                <div className="roles-modal-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        {['#', 'Producto', 'Medida', 'Cant.', 'Unitario', ''].map((h, i) => (
                          <th key={i} style={{ position: 'sticky', top: 0, zIndex: 1, padding: '8px 6px', textAlign: i >= 3 ? 'right' : 'left', color: '#9ca3af', fontWeight: 600, fontSize: 11, background: '#fafafa' }}>{h}</th>
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
                            <td style={{ padding: '10px 6px', textAlign: 'right', color: '#6b7280' }}>
                              <input type="number" min="0.000001" step="any" aria-label={`Cantidad de ${d.nombre}`}
                                value={d.cantidad} onChange={(e) => handleCantidadDetalleChange(d.id, e.target.value)}
                                style={{ width: 58, padding: '4px 6px', textAlign: 'right', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#4b5563' }} />
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', color: '#6b7280' }}>${Number(d.valorUnitario).toFixed(2)}</td>
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
                </div>
              ) : (
                <div style={{ flex: 1, padding: '40px 20px', textAlign: 'center', color: '#d1d5db', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🧾</div>
                  Los productos agregados aparecerán aquí.
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
              <div className="shf-footer-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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