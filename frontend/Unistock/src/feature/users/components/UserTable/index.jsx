import React, { useState } from "react";
import Table, { tdClass, truncateName, truncateText } from "../../../shared/components/Table";
import HoverCard from "../../../shared/components/HoverCart";
import Alert from "../Alert";

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

  // ── Alerta de cambio de estado (requiere contraseña) ──────────────────────
  const [toggleAlert, setToggleAlert] = useState({ open: false, id: null, newStatus: null });

  const handleToggleClick = (user) => {
    const isActive = user.estado !== false;
    setToggleAlert({
      open: true,
      id: user.id,
      newStatus: !isActive,
    });
  };

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
            fields={[
              { label: "Nombre completo", value: user.nombreCompleto, highlight: true },
              { label: "Documento",       value: `${user.tipoDocumento} ${user.numeroDocumento}`, highlight: true },
              { label: "Rol",             value: user.rol,  type: "badge"   },
              { label: "Sede",            value: user.sede                  },
              { label: "Estado",          value: isActive ? "Activo" : "Inactivo", type: "status" },
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

            {/* Toggle — pide contraseña antes de cambiar estado */}
            <button
              onClick={() => handleToggleClick(user)}
              title={isActive ? "Desactivar usuario" : "Activar usuario"}
              style={{
                position: "relative",
                width: "44px",
                height: "24px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: isActive ? "22px" : "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "0.2s",
                }}
              />
            </button>

          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Table
        headers={HEADERS}
        rows={users}
        renderRow={renderRow}
        emptyIcon="👤"
        emptyText="No hay usuarios para mostrar"
      />

      {/* Alerta de contraseña para cambio de estado */}
      <Alert
        isOpen={toggleAlert.open}
        type="password"
        title={toggleAlert.newStatus ? "Activar usuario" : "Inactivar usuario"}
        message={
          toggleAlert.newStatus
            ? "Para activar este usuario ingresa la contraseña de administrador."
            : "Para inactivar este usuario ingresa la contraseña de administrador."
        }
        onCancel={() => setToggleAlert({ open: false, id: null, newStatus: null })}
        onConfirm={() => {
          onToggle?.(toggleAlert.id);
          setToggleAlert({ open: false, id: null, newStatus: null });
        }}
      />
    </>
  );
};

export default UserTable;
