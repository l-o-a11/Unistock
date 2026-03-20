/**
 * @file ProductionDetailsPage.jsx
 * @description Página de detalle de una orden de producción — Diseño renovado (Orden #3005 style)
 *
 * Responsabilidades:
 *   - Cargar y mostrar los datos de una orden por ID (URL param)
 *   - Avanzar / retroceder el estado de la orden (stepper)
 *   - Gestionar artículos: agregar, editar, eliminar con confirmación y alerta de éxito
 *   - Gestionar la ficha técnica: crear inline si no existe, ver expandida si existe
 *   - Bloquear el avance al siguiente paso si el paso actual es "Ficha Técnica"
 *     y aún no se ha creado la ficha
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductionAPI } from "../../services/ProductionAPI";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import TechnicalSheet from "../../components/TechnicalSheet";
import AlertEditProduction from "../pages/AlertEditProduction";
import ProductionAlerts from "../pages/ProductionAlerts";

const steps = ["Diseño", "Ficha", "Corte", "Compras", "Producción", "Recepción", "Entrega"];
const stepsReal = ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Entregado"];

/* ─── Size sort order ─────────────────────────────────────────
   Extrae el sufijo de talla de refCorte (e.g. "3005-M" → "M")
   y lo ordena por el ranking estándar XS → 5XL.
   Si no coincide con ninguna talla conocida, va al final
   ordenado alfabéticamente.
──────────────────────────────────────────────────────────────*/
const SIZE_ORDER = ["3XS","2XS","XS","S","M","L","XL","2XL","XXL","3XL","XXXL","4XL","5XL"];

const extractSize = (refCorte = "") => {
  // Intenta el sufijo después del último guión: "3005-M" → "M"
  const parts = refCorte.split("-");
  return parts[parts.length - 1].trim().toUpperCase();
};

const sortBySize = (details = []) =>
  [...details].sort((a, b) => {
    const sA = extractSize(a.refCorte);
    const sB = extractSize(b.refCorte);
    const iA = SIZE_ORDER.indexOf(sA);
    const iB = SIZE_ORDER.indexOf(sB);
    // Ambos conocidos → por ranking
    if (iA !== -1 && iB !== -1) return iA - iB;
    // Solo uno conocido → el conocido va primero
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
    // Ninguno conocido → alfabético
    return sA.localeCompare(sB);
  });

/* ─── Icons ──────────────────────────────────────────────────── */
const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-4 0h12" />
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" />
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─── Status pill helper ──────────────────────────────────────── */
const statusStyle = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("list") || s.includes("finaliz") || s.includes("entregad") || s === "diseño")
    return { background: "#d1fae5", color: "#065f46" };
  if (s.includes("costura") || s.includes("producción") || s.includes("proceso"))
    return { background: "#fef3c7", color: "#92400e" };
  if (s.includes("anulad") || s.includes("cancelad"))
    return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fce7f3", color: "#9d174d" };
};

/* ─── Dot color for history timeline ─────────────────────────── */
const dotColor = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("finaliz") || s.includes("list") || s.includes("aprobad")) return "#10b981";
  if (s.includes("anulad")) return "#ef4444";
  return "#E91E8C";
};

