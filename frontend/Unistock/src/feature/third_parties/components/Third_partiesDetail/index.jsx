import React, { useState } from "react";

const Third_partieDetail = ({ Third_partie, onEdit }) => {
  const [tab, setTab] = useState("info");

  if (!Third_partie) return null;

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <a style={styles.id}>{Third_partie.id}</a>
        <h1 style={styles.title}>{Third_partie.nombre}</h1>
        <p style={styles.subtitle}>{Third_partie.contacto}</p>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("info")}
          style={{
            ...styles.tab,
            borderBottom: tab === "info" ? styles.activeBorder : "3px solid transparent",
          }}
        >
          Información general
        </button>

        <button
          onClick={() => setTab("prod")}
          style={{
            ...styles.tab,
            borderBottom: tab === "prod" ? styles.activeBorder : "3px solid transparent",
          }}
        >
          Producciones
        </button>
      </div>

      {/* CONTENIDO */}
      {tab === "info" && (
        <div style={styles.infoGrid}>
          <LabelValue label="Nit" value={Third_partie.nit} />
          <LabelValue label="Dirección" value={Third_partie.direccion} />
          <LabelValue label="Teléfono" value={Third_partie.telefono} />
          <LabelValue
            label="Estado"
            value={Third_partie.estado ? "Activo" : "Inactivo"}
          />
        </div>
      )}

      {tab === "prod" && (
        <div style={styles.body}>
          <p>Producciones del tercero...</p>
        </div>
      )}

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button style={styles.deleteBtn}>Eliminar</button>
        <button style={styles.editBtn} onClick={() => onEdit(Third_partie)}>
          Editar
        </button>
      </div>
    </div>
  );
};

/* 🔹 Subcomponente */
const LabelValue = ({ label, value }) => (
  <>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value}</div>
  </>
);

const styles = {
  card: {
    padding: "35px 40px",
    borderRadius: "10px",
  },

  header: {
    marginBottom: "15px",
  },

  id: {
    fontSize: "12px",
    display: "block",
    marginBottom: "8px",
  },

  title: {
    margin: "0",
    fontSize: "28px",
    fontWeight: "600",
  },

  subtitle: {
    marginTop: "4px",
    fontSize: "14px",
  },

  tabs: {
    display: "flex",
    gap: "25px",
    marginTop: "25px",
    borderBottom: "1px solid #ddd",
  },

  tab: {
    background: "none",
    border: "none",
    padding: "8px 0",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  },

  activeBorder: "3px solid #E91E8C",

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    rowGap: "20px",
    columnGap: "30px",
    marginTop: "25px",
    fontSize: "15px",
  },

  label: {
    fontWeight: "500",
  },

  value: {},

  body: {
    marginTop: "25px",
  },

  actions: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "80px",
  },

  deleteBtn: {
   background: "#ddd",
    border: "none",
    padding: "14px 30px",
    borderRadius: "14px",
    fontSize: "15px",
    cursor: "pointer",
  },

  editBtn: {
     background: "#E91E8C",
    color: "#fff",
    border: "none",
    padding: "14px 35px",
    borderRadius: "14px",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default Third_partieDetail;
