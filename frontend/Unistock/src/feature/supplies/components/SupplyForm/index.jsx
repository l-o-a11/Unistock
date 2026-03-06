// supplies/components/pages/SupplyForm.jsx
import React, { useState } from "react";

const SupplyForm = ({ supply, medidas = [], propiedades = [], categorias = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: supply?.nombre || "",
    categoriaId: supply?.categoriaId || "",
    stock: supply?.stock || "",
    valorMedida: supply?.valorMedida || "",
    medidaId: supply?.medidaId || "",
    propiedades: supply?.propiedades?.map(p => ({
      propiedadId: p.propiedadId,
      valor: p.valor
    })) || [],
    image: supply?.image || null,
  });

  const [propiedadId, setPropiedadId] = useState("");
  const [valorPropiedad, setValorPropiedad] = useState("");
  const [imagePreview, setImagePreview] = useState(supply?.image || null);
   
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //propiedades
  const agregarPropiedad = () => {
    if (!propiedadId || !valorPropiedad) return;

    const existe = formData.propiedades.find(
      (p) => p.propiedadId === parseInt(propiedadId)
    );
    if (existe) return;

    const propiedadSeleccionada = propiedades.find(p => p.id === parseInt(propiedadId));
    
    setFormData({
      ...formData,
      propiedades: [
        ...formData.propiedades,
        { 
          propiedadId: parseInt(propiedadId), 
          valor: valorPropiedad 
        },
      ],
    });

    setPropiedadId("");
    setValorPropiedad("");
  };

  const eliminarPropiedad = (propiedadId) => {
    setFormData({
      ...formData,
      propiedades: formData.propiedades.filter(p => p.propiedadId !== propiedadId)
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

      const dataToSubmit = {
    ...formData,
    categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : 0,
    medidaId: formData.medidaId ? parseInt(formData.medidaId) : 0,
    stock: parseFloat(formData.stock) || 0,
    valorMedida: parseFloat(formData.valorMedida) || 0,
  };

    onSubmit(dataToSubmit);
  };

  // Estilos para inputs
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    color: "#333",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "6px",
  };

  const requiredStar = (
    <span style={{ color: "#ff4fd6", marginLeft: "2px" }}>*</span>
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "40px",
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "1100px",
      }}
    >
      {/* COLUMNA IZQUIERDA - Formulario */}
      <div style={{ flex: 1 }}>
        <h2 style={{ 
          marginBottom: "24px",
          fontSize: "20px",
          fontWeight: "600",
          color: "#1a1a1a",
        }}>
          {supply ? "Editar insumo" : "Crear nuevo insumo"}
        </h2>

        {/* Nombre */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>
            Nombre {requiredStar}
          </label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Hilo de algodón"
            style={inputStyle}
          />
        </div>

           

 
         {/* categoria y stock */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
            Categoría {requiredStar}
          </label>
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          </div>
            
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Stock {requiredStar}
            </label>
            <input
               type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Ej. 130"
              style={inputStyle}
            />
           
          </div>
        </div>


        {/* Valor medida + Medida */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Valor medida {requiredStar}
            </label>
            <input
              type="number"
              name="valorMedida"
              value={formData.valorMedida}
              onChange={handleChange}
              placeholder="Ej. 20"
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Medida {requiredStar}
            </label>
            <select
              name="medidaId"
              value={formData.medidaId}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Seleccionar medida</option>
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
          <label style={labelStyle}>Propiedades</label>

          {/* Selector de propiedades */}
          <div style={{ display: "flex", gap: "12px", marginTop: "10px", marginBottom: "20px" }}>
            <select
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            >
              <option value="">Seleccionar propiedad</option>
              {propiedades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <input
              placeholder="Valor (Ej. rojo)"
              value={valorPropiedad}
              onChange={(e) => setValorPropiedad(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />

            <button
              type="button"
              onClick={agregarPropiedad}
              style={{
                padding: "10px 24px",
                backgroundColor: "#ff4fd6",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Agregar
            </button>
          </div>

          {/* Sub-tabla de propiedades agregadas */}
          {formData.propiedades.length > 0 ? (
            <div style={{ 
              marginTop: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#fdf0f7" }}>
                    <th style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#ff4fd6",
                      borderBottom: "1px solid #ff4fd6",
                    }}>
                      Propiedad
                    </th>
                    <th style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#ff4fd6",
                      borderBottom: "1px solid #ff4fd6",
                    }}>
                      Valor
                    </th>
                    <th style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#ff4fd6",
                      borderBottom: "1px solid #ff4fd6",
                      width: "60px",
                    }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.propiedades.map((prop, index) => {
                    const propData = propiedades.find(p => p.id === prop.propiedadId);
                    return (
                      <tr key={prop.propiedadId} style={{
                        backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa"
                      }}>
                        <td style={{
                          padding: "10px 12px",
                          fontSize: "13px",
                          color: "#333",
                          borderBottom: index < formData.propiedades.length - 1 ? "1px solid #e5e7eb" : "none",
                        }}>
                          {propData?.nombre || `Propiedad ${prop.propiedadId}`}
                        </td>
                        <td style={{
                          padding: "10px 12px",
                          fontSize: "13px",
                          color: "#333",
                          borderBottom: index < formData.propiedades.length - 1 ? "1px solid #e5e7eb" : "none",
                        }}>
                          {prop.valor}
                        </td>
                        <td style={{
                          padding: "10px 12px",
                          textAlign: "center",
                          borderBottom: index < formData.propiedades.length - 1 ? "1px solid #e5e7eb" : "none",
                        }}>
                          <button
                            type="button"
                            onClick={() => eliminarPropiedad(prop.propiedadId)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ff4fd6",
                              fontSize: "18px",
                              fontWeight: "bold",
                              padding: "0 4px",
                            }}
                            title="Eliminar propiedad"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Total de propiedades */}
              <div style={{
                padding: "8px 12px",
                backgroundColor: "#f9f9f9",
                borderTop: "1px solid #e5e7eb",
                fontSize: "12px",
                color: "#666",
                textAlign: "right",
              }}>
                Total: {formData.propiedades.length} propiedad(es)
              </div>
            </div>
          ) : (
            <div style={{
              padding: "20px",
              backgroundColor: "#fafafa",
              border: "1px dashed #e5e7eb",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "13px",
              color: "#999",
              marginTop: "8px",
            }}>
              No hay propiedades agregadas. Utiliza el selector de arriba para agregar propiedades.
            </div>
          )}
        </div>
</div>
       

      {/* COLUMNA DERECHA - Imagen */}
      <div style={{ flex: 1, display: "flex",  flexDirection: "column", justifyContent: "space-between", }}>
<div style={{display: "flex", justifyContent: "center",   }}>
              <div style={{ 
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#fafafa",
                minHeight: "250px",
                width: "300px",
                marginTop: "20%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {imagePreview ? (
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image: null }));
                      }}
                      style={{
                        marginTop: "10px",
                        padding: "4px 12px",
                        backgroundColor: "#ff4fd6",
                        border: "1px solid #ff4fd6",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#aaa"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                      <line x1="8" y1="2" x2="8" y2="22" />
                      <line x1="16" y1="2" x2="16" y2="22" />
                      <line x1="2" y1="8" x2="22" y2="8" />
                      <line x1="2" y1="16" x2="22" y2="16" />
                    </svg>
                    <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
                      <span style={{ color: "#E91E8C", fontWeight: "500" }}>
                        Sube una imagen
                      </span>
                      <br />
                      o arrastra y suelta
                    </p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
                      PNG, JPG, GIF hasta 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      style={{
                        marginTop: "10px",
                        padding: "6px 16px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#555",
                        cursor: "pointer"
                      }}
                    >
                      Seleccionar archivo
                    </label>
                  </>
                )}
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
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 32px",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#555",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "11px 32px",
              backgroundColor: "#ff4fd6",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {supply ? "Guardar insumo" : "Crear insumo"}
          </button>
        </div>
      </div>
      </div>
      
      
          
    
  );
};

export default SupplyForm;