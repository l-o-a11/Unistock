import React, { useState } from "react";

const SupplyForm = ({ medidas = [], propiedades = [] }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    categoriaId: "",
    stock: "",
    valorMedida: "",
    medidaId: "",
    propiedades: [],
  });

  const [propiedadId, setPropiedadId] = useState("");
  const [valorPropiedad, setValorPropiedad] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const agregarPropiedad = () => {
    if (!propiedadId || !valorPropiedad) return;

    const existe = formData.propiedades.find(
      (p) => p.propiedadId === parseInt(propiedadId)
    );
    if (existe) return;

    setFormData({
      ...formData,
      propiedades: [
        ...formData.propiedades,
        { propiedadId: parseInt(propiedadId), valor: valorPropiedad },
      ],
    });

    setPropiedadId("");
    setValorPropiedad("");
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "40px",
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "900px",
      }}
    >
      {/* COLUMNA IZQUIERDA */}
      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: "20px" }}>Crear nuevo insumo</h2>

        {/* Nombre + Categoría */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label>Nombre *</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. 3 4 5"
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Categoría *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Seleccionar</option>
            </select>
          </div>
        </div>

        {/* Stock */}
        <div style={{ marginBottom: "20px" }}>
          <label>Stock *</label>
          <input
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Ej: 130"
            style={inputStyle}
          />
        </div>

        {/* Valor medida + Medida */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label>Valor medida *</label>
            <input
              name="valorMedida"
              value={formData.valorMedida}
              onChange={handleChange}
              placeholder="Ej: 20"
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Medida *</label>
            <select
              name="medidaId"
              value={formData.medidaId}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Seleccionar</option>
              {medidas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Propiedades */}
        <div style={{ marginBottom: "10px" }}>
          <label>Propiedades</label>

          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            <select
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Seleccionar</option>
              {propiedades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <input
              placeholder="Ej. rojo"
              value={valorPropiedad}
              onChange={(e) => setValorPropiedad(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div
            onClick={agregarPropiedad}
            style={{
              marginTop: "12px",
              fontSize: "14px",
              cursor: "pointer",
              color: "#333",
            }}
          >
            + Agregar otra propiedad
          </div>
        </div>

        {/* Botones */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <button style={cancelStyle}>Cancelar</button>
          <button style={saveStyle}>Guardar Producto</button>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div
        style={{
          width: "280px",
          background: "#f5f5f5",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "20px" }}>Imagen del producto</p>

        <div
          style={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "30px 10px",
            fontSize: "13px",
            color: "#777",
          }}
        >
          Sube un archivo o arrastra y suelta PNG, JPG, GIF hasta 10MB
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "6px",
};

const cancelStyle = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#ddd",
  cursor: "pointer",
};

const saveStyle = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#f062c0",
  color: "#fff",
  cursor: "pointer",
};

export default SupplyForm;