import React from "react";
import Table, { tdClass, truncateName, truncateText } from "../../../shared/components/Table";
import HoverCard from "../../../shared/components/HoverCart";

const HEADERS = [
    "Tipo de documento",
    "Documento",
    "Nombre",
    "Correo",
    "Rol",
    "Sede",
    "Acciones",
];

const EmployeeTable = ({ employees = [], roles = [], sedes = [], onEdit, onDelete, onToggle }) => {
    const renderRow = (employee) => {
        const isActive = employee.estado !== false;

        // Prioridad 1: usar rolNombre/sedeNombre que ya vienen del backend (populate)
        // Prioridad 2: cruzar con el catálogo por ID (fallback con String() para comparar ObjectIds)
        const roleName =
            employee.rolNombre ||
            roles.find((r) => String(r.id) === String(employee.rolId ?? employee.rol))?.nombre ||
            "—";
        const sedeName =
            employee.sedeNombre ||
            sedes.find((s) => String(s.id) === String(employee.sedeId ?? employee.sede))?.nombre ||
            "—";

        return (
            <tr key={employee.id} className="transition-colors duration-150 hover:bg-gray-50">
                <td className={tdClass}>{employee.tipoDocumento}</td>
                <td className={tdClass}>{employee.numeroDocumento}</td>

                <td className={tdClass}>
                    <HoverCard
                        title="Información del empleado"
                        position="right"
                        fields={[
                            { label: "Nombre completo", value: employee.nombreCompleto, highlight: true },
                            { label: "Documento", value: `${employee.tipoDocumento} ${employee.numeroDocumento}`, highlight: true },
                            { label: "Rol", value: roleName },
                            { label: "Sede", value: sedeName },
                            { label: "Estado", value: isActive ? "Activo" : "Inactivo", type: "status" },
                        ]}
                    >
                        <span className="font-medium">{truncateName(employee.nombreCompleto)}</span>
                    </HoverCard>
                </td>

                <td className={tdClass} title={employee.correo}>{truncateText(employee.correo)}</td>
                <td className={tdClass} title={roleName}>{truncateText(roleName)}</td>
                <td className={tdClass} title={sedeName}>{truncateText(sedeName)}</td>

                <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                        {/* Editar */}
                        <button
                            onClick={() => onEdit(employee)}
                            title="Editar empleado"
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
                            onClick={() => onDelete(employee.id)}
                            title="Eliminar empleado"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                        </button>

                        {/* Toggle */}
                        <button
                            onClick={() => onToggle?.(employee.id)}
                            title={isActive ? "Desactivar" : "Activar"}
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
            rows={employees}
            renderRow={renderRow}
            emptyIcon="👷"
            emptyText="No hay empleados para mostrar"
        />
    );
};

export default EmployeeTable;