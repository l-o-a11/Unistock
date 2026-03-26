import React, { useState, useEffect } from "react";
import Alert from "../../../shared/components/Alert";
import { validateField } from "../../../shared/utils/validators";

import {
  getInputStyleBox,
  errorStyle,
  labelStyle,
  requiredStar,
  btnPrimary,
  btnSecondary,
} from "../../../shared/utils/validationStyles";

const STORAGE_KEY = "supplyForm_draft";

// ───────────────── INPUT REUTILIZABLE
const FormInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  type = "text",
  placeholder = "",
  options = null,
  disabled = false,
}) => {
  const hasError = touched?.[name] && !!error;

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={requiredStar}>*</span>}
      </label>

      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          style={getInputStyleBox(hasError)}
          disabled={disabled}
        >
          <option value="">Seleccionar {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.nombre}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          style={getInputStyleBox(hasError)}
          disabled={disabled}
        />
      )}

      {hasError && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

// ───────────────── TABLA
const PropiedadesTable = ({ propiedades, propiedadesData = [], onDelete, error }) => {
  if (propiedades.length === 0) {
    return (
      <div style={{
        padding: 20,
        border: "2px dashed",
        borderColor: error ? "#ef4444" : "#d1d5db",
        borderRadius: 8,
        textAlign: "center",
      }}>
        <p style={{ fontSize: 13, color: error ? "#ef4444" : "#6b7280" }}>
          {error ? "⚠ Debes agregar al menos una propiedad" : "No hay propiedades."}
        </p>
      </div>
    );
  }

  return (
    <table style={{ width: "100%", marginTop: 10 }}>
      <tbody>
        {propiedades.map((p) => {
          const data = propiedadesData.find(x => x.id === p.propiedadId);
          return (
            <tr key={p.propiedadId}>
              <td>{data?.nombre}</td>
              <td>{p.valor}</td>
              <td><button onClick={() => onDelete(p.propiedadId)}>×</button></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// ───────────────── FORM PRINCIPAL
const SupplyForm = ({
  supply,
  medidas = [],
  propiedades = [],
  categorias = [],
  onSubmit,
  onCancel,
}) => {

  // 🔥 CARGAR DESDE LOCALSTORAGE
  const getInitialData = () => {
    if (supply) return supply;

    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          nombre: "",
          categoriaId: "",
          stock: "",
          valorMedida: "",
          medidaId: "",
          propiedades: [],
        };
  };

  const [formData, setFormData] = useState(getInitialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [propiedadId, setPropiedadId] = useState("");
  const [valorPropiedad, setValorPropiedad] = useState("");

  // 🔥 GUARDAR AUTOMÁTICO EN LOCALSTORAGE
  useEffect(() => {
    if (!supply) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // VALIDAR
  const validateFormField = (name, value) => {
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    validateFormField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    validateFormField(name, value);
  };

  // PROPIEDADES
  const agregarPropiedad = () => {
    if (!propiedadId || !valorPropiedad) return;

    setFormData((prev) => ({
      ...prev,
      propiedades: [
        ...prev.propiedades,
        { propiedadId: parseInt(propiedadId), valor: valorPropiedad },
      ],
    }));

    setPropiedadId("");
    setValorPropiedad("");
  };

  const eliminarPropiedad = (id) => {
    setFormData((prev) => ({
      ...prev,
      propiedades: prev.propiedades.filter((p) => p.propiedadId !== id),
    }));
  };

  // SUBMIT
  const handleSubmit = async () => {
    const fields = ["nombre", "categoriaId", "stock", "valorMedida", "medidaId"];

    let hasError = false;
    let touchedAll = {};

    fields.forEach((f) => {
      touchedAll[f] = true;
      const err = validateFormField(f, formData[f]);
      if (err) hasError = true;
    });

    setTouched(touchedAll);

    if (formData.propiedades.length === 0) {
      setErrors((p) => ({ ...p, propiedades: "Agrega una propiedad" }));
      hasError = true;
    }

    if (hasError) return;

    await onSubmit(formData);

    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ padding: 30 }}>
      <FormInput label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} error={errors.nombre} touched={touched} required />

      <FormInput label="Categoría" name="categoriaId" value={formData.categoriaId} onChange={handleChange} onBlur={handleBlur} error={errors.categoriaId} touched={touched} options={categorias} required />

      <FormInput label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} onBlur={handleBlur} error={errors.stock} touched={touched} required />

      <FormInput label="Valor medida" name="valorMedida" type="number" value={formData.valorMedida} onChange={handleChange} onBlur={handleBlur} error={errors.valorMedida} touched={touched} required />

      <FormInput label="Medida" name="medidaId" value={formData.medidaId} onChange={handleChange} onBlur={handleBlur} error={errors.medidaId} touched={touched} options={medidas} required />

      <button onClick={handleSubmit} style={btnPrimary}>Guardar</button>
      <button onClick={onCancel} style={btnSecondary}>Cancelar</button>

      <PropiedadesTable propiedades={formData.propiedades} propiedadesData={propiedades} onDelete={eliminarPropiedad} error={errors.propiedades} />

      <Alert />
    </div>
  );
};

export default SupplyForm;