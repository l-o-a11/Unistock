import React from "react";
import HoverCard from "../HoverCard";
import { StockStatus } from "../../types/constants";

const ProductTable = ({ products = [], onView, onEdit, onDelete, onToggle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock < StockStatus.Critical.threshold) return StockStatus.Critical;
    if (stock < StockStatus.Low.threshold) return StockStatus.Low;
    return StockStatus.Normal;
  };

  const thStyle = {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: "nowrap",
    backgroundColor: "#f5f5f5",
  };

  const tdStyle = {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #f5f5f5",
    whiteSpace: "nowrap",
  };

  if (products.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "64px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <p style={{ color: "#999", fontSize: "15px", margin: 0 }}>No hay productos para mostrar</p>
      </div>
    );
  }

  // Función para determinar si un texto necesita hover
  const needsHover = (text) => {
    return text && text.length > 12;
  };

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Imagen</th>
              <th style={thStyle}>Referencia</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Precio</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Acciónes</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const isActive = product.active !== false;

              return (
                <tr
                  key={product.id}
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Imagen - SIEMPRE tiene hover porque muestra la imagen grande */}
                  <td style={tdStyle}>
                    <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "8px", color: "#333" }}>Imagen del producto</p><img src={product.image} alt={product.name} style={{ width: "128px", height: "128px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} /><p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>REF: {product.reference}</p></div>}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", flexShrink: 0 }}>
                        <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </HoverCard>
                  </td>

                  {/* Referencia - HOVER SOLO si tiene más de 12 caracteres */}
                  <td style={tdStyle}>
                    {needsHover(product.reference) ? (
                      <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>Referencia completa</p><p style={{ fontSize: "13px", color: "#555" }}>{product.reference}</p><p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>Código: {product.id}</p></div>}>
                        <span style={{ cursor: "help", color: "#333" }}>{product.reference}</span>
                      </HoverCard>
                    ) : (
                      <span style={{ color: "#333" }}>{product.reference}</span>
                    )}
                  </td>

                  {/* Nombre - HOVER SOLO si tiene más de 12 caracteres */}
                  <td style={tdStyle}>
                    {needsHover(product.name) ? (
                      <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>Información del producto</p><p style={{ fontSize: "13px", color: "#555" }}>{product.name}</p><p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>Categoría: <strong>{product.category}</strong></p><p style={{ fontSize: "11px", color: "#999" }}>Versiones: <strong>{product.technicalSheetVersions || 1}</strong></p></div>}>
                        <span style={{ cursor: "help" }}>
                          {product.name && product.name.length > 12 ? product.name.slice(0, 12) + "..." : product.name}
                        </span>
                      </HoverCard>
                    ) : (
                      <span>{product.name}</span>
                    )}
                  </td>

                  {/* Categoría - HOVER SOLO si tiene más de 12 caracteres (raro, pero por si acaso) */}
                  <td style={tdStyle}>
                    {needsHover(product.category) ? (
                      <HoverCard content={<div><p style={{ fontWeight: "600", marginBottom: "6px", color: "#333" }}>Categoría</p><p style={{ fontSize: "13px", color: "#555" }}>{product.category}</p></div>}>
                        <span style={{ cursor: "help" }}>{product.category}</span>
                      </HoverCard>
                    ) : (
                      <span>{product.category}</span>
                    )}
                  </td>

                  {/* Precio - NUNCA tiene hover porque siempre es corto */}
                  <td style={tdStyle}>
                    <span>{formatPrice(product.price)}</span>
                  </td>

                  {/* Stock - NUNCA tiene hover porque siempre es un número */}
                  <td style={tdStyle}>
                    <span>{product.stock}</span>
                  </td>

                  {/* Acciones - SIN CAMBIOS */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                      {/* ⓘ info */}
                      <button onClick={() => onView(product)} title="Ver ficha técnica"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4fd6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" />
                          <line x1="12" y1="12" x2="12" y2="16" />
                        </svg>
                      </button>

                      {/* ✏️ edit */}
                      <button onClick={() => onEdit(product)} title="Editar producto"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4fd6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* 🗑️ delete */}
                      <button onClick={() => onDelete(product.id)} title="Eliminar producto"
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

                      {/* ⚪ Toggle switch - GRIS cuando desactivado */}
                      <button
                        onClick={() => onToggle?.(product.id)}
                        title={isActive ? "Desactivar" : "Activar"}
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          backgroundColor: isActive ? "#22c55e" : "#9ca3af",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          flexShrink: 0,
                          transition: "background-color 0.2s",
                        }}
                      >
                        {/* Knob */}
                        <span style={{
                          position: "absolute",
                          left: isActive ? "22px" : "2px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                          transition: "left 0.2s",
                        }} />
                        {/* Checkmark — only when active */}
                        {isActive && (
                          <svg
                            style={{ position: "absolute", left: "5px", width: "11px", height: "11px", color: "#fff", pointerEvents: "none" }}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;