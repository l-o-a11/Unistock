import React, { useState, useMemo, useEffect } from "react";
import Alert from "../../../shared/components/Alert";
import { useSuppliers } from "../../../suppliers/hooks/mockSuppliers";
import { useSupplies } from "../../../supplies/hooks/useSupplies";
import SupplyForm from "../../../supplies/components/SupplyForm";
import SupplierForm from "../../../suppliers/components/SupplierForm";

const ShoppingForm = ({ onSubmit, onCancel }) => {
  const { suppliers, createSupplier } = useSuppliers();
  const { supplies, medidas, propiedades, categorias, createSupply } = useSupplies();

  const [formData, setFormData] = useState({
    numeroFactura: "",
    proveedorId: "",
    proveedor: "",
    fecha: "",
    observaciones: "",
    costoTotal: "",
    detalles: [],
  });

  const [errors, setErrors] = useState({});
  const [detalleActual, setDetalleActual] = useState({
    supplyId: "", nombre: "", medida: "",   // medida: string valor (ej: "kg", "und")
    cantidad: "", costo: "", costoUnitario: "", descripcionAdicional: "",
  });
  const [insumoSearch, setInsumoSearch] = useState("");
  const [showInsumoDD, setShowInsumoDD] = useState(false);
  const [showCreateSupply, setShowCreateSupply] = useState(false);

  const [proveedorSearch, setProveedorSearch] = useState("");
  const [showProveedorDD, setShowProveedorDD] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ open: false, type: "success", title: "", message: "", onConfirm: null });
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  // ── Costo total = suma automática de detalles ──────────────────────────
  const totalDetalles = useMemo(
    () => formData.detalles.reduce((acc, d) => acc + (d.costo || 0), 0),
    [formData.detalles]
  );

  useEffect(() => {
    if (formData.detalles.length > 0) {
      setFormData((prev) => ({ ...prev, costoTotal: totalDetalles.toFixed(2) }));
      setErrors((prev) => ({ ...prev, costoTotal: "" }));
    }
  }, [totalDetalles, formData.detalles.length]);

  // ── Validaciones ─────────────────────────────────────────────────────────
  const validators = {
    required: (v) => (!v && v !== 0 ? "Este campo es obligatorio" : ""),
    positiveNumber: (v) => (isNaN(v) || Number(v) <= 0 ? "Debe ser un número mayor a 0" : ""),
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "numeroFactura": error = validators.required(value); break;
      case "proveedorId": error = validators.required(value); break;
      case "fecha": error = validators.required(value); break;
      case "costoTotal": error = validators.required(value) || validators.positiveNumber(value); break;
      default: break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  // ── Proveedor search ──────────────────────────────────────────────────────
  const filteredSuppliers = useMemo(() => {
    if (!proveedorSearch.trim()) return suppliers;
    return suppliers.filter((s) =>
      s.nombreEmpresa?.toLowerCase().includes(proveedorSearch.toLowerCase())
    );
  }, [suppliers, proveedorSearch]);

  const handleSelectProveedor = (supplier) => {
    setFormData((prev) => ({ ...prev, proveedorId: supplier.id, proveedor: supplier.nombreEmpresa }));
    setProveedorSearch(supplier.nombreEmpresa);
    setShowProveedorDD(false);
    setErrors((prev) => ({ ...prev, proveedorId: "" }));
  };

  // ── Insumo search ─────────────────────────────────────────────────────────
  const filteredSupplies = useMemo(() => {
    if (!insumoSearch.trim()) return supplies;
    return supplies.filter((s) =>
      s.nombre?.toLowerCase().includes(insumoSearch.toLowerCase())
    );
  }, [supplies, insumoSearch]);

  const handleSelectInsumo = (supply) => {
    setDetalleActual((prev) => ({
      ...prev,
      supplyId: supply.id,
      nombre: supply.nombre,
      medida: supply.medida || "",   // supply.medida es string: "kg", "und", etc.
    }));
    setInsumoSearch(supply.nombre);
    setShowInsumoDD(false);
  };

  // ── Detalle handlers ──────────────────────────────────────────────────────
  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    setDetalleActual((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "costo" || name === "cantidad") {
        const costo = parseFloat(name === "costo" ? value : prev.costo) || 0;
        const cantidad = parseFloat(name === "cantidad" ? value : prev.cantidad) || 0;
        updated.costoUnitario = cantidad > 0 ? (costo / cantidad).toFixed(2) : "";
      }
      return updated;
    });
  };

  const handleAgregarDetalle = () => {
    if (!detalleActual.nombre.trim()) {
      showAlert("warning", "Campo requerido", "Selecciona o ingresa un producto/insumo."); return;
    }
    if (!detalleActual.cantidad || Number(detalleActual.cantidad) <= 0) {
      showAlert("warning", "Campo requerido", "Ingresa una cantidad válida."); return;
    }
    if (!detalleActual.costo || Number(detalleActual.costo) <= 0) {
      showAlert("warning", "Campo requerido", "Ingresa un costo válido."); return;
    }

    setFormData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, {
        id: Date.now(),
        supplyId: detalleActual.supplyId || null,
        nombre: detalleActual.nombre.trim(),
        medida: detalleActual.medida || null,   // string: "kg", "und", etc.
        cantidad: parseFloat(detalleActual.cantidad),
        costo: parseFloat(detalleActual.costo),
        costoUnitario: parseFloat(detalleActual.costoUnitario) || 0,
        descripcionAdicional: detalleActual.descripcionAdicional.trim(),
      }],
    }));
    setDetalleActual({ supplyId: "", nombre: "", medida: "", cantidad: "", costo: "", costoUnitario: "", descripcionAdicional: "" });
    setInsumoSearch("");
  };

  const handleEliminarDetalle = (id) =>
    setFormData((prev) => ({ ...prev, detalles: prev.detalles.filter((d) => d.id !== id) }));

  // ── Crear proveedor/insumo ─────────────────────────────────────────────────
  const handleCreateSupplierSubmit = async (supplierData) => {
    try {
      const newSupplier = await createSupplier(supplierData);
      handleSelectProveedor(newSupplier);
      setShowCreateSupplier(false);
      showAlert("success", "Proveedor creado", `"${newSupplier.nombreEmpresa}" fue creado y seleccionado.`);
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo crear el proveedor.");
    }
  };

  const handleCreateSupplySubmit = async (supplyData) => {
    try {
      const newSupply = await createSupply(supplyData);
      handleSelectInsumo(newSupply);
      setShowCreateSupply(false);
      showAlert("success", "Insumo creado", `"${newSupply.nombre}" fue creado y seleccionado.`);
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo crear el insumo.");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const fields = ["numeroFactura", "proveedorId", "fecha", "costoTotal"];
    let newErrors = {};
    fields.forEach((f) => { const e = validateField(f, formData[f]); if (e) newErrors[f] = e; });
    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e)) {
      showAlert("warning", "Campos inválidos", "Corrige los campos marcados antes de guardar."); return;
    }
    if (formData.detalles.length === 0) {
      showAlert("warning", "Sin detalles", "Agrega al menos un producto o insumo a la compra."); return;
    }
    try {
      await onSubmit({ ...formData, costoTotal: parseFloat(formData.costoTotal) });
    } catch (error) {
      showAlert("error", "Error al guardar", error.message || "No se pudo guardar la compra.");
    }
  };

  const handleCancel = () => {
    showAlert("confirm", "¿Cancelar?", "Los datos ingresados se perderán.", () => { closeAlert(); onCancel?.(); });
  };

  // ── Estilos ───────────────────────────────────────────────────────────────
  const inp = (hasError) => ({
    width: "100%", padding: "9px 12px", borderRadius: "6px",
    border: `1px solid ${hasError ? "#E91E8C" : "#d1d5db"}`,
    fontSize: "13px", color: "#333", outline: "none",
    boxSizing: "border-box", backgroundColor: "#fff", transition: "border-color 0.15s",
  });
  const lbl = { display: "block", fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "5px" };
  const errS = { color: "#E91E8C", fontWeight: "bold", fontSize: "11px", marginTop: "3px" };
  const req = <span style={{ color: "#FF4FD6" }}> *</span>;
  const onFocus = (e) => { e.target.style.borderColor = "#FF4FD6"; e.target.style.boxShadow = "0 0 0 3px #FF4FD620"; };
  const onBlurS = (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; };

  // ── Modales anidados ──────────────────────────────────────────────────────
  if (showCreateSupplier) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
        <SupplierForm onSubmit={handleCreateSupplierSubmit} onCancel={() => setShowCreateSupplier(false)} />
      </div>
    );
  }

  if (showCreateSupply) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
        <SupplyForm
          categorias={categorias} medidas={medidas} propiedades={propiedades}
          onSubmit={handleCreateSupplySubmit} onCancel={() => setShowCreateSupply(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: "0", background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "900px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>

        {/* ── COLUMNA IZQUIERDA ── */}
        <div style={{ flex: "0 0 420px", padding: "28px 24px", overflowY: "auto", maxHeight: "90vh", scrollbarGutter: "stable", paddingRight: "12px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700, color: "#111" }}>
            Crear nueva compra
          </h2>

          {/* Número de factura */}
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Número de factura{req}</label>
            <input type="number" name="numeroFactura" value={formData.numeroFactura} onChange={handleChange} onBlur={handleBlur}
              placeholder="Ej. 0231" style={inp(errors.numeroFactura)} onFocus={onFocus} />
            {errors.numeroFactura && <p style={errS}>{errors.numeroFactura}</p>}
          </div>

          {/* Proveedor */}
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Proveedor{req}</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={proveedorSearch}
                  onChange={(e) => {
                    setProveedorSearch(e.target.value);
                    setShowProveedorDD(true);
                    if (!e.target.value) setFormData((prev) => ({ ...prev, proveedorId: "", proveedor: "" }));
                  }}
                  onFocus={() => setShowProveedorDD(true)}
                  onBlur={() => setTimeout(() => setShowProveedorDD(false), 150)}
                  placeholder="Buscar proveedor..."
                  style={inp(errors.proveedorId)}
                />
                {showProveedorDD && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", zIndex: 100, maxHeight: "160px", overflowY: "auto" }}>
                    {filteredSuppliers.length > 0 ? filteredSuppliers.map((s) => (
                      <div key={s.id} onMouseDown={() => handleSelectProveedor(s)}
                        style={{ padding: "8px 12px", fontSize: "13px", cursor: "pointer", color: "#333", borderBottom: "1px solid #f5f5f5" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf0f7")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}>
                        {s.nombreEmpresa}
                      </div>
                    )) : (
                      <div style={{ padding: "10px 12px", fontSize: "12px", color: "#999" }}>No se encontraron proveedores</div>
                    )}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setShowCreateSupplier(true)} title="Crear nuevo proveedor"
                style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", backgroundColor: "#FF4FD6", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px #FF4FD644" }}>
                +
              </button>
            </div>
            {errors.proveedorId && <p style={errS}>{errors.proveedorId}</p>}
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Fecha{req}</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} onBlur={handleBlur}
              style={inp(errors.fecha)} onFocus={onFocus} />
            {errors.fecha && <p style={errS}>{errors.fecha}</p>}
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Observaciones</label>
            <input name="observaciones" value={formData.observaciones} onChange={handleChange}
              placeholder="Ej. Compra para la orden x del cliente x"
              style={inp(false)} onFocus={onFocus} onBlur={onBlurS} />
          </div>

          {/* Costo total — readonly, calculado de detalles */}
          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>
              Costo total{req}
              {formData.detalles.length > 0 && (
                <span style={{ fontWeight: 400, color: "#aaa", marginLeft: "6px", fontSize: "11px" }}>
                  calculado automáticamente
                </span>
              )}
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                fontSize: "13px", color: formData.detalles.length > 0 ? "#FF4FD6" : "#aaa", fontWeight: 600,
              }}>$</span>
              <input
                type="number"
                name="costoTotal"
                value={formData.costoTotal}
                onChange={formData.detalles.length === 0 ? handleChange : undefined}
                onBlur={formData.detalles.length === 0 ? handleBlur : undefined}
                readOnly={formData.detalles.length > 0}
                placeholder="0.00"
                style={{
                  ...inp(errors.costoTotal),
                  paddingLeft: "24px",
                  backgroundColor: formData.detalles.length > 0 ? "#fdf0f7" : "#fff",
                  color: formData.detalles.length > 0 ? "#e91e8c" : "#333",
                  fontWeight: formData.detalles.length > 0 ? 600 : 400,
                  cursor: formData.detalles.length > 0 ? "default" : "text",
                }}
                onFocus={formData.detalles.length === 0 ? onFocus : undefined}
              />
            </div>
            {errors.costoTotal && <p style={errS}>{errors.costoTotal}</p>}
          </div>

          {/* ── Detalles ── */}
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
            <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 600, color: "#333" }}>Detalles de la compra</p>

            {/* Insumo */}
            <div style={{ marginBottom: "10px" }}>
              <label style={lbl}>Producto o insumo</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    value={insumoSearch}
                    onChange={(e) => { setInsumoSearch(e.target.value); setShowInsumoDD(true); }}
                    onFocus={() => setShowInsumoDD(true)}
                    onBlur={() => setTimeout(() => setShowInsumoDD(false), 150)}
                    placeholder="Buscar insumo..."
                    style={inp(false)}
                  />
                  {showInsumoDD && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", zIndex: 100, maxHeight: "160px", overflowY: "auto" }}>
                      {filteredSupplies.length > 0 ? filteredSupplies.map((s) => (
                        <div key={s.id} onMouseDown={() => handleSelectInsumo(s)}
                          style={{ padding: "8px 12px", fontSize: "13px", cursor: "pointer", color: "#333", borderBottom: "1px solid #f5f5f5" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf0f7")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}>
                          {s.nombre}
                        </div>
                      )) : (
                        <div style={{ padding: "10px 12px", fontSize: "12px", color: "#999" }}>No se encontraron insumos</div>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setShowCreateSupply(true)} title="Crear nuevo insumo"
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", backgroundColor: "#FF4FD6", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px #FF4FD644" }}>
                  +
                </button>
              </div>
            </div>

            {/* Costo + Medida */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Costo{req}</label>
                <input type="number" name="costo" value={detalleActual.costo} onChange={handleDetalleChange}
                  placeholder="Ej. 20" style={inp(false)} onFocus={onFocus} onBlur={onBlurS} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Medida</label>
                <select name="medida" value={detalleActual.medida} onChange={handleDetalleChange}
                  style={inp(false)} onFocus={onFocus}>
                  <option value="">Seleccionar</option>
                  {medidas.map((m) => (
                    <option key={m.valor} value={m.valor}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cantidad + Costo unitario (readonly) */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Cantidad{req}</label>
                <input type="number" name="cantidad" value={detalleActual.cantidad} onChange={handleDetalleChange}
                  style={inp(false)} onFocus={onFocus} onBlur={onBlurS} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>
                  Costo unitario
                  <span style={{ fontWeight: 400, color: "#bbb", marginLeft: "4px", fontSize: "10px" }}>auto</span>
                </label>
                <input type="number" name="costoUnitario" value={detalleActual.costoUnitario} readOnly
                  placeholder="—"
                  style={{ ...inp(false), backgroundColor: "#f9fafb", color: "#888", cursor: "default" }} />
              </div>
            </div>

            {/* Descripción adicional (antes: Unidades) */}
            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>
                Descripción adicional
                <span style={{ fontWeight: 400, color: "#bbb", marginLeft: "4px", fontSize: "10px" }}>opcional</span>
              </label>
              <input
                name="descripcionAdicional"
                value={detalleActual.descripcionAdicional}
                onChange={handleDetalleChange}
                placeholder="Ej. Cajas de 12, presentación 500ml..."
                style={inp(false)} onFocus={onFocus} onBlur={onBlurS}
              />
            </div>

            <button type="button" onClick={handleAgregarDetalle}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#FF4FD6", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: 0 }}>
              <span style={{ fontSize: "18px", lineHeight: 1 }}>⊕</span> Agregar otro producto
            </button>
          </div>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div style={{ flex: 1, backgroundColor: "#fafafa", borderLeft: "1px solid #f0f0f0", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, padding: "28px 20px", overflowY: "auto" }}>
            <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#333" }}>
              Detalles de la compra
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
                  {formData.detalles.map((d, index) => {
                    // medida es el string valor directamente: "kg", "und", etc.
                    const medidaLabel = medidas.find((m) => m.valor === d.medida)?.label ?? d.medida ?? "—";
                    return (
                      <tr key={d.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px 6px", color: "#ccc", fontSize: "11px", fontWeight: 600 }}>{index + 1}</td>
                        <td style={{ padding: "10px 6px", color: "#333" }}>
                          <div style={{ fontWeight: 500 }}>{d.nombre}</div>
                          {d.descripcionAdicional && (
                            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{d.descripcionAdicional}</div>
                          )}
                        </td>
                        <td style={{ padding: "10px 6px", color: "#555" }}>{medidaLabel}</td>
                        <td style={{ padding: "10px 6px", textAlign: "right", color: "#555" }}>{d.cantidad}</td>
                        <td style={{ padding: "10px 6px", textAlign: "right", color: "#555" }}>${Number(d.costoUnitario).toFixed(2)}</td>
                        <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 600, color: "#333" }}>${Number(d.costo).toFixed(2)}</td>
                        <td style={{ padding: "10px 6px", textAlign: "center" }}>
                          <button type="button" onClick={() => handleEliminarDetalle(d.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: "16px", lineHeight: 1 }}
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

          {/* Total + Botones */}
          <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px 20px" }}>
            {formData.detalles.length > 0 && (
              <div style={{ textAlign: "right", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", color: "#bbb", letterSpacing: "0.05em" }}>TOTAL </span>
                <span style={{ color: "#FF4FD6", fontWeight: 700, fontSize: "18px", marginLeft: "6px" }}>
                  ${totalDetalles.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={handleCancel}
                style={{ padding: "9px 22px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", color: "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button type="button" onClick={handleSubmit}
                style={{ padding: "9px 22px", borderRadius: "8px", border: "none", background: "#FF4FD6", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px #FF4FD644" }}>
                Guardar Compra
              </button>
            </div>
          </div>
        </div>
      </div>

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { alertConfig.onConfirm?.(); closeAlert(); }}
        onCancel={closeAlert}
      />
    </>
  );
};

export default ShoppingForm;