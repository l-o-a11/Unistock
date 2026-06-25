import React, { useState, useMemo, useEffect } from "react";
import Alert from "../../../shared/components/Alert";
import { useSuppliers } from "../../../suppliers/hooks/mockSuppliers";
import { useSupplies } from "../../../supplies/hooks/useSupplies";
import SupplyForm from "../../../supplies/components/SupplyForm";
import SupplierForm from "../../../suppliers/components/SupplierForm";

/* ── Estilos ──────────────────────────────────────────────────────────── */
const S = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50, padding: "16px",
  },
  modal: {
    display: "flex", background: "#f5f5f5", borderRadius: "16px",
    width: "100%", maxWidth: "940px", overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxHeight: "92vh",
  },
  left: {
    flex: "0 0 420px", padding: "28px 24px", overflowY: "auto",
    maxHeight: "92vh", scrollbarGutter: "stable",
  },
  right: {
    flex: 1, background: "#fff", borderLeft: "1px solid #ebebeb",
    display: "flex", flexDirection: "column",
  },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" },
  iconBox: {
    width: "40px", height: "40px", borderRadius: "10px", background: "#FF4FD6",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  titleTxt: { fontSize: "18px", fontWeight: 700, color: "#111", margin: 0 },
  subtitleTxt: { fontSize: "13px", color: "#888", margin: "2px 0 0" },
  sectionLbl: {
    fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em",
    textTransform: "uppercase", margin: "20px 0 10px",
  },
  fieldWrap: { marginBottom: "12px" },
  lbl: { display: "block", fontSize: "13px", fontWeight: 500, color: "#444", marginBottom: "5px" },
  req: { color: "#FF4FD6", marginLeft: "2px" },
  inp: (err) => ({
    width: "100%", padding: "9px 12px", borderRadius: "8px", boxSizing: "border-box",
    border: `1px solid ${err ? "#FF4FD6" : "#ddd"}`, background: "#fff",
    fontSize: "13px", color: "#333", outline: "none", transition: "border-color .15s",
  }),
  err: { fontSize: "11px", color: "#FF4FD6", fontWeight: 600, marginTop: "3px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  addBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "none", border: "none", color: "#FF4FD6",
    fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: 0, marginTop: "8px",
  },
  plusCircle: {
    width: "28px", height: "28px", borderRadius: "50%", background: "#FF4FD6",
    border: "none", color: "#fff", fontSize: "18px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    boxShadow: "0 2px 8px #FF4FD644",
  },
  rightHead: { flex: 1, padding: "24px 20px", overflowY: "auto" },
  rightFoot: { borderTop: "1px solid #ebebeb", padding: "16px 20px" },
  btnRow: { display: "flex", justifyContent: "flex-end", gap: "10px" },
  btnCancel: {
    padding: "9px 22px", borderRadius: "8px", border: "1px solid #ddd",
    background: "#fff", color: "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer",
  },
  btnSave: {
    padding: "9px 24px", borderRadius: "8px", border: "none",
    background: "#FF4FD6", color: "#fff", fontSize: "13px", fontWeight: 700,
    cursor: "pointer", boxShadow: "0 4px 12px #FF4FD644",
  },
};

const onFocusIn = (e) => { e.target.style.borderColor = "#FF4FD6"; e.target.style.boxShadow = "0 0 0 3px #FF4FD618"; };
const onFocusOut = (e) => { e.target.style.borderColor = "#ddd"; e.target.style.boxShadow = "none"; };

const Inp = ({ err, style, ...p }) => (
  <input style={{ ...S.inp(err), ...style }} onFocus={onFocusIn}
    onBlur={(e) => { onFocusOut(e); if (p.onBlur) p.onBlur(e); }} {...p} />
);
const Sel = ({ err, children, ...p }) => (
  <select style={{ ...S.inp(err), appearance: "auto" }} onFocus={onFocusIn} onBlur={onFocusOut} {...p}>{children}</select>
);

