/**
 * @file SearchInput.jsx
 * @description Buscador unificado para todos los módulos.
 * Mismo estilo, mismo color de foco (#FF4FD6), mismo ícono.
 *
 * USO:
 *   import SearchInput from "../../shared/components/SearchInput";
 *   <SearchInput value={term} onChange={setTerm} placeholder="Buscar" />
 */
import React from "react";

const SearchInput = ({ value, onChange, placeholder = "Buscar", width = "100%", maxWidth = "280px", isLoading = false }) => {
  const resolvedWidth = width || '100%';
  const isPixelWidth = typeof resolvedWidth === 'string' && resolvedWidth.endsWith('px');
  const isResponsive = maxWidth === '100%';
  const containerStyle = {
    position: "relative",
    width: isResponsive && isPixelWidth ? '100%' : resolvedWidth,
    maxWidth: isResponsive && isPixelWidth ? resolvedWidth : maxWidth,
    minWidth: 0,
    flexShrink: 0,
    display: 'inline-block',
    boxSizing: 'border-box',
  };

  const minWidthStyle = isPixelWidth && !isResponsive ? { minWidth: resolvedWidth } : {};
  const inputFixedWidth = isPixelWidth && !isResponsive ? resolvedWidth : '100%';

  if (isLoading) {
    return (
      <div style={{ ...containerStyle, ...minWidthStyle }}>
        <style>{`@keyframes pskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        <div style={{
          width: inputFixedWidth,
          height: 38,
          borderRadius: 10,
          background: '#f3f4f6',
          border: '1.5px solid #e5e7eb',
          boxSizing: 'border-box',
          flexShrink: 0,
          animation: 'pskeleton-pulse 1.6s ease-in-out infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ ...containerStyle, ...minWidthStyle }}>
      {/* Ícono lupa */}
      <span style={{
        position: "absolute", left: "11px", top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none",
        display: "flex", alignItems: "center",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: inputFixedWidth,
          minWidth: 0,
          flexShrink: 0,
          padding: "9px 14px 9px 34px",
          border: "1.5px solid #e5e7eb",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#333",
          backgroundColor: "#fff",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#FF4FD6")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
};

export default SearchInput;