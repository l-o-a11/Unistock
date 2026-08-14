import React, { useState, useEffect } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { AuthAPI } from "../../../auth/services/AuthAPI";

const cellStyle = {
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  fontSize: "13px",
  color: "#333",
  minHeight: "36px",
  verticalAlign: "middle",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const headerCellStyle = {
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  fontSize: "12px",
  color: "#444",
  backgroundColor: "#f9f9f9",
  fontWeight: "600",
  textAlign: "center",
  verticalAlign: "middle",
  // Permitir wrap para que las cabeceras muestren el texto completo
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const inputStyle = {
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "13px",
  color: "#333",
  background: "transparent",
  padding: "4px 0",
  resize: "none",
  overflow: "hidden",
  minHeight: "24px",
  lineHeight: "1.4",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

// Estilo para modo vista — misma estructura visual que el input
const readStyle = {
  display: "block",
  width: "100%",
  fontSize: "13px",
  color: "#333",
  padding: "4px 0",
  minHeight: "22px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: "1.4",
};

const clampRows = (value) => {
  const lines = String(value || "").split(/\r?\n/).length;
  const approx = Math.max(1, Math.ceil((String(value || "").length + 1) / 50));
  return Math.min(Math.max(lines, approx), 8);
};

// ✅ Declarado fuera del componente para evitar recreación en cada render
const normalizeVertical = (v) => {
  if (!v) return "";
  const lines = String(v || "").split(/\r?\n/).map((l) => l.trim());
  const singleCharLines = lines.filter((l) => l.length <= 1).length;
  if (lines.length >= 3 && singleCharLines / lines.length > 0.6) {
    const joined = lines.join("");
    const words = joined.split(/\s+/).filter(Boolean);
    return words.join("\n");
  }
  return v;
};

const Field = ({ value, onChangeFn, style = {}, placeholder = "", isEditing }) =>
  isEditing ? (
    <textarea
      style={{ ...inputStyle, ...style }}
      rows={clampRows(value)}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
        onChangeFn(e.target.value);
      }}
      onInput={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
    />
  ) : (
    <span style={{ ...readStyle, ...style }}>{normalizeVertical(value) || ""}</span>
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

const isBlankCup = (cup) => !cup || (!hasValue(cup.type) && !((cup.values || []).some(hasValue)));
const isBlankClosure = (closure) => !closure || (!hasValue(closure.type) && !((closure.values || []).some(hasValue)));
const isBlankMeasurement = (measurement) => !measurement || (!hasValue(measurement.name) && !((measurement.values || []).some(hasValue)));
const hasAccessoryValues = (accessory) => accessory && (hasValue(accessory.name) || (accessory.values || []).some(hasValue));

const buildInitialData = (sheet, productName, categoryDescription, productRef, productImage) => {
  const initialData = sheet || { ...EMPTY_SHEET };
  const currentUser = AuthAPI.getSession();
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  return {
    ...initialData,
    date:        hasValue(initialData.date)        ? initialData.date        : today,
    createdBy:   hasValue(initialData.createdBy)   ? initialData.createdBy   : (currentUser?.nombre || ""),
    type:        hasValue(initialData.type)        ? initialData.type        : (productName || ""),
    description: hasValue(initialData.description) ? initialData.description : (categoryDescription || ""),
    ref:         hasValue(initialData.ref)         ? initialData.ref         : (productRef || ""),
    // Imagen: usar la del producto si la ficha no tiene una propia
    image:       hasValue(initialData.image)       ? initialData.image        : (productImage || null),
    // Siempre 14 slots fijos para que las celdas de la tabla nunca colapsen
    accessories: mergeAccessories(initialData.accessories || []),
    cups: (initialData.cups || []).slice(0, 1),
  };
};

const TechnicalSheet = ({ sheet, isEditing = false, onChange, productName = "", categoryDescription = "", productRef = "", productImage = null }) => {
  const [formData, setFormData] = useState(() =>
    buildInitialData(sheet, productName, categoryDescription, productRef, productImage)
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
    setFormData(buildInitialData(sheet, productName, categoryDescription, productRef, productImage));
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
    const current = formData.cups || [];
    if (current.length >= 1) return;
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

  const setClosureValues = (i, valuesArray) => {
    const updated = [...(formData.closures || [])];
    if (!updated[i]) updated[i] = blankClosure();
    updated[i] = { ...updated[i], values: valuesArray };
    handleChange("closures", updated);
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

  const setAccessoryValues = (i, valuesArray) => {
    const base = formData.accessories && formData.accessories.length >= 14
      ? [...formData.accessories]
      : mergeAccessories(formData.accessories || []);
    if (!base[i]) base[i] = blankAccessory();
    base[i] = { ...base[i], values: valuesArray };
    handleChange("accessories", base);
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
  // Forzar layout fijo evita que columnas cambien de orden o colapsen en pantallas pequeñas
  // y mantiene la fila Cliente / Fecha en su posición.
  tableStyle.tableLayout = 'fixed';

    const displayAccessories = formData.accessories || [];
  const displayMeasurements = formData.measurements || [];
  const displayCups         = (formData.cups || []).slice(0, 1);
  const displayClosures     = formData.closures      || [];

  const visibleCups = isEditing ? displayCups : displayCups.filter((cup) => !isBlankCup(cup));
  const visibleClosures = isEditing ? displayClosures : displayClosures.filter((closure) => !isBlankClosure(closure));
  const visibleMeasurements = isEditing ? displayMeasurements : displayMeasurements.filter((measurement) => !isBlankMeasurement(measurement));
  const visibleExtraAccessories = isEditing ? displayAccessories.slice(14) : displayAccessories.slice(14).filter(hasAccessoryValues);

  const accessoryBlockRenderInfo = (start, end) => {
    const block = displayAccessories.slice(start, end);
    const rowHasValue = (row) => block.some((accessory) =>
      String(accessory?.values?.[row] || "").trim() !== ""
    );

    const firstRow = [0, 1, 2].find(rowHasValue);
    const lastRow = [2, 1, 0].find(rowHasValue);

    if (firstRow === undefined || lastRow === undefined) {
      return { startRow: 0, rowCount: isEditing ? 1 : 0 };
    }

    return { startRow: firstRow, rowCount: lastRow - firstRow + 1 };
  };

  const accessoryFirstRender = accessoryBlockRenderInfo(0, 7);
  const accessorySecondRender = accessoryBlockRenderInfo(7, 14);
  const shouldRenderAccessories = isEditing || accessoryFirstRender.rowCount > 0 || accessorySecondRender.rowCount > 0 || visibleExtraAccessories.length > 0;
  const shouldRenderCups = isEditing || visibleCups.length > 0;
  const shouldRenderClosures = isEditing || visibleClosures.length > 0;
  const shouldRenderMeasurements = isEditing || visibleMeasurements.length > 0;

  // determine which accessory columns actually have content (avoid rendering empty tds)
  const allFirstCols = [0,1,2,3,4,5,6];
  const allSecondCols = [7,8,9,10,11,12,13];
  const accessoryFirstCols = isEditing ? allFirstCols : allFirstCols.filter((col) => hasAccessoryValues(displayAccessories[col]));
  const accessorySecondCols = isEditing ? allSecondCols : allSecondCols.filter((col) => hasAccessoryValues(displayAccessories[col]));

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="ts-wrapper" style={{ backgroundColor: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "20px", flexDirection: isMobile ? 'column' : 'row' }}>
        <style>{`
          @media (max-width: 768px) {
            .ts-header-cell { font-size: 12px; }
            .ts-cell { font-size: 12px; }
            .ts-table { width: 100% !important; border-collapse: collapse !important; }
            .ts-table col { width: auto !important; }
            .ts-table th, .ts-table td { white-space: normal !important; word-break: break-word !important; padding: 6px 8px !important; }
            .ts-wrapper { overflow-x: hidden !important; }
            .ts-inner { max-width: 100%; overflow-x: hidden; }

            /* Apilar filas y celdas para evitar overflow horizontal. Cada celda ocupa 100%. */
            .ts-table, .ts-table tbody, .ts-table thead, .ts-table tr, .ts-table th, .ts-table td {
              display: block !important;
              width: 100% !important;
            }
            .ts-table tr { margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
            .ts-table th { text-align: left; padding-bottom: 4px; }
            .ts-table td { padding: 6px 0; }
          }
        `}</style>
        {/* Columna izquierda */}
        <div style={{ flex: 2 }} className="ts-inner">
          <table className="ts-table" style={tableStyle}>
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '1%' }} />
              <col />
            </colgroup>
            <tbody>

              {/* ── Row 1: Cliente / Fecha / REF ── */}
              <tr>
                <td style={{ ...headerCellStyle, width: "80px" }}>Cliente:</td>
                <td style={{ ...cellStyle, width: "140px" }}>
                  <Field
                        isEditing={isEditing} value={formData.client} onChangeFn={(v) => handleChange("client", v)} />
                </td>
                <td style={{ ...headerCellStyle, width: "70px" }}>Fecha:</td>
                <td style={{ ...cellStyle, width: "100px" }}>
                  <Field
                        isEditing={isEditing} value={formData.date} onChangeFn={(v) => handleChange("date", v)} />
                </td>
                <td style={{ ...headerCellStyle, width: "60px" }}>Referencia:</td>
                <td colSpan={2} style={{ ...cellStyle }}>
                  <Field
                        isEditing={isEditing} value={formData.ref} onChangeFn={(v) => handleChange("ref", v)} />
                </td>
              </tr>

              {/* ── Row 2: Tipo de prenda / Descripción ── */}
              <tr>
                <td style={headerCellStyle}>Tipo de prenda:</td>
                <td colSpan={2} style={cellStyle}>
                  <Field
                        isEditing={isEditing} value={formData.type} onChangeFn={(v) => handleChange("type", v)} />
                </td>
                <td style={headerCellStyle}>Descripción:</td>
                <td colSpan={3} style={cellStyle}>
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
                  <td colSpan={2} style={cellStyle}>
                    <Field
                        isEditing={isEditing}
                      value={i === 2 ? fabric?.talla : fabric?.pieces}
                      onChangeFn={(v) => handleFabricChange(i, i === 2 ? "talla" : "pieces", v)}
                    />
                  </td>
                  {/* removed empty filler cell to avoid selectable empty cells */}
                </tr>
              ))}

              {isEditing && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addFabric} />
                  </td>
                </tr>
              )}

              {/* ── Copas ── */}
              {shouldRenderCups && (
                <>
                  <tr>
                    <td colSpan={7} style={{ ...headerCellStyle, textAlign: "left" }}>
                      Copas
                    </td>
                  </tr>

                  {visibleCups.map((cup, i) => (
                    <tr key={`cup-${i}`}>
                      <td style={{ ...headerCellStyle, textAlign: "left" }}>
                        Copa {i + 1}
                      </td>
                      <td colSpan={6} style={cellStyle}>
                        <Field
                          isEditing={isEditing}
                          value={(cup?.values || ["", "", ""]).filter(Boolean).join(" ")}
                          onChangeFn={(v) => {
                            const values = v.split(" ").slice(0, 3);
                            const updated = [...(formData.cups || [])];
                            if (!updated[i]) updated[i] = blankCup();
                            updated[i] = { ...updated[i], values };
                            handleChange("cups", updated);
                          }}
                          placeholder="Información de copa"
                          style={{ width: "100%", minHeight: "32px" }}
                        />
                      </td>
                    </tr>
                  ))}

                  {isEditing && displayCups.length === 0 && (
                    <tr>
                      <td style={{ ...headerCellStyle, textAlign: "left", whiteSpace: "nowrap", padding: "8px 12px" }}>
                        Copa 1
                      </td>
                      <td colSpan={6} style={cellStyle}>
                        <Field
                          isEditing={isEditing}
                          value=""
                          placeholder="Información de copa"
                          style={{ width: "100%", minHeight: "32px" }}
                          onChangeFn={(v) => {
                            const values = v.split(" ").slice(0, 3);
                            const updated = [...(formData.cups || [])];
                            updated[0] = { ...blankCup(), values };
                            handleChange("cups", updated);
                          }}
                        />
                      </td>
                    </tr>
                  )}

                  {isEditing && displayCups.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                        <AddRowBtn onClick={addCup} />
                      </td>
                    </tr>
                  )}
                </>
              )}

              {shouldRenderClosures && (displayClosures || []).map((closure, i) => {
                if (!isEditing && isBlankClosure(closure)) return null;
                const titlePlaceholder = i === 0 ? "Abrochadura o gafete" : i === 1 ? "Elastico cargadera" : `Cierre ${i + 1}`;
                const valuesText = (closure?.values || []).filter(Boolean).join(" ");

                return (
                  <tr key={`closure-${i}`}>
                    <td style={{ ...headerCellStyle, textAlign: "left" }}>{closure?.type || titlePlaceholder}</td>
                    <td colSpan={6} style={cellStyle}>
                      <Field
                        isEditing={isEditing}
                        value={valuesText}
                        placeholder={titlePlaceholder}
                        onChangeFn={(v) => {
                          const vals = v.split(/\s+/).filter(Boolean).slice(0, 3);
                          setClosureValues(i, [...vals, ...(Array(3 - vals.length).fill(""))]);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}

              {isEditing && shouldRenderClosures && (
                <tr>
                  <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                    <AddRowBtn onClick={addClosure} />
                  </td>
                </tr>
              )}

              {/* ── Accesorios fila 1 ── */}
              {/** Render each accessory as a single row with name + one data cell to avoid multiple selectable cells */}
              { (isEditing ? allFirstCols : accessoryFirstCols).map((col) => {
                const title = ["Varilla mi","Elastico envivar","Hiladilla","Broches decor","Aro","Tensor","Zeta"][col];
                const values = (displayAccessories[col]?.values || []).filter(Boolean).join(" | ");
                return (
                  <tr key={`acc1-${col}`}>
                    <td style={headerCellStyle}>{title}</td>
                    <td colSpan={6} style={cellStyle}>
                      <Field
                        isEditing={isEditing}
                        value={values}
                        placeholder={title}
                        onChangeFn={(v) => {
                          const vals = v.split("|").map(s => s.trim()).slice(0,3);
                          setAccessoryValues(col, [...vals, ...(Array(3 - vals.length).fill(""))]);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* ── Accesorios fila 2 ── */}
              {(isEditing ? allSecondCols : accessorySecondCols).map((col) => {
                const title = ["Cinta ilus","Elastico con base moi","Marquilla","Cordón redondi","Sesgo","Varilla plástic","Elastico senc"][col - 7];
                const values = (displayAccessories[col]?.values || []).filter(Boolean).join(" | ");
                return (
                  <tr key={`acc2-${col}`}>
                    <td style={headerCellStyle}>{title}</td>
                    <td colSpan={6} style={cellStyle}>
                      <Field
                        isEditing={isEditing}
                        value={values}
                        placeholder={title}
                        onChangeFn={(v) => {
                          const vals = v.split("|").map(s => s.trim()).slice(0,3);
                          setAccessoryValues(col, [...vals, ...(Array(3 - vals.length).fill(""))]);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}

              {visibleExtraAccessories.map((accessory, extraIndex) => {
                const accessoryIndex = displayAccessories.findIndex((a, idx) => idx >= 14 && a === accessory);
                const valuesText = (accessory?.values || []).filter(Boolean).join(" | ");
                return (
                  <tr key={`extra-accessory-${accessoryIndex}`}>
                    <td style={headerCellStyle}>{accessory?.name || `Accesorio ${accessoryIndex + 1}`}</td>
                    <td colSpan={6} style={cellStyle}>
                      <Field
                        isEditing={isEditing}
                        value={valuesText}
                        placeholder={`Accesorio ${accessoryIndex + 1}`}
                        onChangeFn={(v) => {
                          const vals = v.split("|").map(s => s.trim()).filter(Boolean).slice(0,3);
                          setAccessoryValues(accessoryIndex, [...vals, ...(Array(3 - vals.length).fill(""))]);
                        }}
                      />
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

              {shouldRenderMeasurements && (
                <>
                  {shouldRenderMeasurements && (
                    <>
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
                    </>
                  )}
                </>
              )}

              {visibleMeasurements.slice(2).map((measurement, extraIndex) => {
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

        {/* Columna derecha: imagen (en mobile se muestra debajo) */}
        <div style={{ flex: 1, width: isMobile ? '100%' : undefined }}>
          <div style={{
            border: imagePreview ? "1.5px solid #f9a8d4" : "2px dashed #f9a8d4",
            borderRadius: "12px",
            padding: isMobile ? "12px" : "16px",
            backgroundColor: imagePreview ? "#fff0fb" : "#fafafa",
            minHeight: isMobile ? "180px" : "520px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}>
            {imagePreview ? (
              <div style={{ textAlign: "center", width: "100%" }}>
                <img
                  src={imagePreview}
                  alt="Producto"
                  style={{ width: "100%", maxWidth: "100%", maxHeight: isMobile ? "260px" : "520px", height: "auto", objectFit: "contain", borderRadius: "8px" }}
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