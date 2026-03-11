import { useState, useMemo } from "react";

function SearchInput({ value, onChange, placeholder = "Buscar...", width = "320px", className = "", showIcon = true }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: width }} className={className}>
      {showIcon && (
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// Resalta el texto que coincide con la búsqueda
function Highlight({ text, query }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = String(text).split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ backgroundColor: "#FFE5F9", color: "#C9008D", borderRadius: "3px", padding: "0 2px", fontWeight: 600 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// Demo con tabla integrada
const SAMPLE_DATA = [
  { id: 1, nombre: "Ana García", email: "ana@correo.com", rol: "Admin", estado: "Activo" },
  { id: 2, nombre: "Carlos López", email: "carlos@correo.com", rol: "Editor", estado: "Inactivo" },
  { id: 3, nombre: "María Rodríguez", email: "maria@correo.com", rol: "Viewer", estado: "Activo" },
  { id: 4, nombre: "Juan Martínez", email: "juan@correo.com", rol: "Editor", estado: "Activo" },
  { id: 5, nombre: "Laura Sánchez", email: "laura@correo.com", rol: "Admin", estado: "Inactivo" },
  { id: 6, nombre: "Pedro Fernández", email: "pedro@correo.com", rol: "Viewer", estado: "Activo" },
  { id: 7, nombre: "Sofía Torres", email: "sofia@correo.com", rol: "Editor", estado: "Activo" },
  { id: 8, nombre: "Diego Ramírez", email: "diego@correo.com", rol: "Admin", estado: "Inactivo" },
];

const COLUMNS = ["nombre", "email", "rol", "estado"];
const LABELS = { nombre: "Nombre", email: "Email", rol: "Rol", estado: "Estado" };

export default function App() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return SAMPLE_DATA;
    const q = query.toLowerCase();
    return SAMPLE_DATA.filter((row) =>
      COLUMNS.some((col) => String(row[col]).toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", padding: "32px", maxWidth: "780px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Usuarios</h2>
      <p style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, email, rol..." width="340px" />

      <div style={{ marginTop: "16px", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#fafafa", borderBottom: "1.5px solid #f0f0f0" }}>
              {COLUMNS.map((col) => (
                <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {LABELS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                  Sin resultados para <strong>"{query}"</strong>
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fdfcff", borderBottom: "1px solid #f5f5f5", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFF5FD")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fdfcff")}
                >
                  {COLUMNS.map((col) => (
                    <td key={col} style={{ padding: "12px 16px", color: "#333" }}>
                      {col === "estado" ? (
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                          backgroundColor: row.estado === "Activo" ? "#e6faf0" : "#fef2f2",
                          color: row.estado === "Activo" ? "#15803d" : "#dc2626",
                        }}>
                          <Highlight text={row[col]} query={query} />
                        </span>
                      ) : (
                        <Highlight text={row[col]} query={query} />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}