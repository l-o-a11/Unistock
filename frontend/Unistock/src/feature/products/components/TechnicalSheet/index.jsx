import React, { useState } from "react";
import HoverCard from "../HoverCard";
import { CupTypes, ClousereTypes, Accesories } from "../../types/constants";

// ── Shared cell/input styles ──────────────────────────────────────────────────
const cellStyle = {
  border: "1px solid #e5e7eb",
  padding: "6px 10px",
  fontSize: "13px",
  color: "#333",
  minWidth: "60px",
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
  padding: "2px 0",
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
    onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  </button>
);

const TechnicalSheet = ({ sheet, isEditing = false, onChange, onSave }) => {
  const [formData, setFormData] = useState(
    sheet || {
      client: "",
      date: new Date().toISOString().split("T")[0],
      ref: "",
      type: "",
      description: "",
      fabrics: [
        { name: "MALLATEX", consumption: "0.59", pieces: "34", talla: "" },
        { name: "DESTELLANTE", consumption: "0.66", pieces: "", talla: "única" },
      ],
      cups: [
        { type: "Copa ojo de gato straple con realce", talla34: "", talla36: "", talla38: "", talla40: "", talla42: "" },
        { type: "Copa vergara con realce",             talla34: "", talla36: "", talla38: "", talla40: "", talla42: "" },
        { type: "Copa ojo de gato sisa con realce",    talla34: "", talla36: "", talla38: "", talla40: "", talla42: "" },
      ],
      closures: [
        { type: "Abrochadura o gafete",  opcion1: "1x1", opcion2: "2x1", opcion3: "3x1" },
        { type: "Elástico cargadera",    opcion1: "10mm 0,45", opcion2: "15mm", opcion3: "20mm" },
      ],
      accessories: [
        { name: "Varilla metálica completa", values: ["", "", ""] },
        { name: "Elastico envivar",          values: ["", "", ""] },
        { name: "Hiladilla",                 values: ["", "", ""] },
        { name: "Broches decorativos",       values: ["", "", ""] },
        { name: "Aro",                       values: ["", "", ""] },
        { name: "Tensor",                    values: ["", "", ""] },
        { name: "Zeta",                      values: ["", "", ""] },
        { name: "Cinta ilusión",             values: ["", "", ""] },
        { name: "Elastico con base mora",    values: ["", "", ""] },
        { name: "Marquilla",                 values: ["", "", ""] },
        { name: "Cordón redondo",            values: ["", "", ""] },
        { name: "Sesgo tapavarilla",         values: ["", "", ""] },
        { name: "Varilla plástica",          values: ["", "", ""] },
        { name: "Elastico sencillo",         values: ["", "", ""] },
      ],
      measurements: [
        { name: "Medidas cargaderas",        values: ["", ""] },
        { name: "Medidas varillas plásticas",values: ["", ""] },
      ],
      observations: "",
      createdBy: "",
    }
  );

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  // Fabrics
  const handleFabricChange = (i, field, value) => {
    const updated = [...formData.fabrics];
    updated[i] = { ...updated[i], [field]: value };
    handleChange("fabrics", updated);
  };
  const addFabric = () =>
    handleChange("fabrics", [...formData.fabrics, { name: "", consumption: "", pieces: "", talla: "" }]);

  // Cups
  const handleCupChange = (i, field, value) => {
    const updated = [...formData.cups];
    updated[i] = { ...updated[i], [field]: value };
    handleChange("cups", updated);
  };
  const addCup = () =>
    handleChange("cups", [...formData.cups, { type: "", talla34: "", talla36: "", talla38: "", talla40: "", talla42: "" }]);

  // Closures
  const handleClosureChange = (i, field, value) => {
    const updated = [...formData.closures];
    updated[i] = { ...updated[i], [field]: value };
    handleChange("closures", updated);
  };
  const addClosure = () =>
    handleChange("closures", [...formData.closures, { type: "", opcion1: "", opcion2: "", opcion3: "" }]);

  // Accessories
  const handleAccessoryChange = (i, vi, value) => {
    const updated = [...formData.accessories];
    const vals = [...updated[i].values];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("accessories", updated);
  };
  const addAccessory = () =>
    handleChange("accessories", [...formData.accessories, { name: "", values: ["", "", ""] }]);

  // Measurements
  const handleMeasurementChange = (i, field, value) => {
    const updated = [...formData.measurements];
    updated[i] = { ...updated[i], [field]: value };
    handleChange("measurements", updated);
  };
  const handleMeasurementValueChange = (i, vi, value) => {
    const updated = [...formData.measurements];
    const vals = [...updated[i].values];
    vals[vi] = value;
    updated[i] = { ...updated[i], values: vals };
    handleChange("measurements", updated);
  };
  const addMeasurement = () =>
    handleChange("measurements", [...formData.measurements, { name: "", values: ["", ""] }]);

  const tallas = ["34", "36", "38"];

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "0",
  };

  return (
    <div style={{ backgroundColor: "#fff", fontFamily: "sans-serif" }}>
      {/* Title */}
      <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 20px 0" }}>
        {isEditing ? (sheet ? "Editar Ficha Técnica" : "Crear Ficha Técnica") : "Ficha Técnica"}
      </h2>

      <table style={tableStyle}>
        <tbody>

          {/* ── Row 1: Cliente / Fecha / REF ── */}
          <tr>
            <td style={{ ...headerCellStyle, width: "80px" }}>Cliente:</td>
            <td style={{ ...cellStyle, width: "160px" }}>
              {isEditing ? (
                <input style={inputStyle} value={formData.client} onChange={(e) => handleChange("client", e.target.value)} placeholder="Diego Perez" />
              ) : formData.client}
            </td>
            <td style={{ ...headerCellStyle, width: "60px" }}>Fecha:</td>
            <td style={{ ...cellStyle, width: "120px" }}>
              {isEditing ? (
                <input style={inputStyle} type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} />
              ) : formData.date}
            </td>
            <td style={{ ...headerCellStyle, width: "40px" }}>REF:</td>
            <td style={cellStyle}>
              {isEditing ? (
                <input style={inputStyle} value={formData.ref} onChange={(e) => handleChange("ref", e.target.value)} placeholder="772" />
              ) : formData.ref}
            </td>
          </tr>

          {/* ── Row 2: Tipo de prenda ── */}
          <tr>
            <td style={headerCellStyle}>Tipo de prenda:</td>
            <td colSpan={5} style={cellStyle}>
              {isEditing ? (
                <input style={inputStyle} value={formData.type} onChange={(e) => handleChange("type", e.target.value)} placeholder="Body manga larga con cortes diagonales" />
              ) : formData.type}
            </td>
          </tr>

          {/* ── Row 3: Descripción ── */}
          <tr>
            <td style={{ ...headerCellStyle, verticalAlign: "top", paddingTop: "10px" }}>Descripción:</td>
            <td colSpan={5} style={cellStyle}>
              {isEditing ? (
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Body manga larga, con cortes diagonales en destellante y mallatex..."
                />
              ) : formData.description}
            </td>
          </tr>

          {/* ── Fabrics: Tela 1, Tela 2 … ── */}
          {formData.fabrics.map((fabric, i) => (
            <tr key={i}>
              <td style={headerCellStyle}>Tela {i + 1}:</td>
              <td style={cellStyle}>
                {isEditing ? (
                  <input style={inputStyle} value={fabric.name} onChange={(e) => handleFabricChange(i, "name", e.target.value)} placeholder="MALLATEX" />
                ) : fabric.name}
              </td>
              <td style={headerCellStyle}>Consumo:</td>
              <td style={cellStyle}>
                {isEditing ? (
                  <input style={inputStyle} value={fabric.consumption} onChange={(e) => handleFabricChange(i, "consumption", e.target.value)} placeholder="0.59" />
                ) : fabric.consumption}
              </td>
              <td style={headerCellStyle}># De piezas:</td>
              <td style={cellStyle}>
                {isEditing ? (
                  <input style={inputStyle} value={fabric.pieces} onChange={(e) => handleFabricChange(i, "pieces", e.target.value)} placeholder="34" />
                ) : fabric.pieces}
              </td>
            </tr>
          ))}
          {/* Tela 2 row also has Talla */}
          {formData.fabrics.length >= 2 && (
            <tr>
              <td style={headerCellStyle}>Tela 2:</td>
              <td style={cellStyle}>{isEditing ? (
                <input style={inputStyle} value={formData.fabrics[1]?.name} onChange={(e) => handleFabricChange(1, "name", e.target.value)} />
              ) : formData.fabrics[1]?.name}</td>
              <td style={headerCellStyle}>Consumo:</td>
              <td style={cellStyle}>{isEditing ? (
                <input style={inputStyle} value={formData.fabrics[1]?.consumption} onChange={(e) => handleFabricChange(1, "consumption", e.target.value)} />
              ) : formData.fabrics[1]?.consumption}</td>
              <td style={headerCellStyle}>Talla:</td>
              <td style={cellStyle}>{isEditing ? (
                <input style={inputStyle} value={formData.fabrics[1]?.talla} onChange={(e) => handleFabricChange(1, "talla", e.target.value)} placeholder="única" />
              ) : formData.fabrics[1]?.talla}</td>
            </tr>
          )}
          {/* Add fabric button */}
          {isEditing && (
            <tr>
              <td colSpan={6} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                <AddRowBtn onClick={addFabric} />
              </td>
            </tr>
          )}

          {/* ── Cups header row ── */}
          <tr>
            {["Copa ojo de gato straple con realce", "Copa vergara con realce", "Copa ojo de gato sisa con realce", "Abrochadura o gafete", "Elástico cargadera"].map((h, i) => (
              <td key={i} colSpan={i < 3 ? 1 : 1} style={{ ...headerCellStyle, fontSize: "11px", textAlign: "center" }}>{h}</td>
            ))}
            <td style={headerCellStyle}></td>
          </tr>

          {/* Cup + closure value rows (tallas 34, 36, 38) */}
          {tallas.map((talla, ri) => (
            <tr key={talla}>
              {/* 3 cup cols */}
              {formData.cups.slice(0, 3).map((cup, ci) => (
                <td key={ci} style={{ ...cellStyle, textAlign: "center" }}>
                  {isEditing ? (
                    <input style={{ ...inputStyle, textAlign: "center" }} value={cup[`talla${talla}`] || ""} onChange={(e) => handleCupChange(ci, `talla${talla}`, e.target.value)} placeholder={talla} />
                  ) : (cup[`talla${talla}`] || talla)}
                </td>
              ))}
              {/* Abrochadura */}
              <td style={{ ...cellStyle, textAlign: "center" }}>
                {isEditing ? (
                  <input style={{ ...inputStyle, textAlign: "center" }} value={formData.closures[0]?.[`opcion${ri + 1}`] || ""} onChange={(e) => handleClosureChange(0, `opcion${ri + 1}`, e.target.value)} />
                ) : formData.closures[0]?.[`opcion${ri + 1}`]}
              </td>
              {/* Elástico cargadera */}
              <td style={{ ...cellStyle, textAlign: "center" }}>
                {isEditing ? (
                  <input style={{ ...inputStyle, textAlign: "center" }} value={formData.closures[1]?.[`opcion${ri + 1}`] || ""} onChange={(e) => handleClosureChange(1, `opcion${ri + 1}`, e.target.value)} />
                ) : formData.closures[1]?.[`opcion${ri + 1}`]}
              </td>
              <td style={cellStyle}></td>
            </tr>
          ))}
          {isEditing && (
            <tr>
              <td colSpan={6} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                <AddRowBtn onClick={addCup} />
              </td>
            </tr>
          )}

          {/* ── Accessories header row ── */}
          <tr>
            {formData.accessories.slice(0, 7).map((acc, i) => (
              <td key={i} style={{ ...headerCellStyle, fontSize: "11px" }}>
                {isEditing ? (
                  <input style={{ ...inputStyle, fontWeight: "600", textAlign: "center" }} value={acc.name} onChange={(e) => {
                    const updated = [...formData.accessories];
                    updated[i] = { ...updated[i], name: e.target.value };
                    handleChange("accessories", updated);
                  }} />
                ) : acc.name}
              </td>
            ))}
          </tr>
          {/* Accessory value rows */}
          {[0, 1, 2].map((vi) => (
            <tr key={vi}>
              {formData.accessories.slice(0, 7).map((acc, ai) => (
                <td key={ai} style={{ ...cellStyle, textAlign: "center" }}>
                  {isEditing ? (
                    <input style={{ ...inputStyle, textAlign: "center" }} value={acc.values[vi] || ""} onChange={(e) => handleAccessoryChange(ai, vi, e.target.value)} />
                  ) : acc.values[vi]}
                </td>
              ))}
            </tr>
          ))}
          {isEditing && (
            <tr>
              <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                <AddRowBtn onClick={addAccessory} />
              </td>
            </tr>
          )}

          {/* ── Accessories row 2 (remaining accessories) ── */}
          <tr>
            {formData.accessories.slice(7, 14).map((acc, i) => (
              <td key={i} style={{ ...headerCellStyle, fontSize: "11px" }}>
                {isEditing ? (
                  <input style={{ ...inputStyle, fontWeight: "600", textAlign: "center" }} value={acc.name} onChange={(e) => {
                    const updated = [...formData.accessories];
                    updated[i + 7] = { ...updated[i + 7], name: e.target.value };
                    handleChange("accessories", updated);
                  }} />
                ) : acc.name}
              </td>
            ))}
          </tr>
          {[0, 1, 2].map((vi) => (
            <tr key={vi}>
              {formData.accessories.slice(7, 14).map((acc, ai) => (
                <td key={ai} style={{ ...cellStyle, textAlign: "center" }}>
                  {isEditing ? (
                    <input style={{ ...inputStyle, textAlign: "center" }} value={acc.values[vi] || ""} onChange={(e) => handleAccessoryChange(ai + 7, vi, e.target.value)} />
                  ) : acc.values[vi]}
                </td>
              ))}
            </tr>
          ))}
          {isEditing && (
            <tr>
              <td colSpan={7} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                <AddRowBtn onClick={addAccessory} />
              </td>
            </tr>
          )}

          {/* ── Measurements ── */}
          {formData.measurements.map((m, i) => (
            <tr key={i}>
              <td colSpan={2} style={{ ...headerCellStyle, textAlign: "center" }}>
                {isEditing ? (
                  <input style={{ ...inputStyle, fontWeight: "600", textAlign: "center" }} value={m.name} onChange={(e) => handleMeasurementChange(i, "name", e.target.value)} />
                ) : m.name}
              </td>
              {m.values.map((v, vi) => (
                <td key={vi} style={{ ...cellStyle, textAlign: "center" }}>
                  {isEditing ? (
                    <input style={{ ...inputStyle, textAlign: "center" }} value={v} onChange={(e) => handleMeasurementValueChange(i, vi, e.target.value)} />
                  ) : v}
                </td>
              ))}
              <td colSpan={6 - m.values.length} style={cellStyle}></td>
            </tr>
          ))}
          {/* Measurement value rows */}
          {[0, 1].map((vi) => (
            <tr key={vi}>
              {formData.measurements.map((m, mi) => (
                <React.Fragment key={mi}>
                  <td colSpan={2} style={{ ...cellStyle, textAlign: "center" }}>
                    {isEditing ? (
                      <input style={{ ...inputStyle, textAlign: "center" }} value={m.values[vi] || ""} onChange={(e) => handleMeasurementValueChange(mi, vi, e.target.value)} />
                    ) : m.values[vi]}
                  </td>
                </React.Fragment>
              ))}
              <td colSpan={3} style={cellStyle}></td>
            </tr>
          ))}
          {isEditing && (
            <tr>
              <td colSpan={6} style={{ padding: "4px 8px", border: "1px solid #e5e7eb" }}>
                <AddRowBtn onClick={addMeasurement} />
              </td>
            </tr>
          )}

          {/* ── Observaciones ── */}
          <tr>
            <td colSpan={6} style={{ ...cellStyle, fontWeight: "600" }}>
              OBSERVACIONES:{" "}
              {isEditing ? (
                <input style={{ ...inputStyle, display: "inline", width: "80%" }} value={formData.observations} onChange={(e) => handleChange("observations", e.target.value)} placeholder="Conservar apariencia lisa de la prenda, no recogidos." />
              ) : formData.observations}
            </td>
          </tr>

          {/* ── Elaboró ── */}
          <tr>
            <td colSpan={6} style={{ ...cellStyle, fontWeight: "600" }}>
              ELABORÓ:{" "}
              {isEditing ? (
                <input style={{ ...inputStyle, display: "inline", width: "80%" }} value={formData.createdBy} onChange={(e) => handleChange("createdBy", e.target.value)} placeholder="Paula Andrea Builes." />
              ) : formData.createdBy}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
};

export default TechnicalSheet;