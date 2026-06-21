import React from "react";

const VersionHistory = ({ versions = [], currentVersion = 1, onViewVersion, onDeleteLast }) => {
  if (versions.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#999", fontSize: "13px", margin: 0 }}>
          No hay versiones anteriores
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: "120px",
      }}
    >
      {versions.map((version, index) => {
        const isActive = version.version === currentVersion || index === 0;
        // ✅ Fix defensivo: si por datos antiguos (creados antes de corregir
        // la numeración) existen dos versiones con el mismo número, se
        // distinguen mostrando también la fecha — evita que se vean como
        // "Versión 1" y "Versión 1" indistinguibles entre sí.
        const isDuplicateNumber = versions.filter(v => v.version === version.version).length > 1;
        const dateLabel = version.date ? new Date(version.date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }) : '';

        return (
          <button
            key={version.id}
            onClick={() => onViewVersion(version)}
            title={`Ver Versión ${version.version}${dateLabel ? ` (${dateLabel})` : ''}`}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? "#fff" : "#333",
              backgroundColor: isActive ? "#ff4fd6" : "#fff",
              border: "none",
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "#fdf0f7";
                e.currentTarget.style.color = "#ff4fd6";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.color = "#333";
              }
            }}
          >
            Versión {version.version}{isDuplicateNumber && dateLabel ? ` · ${dateLabel}` : ''}
          </button>
        );
      })}

      {/* Delete last version — shown only when there's exactly one version */}
      {versions.length === 1 && onDeleteLast && (
        <button
          onClick={() => onDeleteLast(versions[0].id)}
          title="Eliminar última versión"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            width: "100%",
            padding: "7px 14px",
            fontSize: "12px",
            color: "#ef4444",
            backgroundColor: "#fff",
            border: "none",
            borderTop: "1px solid #f0f0f0",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          Eliminar
        </button>
      )}
    </div>
  );
};

export default VersionHistory;