/* ── Componente ───────────────────────────────────────────────────────── */
const ShoppingForm = ({ onSubmit, onCancel }) => {
  const { suppliers, createSupplier } = useSuppliers();
  const { supplies, medidas, propiedades, categorias, createSupply } = useSupplies();

  const [formData, setFormData] = useState({
    numeroFactura: "", proveedorId: "", proveedor: "", fecha: "",
    observaciones: "", costoTotal: "", detalles: [],
  });
  const [errors, setErrors] = useState({});
  const [detalleActual, setDetalleActual] = useState({
    supplyId: "", nombre: "", medida: "", cantidad: "",
    costo: "", costoUnitario: "", descripcionAdicional: "",
  });
  const [insumoSearch, setInsumoSearch] = useState("");
  const [showInsumoDD, setShowInsumoDD] = useState(false);
  const [showCreateSupply, setShowCreateSupply] = useState(false);
  const [proveedorSearch, setProveedorSearch] = useState("");
  const [showProveedorDD, setShowProveedorDD] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, type: "success", title: "", message: "", onConfirm: null });

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
      setErrors((p) => ({ ...p, costoTotal: "" }));
    }
  }, [totalDetalles, formData.detalles.length]);

  const vReq = (v) => (!v && v !== 0 ? "Este campo es obligatorio" : "");
  const vPos = (v) => (isNaN(v) || Number(v) <= 0 ? "Debe ser mayor a 0" : "");

  const validateField = (name, value) => {
    let e = "";
    if (name === "numeroFactura") e = vReq(value);
    if (name === "proveedorId") e = vReq(value);
    if (name === "fecha") e = vReq(value);
    if (name === "costoTotal") e = vReq(value) || vPos(value);
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
    setErrors((p) => ({ ...p, proveedorId: "" }));
  };

  /* Insumo */
  const filteredSupplies = useMemo(() => {
    if (!insumoSearch.trim()) return supplies;
    return supplies.filter((s) => s.nombre?.toLowerCase().includes(insumoSearch.toLowerCase()));
  }, [supplies, insumoSearch]);

  const handleSelectInsumo = (s) => {
    setDetalleActual((p) => ({ ...p, supplyId: s.id, nombre: s.nombre, medida: s.medida || "" }));
    setInsumoSearch(s.nombre);
    setShowInsumoDD(false);
  };

  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    setDetalleActual((p) => {
      const u = { ...p, [name]: value };
      if (name === "costo" || name === "cantidad") {
        const c = parseFloat(name === "costo" ? value : p.costo) || 0;
        const q = parseFloat(name === "cantidad" ? value : p.cantidad) || 0;
        u.costoUnitario = q > 0 ? (c / q).toFixed(2) : "";
      }
      return u;
    });
  };

  const handleAgregarDetalle = () => {
    if (!detalleActual.nombre.trim()) { showAlert("warning", "Campo requerido", "Selecciona un producto o insumo."); return; }
    if (!detalleActual.cantidad || Number(detalleActual.cantidad) <= 0) { showAlert("warning", "Campo requerido", "Ingresa una cantidad válida."); return; }
    if (!detalleActual.costo || Number(detalleActual.costo) <= 0) { showAlert("warning", "Campo requerido", "Ingresa un costo válido."); return; }
    setFormData((p) => ({
      ...p, detalles: [...p.detalles, {
        id: Date.now(), supplyId: detalleActual.supplyId || null,
        nombre: detalleActual.nombre.trim(), medida: detalleActual.medida || null,
        cantidad: parseFloat(detalleActual.cantidad), costo: parseFloat(detalleActual.costo),
        costoUnitario: parseFloat(detalleActual.costoUnitario) || 0,
        descripcionAdicional: detalleActual.descripcionAdicional.trim(),
      }],
    }));
    setDetalleActual({ supplyId: "", nombre: "", medida: "", cantidad: "", costo: "", costoUnitario: "", descripcionAdicional: "" });
    setInsumoSearch("");
  };

  const handleEliminarDetalle = (id) =>
    setFormData((p) => ({ ...p, detalles: p.detalles.filter((d) => d.id !== id) }));

  const handleCreateSupplierSubmit = async (data) => {
    try {
      const s = await createSupplier(data);
      handleSelectProveedor(s);
      setShowCreateSupplier(false);
      showAlert("success", "Proveedor creado", `"${s.nombreEmpresa}" fue creado y seleccionado.`);
    } catch (e) { showAlert("error", "Error", e.message || "No se pudo crear el proveedor."); }
  };

  const handleCreateSupplySubmit = async (data) => {
    try {
      const s = await createSupply(data);
      handleSelectInsumo(s);
      setShowCreateSupply(false);
      showAlert("success", "Insumo creado", `"${s.nombre}" fue creado y seleccionado.`);
    } catch (e) { showAlert("error", "Error", e.message || "No se pudo crear el insumo."); }
  };

  const handleSubmit = async () => {
    const fields = ["numeroFactura", "proveedorId", "fecha", "costoTotal"];
    const newErrors = {};
    fields.forEach((f) => { const e = validateField(f, formData[f]); if (e) newErrors[f] = e; });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) { showAlert("warning", "Campos inválidos", "Corrige los campos marcados antes de guardar."); return; }
    if (formData.detalles.length === 0) { showAlert("warning", "Sin detalles", "Agrega al menos un producto o insumo."); return; }
    try {
      await onSubmit({ ...formData, costoTotal: parseFloat(formData.costoTotal) });
    } catch (e) { showAlert("error", "Error al guardar", e.message || "No se pudo guardar la compra."); }
  };

  const handleCancel = () =>
    showAlert("confirm", "¿Cancelar?", "Los datos ingresados se perderán.", () => { closeAlert(); onCancel?.(); });

  const ddStyle = {
    position: "absolute", top: "100%", left: 0, right: 0, background: "#fff",
    border: "1px solid #e5e7eb", borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.10)", zIndex: 100, maxHeight: "160px", overflowY: "auto",
  };
  const ddItem = {
    padding: "8px 12px", fontSize: "13px", cursor: "pointer", color: "#333", borderBottom: "1px solid #f5f5f5",
  };

  if (showCreateSupplier) return (
    <div style={S.overlay}>
      <SupplierForm onSubmit={handleCreateSupplierSubmit} onCancel={() => setShowCreateSupplier(false)} />
    </div>
  );
  if (showCreateSupply) return (
    <div style={S.overlay}>
      <SupplyForm categorias={categorias} medidas={medidas} propiedades={propiedades}
        onSubmit={handleCreateSupplySubmit} onCancel={() => setShowCreateSupply(false)} />
    </div>
  );

  return (
    <>
      <div style={S.overlay}>
        <div style={S.modal}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <div style={S.left}>
            {/* Header */}
            <div style={S.header}>
              <div style={S.iconBox}>
                <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <p style={S.titleTxt}>Crear nueva compra</p>
                <p style={S.subtitleTxt}>Completa todos los campos obligatorios</p>
              </div>
            </div>

            {/* Factura */}
            <p style={S.sectionLbl}>Datos de la factura</p>
            <div style={S.fieldWrap}>
              <label style={S.lbl}>Número de factura<span style={S.req}>*</span></label>
              <Inp type="number" name="numeroFactura" value={formData.numeroFactura}
                onChange={handleChange} onBlur={(e) => validateField("numeroFactura", e.target.value)}
                placeholder="Ej: 0231" err={errors.numeroFactura} />
              {errors.numeroFactura && <p style={S.err}>{errors.numeroFactura}</p>}
            </div>

            {/* Proveedor */}
            <div style={S.fieldWrap}>
              <label style={S.lbl}>Proveedor<span style={S.req}>*</span></label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Inp value={proveedorSearch} placeholder="Buscar proveedor..." err={errors.proveedorId}
                    onChange={(e) => { setProveedorSearch(e.target.value); setShowProveedorDD(true); if (!e.target.value) setFormData((p) => ({ ...p, proveedorId: "", proveedor: "" })); }}
                    onFocus={() => setShowProveedorDD(true)}
                    onBlur={(e) => { onFocusOut(e); setTimeout(() => setShowProveedorDD(false), 150); }} />
                  {showProveedorDD && (
                    <div style={ddStyle}>
                      {filteredSuppliers.length > 0 ? filteredSuppliers.map((s) => (
                        <div key={s.id} style={ddItem} onMouseDown={() => handleSelectProveedor(s)}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf0f7")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{s.nombreEmpresa}</div>
                      )) : <div style={{ padding: "10px 12px", fontSize: "12px", color: "#999" }}>Sin resultados</div>}
                    </div>
                  )}
                </div>
                <button type="button" style={S.plusCircle} onClick={() => setShowCreateSupplier(true)} title="Nuevo proveedor">+</button>
              </div>
              {errors.proveedorId && <p style={S.err}>{errors.proveedorId}</p>}
            </div>

            {/* Fecha + Observaciones */}
            <div style={S.grid2}>
              <div style={S.fieldWrap}>
                <label style={S.lbl}>Fecha<span style={S.req}>*</span></label>
                <Inp type="date" name="fecha" value={formData.fecha}
                  onChange={handleChange} onBlur={(e) => validateField("fecha", e.target.value)} err={errors.fecha} />
                {errors.fecha && <p style={S.err}>{errors.fecha}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.lbl}>Observaciones <span style={{ fontWeight: 400, color: "#bbb", fontSize: "11px" }}>(opcional)</span></label>
                <Inp name="observaciones" value={formData.observaciones} onChange={handleChange}
                  placeholder="Ej. Compra urgente..." err={false} />
              </div>
            </div>

            {/* Costo total */}
            <div style={S.fieldWrap}>
              <label style={S.lbl}>
                Costo total<span style={S.req}>*</span>
                {formData.detalles.length > 0 && <span style={{ fontWeight: 400, color: "#aaa", marginLeft: "6px", fontSize: "11px" }}>calculado automáticamente</span>}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: formData.detalles.length > 0 ? "#FF4FD6" : "#aaa", fontWeight: 600 }}>$</span>
                <Inp type="number" name="costoTotal" value={formData.costoTotal}
                  onChange={formData.detalles.length === 0 ? handleChange : undefined}
                  readOnly={formData.detalles.length > 0}
                  placeholder="0.00" err={errors.costoTotal}
                  style={{
                    paddingLeft: "24px",
                    background: formData.detalles.length > 0 ? "#fdf0f7" : "#fff",
                    color: formData.detalles.length > 0 ? "#e91e8c" : "#333",
                    fontWeight: formData.detalles.length > 0 ? 600 : 400,
                    cursor: formData.detalles.length > 0 ? "default" : "text",
                  }} />
              </div>
              {errors.costoTotal && <p style={S.err}>{errors.costoTotal}</p>}
            </div>

            {/* Detalles */}
            <p style={S.sectionLbl}>Detalles de la compra</p>

            {/* Insumo search */}
            <div style={S.fieldWrap}>
              <label style={S.lbl}>Producto o insumo</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Inp value={insumoSearch} placeholder="Buscar insumo..." err={false}
                    onChange={(e) => { setInsumoSearch(e.target.value); setShowInsumoDD(true); }}
                    onFocus={() => setShowInsumoDD(true)}
                    onBlur={(e) => { onFocusOut(e); setTimeout(() => setShowInsumoDD(false), 150); }} />
                  {showInsumoDD && (
                    <div style={ddStyle}>
                      {filteredSupplies.length > 0 ? filteredSupplies.map((s) => (
                        <div key={s.id} style={ddItem} onMouseDown={() => handleSelectInsumo(s)}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf0f7")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{s.nombre}</div>
                      )) : <div style={{ padding: "10px 12px", fontSize: "12px", color: "#999" }}>Sin resultados</div>}
                    </div>
                  )}
                </div>
                <button type="button" style={S.plusCircle} onClick={() => setShowCreateSupply(true)} title="Nuevo insumo">+</button>
              </div>
            </div>

            <div style={S.grid2}>
              <div style={S.fieldWrap}>
                <label style={S.lbl}>Costo<span style={S.req}>*</span></label>
                <Inp type="number" name="costo" value={detalleActual.costo} onChange={handleDetalleChange} placeholder="Ej: 20" err={false} />
              </div>
              <div style={S.fieldWrap}>
                <label style={S.lbl}>Medida</label>
                <Sel name="medida" value={detalleActual.medida} onChange={handleDetalleChange} err={false}>
                  <option value="">Seleccionar</option>
                  {medidas.map((m) => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                </Sel>
              </div>
            </div>

            <div style={S.grid2}>
              <div style={S.fieldWrap}>
                <label style={S.lbl}>Cantidad<span style={S.req}>*</span></label>
                <Inp type="number" name="cantidad" value={detalleActual.cantidad} onChange={handleDetalleChange} err={false} />
              </div>
              <div style={S.fieldWrap}>
                <label style={S.lbl}>Costo unitario <span style={{ fontWeight: 400, color: "#bbb", fontSize: "10px" }}>auto</span></label>
                <Inp type="number" name="costoUnitario" value={detalleActual.costoUnitario} readOnly
                  placeholder="—" err={false} style={{ background: "#f9fafb", color: "#888", cursor: "default" }} />
              </div>
            </div>

            <div style={S.fieldWrap}>
              <label style={S.lbl}>Descripción adicional <span style={{ fontWeight: 400, color: "#bbb", fontSize: "11px" }}>(opcional)</span></label>
              <Inp name="descripcionAdicional" value={detalleActual.descripcionAdicional}
                onChange={handleDetalleChange} placeholder="Ej. Cajas de 12, presentación 500ml..." err={false} />
            </div>

            <button type="button" style={S.addBtn} onClick={handleAgregarDetalle}>
              <span style={{ fontSize: "18px" }}>⊕</span> Agregar otro producto
            </button>
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div style={S.right}>
            <div style={S.rightHead}>
              <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#333" }}>
                Resumen de compra
                <span style={{ fontSize: "11px", fontWeight: 400, color: "#aaa", marginLeft: "8px" }}>IVA incluido</span>
              </p>

              {formData.detalles.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      {["#", "Producto", "Medida", "Cant.", "Unitario", "Subtotal", ""].map((h, i) => (
                        <th key={i} style={{ padding: "8px 6px", textAlign: i >= 3 ? "right" : "left", color: "#bbb", fontWeight: 600, fontSize: "11px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalles.map((d, idx) => {
                      const medidaLabel = medidas.find((m) => m.valor === d.medida)?.label ?? d.medida ?? "—";
                      return (
                        <tr key={d.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "10px 6px", color: "#ccc", fontSize: "11px", fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: "10px 6px", color: "#333" }}>
                            <div style={{ fontWeight: 500 }}>{d.nombre}</div>
                            {d.descripcionAdicional && <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{d.descripcionAdicional}</div>}
                          </td>
                          <td style={{ padding: "10px 6px", color: "#555" }}>{medidaLabel}</td>
                          <td style={{ padding: "10px 6px", textAlign: "right", color: "#555" }}>{d.cantidad}</td>
                          <td style={{ padding: "10px 6px", textAlign: "right", color: "#555" }}>${Number(d.costoUnitario).toFixed(2)}</td>
                          <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 600, color: "#333" }}>${Number(d.costo).toFixed(2)}</td>
                          <td style={{ padding: "10px 6px", textAlign: "center" }}>
                            <button type="button" onClick={() => handleEliminarDetalle(d.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: "16px" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}>×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#ddd", fontSize: "13px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>🧾</div>
                  Los productos agregados aparecerán aquí
                </div>
              )}
            </div>

            <div style={S.rightFoot}>
              {formData.detalles.length > 0 && (
                <div style={{ textAlign: "right", marginBottom: "14px" }}>
                  <span style={{ fontSize: "11px", color: "#bbb", letterSpacing: "0.05em" }}>TOTAL </span>
                  <span style={{ color: "#FF4FD6", fontWeight: 700, fontSize: "18px", marginLeft: "6px" }}>
                    ${totalDetalles.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div style={S.btnRow}>
                <button type="button" style={S.btnCancel} onClick={handleCancel}>Cancelar</button>
                <button type="button" style={S.btnSave} onClick={handleSubmit}>Guardar Compra</button>
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