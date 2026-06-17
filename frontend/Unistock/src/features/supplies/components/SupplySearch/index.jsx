import React, { useState } from "react";

const SupplySearch = ({
  value,
  onChange,
  placeholder = "Buscar...",
  helpText,
  suggestions = [],
}) => {
  const [open, setOpen] = useState(false);

  const showSuggestions = open && suggestions.length > 0;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
      {/* Input wrapper */}
      <div style={{ position: "relative" }}>
        {/* Lupa */}
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#aaaaaa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={(e) => {
            setOpen(true);
            e.target.style.borderColor = "#c084fc";
            e.target.style.boxShadow = "0 0 0 4px rgba(192, 132, 252, 0.1)";
          }}
          onBlur={(e) => {
            // Delay para que onMouseDown del botón se ejecute primero
            setTimeout(() => setOpen(false), 150);
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
          style={{
            width: "100%",
            padding: "10px 32px 10px 36px",
            border: "1.5px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "14px",
            color: "#333",
            backgroundColor: "#fff",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />

        {/* Botón X para limpiar */}
        {value && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange("");
            }}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#aaa",
              fontSize: "16px",
              lineHeight: 1,
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias — fuera del flujo del helpText */}
      {showSuggestions && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "6px",
            borderRadius: "10px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.10)",
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion);
                setOpen(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: "#4b5563",
                cursor: "pointer",
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fdf4ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Ícono de búsqueda en cada sugerencia */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {suggestion}
            </button>
          ))}

          {helpText && (
            <div
              style={{
                padding: "6px 10px 2px",
                fontSize: "11px",
                color: "#c084fc",
                borderTop: "1px solid #f3e8ff",
                marginTop: "4px",
              }}
            >
              {helpText}
            </div>
          )}
        </div>
      )}

      {/* helpText fuera del dropdown, solo cuando no hay sugerencias */}
      {!showSuggestions && helpText && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#9ca3af",
            lineHeight: "1.4",
          }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
};

export default SupplySearch;