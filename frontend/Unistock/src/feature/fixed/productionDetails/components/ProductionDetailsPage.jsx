import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductionAPI } from "../../services/ProductionAPI";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import TechnicalSheet from "../../components/TechnicalSheet";
import AlertEditProduction from "../pages/AlertEditProduction";
import ProductionAlerts from "../pages/ProductionAlerts";

const steps = ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Entregado"];

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h12" />
  </svg>
);

const ProductionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [production,      setProduction]      = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [addRefOpen,      setAddRefOpen]      = useState(false);
  const [newRef,          setNewRef]          = useState({ cantidad: "", color: "" });
  const [addRefError,     setAddRefError]     = useState("");
  const [editAlert,       setEditAlert]       = useState({ isOpen: false, detail: null });
  const [productionAlert, setProductionAlert] = useState({
    isOpen: false, type: "advance", targetStep: null,
    tercero: "", sede: "",
    customTitle: undefined, customMessage: undefined, onConfirmOverride: null,
  });
  const [showTechSheet, setShowTechSheet]   = useState(false);
  const [globalAlert,   setGlobalAlert]     = useState({ open: false, type: "success", title: "", message: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ProductionAPI.getById(Number(id));
        setProduction(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)     return <p className="p-6">Cargando...</p>;
  if (!production) return <p className="p-6">No se encontró la orden</p>;

  const currentStepIndex = production.status === 'Anulada' ? -1 : steps.indexOf(production.status);
  const safeStepIndex    = Math.max(currentStepIndex, 0);
  const progressPercent  = production.status === 'Anulada'
    ? 0 : Math.round(((safeStepIndex + 1) / steps.length) * 100);
  const nextStep = steps[safeStepIndex + 1];
  const prevStep = steps[safeStepIndex - 1];
  const isAnulada = production.status === 'Anulada';
  // Bloqueo tras Corte (índice 2)
  const isLocked = safeStepIndex > steps.indexOf("Corte");

  const getAlertType = (from, to) => {
    if (from === "Compras"    && to === "Producción") return "third";
    if (from === "Producción" && to === "Recepción")  return "assignSede";
    return "advance";
  };

  const openProductionAlert = (overrides) =>
    setProductionAlert({
      isOpen: true, type: "advance", targetStep: null,
      tercero: "", sede: "",
      customTitle: undefined, customMessage: undefined, onConfirmOverride: null,
      ...overrides,
    });

  const closeProductionAlert = () =>
    setProductionAlert((p) => ({ ...p, isOpen: false }));

  const applyStepChange = async (newStatus) => {
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentUser = ProductionAPI.getCurrentUser();
    const updatedHistory = [
      ...(production.history || []),
      { status: newStatus, date: today, user: currentUser, motivo: null }
    ];
    const updated = {
      ...production,
      status: newStatus,
      statusDate: today,
      history: updatedHistory,
      details: (production.details || []).map(d => ({ ...d, status: newStatus, statusDate: today })),
    };
    const saved = await ProductionAPI.update(production.id, updated);
    setProduction(saved);
  };

  const handleProductionAlertConfirm = async () => {
    const { targetStep, type, tercero, sede, onConfirmOverride } = productionAlert;
    closeProductionAlert();
    if (onConfirmOverride) { onConfirmOverride(); return; }
    if (targetStep) await applyStepChange(targetStep);
  };

  const handleSaveChanges = async () => {
    const saved = await ProductionAPI.update(production.id, production);
    setProduction(saved);
  };

  const handleEditConfirm = async (updatedDetail) => {
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentUser = ProductionAPI.getCurrentUser();
    const newDetails = (production.details || []).map(d =>
      d.refCorte === updatedDetail.refCorte ? { ...d, ...updatedDetail } : d
    );
    const saved = await ProductionAPI.update(production.id, {
      ...production,
      details: newDetails,
      techSpecification: recalcCosts(newDetails, production.techSpecification),
      history: [
        ...(production.history || []),
        { status: `Artículo editado`, date: today, user: currentUser,
          motivo: `Ref: ${updatedDetail.ref} | Color: ${updatedDetail.color} | Cantidad: ${updatedDetail.quantity} uds` }
      ]
    });
    setProduction(saved);
    setEditAlert({ isOpen: false, detail: null });
  };

  const recalcCosts = (details, techSpec) => {
    if (!techSpec) return techSpec;
    const totalQty = (details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);
    return { ...techSpec, totalCost: techSpec.costPerUnit * totalQty };
  };

  const handleSaveRef = async () => {
    if (!newRef.cantidad || !newRef.color) { setAddRefError("Completa cantidad y color."); return; }
    const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentUser = ProductionAPI.getCurrentUser();
    const newDetail = {
      refCorte: `${production.referencia}_${Date.now().toString().slice(-4)}`,
      ref: production.referencia,
      status: production.status,
      statusDate: today,
      quantity: Number(newRef.cantidad),
      color: newRef.color
    };
    const newDetails = [...(production.details || []), newDetail];
    const saved = await ProductionAPI.update(production.id, {
      ...production,
      quantity: newDetails.reduce((s, d) => s + d.quantity, 0),
      details: newDetails,
      techSpecification: recalcCosts(newDetails, production.techSpecification),
      history: [
        ...(production.history || []),
        { status: `Artículo agregado`, date: today, user: currentUser,
          motivo: `Ref: ${production.referencia} | Color: ${newRef.color} | Cantidad: ${newRef.cantidad} uds` }
      ]
    });
    setProduction(saved);
    setAddRefOpen(false);
    setNewRef({ cantidad: "", color: "" });
    setAddRefError("");
  };

  const anuladaEntry = (production.history || []).findLast?.(h => h.status === 'Anulada')
    || [...(production.history || [])].reverse().find(h => h.status === 'Anulada');

  const handleAnularDetail = (d) => {
    openProductionAlert({
      type: "confirm",
      customTitle: "Anular artículo",
      customMessage: `¿Deseas anular el artículo ${d.ref} (${d.color}, ${d.quantity} uds)? Se eliminará de la tabla y quedará registrado en el historial.`,
      onConfirmOverride: async () => {
        const today = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const currentUser = ProductionAPI.getCurrentUser();
        const newDetails = (production.details || []).filter(x => x !== d);
        const saved = await ProductionAPI.update(production.id, {
          ...production,
          quantity: newDetails.reduce((s, x) => s + x.quantity, 0),
          details: newDetails,
          techSpecification: recalcCosts(newDetails, production.techSpecification),
          history: [
            ...(production.history || []),
            { status: 'Artículo anulado', date: today, user: currentUser,
              motivo: `Ref: ${d.ref} | Color: ${d.color} | Cantidad: ${d.quantity} uds | Ref_corte: ${d.refCorte}` }
          ]
        });
        setProduction(saved);
      }
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <ProductionAlerts
        isOpen={productionAlert.isOpen}
        type={productionAlert.type}
        targetStep={productionAlert.targetStep}
        tercero={productionAlert.tercero}
        sede={productionAlert.sede}
        onChangeTercero={(v) => setProductionAlert((p) => ({ ...p, tercero: v }))}
        onChangeSede={(v)    => setProductionAlert((p) => ({ ...p, sede: v }))}
        customTitle={productionAlert.customTitle}
        customMessage={productionAlert.customMessage}
        onAccept={handleProductionAlertConfirm}
        onCancel={closeProductionAlert}
      />

      <AlertEditProduction
        isOpen={editAlert.isOpen}
        detail={editAlert.detail}
        onAccept={handleEditConfirm}
        onCancel={() => setEditAlert({ isOpen: false, detail: null })}
      />

      {addRefOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">Agregar artículo</h2>
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Cantidad</label>
              <input type="number" min="1" value={newRef.cantidad}
                onChange={(e) => setNewRef({ ...newRef, cantidad: e.target.value })}
                placeholder="Ej: 100"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Color</label>
              <select value={newRef.color} onChange={(e) => setNewRef({ ...newRef, color: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300">
                <option value="">Seleccionar color...</option>
                <option>Rojo</option><option>Negro</option><option>Azul</option>
                <option>Blanco</option><option>Verde</option>
              </select>
            </div>
            {addRefError && <p className="text-xs font-bold mb-3" style={{ color: "#E91E8C" }}>{addRefError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setAddRefOpen(false); setNewRef({ cantidad: "", color: "" }); setAddRefError(""); }}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleSaveRef}
                className="flex-1 py-2 rounded-xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition shadow-md shadow-pink-200">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <Button variant="secondary" onClick={() => navigate("/layout/produccion")} className="mb-4">
        ← Volver a Producciones
      </Button>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Orden #{production.orderNumber}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${isAnulada ? 'bg-red-100 text-red-600' : 'bg-pink-200 text-pink-700'}`}>
            {production.status}
          </span>
        </div>
        {!isAnulada && <Button onClick={handleSaveChanges}>Guardar cambios</Button>}
      </div>

      {isAnulada && anuladaEntry && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
          <span className="text-2xl">🚫</span>
          <div>
            <p className="font-semibold text-red-700 text-sm">Orden anulada — {anuladaEntry.date}</p>
            {anuladaEntry.motivo && (
              <p className="text-sm text-red-600 mt-1">
                <span className="font-semibold">Motivo: </span>{anuladaEntry.motivo}
              </p>
            )}
            <p className="text-xs text-red-400 mt-1">Anulado por: {anuladaEntry.user}</p>
          </div>
        </div>
      )}

      {/* Stepper */}
      {!isAnulada && (
        <div className="bg-white rounded-2xl p-5 shadow mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Progreso</span>
            <span className="text-xs font-bold text-pink-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
            <div className="bg-gradient-to-r from-pink-400 to-fuchsia-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${i < safeStepIndex ? 'bg-pink-500 border-pink-500 text-white'
                    : i === safeStepIndex ? 'bg-white border-pink-500 text-pink-500 shadow-md shadow-pink-100'
                    : 'bg-white border-gray-200 text-gray-300'}`}>
                  {i < safeStepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-center leading-tight ${i === safeStepIndex ? 'text-pink-600 font-bold' : 'text-gray-400 font-medium'}`}
                  style={{ fontSize: 9 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones navegación */}
      {!isAnulada && (
        <div className="flex gap-3 mb-5">
          {prevStep && (
            <button onClick={() => openProductionAlert({
              type: "advance",
              targetStep: prevStep,
              customTitle: "Retroceder estado",
              customMessage: `¿Deseas retroceder a "${prevStep}"?`,
            })}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 font-medium shadow-sm transition">
              ← {prevStep}
            </button>
          )}
          {nextStep && (
            <button onClick={() => openProductionAlert({
              type: getAlertType(production.status, nextStep),
              targetStep: nextStep,
              customTitle: `Avanzar a "${nextStep}"`,
              customMessage: `¿Confirmas el avance al estado "${nextStep}"?`,
            })}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-bold shadow-md shadow-pink-200 hover:shadow-pink-300 transition">
              {nextStep} →
            </button>
          )}
          <button onClick={() => openProductionAlert({
            type: "confirm",
            customTitle: "Anular orden",
            customMessage: "¿Deseas anular esta orden de producción? Esta acción no se puede deshacer.",
            onConfirmOverride: async () => {
              const motivo = prompt("Motivo de anulación:") || "Sin motivo";
              const saved = await ProductionAPI.cancel(production.id, motivo);
              setProduction(saved);
            }
          })}
            className="ml-auto px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-sm text-red-500 hover:bg-red-100 font-medium transition">
            Anular orden
          </button>
        </div>
      )}

      {/* Info general */}
      <div className="bg-white rounded-2xl p-5 shadow mb-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-700">Información general</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Cliente", production.client],
            ["Producto", production.producto],
            ["Referencia", production.referencia],
            ["Color", production.color],
            ["Fecha entrega", production.deliveryDate],
            ["Tipo", production.tipo === 'diseno' ? 'Diseño' : 'Producción'],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide block">{label}</span>
              <span className="text-gray-700 font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: artículos + historial */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Artículos */}
        <div className="bg-white p-4 rounded-xl shadow overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Artículos de la orden</h3>
            {!isAnulada && !isLocked && (
              <button onClick={() => setAddRefOpen(true)}
                className="text-xs font-semibold text-pink-500 hover:text-pink-700 flex items-center gap-1 border border-pink-200 rounded-lg px-2 py-1">
                + Agregar
              </button>
            )}
            {!isAnulada && isLocked && (
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                🔒 Bloqueado tras Corte
              </span>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100 text-xs uppercase tracking-wide">
                <th className="pb-2">Ref. Corte</th>
                <th className="pb-2">Ref</th>
                <th className="pb-2">Color</th>
                <th className="pb-2">Cant.</th>
                <th className="pb-2">Estado</th>
                {!isAnulada && !isLocked && <th className="pb-2">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {(production.details || []).map((d, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs text-purple-600">{d.refCorte}</td>
                  <td className="py-2">{d.ref}</td>
                  <td className="py-2">{d.color}</td>
                  <td className="py-2 font-semibold">{d.quantity}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-pink-100 text-pink-600 font-semibold">{d.status}</span>
                  </td>
                  {!isAnulada && !isLocked && (
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => setEditAlert({ isOpen: true, detail: d })}
                          className="text-gray-400 hover:text-blue-500 transition"><EditIcon /></button>
                        <button onClick={() => handleAnularDetail(d)}
                          className="text-gray-400 hover:text-red-500 transition"><TrashIcon /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Historial */}
        <div className="bg-white p-4 rounded-xl shadow overflow-auto">
          <h3 className="font-semibold mb-4 text-sm">Historial de la orden</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-100 text-xs uppercase tracking-wide">
                <th className="pb-2">Estado</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Responsable</th>
                <th className="pb-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {(production.history || []).map((h, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${h.status === 'Anulada' ? 'bg-red-100 text-red-600'
                        : h.status.includes('anulado') || h.status.includes('Anulado') ? 'bg-orange-100 text-orange-600'
                        : 'bg-pink-100 text-pink-600'}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500 text-xs whitespace-nowrap">{h.date}</td>
                  <td className="py-2 text-gray-600 text-xs font-medium">{h.user || '—'}</td>
                  <td className="py-2 text-xs">
                    {h.motivo
                      ? <span className="italic text-red-500">{h.motivo}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ficha técnica */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#E91E8C,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Ficha técnica</h3>
              {production.techSpecification && (
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {production.techSpecification.name} · Versión {production.techSpecification.version || 1}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {production.techSpecification ? (
              <button onClick={() => setShowTechSheet(true)}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#374151", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Ver ficha técnica
              </button>
            ) : (
              !isAnulada && production.tipo === 'diseno' && (
                <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                  Sin ficha — se generará al avanzar
                </span>
              )
            )}
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {production.techSpecification ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                ["Total artículos", `${(production.details||[]).reduce((s,d)=>s+(Number(d.quantity)||0),0).toLocaleString("es-CO")} uds`, "#2563eb", "#eff6ff"],
                ["Costo por unidad", `$${(production.techSpecification.costPerUnit||0).toLocaleString("es-CO")}`, "#9333ea", "#faf5ff"],
                ["Costo total", `$${(production.techSpecification.totalCost||0).toLocaleString("es-CO")}`, "#e91e8c", "#fff0fb"],
              ].map(([label, value, color, bg]) => (
                <div key={label} style={{ background: bg, borderRadius: 10, padding: "12px 14px", border: `1px solid ${color}22` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color }}>{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
                Sin ficha técnica.{" "}
                {production.tipo === 'diseno' && !isAnulada
                  ? <span style={{ color: "#E91E8C", fontWeight: 600 }}>Crea una en el formulario de diseño.</span>
                  : null}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal ficha técnica — solo lectura, no se puede editar */}
      {showTechSheet && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "95%", maxWidth: 1100, maxHeight: "92vh", overflowY: "auto", padding: "24px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                  📋 Ficha Técnica — Orden #{production.orderNumber}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>Solo lectura · La ficha no puede modificarse una vez creada</p>
              </div>
              <button type="button" onClick={() => setShowTechSheet(false)}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 13 }}>
                Cerrar
              </button>
            </div>
            <TechnicalSheet
              sheet={production.techSpecification}
              isEditing={false}
            />
          </div>
        </div>
      )}

      <Alert
        isOpen={globalAlert.open}
        type={globalAlert.type}
        title={globalAlert.title}
        message={globalAlert.message}
        onConfirm={() => setGlobalAlert(prev => ({ ...prev, open: false }))}
        onCancel={() => setGlobalAlert(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ProductionDetailsPage;
//no se usa pero no borrar 