import React from "react";


const SupplyDetail = ({ supply, medidas = [], propiedades = [], onClose }) => {
  if (!supply) return null;

  const getMedidaNombre = (id) => {
    const medida = medidas.find((m) => m.id === id);
    return medida ? medida.nombre : "Desconocida";
  };

  const getPropiedadNombre = (id) => {
    const prop = propiedades.find((p) => p.id === id);
    return prop ? prop.nombre : "Desconocida";
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
        <h2 style={{ marginBottom: "20px" }}>Detalle del insumo</h2>

        <Field label="Nombre" value={supply.nombre} />
        <Field label="Categoría" value={supply.categoriaNombre} />
        <Field label="Stock" value={supply.stock} />
        <Field label="Valor medida" value={supply.valorMedida} />
        <Field
          label="Medida"
          value={getMedidaNombre(supply.medidaId)}
        />
        
        {/* Propiedades */}
        <div style={{ marginTop: "20px" }}>
          <label style={{ fontWeight: "bold" }}>Propiedades</label>

          {supply.propiedades && supply.propiedades.length > 0 ? (
            supply.propiedades.map((p, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>{getPropiedadNombre(p.propiedadId)}</span>
                <span>{p.valor}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "14px", color: "#777" }}>
              No tiene propiedades registradas
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "30px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#ddd",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
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

        {supply.imagenUrl ? (
          <img
            src={supply.imagenUrl}
            alt="Producto"
            style={{
              width: "100%",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              border: "2px dashed #ccc",
              borderRadius: "8px",
              padding: "30px 10px",
              fontSize: "13px",
              color: "#777",
            }}
          >
            Sin imagen disponible
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div style={{ marginBottom: "15px" }}>
    <label style={{ fontWeight: "bold" }}>{label}</label>
    <div
      style={{
        marginTop: "6px",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #eee",
        background: "#fafafa",
      }}
    >
      {value || "-"}
    </div>
  </div>
);

export default SupplyDetail;