import React, { useState, useEffect, useRef } from "react";

const Third_partieForm = ({ Third_partie, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: Third_partie?.codigo || "",
    nombre: Third_partie?.nombre || "",
    nit: Third_partie?.nit || "",
    direccion: Third_partie?.direccion || "",
    telefono: Third_partie?.telefono || "",
    contacto: Third_partie?.contacto || "",
    correo: Third_partie?.correo || "",
  });

  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

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
    if (!formData.nombre || !formData.direccion || !formData.telefono) {
      alert("Completa los campos obligatorios");
      return;
    }
    onSubmit(formData);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 4px",
    border: "none",
    borderBottom: "1.5px solid #cfcfcf",
    fontSize: "14px",
    outline: "none",
    background: "transparent",
  };

  const labelStyle = {
    fontSize: "13px",
    color: "#555",
    marginBottom: "4px",
    display: "block",
  };

  const required = <span style={{ color: "#E91E8C" }}>*</span>;

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "#f3f3f3",
          borderRadius: "10px",
          padding: "28px 32px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* TITLE */}
        <h2 style={{margin: "0 0 28px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
              textAlign: "center", }}>
          {Third_partie ? "Editar tercero" : "Crear nuevo tercero"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* CODIGO */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Código Asignado {required}
            </label>
            <input
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px 30px",
            }}
          >
            {/* NOMBRE */}
            <div>
              <label style={labelStyle}>Nombre {required}</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Confecciones Modernas S.A.S."
                style={inputStyle}
              />
            </div>

            {/* NIT */}
            <div>
              <label style={labelStyle}>NIT</label>
              <input
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                placeholder="Ej: 900.123.456-7"
                style={inputStyle}
              />
            </div>

            {/* DIRECCION FULL */}
            <div style={{ gridColumn: "1 / span 2" }}>
              <label style={labelStyle}>Dirección {required}</label>
              <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Calle 10 # 42-15, Medellín"
                style={inputStyle}
              />
            </div>

            {/* TELEFONO */}
            <div>
              <label style={labelStyle}>Teléfono {required}</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: 300 123 4567"
                style={inputStyle}
              />
            </div>

            {/* CONTACTO */}
            <div>
              <label style={labelStyle}>Contacto Principal {required}</label>
              <input
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Ej: Ana Pérez"
                style={inputStyle}
              />
            </div>

            {/* CORREO */}
            <div style={{ gridColumn: "1 / span 2" }}>
              <label style={labelStyle}>Correo Electrónico</label>
              <input
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Ej: contacto@empresa.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* BOTONES */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "14px",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                background: "#ddd",
                color: "#555",
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{
                padding: "8px 22px",
                borderRadius: "10px",
                border: "none",
                background: "#E91E8C",
                color: "#fff",
                fontWeight: "500",
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Third_partieForm;
