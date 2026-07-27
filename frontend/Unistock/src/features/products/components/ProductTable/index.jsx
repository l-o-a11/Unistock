import React, { useState } from "react";
import HoverCard from "../../../shared/components/HoverCart";
import Alert from "../../../shared/components/Alert";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";

const ProductTable = ({ products = [], onView, onEdit, onDelete, onToggle, onStockChange }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const thStyle = {
    padding: isMobile ? "10px 12px" : "14px 20px",
    textAlign: "left",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "500",
    color: "#888",
    borderBottom: "1px solid #f0f0f0",
    whiteSpace: isMobile ? "normal" : "nowrap",
    overflow: isMobile ? "visible" : "hidden",
    textOverflow: isMobile ? "clip" : "ellipsis",
    backgroundColor: "#f5f5f5",
  };

  const tdStyle = {
    padding: isMobile ? "10px 12px" : "14px 20px",
    fontSize: isMobile ? "13px" : "14px",
    color: "#333",
    borderBottom: "1px solid #f5f5f5",
    whiteSpace: isMobile ? "normal" : "nowrap",
    overflow: isMobile ? "visible" : "hidden",
    textOverflow: isMobile ? "clip" : "ellipsis",
  };

  // ✅ Fix: la columna de Acciones contiene botones/ícono e interruptor, no
  // texto — nunca debe recortarse con overflow:hidden ni heredar un ancho
  // porcentual estricto, o el switch y los íconos se ven cortados.
  const tdActionsStyle = {
    ...tdStyle,
    overflow: "visible",
    textOverflow: "clip",
    whiteSpace: "nowrap",
  };

  // ✅ Fix: la celda de imagen necesita overflow:visible para que el hover
  // expandido no quede cortado por el contenedor padre (tdStyle tiene
  // overflow:hidden en desktop, lo que recorta la preview al expandirse).
  const tdImageStyle = {
    ...tdStyle,
    overflow: "visible",
    textOverflow: "clip",
    position: "relative",
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
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
        }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "920px",
              tableLayout: isMobile ? "auto" : "fixed",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "8%" }}>Imagen</th>
                <th style={{ ...thStyle, width: "16%" }}>Referencia</th>
                <th style={{ ...thStyle, width: "20%" }}>Nombre</th>
                <th style={{ ...thStyle, width: "16%" }}>Categoría</th>
                <th style={{ ...thStyle, width: "14%" }}>Precio</th>
                <th style={{ ...thStyle, width: "10%" }}>Stock</th>
                <th style={{ ...thStyle, width: "170px", overflow: "visible" }}>Acciónes</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isActive = product.active !== false;

                return (
                  <tr
                    key={product.id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* ✅ Fix: usa tdImageStyle (overflow:visible) en lugar de
                        tdStyle para que la preview no quede recortada */}
                    <td style={tdImageStyle}>
                      <div className="relative group w-fit">

                        {/* Imagen pequeña */}
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 cursor-pointer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs cursor-pointer">
                            🖼️
                          </div>
                        )}

                        {/* Hover cuando SÍ hay imagen */}
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="
                              hidden group-hover:block
                              absolute left-12 top-0
                              max-w-60 max-h-60
                              w-auto h-auto
                              object-contain
                              bg-white p-2
                              rounded-lg border border-gray-200 shadow-lg
                              pointer-events-none z-50
                            "
                          />
                        )}

                        {/* Hover cuando NO hay imagen */}
                        {!product.image && (
                          <div
                            className="
                              hidden group-hover:flex
                              absolute left-12 top-0
                              w-40 h-20
                              items-center justify-center
                              bg-white border border-gray-200 rounded-lg shadow-lg
                              text-gray-500 text-sm
                              pointer-events-none z-50
                            "
                          >
                            Sin imagen
                          </div>
                        )}

                      </div>
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

                    {/* Nombre */}
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => onStockChange?.(product.id, -1)}
                        disabled={Number(product.stock) <= 0}
                        title="Restar stock"
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          border: "1px solid #f9a8d4",
                          background: "#fff",
                          color: Number(product.stock) <= 0 ? "#d1d5db" : "#ff4fd6",
                          fontSize: "14px",
                          fontWeight: "700",
                          lineHeight: 1,
                          cursor: Number(product.stock) <= 0 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => { if (Number(product.stock) > 0) e.currentTarget.style.backgroundColor = "#fff0fb"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                      >
                        −
                      </button>

                      <span style={{ minWidth: "18px", textAlign: "center" }}>{product.stock}</span>

                      <button
                        type="button"
                        onClick={() => onStockChange?.(product.id, 1)}
                        title="Sumar stock"
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          border: "1px solid #f9a8d4",
                          background: "#fff",
                          color: "#ff4fd6",
                          fontSize: "14px",
                          fontWeight: "700",
                          lineHeight: 1,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fff0fb"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                      >
                        +
                      </button>
                    </div>
                  </td>

                    {/* ACCIONES */}
                    <td style={tdActionsStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>

                        {/* ⓘ info - VER FICHA TÉCNICA */}
                        <button onClick={() => onView(product)} title="Ver ficha técnica"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", flexShrink: 0 }}
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
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", flexShrink: 0 }}
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
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", flexShrink: 0 }}
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
                            flexShrink: 0,
                            padding: 0,
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
          onToggle?.(selectedId, newStatus, password);
          setShowToggleAlert(false);
        }}
      />
    </>
  );
};

export default ProductTable;