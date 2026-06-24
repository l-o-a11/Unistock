import React, { useState, useEffect } from "react";

const AlertEditProduction = ({ isOpen, detail, onAccept, onCancel }) => {
  const [cantidad, setCantidad] = useState("");
  const [color, setColor]    = useState("");


  // ✅ Fix: pre-poblar con los valores actuales del detail al abrir
  useEffect(() => {
    if (isOpen && detail) {
      setCantidad(String(detail.quantity || ""));
      setColor(detail.color || "");
    }
  }, [isOpen, detail]);

  if (!isOpen) return null;

  const COLORS = ["Rojo", "Negro", "Azul", "Blanco", "Verde", "Amarillo", "Rosado", "Gris"];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
            </svg>
          </div>
          <h2 className="text-pink-500 font-semibold text-lg">
            Editar referencia {detail?.ref}
          </h2>
        </div>

        <div className="flex gap-4 mt-2">
          <div className="flex flex-col w-1/2">
            <label className="text-xs font-semibold text-gray-500 mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 100"
              className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label className="text-xs font-semibold text-gray-500 mb-1">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="">Seleccionar</option>
              {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onAccept({ cantidad, color })}
            disabled={!cantidad || !color}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
              ${cantidad && color
                /* Botón Guardar: color único #FF4FD6 sin gradiente */
                ? 'text-white hover:opacity-90 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            style={cantidad && color ? { backgroundColor: '#FF4FD6' } : {}}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertEditProduction;