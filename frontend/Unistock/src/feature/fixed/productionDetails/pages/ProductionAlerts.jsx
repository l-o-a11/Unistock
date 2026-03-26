/**
 * @file ProductionAlerts.jsx
 * @description Modal multipropósito para acciones sobre órdenes de producción.
 *
 * TIPOS SOPORTADOS:
 *   advance    — confirmación simple de cambio de estado
 *   third      — selección de UNO O MÁS terceros + cantidad antes de avanzar
 *   assignSede — selección de UNA O MÁS sedes + cantidad antes de avanzar
 *   confirm    — confirmación de acción destructiva (anular artículo)
 *   anular     — anulación de orden con campo de motivo obligatorio
 */
import React, { useState } from "react";

const TERCEROS_OPCIONES = ["Confección Aurora", "Sorelly Santana", "Taller Rojo", "Bordados Express", "Textil Norte", "Otro"];
const SEDES_OPCIONES    = ["Sede Principal", "Sede Norte", "Sede Sur", "Bodega Central", "Punto de Venta 1", "Punto de Venta 2"];

const ProductionAlerts = ({
  isOpen,
  type,
  targetStep,
  tercero,
  sede,
  onChangeTercero,
  onChangeSede,
  customTitle,
  customMessage,
  onAccept,
  onCancel,
}) => {
  const [motivo, setMotivo] = useState("");

  // Multi-asignación terceros
  const [terceroItems, setTerceroItems] = useState([{ nombre: "", cantidad: "" }]);
  const addTerceroItem    = () => setTerceroItems(p => [...p, { nombre: "", cantidad: "" }]);
  const removeTerceroItem = (i) => setTerceroItems(p => p.filter((_, idx) => idx !== i));
  const updateTerceroItem = (i, field, val) =>
    setTerceroItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  // Multi-asignación sedes
  const [sedeItems, setSedeItems] = useState([{ nombre: "", cantidad: "" }]);
  const addSedeItem    = () => setSedeItems(p => [...p, { nombre: "", cantidad: "" }]);
  const removeSedeItem = (i) => setSedeItems(p => p.filter((_, idx) => idx !== i));
  const updateSedeItem = (i, field, val) =>
    setSedeItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  if (!isOpen) return null;

  const config = {
    advance: {
      title:   customTitle   || "Cambiar estado",
      message: customMessage || (targetStep ? `¿Estás seguro de que deseas avanzar al estado "${targetStep}"?` : "¿Estás seguro de continuar?"),
    },
    third: {
      title:   customTitle   || "Asignar tercero(s)",
      message: customMessage || `¿Estás seguro de asignar tercero(s) para avanzar a "${targetStep}"? Puedes agregar más de uno con su cantidad.`,
    },
    assignSede: {
      title:   customTitle   || "Asignar sede(s) de recepción",
      message: customMessage || `¿Estás seguro de asignar sede(s) para avanzar a "${targetStep}"? Puedes agregar más de una con su cantidad.`,
    },
    confirm: {
      title:   customTitle   || "Confirmar acción",
      message: customMessage || "¿Estás seguro de que deseas continuar con esta acción?",
    },
    anular: {
      title:   customTitle   || "Anular orden",
      message: customMessage || "¿Estás seguro de anular esta orden? Esta acción no se puede deshacer.",
    },
  };

  const { title, message } = config[type] || config.advance;

  const terceroValido = terceroItems.every(t => t.nombre && t.cantidad && Number(t.cantidad) > 0);
  const sedeValida    = sedeItems.every(s => s.nombre && s.cantidad && Number(s.cantidad) > 0);

  const canConfirm =
    (type === "third"      && terceroValido)          ||
    (type === "assignSede" && sedeValida)             ||
    (type === "anular"     && motivo.trim() !== "")   ||
    type === "advance"  ||
    type === "confirm";

  const isDestructive = type === "confirm" || type === "anular";
  const confirmBgEnabled  = isDestructive
    ? "bg-red-500 text-white hover:bg-red-600"
    : "bg-[#E91E8C] text-white hover:bg-[#c9106e]";
  const confirmBgDisabled = "bg-gray-200 text-gray-400 cursor-not-allowed";

  const handleAccept = () => {
    if (type === "third") {
      onChangeTercero(terceroItems.map(t => `${t.nombre} (${t.cantidad} uds)`).join(", "));
    }
    if (type === "assignSede") {
      onChangeSede(sedeItems.map(s => `${s.nombre} (${s.cantidad} uds)`).join(", "));
    }
    onAccept(type === "anular" ? motivo.trim() : "");
    setMotivo("");
    setTerceroItems([{ nombre: "", cantidad: "" }]);
    setSedeItems([{ nombre: "", cantidad: "" }]);
  };

  const handleCancel = () => {
    setMotivo("");
    setTerceroItems([{ nombre: "", cantidad: "" }]);
    setSedeItems([{ nombre: "", cantidad: "" }]);
    onCancel();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl" style={{ fontFamily: "'Nunito', sans-serif", width: type === "third" || type === "assignSede" ? 440 : 384, maxHeight: "90vh", overflowY: "auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />

        {/* Ícono + Título */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
            ${type === "advance"              ? "bg-pink-100"
            : type === "third"               ? "bg-blue-100"
            : type === "assignSede"          ? "bg-green-100"
            : isDestructive                  ? "bg-red-100"
            : "bg-pink-100"}`}>
            {type === "advance" && (
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {type === "third" && (
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            )}
            {type === "assignSede" && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {isDestructive && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
          </div>
          <h2 className={`text-base font-bold ${isDestructive ? "text-red-600" : "text-gray-700"}`}>
            {title}
          </h2>
        </div>

        {/* Mensaje de confirmación */}
        <p className="text-sm text-gray-500 mb-4">{message}</p>

        {/* ── Multi-asignación de TERCEROS ── */}
        {type === "third" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Terceros asignados</label>
            {terceroItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 2 }}>
                  <select
                    value={item.nombre}
                    onChange={(e) => updateTerceroItem(i, "nombre", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Seleccionar tercero...</option>
                    {TERCEROS_OPCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number" min="1"
                    value={item.cantidad}
                    onChange={(e) => updateTerceroItem(i, "cantidad", e.target.value)}
                    placeholder="Cantidad"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                {terceroItems.length > 1 && (
                  <button onClick={() => removeTerceroItem(i)}
                    style={{ width: 30, height: 38, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer", flexShrink: 0, fontSize: 16 }}>
                    ×
                  </button>
                )}
              </div>
            ))}
            <button onClick={addTerceroItem}
              style={{ fontSize: 12, color: "#E91E8C", background: "none", border: "1px dashed #E91E8C", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
              + Agregar otro tercero
            </button>
          </div>
        )}

        {/* ── Multi-asignación de SEDES ── */}
        {type === "assignSede" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Sedes de recepción</label>
            {sedeItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 2 }}>
                  <select
                    value={item.nombre}
                    onChange={(e) => updateSedeItem(i, "nombre", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Seleccionar sede...</option>
                    {SEDES_OPCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number" min="1"
                    value={item.cantidad}
                    onChange={(e) => updateSedeItem(i, "cantidad", e.target.value)}
                    placeholder="Cantidad"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                {sedeItems.length > 1 && (
                  <button onClick={() => removeSedeItem(i)}
                    style={{ width: 30, height: 38, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", color: "#ef4444", cursor: "pointer", flexShrink: 0, fontSize: 16 }}>
                    ×
                  </button>
                )}
              </div>
            ))}
            <button onClick={addSedeItem}
              style={{ fontSize: 12, color: "#E91E8C", background: "none", border: "1px dashed #E91E8C", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
              + Agregar otra sede
            </button>
          </div>
        )}

        {/* ── Campo de motivo de anulación ── */}
        {type === "anular" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Motivo de anulación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo de la anulación..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            {!motivo.trim() && (
              <p className="text-xs text-red-400 mt-1">El motivo es obligatorio para anular</p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-2">
          <button onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition font-medium">
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${canConfirm ? confirmBgEnabled : confirmBgDisabled}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionAlerts;
