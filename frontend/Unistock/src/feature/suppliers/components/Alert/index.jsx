import React from "react";

const Alert = ({
  isOpen,
  type = "success", // success | error | warning | confirm
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  // 🎨 estilos según tipo
  // const config = {
  //   success: {
  //     color: "#16a34a",
  //     title: title || "Éxito",
  //     confirmText: "Aceptar",
  //   },
  //   error: {
  //     color: "#dc2626",
  //     title: title || "Error",
  //     confirmText: "Cerrar",
  //   },
  //   warning: {
  //     color: "#f59e0b",
  //     title: title || "Advertencia",
  //     confirmText: "Aceptar",
  //   },
  //   confirm: {
  //     color: "#E91E8C",
  //     title: title || "Confirmar acción",
  //     confirmText: "Sí, eliminar",
  //   },
  // };

  // const current = config[type];

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* TITLE */}
        <h3
          style={{
            ...titleStyle,
            color: current.color,
          }}
        >
          {current.title}
        </h3>

        {/* MESSAGE */}
        <p style={messageStyle}>{message}</p>

        {/* ACTIONS */}
        <div style={actionsStyle}>
          {type === "confirm" && (
            <button style={cancelBtn} onClick={onCancel}>
              Cancelar
            </button>
          )}

          <button
            style={{
              ...confirmBtn,
              color: current.color,
            }}
            onClick={onConfirm}
          >
            {current.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;

// 🎨 ESTILOS
const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.45)",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "24px 28px",
  width: "100%",
  maxWidth: "380px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

const titleStyle = {
  margin: "0 0 12px 0",
  fontSize: "16px",
  fontWeight: "600",
};

const messageStyle = {
  margin: "0 0 24px 0",
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.5",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "16px",
};

const confirmBtn = {
  border: "none",
  background: "none",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

const cancelBtn = {
  border: "none",
  background: "none",
  fontSize: "15px",
  fontWeight: "500",
  color: "#666",
  cursor: "pointer",
};

// 1. Activar / Inactivar proveedor
// <Alert
//   isOpen={showAlert}
//   type="success"
//   message="El proveedor fue actualizado correctamente"
// />


// o error:

// <Alert
//   isOpen={showAlert}
//   type="error"
//   message="No se pudo cambiar el estado del proveedor"
// />

// ✏️ 2. Editar proveedor
// <Alert
//   isOpen={showAlert}
//   type="success"
//   message="Proveedor actualizado correctamente"
// />

// ➕ 3. Crear proveedor
// <Alert
//   isOpen={showAlert}
//   type="success"
//   message="Proveedor creado correctamente"
// />

// ⚠️ 4. Confirmación de eliminación
// <Alert
//   isOpen={showDeleteAlert}
//   type="confirm"
//   message="¿Estás seguro de eliminar este proveedor?"
//   onConfirm={confirmDelete}
//   onCancel={closeAlert}
// />

// ❌ 5. Error al eliminar
// <Alert
//   isOpen={showAlert}
//   type="error"
//   message="Error al eliminar el proveedor"
// />