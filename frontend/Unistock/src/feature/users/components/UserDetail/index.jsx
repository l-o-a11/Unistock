import React from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import HoverCard from "../HoverCard";

const UserDetail = ({ user, onClose, onEdit }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">👤</span>
              Detalle del Usuario
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          {/* Contenido */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* TODO tu contenido actual aquí SIN cambiar nada */}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit(user)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Editar Usuario
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetail;