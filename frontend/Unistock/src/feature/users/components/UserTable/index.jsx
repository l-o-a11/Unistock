import React from "react";
import Table, { tdClass, truncateName, truncateText } from "../../../shared/components/Table";
import HoverCard from "../../../shared/components/HoverCart";

// ✏️ Columnas de esta tabla
const HEADERS = [
  "Tipo de documento",
  "Documento",
  "Nombre",
  "Correo",
  "Rol",
  "Sede",
  "Acciones",
];

const UserTable = ({ users = [], onEdit, onDelete, onToggle }) => {
  const renderRow = (user) => {
    const isActive = user.estado !== false;

    return (
      <tr key={user.id} className="transition-colors duration-150 hover:bg-gray-50">
        <td className={tdClass}>{user.tipoDocumento}</td>
        <td className={tdClass}>{user.numeroDocumento}</td>

        {/* Nombre — dispara el HoverCard */}
        <td className={tdClass}>
          <HoverCard
            title="Información del usuario"
            position="right"
            // ✏️ Campos del tooltip para usuarios
            fields={[
              { label: "Nombre completo", value: user.nombreCompleto, highlight: true },
              { label: "Documento", value: `${user.tipoDocumento} ${user.numeroDocumento}`, highlight: true },
              { label: "Rol", value: user.rol, type: "badge" },
              { label: "Sede", value: user.sede },
              { label: "Estado", value: isActive ? "Activo" : "Inactivo", type: "status" },
            ]}
          >
            <span className="font-medium">{truncateName(user.nombreCompleto)}</span>
          </HoverCard>
        </td>

        <td className={tdClass} title={user.correo}>{truncateText(user.correo)}</td>
        <td className={tdClass}>{user.rol}</td>
        <td className={tdClass} title={user.sede}>{truncateText(user.sede)}</td>

        {/* Acciones */}
        <td className={tdClass}>
          <div className="flex items-center gap-2.5">

            {/* Editar */}
            <button
              onClick={() => onEdit(user)}
              title="Editar usuario"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8b5cf6")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Eliminar */}
            <button
              onClick={() => onDelete(user.id)}
              title="Eliminar usuario"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
              className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors duration-200 ${isActive ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${isActive ? "left-[22px]" : "left-0.5"}`} />
            </button>

          </div>
        </td>
      </tr>
    );
  };

  return (
    <Table
      headers={HEADERS}
      rows={users}
      renderRow={renderRow}
      emptyIcon="👤"
      emptyText="No hay usuarios para mostrar"
    />
  );
};

export default UserTable;