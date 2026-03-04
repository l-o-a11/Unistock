import React from "react";
import HoverCard from "../HoverCard";

const truncateName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[1]}...`;
};

const truncateEmail = (email = "", maxLength = 18) => {
  if (email.length <= maxLength) return email;
  return email.slice(0, maxLength) + "...";
};

const truncateText = (text = "", maxLength = 12) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const UserTable = ({ users = [], onEdit, onDelete, onToggle }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl p-16 text-center shadow-sm">
        <div className="text-5xl mb-4">👤</div>
        <p className="text-gray-400 text-sm m-0">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Tipo de documento", "Documento", "Nombre", "Correo", "Rol", "Sede", "Acciones"].map((header) => (
                <th
                  key={header}
                  className="px-5 py-3.5 text-left text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const isActive = user.estado !== false;

              return (
                <tr
                  key={user.id}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">
                    {user.tipoDocumento}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">
                    {user.numeroDocumento}
                  </td>

                  {/* Nombre con HoverCard */}
                  <td className="px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">
                    <HoverCard
                      position="right"
                      content={
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-2">
                            Información del usuario
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{user.nombreCompleto}</p>
                          <p className="text-xs text-gray-500 my-1">
                            Documento:{" "}
                            <strong className="text-gray-700">
                              {user.tipoDocumento} {user.numeroDocumento}
                            </strong>
                          </p>
                          <p className="text-xs text-gray-500 my-1">
                            Rol: <strong className="text-gray-700">{user.rol}</strong>
                          </p>
                          <p className="text-xs text-gray-500 my-1">
                            Sede: {user.sede}
                          </p>
                          <hr className="my-3 border-gray-300" />
                          <p className="text-xs text-gray-400 m-0">
                            Estado actual · {isActive ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                      }
                    >
                      <span className="font-medium cursor-pointer">
                        {truncateName(user.nombreCompleto)}
                      </span>
                    </HoverCard>
                  </td>

                  {/* Correo truncado */}
                  <td
                    className="px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis"
                    title={user.correo}
                  >
                    {truncateEmail(user.correo)}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">
                    {user.rol}
                  </td>

                  {/* Sede truncada */}
                  <td
                    className="px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis"
                    title={user.sede}
                  >
                    {truncateText(user.sede)}
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4 text-sm border-b border-gray-100 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">

                      {/* Editar */}
                      <button
                        onClick={() => onEdit(user)}
                        title="Editar usuario"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#555",
                          display: "flex",
                          alignItems: "center"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => onDelete(user.id)}
                        title="Eliminar usuario"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#555",
                          display: "flex",
                          alignItems: "center"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>

                      {/* Toggle activo/inactivo */}
                      <button
                        onClick={() => onToggle?.(user.id)}
                        title={isActive ? "Desactivar usuario" : "Activar usuario"}
                        className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors duration-200 ${isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${isActive ? "left-[22px]" : "left-0.5"
                            }`}
                        />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;