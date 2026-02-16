import React, { useState } from "react";

const Third_partieForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    contacto: "",
    correo: "",
    estado: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nombre || !form.direccion || !form.telefono) {
      alert("Completa los campos obligatorios");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#f7f7f7] w-full max-w-4xl rounded-xl shadow-xl p-8"
      >
        {/* TITLE */}
        <h1 className="text-xl font-semibold mb-6">
          Crear nuevo tercero
        </h1>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* NOMBRE */}
          <Input
            label="Nombre"
            name="nombre"
            required
            placeholder="Ej: Confecciones Modernas S.A.S."
            value={form.nombre}
            onChange={handleChange}
          />

          {/* NIT */}
          <Input
            label="NIT"
            name="nit"
            placeholder="Ej: 900.123.456-7"
            value={form.nit}
            onChange={handleChange}
          />

          {/* DIRECCION FULL */}
          <div className="md:col-span-2">
            <Input
              label="Dirección"
              name="direccion"
              required
              placeholder="Ej: Calle 10 # 42-15, Medellín"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>

          {/* TELEFONO */}
          <Input
            label="Teléfono"
            name="telefono"
            required
            placeholder="Ej: 300 123 4567"
            value={form.telefono}
            onChange={handleChange}
          />

          {/* CONTACTO */}
          <Input
            label="Contacto principal"
            name="contacto"
            required
            placeholder="Ej: Ana Pérez"
            value={form.contacto}
            onChange={handleChange}
          />

          {/* CORREO */}
          <div className="md:col-span-2">
            <Input
              label="Correo electrónico"
              name="correo"
              placeholder="Ej: contacto@confecciones.com"
              value={form.correo}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white shadow"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Third_partieForm;

/* 🔹 Input reutilizable */
const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
    />
  </div>
);
