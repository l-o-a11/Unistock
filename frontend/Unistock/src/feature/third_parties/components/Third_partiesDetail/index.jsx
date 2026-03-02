import React, { useState } from "react";
import Alert from "../Alert";

const Third_partieDetail = ({ Third_partie, onEdit }) => {
  const [tab, setTab] = useState("info");

  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    step: "confirm",
  });

  if (!Third_partie) return null;

  // 🔥 FUNCIÓN FINAL DE ELIMINAR
  const handleDelete = () => {
    console.log("Tercero eliminado:", Third_partie);
    setDeleteAlert({ open: false });
  };

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
            borderBottom: tab === "info" ? styles.activeBorder : "transparent",
          }}
        >
          Información general
        </button>

        <button
          onClick={() => setTab("prod")}
          style={{
            ...styles.tab,
            borderBottom: tab === "prod" ? styles.activeBorder : "transparent",
          }}
        >
          Producciones
        </button>
      </div>

      {/* INFO */}
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

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button
          style={styles.deleteBtn}
          onClick={() =>
            setDeleteAlert({
              open: true,
              step: "confirm",
            })
          }
        >
          Eliminar
        </button>

        <button style={styles.editBtn} onClick={() => onEdit(Third_partie)}>
          Editar
        </button>
      </div>

      {/* ALERTA CONFIRMAR */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
        type="confirm"
        message="¿Seguro que deseas eliminar este tercero?"
        onConfirm={() =>
          setDeleteAlert({ open: true, step: "password" })
        }
        onCancel={() => setDeleteAlert({ open: false })}
      />

      {/* ALERTA PASSWORD */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "password"}
        type="password"
        message="Ingresa la contraseña para eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteAlert({ open: false })}
      />
    </div>
  );
};

const LabelValue = ({ label, value }) => (
  <>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value}</div>
  </>
);

const styles = {
  card: { padding: "35px 40px" },
  header: { marginBottom: "15px" },
  id: { fontSize: "12px", display: "block", marginBottom: "8px" },
  title: { margin: 0, fontSize: "28px", fontWeight: "600" },
  subtitle: { marginTop: "4px", fontSize: "14px" },
  tabs: { display: "flex", gap: "25px", marginTop: "25px" },
  tab: { background: "none", border: "none", cursor: "pointer" },
  activeBorder: "3px solid #E91E8C",
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    marginTop: "25px",
  },
  label: { fontWeight: "500" },
  value: {},
  actions: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "40px",
  },
  deleteBtn: {
    background: "#ddd",
    border: "none",
    padding: "14px 30px",
    borderRadius: "14px",
    cursor: "pointer",
  },
  editBtn: {
    background: "#E91E8C",
    color: "#fff",
    border: "none",
    padding: "14px 35px",
    borderRadius: "14px",
    cursor: "pointer",
  },
};

export default Third_partieDetail;