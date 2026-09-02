import React, { useState, useEffect } from "react";
import { AuthAPI } from "../../../auth/services/AuthAPI";

const cellStyle = {
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  fontSize: "13px",
  color: "#333",
  height: "36px",        // altura mínima uniforme — igual que Excel
  verticalAlign: "middle",
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

// Estilo para modo vista — misma estructura visual que el input
const readStyle = {
  display: "block",
  width: "100%",
  fontSize: "13px",
  color: "#333",
  padding: "4px 0",
  minHeight: "22px",
};

// ✅ Declarado fuera del componente para evitar recreación en cada render
const Field = ({ value, onChangeFn, style = {}, placeholder = "", isEditing }) =>
  isEditing ? (
    <input
      style={{ ...inputStyle, ...style }}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChangeFn(e.target.value)}
    />
  ) : (
    <span style={{ ...readStyle, ...style }}>{value || ""}</span>
  );

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

// Garantiza 14 slots fijos para accesorios (columnas fijas de la tabla)
const buildEmptyAccessories = () =>
  Array.from({ length: 14 }, () => ({ name: "", values: ["", "", ""] }));

const mergeAccessories = (existing = []) => {
  const base = buildEmptyAccessories();
  existing.forEach((item, i) => {
    if (i < 14) base[i] = { ...base[i], ...item };
    // los extras (>= 14) se agregan al final después
  });
  const extras = existing.slice(14);
  return [...base, ...extras];
};

const hasValue = (v) => v && String(v).trim() !== "";

const buildInitialData = (sheet, productName, categoryDescription, productRef, productImage, categoryName) => {
  const initialData = sheet || { ...EMPTY_SHEET };
  const currentUser = AuthAPI.getSession();
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  return {
    ...initialData,
    date:        hasValue(initialData.date)        ? initialData.date        : today,
    createdBy:   hasValue(initialData.createdBy)   ? initialData.createdBy   : (currentUser?.nombre || ""),
    // El tipo de prenda debe usar la categoría del producto, no su nombre.
    // Push Up XYZ") en vez de la CATEGORÍA (ej. "Brasieres"). Antes usaba
    // `productName`; ahora usa `categoryName` (formData.category en
    // ProductForm). `categoryDescription` sigue siendo el texto libre de la
    // categoría y se mantiene reservado para el campo "Descripción".
    type:        hasValue(initialData.type)        ? initialData.type        : (categoryName || ""),
    description: hasValue(initialData.description) ? initialData.description : (categoryDescription || ""),
    ref:         hasValue(initialData.ref)         ? initialData.ref         : (productRef || ""),
    // Imagen: usar la del producto si la ficha no tiene una propia
    image:       hasValue(initialData.image)       ? initialData.image        : (productImage || null),
    // Siempre 14 slots fijos para que las celdas de la tabla nunca colapsen
    accessories: mergeAccessories(initialData.accessories || []),
  };
};

