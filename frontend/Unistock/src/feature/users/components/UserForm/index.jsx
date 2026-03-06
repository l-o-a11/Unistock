import React, { useState, useEffect } from "react";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Alert from "../../../shared/components/Alert";
import { validators } from "../../../shared/utils/Validaciones";

const UserForm = ({ user, roles = [], onSubmit, onCancel }) => {

  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    name: "",
    email: "",
    role: "",
    sede: "",
  });

  const [errors, setErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const validateField = (name, value) => {

    let error = "";

    switch (name) {

      case "documentType":
        error = validators.required(value);
        break;

      case "documentNumber":
        error = validators.required(value) || validators.numbers(value);
        break;

      case "name":
        error = validators.required(value);
        break;

      case "email":
        error = validators.required(value) || validators.email(value);
        break;

      case "role":
        error = validators.required(value);
        break;

      case "sede":
        error = validators.required(value);
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));

    return error;
  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleBlur = (e) => {

    const { name, value } = e.target;

    validateField(name, value);

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    let newErrors = {};

    Object.entries(formData).forEach(([key, value]) => {

      const error = validateField(key, value);

      if (error) newErrors[key] = error;

    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) {

      setAlertConfig({
        open: true,
        type: "warning",
        message: "Corrige los campos marcados",
      });

      return;
    }

    onSubmit(formData);

    setAlertConfig({
      open: true,
      type: "success",
      message: user
        ? "Usuario actualizado correctamente"
        : "Usuario creado correctamente",
    });

  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-xl rounded-xl shadow-2xl px-8 py-5"
      >

        <h1 className="text-3xl font-bold mb-4">
          {user ? "Editar Usuario" : "Crear Usuario"}
        </h1>

        {/* DOCUMENTO */}

        <div className="grid grid-cols-2 gap-6 mb-6">

          <Input
            label="Tipo de documento *"
            as="select"
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.documentType}
          >
            <option value="">Seleccionar Tipo</option>
            <option value="CC">CC</option>
            <option value="TI">TI</option>
          </Input>

          <Input
            label="Número de documento *"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.documentNumber}
          />

        </div>

        {/* DATOS */}

        <div className="mb-6">

          <Input
            label="Nombre completo *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
          />

        </div>

        <div className="mb-6">

          <Input
            type="email"
            label="Correo electrónico *"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
          />

        </div>

        {/* ROL */}

        <div className="mb-6">

          <Input
            label="Rol *"
            as="select"
            name="role"
            value={formData.role}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.role}
          >
            <option value="">Seleccionar rol</option>
            <option value="Gerente">Gerente</option>
            <option value="Admin">Admin</option>
            <option value="Empleado">Empleado</option>
          </Input>

        </div>

        {/* SEDE */}

        <div className="mb-6">

          <Input
            label="Sede *"
            as="select"
            name="sede"
            value={formData.sede}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.sede}
          >
            <option value="">Seleccionar sede</option>
            <option value="Parque Berrio">Parque de Bello</option>
          </Input>

        </div>

        {/* BOTONES */}

        <div className="flex justify-end gap-4 mt-6">

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setAlertConfig({
                open: true,
                type: "confirm",
                message: "¿Seguro que deseas cancelar?",
                onConfirm: onCancel,
              })
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
          >
            Guardar Usuario
          </Button>

        </div>

      </form>

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        message={alertConfig.message}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          setAlertConfig({ ...alertConfig, open: false });
        }}
        onCancel={() =>
          setAlertConfig({ ...alertConfig, open: false })
        }
      />
    </>
  );
};

export default UserForm;