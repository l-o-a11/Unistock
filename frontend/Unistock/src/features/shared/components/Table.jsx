// ─────────────────────────────────────────────────────────────
//  shared/BaseTable.jsx
//  Tabla genérica reutilizable para cualquier módulo.
//
//  USO:
//  <BaseTable
//    headers={["Col 1", "Col 2", "Acciones"]}
//    rows={data}
//    renderRow={(item) => (
//      <tr key={item.id}>
//        <td ...>{item.campo}</td>
//      </tr>
//    )}
//    emptyIcon="📦"
//    emptyText="No hay registros"
//  />
//
//  PROPS:
//  · headers     → string[]   — Nombres de las columnas        (editable por tabla)
//  · rows        → array      — Data que viene del padre       (editable por tabla)
//  · renderRow   → function   — Cómo pintar cada fila          (editable por tabla)
//  · emptyIcon   → string     — Emoji cuando no hay datos      (editable por tabla)
//  · emptyText   → string     — Mensaje cuando no hay datos    (editable por tabla)
//
//  ⚠️  NO modificar este archivo.
//      Cada tabla define sus propios headers y renderRow al importarlo.
// ─────────────────────────────────────────────────────────────

import React from "react";

// ── Estilos de celda compartidos — disponibles para importar en cada tabla ──
export const tdClass = "px-5 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap";
export const thClass = "px-5 py-3.5 text-left text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50 whitespace-nowrap";

// ── Helpers de truncado — disponibles para importar en cada tabla ──
export const truncateName = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 2) return fullName;
    return `${parts[0]} ${parts[1]}...`;
};

export const truncateText = (text = "", maxLength = 18) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

// ── Componente base ──
const BaseTable = ({
    headers = [],
    rows = [],
    renderRow,
    emptyIcon = "📄",
    emptyText = "No hay registros para mostrar",
}) => {
    if (rows.length === 0) {
        return (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
                <div className="text-5xl mb-4">{emptyIcon}</div>
                <p className="text-gray-400 text-sm m-0">{emptyText}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {/* ✏️ Los headers los define cada tabla al importar */}
                            {headers.map((header) => (
                                <th key={header} className={thClass}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* ✏️ El renderRow lo define cada tabla al importar */}
                        {rows.map((item) => renderRow(item))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BaseTable;