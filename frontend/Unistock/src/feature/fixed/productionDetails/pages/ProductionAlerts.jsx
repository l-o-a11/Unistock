/**
 * @file ProductionAlerts.jsx
 * @description Modal multipropósito para acciones sobre órdenes de producción.
 *
 * TIPOS SOPORTADOS:
 *   advance    — confirmación simple de cambio de estado
 *   third      — selección de tercero antes de avanzar
 *   assignSede — selección de sede antes de avanzar
 *   confirm    — confirmación de acción destructiva (anular artículo)
 *   anular     — anulación de orden con campo de motivo obligatorio
 *                Al confirmar llama onAccept(motivo) con el texto ingresado.
 *
 * CORRECCIÓN ALERTA DE ANULACIÓN:
 *   Antes se usaba prompt() nativo que bloqueaba el hilo y no permitía que el
 *   modal se cerrara visualmente antes de ejecutar la acción. Ahora el tipo
 *   "anular" muestra el campo de motivo DENTRO del mismo modal, y al confirmar
 *   llama onAccept(motivo) para que ProductionDetailsPage ejecute la anulación.
 */
import React, { useState } from "react";

const TERCEROS = ["Confección Aurora", "Sorelly Santana", "Taller Rojo", "Otro"];
const SEDES    = ["Sede Principal", "Sede Norte", "Sede Sur", "Bodega Central"];

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
  onAccept,   // recibe (motivo) cuando type === "anular", () en los demás
  onCancel,
}) => {
  // Campo de motivo — solo activo en type === "anular"
  const [motivo, setMotivo] = useState("");

  if (!isOpen) return null;

  // Limpiar motivo al cerrar se maneja externamente; aquí solo gestionamos el local

  // ── Configuración de título y mensaje por tipo ───────────────────────────
  const config = {
    advance: {
      title:   customTitle   || "Cambiar estado",
      message: customMessage || (targetStep ? `¿Deseas avanzar al estado "${targetStep}"?` : "¿Deseas continuar?"),
    },
    third: {
      title:   customTitle   || "Asignar tercero",
      message: customMessage || `Para avanzar a "${targetStep}" debes asignar un tercero.`,
    },
    assignSede: {
      title:   customTitle   || "Asignar sede",
      message: customMessage || `Para avanzar a "${targetStep}" debes asignar una sede de recepción.`,
    },
    // Confirmación simple: anular artículo, eliminar referencia, etc.
    confirm: {
      title:   customTitle   || "Confirmar acción",
      message: customMessage || "¿Deseas continuar con esta acción?",
    },
    // Anulación de orden: requiere motivo
    anular: {
      title:   customTitle   || "Anular orden",
      message: customMessage || "¿Deseas anular esta orden de producción? Esta acción no se puede deshacer.",
    },
  };

  const { title, message } = config[type] || config.advance;

  // ── Condición de habilitación del botón Confirmar ────────────────────────
  const canConfirm =
    (type === "third"      && !!tercero)          ||
    (type === "assignSede" && !!sede)             ||
    (type === "anular"     && motivo.trim() !== "") ||
    type === "advance"  ||
    type === "confirm";

  // ── Color de acento según tipo ───────────────────────────────────────────
  // Rojo para acciones destructivas, pink para avances normales
  const isDestructive = type === "confirm" || type === "anular";
  const confirmBgEnabled  = isDestructive ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                                           : "bg-[#E91E8C] text-white hover:bg-[#c9106e] shadow-pink-200";
  const confirmBgDisabled = "bg-gray-200 text-gray-400 cursor-not-allowed";

  // ── Handler de confirmación ──────────────────────────────────────────────
  const handleAccept = () => {
    // Para tipo "anular" pasa el motivo; para los demás pasa vacío
    onAccept(type === "anular" ? motivo.trim() : "");
    setMotivo(""); // limpiar para próxima vez
  };

  const handleCancel = () => {
    setMotivo("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />

        {/* ── Ícono + Título ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
            ${type === "advance"              ? "bg-pink-100"
            : type === "third"               ? "bg-blue-100"
            : type === "assignSede"          ? "bg-green-100"
            : isDestructive                  ? "bg-red-100"
            : "bg-pink-100"}`}>

            {/* Flecha derecha — advance */}
            {type === "advance" && (
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {/* Persona — third */}
            {type === "third" && (
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            )}
            {/* Pin — assignSede */}
            {type === "assignSede" && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {/* Exclamación — confirm y anular */}
            {isDestructive && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
          </div>

          {/* Título: rojo en destructivos, gris en los demás */}
          <h2 className={`text-base font-bold ${isDestructive ? "text-red-600" : "text-gray-700"}`}>
            {title}
          </h2>
        </div>

        {/* ── Mensaje ── */}
        <p className="text-sm text-gray-500 mb-4">{message}</p>

        {/* ── Selector de tercero ── */}
        {type === "third" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tercero asignado</label>
            <select value={tercero} onChange={(e) => onChangeTercero(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300">
              <option value="">Seleccionar tercero...</option>
              {TERCEROS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {/* ── Selector de sede ── */}
        {type === "assignSede" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Sede de recepción</label>
            <select value={sede} onChange={(e) => onChangeSede(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300">
              <option value="">Seleccionar sede...</option>
              {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* ── Campo de motivo de anulación — solo para type="anular" ── */}
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
              style={{ borderColor: motivo.trim() ? "#e5e7eb" : undefined }}
            />
            {!motivo.trim() && (
              <p className="text-xs text-red-400 mt-1">El motivo es obligatorio para anular</p>
            )}
          </div>
        )}

        {/* ── Botones ── */}
        <div className="flex justify-end gap-3 mt-2">
          <button onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition font-medium">
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm
              ${canConfirm ? confirmBgEnabled : confirmBgDisabled}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionAlerts;
