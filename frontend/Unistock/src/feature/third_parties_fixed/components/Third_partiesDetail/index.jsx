import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../shared/components/Alert";

const Third_partieDetail = ({ Third_partie, onEdit, onDelete, onClose }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");
  const [deleteAlert, setDeleteAlert] = useState({ open: false, step: "confirm" });

  if (!Third_partie) return null;

  const isActive   = Third_partie.estado !== false;
  const producciones = Third_partie.producciones || [];
  const hasProd    = producciones.length > 0;

  const handleDeleteClick = () => {
    if (hasProd) {
      // Se bloquea — mostrar error en Alert
      setDeleteAlert({ open: true, step: "blocked" });
    } else {
      setDeleteAlert({ open: true, step: "confirm" });
    }
  };

  const handleDeleteConfirmed = () => {
    onDelete?.(Third_partie.id);
    setDeleteAlert({ open: false, step: "confirm" });
    onClose?.();
  };

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={styles.id}>{Third_partie.codigo || `#${Third_partie.id}`}</span>
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

      {/* TABS */}
      <div style={styles.tabs}>
        {["info", "prod"].map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tab, borderBottom: tab === t ? "2px solid #E91E8C" : "2px solid transparent", color: tab === t ? "#E91E8C" : "#555" }}>
            {t === "info" ? "Información general" : `Producciones${hasProd ? ` (${producciones.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* INFO */}
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
                <a href={Third_partie.sitioweb || Third_partie.sitioWeb} target="_blank" rel="noreferrer"
                  style={{ color: "#E91E8C", textDecoration: "none", fontSize: 13 }}>
                  {Third_partie.sitioweb || Third_partie.sitioWeb}
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* PRODUCCIONES */}
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
                      <span style={{ fontWeight: 700, color: "#E91E8C", fontSize: 13 }}>
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
                            color: "#E91E8C", fontSize: 12, fontWeight: 600,
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

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button style={{ ...styles.deleteBtn, opacity: hasProd ? 0.5 : 1 }} onClick={handleDeleteClick}>
          Eliminar
        </button>
        <button style={styles.editBtn} onClick={() => onEdit?.(Third_partie)}>
          Editar
        </button>
      </div>

      {/* Alert: bloqueado por producciones */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "blocked"}
        type="error"
        title="No se puede eliminar"
        message={`Este tercero tiene ${producciones.length} producción(es) asignada(s). Desvincula las producciones antes de eliminarlo.`}
        onConfirm={() => setDeleteAlert({ open: false, step: "confirm" })}
        onCancel={() => setDeleteAlert({ open: false, step: "confirm" })}
      />

      {/* Paso 1: confirmar intención */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
        type="confirm"
        title="Eliminar tercero"
        message="¿Seguro que deseas eliminar este tercero? Esta acción no se puede deshacer."
        onConfirm={() => setDeleteAlert({ open: true, step: "password" })}
        onCancel={() => setDeleteAlert({ open: false, step: "confirm" })}
      />

      {/* Paso 2: contraseña */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "password"}
        type="password"
        title="Confirmar eliminación"
        message="Ingresa la contraseña de administrador para eliminar."
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteAlert({ open: false, step: "confirm" })}
      />
    </div>
  );
};

const LV = ({ label, value }) => (
  <>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value || "—"}</div>
  </>
);

const styles = {
  card:     { padding: "28px 32px" },
  header:   { marginBottom: 14 },
  id:       { fontSize: 11, color: "#E91E8C", fontWeight: 700, background: "#fce7f3", padding: "2px 8px", borderRadius: 6, display: "inline-block", marginBottom: 6 },
  title:    { margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#1f2937" },
  subtitle: { margin: "4px 0 0", fontSize: 13, color: "#9ca3af" },
  tabs:     { display: "flex", gap: 20, marginTop: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 0 },
  tab: {
    background: "none", border: "none", borderBottom: "2px solid transparent",
    cursor: "pointer", padding: "8px 0", fontSize: 13, fontWeight: 600,
  },
  infoGrid: { display: "grid", gridTemplateColumns: "120px 1fr", gap: "10px 8px", marginTop: 18 },
  label:    { fontWeight: 600, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", alignSelf: "center" },
  value:    { fontSize: 13, color: "#1f2937" },
  th:       { textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0 0 8px", borderBottom: "1px solid #f0f0f0" },
  td:       { padding: "11px 0", fontSize: 13, color: "#333", borderBottom: "1px solid #f8f8f8" },
  actions:  { marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 10 },
  deleteBtn: { background: "#f3f4f6", color: "#ef4444", border: "none", padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  editBtn:   { background: "linear-gradient(135deg,#E91E8C,#FF4FD6)", color: "#fff", border: "none", padding: "9px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 },
};

export default Third_partieDetail;
