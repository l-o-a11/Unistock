import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import HoverCard from "../HoverCard";
import { Shield, Mail, User, Calendar } from "lucide-react";

const UserDetail = ({ user, onClose, onEdit }) => {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  if (!user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">

        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold flex items-center">
              <User className="mr-2" size={20} />
              Detalle del Usuario
            </h3>

            <button
              onClick={onClose}
              className="text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-4">

            {/* Usuario */}
            <HoverCard
              content={
                <div className="space-y-1 text-sm">
                  <p><b>ID:</b> {user.id}</p>
                  <p><b>Correo:</b> {user.email}</p>
                </div>
              }
            >
              <div className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">

                <div>
                  <p className="text-xs text-gray-500 uppercase">Usuario</p>
                  <p className="font-semibold text-lg">{user.nombre}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Correo</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>

              </div>
            </HoverCard>

            {/* Rol */}
            <HoverCard
              content={
                <div className="text-sm">
                  <p className="font-medium">Permisos del rol</p>
                  <p className="text-gray-600">
                    Este usuario hereda permisos del rol asignado.
                  </p>
                </div>
              }
            >
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">

                <div className="flex items-center">
                  <Shield className="text-purple-600 mr-2" size={18} />
                  <div>
                    <p className="text-xs text-purple-600 uppercase">Rol</p>
                    <p className="font-semibold text-gray-800">
                      {user.rol?.nombre || "Sin rol"}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-500">
                  #{user.rol?.id}
                </span>

              </div>
            </HoverCard>

            {/* Información extra */}
            <div className="grid grid-cols-2 gap-4">

              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Estado</p>
                <p className="font-medium">
                  {user.activo ? "Activo" : "Inactivo"}
                </p>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Creado</p>
                <p className="font-medium">
                  {user.createdAt || "—"}
                </p>
              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">

            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              Cerrar
            </button>

            <button
              onClick={() => onEdit(user)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Editar Usuario
            </button>

          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};

export default UserDetail;