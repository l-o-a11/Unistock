import React, { useState, useEffect, useRef } from "react";

const SupplierForm = ({ supplier, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreEmpresa: supplier?.nombreEmpresa || "",
    nit: supplier?.nit || "",
    direccion: supplier?.direccion || "",
    correoEmpresa: supplier?.correoEmpresa || "",
    sitioWeb: supplier?.sitioWeb || "",
    nombreContacto: supplier?.nombreContacto || "",
    telefono: supplier?.telefono || "",
    correoContacto: supplier?.correoContacto || "",
  });

  const modalRef = useRef(null);

  // cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // click fuera
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCancel();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "none",
    borderBottom: "1.5px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    background: "transparent",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "4px",
    display: "block",
  };

  const requiredStar = <span style={{ color: "#E91E8C" }}>*</span>;

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.25)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "900px",
          padding: "36px 40px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        {/* BOTON CERRAR */}
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#f3f4f6",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <h2 style={{ margin: "0 0 28px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
              textAlign: "center", }}>
          {supplier ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
            }}
          >
            {/* IZQUIERDA */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    borderRight: "1px solid #e5e7eb",
    paddingRight: "30px",
  }}
>
         <div>
                <label style={labelStyle}>
                  Nombre Empresa {requiredStar}
                </label>
                <input
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>NIT {requiredStar}</label>
                <input
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Dirección {requiredStar}</label>
                <input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Correo Empresa {requiredStar}</label>
                <input
                  name="correoEmpresa"
                  value={formData.correoEmpresa}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Sitio Web</label>
                <input
                  name="sitioWeb"
                  value={formData.sitioWeb}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* DERECHA */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Nombre Contacto</label>
                <input
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Teléfono {requiredStar}
                </label>
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Correo Contacto</label>
                <input
                  name="correoContacto"
                  value={formData.correoContacto}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "16px",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 22px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#eee",
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{
                padding: "10px 28px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#E91E8C",
                color: "#fff",
                fontWeight: "600",
              }}
            >
              Guardar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
