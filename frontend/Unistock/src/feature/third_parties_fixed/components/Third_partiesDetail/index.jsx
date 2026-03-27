/**
 * @file Third_partiesDetail/index.jsx
 * @description Panel de detalle de un tercero (columna derecha de la página).
 *
 * CAUSA DE LA DOBLE ALERTA:
 *   El componente padre (Third_partiesPage) ya gestiona todo el flujo de
 *   confirmación + contraseña a través de su propio <Alert type="password">.
 *   Cuando este componente llamaba onDelete(id) DESPUÉS de su propio flujo
 *   de confirm→password, el Page abría OTRO modal de contraseña → doble alerta.
 *
 * CORRECCIÓN:
 *   Se elimina completamente el flujo de confirm/password de este componente.
 *   Al hacer clic en "Eliminar", se llama onDelete(id) directamente y el Page
 *   es el único responsable de mostrar la confirmación y la contraseña.
 *   Se conserva SOLO el aviso de bloqueo cuando el tercero tiene producciones,
 *   usando un estado local simple sin Alert.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Third_partieDetail = ({ Third_partie, onEdit, onDelete, onClose }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");

  if (!Third_partie) return null;

  const isActive    = Third_partie.estado !== false;
  const producciones = Third_partie.producciones || [];
  const hasProd     = producciones.length > 0;

  /**
   * handleDeleteClick — delega el flujo completo al padre.
   * Si el tercero tiene producciones, no llama onDelete y muestra aviso inline.
   * Si no las tiene, llama onDelete directamente para que el padre muestre
   * su propio modal de confirmación + contraseña (sin duplicados).
   */
  const handleDeleteClick = () => {
    if (hasProd) return; // El botón ya está deshabilitado visualmente, pero por seguridad
    onDelete?.(Third_partie.id);
  };

  return (
    <div style={styles.card}>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={styles.id}>{Third_partie.codigo || `#${Third_partie.id}`}</span>
          {/* Badge de estado — verde activo / gris inactivo */}
          <span style={{
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
            color: isActive ? "#16a34a" : "#6b7280",
          }}>
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
        <h1 style={styles.title}>{Third_partie.nombreEmpresa || Third_partie.nombre}</h1>
        <p style={styles.subtitle}>{Third_partie.nombreContacto || Third_partie.contacto}</p>
      </div>

      {/* ── AVISO DE BLOQUEO inline (sin Alert) ── */}
      {hasProd && (
        <div style={{
          margin: "12px 0", padding: "10px 14px", borderRadius: 10,
          background: "#fff7ed", border: "1px solid #fed7aa",
          fontSize: 12, color: "#c2410c", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Este tercero tiene {producciones.length} producción(es). Desvincula primero antes de eliminar.
        </div>
      )}

      {/* ── TABS ── */}
      <div style={styles.tabs}>
        {["info", "prod"].map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              borderBottom: tab === t ? "2px solid #FF4FD6" : "2px solid transparent",
              color: tab === t ? "#FF4FD6" : "#555",
            }}>
            {t === "info" ? "Información general" : `Producciones${hasProd ? ` (${producciones.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── PESTAÑA INFO ── */}
      {tab === "info" && (
        <div style={styles.infoGrid}>
          <LV label="NIT"       value={Third_partie.nit} />
          <LV label="Dirección" value={Third_partie.direccion} />
          <LV label="Teléfono"  value={Third_partie.telefono} />
          <LV label="Correo"    value={Third_partie.correo || Third_partie.email} />
          {(Third_partie.sitioweb || Third_partie.sitioWeb) && (
            <>
              <div style={styles.label}>Sitio web</div>
              <div style={styles.value}>
                <a href={Third_partie.sitioweb || Third_partie.sitioWeb}
                  target="_blank" rel="noreferrer"
                  style={{ color: "#FF4FD6", textDecoration: "none", fontSize: 13 }}>
                  {Third_partie.sitioweb || Third_partie.sitioWeb}
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PESTAÑA PRODUCCIONES ── */}
      {tab === "prod" && (
        <div style={{ marginTop: 20 }}>
          {producciones.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#bbb" }}>
              <p style={{ fontSize: 13 }}>No hay producciones asociadas</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={styles.th}>Orden</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Ver</th>
                </tr>
              </thead>
              <tbody>
                {producciones.map((prod, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 700, color: "#FF4FD6", fontSize: 13 }}>
                        #{prod.orden || prod.orderNumber}
                      </span>
                    </td>
                    <td style={styles.td}>{prod.fecha || "—"}</td>
                    <td style={styles.td}>
                      {prod.produccionId && (
                        <button
                          onClick={() => navigate(`/layout/produccion/detalle/${prod.produccionId}`)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#FF4FD6", fontSize: 12, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 4, padding: "4px 0",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ACCIONES ── */}
      <div style={styles.actions}>
        {/* Eliminar: deshabilitado si tiene producciones, color único sin gradiente */}
        <button
          style={{
            ...styles.deleteBtn,
            opacity: hasProd ? 0.4 : 1,
            cursor: hasProd ? "not-allowed" : "pointer",
          }}
          onClick={handleDeleteClick}
          disabled={hasProd}
          title={hasProd ? "Desvincular producciones primero" : "Eliminar tercero"}
        >
          Eliminar
        </button>
        {/* Editar: color único #FF4FD6 sin gradiente */}
        <button style={styles.editBtn} onClick={() => onEdit?.(Third_partie)}>
          Editar
        </button>
      </div>
    </div>
  );
};

/** Par label / valor para la grilla de información */
const LV = ({ label, value }) => (
  <>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value || "—"}</div>
  </>
);

const styles = {
  card:     { padding: "24px 28px" },
  header:   { marginBottom: 14 },
  id:       { fontSize: 11, color: "#FF4FD6", fontWeight: 700, background: "#fce7f3", padding: "2px 8px", borderRadius: 6, display: "inline-block", marginBottom: 6 },
  title:    { margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#1f2937" },
  subtitle: { margin: "4px 0 0", fontSize: 13, color: "#9ca3af" },
  tabs:     { display: "flex", gap: 20, marginTop: 16, borderBottom: "1px solid #f0f0f0" },
  tab: {
    background: "none", border: "none", borderBottom: "2px solid transparent",
    cursor: "pointer", padding: "8px 0", fontSize: 13, fontWeight: 600,
  },
  infoGrid: { display: "grid", gridTemplateColumns: "120px 1fr", gap: "10px 8px", marginTop: 18 },
  label:    { fontWeight: 600, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", alignSelf: "center" },
  value:    { fontSize: 13, color: "#1f2937" },
  th:       { textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0 0 8px", borderBottom: "1px solid #f0f0f0" },
  td:       { padding: "11px 0", fontSize: 13, color: "#333", borderBottom: "1px solid #f8f8f8" },
  actions:  { marginTop: 28, display: "flex", justifyContent: "flex-end", gap: 10 },
  // Botón eliminar: color único rojo, sin gradiente
  deleteBtn: { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "9px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13 },
  // Botón editar: color único #FF4FD6, sin gradiente
  editBtn:   { background: "#FF4FD6", color: "#fff", border: "none", padding: "9px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 },
};

export default Third_partieDetail;
