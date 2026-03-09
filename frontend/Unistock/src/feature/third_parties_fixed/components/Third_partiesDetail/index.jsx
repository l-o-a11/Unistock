import React, { useState } from "react";
import Alert from "../Alert";

const Third_partieDetail = ({ Third_partie, onEdit, onDelete, onClose }) => {
  const [tab, setTab] = useState("info");
  const [deleteAlert, setDeleteAlert] = useState({ open: false, step: "confirm" });

  if (!Third_partie) return null;

  const isActive = Third_partie.estado !== false;

  const handleDeleteConfirmed = () => {
    onDelete?.(Third_partie.id);
    setDeleteAlert({ open: false, step: "confirm" });
    onClose?.();
  };

  // Producciones del tercero (puede venir como prop o campo del objeto)
  const producciones = Third_partie.producciones || [];

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.id}>#{Third_partie.id}</span>
        <h1 style={styles.title}>{Third_partie.nombre || Third_partie.nombreEmpresa}</h1>
        <p style={styles.subtitle}>{Third_partie.contacto || Third_partie.nombreContacto}</p>
        <span style={{
          display: "inline-block",
          marginTop: "6px",
          padding: "3px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
          color: isActive ? "#16a34a" : "#6b7280",
        }}>
          {isActive ? "Activo" : "Inactivo"}
        </span>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("info")}
          style={{ ...styles.tab, borderBottom: tab === "info" ? styles.activeBorder : "2px solid transparent" }}
        >
          Información general
        </button>
        <button
          onClick={() => setTab("prod")}
          style={{ ...styles.tab, borderBottom: tab === "prod" ? styles.activeBorder : "2px solid transparent" }}
        >
          Producciones
        </button>
      </div>

      {/* INFO */}
      {tab === "info" && (
        <div style={styles.infoGrid}>
          <LabelValue label="NIT"       value={Third_partie.nit} />
          <LabelValue label="Dirección" value={Third_partie.direccion} />
          <LabelValue label="Teléfono"  value={Third_partie.telefono} />
          <LabelValue label="Correo"    value={Third_partie.correo || Third_partie.email || "—"} />
          <LabelValue label="Estado"    value={isActive ? "Activo" : "Inactivo"} />
        </div>
      )}

      {/* PRODUCCIONES */}
      {tab === "prod" && (
        <div style={{ marginTop: "24px" }}>
          {producciones.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>No hay producciones asociadas.</p>
          ) : (
            <table style={styles.prodTable}>
              <thead>
                <tr>
                  <th style={styles.prodTh}>Orden</th>
                  <th style={styles.prodTh}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {producciones.map((prod, i) => (
                  <tr key={i} style={styles.prodRow}>
                    <td style={styles.prodTd}>{prod.orden}</td>
                    <td style={styles.prodTd}>{prod.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button
          style={styles.deleteBtn}
          onClick={() => setDeleteAlert({ open: true, step: "confirm" })}
        >
          Eliminar
        </button>
        <button style={styles.editBtn} onClick={() => onEdit?.(Third_partie)}>
          Editar
        </button>
      </div>

      {/* Paso 1: confirmar intención */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
        type="confirm"
        title="Eliminar tercero"
        message="¿Seguro que deseas eliminar este tercero? Esta acción no se puede deshacer."
        onConfirm={() => setDeleteAlert({ open: true, step: "password" })}
        onCancel={() => setDeleteAlert({ open: false, step: "confirm" })}
      />

      {/* Paso 2: contraseña de administrador */}
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

const LabelValue = ({ label, value }) => (
  <>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value || "—"}</div>
  </>
);

const styles = {
  card:     { padding: "35px 40px" },
  header:   { marginBottom: "15px" },
  id:       { fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" },
  title:    { margin: 0, fontSize: "24px", fontWeight: "600" },
  subtitle: { marginTop: "4px", fontSize: "14px", color: "#666" },
  tabs:     { display: "flex", gap: "25px", marginTop: "20px", borderBottom: "1px solid #f0f0f0" },
  tab: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    padding: "8px 0",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  activeBorder: "2px solid #E91E8C",
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: "12px 8px",
    marginTop: "20px",
  },
  label: { fontWeight: "500", fontSize: "13px", color: "#888" },
  value: { fontSize: "14px", color: "#222" },
  actions: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  deleteBtn: {
    background: "#f3f4f6",
    color: "#ef4444",
    border: "none",
    padding: "10px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
  },
  editBtn: {
    background: "#E91E8C",
    color: "#fff",
    border: "none",
    padding: "10px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
  },
  // Tabla de producciones
  prodTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  prodTh: {
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    paddingBottom: "10px",
    borderBottom: "1px solid #f0f0f0",
  },
  prodRow: {
    borderBottom: "1px solid #f5f5f5",
  },
  prodTd: {
    padding: "12px 0",
    fontSize: "14px",
    color: "#333",
  },
};

export default Third_partieDetail;