import React, { useState } from "react";

// ── Shared cell/input styles ──────────────────────────────────────────────────
const cellStyle = {
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  fontSize: "13px",
  color: "#333",
};

const headerCellStyle = {
  ...cellStyle,
  backgroundColor: "#f9f9f9",
  fontWeight: "600",
  fontSize: "12px",
  color: "#444",
  textAlign: "center",
};

const inputStyle = {
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "13px",
  color: "#333",
  background: "transparent",
  padding: "4px 0",
};

const AddRowBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#888",
      display: "flex",
      alignItems: "center",
      padding: "4px 0",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4fd6")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  </button>
);

const EMPTY_SHEET = {
  client: "",
  date: "",
  ref: "",
  type: "",
  description: "",
  image: null,
  fabrics: [],
  cups: [],
  closures: [],
  accessories: [],
  measurements: [],
  observations: "",
  createdBy: "",
};

const TechnicalSheet = ({ sheet, isEditing = false, onChange, onSave }) => {
  const [formData, setFormData] = useState(sheet || EMPTY_SHEET);
  const [imagePreview, setImagePreview] = useState(sheet?.image || null);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        handleChange("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fabrics
  const handleFabricChange = (i, field, value) => {
    const updated = [...(formData.fabrics || [])];
    if (!updated[i]) updated[i] = { name: "", consumption: "", pieces: "", talla: "" };
    updated[i] = { ...updated[i], [field]: value };
    handleChange("fabrics", updated);
  };
  const addFabric = () => {
    console.log("➕ Añadiendo tela");
    handleChange("fabrics", [...(formData.fabrics || []), { name: "", consumption: "", pieces: "", talla: "" }]);
  };

  // Cups
  const handleCupChange = (i, vi, value) => {
    const updated = [...(formData.cups || [])];
    if (!updated[i]) updated[i] = { type: "", values: ["", "", ""] };
    const vals = [...(updated[i].values || ["", "", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("cups", updated);
  };
  const addCup = () => {
    const current = withMinimumRows(formData.cups, 2, blankCup);
    handleChange("cups", [...current, blankCup()]);
  };

  // Closures
  const handleClosureChange = (i, vi, value) => {
    const updated = [...(formData.closures || [])];
    if (!updated[i]) updated[i] = { type: "", values: ["", "", ""] };
    const vals = [...(updated[i].values || ["", "", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("closures", updated);
  };
  const addClosure = () => {
    const current = withMinimumRows(formData.closures, 2, blankClosure);
    handleChange("closures", [...current, blankClosure()]);
  };

  // Accessories
  const handleAccessoryChange = (i, vi, value) => {
    const updated = [...(formData.accessories || [])];
    if (!updated[i]) updated[i] = { name: "", values: ["", "", ""] };
    const vals = [...(updated[i].values || ["", "", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("accessories", updated);
  };
  const addAccessory = () => {
    const current = withMinimumRows(formData.accessories, 14, blankAccessory);
    handleChange("accessories", [...current, blankAccessory()]);
  };

  // Measurements
  const handleMeasurementChange = (i, vi, value) => {
    const updated = [...(formData.measurements || [])];
    if (!updated[i]) updated[i] = { name: "", values: ["", ""] };
    const vals = [...(updated[i].values || ["", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("measurements", updated);
  };
  const addMeasurement = () => {
    const current = withMinimumRows(formData.measurements, 2, blankMeasurement);
    handleChange("measurements", [...current, blankMeasurement()]);
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "0",
  };
  const blankCup = () => ({ type: "", values: ["", "", ""] });
  const blankClosure = () => ({ type: "", values: ["", "", ""] });
  const blankAccessory = () => ({ name: "", values: ["", "", ""] });
  const blankMeasurement = () => ({ name: "", values: ["", ""] });

  const withMinimumRows = (items, minimum, factory) => {
    const current = items || [];
    return current.length >= minimum
      ? current
      : [...current, ...Array.from({ length: minimum - current.length }, factory)];
  };

  // Valores seguros para renderizado (NO modificar el estado original)
  const getDisplayAccessories = () => formData.accessories || [];

  const getDisplayMeasurements = () => formData.measurements || [];

  const displayAccessories = getDisplayAccessories();
  const displayMeasurements = getDisplayMeasurements();
  const displayCups = formData.cups || [];
  const displayClosures = formData.closures || [];

  return (
    <div style={{ backgroundColor: "#fff", fontFamily: "sans-serif" }}>
      {/* Contenedor de dos columnas: tabla a la izquierda, imagen a la derecha */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Columna izquierda: tablas de la ficha técnica */}
        <div style={{ flex: 2 }}>
          <table style={tableStyle}>
            <tbody>
              {/* ── Row 1: Cliente / Fecha / REF ── */}
              <tr>
                <td style={{ ...headerCellStyle, width: "80px" }}>Cliente:</td>
                <td style={{ ...cellStyle, width: "160px" }}>
                  {isEditing ? (
                    <input style={inputStyle} value={formData.client || ""} onChange={(e) => handleChange("client", e.target.value)} />
                  ) : formData.client}
                </td>
                <td style={{ ...headerCellStyle, width: "60px" }}>Fecha:</td>
                <td style={{ ...cellStyle, width: "120px" }}>
                  {isEditing ? (
                    <input style={inputStyle} value={formData.date || ""} onChange={(e) => handleChange("date", e.target.value)} />
                  ) : formData.date}
                </td>
                <td style={{ ...headerCellStyle, width: "40px" }}>REF:</td>
                <td style={cellStyle}>
                  {isEditing ? (
                    <input style={inputStyle} value={formData.ref || ""} onChange={(e) => handleChange("ref", e.target.value)} />
                  ) : formData.ref}
                </td>
              </tr>{/* ── Row 2: Tipo de prenda / Descripción ── */}
              <tr>
                <td style={headerCellStyle}>Tipo de prenda:</td>
                <td colSpan={2} style={cellStyle}>
                  {isEditing ? (
                    <input style={inputStyle} value={formData.type || ""} onChange={(e) => handleChange("type", e.target.value)} />
                  ) : formData.type}
                </td>
                <td style={headerCellStyle}>Descripción:</td>
                <td colSpan={2} style={cellStyle}>
                  {isEditing ? (
                    <input style={inputStyle} value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
                  ) : formData.description}
                </td>
              </tr>{/* ── Fabrics: Tela 1, Tela 2, Tela 3 ── */}
              {(formData.fabrics || []).map((fabric, i) => (
                <tr key={i}>
                  <td style={headerCellStyle}>Tela {i + 1}:</td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input style={inputStyle} value={fabric?.name || ""} onChange={(e) => handleFabricChange(i, "name", e.target.value)} />
                    ) : fabric?.name}
                  </td>
                  <td style={headerCellStyle}>Consumo:</td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input style={inputStyle} value={fabric?.consumption || ""} onChange={(e) => handleFabricChange(i, "consumption", e.target.value)} />
                    ) : fabric?.consumption}
                  </td>
                  <td style={headerCellStyle}>{i === 2 ? "Talla:" : "# De piezas:"}</td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={inputStyle} 
                        value={i === 2 ? (fabric?.talla || "") : (fabric?.pieces || "")} 
                        onChange={(e) => {
                          if (i === 2) {
                            handleFabricChange(i, "talla", e.target.value);
                          } else {
                            handleFabricChange(i, "pieces", e.target.value);
                          }
                        }} 
                      />
                    ) : (i === 2 ? fabric?.talla : fabric?.pieces)}
                  </td>
                </tr>
              ))}
              
              {/* Botón + para Telas */}
              {isEditing && (
                <tr>
                  <td colSpan={6} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addFabric} />
                  </td>
                </tr>
              )}

              {/* ── Copas (Cópiado) ── */}
              <tr>
                <td colSpan={6} style={{ ...headerCellStyle, textAlign: "left", fontSize: "14px", padding: "8px 12px" }}>
                  Cópiado
                </td>
              </tr>{displayCups.map((cup, i) => (
                <tr key={`cup-${i}`}>
                  <td style={headerCellStyle} colSpan={2}>
                    {isEditing ? (
                      <input
                        style={inputStyle}
                        value={cup?.type || ""}
                        placeholder={`Copa ${i + 1}`}
                        onChange={(e) => {
                          const updated = [...(formData.cups || [])];
                          if (!updated[i]) updated[i] = blankCup();
                          updated[i] = { ...updated[i], type: e.target.value };
                          handleChange("cups", updated);
                        }}
                      />
                    ) : (cup?.type || `Copa ${i + 1}`)}
                  </td>
                  <td colSpan={4} style={cellStyle}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {(cup?.values || ["", "", ""]).map((val, vi) => (
                        <div key={vi}>
                          {isEditing ? (
                            <input
                              style={{ ...inputStyle, width: "50px", textAlign: "center" }}
                              value={val}
                              onChange={(e) => handleCupChange(i, vi, e.target.value)}
                            />
                          ) : (
                            <span>{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Bot�n + para Copas */}
              {isEditing && (
                <tr>
                  <td colSpan={6} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addCup} />
                  </td>
                </tr>)}{displayClosures.map((closure, i) => (
                <tr key={`closure-${i}`}>
                  <td style={headerCellStyle} colSpan={2}>
                    {isEditing ? (
                      <input
                        style={inputStyle}
                        value={closure?.type || ""}
                        placeholder={i === 0 ? "Abrochadura o gafete" : i === 1 ? "Elastico cargadera" : `Cierre ${i + 1}`}
                        onChange={(e) => {
                          const updated = [...(formData.closures || [])];
                          if (!updated[i]) updated[i] = blankClosure();
                          updated[i] = { ...updated[i], type: e.target.value };
                          handleChange("closures", updated);
                        }}
                      />
                    ) : (closure?.type || `Cierre ${i + 1}`)}
                  </td>
                  <td colSpan={4} style={cellStyle}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {(closure?.values || ["", "", ""]).map((val, vi) => (
                        <div key={vi}>
                          {isEditing ? (
                            <input
                              style={{ ...inputStyle, width: "80px", minWidth: "64px", textAlign: "center" }}
                              value={val}
                              onChange={(e) => handleClosureChange(i, vi, e.target.value)}
                            />
                          ) : (
                            <span>{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Bot�n + para Abrochaduras y El�sticos */}
              {isEditing && (
                <tr>
                  <td colSpan={6} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addClosure} />
                  </td>
                </tr>
              )}

              {/* ── Accessories primera fila (7 columnas) ── */}
              <tr>
                <td style={headerCellStyle}>Varilla mi</td>
                <td style={headerCellStyle}>Elastico envivar</td>
                <td style={headerCellStyle}>Hiladilla</td>
                <td style={headerCellStyle}>Broches decor</td>
                <td style={headerCellStyle}>Aro</td>
                <td style={headerCellStyle}>Tensor</td>
                <td style={headerCellStyle}>Zeta</td>
              </tr>{[0, 1, 2].map((row) => (
                <tr key={row}>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[0]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(0, row, e.target.value)}
                      />
                    ) : displayAccessories[0]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[1]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(1, row, e.target.value)}
                      />
                    ) : displayAccessories[1]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[2]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(2, row, e.target.value)}
                      />
                    ) : displayAccessories[2]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[3]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(3, row, e.target.value)}
                      />
                    ) : displayAccessories[3]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[4]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(4, row, e.target.value)}
                      />
                    ) : displayAccessories[4]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[5]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(5, row, e.target.value)}
                      />
                    ) : displayAccessories[5]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[6]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(6, row, e.target.value)}
                      />
                    ) : displayAccessories[6]?.values?.[row]}
                  </td>
                </tr>
              ))}

              {/* ── Accessories segunda fila (7 columnas) ── */}
              <tr>
                <td style={headerCellStyle}>Cinta ilus</td>
                <td style={headerCellStyle}>Elastico con base moi</td>
                <td style={headerCellStyle}>Marquilla</td>
                <td style={headerCellStyle}>Cordón redondi</td>
                <td style={headerCellStyle}>Sesgo</td>
                <td style={headerCellStyle}>Varilla plástic</td>
                <td style={headerCellStyle}>Elastico senc</td>
              </tr>{[0, 1, 2].map((row) => (
                <tr key={`second-${row}`}>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[7]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(7, row, e.target.value)}
                      />
                    ) : displayAccessories[7]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[8]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(8, row, e.target.value)}
                      />
                    ) : displayAccessories[8]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[9]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(9, row, e.target.value)}
                      />
                    ) : displayAccessories[9]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[10]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(10, row, e.target.value)}
                      />
                    ) : displayAccessories[10]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[11]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(11, row, e.target.value)}
                      />
                    ) : displayAccessories[11]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[12]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(12, row, e.target.value)}
                      />
                    ) : displayAccessories[12]?.values?.[row]}
                  </td>
                  <td style={cellStyle}>
                    {isEditing ? (
                      <input 
                        style={{ ...inputStyle, textAlign: "center" }} 
                        value={displayAccessories[13]?.values?.[row] || ""} 
                        onChange={(e) => handleAccessoryChange(13, row, e.target.value)}
                      />
                    ) : displayAccessories[13]?.values?.[row]}
                  </td>
                </tr>
              ))}

              {displayAccessories.slice(14).map((accessory, extraIndex) => {
                const accessoryIndex = extraIndex + 14;
                return (
                  <tr key={`extra-accessory-${accessoryIndex}`}>
                    <td style={headerCellStyle} colSpan={2}>
                      {isEditing ? (
                        <input
                          style={inputStyle}
                          value={accessory?.name || ""}
                          placeholder={`Accesorio ${accessoryIndex + 1}`}
                          onChange={(e) => {
                            const updated = [...(formData.accessories || [])];
                            if (!updated[accessoryIndex]) updated[accessoryIndex] = blankAccessory();
                            updated[accessoryIndex] = { ...updated[accessoryIndex], name: e.target.value };
                            handleChange("accessories", updated);
                          }}
                        />
                      ) : accessory?.name}
                    </td>
                    <td colSpan={5} style={cellStyle}>
                      <div style={{ display: "flex", gap: "20px" }}>
                        {(accessory?.values || ["", "", ""]).map((val, vi) => (
                          <input
                            key={vi}
                            style={{ ...inputStyle, width: "80px", minWidth: "64px", textAlign: "center" }}
                            value={val}
                            onChange={(e) => handleAccessoryChange(accessoryIndex, vi, e.target.value)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Bot�n + para Accesorios */}
              {isEditing && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addAccessory} />
                  </td>
                </tr>
              )}

              {/* ── Measurements ── */}
              <tr>
                <td style={headerCellStyle} colSpan={4}>{displayMeasurements[0]?.name || "Medidas cargaderas"}</td>
                <td style={headerCellStyle} colSpan={3}>{displayMeasurements[1]?.name || "Medidas varillas plásticas"}</td>
              </tr>
              <tr>
                <td style={cellStyle} colSpan={4}>
                  {isEditing ? (
                    <input 
                      style={{ ...inputStyle, textAlign: "center" }} 
                      value={displayMeasurements[0]?.values?.[0] || ""} 
                      onChange={(e) => handleMeasurementChange(0, 0, e.target.value)}
                    />
                  ) : displayMeasurements[0]?.values?.[0]}
                </td>
                <td style={cellStyle} colSpan={3}>
                  {isEditing ? (
                    <input 
                      style={{ ...inputStyle, textAlign: "center" }} 
                      value={displayMeasurements[1]?.values?.[0] || ""} 
                      onChange={(e) => handleMeasurementChange(1, 0, e.target.value)}
                    />
                  ) : displayMeasurements[1]?.values?.[0]}
                </td>
              </tr>
              <tr>
                <td style={cellStyle} colSpan={4}>
                  {isEditing ? (
                    <input 
                      style={{ ...inputStyle, textAlign: "center" }} 
                      value={displayMeasurements[0]?.values?.[1] || ""} 
                      onChange={(e) => handleMeasurementChange(0, 1, e.target.value)}
                    />
                  ) : displayMeasurements[0]?.values?.[1]}
                </td>
                <td style={cellStyle} colSpan={3}>
                  {isEditing ? (
                    <input 
                      style={{ ...inputStyle, textAlign: "center" }} 
                      value={displayMeasurements[1]?.values?.[1] || ""} 
                      onChange={(e) => handleMeasurementChange(1, 1, e.target.value)}
                    />
                  ) : displayMeasurements[1]?.values?.[1]}
                </td>
              </tr>{displayMeasurements.slice(2).map((measurement, extraIndex) => {
                const measurementIndex = extraIndex + 2;
                return (
                  <tr key={`extra-measurement-${measurementIndex}`}>
                    <td style={headerCellStyle} colSpan={2}>
                      {isEditing ? (
                        <input
                          style={inputStyle}
                          value={measurement?.name || ""}
                          placeholder={`Medida ${measurementIndex + 1}`}
                          onChange={(e) => {
                            const updated = [...(formData.measurements || [])];
                            if (!updated[measurementIndex]) updated[measurementIndex] = blankMeasurement();
                            updated[measurementIndex] = { ...updated[measurementIndex], name: e.target.value };
                            handleChange("measurements", updated);
                          }}
                        />
                      ) : measurement?.name}
                    </td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", gap: "20px" }}>
                        {(measurement?.values || ["", ""]).map((val, vi) => (
                          <input
                            key={vi}
                            style={{ ...inputStyle, width: "90px", textAlign: "center" }}
                            value={val}
                            onChange={(e) => handleMeasurementChange(measurementIndex, vi, e.target.value)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Bot�n + para Medidas */}
              {isEditing && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addMeasurement} />
                  </td>
                </tr>
              )}

              {/* ── Observaciones y Elaboró ── */}
              <tr>
                <td style={headerCellStyle} colSpan={2}>OBSERVACIONES:</td>
                <td style={cellStyle} colSpan={5}>
                  {isEditing ? (
                    <input 
                      style={{ ...inputStyle }} 
                      value={formData.observations || ""} 
                      onChange={(e) => handleChange("observations", e.target.value)} 
                    />
                  ) : formData.observations}
                </td>
              </tr>
              <tr>
                <td style={headerCellStyle} colSpan={2}>ELABORÓ:</td>
                <td style={cellStyle} colSpan={5}>
                  {isEditing ? (
                    <input 
                      style={{ ...inputStyle }} 
                      value={formData.createdBy || ""} 
                      onChange={(e) => handleChange("createdBy", e.target.value)} 
                    />
                  ) : formData.createdBy}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Columna derecha: RECUADRO PARA IMAGEN */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#fafafa",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {imagePreview ? (
              <div style={{ textAlign: "center", width: "100%" }}>
                <img 
                  src={imagePreview} 
                  alt="Producto" 
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "300px", 
                    objectFit: "contain",
                    borderRadius: "4px"
                  }} 
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setImagePreview(null);
                      handleChange("image", null);
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#ff4fd6",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Eliminar imagen
                  </button>
                )}
              </div>
            ) : (
              <>
                <svg
                  width="64"
                  height="64"
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
                  {isEditing ? (
                    <>
                      <span style={{ color: "#ff4fd6", fontWeight: "500", cursor: "pointer" }}>
                        Sube una imagen
                      </span>
                      <br />
                      o arrastra y suelta
                    </>
                  ) : (
                    "Sin imagen"
                  )}
                </p>
                {isEditing && (
                  <>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
                      PNG, JPG, GIF hasta 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSheet;