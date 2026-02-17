import React, { useState } from "react";

const SupplierForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    nombreEmpresa: "",
    nit: "",
    direccion: "",
    correoEmpresa: "",
    sitioWeb: "",
    nombreContacto: "",
    telefono: "",
    correoContacto: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg w-full max-w-5xl p-8"
      >
        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-6">
          Crear Nuevo Proveedores
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* IZQUIERDA */}
          <div>
            <h2 className="font-medium text-gray-700 border-b pb-2 mb-4">
              Información de la empresa
            </h2>

            <div className="space-y-4">
              <Input
                label="Nombre de empresa"
                name="nombreEmpresa"
                required
                placeholder="Ej. Moda Co."
                value={form.nombreEmpresa}
                onChange={handleChange}
              />

              <Input
                label="NIT"
                name="nit"
                required
                placeholder="Ej. 900123456-7"
                value={form.nit}
                onChange={handleChange}
              />

              <Input
                label="Dirección"
                name="direccion"
                required
                placeholder="Ej. Calle 5, #45-12"
                value={form.direccion}
                onChange={handleChange}
              />

              <Input
                label="Correo"
                name="correoEmpresa"
                required
                placeholder="Ej. correo@gmail.com"
                value={form.correoEmpresa}
                onChange={handleChange}
              />

              <Input
                label="Sitio web"
                name="sitioWeb"
                placeholder="Ej. ejemplo.com"
                value={form.sitioWeb}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* DERECHA */}
          <div>
            <h2 className="font-medium text-gray-700 border-b pb-2 mb-4">
              Información del contacto
            </h2>

            <div className="space-y-4">
              <Input
                label="Nombre de contacto"
                name="nombreContacto"
                placeholder="Ej. Moda Co."
                value={form.nombreContacto}
                onChange={handleChange}
              />

              <Input
                label="Teléfono"
                name="telefono"
                required
                placeholder="Ej. 325412354"
                value={form.telefono}
                onChange={handleChange}
              />

              <Input
                label="Correo"
                name="correoContacto"
                placeholder="Ej. correo@gmail.com"
                value={form.correoContacto}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white shadow"
          >
            Guardar Proveedor
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;

/* 🔹 Componente reutilizable de Input */
const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div>
    <label className="block text-sm text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
    />
  </div>
);
