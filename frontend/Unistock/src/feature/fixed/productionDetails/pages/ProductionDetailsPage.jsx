/**
 * @file ProductionDetailsPage.jsx
 * @description Página de detalle de una orden de producción.
 *
 * Responsabilidades:
 *   - Cargar y mostrar los datos de una orden por ID (URL param)
 *   - Avanzar / retroceder el estado de la orden (stepper)
 *   - Gestionar artículos: agregar, editar, eliminar con confirmación y alerta de éxito
 *   - Gestionar la ficha técnica: crear inline si no existe, ver expandida si existe
 *   - Bloquear el avance al siguiente paso si el paso actual es "Ficha Técnica"
 *     y aún no se ha creado la ficha
 *
 * Correcciones aplicadas:
 *   - El tipo "confirm" estaba excluido de canConfirm en ProductionAlerts →
 *     el botón de confirmar permanecía deshabilitado al intentar eliminar
 *   - Se agregan alertas de éxito tras editar y tras eliminar un artículo
 *   - Se elimina el botón "Guardar cambios" — los cambios se guardan en cada acción
 *   - Se quita "Color" del bloque de Información general resumida
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ProductionAPI } from "../../services/ProductionAPI";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import TechnicalSheet from "../../components/TechnicalSheet";
import AlertEditProduction from "../pages/AlertEditProduction";
import ProductionAlerts from "../pages/ProductionAlerts";

/**
 * Pasos del proceso de producción en orden.
 * Se usan para el stepper visual y para derivar nextStep / prevStep.
 */
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
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Estado de navegación inyectado desde ProductionPage cuando se llega
   * desde el flujo de productos dañados:
   *   openTechSheet       {boolean} — abrir automáticamente el form de ficha
   *   fromDamaged         {boolean} — mostrar banner de origen por daño
   *   originalOrderNumber {number}  — # de la orden original anulada
   *   originalOrderStatus {string}  — paso en que estaba la orden anulada
   */
  const navState = location.state || {};

  // ── Estado de la orden ──────────────────────────────────────────────────────
  const [production,      setProduction]      = useState(null);   // datos de la orden desde la API
  const [loading,         setLoading]         = useState(true);   // indicador de carga inicial

  // ── Estado del formulario de nuevo artículo ──────────────────────────────
  const [addRefOpen,  setAddRefOpen]  = useState(false);               // controla visibilidad del modal
  const [newRef,      setNewRef]      = useState({ cantidad: "", color: "" }); // datos del nuevo artículo
  const [addRefError, setAddRefError] = useState("");                   // mensaje de error de validación

  // ── Estado de alertas/modales de acción ──────────────────────────────────
  const [editAlert,       setEditAlert]       = useState({ isOpen: false, detail: null }); // modal de editar artículo
  const [productionAlert, setProductionAlert] = useState({
    isOpen: false, type: "advance", targetStep: null,
    tercero: "", sede: "",
    customTitle: undefined, customMessage: undefined, onConfirmOverride: null,
  }); // alerta multipropósito: avanzar paso, anular, confirmar eliminación

  // ── Estado de la ficha técnica ────────────────────────────────────────────
  const [showTechSheet,     setShowTechSheet]     = useState(false); // expande/colapsa la ficha en lectura
  const [showTechSheetForm, setShowTechSheetForm] = useState(false); // muestra formulario de creación inline
  const [techSheetDraft,    setTechSheetDraft]    = useState(null);  // borrador mientras se llena el formulario

  // ── Alerta global de feedback (éxito / error / advertencia) ──────────────
  const [globalAlert, setGlobalAlert] = useState({ open: false, type: "success", title: "", message: "" });

  /**
   * Carga la orden de producción al montar el componente o cuando cambia el ID.
   * Usa ProductionAPI.getById con el ID del parámetro de URL.
   */
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

  /**
   * Auto-abrir formulario de ficha técnica cuando se navega desde el flujo
   * de productos dañados con state: { openTechSheet: true }.
   * Solo se dispara cuando la orden ya cargó y no tiene ficha.
   */
  useEffect(() => {
    if (!production || production.techSpecification) return;
    if (navState.openTechSheet) {
      setShowTechSheetForm(true);
    }
  }, [production]);

  if (loading)     return <p className="p-6">Cargando...</p>;
  if (!production) return <p className="p-6">No se encontró la orden</p>;

  // ── Variables derivadas del estado de la orden ───────────────────────────
  const currentStepIndex = production.status === 'Anulada' ? -1 : steps.indexOf(production.status);
  const safeStepIndex    = Math.max(currentStepIndex, 0);           // índice seguro (nunca negativo)
  const progressPercent  = production.status === 'Anulada'
    ? 0 : Math.round(((safeStepIndex + 1) / steps.length) * 100);  // porcentaje para la barra de progreso
  const nextStep = steps[safeStepIndex + 1]; // paso al que se puede avanzar (undefined si es el último)
  const prevStep = steps[safeStepIndex - 1]; // paso al que se puede retroceder (undefined si es el primero)
  const isAnulada = production.status === 'Anulada'; // orden cancelada, no permite edición

  // Los artículos se bloquean para edición una vez superado el paso de Corte (índice 2)
  const isLocked = safeStepIndex > steps.indexOf("Corte");

  // Bloqueo de avance en el paso "Ficha Técnica": si no existe ficha, no se puede avanzar
  const isOnFichaStep = production.status === "Ficha Técnica"; // ¿está actualmente en este paso?
  const hasTechSheet  = !!production.techSpecification;         // ¿ya existe ficha técnica?
  const fichaBloquea  = isOnFichaStep && !hasTechSheet;         // bloqueo activo si ambas condiciones

  /**
   * Determina el tipo de alerta de transición de estado.
   * - "third":      requiere seleccionar un tercero (Compras → Producción)
   * - "assignSede": requiere seleccionar una sede (Producción → Recepción)
   * - "advance":    confirmación simple para cualquier otro paso
   */
  const getAlertType = (from, to) => {
    if (from === "Compras"    && to === "Producción") return "third";
    if (from === "Producción" && to === "Recepción")  return "assignSede";
    return "advance";
  };

  /**
   * Abre la alerta de producción con los datos indicados en overrides.
   * Siempre parte de valores por defecto y los sobreescribe con lo que se pase.
   */
  const openProductionAlert = (overrides) =>
    setProductionAlert({
      isOpen: true, type: "advance", targetStep: null,
      tercero: "", sede: "",
      customTitle: undefined, customMessage: undefined, onConfirmOverride: null,
      ...overrides,
    });

  /** Cierra la alerta de producción sin ejecutar ninguna acción */
  const closeProductionAlert = () =>
    setProductionAlert((p) => ({ ...p, isOpen: false }));

  /**
   * Cambia el estado de la orden al valor indicado.
   * Actualiza también todos los artículos al nuevo estado
   * y agrega una entrada en el historial.
   */
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

  /**
   * handleProductionAlertConfirm — callback al confirmar en ProductionAlerts.
   * Recibe `motivo` (string) desde el modal cuando type === "anular".
   * Para los demás tipos ejecuta la acción correspondiente sin motivo.
   */
  const handleProductionAlertConfirm = async (motivo = "") => {
    const { targetStep, type, onConfirmOverride } = productionAlert;
    closeProductionAlert();
    if (onConfirmOverride) { onConfirmOverride(motivo); return; }
    if (targetStep) await applyStepChange(targetStep);
  };

  /**
   * handleSaveChanges — guardado manual de la orden completa.
   * Conservado por compatibilidad pero ya no se expone en la UI
   * (los cambios se guardan automáticamente en cada acción individual).
   */
  const handleSaveChanges = async () => {
    const saved = await ProductionAPI.update(production.id, production);
    setProduction(saved);
  };

  /**
   * handleEditConfirm
   * Recibe el artículo editado desde AlertEditProduction,
   * actualiza la orden en la API y muestra alerta de éxito.
   */
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
    // Alerta de éxito tras editar el artículo
    setGlobalAlert({
      open: true,
      type: "success",
      title: "Artículo actualizado",
      message: `El artículo ${updatedDetail.ref} fue actualizado correctamente.`,
    });
  };

  /**
   * Recalcula el costo total de la ficha técnica en función
   * de la cantidad total de artículos actuales.
   */
  const recalcCosts = (details, techSpec) => {
    if (!techSpec) return techSpec;
    const totalQty = (details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);
    return { ...techSpec, totalCost: techSpec.costPerUnit * totalQty };
  };

  /**
   * Agrega un nuevo artículo a la orden.
   * Valida que cantidad y color estén completos antes de guardar.
   */
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

  /**
   * handleAnularDetail
   * Abre alerta de confirmación para eliminar un artículo de la orden.
   * Al confirmar: elimina el detalle, recalcula costos, registra en historial
   * y muestra alerta de éxito.
   */
  const handleAnularDetail = (d) => {
    openProductionAlert({
      type: "confirm",
      customTitle: "Anular artículo",
      customMessage: `¿Deseas anular el artículo ${d.ref} (${d.color}, ${d.quantity} uds)? Se eliminará de la tabla y quedará registrado en el historial.`,
      onConfirmOverride: async (_motivo) => {
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
        // Alerta de éxito tras eliminar el artículo
        setGlobalAlert({
          open: true,
          type: "success",
          title: "Artículo eliminado",
          message: `El artículo ${d.ref} (${d.color}) fue eliminado correctamente y quedó registrado en el historial.`,
        });
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
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
            {addRefError && <p className="text-xs font-bold mb-3" style={{ color: "#ff4fd6" }}>{addRefError}</p>}
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

      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          {/* Título estandarizado: text-2xl + font-bold para todas las páginas principales */}
          <h2 className="text-2xl font-bold text-gray-800">Orden #{production.orderNumber}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${isAnulada ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-700'}`}>
            {production.status}
          </span>
        </div>
        {/* Botón "Guardar cambios" eliminado — los cambios se guardan automáticamente en cada acción */}
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

      {/* ── BANNER: ORDEN DE REPOSICIÓN POR DAÑO ── */}
      {/* Se muestra cuando se navega desde el flujo de productos dañados */}
      {navState.fromDamaged && (
        <div style={{
          background: "linear-gradient(135deg, #fef3c7, #fffbeb)",
          border: "1.5px solid #f59e0b",
          borderRadius: 12, padding: "14px 18px",
          marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "#fde68a",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 18,
          }}>
            ⚠️
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#92400e" }}>
              Orden de reposición por productos dañados
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#b45309", lineHeight: 1.6 }}>
              Esta orden fue creada a partir de artículos dañados durante el paso{" "}
              <strong>{navState.originalOrderStatus}</strong> de la orden{" "}
              <strong>#{navState.originalOrderNumber}</strong>.
              {!production?.techSpecification && (
                <span style={{ display: "block", marginTop: 6, padding: "6px 10px", background: "#fef9c3", borderRadius: 8, color: "#92400e", fontWeight: 700 }}>
                  📋 Crea la ficha técnica de los artículos dañados para continuar el proceso de reposición.
                </span>
              )}
            </p>
          </div>
          {!production?.techSpecification && !isAnulada && (
            <button
              onClick={() => setShowTechSheetForm(true)}
              style={{
                flexShrink: 0,
                padding: "8px 18px", borderRadius: 10, border: "none",
                background: "#E91E8C", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(233,30,140,0.3)",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Crear ficha técnica
            </button>
          )}
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
            <div className="bg-[#E91E8C] h-1.5 rounded-full transition-all duration-500"
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
            fichaBloquea ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  disabled
                  style={{
                    padding: "8px 20px", borderRadius: 12,
                    background: "#f3f4f6", color: "#9ca3af",
                    border: "none", fontSize: 14, fontWeight: 700,
                    cursor: "not-allowed", display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  {nextStep} →
                </button>
                <span style={{
                  fontSize: 11, color: "#f59e0b", fontWeight: 600,
                  background: "#fffbeb", border: "1px solid #fbbf24",
                  borderRadius: 8, padding: "4px 10px",
                }}>
                  ⚠️ Crea la ficha técnica para continuar
                </span>
              </div>
            ) : (
              <button onClick={() => openProductionAlert({
                type: getAlertType(production.status, nextStep),
                targetStep: nextStep,
                customTitle: `Avanzar a "${nextStep}"`,
                customMessage: `¿Confirmas el avance al estado "${nextStep}"?`,
              })}
                className="px-5 py-2 rounded-xl bg-[#E91E8C] text-white text-sm font-bold shadow-md shadow-pink-100 transition">
                {nextStep} →
              </button>
            )
          )}
          <button onClick={() => openProductionAlert({
            type: "anular",
            customTitle: "Anular orden",
            customMessage: "¿Deseas anular esta orden de producción? Esta acción no se puede deshacer.",
            // onConfirmOverride recibe el motivo ingresado en el modal (sin prompt nativo)
            onConfirmOverride: async (motivo) => {
              const saved = await ProductionAPI.cancel(production.id, motivo || "Sin motivo");
              setProduction(saved);
            },
          })}
            className="ml-auto px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-sm text-red-500 hover:bg-red-100 font-medium transition">
            Anular orden
          </button>
        </div>
      )}

      {/* Info general — padding y título estandarizados */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        {/* Subtítulo de sección: text-sm + font-700 + uppercase + tracking — igual en todas las cards */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Información general</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            // Se omite "Color" de la vista general resumida (visible en la tabla de artículos)
            ["Cliente",       production.client],
            ["Producto",      production.producto],
            ["Referencia",    production.referencia],
            ["Fecha entrega", production.deliveryDate],
            ["Tipo",          production.tipo === 'diseno' ? 'Diseño' : 'Producción'],
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
        <div className="bg-white p-5 rounded-2xl shadow-sm overflow-auto">
          <div className="flex justify-between items-center mb-3">
            {/* Subtítulo estandarizado igual a "Información general" */}
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Artículos de la orden</h3>
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

        {/* Historial — mismos estilos de card y subtítulo */}
        <div className="bg-white p-5 rounded-2xl shadow-sm overflow-auto">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Historial de la orden</h3>
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

      {/* ── SECCIÓN FICHA TÉCNICA — tarjeta resumen + modal para ver/crear ── */}
      {/*
        CORRECCIÓN: La ficha técnica ahora se abre en un modal flotante (overlay)
        en lugar de expandirse inline. El botón "Ver ficha técnica" abre un modal
        con scroll propio, y el formulario de creación también usa un modal.
        Esto evita que la ficha ocupe espacio en la página y facilita la lectura.
      */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 20 }}>

        {/* Cabecera de la tarjeta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#E91E8C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Ficha técnica</h3>
              {production.techSpecification
                ? <span style={{ fontSize: 11, color: "#9ca3af" }}>{production.techSpecification.name} · Versión {production.techSpecification.version || 1}</span>
                : isOnFichaStep
                  ? <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>⚠️ Requerida para continuar al siguiente paso</span>
                  : <span style={{ fontSize: 11, color: "#9ca3af" }}>Sin ficha técnica</span>
              }
            </div>
          </div>

          {/* Botones: abren modal, ya NO expanden inline */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {production.techSpecification ? (
              <button
                onClick={() => setShowTechSheet(true)}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  border: "1.5px solid #e5e7eb", background: "#f9fafb",
                  color: "#374151", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Ver ficha técnica
              </button>
            ) : (
              !isAnulada && (
                <button
                  onClick={() => setShowTechSheetForm(true)}
                  style={{
                    padding: "7px 16px", borderRadius: 8, border: "none",
                    background: "#E91E8C",
                    color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 12px rgba(255,79,214,0.3)",
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  + Crear ficha técnica
                </button>
              )
            )}
          </div>
        </div>

        {/* Resumen de stats cuando ya existe la ficha */}
        {production.techSpecification && (
          <div style={{ padding: "16px 20px" }}>
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
          </div>
        )}

        {/* Estado vacío — sin ficha y sin botón de crear abierto */}
        {!production.techSpecification && (
          <div style={{ padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#374151" }}>Sin ficha técnica</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#9ca3af" }}>
              {isOnFichaStep
                ? "Este paso requiere una ficha técnica para poder avanzar."
                : "Podrás crear la ficha técnica cuando la orden llegue al paso correspondiente."}
            </p>
            {isOnFichaStep && !isAnulada && (
              <button
                onClick={() => setShowTechSheetForm(true)}
                style={{
                  padding: "9px 22px", borderRadius: 10, border: "none",
                  background: "#E91E8C",
                  color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(255,79,214,0.35)",
                }}>
                + Crear ficha técnica ahora
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: VER FICHA TÉCNICA (solo lectura) ── */}
      {showTechSheet && production.techSpecification && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setShowTechSheet(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                  📋 Ficha Técnica — Orden #{production.orderNumber}
                </h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>
                  Solo lectura · La ficha no puede modificarse una vez creada
                </p>
              </div>
              <button
                onClick={() => setShowTechSheet(false)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ×
              </button>
            </div>
            {/* Contenido con scroll */}
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <TechnicalSheet sheet={production.techSpecification} isEditing={false} />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREAR FICHA TÉCNICA ── */}
      {showTechSheetForm && !production.techSpecification && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}
        >
          <div
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal de creación */}
            <div style={{
              padding: "16px 20px",
              borderBottom: `3px solid ${navState.fromDamaged ? "#f59e0b" : "#E91E8C"}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
              background: navState.fromDamaged ? "linear-gradient(135deg, #fffbeb, #fff)" : "#fff",
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
                  {navState.fromDamaged ? "⚠️ Ficha técnica de reposición" : "✏️ Crear ficha técnica"}
                </h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: navState.fromDamaged ? "#b45309" : "#9ca3af" }}>
                  {navState.fromDamaged
                    ? `Artículos dañados de la orden #${navState.originalOrderNumber} — paso ${navState.originalOrderStatus}`
                    : "Completa los datos y guarda para desbloquear el avance al siguiente paso"
                  }
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 12 }}>
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!techSheetDraft) {
                      setGlobalAlert({ open: true, type: "warning", title: "Ficha vacía", message: "Completa al menos los datos básicos de la ficha antes de guardar." });
                      return;
                    }
                    try {
                      const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
                      const newSpec = {
                        ...techSheetDraft,
                        name: techSheetDraft.type || "Ficha técnica",
                        version: "1", costPerUnit: 0, totalCost: 0, completed: true, createdAt: today,
                      };
                      const saved = await ProductionAPI.update(production.id, {
                        ...production,
                        techSpecification: newSpec,
                        history: [
                          ...(production.history || []),
                          {
                            status: "Ficha técnica creada", date: today,
                            user: ProductionAPI.getCurrentUser(), motivo: navState.fromDamaged
                              ? `Reposición — orden #${navState.originalOrderNumber}`
                              : null,
                          },
                        ],
                      });
                      setProduction(saved);
                      setShowTechSheetForm(false);
                      setTechSheetDraft(null);
                      setGlobalAlert({
                        open: true, type: "success",
                        title: "Ficha guardada",
                        message: navState.fromDamaged
                          ? "Ficha técnica de reposición creada correctamente. Ahora puedes continuar el proceso."
                          : "La ficha técnica fue creada correctamente. Ahora puedes avanzar al siguiente paso.",
                      });
                    } catch (err) {
                      console.error(err);
                      setGlobalAlert({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar la ficha técnica. Intenta de nuevo." });
                    }
                  }}
                  style={{
                    padding: "7px 18px", borderRadius: 8, border: "none",
                    background: navState.fromDamaged ? "#f59e0b" : "#E91E8C",
                    color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700,
                    boxShadow: navState.fromDamaged
                      ? "0 4px 12px rgba(245,158,11,0.3)"
                      : "0 4px 12px rgba(255,79,214,0.3)",
                  }}>
                  💾 Guardar ficha
                </button>
              </div>
            </div>
            {/* Formulario con scroll */}
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <TechnicalSheet
                sheet={null}
                isEditing={true}
                onChange={(data) => setTechSheetDraft(data)}
              />
            </div>
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