// supplies/components/pages/SupplyDetail.jsx
import React from "react";

const SupplyDetail = ({ supply, medidas = [], propiedades = [], categorias = [], onClose }) => {
  if (!supply) return null;

  // Encontrar nombres de categoría y medida
  const categoriaNombre = categorias.find(c => c.id === supply.categoriaId)?.nombre || "Sin categoría";
  const medidaNombre = medidas.find(m => m.id === supply.medidaId)?.nombre || "Sin medida";

  // Formatear fecha si existe
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "900px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          animation: "slideIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div
          style={{
            
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Detalle del Insumo
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
              }}
            >
              Información completa del insumo seleccionado
              {supply.createdAt && ` • Creado: ${formatDate(supply.createdAt)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "24px",
              fontWeight: "500",
              transition: "background 0.2s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            ×
          </button>
        </div>

        {/* Contenido principal */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", gap: "32px" }}>
            {/* Columna izquierda - Imagen */}
            <div style={{ flex: "0 0 280px" }}>
              <div
                style={{
                  backgroundColor: "#fafafa",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {supply.image ? (
                  <img
                    src={supply.image}
                    alt={supply.nombre}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                    }}
                  >
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ddd"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                      <line x1="8" y1="2" x2="8" y2="22" />
                      <line x1="16" y1="2" x2="16" y2="22" />
                      <line x1="2" y1="8" x2="22" y2="8" />
                      <line x1="2" y1="16" x2="22" y2="16" />
                    </svg>
                    <p style={{ margin: "12px 0 0 0", fontSize: "14px", color: "#999" }}>
                      Sin imagen
                    </p>
                  </div>
                )}

                {/* Stock badge */}
                <div
                  style={{
                    marginTop: "20px",
                    width: "100%",
                    padding: "16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                    Stock actual
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "600",
                      color: supply.stock > 10 ? "#10b981" : supply.stock > 0 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {supply.stock || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                    unidades disponibles
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Información detallada */}
            <div style={{ flex: 1 }}>
              {/* Nombre del insumo */}
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                  Nombre del insumo
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: 1.2,
                  }}
                >
                  {supply.nombre}
                </div>
              </div>

              {/* Grid de información */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {/* Categoría */}
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2">
                      <rect x="3" y="3" width="8" height="8" rx="2" />
                      <rect x="13" y="3" width="8" height="8" rx="2" />
                      <rect x="3" y="13" width="8" height="8" rx="2" />
                      <rect x="13" y="13" width="8" height="8" rx="2" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#666" }}>Categoría</span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#1a1a1a" }}>
                    {categoriaNombre}
                  </div>
                </div>

                {/* Medida */}
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2">
                      <path d="M20 7 L9 18 L4 13" />
                      <path d="M17 7 L20 7 L20 10" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#666" }}>Medida</span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#1a1a1a" }}>
                    {medidaNombre}
                  </div>
                </div>

                {/* Valor medida */}
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6 L12 12 L16 14" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#666" }}>Valor medida</span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#1a1a1a" }}>
                    {supply.valorMedida || 0} <span style={{ fontSize: "13px", color: "#666" }}>unidades</span>
                  </div>
                </div>

                {/* ID */}
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5.5 20v-2a6.5 6.5 0 0 1 13 0v2" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#666" }}>ID</span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "400", color: "#666", fontFamily: "monospace" }}>
                    #{supply.id || "N/A"}
                  </div>
                </div>
              </div>

              {/* Propiedades */}
              <div style={{ marginTop: "24px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4fd6" strokeWidth="2">
                    <path d="M20 7 L9 18 L4 13" />
                  </svg>
                  Propiedades del insumo
                  {supply.propiedades && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "400",
                        color: "#999",
                        marginLeft: "8px",
                      }}
                    >
                      ({supply.propiedades.length} propiedades)
                    </span>
                  )}
                </h3>

                {supply.propiedades && supply.propiedades.length > 0 ? (
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#fdf0f7" }}>
                          <th
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#ff4fd6",
                              borderBottom: "1px solid #ff4fd6",
                            }}
                          >
                            Propiedad
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#ff4fd6",
                              borderBottom: "1px solid #ff4fd6",
                            }}
                          >
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {supply.propiedades.map((prop, index) => {
                          const propData = propiedades.find(p => p.id === prop.propiedadId);
                          return (
                            <tr
                              key={prop.propiedadId}
                              style={{
                                backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff0f7"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafafa"}
                            >
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: "14px",
                                  color: "#1a1a1a",
                                  fontWeight: "500",
                                  borderBottom: index < supply.propiedades.length - 1 ? "1px solid #e5e7eb" : "none",
                                }}
                              >
                                {propData?.nombre || `Propiedad ID: ${prop.propiedadId}`}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: "14px",
                                  color: "#666",
                                  borderBottom: index < supply.propiedades.length - 1 ? "1px solid #e5e7eb" : "none",
                                }}
                              >
                                {prop.valor}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      backgroundColor: "#fafafa",
                      border: "1px dashed #e5e7eb",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ccc"
                      strokeWidth="1.5"
                      style={{ marginBottom: "8px" }}
                    >
                      <path d="M20 7 L9 18 L4 13" />
                    </svg>
                    <p style={{ margin: 0, fontSize: "14px", color: "#999" }}>
                      Este insumo no tiene propiedades asociadas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "24px 32px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            backgroundColor: "#fafafa",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#555",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
              e.target.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Animación keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SupplyDetail;