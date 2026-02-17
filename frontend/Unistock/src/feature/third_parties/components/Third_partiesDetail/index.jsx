import React, { useState } from "react";

const Third_partieDetail = ({ Third_partie, onEdit, onClose }) => {
  const [tab, setTab] = useState("info");

  if (!Third_partie) return null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <small style={{ color: "#999" }}>{Third_partie.id}</small>
          <h2 style={styles.title}>{Third_partie.nombreEmpresa}</h2>
          <p style={styles.subtitle}>{Third_partie.contacto}</p>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("info")}
          style={{
            ...styles.tab,
            borderBottom:
              tab === "info" ? "2px solid #FF4FD6" : "2px solid transparent",
          }}
        >
          Información general
        </button>

        <button
          onClick={() => setTab("prod")}
          style={{
            ...styles.tab,
            borderBottom:
              tab === "prod" ? "2px solid #FF4FD6" : "2px solid transparent",
          }}
        >
          Producciones
        </button>
      </div>

      {/* CONTENIDO */}
      {tab === "info" && (
        <div style={styles.body}>
          <p><b>Nit:</b> {Third_partie.nit}</p>
          <p><b>Dirección:</b> {Third_partie.direccion}</p>
          <p><b>Teléfono:</b> {Third_partie.telefono}</p>
          <p><b>Estado:</b> {Third_partie.estado ? "Activo" : "Inactivo"}</p>
        </div>
      )}

      {tab === "prod" && (
        <div style={styles.body}>
          <p>Producciones del tercero...</p>
        </div>
      )}

      {/* ACCIONES */}
      <div style={styles.actions}>
        <button style={styles.deleteBtn}>Eliminar</button>
        <button style={styles.editBtn} onClick={() => onEdit(Third_partie)}>
          Editar
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: "100%",
  },

  header: {
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "20px",
  },

  subtitle: {
    margin: 0,
    color: "#666",
  },

  tabs: {
    display: "flex",
    gap: "20px",
    borderBottom: "1px solid #eee",
    marginBottom: "15px",
  },

  tab: {
    background: "none",
    border: "none",
    padding: "10px 0",
    cursor: "pointer",
    fontWeight: "500",
  },

  body: {
    fontSize: "14px",
    color: "#444",
    lineHeight: "1.8",
  },

  actions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
  },

  deleteBtn: {
    background: "#ddd",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
  },

  editBtn: {
    background: "#FF4FD6",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
  },
};

export default Third_partieDetail;
