import React, { useState } from "react";
import HoverCard from "../../../shared/components/HoverCart";
import Alert from "../../../shared/components/Alert";
import { StockStatus } from "../../types/constants";

const ProductTable = ({ products = [], onView, onEdit, onDelete, onToggle }) => {
  /* 🔥 ESTADOS PARA ALERTA DE CAMBIO DE ESTADO */
  const [showToggleAlert, setShowToggleAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

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

  // Función para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          overflowX: "visible",
        }}>
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
                    {/* Imagen */}
                    <td style={tdStyle}>
                      <HoverCard
                        title="Imagen del producto"
                        position="right"
                        fields={[
                          {
                            label: "Imagen",
                            value: product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                style={{ width: "128px", height: "128px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }}
                              />
                            ) : (
                              <div style={{
                                width: "128px",
                                height: "128px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                                border: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#999",
                                fontSize: "14px"
                              }}>
                                Sin imagen
                              </div>
                            ),
                            highlight: true
                          },
                        ]}
                      >
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid #eee", cursor: "pointer", flexShrink: 0 }}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#aaa",
                              fontSize: "10px"
                            }}>
                              🖼️
                            </div>
                          )}
                        </div>
                      </HoverCard>
                    </td>

                    {/* Referencia */}
                    <td style={tdStyle}>
                      {needsHover(product.reference) ? (
                        <HoverCard
                          title="Referencia completa"
                          position="right"
                          fields={[
                            { label: "Referencia", value: product.reference, highlight: true },
                            { label: "ID", value: product.id, type: "badge" }
                          ]}
                        >
                          <span style={{ cursor: "help", color: "#333" }}>
                            {truncateText(product.reference, 15)}
                          </span>
                        </HoverCard>
                      ) : (
                        <span style={{ color: "#333" }}>{product.reference}</span>
                      )}
                    </td>

                    {/* Nombre - SOLO EL NOMBRE COMPLETO */}
                    <td style={tdStyle}>
                      {needsHover(product.name) ? (
                        <HoverCard
                          title="Información producto"
                          position="right"
                          fields={[
                            { label: "Nombre", value: product.name, highlight: true }
                          ]}
                        >
                          <span style={{ cursor: "help" }}>
                            {truncateText(product.name, 12)}
                          </span>
                        </HoverCard>
                      ) : (
                        <span>{product.name}</span>
                      )}
                    </td>

                    {/* Categoría */}
                    <td style={tdStyle}>
                      {needsHover(product.category) ? (
                        <HoverCard
                          title="Categoría"
                          position="right"
                          fields={[
                            { label: "Categoría", value: product.category, highlight: true }
                          ]}
                        >
                          <span style={{ cursor: "help" }}>
                            {truncateText(product.category, 12)}
                          </span>
                        </HoverCard>
                      ) : (
                        <span>{product.category}</span>
                      )}
                    </td>

                    {/* Precio */}
                    <td style={tdStyle}>
                      <span>{formatPrice(product.price)}</span>
                    </td>

                    {/* Stock */}
                    <td style={tdStyle}>
                      <span>{product.stock}</span>
                    </td>

                    {/* ACCIONES */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                        {/* ⓘ info - VER FICHA TÉCNICA */}
                        <button onClick={() => onView(product)} title="Ver ficha técnica"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4fd6")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.5" />
                            <line x1="12" y1="12" x2="12" y2="16" />
                          </svg>
                        </button>

                        {/* ✏️ edit - EDITAR PRODUCTO */}
                        <button onClick={() => onEdit(product)} title="Editar producto"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4fd6")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* 🗑️ delete - ELIMINAR PRODUCTO */}
                        <button onClick={() => onDelete(product.id)} title="Eliminar producto"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>

                        {/* SWITCH - ABRE ALERTA */}
                        <button
                          onClick={() => {
                            setSelectedId(product.id);
                            setNewStatus(!isActive);
                            setShowToggleAlert(true);
                          }}
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALERTA DE CONFIRMACIÓN DE CAMBIO DE ESTADO */}
      <Alert
        isOpen={showToggleAlert}
        type="password"
        title={newStatus ? "Activar producto" : "Inactivar producto"}
        message={
          newStatus
            ? "Para activar este producto ingresa la contraseña de administrador"
            : "Para inactivar este producto ingresa la contraseña de administrador"
        }
        onCancel={() => setShowToggleAlert(false)}
        onConfirm={(password) => {
          onToggle?.(selectedId, newStatus);
          setShowToggleAlert(false);
        }}
      />
    </>
  );
};

export default ProductTable;