const TechnicalSheet = ({ sheet, isEditing = false, onChange, productName = "", categoryDescription = "", productRef = "", productImage = null, categoryName = "" }) => {
  const [formData, setFormData] = useState(() =>
    buildInitialData(sheet, productName, categoryDescription, productRef, productImage, categoryName)
  );
  const [imagePreview, setImagePreview] = useState(hasValue(sheet?.image) ? sheet.image : (productImage || null));

  // ✅ Fix: re-sincronizar formData cada vez que cambia la ficha mostrada
  // (ej. al seleccionar otra versión en el dropdown). Antes, useState solo
  // ejecutaba su inicializador en el primer montaje del componente — como
  // el modal no se desmonta al cambiar de versión, todas las versiones
  // mostraban siempre los mismos datos (los de la primera que se vio).
  // Usamos sheet?.id como dependencia: cada versión tiene un id distinto,
  // así que esto se dispara exactamente cuando el usuario cambia de versión,
  // sin interferir con la edición en curso de la versión actual.
  React.useEffect(() => {
    setFormData(buildInitialData(sheet, productName, categoryDescription, productRef, productImage, categoryName));
    setImagePreview(hasValue(sheet?.image) ? sheet.image : (productImage || null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet?.id]);

  // ✅ CORREGIDO: propaga al padre los valores autogenerados (fecha, usuario,
  // tipo, descripción, ref, imagen heredada del producto) apenas se monta.
  // Antes, estos valores vivían solo en el estado local y nunca llegaban al
  // padre si el usuario no editaba manualmente esos campos, por lo que se
  // guardaban vacíos al enviar el formulario.
  useEffect(() => {
    onChange?.(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ── Fabrics ───────────────────────────────────────────────────────────────
  const handleFabricChange = (i, field, value) => {
    const updated = [...(formData.fabrics || [])];
    if (!updated[i]) updated[i] = { name: "", consumption: "", pieces: "", talla: "" };
    updated[i] = { ...updated[i], [field]: value };
    handleChange("fabrics", updated);
  };
  const addFabric = () =>
    handleChange("fabrics", [...(formData.fabrics || []), { name: "", consumption: "", pieces: "", talla: "" }]);

  // ── Materiales / Insumos ──────────────────────────────────────────────────
  // ✅ Antes este bloque no existía: nunca había forma de capturar materiales
  // en la UI, así que siempre se guardaba vacío en la ficha técnica.
  const blankMaterial = () => ({ nombre: "", unidad: "", cantidades: "", observaciones: "" });
  const handleMaterialChange = (i, field, value) => {
    const updated = [...(formData.materiales || [])];
    if (!updated[i]) updated[i] = blankMaterial();
    updated[i] = { ...updated[i], [field]: value };
    handleChange("materiales", updated);
  };
  const addMaterial = () =>
    handleChange("materiales", [...(formData.materiales || []), blankMaterial()]);
  const removeMaterial = (i) =>
    handleChange("materiales", (formData.materiales || []).filter((_, idx) => idx !== i));

  // ── Cups ──────────────────────────────────────────────────────────────────
  const blankCup        = () => ({ type: "", values: ["", "", ""] });
  const blankClosure    = () => ({ type: "", values: ["", "", ""] });
  const blankAccessory  = () => ({ name: "", values: ["", "", ""] });
  const blankMeasurement = () => ({ name: "", values: ["", ""] });

  const withMinimumRows = (items, minimum, factory) => {
    const current = items || [];
    return current.length >= minimum
      ? current
      : [...current, ...Array.from({ length: minimum - current.length }, factory)];
  };

  const handleCupChange = (i, vi, value) => {
    const updated = [...(formData.cups || [])];
    if (!updated[i]) updated[i] = blankCup();
    const vals = [...(updated[i].values || ["", "", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("cups", updated);
  };
  const addCup = () => {
    const current = withMinimumRows(formData.cups, 2, blankCup);
    handleChange("cups", [...current, blankCup()]);
  };

  // ── Closures ──────────────────────────────────────────────────────────────
  const handleClosureChange = (i, vi, value) => {
    const updated = [...(formData.closures || [])];
    if (!updated[i]) updated[i] = blankClosure();
    const vals = [...(updated[i].values || ["", "", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("closures", updated);
  };
  const addClosure = () => {
    const current = withMinimumRows(formData.closures, 2, blankClosure);
    handleChange("closures", [...current, blankClosure()]);
  };

  // ── Accessories ───────────────────────────────────────────────────────────
  const handleAccessoryChange = (i, vi, value) => {
    // Garantizar que siempre haya al menos 14 slots antes de modificar
    const base = formData.accessories && formData.accessories.length >= 14
      ? [...formData.accessories]
      : mergeAccessories(formData.accessories || []);
    if (!base[i]) base[i] = blankAccessory();
    const vals = [...(base[i].values || ["", "", ""])];
    vals[vi] = value;
    base[i] = { ...base[i], values: vals };
    handleChange("accessories", base);
  };
  const addAccessory = () => {
    const current = withMinimumRows(formData.accessories, 14, blankAccessory);
    handleChange("accessories", [...current, blankAccessory()]);
  };

  // ── Measurements ──────────────────────────────────────────────────────────
  const handleMeasurementChange = (i, vi, value) => {
    const updated = [...(formData.measurements || [])];
    if (!updated[i]) updated[i] = blankMeasurement();
    const vals = [...(updated[i].values || ["", ""])];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("measurements", updated);
  };
  const addMeasurement = () => {
    const current = withMinimumRows(formData.measurements, 2, blankMeasurement);
    handleChange("measurements", [...current, blankMeasurement()]);
  };

  const tableStyle = { width: "100%", borderCollapse: "collapse", marginBottom: "0" };

  const displayAccessories = formData.accessories || [];
  const displayMeasurements = formData.measurements || [];
  const displayCups         = formData.cups         || [];
  const displayClosures     = formData.closures      || [];

  return (
    <div style={{ backgroundColor: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Columna izquierda */}
        <div style={{ flex: 2 }}>
          <table style={tableStyle}>
            <tbody>

              {/* ── Row 1: Cliente / Fecha / REF ── */}
              <tr>
                <td style={{ ...headerCellStyle, width: "80px" }}>Cliente:</td>
                <td style={{ ...cellStyle, width: "160px" }}>
                  <Field
                        isEditing={isEditing} value={formData.client} onChangeFn={(v) => handleChange("client", v)} />
                </td>
                <td style={{ ...headerCellStyle, width: "60px" }}>Fecha:</td>
                <td style={{ ...cellStyle, width: "120px" }}>
                  <Field
                        isEditing={isEditing} value={formData.date} onChangeFn={(v) => handleChange("date", v)} />
                </td>
                <td style={{ ...headerCellStyle, width: "40px" }}>REF:</td>
                <td colSpan={2} style={cellStyle}>
                  <Field
                        isEditing={isEditing} value={formData.ref} onChangeFn={(v) => handleChange("ref", v)} />
                </td>
              </tr>

              {/* ── Row 2: Tipo de prenda / Descripción ── */}
              <tr>
                <td style={headerCellStyle}>Tipo de prenda:</td>
                <td colSpan={3} style={cellStyle}>
                  <Field
                        isEditing={isEditing} value={formData.type} onChangeFn={(v) => handleChange("type", v)} />
                </td>
                <td style={headerCellStyle}>Descripción:</td>
                <td colSpan={2} style={cellStyle}>
                  <Field
                        isEditing={isEditing} value={formData.description} onChangeFn={(v) => handleChange("description", v)} />
                </td>
              </tr>

              {/* ── Fabrics ── */}
              {(formData.fabrics || []).map((fabric, i) => (
                <tr key={i}>
                  <td style={headerCellStyle}>Tela {i + 1}:</td>
                  <td style={cellStyle}>
                    <Field
                        isEditing={isEditing} value={fabric?.name} onChangeFn={(v) => handleFabricChange(i, "name", v)} />
                  </td>
                  <td style={headerCellStyle}>Consumo:</td>
                  <td style={cellStyle}>
                    <Field
                        isEditing={isEditing} value={fabric?.consumption} onChangeFn={(v) => handleFabricChange(i, "consumption", v)} />
                  </td>
                  <td style={headerCellStyle}>{i === 2 ? "Talla:" : "# De piezas:"}</td>
                  <td style={cellStyle}>
                    <Field
                        isEditing={isEditing}
                      value={i === 2 ? fabric?.talla : fabric?.pieces}
                      onChangeFn={(v) => handleFabricChange(i, i === 2 ? "talla" : "pieces", v)}
                    />
                  </td>
                  <td style={cellStyle} />
                </tr>
              ))}

              {isEditing && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addFabric} />
                  </td>
                </tr>
              )}

              {/* ── Copiado ── */}
              <tr>
                <td colSpan={7} style={{ ...headerCellStyle, textAlign: "left", fontSize: "14px", padding: "8px 12px" }}>
                  Cópiado
                </td>
              </tr>

              {displayCups.map((cup, i) => (
                <tr key={`cup-${i}`}>
                  <td style={headerCellStyle} colSpan={2}>
                    <Field
                        isEditing={isEditing}
                      value={cup?.type}
                      placeholder={`Copa ${i + 1}`}
                      onChangeFn={(v) => {
                        const updated = [...(formData.cups || [])];
                        if (!updated[i]) updated[i] = blankCup();
                        updated[i] = { ...updated[i], type: v };
                        handleChange("cups", updated);
                      }}
                    />
                  </td>
                  <td colSpan={5} style={cellStyle}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {(cup?.values || ["", "", ""]).map((val, vi) => (
                        <Field
                        isEditing={isEditing}
                          key={vi}
                          value={val}
                          style={{ width: "50px", textAlign: "center" }}
                          onChangeFn={(v) => handleCupChange(i, vi, v)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

              {isEditing && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addCup} />
                  </td>
                </tr>
              )}

              {displayClosures.map((closure, i) => (
                <tr key={`closure-${i}`}>
                  <td style={headerCellStyle} colSpan={2}>
                    <Field
                        isEditing={isEditing}
                      value={closure?.type}
                      placeholder={i === 0 ? "Abrochadura o gafete" : i === 1 ? "Elastico cargadera" : `Cierre ${i + 1}`}
                      onChangeFn={(v) => {
                        const updated = [...(formData.closures || [])];
                        if (!updated[i]) updated[i] = blankClosure();
                        updated[i] = { ...updated[i], type: v };
                        handleChange("closures", updated);
                      }}
                    />
                  </td>
                  <td colSpan={5} style={cellStyle}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {(closure?.values || ["", "", ""]).map((val, vi) => (
                        <Field
                        isEditing={isEditing}
                          key={vi}
                          value={val}
                          style={{ width: "80px", minWidth: "64px", textAlign: "center" }}
                          onChangeFn={(v) => handleClosureChange(i, vi, v)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

              {isEditing && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addClosure} />
                  </td>
                </tr>
              )}

              {/* ── Accesorios fila 1 ── */}
              <tr>
                <td style={headerCellStyle}>Varilla mi</td>
                <td style={headerCellStyle}>Elastico envivar</td>
                <td style={headerCellStyle}>Hiladilla</td>
                <td style={headerCellStyle}>Broches decor</td>
                <td style={headerCellStyle}>Aro</td>
                <td style={headerCellStyle}>Tensor</td>
                <td style={headerCellStyle}>Zeta</td>
              </tr>
              {[0, 1, 2].map((row) => (
                <tr key={row}>
                  {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} style={cellStyle}>
                      <Field
                        isEditing={isEditing}
                        value={displayAccessories[col]?.values?.[row]}
                        style={{ textAlign: "center" }}
                        onChangeFn={(v) => handleAccessoryChange(col, row, v)}
                      />
                    </td>
                  ))}
                </tr>
              ))}

              {/* ── Accesorios fila 2 ── */}
              <tr>
                <td style={headerCellStyle}>Cinta ilus</td>
                <td style={headerCellStyle}>Elastico con base moi</td>
                <td style={headerCellStyle}>Marquilla</td>
                <td style={headerCellStyle}>Cordón redondi</td>
                <td style={headerCellStyle}>Sesgo</td>
                <td style={headerCellStyle}>Varilla plástic</td>
                <td style={headerCellStyle}>Elastico senc</td>
              </tr>
              {[0, 1, 2].map((row) => (
                <tr key={`second-${row}`}>
                  {[7, 8, 9, 10, 11, 12, 13].map((col) => (
                    <td key={col} style={cellStyle}>
                      <Field
                        isEditing={isEditing}
                        value={displayAccessories[col]?.values?.[row]}
                        style={{ textAlign: "center" }}
                        onChangeFn={(v) => handleAccessoryChange(col, row, v)}
                      />
                    </td>
                  ))}
                </tr>
              ))}

              {displayAccessories.slice(14).map((accessory, extraIndex) => {
                const accessoryIndex = extraIndex + 14;
                return (
                  <tr key={`extra-accessory-${accessoryIndex}`}>
                    <td style={headerCellStyle} colSpan={2}>
                      <Field
                        isEditing={isEditing}
                        value={accessory?.name}
                        placeholder={`Accesorio ${accessoryIndex + 1}`}
                        onChangeFn={(v) => {
                          const updated = [...(formData.accessories || [])];
                          if (!updated[accessoryIndex]) updated[accessoryIndex] = blankAccessory();
                          updated[accessoryIndex] = { ...updated[accessoryIndex], name: v };
                          handleChange("accessories", updated);
                        }}
                      />
                    </td>
                    <td colSpan={5} style={cellStyle}>
                      <div style={{ display: "flex", gap: "20px" }}>
                        {(accessory?.values || ["", "", ""]).map((val, vi) => (
                          <Field
                        isEditing={isEditing}
                            key={vi}
                            value={val}
                            style={{ width: "80px", minWidth: "64px", textAlign: "center" }}
                            onChangeFn={(v) => handleAccessoryChange(accessoryIndex, vi, v)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}

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
                  <Field
                        isEditing={isEditing}
                    value={displayMeasurements[0]?.values?.[0]}
                    style={{ textAlign: "center" }}
                    onChangeFn={(v) => handleMeasurementChange(0, 0, v)}
                  />
                </td>
                <td style={cellStyle} colSpan={3}>
                  <Field
                        isEditing={isEditing}
                    value={displayMeasurements[1]?.values?.[0]}
                    style={{ textAlign: "center" }}
                    onChangeFn={(v) => handleMeasurementChange(1, 0, v)}
                  />
                </td>
              </tr>
              <tr>
                <td style={cellStyle} colSpan={4}>
                  <Field
                        isEditing={isEditing}
                    value={displayMeasurements[0]?.values?.[1]}
                    style={{ textAlign: "center" }}
                    onChangeFn={(v) => handleMeasurementChange(0, 1, v)}
                  />
                </td>
                <td style={cellStyle} colSpan={3}>
                  <Field
                        isEditing={isEditing}
                    value={displayMeasurements[1]?.values?.[1]}
                    style={{ textAlign: "center" }}
                    onChangeFn={(v) => handleMeasurementChange(1, 1, v)}
                  />
                </td>
              </tr>

              {displayMeasurements.slice(2).map((measurement, extraIndex) => {
                const measurementIndex = extraIndex + 2;
                return (
                  <tr key={`extra-measurement-${measurementIndex}`}>
                    <td style={headerCellStyle} colSpan={2}>
                      <Field
                        isEditing={isEditing}
                        value={measurement?.name}
                        placeholder={`Medida ${measurementIndex + 1}`}
                        onChangeFn={(v) => {
                          const updated = [...(formData.measurements || [])];
                          if (!updated[measurementIndex]) updated[measurementIndex] = blankMeasurement();
                          updated[measurementIndex] = { ...updated[measurementIndex], name: v };
                          handleChange("measurements", updated);
                        }}
                      />
                    </td>
                    <td style={cellStyle} colSpan={5}>
                      <div style={{ display: "flex", gap: "20px" }}>
                        {(measurement?.values || ["", ""]).map((val, vi) => (
                          <Field
                        isEditing={isEditing}
                            key={vi}
                            value={val}
                            style={{ width: "90px", textAlign: "center" }}
                            onChangeFn={(v) => handleMeasurementChange(measurementIndex, vi, v)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}

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
                  <Field
                        isEditing={isEditing} value={formData.observations} onChangeFn={(v) => handleChange("observations", v)} />
                </td>
              </tr>
              <tr>
                <td style={headerCellStyle} colSpan={2}>ELABORÓ:</td>
                <td style={cellStyle} colSpan={5}>
                  <Field
                        isEditing={isEditing} value={formData.createdBy} onChangeFn={(v) => handleChange("createdBy", v)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Columna derecha: imagen */}
        <div style={{ flex: 1 }}>
          <div style={{
            border: imagePreview ? "1.5px solid #f9a8d4" : "2px dashed #f9a8d4",
            borderRadius: "12px",
            padding: "16px",
            backgroundColor: imagePreview ? "#fff0fb" : "#fafafa",
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
                  style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px" }}
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setImagePreview(null); handleChange("image", null); }}
                    style={{
                      marginTop: "10px",
                      padding: "6px 16px",
                      backgroundColor: "#fff",
                      border: "1.5px solid #ff4fd6",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#ff4fd6",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fff0fb"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fff"; }}
                  >
                    × Eliminar imagen
                  </button>
                )}
              </div>
            ) : (
              <>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="#ff4fd6" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
                  {isEditing ? (
                    <><span style={{ color: "#ff4fd6", fontWeight: 700, cursor: "pointer" }}>Sube una imagen</span><br />o arrastra y suelta</>
                  ) : "Sin imagen"}
                </p>
                {isEditing && (
                  <>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#9ca3af" }}>PNG, JPG, GIF hasta 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} id="image-upload" />
                    <label htmlFor="image-upload" style={{
                      marginTop: "10px",
                      padding: "6px 16px",
                      backgroundColor: "#f3f4f6",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#6b7280",
                      cursor: "pointer"
                    }}>
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