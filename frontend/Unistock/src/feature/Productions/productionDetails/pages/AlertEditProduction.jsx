import React, { useState } from "react";

const AlertEditProduction = ({ isOpen, onAccept, onCancel }) => {

  const [cantidad, setCantidad] = useState("");
  const [color, setColor] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">

      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">

        <h2 className="text-pink-500 font-semibold text-lg">
          Editar producción
        </h2>

        <div className="flex gap-4 mt-4">

          <div className="flex flex-col w-1/2">
            <label className="text-sm">Cantidad</label>

            <input
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="border rounded p-2"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="text-sm">Color</label>

            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="border rounded p-2"
            >
              <option>Seleccionar</option>
              <option>Rojo</option>
              <option>Negro</option>
              <option>Azul</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-6">

          <button
            onClick={onCancel}
            className="text-gray-500"
          >
            Cancelar
          </button>

          <button
            onClick={() => onAccept({ cantidad, color })}
            className="text-pink-500 font-semibold"
          >
            Guardar
          </button>

        </div>

      </div>

    </div>
  );
};

export default AlertEditProduction;