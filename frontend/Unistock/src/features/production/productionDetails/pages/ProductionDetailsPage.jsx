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
import TechnicalSheet from "../../../products/components/TechnicalSheet";
import AlertEditProduction from "./AlertEditProduction";
import ProductionAlerts from "./ProductionAlerts";
import { useAuthContext } from "../../../shared/AuthContext";
import { useSedeScope } from "../../../shared/hooks/useSedeScope";
import { useEmployees } from "../../../employees/hooks/mockEmployees";
import { blockInput } from "../../../shared/utils/blockInput";

const steps = ["Diseño", "Ficha", "Corte", "Compras", "Producción", "Recepción", "Enviado"];
const stepsReal = ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Enviado"];

// Etapas que requieren un empleado asignado (con su correspondiente cargo)
// y su confirmación de "listo" antes de que el Gerente pueda avanzar.
// "Producción" se tercializa (no se asigna nadie ahí).
const ETAPAS_ASIGNABLES = ["Corte", "Compras", "Recepción"];
const EMPLOYEE_REQUIRED_STEPS = ETAPAS_ASIGNABLES;

const normalizarTexto = (s) => (s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SIZE_ORDER = ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "XXXL", "4XL", "5XL"];
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

const toMoneyNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sumDetailQty = (details = []) =>
  (details || []).reduce((sum, detail) => sum + (Number(detail.quantity ?? detail.cantidad) || 0), 0);

const recalcTechSpecCost = (techSpec, details, productPrice) => {
  if (!techSpec) return techSpec;
  const costPerUnit = toMoneyNumber(productPrice) || toMoneyNumber(techSpec.costPerUnit);
  const totalCost = costPerUnit * sumDetailQty(details);
  return { ...techSpec, costPerUnit, totalCost };
};

const getPriceFromOrderDetails = (details = []) => {
  for (const detail of details || []) {
    const product = detail?.producto;
    const price = toMoneyNumber(product?.precio ?? product?.price);
    if (price > 0) return price;
  }
  return 0;
};

const resolveProductPriceByReference = async (reference, details = []) => {
  const detailPrice = getPriceFromOrderDetails(details);
  if (detailPrice > 0) return detailPrice;

  const ref = String(reference || details?.[0]?.id_producto || "").trim();
  if (!ref) return 0;

  try {
    const { productAPI } = await import("../../../products/services/productAPI");
    const products = await productAPI.getAll();
    const product = (Array.isArray(products) ? products : []).find((item) =>
      String(item.reference || item.referencia || item.id || item._id || "").trim() === ref
    );
    return toMoneyNumber(product?.price ?? product?.precio);
  } catch (err) {
    console.warn("[Producción] No se pudo resolver precio del producto:", err?.message || err);
    return 0;
  }
};

/* ══════════════════════════════════════════════════════════════ */
const ProductionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ Obtener el usuario actual para validar contraseña y sincronizar calendario
  const { user: currentUser } = useAuthContext();
  const { isGerente, isAdministrador, isEmpleado } = useSedeScope();
  // 🔒 Metodología de permisos en el detalle de una orden:
  // - Gerente: control total (crea, asigna, avanza, anula, edita).
  // - Administrador: solo observa (sin acciones).
  // - Empleado: vista de solo lectura + único botón habilitado "Siguiente"
  //   para avanzar el estado. El resto de acciones (anular, editar ficha,
  //   asignar, editar/anular referencias, etc.) permanecen ocultas para él.
  const puedeAsignar = isGerente;
  // 🐛 FIX: Solo cargar la lista de empleados si el usuario es Gerente (el
  // único rol que necesita el catálogo para el modal de asignación).
  // Empleado y Administrador NO pueden asignar a nadie, así que no necesitan
  // hacer GET /api/users — el backend rechaza esa ruta para roles no Gerente/
  // Administrador con 403.
  const { employees } = puedeAsignar ? useEmployees() : { employees: [] };

  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Solo se redirige fuera del detalle a roles que no tienen nada que hacer
  // aquí. Gerente, Administrador y Empleado sí pueden ver esta página.
  useEffect(() => {
    if (!isGerente && !isAdministrador && !isEmpleado) navigate('/layout/produccion', { replace: true });
  }, [isGerente, isAdministrador, isEmpleado, navigate]);

  // ── Mini-modal de asignación de empleado (Gerente) ──────────────────────
  // Se usa tanto para la primera asignación (etapa inicial, sin "Siguiente"
  // de por medio) como para reasignar en cualquier etapa asignable.
  const [asignarModal, setAsignarModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [asignandoEmpleado, setAsignandoEmpleado] = useState(false);
  // Conteo de órdenes activas por empleado — para no sobrecargar a nadie.
  const [cargaPorEmpleado, setCargaPorEmpleado] = useState({});

  const [addRefOpen, setAddRefOpen] = useState(false);
  const [newRef, setNewRef] = useState({ cantidad: "", color: "" });
  const [isSavingRef, setIsSavingRef] = useState(false);
  // ✅ Selector de color tipo acordeón — mismo patrón usado en ProductionForm
  // y en AlertEditProduction, para que el comportamiento sea idéntico en
  // todos los lugares donde se elige un color de producción.
  const [addRefSavedColors, setAddRefSavedColors] = useState(() => {
    try {
      const stored = localStorage.getItem('productionColors');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [addRefColorOpen, setAddRefColorOpen] = useState(false);
  const saveProductionColor = (c) => {
    if (!c) return;
    try {
      const stored = localStorage.getItem('productionColors');
      const current = stored ? JSON.parse(stored) : [];
      if (!current.includes(c)) {
        const updated = [c, ...current].slice(0, 10);
        localStorage.setItem('productionColors', JSON.stringify(updated));
        setAddRefSavedColors(updated);
      }
    } catch { /* ignorar */ }
  };
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

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [pendingFinishedImg, setPendingFinishedImg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, asignacionesRaw] = await Promise.all([
          ProductionAPIClient.getOrderById(id),
          ProductionAPIClient.getAssignments(id).catch(() => []),
        ]);

        let terceroMap = {};
        try {
          const { thirdPartyAPI } = await import('../../../third_parties/services/thirdPartyAPI');
          const terceros = await thirdPartyAPI.getAll({ limit: 500 });
          (Array.isArray(terceros) ? terceros : []).forEach(t => {
            const tid = t._id || t.id;
            if (tid) terceroMap[tid] = t.nombreEmpresa || t.nombre || t.nit || tid;
          });
        } catch (e) { console.warn('[Detalle] No se pudo cargar terceros:', e); }

        const terceroAsignaciones = (() => {
          try {
            const key = `app_prod_terceros_${data._id || data.id}`;
            const raw = localStorage.getItem(key);
            if (raw) { const parsed = JSON.parse(raw); if (parsed.length > 0) return parsed; }
          } catch { }
          return asignacionesRaw
            .filter(a => !a.id_orden || a.id_orden === id || a.id_orden === data._id || a.id_orden === data.id)
            .map(a => ({
              option: terceroMap[a.id_tercero] || a.nombre_tercero || a.id_tercero || '—',
              cantidad: Number(a.cantidad) || 0,
            }))
            .filter(a => a.cantidad > 0);
        })();

        const sedeAsignaciones = (() => {
          try {
            const key = `app_prod_sedes_${data._id || data.id}`;
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            }
          } catch { }
          const source = (
            data.sedeAsignaciones ||
            data.sede_asignaciones ||
            data.rawData?.sedeAsignaciones ||
            []
          );
          return (Array.isArray(source) ? source : [])
            .filter(a => a.option && Number(a.cantidad) > 0);
        })();

        const mergeDedupSedes = (list = []) => {
          const map = new Map();
          (Array.isArray(list) ? list : []).forEach((a) => {
            const key = String(a.option || '').trim();
            const qty = Number(a.cantidad) || 0;
            if (!key || qty <= 0) return;
            map.set(key, (map.get(key) || 0) + qty);
          });
          return [...map.entries()].map(([option, cantidad]) => ({ option, cantidad }));
        };

        const sedeAsignacionesDedup = mergeDedupSedes(sedeAsignaciones);

        const statusDate = data.updatedAt
          ? new Date(data.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : (data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

        const productoPrecio = await resolveProductPriceByReference(data.referencia, data.detalles || []);
        const mappedDetails = (data.detalles || []).map((d) => ({
          id: d.id || d._id,
          refCorte: d.refCorte || d.id_producto || '',
          ref: d.id_producto || '',
          quantity: d.cantidad || 0,
          color: d.color || '—',
          status: data.estado,
          statusDate,
          estado: d.estado !== false,
        }));
        const techSpecification = recalcTechSpecCost(data.techSpecification || data.techSheet || null, mappedDetails, productoPrecio);
        const productImage = (data.detalles && data.detalles.length > 0 && data.detalles[0].producto?.imagenes_Url?.length > 0)
          ? data.detalles[0].producto.imagenes_Url[0]
          : null;

        const mappedProduction = {
          id: data._id || data.id,
          orderNumber: data.numero_orden,
          cliente: data.cliente,
          client: data.cliente,
          tipo: data.tipo || data.type || 'produccion',
          techSpecification,
          designImages: Array.isArray(data.designImages) ? data.designImages : [],
          // ✅ Mapear imágenes del producto terminado
          finishedImages: Array.isArray(data.finishedImages) ? data.finishedImages
            : (data.finishedImageUrl ? [data.finishedImageUrl] : []),
          finishedImageUrl: data.finishedImageUrl || null,
          fromDamaged: data.fromDamaged || false,
          originalOrderNumber: data.originalOrderNumber || null,
          originalOrderStatus: data.originalOrderStatus || null,
          producto: (data.detalles && data.detalles.length > 0)
            ? (data.detalles[0].id_producto || 'Orden de producción')
            : 'Orden de producción',
          referencia: (data.detalles && data.detalles.length > 0)
            ? (data.detalles[0].id_producto || '')
            : '',
          productoPrecio,
          productImage,
          status: data.estado,
          estado: data.estado,
          deliveryDate: data.fecha_entrega
            ? new Date(data.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '',
          statusDate,
          history: (data.historial || []).map(h => ({
            status: h.estado,
            date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
            user: h.user || h.id_usuario || 'Sistema',
            motivo: h.motivo
          })),
          details: mappedDetails,
          terceroAsignaciones,
          sedeAsignaciones,
          // ✅ Modelo de asignación: un solo empleado responsable de la etapa
          // ACTUAL (no un mapa por etapa) + su confirmación de "listo".
          empleadoAsignadoId: data.empleadoAsignadoId || null,
          etapaConfirmada: !!data.etapaConfirmada,
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

  // ── Carga (workload) por empleado: cuántas órdenes activas tiene cada uno
  // asignadas ahora mismo, para no sobrecargar al elegir en el mini-modal.
  useEffect(() => {
    const loadCarga = async () => {
      try {
        const list = await ProductionAPIClient.getOrders({ page: 1, limit: 500 });
        const arr = Array.isArray(list) ? list : [];
        const counts = {};
        arr.forEach((o) => {
          const empId = o.empleadoAsignadoId;
          const estado = o.estado;
          if (!empId || estado === 'Anulada' || estado === 'Enviado') return;
          counts[empId] = (counts[empId] || 0) + 1;
        });
        setCargaPorEmpleado(counts);
      } catch (err) {
        console.warn('[Producción] No se pudo calcular la carga por empleado:', err?.message || err);
      }
    };
    if (puedeAsignar) loadCarga();
  }, [puedeAsignar, production?.status, production?.empleadoAsignadoId]);

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
  // ✅ Se permite agregar/quitar productos del detalle hasta que la orden llegue
  // al proceso de Compras (antes se bloqueaba después de Corte)
  const isLocked = safeStepIndex > stepsReal.indexOf("Compras");
  const isOnFichaStep = production.status === "Ficha Técnica";
  const hasTechSheet = !!production.techSpecification;
  const fichaBloquea = isOnFichaStep && !hasTechSheet;

  const totalUnidades = (production.details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0);

  // ── Asignación de empleado a la etapa actual (exclusivo Gerente) ────────
  // Empleados candidatos: rol "Empleado", su lista de CARGOS debe incluir
  // el nombre de la etapa actual, y estar activos. Se muestra además
  // cuántas órdenes activas tiene cada uno (carga de trabajo).
  const empleadosDeEtapa = (employees || []).filter(
    (e) => e.estado !== false
      && normalizarTexto(e.rolNombre) === "empleado"
      && (e.cargos || []).some((c) => normalizarTexto(c) === normalizarTexto(production.status))
  );
  const empleadoAsignado = (employees || []).find(
    (e) => String(e.id) === String(production.empleadoAsignadoId)
  );
  const requiereAsignacion = ETAPAS_ASIGNABLES.includes(production.status);

  // Solo Gerente puede avanzar etapas — Empleado y Administrador son observadores.
  // 🐛 FIX: Se retiró el botón "Confirmar etapa" del empleado.
  // Ahora solo el Gerente avanza la orden al siguiente estado.
  const esperandoConfirmacion = false;
  const puedeAvanzar = isGerente;

  const handleAsignarEmpleado = async () => {
    if (!empleadoSeleccionado) return;
    setAsignandoEmpleado(true);
    try {
      // 🐛 FIX: Antes se llamaba a `updateOrder()` con un objeto
      // `empleadoAsignaciones` (mapa por etapa), pero el backend REAL
      // (Api_Unistock, puerto 3000) guarda la asignación como un campo
      // plano `empleadoAsignadoId`, NO como ese objeto. El endpoint
      // correcto es PATCH /produccion/ordenes/:id/asignar-empleado, que
      // usa AsignarEmpleadoProduccion para validar cargo vs. etapa y
      // persiste el ObjectId del empleado. El objeto empleadoAsignaciones
      // no existe en el esquema real, así que updateOrder lo ignoraba
      // en silencio y la asignación nunca se guardaba.
      const actualizado = await ProductionAPIClient.asignarEmpleado(production.id, empleadoSeleccionado);
      const empleadoElegido = empleadosDeEtapa.find((e) => String(e.id) === String(empleadoSeleccionado));
      setProduction((prev) => ({
        ...prev,
        empleadoAsignadoId: actualizado.empleadoAsignadoId || empleadoSeleccionado,
        etapaConfirmada: false,
        empleadoAsignaciones: {
          ...(prev.empleadoAsignaciones || {}),
          [prev.status]: {
            id_empleado: empleadoSeleccionado,
            nombre_empleado: empleadoElegido?.nombreCompleto || empleadoElegido?.nombre || "",
            fecha: new Date().toISOString(),
          },
        },
      }));
      setEmpleadoSeleccionado("");
      setAsignarModal(false);
      setGlobalAlert({ open: true, type: "success", title: "Empleado asignado", message: "Se le avisó por correo. La orden queda a la espera de su confirmación." });
    } catch (err) {
      setGlobalAlert({ open: true, type: "error", title: "No se pudo asignar", message: err?.message || "Intenta de nuevo." });
    } finally {
      setAsignandoEmpleado(false);
    }
  };

  const getAlertType = (from, to) => {
    if (from === "Compras" && to === "Producción") return "third";
    // Producción → Recepción sigue pidiendo sede; el empleado responsable
    // se pide encadenado justo después (ver handleProductionAlertConfirm).
    if (from === "Producción" && to === "Recepción") return "assignSede";
    if (EMPLOYEE_REQUIRED_STEPS.includes(to)) return "assignEmployee";
    return "advance";
  };

// Persiste el empleado responsable de una etapa y avanza la orden
  const asignarEmpleadoYAvanzar = async (targetStep, empleado) => {
    const { id_empleado, nombre_empleado } = empleado || {};
    if (!id_empleado) {
      setGlobalAlert({ open: true, type: "error", title: "Empleado requerido", message: "Debes seleccionar un empleado responsable para continuar." });
      return;
    }
    // 🐛 FIX: Primero avanzar la orden al targetStep (applyStepChange cambia
    // el estado vía PATCH /ordenes/:id/cambiar-estado). SOLO DESPUÉS asignar
    // el empleado, porque el endpoint PATCH /ordenes/:id/asignar-empleado
    // valida el CARGO del empleado contra la ETAPA ACTUAL de la orden en la BD.
    // Si asignábamos antes de avanzar, el empleado se validaba contra la etapa
    // anterior (ej. "Ficha Técnica") en vez de la etapa destino (ej. "Corte"),
    // y fallaba porque el cargo del empleado es para la nueva etapa, no la vieja.
    await applyStepChange(targetStep);
    await ProductionAPIClient.asignarEmpleado(production.id, id_empleado);
    // Actualizar el estado local para reflejar la asignación en la nueva etapa
    setProduction((prev) => ({
      ...prev,
      empleadoAsignadoId: id_empleado,
      empleadoAsignaciones: {
        ...(prev.empleadoAsignaciones || {}),
        [targetStep]: { id_empleado, nombre_empleado, fecha: new Date().toISOString() },
      },
    }));
  };

  const openProductionAlert = (overrides) =>
    setProductionAlert({ isOpen: true, type: "advance", targetStep: null, tercero: "", sede: "", customTitle: undefined, customMessage: undefined, onConfirmOverride: null, ...overrides });

  const closeProductionAlert = () => setProductionAlert((p) => ({ ...p, isOpen: false }));

  const applyStepChange = async (newStatus, opts = {}) => {
    const extra = {};
    if (newStatus === 'Enviado') {
      const imgs = Array.isArray(production.finishedImages) ? production.finishedImages : (production.finishedImageUrl ? [production.finishedImageUrl] : []);
      if (imgs.length) extra.finishedImages = imgs;
    }
    await ProductionAPIClient.changeOrderStatus(production.id, newStatus, { force: !!opts.force, extra });

    const freshData = await ProductionAPIClient.getOrderById(production.id);
    const { terceroAsignaciones: freshTerceros, sedeAsignaciones: freshSedes } =
      await enrichAsignaciones(production.id, freshData);
    const statusDate = freshData.updatedAt
      ? new Date(freshData.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setProduction((prev) => ({
      ...prev,
      status: freshData.estado || newStatus,
      estado: freshData.estado || newStatus,
      statusDate,
      // ✅ Preservar imágenes: usar las del servidor si existen, si no conservar las del estado anterior
      finishedImages: (Array.isArray(freshData.finishedImages) && freshData.finishedImages.length > 0)
        ? freshData.finishedImages
        : (prev.finishedImages || []),
      finishedImageUrl: freshData.finishedImageUrl || prev.finishedImageUrl || null,
      designImages: (Array.isArray(freshData.designImages) && freshData.designImages.length > 0)
        ? freshData.designImages
        : (prev.designImages || []),
      terceroAsignaciones: freshTerceros.length > 0 ? freshTerceros : (prev.terceroAsignaciones || []),
      sedeAsignaciones: freshSedes.length > 0 ? freshSedes : (prev.sedeAsignaciones || []),
      // ✅ El backend limpia la asignación y la confirmación al avanzar de
      // etapa — reflejarlo de inmediato para que la UI muestre "Sin asignar"
      // sin esperar otro refresh.
      empleadoAsignadoId: freshData.empleadoAsignadoId ?? null,
      etapaConfirmada: !!freshData.etapaConfirmada,
      history: (freshData.historial || []).map((h) => ({
        status: h.estado,
        date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        user: h.user || h.id_usuario || 'Sistema',
        motivo: h.motivo,
      })),
      details: (freshData.detalles || prev.details || []).map((d) => ({
        id: d.id || d._id,
        refCorte: d.refCorte || d.id_producto || '',
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

  const enrichAsignaciones = async (orderId, rawData) => {
    try {
      const [asigs, { thirdPartyAPI }] = await Promise.all([
        ProductionAPIClient.getAssignments(orderId).catch(() => []),
        import('../../../third_parties/services/thirdPartyAPI'),
      ]);
      let terceroMap = {};
      const terceros = await thirdPartyAPI.getAll({ limit: 500 }).catch(() => []);
      (Array.isArray(terceros) ? terceros : []).forEach(t => {
        const tid = t._id || t.id;
        if (tid) terceroMap[tid] = t.nombreEmpresa || t.nombre || t.nit || tid;
      });

      const lsKeyT = `app_prod_terceros_${orderId}`;
      const lsKeyS = `app_prod_sedes_${orderId}`;
      let terceroAsignaciones = [];
      let sedeAsignaciones = [];

      try { const r = localStorage.getItem(lsKeyT); if (r) terceroAsignaciones = JSON.parse(r); } catch { }
      try { const r = localStorage.getItem(lsKeyS); if (r) sedeAsignaciones = JSON.parse(r); } catch { }

      if (terceroAsignaciones.length === 0 && asigs.length > 0) {
        terceroAsignaciones = asigs
          .filter(a => !a.id_orden || a.id_orden === orderId)
          .map(a => ({
            option: terceroMap[a.id_tercero] || a.nombre_tercero || a.id_tercero || '—',
            cantidad: Number(a.cantidad) || 0,
          }))
          .filter(a => a.cantidad > 0);
      }

      if (sedeAsignaciones.length === 0) {
        sedeAsignaciones = (rawData?.sedeAsignaciones || rawData?.sede_asignaciones || [])
          .filter(a => a.option && Number(a.cantidad) > 0);
      }

      return { terceroAsignaciones, sedeAsignaciones };
    } catch (e) {
      return { terceroAsignaciones: [], sedeAsignaciones: [] };
    }
  };

  const ADMIN_PASSWORD = null; // Ya no se usa — validación real contra el usuario actual

  const handleProductionAlertConfirm = async (motivo = "") => {
    const { targetStep, type, onConfirmOverride } = productionAlert;
    closeProductionAlert();

    if (type === "password") {
      try {
        const { AuthAPI } = await import('../../../auth/services/AuthAPI');
        const userIdentifier = currentUser?.correo || currentUser?.username || currentUser?.nombre;
        if (!userIdentifier) {
          setGlobalAlert({ open: true, type: "error", title: "Error de autenticación", message: "No se pudo identificar al usuario. Por favor recarga la página." });
          return;
        }
        await AuthAPI.login({ username: userIdentifier, password: motivo });
      } catch {
        setGlobalAlert({ open: true, type: "error", title: "Contraseña incorrecta", message: "La contraseña ingresada no es correcta. No se pudo retroceder el estado." });
        return;
      }
      try {
        await applyStepChange(targetStep, { force: true });
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
        const assignmentsList = Array.isArray(motivo) ? motivo : [];
        const terceroAsignaciones = assignmentsList
          .filter(a => a.option && Number(a.cantidad) > 0)
          .map(a => ({
            id_tercero: a.id_tercero || a.terceroId || null,
            option: a.option,
            cantidad: Number(a.cantidad),
          }));

        // ✅ Fix sobre-suma: eliminar asignaciones previas de esta orden ANTES
        // de crear las nuevas. Sin esto, al retroceder y volver a avanzar el
        // estado, las cantidades se acumulaban en vez de reemplazarse.
        try {
          await ProductionAPIClient.deleteAssignmentsByOrder(production.id);
        } catch (e) {
          console.warn('[Tercero] No se pudieron limpiar asignaciones previas:', e?.message || e);
        }

        await Promise.all(
          terceroAsignaciones
            .filter(a => a.id_tercero)
            .map(a => ProductionAPIClient.createAssignment({
              id_orden: production.id,
              id_tercero: a.id_tercero,
              cantidad: a.cantidad,
            })),
        );

        try {
          localStorage.setItem(`app_prod_terceros_${production.id}`, JSON.stringify(terceroAsignaciones));
        } catch (e) { }

        // ✅ Fix gráfica dashboard: persistir también en la BD (antes solo
        // quedaba en localStorage, así que el dashboard nunca podía verlo)
        try {
          await ProductionAPIClient.updateOrder(production.id, { terceroAsignaciones });
        } catch (e) {
          console.warn('[Tercero] No se pudo persistir terceroAsignaciones en la BD:', e?.message || e);
        }

        setProduction(prev => ({ ...prev, terceroAsignaciones }));
        await applyStepChange(targetStep);
        setGlobalAlert({ open: true, type: "success", title: "Tercero asignado", message: `El tercero fue asignado y la orden avanzó a "${targetStep}".` });
      } catch (err) {
        console.error('[Tercero] Error al asignar:', err?.message || err);
        setGlobalAlert({ open: true, type: "error", title: "Error al asignar tercero", message: "No se pudo asignar el tercero. Intenta de nuevo." });
      }
      return;
    }

    if (type === "assignEmployee") {
      try {
        await asignarEmpleadoYAvanzar(targetStep, motivo);
        const nombre = motivo?.nombre_empleado || "El empleado";
        setGlobalAlert({ open: true, type: "success", title: "Empleado asignado", message: `${nombre} fue asignado como responsable de "${targetStep}" y la orden avanzó correctamente.` });
      } catch (err) {
        console.error('[Empleado] Error al asignar:', err?.message || err);
        setGlobalAlert({ open: true, type: "error", title: "Error al asignar empleado", message: "No se pudo asignar el empleado responsable. Intenta de nuevo." });
      }
      return;
    }

    if (type === "assignSede") {
      try {
        const assignmentsList = Array.isArray(motivo) ? motivo : [];
        const sedeAsignaciones = assignmentsList
          .filter(a => a.option && Number(a.cantidad) > 0)
          .map(a => ({ option: a.option, cantidad: Number(a.cantidad) }));

        // ✅ Fix sobre-suma: sobrescribir completamente la clave de localStorage
        // de sedes para esta orden, en vez de acumular sobre el valor anterior.
        try {
          const key = `app_prod_sedes_${production.id}`;
          localStorage.setItem(key, JSON.stringify(sedeAsignaciones));
        } catch (e) { }

        // ✅ Fix gráfica dashboard "Comportamiento de la producción en las sedes":
        // antes esta asignación solo vivía en localStorage, por lo que el
        // dashboard nunca podía leerla y siempre caía en el reparto equitativo
        // de respaldo. Ahora se persiste en la orden en la base de datos.
        try {
          await ProductionAPIClient.updateOrder(production.id, { sedeAsignaciones });
        } catch (e) {
          console.warn('[Sede] No se pudo persistir sedeAsignaciones en la BD:', e?.message || e);
        }

        // ✅ Fix sobre-suma: eliminar las producciones previas de esta orden en
        // TODOS los terceros antes de re-vincular, para no duplicar entradas
        // cuando se retrocede y se vuelve a avanzar el estado.
        try {
          const terceroRaw = localStorage.getItem('app_third_parties');
          const tercerosList = terceroRaw ? JSON.parse(terceroRaw) : [];
          const updatedTerceros = tercerosList.map(t => ({
            ...t, producciones: (t.producciones || []).filter(p => p.produccionId !== production.id),
          }));
          localStorage.setItem('app_third_parties', JSON.stringify(updatedTerceros));
        } catch (e) { }

        setProduction(prev => ({ ...prev, sedeAsignaciones }));

        // ✅ La sede quedó asignada; ahora se pide el empleado responsable
        // de la etapa "Recepción" antes de avanzar realmente el estado.
        setTimeout(() => {
          openProductionAlert({
            type: "assignEmployee",
            targetStep,
            customTitle: `Asignar empleado responsable de "${targetStep}"`,
            customMessage: `La sede quedó asignada. Ahora selecciona el empleado responsable de "${targetStep}".`,
            onConfirmOverride: async (empleado) => {
              try {
                await asignarEmpleadoYAvanzar(targetStep, empleado);
                setGlobalAlert({ open: true, type: "success", title: "Sede y empleado asignados", message: `La sede y el empleado responsable fueron asignados y la orden avanzó a "${targetStep}".` });
                setTimeout(() => setPendingFinishedImg("request"), 800);
              } catch (err) {
                console.error('[Empleado] Error al asignar tras sede:', err?.message || err);
                setGlobalAlert({ open: true, type: "error", title: "Error al asignar empleado", message: "No se pudo asignar el empleado responsable. Intenta de nuevo." });
              }
            },
          });
        }, 300);
      } catch (err) {
        console.error('[Sede] Error al asignar:', err?.message || err);
        setGlobalAlert({ open: true, type: "error", title: "Error al asignar sede", message: "No se pudo asignar la sede. Intenta de nuevo." });
      }
      return;
    }

    if (targetStep) {
      try {
        await applyStepChange(targetStep);
        setGlobalAlert({ open: true, type: "success", title: "Estado actualizado", message: `La orden avanzó al estado "${targetStep}" correctamente.` });
      } catch (err) {
        setGlobalAlert({ open: true, type: "error", title: "Error al cambiar estado", message: err?.message || "No se pudo actualizar el estado. Intenta de nuevo." });
      }
    }
  };

  const handleEditConfirm = async (updatedData) => {
    try {
      const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
      const detail = editAlert.detail;

      await ProductionAPIClient.updateOrderDetail(detail.id, {
        cantidad: Number(updatedData.cantidad) || 0,
        color: updatedData.color,
      });
      saveProductionColor(String(updatedData.color || "").trim());

      const freshData = await ProductionAPIClient.getOrderById(production.id);
      const statusDate = freshData.updatedAt
        ? new Date(freshData.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : today;

      const newDetails = (freshData.detalles || production.details || []).map((d) => ({
        id: d.id || d._id,
        refCorte: d.refCorte || d.id_producto || '',
        ref: d.id_producto || '',
        quantity: d.cantidad || 0,
        color: d.color || '—',
        status: freshData.estado,
        statusDate,
        estado: d.estado !== false,
      }));
      const updatedTechSpec = await persistRecalculatedCosts(newDetails, production.techSpecification);

      setProduction((prev) => {
        return {
          ...prev,
          details: newDetails,
          techSpecification: updatedTechSpec,
          rawData: freshData,
        };
      });

      setEditAlert({ isOpen: false, detail: null });
      setGlobalAlert({ open: true, type: "success", title: "Artículo actualizado", message: `El artículo ${detail.ref} fue actualizado correctamente.` });
    } catch (err) {
      console.error('Error al editar detalle:', err);
      setGlobalAlert({ open: true, type: "error", title: "Error al editar", message: "No se pudo actualizar el artículo. Intenta de nuevo." });
    }
  };

  const recalcCosts = (details, techSpec) => {
    return recalcTechSpecCost(techSpec, details, production.productoPrecio);
  };

  const persistRecalculatedCosts = async (details, techSpec) => {
    const updatedTechSpec = recalcCosts(details, techSpec);
    if (!updatedTechSpec) return updatedTechSpec;
    await ProductionAPIClient.updateOrder(production.id, { techSpecification: updatedTechSpec });
    return updatedTechSpec;
  };

  const handleSaveRef = async () => {
    if (!newRef.cantidad || !newRef.color) { setAddRefError("Completa cantidad y color."); return; }
    if (isSavingRef) return;

    // Pedir confirmación antes de guardar
    openProductionAlert({
      type: "confirm",
      customTitle: "Agregar artículo",
      customMessage: `¿Confirmas agregar ${newRef.cantidad} uds de color "${newRef.color}" a la orden?`,
      onConfirmOverride: async () => {
        setIsSavingRef(true);
        try {
          // ✅ Guardar el color usado, igual que hace ProductionForm al crear la orden
          saveProductionColor(newRef.color.trim());
          await ProductionAPIClient.createOrderDetail({
            id_orden: production.id,
            id_producto: production.referencia,
            cantidad: Number(newRef.cantidad),
            color: newRef.color,
          });
          const freshData = await ProductionAPIClient.getOrderById(production.id);
          const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const newDetails = (freshData.detalles || []).map((d) => ({
            id: d.id || d._id,
            refCorte: d.refCorte || d.id_producto || '',
            ref: d.id_producto || '',
            quantity: d.cantidad || 0,
            color: d.color || '—',
            status: freshData.estado || production.status,
            statusDate: today,
            estado: d.estado !== false,
          }));
          const updatedTechSpec = await persistRecalculatedCosts(newDetails, production.techSpecification);
          setProduction((prev) => ({
            ...prev,
            details: newDetails,
            techSpecification: updatedTechSpec,
            history: (freshData.historial || []).map((h) => ({
              status: h.estado,
              date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
              user: h.user || h.id_usuario || 'Sistema',
              motivo: h.motivo,
            })),
            rawData: freshData,
          }));
          setAddRefOpen(false);
          setNewRef({ cantidad: "", color: "" });
          setAddRefError("");
          setGlobalAlert({ open: true, type: "success", title: "Artículo agregado", message: `Se agregaron ${newRef.cantidad} uds de color "${newRef.color}" correctamente.` });
        } catch (err) {
          console.error("Error al agregar referencia:", err);
          setAddRefError("No se pudo agregar el artículo. Intenta de nuevo.");
        } finally {
          setIsSavingRef(false);
        }
      },
    });
  };

  const anuladaEntry = (production.history || []).findLast?.(h => h.status === "Anulada") || [...(production.history || [])].reverse().find(h => h.status === "Anulada");

  const handleAnularDetail = (d) => {
    openProductionAlert({
      type: "confirm",
      customTitle: "Anular artículo",
      customMessage: `¿Deseas anular el artículo ${d.ref} (${d.color}, ${d.quantity} uds)? Se eliminará de la tabla y quedará registrado en el historial.`,
      onConfirmOverride: async (_motivo) => {
        try {
          const today = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });

          await ProductionAPIClient.deleteOrderDetail(d.id);

          const freshData = await ProductionAPIClient.getOrderById(production.id);
          const remainingDetails = freshData.detalles || [];
          const statusDate = freshData.updatedAt
            ? new Date(freshData.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : today;

          if (remainingDetails.length === 0) {
            setTimeout(() => {
              openProductionAlert({
                type: "anular",
                customTitle: "¿Anular orden completa?",
                customMessage: "La orden quedó sin referencias. ¿Deseas anular la orden de producción completa?",
                onConfirmOverride: async (motivo) => {
                  try {
                    await ProductionAPIClient.cancelOrder(production.id, motivo || "Sin referencias");
                    const freshC = await ProductionAPIClient.getOrderById(production.id);
                    const cDate = freshC.updatedAt ? new Date(freshC.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                    setProduction((prev) => ({
                      ...prev, status: 'Anulada', estado: 'Anulada', statusDate: cDate,
                      history: (freshC.historial || []).map((h) => ({ status: h.estado, date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '', user: h.user || h.id_usuario || 'Sistema', motivo: h.motivo })),
                      rawData: freshC,
                    }));
                    setGlobalAlert({ open: true, type: "success", title: "Orden anulada", message: "La orden fue anulada correctamente al quedar sin referencias." });
                  } catch {
                    setGlobalAlert({ open: true, type: "error", title: "Error al anular", message: "No se pudo anular la orden. Intenta de nuevo." });
                  }
                }
              });
            }, 800);
          } else {
            const newDetails = (remainingDetails || []).map((d) => ({
              id: d.id || d._id,
              refCorte: d.refCorte || d.id_producto || '',
              ref: d.id_producto || '',
              quantity: d.cantidad || 0,
              color: d.color || '—',
              status: freshData.estado,
              statusDate,
              estado: d.estado !== false,
            }));
            const updatedTechSpec = await persistRecalculatedCosts(newDetails, production.techSpecification);

            setProduction((prev) => {
              return {
                ...prev,
                details: newDetails,
                techSpecification: updatedTechSpec,
                history: (freshData.historial || []).map((h) => ({
                  status: h.estado,
                  date: h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
                  user: h.user || h.id_usuario || 'Sistema',
                  motivo: h.motivo,
                })),
                rawData: freshData,
              };
            });
            setGlobalAlert({ open: true, type: "success", title: "Artículo eliminado", message: `El artículo ${d.ref} (${d.color}) fue eliminado correctamente. El costo total se actualizó.` });
          }
        } catch (err) {
          console.error('Error al eliminar detalle:', err);
          setGlobalAlert({ open: true, type: "error", title: "Error al eliminar", message: "No se pudo eliminar el artículo. Intenta de nuevo." });
        }
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

        .pd-root { padding: 14px; }
        @media (min-width: 640px)  { .pd-root { padding: 18px 20px; } }
        @media (min-width: 1024px) { .pd-root { padding: 24px 28px; } }

        .pd-main-grid { display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px; }
        @media (min-width: 900px) { .pd-main-grid { grid-template-columns:1fr 300px; } }

        .pd-field-row { display:grid; grid-template-columns:1fr; gap:12px 20px; }
        @media (min-width: 480px) { .pd-field-row { grid-template-columns:1fr 1fr; } }

        .pd-modal-inner { border-radius:18px; padding:20px 18px; width:calc(100vw - 32px); max-width:380px; box-shadow:0 20px 60px rgba(0,0,0,0.25); }
        @media (min-width: 480px) { .pd-modal-inner { padding:28px 28px 24px; } }

        .pd-card { background:#fff; border-radius:14px; box-shadow:0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04), margin-bottom:20 ; }
        .pd-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#FF4FD6; margin-bottom:3px; }
        .pd-value { font-size:13px; font-weight:600; color:#1a1a2e; }
        .pd-badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:10.5px; font-weight:700; letter-spacing:0.03em; }

        .pd-btn-nav { border:1.5px solid #e5e7eb; background:#fff; color:#374151; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; transition:all 0.15s; }
        .pd-btn-nav:hover { border-color:#FF4FD6; color:#FF4FD6; }
        .pd-btn-primary { background:#FF4FD6; color:#fff; border:none; border-radius:9px; padding:7px 16px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:5px; box-shadow:0 4px 12px rgba(255,79,214,0.3); transition:all 0.15s; }
        .pd-btn-primary:hover { background:#d93db8; transform:translateY(-1px); }
        .pd-btn-danger { border:1.5px solid #fca5a5; background:#fff5f5; color:#ef4444; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .pd-btn-danger:hover { background:#fee2e2; }

        .pd-table th { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#9ca3af; padding-bottom:8px; }
        .pd-table td { padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:12.5px; }
        .pd-table tr:last-child td { border-bottom:none; }

        .pd-action-btn { width:26px; height:26px; border-radius:7px; border:1.5px solid #e5e7eb; background:#fafafa; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; color:#9ca3af; }
        .pd-action-btn:hover.edit { border-color:#3b82f6; color:#3b82f6; background:#eff6ff; }
        .pd-action-btn:hover.del { border-color:#ef4444; color:#ef4444; background:#fff5f5; }

        .pd-input { width:100%; border:1.5px solid #e5e7eb; border-radius:9px; padding:8px 12px; font-size:13px; color:#374151; outline:none; transition:border 0.15s; box-sizing:border-box; }
        .pd-input:focus { border-color:#FF4FD6; box-shadow:0 0 0 3px rgba(255,79,214,0.1); }

        .pd-stat-card { border-radius:11px; padding:13px 15px; }

        .pd-hist-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .pd-hist-th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; padding: 0 8px 8px 0; text-align: left; overflow: hidden; }
        .pd-hist-td { padding: 10px 8px 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; }
        .pd-hist-td:last-child { padding-right: 0; }

        .col-hist-estado { width: 28%; }
        .col-hist-fecha  { width: 18%; }
        .col-hist-resp   { width: 24%; }
        .col-hist-motivo { width: 30%; }

        @media (max-width: 640px) {
          .col-hist-motivo { display: none; }
          .col-hist-estado { width: 40%; white-space: normal; }
          .col-hist-fecha  { width: 26%; }
          .col-hist-resp   { width: 34%; }
          .pd-hist-td      { font-size: 11px; }
        }

        .pd-step-label { font-size: 9px; font-weight: 500; text-align: center; line-height: 1.2; }
        .pd-step-sublabel { font-size: 8px; font-weight: 400; display: block; }
        @media (max-width: 480px) {
          .pd-step-label    { font-size: 7px; }
          .pd-step-sublabel { font-size: 6.5px; }
          .pd-step-circle   { width: 20px !important; height: 20px !important; font-size: 8px !important; }
          .pd-btn-nav     { padding: 6px 9px !important; font-size: 11px !important; }
          .pd-btn-primary { padding: 6px 10px !important; font-size: 11px !important; }
          .pd-anular-btn  { margin-left: 0 !important; margin-top: 8px; width: 100%; justify-content: center; }
          .pd-order-header { flex-wrap: wrap; gap: 8px !important; }
        }

        .pd-side-scroll {  flex-direction: column; gap: 14px; max-height: 620px; overflow-y: auto; padding-right: 2px; padding-bottom: 4px; }
        @media (max-width: 900px) {
          .pd-side-scroll { max-height: none; overflow-y: visible; padding-right: 0; }
        }

        .pd-product-top { padding: 18px 20px; display: flex; gap: 18px; align-items: flex-start; max-height: 240px; overflow: hidden; }
        @media (max-width: 480px) {
          .pd-product-top { flex-direction: column; max-height: none; gap: 12px; }
          .pd-product-img-wrap { flex-direction: row !important; align-items: flex-start; }
          .pd-product-main-img { width: 100px !important; height: 130px !important; }
        }

        @media (max-width: 480px) {
          .dist-tooltip, .dist-tt { left: auto !important; right: 0 !important; margin-left: 0 !important; }
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

        {/* ── Mini-modal: Gerente asigna empleado a la etapa actual ── */}
        {asignarModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => !asignandoEmpleado && setAsignarModal(false)}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}
              onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
                Asignar empleado — {production.status}
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                Elige quién trabajará esta etapa. Se le avisará por correo y la orden quedará
                esperando su confirmación antes de poder avanzar.
              </p>
              <select value={empleadoSeleccionado} onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                style={{ width: "100%", fontSize: 13, padding: "9px 10px", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 18 }}>
                <option value="">
                  {empleadosDeEtapa.length === 0 ? `Sin empleados con cargo "${production.status}"` : "Seleccionar empleado..."}
                </option>
                {empleadosDeEtapa.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombreCompleto} {cargaPorEmpleado[e.id] ? `— ${cargaPorEmpleado[e.id]} activa${cargaPorEmpleado[e.id] !== 1 ? 's' : ''}` : ''}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setAsignarModal(false)} disabled={asignandoEmpleado}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}>
                  Cancelar
                </button>
                <button onClick={handleAsignarEmpleado} disabled={!empleadoSeleccionado || asignandoEmpleado}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#FF4FD6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: (!empleadoSeleccionado || asignandoEmpleado) ? "not-allowed" : "pointer", opacity: (!empleadoSeleccionado || asignandoEmpleado) ? 0.5 : 1 }}>
                  {asignandoEmpleado ? "Asignando..." : (empleadoAsignado ? "Reasignar" : "Asignar")}
                </button>
              </div>
            </div>
          </div>
        )}

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
            } catch (e) { console.error('Error creating recovery order:', e); }
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
            <div className="pd-card" style={{ padding: 24, width: "100%", maxWidth: 320, animation: "fadeIn 0.2s ease", marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Agregar talla / artículo</h2>
              <div style={{ marginBottom: 14 }}>
                <div className="pd-label">Cantidad</div>
                <input type="number" min="1" value={newRef.cantidad} onChange={(e) => setNewRef({ ...newRef, cantidad: e.target.value })}
                  placeholder="Ej: 45" className="pd-input" />
              </div>
              <div style={{ marginBottom: 18, position: "relative" }}>
                <div className="pd-label">Color</div>
                <input
                  type="text"
                  value={newRef.color}
                  onChange={(e) => { if (!blockInput.onlyLetters(e)) return; setNewRef({ ...newRef, color: e.target.value }); setAddRefColorOpen(false); }}
                  onFocus={() => addRefSavedColors.length > 0 && setAddRefColorOpen(true)}
                  placeholder="Ej: Rojo"
                  autoComplete="off"
                  className="pd-input"
                />
                {addRefSavedColors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAddRefColorOpen((v) => !v)}
                    style={{ position: "absolute", right: 8, top: 34, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{ transform: addRefColorOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
                {addRefColorOpen && addRefSavedColors.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", marginTop: 2 }}>
                    {addRefSavedColors.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setNewRef({ ...newRef, color: c }); setAddRefColorOpen(false); }}
                        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", border: "none", background: newRef.color === c ? "#fdf4ff" : "#fff", cursor: "pointer", fontSize: 12, color: "#374151", textAlign: "left" }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#e5e7eb", border: "1px solid rgba(0,0,0,0.08)" }} />
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {addRefError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{addRefError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAddRefOpen(false); setNewRef({ cantidad: "", color: "" }); setAddRefError(""); }}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, color: "#6b7280", cursor: "pointer", fontWeight: 600 }}>
                  Cancelar
                </button>
                <button onClick={handleSaveRef} disabled={isSavingRef} className="pd-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "9px 0", opacity: isSavingRef ? 0.6 : 1, cursor: isSavingRef ? "not-allowed" : "pointer" }}>
                  {isSavingRef ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Galería de Imágenes ── */}
        {showImageModal && (() => {
          const designImages = production.designImages || [];
          const finishedImages = production.finishedImages || (production.finishedImageUrl ? [production.finishedImageUrl] : []);
          // ✅ Fix: mismo orden que en la miniatura, para que el índice seleccionado coincida
          const techSheetImage = production.techSpecification?.image
            ? [{ src: production.techSpecification.image, label: "Ficha técnica" }]
            : [];
          const allImages = [
            ...finishedImages.map((s, i) => ({ src: s, label: finishedImages.length > 1 ? `Producto terminado ${i + 1}` : "Producto terminado" })),
            ...techSheetImage,
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
                    <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827" }}>Foto del producto terminado</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Opcional — se mostrará en el detalle</p>
                </div>
              </div>
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: "2px dashed #f9a8d4", borderRadius: 12, padding: "24px 16px", cursor: "pointer", background: "#fdf4ff", marginBottom: 16 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#9333ea" }}>Seleccionar imagen</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>JPG, PNG — máx. 5MB</span>
                <input type="file" accept="image/*" multiple style={{ display: "none" }}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    const MAX_FILE_SIZE = 5 * 1024 * 1024;
                    const MAX_TOTAL_SIZE = 18 * 1024 * 1024;
                    const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE);
                    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
                    if (tooLarge || totalSize > MAX_TOTAL_SIZE) {
                      setGlobalAlert({
                        open: true,
                        type: "error",
                        title: "Imagen demasiado grande",
                        message: tooLarge
                          ? "Cada imagen debe pesar máximo 5MB."
                          : "Selecciona menos imágenes para no superar el límite de carga.",
                      });
                      e.target.value = "";
                      return;
                    }
                    const toBase64 = (file) => new Promise((res) => { const r = new FileReader(); r.onload = (ev) => res(ev.target.result); r.readAsDataURL(file); });
                    try {
                      const bases = await Promise.all(files.map(toBase64));
                      const existingFinished = Array.isArray(production.finishedImages) ? production.finishedImages : (production.finishedImageUrl ? [production.finishedImageUrl] : []);
                      const newFinishedImages = [...existingFinished, ...bases];
                      // Guardar en el servidor
                      await ProductionAPIClient.updateOrder(production.id, {
                        ...production,
                        finishedImages: newFinishedImages,
                        finishedImageUrl: bases[0]
                      });
                      // ✅ Solo actualizar las imágenes sin reemplazar todo el estado mapeado
                      setProduction(prev => ({
                        ...prev,
                        finishedImages: newFinishedImages,
                        finishedImageUrl: bases[0],
                      }));
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
            <div className="pd-card" style={{ width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", margin: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>📋 Ficha Técnica — Orden #{production.orderNumber}</h4>
                  {/* ✅ Se permite editar mientras la orden esté en Diseño o Ficha Técnica */}
                  {(production.status === "Diseño" || production.status === "Ficha Técnica") ? (
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Puedes editar la ficha mientras la orden esté en Diseño o Ficha Técnica</p>
                  ) : (
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Solo lectura · La ficha ya no puede modificarse en este estado</p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!isEmpleado && (production.status === "Diseño" || production.status === "Ficha Técnica") && (
                    <button
                      onClick={() => {
                        // ✅ Pre-cargar el draft con la ficha existente para editarla
                        setTechSheetDraft({ ...production.techSpecification, _totalQty: totalUnidades });
                        setShowTechSheet(false);
                        setShowTechSheetForm(true);
                      }}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #FF4FD6", background: "#fff", color: "#FF4FD6", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      ✏️ Editar ficha
                    </button>
                  )}
                  <button onClick={() => setShowTechSheet(false)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              </div>
              <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
                <TechnicalSheet sheet={production.techSpecification} isEditing={false} productPrice={production.productoPrecio} productImage={production.productImage} />
              </div>
            </div>
          </div>
        )}

        {/* ── Tech Sheet Modal (Create / Edit) ── */}
        {showTechSheetForm && (
          production.tipo === 'diseno' ||
          !production.techSpecification ||
          // ✅ Permitir editar la ficha heredada/existente mientras la orden esté en Diseño o Ficha Técnica
          production.status === "Diseño" ||
          production.status === "Ficha Técnica"
        ) && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
              onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}>
              <div className="pd-card" style={{ width: "100%", maxWidth: 900, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
                onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: "16px 20px", borderBottom: "3px solid #FF4FD6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
                      {production.techSpecification ? "✏️ Editar ficha técnica" : "✏️ Crear ficha técnica"}
                    </h4>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>
                      {production.techSpecification
                        ? "Modifica los datos y guarda los cambios"
                        : "Completa los datos y guarda para desbloquear el avance"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setShowTechSheetForm(false); setTechSheetDraft(null); }}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#555", cursor: "pointer", fontSize: 12 }}>Cancelar</button>
                    <button className="pd-btn-primary"
                      onClick={async () => {
                        if (!techSheetDraft) { setGlobalAlert({ open: true, type: "warning", title: "Ficha vacía", message: "Completa al menos los datos básicos de la ficha antes de guardar." }); return; }
                        try {
                          // ✅ Fix: el costo unitario SIEMPRE viene del precio guardado en
                          // el producto (catálogo), no del valor manual que el usuario haya
                          // podido escribir en el draft. Solo se usa el valor manual como
                          // respaldo si la orden no tiene un producto vinculado con precio.
                          const costPerUnit = (production.productoPrecio > 0)
                            ? production.productoPrecio
                            : (Number(techSheetDraft.costPerUnit) || 0);
                          const newSpec = { ...techSheetDraft, name: techSheetDraft.type || "Ficha técnica", version: (techSheetDraft.versiones ?? techSheetDraft.version) || "1", costPerUnit, totalCost: costPerUnit * totalUnidades, completed: true };
                          await ProductionAPIClient.updateOrder(production.id, {
                            ...production, techSpecification: newSpec
                          });
                          // ✅ Fix: NO usar directamente la respuesta de updateOrder para
                          // reemplazar todo el estado — esa respuesta no trae deliveryDate
                          // formateado (llega como ISO crudo: "2026-08-11T00:00:00.000Z"),
                          // ni details/history en el formato enriquecido que usa la vista
                          // (llegan como detalles/historial planos del backend). Esto hacía
                          // que, al guardar la ficha técnica, el detalle y el historial
                          // desaparecieran momentáneamente y la fecha se viera rota.
                          // En su lugar, solo se actualiza el campo que realmente cambió.
                          setProduction((prev) => ({ ...prev, techSpecification: newSpec }));
                          setShowTechSheetForm(false); setTechSheetDraft(null);
                          setGlobalAlert({ open: true, type: "success", title: "Ficha guardada", message: "La ficha técnica se guardó correctamente." });
                        } catch {
                          setGlobalAlert({ open: true, type: "error", title: "Error al guardar", message: "No se pudo guardar la ficha técnica. Intenta de nuevo." });
                        }
                      }}>
                      💾 Guardar ficha
                    </button>
                  </div>
                </div>
                <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
                  <TechnicalSheet sheet={{ ...(techSheetDraft || {}), _totalQty: totalUnidades }} isEditing={true} onChange={(data) => setTechSheetDraft({ ...data, _totalQty: totalUnidades })} productPrice={production.productoPrecio} productImage={production.productImage} />
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
          {!isAnulada && isGerente && (
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
                      user: h.user || h.id_usuario || 'Sistema', motivo: h.motivo,
                    })),
                    rawData: freshCancelled,
                  };
                  setProduction(cancelledMapped);
                  if (["Corte", "Producción"].includes(production.status)) {
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* ✅ Fix: este botón no tenía ninguna restricción — permitía
                  retroceder incluso desde Recepción/Enviado. Ahora respeta
                  la misma regla que el botón "Anterior": no se puede
                  retroceder una vez que la orden llegó a Recepción. */}
                {isGerente && prevStep && safeStepIndex < stepsReal.indexOf("Recepción") && (
                  <button title="Retroceder (requiere contraseña admin)"
                    onClick={() => openProductionAlert({ type: 'password', targetStep: prevStep, customTitle: 'Revertir estado', customMessage: `Se requiere contraseña de administrador para retroceder al estado "${prevStep}".` })}
                    style={{ width: 28, height: 28, borderRadius: 6, background: '#f3f4f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                )}
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Flujo de Proceso</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {isGerente && prevStep && safeStepIndex < stepsReal.indexOf("Recepción") && (
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
                  ) : !(isGerente || isEmpleado) ? (
                    <button disabled title="Administrador solo observa — no puede avanzar etapas"
                      style={{ padding: "7px 14px", borderRadius: 9, background: "#f3f4f6", color: "#9ca3af", border: "none", fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>
                      Siguiente →
                    </button>
) : (isEmpleado) ? (
                    // El empleado NO avanza el estado — solo CONFIRMA
                    // que terminó su etapa (marca etapaConfirmada: true). Es el
                    // Gerente quien decide cuándo avanzar la orden al siguiente paso.
                    production.etapaConfirmada ? (
                      <button disabled
                        style={{ padding: "7px 14px", borderRadius: 9, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>
                        ✓ Confirmado
                      </button>
                    ) : (
                      <button className="pd-btn-primary"
                        onClick={async () => {
                          try {
                            await ProductionAPIClient.confirmarEtapa(production.id);
                            setProduction((prev) => ({ ...prev, etapaConfirmada: true }));
                            setGlobalAlert({ open: true, type: "success", title: "Etapa confirmada", message: "Tu progreso quedó registrado. El gerente avanzará la orden cuando lo revise." });
                          } catch (err) {
                            setGlobalAlert({ open: true, type: "error", title: "Error al confirmar", message: err?.message || "No se pudo confirmar la etapa." });
                          }
                        }}
                        style={{ background: "#16a34a", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}>
                        Confirmar finalización ✓
                      </button>
                    )
                  ) : (esperandoConfirmacion) ? (
                    <button disabled title={`Esperando que ${empleadoAsignado?.nombreCompleto || 'el empleado asignado'} confirme que terminó`}
                      style={{ padding: "7px 14px", borderRadius: 9, background: "#fff7ed", color: "#c2740a", border: "1px solid #fdba74", fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>
                      Esperando confirmación
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

            {/* ── Empleado asignado a la etapa actual (compacto, sin caja fija) ── */}
            {!isAnulada && requiereAsignacion && (isGerente || empleadoAsignado) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 12, flexWrap: "wrap" }}>
                <span style={{ color: "#9ca3af" }}>Responsable de "{production.status}":</span>
                {empleadoAsignado ? (
                  <>
                    <span style={{ fontWeight: 700, color: "#FF4FD6" }}>{empleadoAsignado.nombreCompleto}</span>
                    {production.etapaConfirmada ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 20 }}>✓ Confirmado</span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#c2740a", background: "#fff7ed", padding: "2px 8px", borderRadius: 20 }}>Pendiente de confirmar</span>
                    )}
                  </>
                ) : (
                  <span style={{ color: "#9ca3af" }}>Sin asignar</span>
                )}
                {isGerente && (
                  <button onClick={() => setAsignarModal(true)}
                    style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #FF4FD6", background: "#fff", color: "#FF4FD6", cursor: "pointer" }}>
                    {empleadoAsignado ? "Reasignar" : "Asignar"}
                  </button>
                )}
              </div>
            )}

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: 13, left: "6.5%", right: "6.5%", height: 1.5, background: "#e5e7eb", zIndex: 0 }} />
              {steps.map((step, i) => {
                const done = i < safeStepIndex;
                const active = i === safeStepIndex;
                return (
                  <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
                    <div
                      className="pd-step-circle"
                      style={{
                        width: 26, height: 26, borderRadius: "50%", border: "2px solid",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                        ...(done ? { background: "#FF4FD6", borderColor: "#FF4FD6", color: "#fff" }
                          : active ? { background: "#fff", borderColor: "#FF4FD6", color: "#FF4FD6", boxShadow: "0 0 0 4px rgba(255,79,214,0.12)" }
                            : { background: "#fff", borderColor: "#e5e7eb", color: "#d1d5db" })
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
                const designImages = production.designImages || [];
                const finishedImages = production.finishedImages || (production.finishedImageUrl ? [production.finishedImageUrl] : []);
                // ✅ Fix: la imagen de la ficha técnica también debe aparecer en
                // el apartado de imagen del detalle de la orden — antes solo se
                // veía dentro del modal de la ficha técnica y nunca aquí.
                const techSheetImage = production.techSpecification?.image
                  ? [{ src: production.techSpecification.image, label: "Ficha técnica" }]
                  : [];
                const allImages = [
                  ...finishedImages.map((s, i) => ({ src: s, label: finishedImages.length > 1 ? `Producto terminado ${i + 1}` : "Producto terminado" })),
                  ...techSheetImage,
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
                            <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
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
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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
                    <div className="pd-label">Prioridad</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {(() => {
                        // ✅ Fix: la prioridad ya no es manual ni un fallback fijo —
                        // se calcula según la cercanía real de fecha_entrega.
                        // Más cerca → prioridad más alta; más lejos → más baja.
                        const fechaEntrega = production.rawData?.fecha_entrega || production.fecha_entrega;
                        let prioridadCalculada = "Media";
                        if (fechaEntrega) {
                          const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                          const entrega = new Date(fechaEntrega); entrega.setHours(0, 0, 0, 0);
                          const diasRestantes = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
                          if (diasRestantes <= 7) prioridadCalculada = "Alta";
                          else if (diasRestantes <= 20) prioridadCalculada = "Media";
                          else prioridadCalculada = "Baja";
                        }
                        const colorDot = prioridadCalculada === "Alta" ? "#ef4444" : prioridadCalculada === "Media" ? "#f59e0b" : "#10b981";
                        return (
                          <>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: colorDot }} />
                            <span className="pd-value">{prioridadCalculada}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="pd-label">Fecha límite</div>
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
                  {!isEmpleado && !isAnulada && !isLocked && (
                    <button className="pd-btn-primary" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 7 }}
                      onClick={() => setAddRefOpen(true)}>
                      + Añadir Talla
                    </button>
                  )}
                </div>
              </div>

              {/* Tabla de referencias */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["Ref-Corte", "Cantidad", "Color", "Estado", ...((!isEmpleado && !isAnulada && !isLocked) ? [""] : [])].map((h, idx) => (
                        <th key={idx} style={{ textAlign: "left", padding: "0 0 6px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#c4c9d4", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortBySize(production.details).map((d, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "7px 8px 7px 0" }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                            {(() => {
                              const rc = d.refCorte || "";
                              const lastDash = rc.lastIndexOf("-");
                              if (lastDash > 0) {
                                const ref = rc.substring(0, lastDash);
                                const num = rc.substring(lastDash + 1);
                                return `${ref} - ${num}`;
                              }
                              return rc;
                            })()}
                          </span>
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
                        {!isEmpleado && !isAnulada && !isLocked && (
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


          <div className="pd-side-scroll">

            {/* ── Ficha Técnica y Costos ── */}
            <div className="pd-card" style={{ padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
                Ficha Técnica y Costos
              </p>

              {production.techSpecification ? (
                <>
                  {/* Badge Aprobada — alineado a la derecha */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#16a34a",
                      background: "#dcfce7", border: "1px solid #bbf7d0",
                      padding: "3px 10px", borderRadius: 20,
                    }}>
                      Aprobada
                    </span>
                  </div>

                  {/* Costos en rosa */}
                  <div style={{ background: "#fce7f3", borderRadius: 9, padding: "12px 14px", marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: "#9d174d", fontWeight: 700, margin: "0 0 4px" }}>
                      COSTO UNIDAD:{" "}
                      <strong style={{ color: "#be185d" }}>
                        ${(production.techSpecification.costPerUnit || 0).toLocaleString("es-CO")}
                      </strong>
                    </p>
                    <p style={{ fontSize: 12, color: "#9d174d", fontWeight: 700, margin: 0 }}>
                      TOTAL:{" "}
                      <strong style={{ color: "#be185d" }}>
                        ${(production.techSpecification.totalCost || 0).toLocaleString("es-CO")}
                      </strong>
                    </p>
                  </div>

                  {/* Botón ver ficha */}
                  <button
                    className="pd-btn-nav"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setShowTechSheet(true)}
                  >
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
                  {!isEmpleado && !isAnulada && (
                    <button className="pd-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowTechSheetForm(true)}>
                      + Crear ficha técnica
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Asignaciones: Terceros + Sedes ── */}
            {(() => {
              const terceros = production.terceroAsignaciones || [];
              const sedes = production.sedeAsignaciones || [];
              const totalT = terceros.reduce((s, a) => s + (Number(a.cantidad) || 0), 0);
              const totalS = sedes.reduce((s, a) => s + (Number(a.cantidad) || 0), 0);

              return (
                <>
                  {/* ── Card Terceros (solo si hay datos) ── */}
                  {terceros.length > 0 && (
                    <div className="pd-card" style={{ padding: 0, marginBottom: 20, marginTop: 20, overflow: "hidden" }}>
                      <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1.5px solid #ede9fe" }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#4c1d95", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Distribución de producción
                        </span>
                      </div>

                      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                        {terceros.map((a, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "9px 12px", borderRadius: 10,
                            background: "#fff", border: "1px solid #ede9fe",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", flex: 1 }}>
                              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round">
                                  <path d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
                                </svg>
                              </div>
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {a.option}
                              </span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed", flexShrink: 0, marginLeft: 8 }}>
                              {Number(a.cantidad).toLocaleString("es-CO")} uds
                            </span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 2, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>
                            Total enviado: <strong style={{ color: "#7c3aed" }}>{totalT.toLocaleString("es-CO")} uds</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Card Sedes ── */}
                  <div className="pd-card" style={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1.5px solid #dcfce7" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#14532d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Distribución por sede
                      </span>
                    </div>

                    {/* Filas de sedes */}
                    <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                      {sedes.length === 0 ? (
                        <p style={{ fontSize: 11, color: "#d1d5db", textAlign: "center", padding: "10px 0", margin: 0 }}>
                          Sin sedes asignadas
                        </p>
                      ) : (
                        <>
                          {sedes.map((a, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "9px 12px", borderRadius: 10,
                              background: "#fff", border: "1px solid #dcfce7",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", flex: 1 }}>
                                <div style={{ width: 22, height: 22, borderRadius: 6, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                  </svg>
                                </div>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {a.option}
                                </span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a", flexShrink: 0, marginLeft: 8 }}>
                                {Number(a.cantidad).toLocaleString("es-CO")} uds
                              </span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 2, marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                              Total enviado: <strong style={{ color: "#16a34a" }}>{totalS.toLocaleString("es-CO")} uds</strong>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── Historial Operativo (últimas 4 entradas) ── */}
            <div className="pd-card" style={{ padding: 16, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                  Historial Operativo
                </p>
                <ClockIcon />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {(production.history || []).slice(-4).reverse().map((h, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 14, position: "relative" }}>
                    {/* Línea vertical conectora */}
                    {i < arr.length - 1 && (
                      <div style={{ position: "absolute", left: 4, top: 16, bottom: 0, width: 1, background: "#f3f4f6" }} />
                    )}
                    {/* Punto magenta */}
                    <div style={{
                      width: 9, height: 9, borderRadius: "50%",
                      background: "#FF4FD6",
                      flexShrink: 0, marginTop: 4,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Nombre del estado */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 700, color: "#111827",
                          margin: "0 0 2px",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {h.status}
                        </p>
                        {/* Tooltip distribución si existe */}
                        {h.distribución && h.distribución.length > 0 && (
                          <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}
                            onMouseEnter={e => e.currentTarget.querySelector('.dist-tooltip').style.display = 'block'}
                            onMouseLeave={e => e.currentTarget.querySelector('.dist-tooltip').style.display = 'none'}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round" style={{ cursor: "pointer", marginBottom: -2 }}>
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" /><line x1="12" y1="11" x2="12" y2="16" />
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
                      {/* Fecha · Usuario */}
                      <p style={{ fontSize: 10.5, color: "#9ca3af", margin: 0 }}>
                        {h.date}
                        {h.user && (
                          <span style={{ color: "#9ca3af" }}> · {h.user}</span>
                        )}
                      </p>
                      {/* Motivo si existe */}
                      {h.motivo && (
                        <p style={{ fontSize: 10, color: "#f59e0b", margin: "2px 0 0", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.motivo}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(production.history || []).length === 0 && (
                  <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "10px 0" }}>Sin historial</p>
                )}
              </div>
            </div>

          </div>{/* /sidebar */}
        </div>{/* /pd-main-grid */}

        {/* ── Historial Completo (expandible) ── */}
        {(production.history || []).length > 4 && (
          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#6b7280", padding: "10px 0" }}>
              <ClockIcon />
              Ver historial completo ({(production.history || []).length} entradas)
            </summary>
            <div className="pd-card" style={{ padding: "16px 20px", marginTop: 8, overflowX: "auto" }}>
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
                      <td className="pd-hist-td col-hist-estado" style={{ paddingRight: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          <span className="pd-badge" style={{ ...statusStyle(h.status), fontSize: 10, whiteSpace: "nowrap" }}>{h.status}</span>
                          {h.distribución && h.distribución.length > 0 && (
                            <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}
                              onMouseEnter={e => e.currentTarget.querySelector('.dist-tt').style.display = 'block'}
                              onMouseLeave={e => e.currentTarget.querySelector('.dist-tt').style.display = 'none'}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4FD6" strokeWidth="2" strokeLinecap="round" style={{ cursor: "pointer" }}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" /><line x1="12" y1="11" x2="12" y2="16" />
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
                      <td className="pd-hist-td col-hist-fecha" style={{ color: "#6b7280" }}>
                        {h.date}
                      </td>
                      <td
                        className="pd-hist-td col-hist-resp"
                        style={{ color: "#374151", fontWeight: 500 }}
                        title={h.user || "—"}>
                        {h.user || "—"}
                      </td>
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