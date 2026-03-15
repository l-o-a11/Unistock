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
import { useParams, useNavigate } from "react-router-dom";
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
  const { id } = useParams();
  const navigate = useNavigate();

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
   * Callback que se ejecuta al presionar "Confirmar" en ProductionAlerts.
   * Si el alert tiene onConfirmOverride (ej: eliminar artículo, anular orden),
   * lo ejecuta directamente. Si no, aplica el cambio de paso normal.
   */
  const handleProductionAlertConfirm = async () => {
    const { targetStep, type, tercero, sede, onConfirmOverride } = productionAlert;
    closeProductionAlert();
    if (onConfirmOverride) { onConfirmOverride(); return; }
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
            {addRefError && <p className="text-xs text-red-500 mb-3">{addRefError}</p>}
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-bold shadow-md shadow-pink-200 hover:shadow-pink-300 transition">
                {nextStep} →
              </button>
            )
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

      {/* ── SECCIÓN FICHA TÉCNICA (inline, NO modal) ── */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 20 }}>

        {/* Cabecera */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#FF4FD6,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

          {/* Botones de acción según estado */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {production.techSpecification ? (
              <>
                <button
                  onClick={() => setShowTechSheet(prev => !prev)}
                  style={{
                    padding: "7px 14px", borderRadius: 8,
                    border: showTechSheet ? "1.5px solid #FF4FD6" : "1.5px solid #e5e7eb",
                    background: showTechSheet ? "#fff0fb" : "#f9fafb",
                    color: showTechSheet ? "#FF4FD6" : "#374151",
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {showTechSheet
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                  {showTechSheet ? "Ocultar ficha" : "Ver ficha técnica"}
                </button>
              </>
            ) : (
              !isAnulada && (
                <button
                  onClick={() => setShowTechSheetForm(prev => !prev)}
                  style={{
                    padding: "7px 16px", borderRadius: 8,
                    border: "none",
                    background: showTechSheetForm
                      ? "#f3f4f6"
                      : "linear-gradient(135deg,#FF4FD6,#c026d3)",
                    color: showTechSheetForm ? "#555" : "#fff",
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 6,
                    boxShadow: showTechSheetForm ? "none" : "0 4px 12px rgba(255,79,214,0.3)",
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    {showTechSheetForm
                      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                      : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                    }
                  </svg>
                  {showTechSheetForm ? "Cancelar" : "+ Crear ficha técnica"}
                </button>
              )
            )}
          </div>
        </div>

        {/* ── Resumen de stats (si ya tiene ficha) ── */}
        {production.techSpecification && !showTechSheet && (
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

        {/* ── Ficha técnica EXPANDIDA (solo lectura, inline, NO modal) ── */}
        {production.techSpecification && showTechSheet && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #f3f4f6" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f3f4f6",
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
                  📋 Ficha Técnica — Orden #{production.orderNumber}
                </h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>
                  Solo lectura · La ficha no puede modificarse una vez creada
                </p>
              </div>
              <button
                onClick={() => setShowTechSheet(false)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 12 }}>
                Colapsar ↑
              </button>
            </div>
            <TechnicalSheet sheet={production.techSpecification} isEditing={false} />
          </div>
        )}

        {/* ── FORMULARIO DE CREACIÓN DE FICHA (inline, solo si NO existe ficha) ── */}
        {!production.techSpecification && showTechSheetForm && (
          <div style={{ padding: "20px 24px", borderTop: "3px solid #FF4FD6" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f3f4f6",
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
                  ✏️ Crear ficha técnica
                </h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>
                  Completa los datos y guarda para desbloquear el avance al siguiente paso
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
                        version: "1",
                        costPerUnit: 0,
                        totalCost: 0,
                        completed: true,
                        createdAt: today,
                      };
                      const saved = await ProductionAPI.update(production.id, {
                        ...production,
                        techSpecification: newSpec,
                        history: [
                          ...(production.history || []),
                          { status: "Ficha técnica creada", date: today, user: ProductionAPI.getCurrentUser(), motivo: null },
                        ],
                      });
                      setProduction(saved);
                      setShowTechSheetForm(false);
                      setTechSheetDraft(null);
                      setGlobalAlert({ open: true, type: "success", title: "Ficha guardada", message: "La ficha técnica fue creada correctamente. Ahora puedes avanzar al siguiente paso." });
                    } catch (err) {
                      console.error(err);
                      setGlobalAlert({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar la ficha técnica. Intenta de nuevo." });
                    }
                  }}
                  style={{
                    padding: "7px 18px", borderRadius: 8,
                    border: "none", background: "linear-gradient(135deg,#FF4FD6,#c026d3)",
                    color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(255,79,214,0.3)",
                  }}>
                  💾 Guardar ficha
                </button>
              </div>
            </div>

            <TechnicalSheet
              sheet={null}
              isEditing={true}
              onChange={(data) => setTechSheetDraft(data)}
            />
          </div>
        )}

        {/* ── Estado vacío (sin ficha y sin formulario abierto) ── */}
        {!production.techSpecification && !showTechSheetForm && (
          <div style={{ padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
              Sin ficha técnica
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#9ca3af" }}>
              {isOnFichaStep
                ? "Este paso requiere una ficha técnica para poder avanzar."
                : "Podrás crear la ficha técnica cuando la orden llegue al paso correspondiente."}
            </p>
            {isOnFichaStep && !isAnulada && (
              <button
                onClick={() => setShowTechSheetForm(true)}
                style={{
                  padding: "9px 22px", borderRadius: 10,
                  border: "none", background: "linear-gradient(135deg,#FF4FD6,#c026d3)",
                  color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(255,79,214,0.35)",
                }}>
                + Crear ficha técnica ahora
              </button>
            )}
          </div>
        )}
      </div>

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