/* ══════════════════════════════════════════════════════════════ */
const ProductionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addRefOpen, setAddRefOpen] = useState(false);
  const [newRef, setNewRef] = useState({ cantidad: "", color: "" });
  const [addRefError, setAddRefError] = useState("");

  const [editAlert, setEditAlert] = useState({ isOpen: false, detail: null });
  const [productionAlert, setProductionAlert] = useState({
    isOpen: false, type: "advance", targetStep: null,
    tercero: "", sede: "",
    customTitle: undefined, customMessage: undefined, onConfirmOverride: null,
  });

  const [showTechSheet, setShowTechSheet] = useState(false);
  const [showTechSheetForm, setShowTechSheetForm] = useState(false);
  const [techSheetDraft, setTechSheetDraft] = useState(null);

  const [globalAlert, setGlobalAlert] = useState({ open: false, type: "success", title: "", message: "" });

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div style={{ width: 40, height: 40, border: "3px solid #E91E8C", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#9ca3af", fontSize: 13 }}>Cargando orden...</p>
      </div>
    </div>
  );
  if (!production) return <p className="p-6">No se encontró la orden</p>;

  /* ── Derived state ──────────────────────────────────────────── */
  const currentStepIndex = production.status === "Anulada" ? -1 : stepsReal.indexOf(production.status);
  const safeStepIndex = Math.max(currentStepIndex, 0);
  const progressPercent = production.status === "Anulada"
    ? 0 : Math.round(((safeStepIndex + 1) / stepsReal.length) * 100);
  const nextStep = stepsReal[safeStepIndex + 1];
  const prevStep = stepsReal[safeStepIndex - 1];
  const prevStepLabel = steps[safeStepIndex - 1];
  const nextStepLabel = steps[safeStepIndex + 1];
  const isAnulada = production.status === "Anulada";
  const isLocked = safeStepIndex > stepsReal.indexOf("Corte");
  const isOnFichaStep = production.status === "Ficha Técnica";
  const hasTechSheet = !!production.techSpecification;
  const fichaBloquea = isOnFichaStep && !hasTechSheet;

  const totalUnidades = (production.details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);

  const getAlertType = (from, to) => {
    if (from === "Compras" && to === "Producción") return "third";
    if (from === "Producción" && to === "Recepción") return "assignSede";
    return "advance";
  };

  const openProductionAlert = (overrides) =>
    setProductionAlert({ isOpen: true, type: "advance", targetStep: null, tercero: "", sede: "", customTitle: undefined, customMessage: undefined, onConfirmOverride: null, ...overrides });

  const closeProductionAlert = () => setProductionAlert((p) => ({ ...p, isOpen: false }));

  const applyStepChange = async (newStatus) => {
    const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const currentUser = ProductionAPI.getCurrentUser();
    const updatedHistory = [...(production.history || []), { status: newStatus, date: today, user: currentUser, motivo: null }];
    const updated = { ...production, status: newStatus, statusDate: today, history: updatedHistory, details: (production.details || []).map(d => ({ ...d, status: newStatus, statusDate: today })) };
    const saved = await ProductionAPI.update(production.id, updated);
    setProduction(saved);
  };

  const handleProductionAlertConfirm = async (motivo = "") => {
    const { targetStep, onConfirmOverride } = productionAlert;
    closeProductionAlert();
    if (onConfirmOverride) { onConfirmOverride(motivo); return; }
    if (targetStep) await applyStepChange(targetStep);
  };

  const handleEditConfirm = async (updatedDetail) => {
    const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const currentUser = ProductionAPI.getCurrentUser();
    const newDetails = (production.details || []).map(d => d.refCorte === updatedDetail.refCorte ? { ...d, ...updatedDetail } : d);
    const saved = await ProductionAPI.update(production.id, {
      ...production,
      details: newDetails,
      techSpecification: recalcCosts(newDetails, production.techSpecification),
      history: [...(production.history || []), { status: "Artículo editado", date: today, user: currentUser, motivo: `Ref: ${updatedDetail.ref} | Color: ${updatedDetail.color} | Cantidad: ${updatedDetail.quantity} uds` }]
    });
    setProduction(saved);
    setEditAlert({ isOpen: false, detail: null });
    setGlobalAlert({ open: true, type: "success", title: "Artículo actualizado", message: `El artículo ${updatedDetail.ref} fue actualizado correctamente.` });
  };

  const recalcCosts = (details, techSpec) => {
    if (!techSpec) return techSpec;
    const totalQty = (details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);
    return { ...techSpec, totalCost: techSpec.costPerUnit * totalQty };
  };

  const handleSaveRef = async () => {
    if (!newRef.cantidad || !newRef.color) { setAddRefError("Completa cantidad y color."); return; }
    const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const currentUser = ProductionAPI.getCurrentUser();
    const newDetail = { refCorte: `${production.referencia}_${Date.now().toString().slice(-4)}`, ref: production.referencia, status: production.status, statusDate: today, quantity: Number(newRef.cantidad), color: newRef.color };
    const newDetails = [...(production.details || []), newDetail];
    const saved = await ProductionAPI.update(production.id, {
      ...production, quantity: newDetails.reduce((s, d) => s + d.quantity, 0), details: newDetails,
      techSpecification: recalcCosts(newDetails, production.techSpecification),
      history: [...(production.history || []), { status: "Artículo agregado", date: today, user: currentUser, motivo: `Ref: ${production.referencia} | Color: ${newRef.color} | Cantidad: ${newRef.cantidad} uds` }]
    });
    setProduction(saved);
    setAddRefOpen(false);
    setNewRef({ cantidad: "", color: "" });
    setAddRefError("");
  };

  const anuladaEntry = (production.history || []).findLast?.(h => h.status === "Anulada") || [...(production.history || [])].reverse().find(h => h.status === "Anulada");

  const handleAnularDetail = (d) => {
    openProductionAlert({
      type: "confirm",
      customTitle: "Anular artículo",
      customMessage: `¿Deseas anular el artículo ${d.ref} (${d.color}, ${d.quantity} uds)? Se eliminará de la tabla y quedará registrado en el historial.`,
      onConfirmOverride: async (_motivo) => {
        const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
        const currentUser = ProductionAPI.getCurrentUser();
        const newDetails = (production.details || []).filter(x => x !== d);
        const saved = await ProductionAPI.update(production.id, {
          ...production, quantity: newDetails.reduce((s, x) => s + x.quantity, 0), details: newDetails,
          techSpecification: recalcCosts(newDetails, production.techSpecification),
          history: [...(production.history || []), { status: "Artículo anulado", date: today, user: currentUser, motivo: `Ref: ${d.ref} | Color: ${d.color} | Cantidad: ${d.quantity} uds | Ref_corte: ${d.refCorte}` }]
        });
        setProduction(saved);
        setGlobalAlert({ open: true, type: "success", title: "Artículo eliminado", message: `El artículo ${d.ref} (${d.color}) fue eliminado correctamente y quedó registrado en el historial.` });
      }
    });
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh", fontFamily: "'DM Sans', 'Nunito', sans-serif", padding: "24px 28px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .pd-card { background:#fff; border-radius:14px; box-shadow:0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); }
        .pd-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#E91E8C; margin-bottom:3px; }
        .pd-value { font-size:13px; font-weight:600; color:#1a1a2e; }
        .pd-step-done { background:#E91E8C; border-color:#E91E8C; color:#fff; }
        .pd-step-active { background:#fff; border-color:#E91E8C; color:#E91E8C; box-shadow:0 0 0 3px rgba(233,30,140,0.12); }
        .pd-step-idle { background:#fff; border-color:#e5e7eb; color:#d1d5db; }
        .pd-btn-nav { border:1.5px solid #e5e7eb; background:#fff; color:#374151; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; transition:all 0.15s; }
        .pd-btn-nav:hover { border-color:#E91E8C; color:#E91E8C; }
        .pd-btn-primary { background:#E91E8C; color:#fff; border:none; border-radius:9px; padding:7px 16px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:5px; box-shadow:0 4px 12px rgba(233,30,140,0.25); transition:all 0.15s; }
        .pd-btn-primary:hover { background:#c91578; transform:translateY(-1px); }
        .pd-btn-danger { border:1.5px solid #fca5a5; background:#fff5f5; color:#ef4444; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .pd-btn-danger:hover { background:#fee2e2; }
        .pd-table th { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#9ca3af; padding-bottom:8px; }
        .pd-table td { padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:12.5px; }
        .pd-table tr:last-child td { border-bottom:none; }
        .pd-badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:10.5px; font-weight:700; letter-spacing:0.03em; }
        .pd-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
        .pd-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; }
        .pd-action-btn { width:26px; height:26px; border-radius:7px; border:1.5px solid #e5e7eb; background:#fafafa; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; color:#9ca3af; }
        .pd-action-btn:hover.edit { border-color:#3b82f6; color:#3b82f6; background:#eff6ff; }
        .pd-action-btn:hover.del { border-color:#ef4444; color:#ef4444; background:#fff5f5; }
        .pd-input { width:100%; border:1.5px solid #e5e7eb; border-radius:9px; padding:8px 12px; font-size:13px; color:#374151; outline:none; transition:border 0.15s; box-sizing:border-box; }
        .pd-input:focus { border-color:#E91E8C; box-shadow:0 0 0 3px rgba(233,30,140,0.08); }
        .pd-stat-card { border-radius:11px; padding:13px 15px; }
      `}</style>

      {/* ── Modals (logic unchanged) ── */}
      <ProductionAlerts
        isOpen={productionAlert.isOpen}
        type={productionAlert.type}
        targetStep={productionAlert.targetStep}
        tercero={productionAlert.tercero}
        sede={productionAlert.sede}
        onChangeTercero={(v) => setProductionAlert((p) => ({ ...p, tercero: v }))}
        onChangeSede={(v) => setProductionAlert((p) => ({ ...p, sede: v }))}
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
      <Alert
        isOpen={globalAlert.open}
        type={globalAlert.type}
        title={globalAlert.title}
        message={globalAlert.message}
        onConfirm={() => setGlobalAlert(prev => ({ ...prev, open: false }))}
        onCancel={() => setGlobalAlert(prev => ({ ...prev, open: false }))}
      />

      {/* ── Add Article Modal ── */}
      {addRefOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="pd-card" style={{ padding: 24, width: 320, animation: "fadeIn 0.2s ease" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Agregar talla / artículo</h2>
            <div style={{ marginBottom: 14 }}>
              <div className="pd-label">Cantidad</div>
              <input type="number" min="1" value={newRef.cantidad} onChange={(e) => setNewRef({ ...newRef, cantidad: e.target.value })}
                placeholder="Ej: 45" className="pd-input" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div className="pd-label">Color</div>
              <select value={newRef.color} onChange={(e) => setNewRef({ ...newRef, color: e.target.value })} className="pd-input">
                <option value="">Seleccionar color...</option>
                <option>Rojo</option><option>Negro</option><option>Azul</option>
                <option>Blanco</option><option>Verde</option><option>Lavender Silk</option>
              </select>
            </div>
            {addRefError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{addRefError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAddRefOpen(false); setNewRef({ cantidad: "", color: "" }); setAddRefError(""); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, color: "#6b7280", cursor: "pointer", fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={handleSaveRef} className="pd-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "9px 0" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tech Sheet Modal (Read) ── */}
      {showTechSheet && production.techSpecification && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setShowTechSheet(false)}>
          <div className="pd-card" style={{ width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>📋 Ficha Técnica — Orden #{production.orderNumber}</h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Solo lectura · La ficha no puede modificarse una vez creada</p>
              </div>
              <button onClick={() => setShowTechSheet(false)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <TechnicalSheet sheet={production.techSpecification} isEditing={false} />
            </div>
          </div>
        </div>
      )}

      {/* ── Tech Sheet Modal (Create) ── */}
      {showTechSheetForm && !production.techSpecification && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}>
          <div className="pd-card" style={{ width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "3px solid #E91E8C", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>✏️ Crear ficha técnica</h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Completa los datos y guarda para desbloquear el avance al siguiente paso</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 12 }}>Cancelar</button>
                <button className="pd-btn-primary"
                  onClick={async () => {
                    if (!techSheetDraft) { setGlobalAlert({ open: true, type: "warning", title: "Ficha vacía", message: "Completa al menos los datos básicos de la ficha antes de guardar." }); return; }
                    try {
                      const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
                      const newSpec = { ...techSheetDraft, name: techSheetDraft.type || "Ficha técnica", version: "1", costPerUnit: 0, totalCost: 0, completed: true, createdAt: today };
                      const saved = await ProductionAPI.update(production.id, {
                        ...production, techSpecification: newSpec,
                        history: [...(production.history || []), { status: "Ficha técnica creada", date: today, user: ProductionAPI.getCurrentUser(), motivo: null }]
                      });
                      setProduction(saved); setShowTechSheetForm(false); setTechSheetDraft(null);
                      setGlobalAlert({ open: true, type: "success", title: "Ficha guardada", message: "La ficha técnica fue creada correctamente. Ahora puedes avanzar al siguiente paso." });
                    } catch (err) {
                      setGlobalAlert({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar la ficha técnica. Intenta de nuevo." });
                    }
                  }}>
                  💾 Guardar ficha
                </button>
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <TechnicalSheet sheet={null} isEditing={true} onChange={(data) => setTechSheetDraft(data)} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PAGE CONTENT ══════════════ */}

      {/* Back button */}
      <button onClick={() => navigate("/layout/produccion")}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginBottom: 18, padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        Volver a Producciones
      </button>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>
          Orden #{production.orderNumber}
        </h1>
        <span className="pd-badge" style={isAnulada ? { background: "#fee2e2", color: "#991b1b" } : { background: "#fce7f3", color: "#be185d" }}>
          {production.status}
        </span>
        {production.statusDate && (
          <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon /> Actualizado {production.statusDate}
          </span>
        )}
        {/* Anular button far right */}
        {!isAnulada && (
          <button className="pd-btn-danger" style={{ marginLeft: "auto" }}
            onClick={() => openProductionAlert({
              type: "anular", customTitle: "Anular orden",
              customMessage: "¿Deseas anular esta orden de producción? Esta acción no se puede deshacer.",
              onConfirmOverride: async (motivo) => { const saved = await ProductionAPI.cancel(production.id, motivo || "Sin motivo"); setProduction(saved); }
            })}>
            Anular orden
          </button>
        )}
      </div>

      {/* Anulada banner */}
      {isAnulada && anuladaEntry && (
        <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22 }}>🚫</span>
          <div>
            <p style={{ fontWeight: 700, color: "#b91c1c", fontSize: 13, margin: 0 }}>Orden anulada — {anuladaEntry.date}</p>
            {anuladaEntry.motivo && <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}><strong>Motivo:</strong> {anuladaEntry.motivo}</p>}
            <p style={{ color: "#f87171", fontSize: 11, margin: "3px 0 0" }}>Anulado por: {anuladaEntry.user}</p>
          </div>
        </div>
      )}

      {/* ── 1. FLUJO DE PROCESO (primero, arriba del todo) ─────── */}
      {!isAnulada && (
        <div className="pd-card" style={{ padding: "14px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Flujo de Proceso</p>
            <div style={{ display: "flex", gap: 8 }}>
              {prevStep && (
                <button className="pd-btn-nav"
                  onClick={() => openProductionAlert({ type: "advance", targetStep: prevStep, customTitle: "Retroceder estado", customMessage: `¿Deseas retroceder a "${prevStep}"?` })}>
                  ← Anterior
                </button>
              )}
              {nextStep && (
                fichaBloquea ? (
                  <button disabled style={{ padding: "7px 14px", borderRadius: 9, background: "#f3f4f6", color: "#9ca3af", border: "none", fontSize: 12, fontWeight: 700, cursor: "not-allowed", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    Siguiente
                  </button>
                ) : (
                  <button className="pd-btn-primary"
                    onClick={() => openProductionAlert({ type: getAlertType(production.status, nextStep), targetStep: nextStep, customTitle: `Avanzar a "${nextStep}"`, customMessage: `¿Confirmas el avance al estado "${nextStep}"?` })}>
                    Siguiente →
                  </button>
                )
              )}
            </div>
          </div>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", top: 13, left: "6.5%", right: "6.5%", height: 1.5, background: "#e5e7eb", zIndex: 0 }} />
            {steps.map((step, i) => {
              const done = i < safeStepIndex;
              const active = i === safeStepIndex;
              return (
                <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", border: "2px solid",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                    ...(done ? { background: "#E91E8C", borderColor: "#E91E8C", color: "#fff" }
                      : active ? { background: "#fff", borderColor: "#E91E8C", color: "#E91E8C", boxShadow: "0 0 0 4px rgba(233,30,140,0.1)" }
                      : { background: "#fff", borderColor: "#e5e7eb", color: "#d1d5db" })
                  }}>
                    {done ? <CheckIcon /> : i + 1}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, textAlign: "center", lineHeight: 1.2, color: active ? "#E91E8C" : done ? "#6b7280" : "#d1d5db" }}>
                    {step}
                    <div style={{ fontSize: 8, fontWeight: 400, color: active ? "#9ca3af" : done ? "#9ca3af" : "#e5e7eb" }}>
                      {active ? "En proceso" : done ? "Finalizado" : "Pendiente"}
                    </div>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar + % */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 99, height: 4 }}>
              <div style={{ width: `${progressPercent}%`, height: 4, background: "#E91E8C", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#E91E8C", flexShrink: 0 }}>{progressPercent}%</span>
          </div>

          {fichaBloquea && (
            <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 9, padding: "7px 12px", marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13 }}>⚠️</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Crea la ficha técnica para poder avanzar al siguiente paso</span>
            </div>
          )}
        </div>
      )}

      {/* ── 2. GRID: Product card (left, con tabla) + Side panels (right) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>

        {/* LEFT: Product card + Detalle Referencia integrado */}
        <div className="pd-card" style={{ padding: 0, overflow: "hidden" }}>

          {/* Product top section */}
          <div style={{ padding: "18px 20px", display: "flex", gap: 18, alignItems: "flex-start" }}>
            {/* Image */}
            <div style={{
              width: 96, height: 120, borderRadius: 10, flexShrink: 0, overflow: "hidden",
              background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(233,30,140,0.12)"
            }}>
              {production.imageUrl
                ? <img src={production.imageUrl} alt={production.producto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E91E8C" strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
                    <circle cx="12" cy="7" r="3" /><path d="M8 21v-2a4 4 0 018 0v2" /><path d="M5 21h14" />
                  </svg>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {production.producto || "—"}
              </h2>
              <p style={{ fontSize: 11.5, color: "#9ca3af", margin: "0 0 14px", fontWeight: 500 }}>
                {production.client}{production.coleccion ? ` · ${production.coleccion}` : ""}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                <div>
                  <div className="pd-label">Referencia</div>
                  <div className="pd-value">Ref. {production.referencia}</div>
                </div>
                <div>
                  <div className="pd-label">Unidad de Producción</div>
                  <div className="pd-value">{production.unidadProduccion || "Unit 01"}</div>
                </div>
                <div>
                  <div className="pd-label">Prioridad</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: (production.prioridad || production.priority) === "Alta" ? "#ef4444" : (production.prioridad || production.priority) === "Media" ? "#f59e0b" : "#10b981" }} />
                    <span className="pd-value">{production.prioridad || production.priority || "Alta"}</span>
                  </div>
                </div>
                <div>
                  <div className="pd-label">Fecha Límite</div>
                  <div className="pd-value">{production.deliveryDate || "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider + Detalle Referencia */}
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 20px 16px" }}>
            {/* Sub-header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                Detalle Referencia {production.referencia}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {!isAnulada && isLocked && (
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: "#d97706", background: "#fffbeb", border: "1px solid #fbbf24", padding: "2px 7px", borderRadius: 5 }}>
                    🔒 Bloqueado
                  </span>
                )}
                {!isAnulada && !isLocked && (
                  <button className="pd-btn-primary" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 7 }}
                    onClick={() => setAddRefOpen(true)}>
                    + Añadir Talla
                  </button>
                )}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {["Código", "Cantidad", "Color", "Estado", ...((!isAnulada && !isLocked) ? [""] : [])].map((h, idx) => (
                    <th key={idx} style={{ textAlign: "left", padding: "0 0 6px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#c4c9d4" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortBySize(production.details).map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "7px 0" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827" }}>{d.refCorte}</span>
                    </td>
                    <td style={{ padding: "7px 0" }}>
                      <span style={{ fontSize: 11.5, color: "#374151" }}>{d.quantity} <span style={{ color: "#9ca3af", fontSize: 10 }}>uds</span></span>
                    </td>
                    <td style={{ padding: "7px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c4b5d4", flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: "#374151" }}>{d.color}</span>
                      </div>
                    </td>
                    <td style={{ padding: "7px 0" }}>
                      <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 20, fontSize: 9.5, fontWeight: 700, ...statusStyle(d.status) }}>
                        {d.status}
                      </span>
                    </td>
                    {!isAnulada && !isLocked && (
                      <td style={{ padding: "7px 0" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="pd-action-btn edit" style={{ width: 22, height: 22, borderRadius: 6 }}
                            onClick={() => setEditAlert({ isOpen: true, detail: d })}><EditIcon /></button>
                          <button className="pd-action-btn del" style={{ width: 22, height: 22, borderRadius: 6 }}
                            onClick={() => handleAnularDetail(d)}><TrashIcon /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {(production.details || []).length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", fontSize: 11, padding: "18px 0" }}>
                      No hay artículos en esta orden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {(production.details || []).length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 14 }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  <strong style={{ color: "#6b7280" }}>{(production.details || []).length}</strong> refs
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Total: <strong style={{ color: "#E91E8C" }}>{totalUnidades.toLocaleString("es-CO")} uds</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Stacked side cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Ficha Técnica y Costos */}
          <div className="pd-card" style={{ padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
              Ficha Técnica y Costos
            </p>
            {production.techSpecification ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f9fafb", borderRadius: 9, border: "1px solid #e5e7eb", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: "#fee2e2", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileIcon />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", margin: 0 }}>FT_{production.referencia || production.orderNumber}.pdf</p>
                      <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>Versión {production.techSpecification.version || 1}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, background: "#d1fae5", color: "#065f46", padding: "2px 7px", borderRadius: 20 }}>COMPUTADO</span>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#65a30d", background: "#f7fee7", border: "1px solid #bef264", padding: "2px 8px", borderRadius: 20 }}>Aprobada</span>
                </div>
                <div style={{ background: "#fce7f3", borderRadius: 9, padding: "10px 13px" }}>
                  <p style={{ fontSize: 10, color: "#9d174d", fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase" }}>COSTO UNIDAD: <strong>${(production.techSpecification.costPerUnit || 0).toLocaleString("es-CO")}</strong></p>
                  <p style={{ fontSize: 10, color: "#9d174d", fontWeight: 600, margin: 0, textTransform: "uppercase" }}>TOTAL: <strong>${(production.techSpecification.totalCost || 0).toLocaleString("es-CO")}</strong></p>
                </div>
                <button className="pd-btn-nav" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setShowTechSheet(true)}>
                  <EyeIcon /> Ver ficha técnica
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                <p style={{ fontSize: 12, color: "#374151", fontWeight: 600, margin: "0 0 4px" }}>Sin ficha técnica</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 12px" }}>
                  {isOnFichaStep ? "Requerida para continuar." : "Disponible en el paso correspondiente."}
                </p>
                {!isAnulada && (
                  <button className="pd-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowTechSheetForm(true)}>
                    + Crear ficha técnica
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Historial Operativo */}
          <div className="pd-card" style={{ padding: 16, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Historial Operativo</p>
              <ClockIcon />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {(production.history || []).slice(-4).reverse().map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 12, position: "relative" }}>
                  {i < Math.min((production.history || []).length, 4) - 1 && (
                    <div style={{ position: "absolute", left: 3.5, top: 16, bottom: 0, width: 1, background: "#f3f4f6" }} />
                  )}
                  <div className="pd-dot" style={{ background: dotColor(h.status), marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", margin: "0 0 1px" }}>{h.status}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>{h.date}{h.user ? ` · ${h.user}` : ""}</p>
                    {h.motivo && <p style={{ fontSize: 10, color: "#f59e0b", margin: "2px 0 0", fontStyle: "italic" }}>{h.motivo}</p>}
                  </div>
                </div>
              ))}
              {(production.history || []).length === 0 && (
                <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "10px 0" }}>Sin historial</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Full History Table (collapsed in a separate card) ── */}
      {(production.history || []).length > 4 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#6b7280", padding: "10px 0" }}>
            <ClockIcon />
            Ver historial completo ({(production.history || []).length} entradas)
          </summary>
          <div className="pd-card" style={{ padding: "16px 20px", marginTop: 8 }}>
            <table className="pd-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Estado</th>
                  <th style={{ textAlign: "left" }}>Fecha</th>
                  <th style={{ textAlign: "left" }}>Responsable</th>
                  <th style={{ textAlign: "left" }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {(production.history || []).map((h, i) => (
                  <tr key={i}>
                    <td>
                      <span className="pd-badge" style={statusStyle(h.status)}>{h.status}</span>
                    </td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{h.date}</td>
                    <td style={{ color: "#374151", fontSize: 12, fontWeight: 500 }}>{h.user || "—"}</td>
                    <td style={{ fontSize: 12 }}>
                      {h.motivo ? <span style={{ color: "#f59e0b", fontStyle: "italic" }}>{h.motivo}</span> : <span style={{ color: "#d1d5db" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
};

export default ProductionDetailsPage;