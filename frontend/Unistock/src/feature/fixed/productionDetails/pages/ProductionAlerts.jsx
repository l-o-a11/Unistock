import React from "react";

const TERCEROS = ["Confección Aurora", "Sorelly Santana", "Taller Rojo", "Otro"];
const SEDES = ["Sede Principal", "Sede Norte", "Sede Sur", "Bodega Central"];

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
  if (!isOpen) return null;

  // Configuración base por tipo
  const config = {
    advance: {
      title: customTitle || "Cambiar estado",
      message: customMessage || (targetStep ? `¿Deseas avanzar al estado "${targetStep}"?` : "¿Deseas continuar?"),
    },
    third: {
      title: "Asignar tercero",
      message: `Para avanzar a "${targetStep}" debes asignar un tercero.`,
    },
    assignSede: {
      title: "Asignar sede",
      message: `Para avanzar a "${targetStep}" debes asignar una sede de recepción.`,
    },
  };

  const { title, message } = config[type] || config.advance;

  // Validación: no se puede confirmar si faltan datos requeridos
  // canConfirm: el botón de confirmar se habilita para todos los tipos excepto
  // "third" y "assignSede" cuando aún no se ha seleccionado el valor requerido.
  // CORRECCIÓN: se agregó el tipo "confirm" (usado en eliminación de artículos)
  // para que el botón quede habilitado y la acción pueda ejecutarse.
  const canConfirm =
    (type === "third" && tercero) ||
    (type === "assignSede" && sede) ||
    type === "advance"  ||
    type === "confirm";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />

        {/* Ícono según tipo */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center
            ${type === "advance" ? "bg-pink-100" : type === "third" ? "bg-blue-100" : "bg-green-100"}`}>
            {type === "advance" && (
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {type === "third" && (
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            )}
            {type === "assignSede" && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-base font-bold text-gray-700">{title}</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">{message}</p>

        {/* Input para tercero */}
        {type === "third" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tercero asignado</label>
            <select
              value={tercero}
              onChange={(e) => onChangeTercero(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="">Seleccionar tercero...</option>
              {TERCEROS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {/* Input para sede */}
        {type === "assignSede" && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Sede de recepción</label>
            <select
              value={sede}
              onChange={(e) => onChangeSede(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="">Seleccionar sede...</option>
              {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm
              ${canConfirm
                ? "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200"
                : "bg-pink-200 text-white cursor-not-allowed"}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionAlerts;