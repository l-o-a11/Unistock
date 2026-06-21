function SearchInput({
  value,
  onChange,
  placeholder = "Buscar",
  width = "320px",
  className = "",
  showIcon = true,
}) {
  return (
    <div
      style={{ position: "relative", width: "100%", maxWidth: width }}
      className={className}
    >
      {showIcon && (
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
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: showIcon ? "9px 16px 9px 36px" : "9px 16px",
          border: "1.5px solid #e5e7eb",
          borderRadius: "8px",
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
}

export default SearchInput;
