import React from "react";

const SupplySearch = ({
  value,
  onChange,
  placeholder = "Buscar...",
  helpText,
  suggestions = [],
}) => {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
      {/* Magnifying glass icon */}
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
        style={{
          width: "100%",
          padding: "10px 16px 10px 36px",
          border: "1.5px solid #e5e7eb",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#333",
          backgroundColor: "#fff",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#c084fc";
          e.target.style.boxShadow = "0 0 0 4px rgba(192, 132, 252, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e5e7eb";
          e.target.style.boxShadow = "none";
        }}
      />

      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 10,
            display: "grid",
            gap: "4px",
            padding: "6px",
            borderRadius: "10px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion);
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
                transition: "background 0.2s, color 0.2s",
                fontSize: "13px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {helpText && (
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
