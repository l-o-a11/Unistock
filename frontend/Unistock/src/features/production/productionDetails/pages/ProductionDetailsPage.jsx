/**
 * @file ProductionDetailsPage.jsx
 * @description Página de detalle de una orden de producción — Diseño renovado (Orden #3005 style)
 * CAMBIOS: Fix responsive para móvil — tabla historial, stepper, sidebar, botones nav
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DamagedProductsModal from "../../components/DamagedProductsModal";
import { ProductionAPI } from "../../services/ProductionAPI";
import { ProductionAPIClient } from "../../services/ProductionAPIClient";
import Button from "../../../shared/components/Button";
import Alert from "../../../shared/components/Alert";
import TechnicalSheet from "../../components/TechnicalSheet";
import AlertEditProduction from "./AlertEditProduction";
import ProductionAlerts from "./ProductionAlerts";

const steps = ["Diseño", "Ficha", "Corte", "Compras", "Producción", "Recepción", "Entrega"];
const stepsReal = ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Entregado"];

const SIZE_ORDER = ["3XS","2XS","XS","S","M","L","XL","2XL","XXL","3XL","XXXL","4XL","5XL"];
const extractSize = (refCorte = "") => {
  const parts = refCorte.split("-");
  return parts[parts.length - 1].trim().toUpperCase();
};
const sortBySize = (details = []) =>
  [...details].sort((a, b) => {
    const sA = extractSize(a.refCorte);
    const sB = extractSize(b.refCorte);
    const iA = SIZE_ORDER.indexOf(sA);
    const iB = SIZE_ORDER.indexOf(sB);
    if (iA !== -1 && iB !== -1) return iA - iB;
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
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

const dotColor = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("finaliz") || s.includes("list") || s.includes("aprobad")) return "#10b981";
  if (s.includes("anulad")) return "#ef4444";
  return "#FF4FD6";
};

/* ══════════════════════════════════════════════════════════════ */
const ProductionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [damagedModal, setDamagedModal] = useState({ open: false, production: null });

  const [showImageModal, setShowImageModal]         = useState(false);
  const [selectedImageIdx, setSelectedImageIdx]     = useState(0);
  const [pendingFinishedImg, setPendingFinishedImg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Usar ProductionAPIClient en lugar de ProductionAPI (mock)
        const { ProductionAPIClient } = await import('../../services/ProductionAPIClient');
        const data = await ProductionAPIClient.getOrderById(id); // id es string de MongoDB, no número
        
        // Mapear respuesta del backend al formato del frontend
        const statusDate = data.updatedAt
          ? new Date(data.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : (data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

        const mappedProduction = {
          id: data._id || data.id,
          orderNumber: data.numero_orden,
          cliente: data.cliente,
          client: data.cliente,
          // Campos de producto: derivados del primer detalle o genéricos
          producto: (data.detalles && data.detalles.length > 0)
            ? (data.detalles[0].id_producto || 'Orden de producción')
            : 'Orden de producción',
          referencia: (data.detalles && data.detalles.length > 0)
            ? (data.detalles[0].id_producto || '')
            : '',
          status: data.estado,
          estado: data.estado,
          deliveryDate: data.fecha_entrega
            ? new Date(data.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '',
          statusDate,
          history: (data.historial || []).map(h => ({
            status: h.estado,
            date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
            user: h.id_usuario || 'Sistema',
            motivo: h.motivo
          })),
          // ── DETALLES: mapeados desde backend ──────────────────────────────
          details: (data.detalles || []).map((d) => ({
            id:         d.id || d._id,
            refCorte:   d.id_producto || '',   // código/referencia del producto
            ref:        d.id_producto || '',
            quantity:   d.cantidad    || 0,
            color:      d.color       || '—',
            status:     data.estado,           // hereda el estado de la orden
            statusDate,
            estado:     d.estado !== false,    // true = activo
          })),
          rawData: data,
        };
        
        setProduction(mappedProduction);
      } catch (err) {
        console.error('Error al cargar producción:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (location.state?.openTechSheet) {
      const t = setTimeout(() => setShowTechSheetForm(true), 600);
      return () => clearTimeout(t);
    }
  }, [location.state?.openTechSheet]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div style={{ width: 40, height: 40, border: "3px solid #FF4FD6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
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
    // Persistir el cambio de estado en el backend real
    await ProductionAPIClient.changeOrderStatus(production.id, newStatus);

    // Recargar datos frescos del backend (historial actualizado)
    const freshData = await ProductionAPIClient.getOrderById(production.id);
    const statusDate = freshData.updatedAt
      ? new Date(freshData.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setProduction((prev) => ({
      ...prev,
      status: freshData.estado || newStatus,
      estado: freshData.estado || newStatus,
      statusDate,
      history: (freshData.historial || []).map((h) => ({
        status: h.estado,
        date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        user: h.id_usuario || 'Sistema',
        motivo: h.motivo,
      })),
      details: (freshData.detalles || prev.details || []).map((d) => ({
        id: d.id || d._id,
        refCorte: d.id_producto || '',
        ref: d.id_producto || '',
        quantity: d.cantidad || 0,
        color: d.color || '—',
        status: freshData.estado || newStatus,
        statusDate,
        estado: d.estado !== false,
      })),
      rawData: freshData,
    }));
  };

  const ADMIN_PASSWORD = "1234";

  const handleProductionAlertConfirm = async (motivo = "") => {
    const { targetStep, type, onConfirmOverride } = productionAlert;
    closeProductionAlert();

    if (type === "password") {
      if (motivo !== ADMIN_PASSWORD) {
        setGlobalAlert({ open: true, type: "error", title: "Contraseña incorrecta", message: "La contraseña ingresada no es correcta. No se pudo retroceder el estado." });
        return;
      }
      try {
        await applyStepChange(targetStep);
        setGlobalAlert({ open: true, type: "success", title: "Estado retrocedido", message: `La orden retrocedió al estado "${targetStep}" correctamente.` });
      } catch {
        setGlobalAlert({ open: true, type: "error", title: "Error al retroceder", message: "No se pudo retroceder el estado. Intenta de nuevo." });
      }
      return;
    }

    if (onConfirmOverride && type === "anular") {
      try {
        await onConfirmOverride(motivo);
        setGlobalAlert({ open: true, type: "success", title: "Orden anulada", message: "La orden fue anulada correctamente." });
      } catch {
        setGlobalAlert({ open: true, type: "error", title: "Error al anular", message: "No se pudo anular la orden. Intenta de nuevo." });
      }
      return;
    }

    if (onConfirmOverride) { onConfirmOverride(motivo); return; }

    if (type === "third") {
      try {
        const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
        const assignmentsList = Array.isArray(motivo) ? motivo : [];
        try {
          const terceroRaw = localStorage.getItem('app_third_parties');
          const tercerosList = terceroRaw ? JSON.parse(terceroRaw) : [];
          let updated = false;
          assignmentsList.forEach(a => {
            const idx = tercerosList.findIndex(t => t.nombreEmpresa === a.option || t.nombre === a.option);
            if (idx > -1) {
              const alreadyLinked = (tercerosList[idx].producciones || []).some(p => p.produccionId === production.id);
              if (!alreadyLinked) {
                tercerosList[idx] = {
                  ...tercerosList[idx],
                  producciones: [...(tercerosList[idx].producciones || []), {
                    orden: production.orderNumber, fecha: today,
                    produccionId: production.id, cantidad: Number(a.cantidad) || 0,
                  }]
                };
                updated = true;
              }
            }
          });
          if (updated) localStorage.setItem('app_third_parties', JSON.stringify(tercerosList));
        } catch(e) { console.warn('Error linking tercero:', e); }
        const savedProd = await ProductionAPI.update(production.id, {
          ...production, terceroAsignaciones: assignmentsList,
          history: [...(production.history || []), {
            status: "Tercero asignado", date: today, user: ProductionAPI.getCurrentUser(),
            motivo: assignmentsList.map(a => `${a.option}: ${a.cantidad} uds`).join(" | "),
            distribución: assignmentsList,
          }]
        });
        setProduction(savedProd);
        await applyStepChange(targetStep);
        setGlobalAlert({ open: true, type: "success", title: "Tercero asignado", message: `El tercero fue asignado y la orden avanzó a "${targetStep}".` });
      } catch {
        setGlobalAlert({ open: true, type: "error", title: "Error al asignar tercero", message: "No se pudo asignar el tercero. Intenta de nuevo." });
      }
      return;
    }

    if (type === "assignSede") {
      try {
        const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
        const assignmentsList = Array.isArray(motivo) ? motivo : [];
        try {
          const terceroRaw = localStorage.getItem('app_third_parties');
          const tercerosList = terceroRaw ? JSON.parse(terceroRaw) : [];
          const updatedTerceros = tercerosList.map(t => ({
            ...t, producciones: (t.producciones || []).filter(p => p.produccionId !== production.id),
          }));
          localStorage.setItem('app_third_parties', JSON.stringify(updatedTerceros));
        } catch(e) { console.warn('Error unlinking tercero:', e); }
        const savedProd = await ProductionAPI.update(production.id, {
          ...production, sedeAsignaciones: assignmentsList,
          history: [...(production.history || []), {
            status: "Sede asignada", date: today, user: ProductionAPI.getCurrentUser(),
            motivo: assignmentsList.map(a => `${a.option}: ${a.cantidad} uds`).join(" | "),
            distribución: assignmentsList,
          }]
        });
        setProduction(savedProd);
        await applyStepChange(targetStep);
        setGlobalAlert({ open: true, type: "success", title: "Sede asignada", message: `La sede fue asignada y la orden avanzó a "${targetStep}".` });
        setTimeout(() => setPendingFinishedImg("request"), 800);
      } catch {
        setGlobalAlert({ open: true, type: "error", title: "Error al asignar sede", message: "No se pudo asignar la sede. Intenta de nuevo." });
      }
      return;
    }

    if (targetStep) {
      try {
        await applyStepChange(targetStep);
        setGlobalAlert({ open: true, type: "success", title: "Estado actualizado", message: `La orden avanzó al estado "${targetStep}" correctamente.` });
      } catch {
        setGlobalAlert({ open: true, type: "error", title: "Error al cambiar estado", message: "No se pudo actualizar el estado. Intenta de nuevo." });
      }
    }
  };

  const handleEditConfirm = async (updatedDetail) => {
    const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const currentUser = ProductionAPI.getCurrentUser();
    const newDetails = (production.details || []).map(d => d.refCorte === updatedDetail.refCorte ? { ...d, ...updatedDetail } : d);
    const saved = await ProductionAPI.update(production.id, {
      ...production, details: newDetails,
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
    try {
      // Crear detalle en el backend real
      await ProductionAPIClient.createOrderDetail({
        id_orden: production.id,
        id_producto: production.referencia,
        cantidad: Number(newRef.cantidad),
        color: newRef.color,
      });
      // Recargar la orden completa para reflejar el nuevo detalle e historial
      const freshData = await ProductionAPIClient.getOrderById(production.id);
      const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setProduction((prev) => ({
        ...prev,
        details: (freshData.detalles || []).map((d) => ({
          id: d.id || d._id,
          refCorte: d.id_producto || '',
          ref: d.id_producto || '',
          quantity: d.cantidad || 0,
          color: d.color || '—',
          status: freshData.estado || prev.status,
          statusDate: today,
          estado: d.estado !== false,
        })),
        history: (freshData.historial || []).map((h) => ({
          status: h.estado,
          date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
          user: h.id_usuario || 'Sistema',
          motivo: h.motivo,
        })),
        rawData: freshData,
      }));
      setAddRefOpen(false);
      setNewRef({ cantidad: "", color: "" });
      setAddRefError("");
    } catch (err) {
      console.error("Error al agregar referencia:", err);
      setAddRefError("No se pudo agregar el artículo. Intenta de nuevo.");
    }
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
        if (newDetails.length === 0) {
          const saved = await ProductionAPI.update(production.id, {
            ...production, quantity: 0, details: newDetails,
            techSpecification: recalcCosts(newDetails, production.techSpecification),
            history: [...(production.history || []), { status: "Artículo anulado", date: today, user: currentUser, motivo: `Ref: ${d.ref} | Color: ${d.color} | Cantidad: ${d.quantity} uds | Ref_corte: ${d.refCorte}` }]
          });
          setProduction(saved);
          setGlobalAlert({ open: true, type: "success", title: "Artículo eliminado", message: `El artículo ${d.ref} (${d.color}) fue eliminado. La orden quedó sin referencias.` });
          setTimeout(() => {
            openProductionAlert({
              type: "anular",
              customTitle: "¿Anular orden completa?",
              customMessage: "La orden quedó sin referencias. ¿Deseas anular la orden de producción completa?",
              onConfirmOverride: async (motivo) => {
                try {
                  await ProductionAPIClient.cancelOrder(saved.id, motivo || "Sin referencias");
                  const freshC = await ProductionAPIClient.getOrderById(saved.id);
                  const cDate = freshC.updatedAt ? new Date(freshC.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                  setProduction((prev) => ({
                    ...prev, status: 'Anulada', estado: 'Anulada', statusDate: cDate,
                    history: (freshC.historial || []).map((h) => ({ status: h.estado, date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '', user: h.id_usuario || 'Sistema', motivo: h.motivo })),
                    rawData: freshC,
                  }));
                  setGlobalAlert({ open: true, type: "success", title: "Orden anulada", message: "La orden fue anulada correctamente al quedar sin referencias." });
                } catch {
                  setGlobalAlert({ open: true, type: "error", title: "Error al anular", message: "No se pudo anular la orden. Intenta de nuevo." });
                }
              }
            });
          }, 800);
          return;
        }
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
    <div style={{ background: "#f8f9fb", minHeight: "100vh", fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

        /* ── Responsive root padding ── */
        .pd-root { padding: 14px; }
        @media (min-width: 640px)  { .pd-root { padding: 18px 20px; } }
        @media (min-width: 1024px) { .pd-root { padding: 24px 28px; } }

        /* ── Main 2-col grid: stacks on mobile ── */
        .pd-main-grid { display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px; }
        @media (min-width: 900px) { .pd-main-grid { grid-template-columns:1fr 300px; } }

        /* ── field-row: 1 col on small, 2 col on wider ── */
        .pd-field-row { display:grid; grid-template-columns:1fr; gap:12px 20px; }
        @media (min-width: 480px) { .pd-field-row { grid-template-columns:1fr 1fr; } }

        /* ── Modals: fit viewport on mobile ── */
        .pd-modal-inner { border-radius:18px; padding:20px 18px; width:calc(100vw - 32px); max-width:380px; box-shadow:0 20px 60px rgba(0,0,0,0.25); }
        @media (min-width: 480px) { .pd-modal-inner { padding:28px 28px 24px; } }

        .pd-card { background:#fff; border-radius:14px; box-shadow:0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); }
        .pd-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#FF4FD6; margin-bottom:3px; }
        .pd-value { font-size:13px; font-weight:600; color:#1a1a2e; }
        .pd-badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:10.5px; font-weight:700; letter-spacing:0.03em; }
        .pd-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }

        /* ── Nav buttons ── */
        .pd-btn-nav { border:1.5px solid #e5e7eb; background:#fff; color:#374151; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; transition:all 0.15s; }
        .pd-btn-nav:hover { border-color:#FF4FD6; color:#FF4FD6; }
        .pd-btn-primary { background:#FF4FD6; color:#fff; border:none; border-radius:9px; padding:7px 16px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:5px; box-shadow:0 4px 12px rgba(255,79,214,0.3); transition:all 0.15s; }
        .pd-btn-primary:hover { background:#d93db8; transform:translateY(-1px); }
        .pd-btn-danger { border:1.5px solid #fca5a5; background:#fff5f5; color:#ef4444; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .pd-btn-danger:hover { background:#fee2e2; }

        /* ── Table base ── */
        .pd-table th { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#9ca3af; padding-bottom:8px; }
        .pd-table td { padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:12.5px; }
        .pd-table tr:last-child td { border-bottom:none; }

        /* ── Action buttons ── */
        .pd-action-btn { width:26px; height:26px; border-radius:7px; border:1.5px solid #e5e7eb; background:#fafafa; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; color:#9ca3af; }
        .pd-action-btn:hover.edit { border-color:#3b82f6; color:#3b82f6; background:#eff6ff; }
        .pd-action-btn:hover.del { border-color:#ef4444; color:#ef4444; background:#fff5f5; }

        /* ── Input ── */
        .pd-input { width:100%; border:1.5px solid #e5e7eb; border-radius:9px; padding:8px 12px; font-size:13px; color:#374151; outline:none; transition:border 0.15s; box-sizing:border-box; }
        .pd-input:focus { border-color:#FF4FD6; box-shadow:0 0 0 3px rgba(255,79,214,0.1); }

        /* ── Stat card ── */
        .pd-stat-card { border-radius:11px; padding:13px 15px; }

        /* ═══════════════════════════════════════════════════════
           HISTORIAL COMPLETO — tabla responsive
           ═══════════════════════════════════════════════════════ */
        .pd-hist-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .pd-hist-th {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
          padding: 0 8px 8px 0;
          text-align: left;
          overflow: hidden;
        }
        .pd-hist-td {
          padding: 10px 8px 10px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
        .pd-hist-td:last-child { padding-right: 0; }

        /* Anchos de columna por defecto (escritorio) */
        .col-hist-estado { width: 28%; }
        .col-hist-fecha  { width: 18%; }
        .col-hist-resp   { width: 24%; }
        .col-hist-motivo { width: 30%; }

        /* Móvil ≤ 640px: ocultar Motivo, ajustar anchos, permitir wrap en estado */
        @media (max-width: 640px) {
          .col-hist-motivo { display: none; }
          .col-hist-estado { width: 40%; white-space: normal; }
          .col-hist-fecha  { width: 26%; }
          .col-hist-resp   { width: 34%; }
          .pd-hist-td      { font-size: 11px; }
        }

        /* ═══════════════════════════════════════════════════════
           STEPPER — texto adaptativo en móvil
           ═══════════════════════════════════════════════════════ */
        .pd-step-label {
          font-size: 9px;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }
        .pd-step-sublabel {
          font-size: 8px;
          font-weight: 400;
          display: block;
        }
        @media (max-width: 480px) {
          .pd-step-label    { font-size: 7px; }
          .pd-step-sublabel { font-size: 6.5px; }
          /* Círculos del stepper más pequeños */
          .pd-step-circle   { width: 20px !important; height: 20px !important; font-size: 8px !important; }
          /* Botones nav compactos */
          .pd-btn-nav     { padding: 6px 9px !important; font-size: 11px !important; }
          .pd-btn-primary { padding: 6px 10px !important; font-size: 11px !important; }
          /* Botón anular — debajo del título en móvil */
          .pd-anular-btn  { margin-left: 0 !important; margin-top: 8px; width: 100%; justify-content: center; }
          /* Header de orden: stack en móvil */
          .pd-order-header { flex-wrap: wrap; gap: 8px !important; }
        }

        /* ═══════════════════════════════════════════════════════
           SIDEBAR DERECHO — sin altura fija en móvil
           ═══════════════════════════════════════════════════════ */
        .pd-side-scroll {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 620px;
          overflow-y: auto;
          padding-right: 2px;
        }
        @media (max-width: 900px) {
          .pd-side-scroll {
            max-height: none;
            overflow-y: visible;
            padding-right: 0;
          }
        }

        /* ═══════════════════════════════════════════════════════
           PRODUCTO TOP — imagen + info en móvil
           ═══════════════════════════════════════════════════════ */
        .pd-product-top {
          padding: 18px 20px;
          display: flex;
          gap: 18px;
          align-items: flex-start;
          max-height: 240px;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .pd-product-top { flex-direction: column; max-height: none; gap: 12px; }
          .pd-product-img-wrap { flex-direction: row !important; align-items: flex-start; }
          .pd-product-main-img { width: 100px !important; height: 130px !important; }
        }

        /* ═══════════════════════════════════════════════════════
           DISTRIBUCIÓN tooltip — posición en móvil
           ═══════════════════════════════════════════════════════ */
        @media (max-width: 480px) {
          .dist-tooltip, .dist-tt {
            left: auto !important;
            right: 0 !important;
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div className="pd-root">
      {/* ── Modals ── */}
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
        totalUnidades={totalUnidades}
      />

      <DamagedProductsModal
        isOpen={damagedModal.open}
        production={damagedModal.production}
        onClose={() => setDamagedModal({ open: false, production: null })}
        onNewOrder={(damagedDetails) => {
          const source = damagedModal.production;
          setDamagedModal({ open: false, production: null });
          navigate('/layout/produccion', { state: { openNewOrderFromDamaged: true, source, damagedDetails } });
        }}
        onNewTechSheet={async (damagedDetails) => {
          const source = damagedModal.production;
          setDamagedModal({ open: false, production: null });
          if (!damagedDetails.length || !source) return;
          try {
            const { ProductionAPI: ProdAPI } = await import('../../services/ProductionAPI');
            const primary = damagedDetails[0];
            const newOrder = await ProdAPI.create({
              tipo: 'diseno', referencia: source.referencia || '', producto: source.producto || '',
              cantidad: String(primary.quantity || ''), color: primary.color || '',
              cliente: source.client || '', fechaSolicitud: '',
              referencias: damagedDetails.slice(1).map(d => ({ cantidad: String(d.quantity || ''), color: d.color || '' })),
              fromDamaged: true, originalOrderId: source.id, originalOrderNumber: source.orderNumber,
            });
            navigate(`/layout/produccion/detalle/${newOrder.id}`, {
              state: { openTechSheet: true, fromDamaged: true, originalOrderNumber: source.orderNumber, from: 'produccion' }
            });
          } catch(e) { console.error('Error creating recovery order:', e); }
        }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
          <div className="pd-card" style={{ padding: 24, width: "100%", maxWidth: 320, animation: "fadeIn 0.2s ease" }}>
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

      {/* ── Modal Galería de Imágenes ── */}
      {showImageModal && (() => {
        const designImages   = production.designImages || [];
        const finishedImages = production.finishedImages || (production.finishedImageUrl ? [production.finishedImageUrl] : []);
        const allImages      = [
          ...finishedImages.map((s, i) => ({ src: s, label: finishedImages.length > 1 ? `Producto terminado ${i + 1}` : "Producto terminado" })),
          ...designImages.map((s, i) => ({ src: s, label: `Diseño ${i + 1}` })),
        ];
        const current = allImages[selectedImageIdx] || allImages[0];
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowImageModal(false)}>
            <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowImageModal(false)}
                style={{ position: "absolute", top: -36, right: 0, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              <img src={current?.src} alt={current?.label}
                style={{ maxWidth: "80vw", maxHeight: "65vh", borderRadius: 12, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }} />
              <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0, background: "rgba(0,0,0,0.45)", padding: "4px 12px", borderRadius: 20 }}>{current?.label}</p>
              {allImages.length > 1 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {allImages.map((img, i) => (
                    <div key={i} onClick={() => setSelectedImageIdx(i)}
                      style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: i === selectedImageIdx ? "2.5px solid #FF4FD6" : "2px solid rgba(255,255,255,0.3)", transition: "border 0.15s" }}>
                      <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
              {allImages.length > 1 && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setSelectedImageIdx(i => (i - 1 + allImages.length) % allImages.length)}
                    style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>‹ Anterior</button>
                  <button onClick={() => setSelectedImageIdx(i => (i + 1) % allImages.length)}
                    style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Siguiente ›</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Modal Subir Foto Producto Terminado ── */}
      {pendingFinishedImg === "request" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setPendingFinishedImg(null)}>
          <div style={{ background: "#fff", borderRadius: 18, padding: "clamp(16px,4vw,28px)", width: "calc(100vw - 32px)", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827" }}>Foto del producto terminado</p>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Opcional — se mostrará en el detalle</p>
              </div>
            </div>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: "2px dashed #f9a8d4", borderRadius: 12, padding: "24px 16px", cursor: "pointer", background: "#fdf4ff", marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9333ea" }}>Seleccionar imagen</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>JPG, PNG — máx. 5MB</span>
              <input type="file" accept="image/*" multiple style={{ display: "none" }}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  const toBase64 = (file) => new Promise((res) => { const r = new FileReader(); r.onload = (ev) => res(ev.target.result); r.readAsDataURL(file); });
                  try {
                    const bases = await Promise.all(files.map(toBase64));
                    const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
                    const existingFinished = Array.isArray(production.finishedImages) ? production.finishedImages : (production.finishedImageUrl ? [production.finishedImageUrl] : []);
                    const saved = await ProductionAPI.update(production.id, {
                      ...production, finishedImages: [...existingFinished, ...bases], finishedImageUrl: bases[0],
                      history: [...(production.history || []), { status: "Foto producto terminado", date: today, user: ProductionAPI.getCurrentUser(), motivo: `${bases.length} imagen${bases.length !== 1 ? "es" : ""} agregada${bases.length !== 1 ? "s" : ""}` }]
                    });
                    setProduction(saved);
                    setPendingFinishedImg(null);
                    setGlobalAlert({ open: true, type: "success", title: "Fotos guardadas", message: `${bases.length} imagen${bases.length !== 1 ? "es" : ""} guardada${bases.length !== 1 ? "s" : ""} correctamente.` });
                  } catch {
                    setGlobalAlert({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar las imágenes." });
                    setPendingFinishedImg(null);
                  }
                }} />
            </label>
            <button onClick={() => setPendingFinishedImg(null)}
              style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Omitir por ahora
            </button>
          </div>
        </div>
      )}

      {/* ── Tech Sheet Modal (Read) ── */}
      {showTechSheet && production.techSpecification && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
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
      {showTechSheetForm && (production.tipo === 'diseno' || !production.techSpecification) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}>
          <div className="pd-card" style={{ width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "3px solid #FF4FD6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>✏️ Crear ficha técnica</h4>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Completa los datos y guarda para desbloquear el avance</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 12 }}>Cancelar</button>
                <button className="pd-btn-primary"
                  onClick={async () => {
                    if (!techSheetDraft) { setGlobalAlert({ open: true, type: "warning", title: "Ficha vacía", message: "Completa al menos los datos básicos de la ficha antes de guardar." }); return; }
                    try {
                      const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
                      const costPerUnit = Number(techSheetDraft.costPerUnit) || 0;
                      const newSpec = { ...techSheetDraft, name: techSheetDraft.type || "Ficha técnica", version: "1", costPerUnit, totalCost: costPerUnit * totalUnidades, completed: true, createdAt: today };
                      const saved = await ProductionAPI.update(production.id, {
                        ...production, techSpecification: newSpec,
                        history: [...(production.history || []), { status: "Ficha técnica creada", date: today, user: ProductionAPI.getCurrentUser(), motivo: null }]
                      });
                      setProduction(saved); setShowTechSheetForm(false); setTechSheetDraft(null);
                      setGlobalAlert({ open: true, type: "success", title: "Ficha guardada", message: "La ficha técnica fue creada correctamente." });
                    } catch {
                      setGlobalAlert({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar la ficha técnica. Intenta de nuevo." });
                    }
                  }}>
                  💾 Guardar ficha
                </button>
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              <TechnicalSheet sheet={{ ...(techSheetDraft || {}), _totalQty: totalUnidades }} isEditing={true} onChange={(data) => setTechSheetDraft({ ...data, _totalQty: totalUnidades })} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PAGE CONTENT ══════════════ */}

      {/* Back button */}
      <button onClick={() => {
          const from = location.state?.from;
          if (from === 'calendar') navigate('/layout/produccion/calendario');
          else navigate('/layout/produccion');
        }}
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginBottom: 18, padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        {location.state?.from === 'calendar' ? 'Volver al Calendario' : 'Volver a Producciones'}
      </button>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="pd-order-header" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
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
        {!isAnulada && (
          <button className="pd-btn-danger pd-anular-btn" style={{ marginLeft: "auto" }}
            onClick={() => openProductionAlert({
              type: "anular", customTitle: "Anular orden",
              customMessage: "¿Deseas anular esta orden de producción? Esta acción no se puede deshacer.",
              onConfirmOverride: async (motivo) => {
                await ProductionAPIClient.cancelOrder(production.id, motivo || "Sin motivo");
                const freshCancelled = await ProductionAPIClient.getOrderById(production.id);
                const cancelDate = freshCancelled.updatedAt
                  ? new Date(freshCancelled.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const cancelledMapped = {
                  ...production,
                  status: 'Anulada', estado: 'Anulada', statusDate: cancelDate,
                  history: (freshCancelled.historial || []).map((h) => ({
                    status: h.estado,
                    date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
                    user: h.id_usuario || 'Sistema', motivo: h.motivo,
                  })),
                  rawData: freshCancelled,
                };
                setProduction(cancelledMapped);
                if (["Corte","Producción"].includes(production.status)) {
                  setTimeout(() => setDamagedModal({ open: true, production: cancelledMapped }), 400);
                }
              }
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

      {/* ── 1. FLUJO DE PROCESO ─────────────────────────────────── */}
      {!isAnulada && (
        <div className="pd-card" style={{ padding: "14px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Flujo de Proceso</p>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {prevStep && safeStepIndex < stepsReal.indexOf("Recepción") && (
                <button className="pd-btn-nav"
                  onClick={() => openProductionAlert({
                    type: "password", targetStep: prevStep,
                    customTitle: "Autorización requerida",
                    customMessage: `Para retroceder al estado "${prevStep}" ingresa la contraseña de administrador.`,
                  })}>
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
              const done   = i < safeStepIndex;
              const active = i === safeStepIndex;
              return (
                <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
                  <div
                    className="pd-step-circle"
                    style={{
                      width: 26, height: 26, borderRadius: "50%", border: "2px solid",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                      ...(done   ? { background: "#FF4FD6", borderColor: "#FF4FD6", color: "#fff" }
                        : active ? { background: "#fff", borderColor: "#FF4FD6", color: "#FF4FD6", boxShadow: "0 0 0 4px rgba(255,79,214,0.12)" }
                        :          { background: "#fff", borderColor: "#e5e7eb", color: "#d1d5db" })
                    }}>
                    {done ? <CheckIcon /> : i + 1}
                  </div>
                  <span
                    className="pd-step-label"
                    style={{ fontWeight: active ? 700 : 500, color: active ? "#FF4FD6" : done ? "#6b7280" : "#d1d5db" }}>
                    {step}
                    <span
                      className="pd-step-sublabel"
                      style={{ color: active ? "#9ca3af" : done ? "#9ca3af" : "#e5e7eb" }}>
                      {active ? "En proceso" : done ? "Finalizado" : "Pendiente"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 99, height: 4 }}>
              <div style={{ width: `${progressPercent}%`, height: 4, background: "#FF4FD6", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#FF4FD6", flexShrink: 0 }}>{progressPercent}%</span>
          </div>

          {fichaBloquea && (
            <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 9, padding: "7px 12px", marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13 }}>⚠️</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Crea la ficha técnica para poder avanzar al siguiente paso</span>
            </div>
          )}
        </div>
      )}

      {/* ── 2. GRID: Producto (izq) + Sidebar (der) ── */}
      <div className="pd-main-grid">

        {/* LEFT: Product card */}
        <div className="pd-card" style={{ padding: 0, overflow: "hidden" }}>

          {/* Product top */}
          <div className="pd-product-top">
            {/* Imagen */}
            {(() => {
              const designImages   = production.designImages || [];
              const finishedImages = production.finishedImages || (production.finishedImageUrl ? [production.finishedImageUrl] : []);
              const allImages      = [
                ...finishedImages.map((s, i) => ({ src: s, label: finishedImages.length > 1 ? `Producto terminado ${i + 1}` : "Producto terminado" })),
                ...designImages.map((s, i) => ({ src: s, label: `Diseño ${i + 1}` })),
              ];
              return (
                <div className="pd-product-img-wrap" style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <div
                    className="pd-product-main-img"
                    onClick={() => { if (allImages.length > 0) { setSelectedImageIdx(0); setShowImageModal(true); } }}
                    style={{
                      width: 150, height: 190, borderRadius: 12, overflow: "hidden",
                      background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 14px rgba(255,79,214,0.15)",
                      cursor: allImages.length > 0 ? "pointer" : "default",
                      position: "relative",
                    }}>
                    {allImages.length > 0
                      ? <img src={allImages[0].src} alt={allImages[0].label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : production.imageUrl
                        ? <img src={production.imageUrl} alt={production.producto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
                            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                    }
                    {allImages.length > 1 && (
                      <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,0.6)", borderRadius: 7, padding: "2px 7px", fontSize: 10, color: "#fff", fontWeight: 700 }}>
                        +{allImages.length}
                      </div>
                    )}
                    {allImages.length > 0 && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.18)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.9 }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div style={{ display: "flex", gap: 4 }}>
                      {allImages.slice(1, 4).map((img, i) => (
                        <div key={i}
                          onClick={() => { setSelectedImageIdx(i + 1); setShowImageModal(true); }}
                          style={{ width: 34, height: 34, borderRadius: 6, overflow: "hidden", cursor: "pointer", border: "1.5px solid #f9a8d4" }}>
                          <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

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

          {/* Detalle Referencia */}
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
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

            {/* Tabla de referencias — scroll horizontal en móvil */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Código", "Cantidad", "Color", "Estado", ...((!isAnulada && !isLocked) ? [""] : [])].map((h, idx) => (
                      <th key={idx} style={{ textAlign: "left", padding: "0 0 6px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#c4c9d4", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortBySize(production.details).map((d, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "7px 8px 7px 0" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>{d.refCorte}</span>
                      </td>
                      <td style={{ padding: "7px 8px 7px 0" }}>
                        <span style={{ fontSize: 11.5, color: "#374151", whiteSpace: "nowrap" }}>{d.quantity} <span style={{ color: "#9ca3af", fontSize: 10 }}>uds</span></span>
                      </td>
                      <td style={{ padding: "7px 8px 7px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c4b5d4", flexShrink: 0 }} />
                          <span style={{ fontSize: 11.5, color: "#374151", whiteSpace: "nowrap" }}>{d.color}</span>
                        </div>
                      </td>
                      <td style={{ padding: "7px 8px 7px 0" }}>
                        <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 20, fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap", ...statusStyle(d.status) }}>
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
            </div>

            {(production.details || []).length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 14 }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  <strong style={{ color: "#6b7280" }}>{(production.details || []).length}</strong> refs
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Total: <strong style={{ color: "#FF4FD6" }}>{totalUnidades.toLocaleString("es-CO")} uds</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="pd-side-scroll">

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

          {/* Distribución Terceros */}
          {(production.terceroAsignaciones || []).length > 0 && (
            <div className="pd-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fdf4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"/>
                  </svg>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Terceros Asignados</p>
              </div>
              {(production.terceroAsignaciones || []).map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: i % 2 === 0 ? "#fdf4ff" : "#fff", borderRadius: 8, marginBottom: 4, border: "1px solid #f5d0fe" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6b21a8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>{a.option}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#FF4FD6", flexShrink: 0 }}>{Number(a.cantidad).toLocaleString("es-CO")} uds</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, paddingTop: 6, borderTop: "1px solid #f5d0fe" }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Total: <strong style={{ color: "#FF4FD6" }}>
                    {(production.terceroAsignaciones || []).reduce((s, a) => s + (Number(a.cantidad) || 0), 0).toLocaleString("es-CO")} uds
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Distribución Sedes */}
          {(production.sedeAsignaciones || []).length > 0 && (
            <div className="pd-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Distribución por Sede</p>
              </div>
              {(production.sedeAsignaciones || []).map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: i % 2 === 0 ? "#f0fdf4" : "#fff", borderRadius: 8, marginBottom: 4, border: "1px solid #bbf7d0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.option}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", flexShrink: 0, marginLeft: 8 }}>{Number(a.cantidad).toLocaleString("es-CO")} uds</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, paddingTop: 6, borderTop: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Total enviado: <strong style={{ color: "#16a34a" }}>
                    {(production.sedeAsignaciones || []).reduce((s, a) => s + (Number(a.cantidad) || 0), 0).toLocaleString("es-CO")} uds
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Historial Operativo (últimas 4 entradas) */}
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.status}</p>
                      {h.distribución && h.distribución.length > 0 && (
                        <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}
                          onMouseEnter={e => e.currentTarget.querySelector('.dist-tooltip').style.display = 'block'}
                          onMouseLeave={e => e.currentTarget.querySelector('.dist-tooltip').style.display = 'none'}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round" style={{ cursor: "pointer", marginBottom: -2 }}>
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5"/><line x1="12" y1="11" x2="12" y2="16"/>
                          </svg>
                          <div className="dist-tooltip" style={{
                            display: "none", position: "absolute", left: "100%", top: "-8px",
                            zIndex: 200, background: "#1f2937", borderRadius: 10,
                            padding: "10px 14px", minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", marginLeft: 8,
                          }}>
                            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Distribución</p>
                            {h.distribución.map((d, di) => (
                              <div key={di} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{d.option}</span>
                                <span style={{ fontSize: 11, color: "#FF4FD6", fontWeight: 700 }}>{d.cantidad} uds</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                      {h.date}
                      {h.user && <span style={{ color: "#6b7280", fontWeight: 600 }}> · {h.user}</span>}
                    </p>
                    {h.motivo && <p style={{ fontSize: 10, color: "#f59e0b", margin: "2px 0 0", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.motivo}</p>}
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

      {/* ── Historial Completo (expandible) ── */}
      {(production.history || []).length > 4 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#6b7280", padding: "10px 0" }}>
            <ClockIcon />
            Ver historial completo ({(production.history || []).length} entradas)
          </summary>
          <div className="pd-card" style={{ padding: "16px 20px", marginTop: 8, overflowX: "auto" }}>
            {/* Nota en móvil: Motivo oculto */}
            <p style={{ margin: "0 0 8px", fontSize: 10, color: "#9ca3af", fontStyle: "italic" }}
               className="col-hist-motivo">
              * La columna Motivo se oculta en pantallas pequeñas
            </p>

            <table className="pd-hist-table">
              <thead>
                <tr>
                  <th className="pd-hist-th col-hist-estado">Estado</th>
                  <th className="pd-hist-th col-hist-fecha">Fecha</th>
                  <th className="pd-hist-th col-hist-resp">Responsable</th>
                  <th className="pd-hist-th col-hist-motivo">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {(production.history || []).map((h, i) => (
                  <tr key={i}>
                    {/* Estado */}
                    <td className="pd-hist-td col-hist-estado" style={{ paddingRight: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                        <span className="pd-badge" style={{ ...statusStyle(h.status), fontSize: 10, whiteSpace: "nowrap" }}>{h.status}</span>
                        {h.distribución && h.distribución.length > 0 && (
                          <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}
                            onMouseEnter={e => e.currentTarget.querySelector('.dist-tt').style.display = 'block'}
                            onMouseLeave={e => e.currentTarget.querySelector('.dist-tt').style.display = 'none'}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round" style={{ cursor: "pointer" }}>
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5"/><line x1="12" y1="11" x2="12" y2="16"/>
                            </svg>
                            <div className="dist-tt" style={{
                              display: "none", position: "absolute", left: "100%", top: "-4px",
                              zIndex: 300, background: "#1f2937", borderRadius: 10,
                              padding: "10px 14px", minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", marginLeft: 6,
                            }}>
                              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Distribución</p>
                              {h.distribución.map((d, di) => (
                                <div key={di} style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 3 }}>
                                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{d.option}</span>
                                  <span style={{ fontSize: 11, color: "#FF4FD6", fontWeight: 700 }}>{d.cantidad} uds</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Fecha */}
                    <td className="pd-hist-td col-hist-fecha" style={{ color: "#6b7280" }}>
                      {h.date}
                    </td>
                    {/* Responsable — truncado con title para ver completo en hover/tap */}
                    <td
                      className="pd-hist-td col-hist-resp"
                      style={{ color: "#374151", fontWeight: 500 }}
                      title={h.user || "—"}>
                      {h.user || "—"}
                    </td>
                    {/* Motivo — oculto en móvil ≤640px */}
                    <td className="pd-hist-td col-hist-motivo">
                      {h.motivo
                        ? <span style={{ color: "#f59e0b", fontStyle: "italic" }}>{h.motivo}</span>
                        : <span style={{ color: "#d1d5db" }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      </div>{/* /pd-root */}
    </div>
  );
};

export default ProductionDetailsPage;