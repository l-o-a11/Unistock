import React, { useState, useEffect, useRef } from "react";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Alert from "../../../shared/components/Alert";
import { validators } from "../../../shared/utils/Validaciones";

const SupplierForm = ({ supplier, onSubmit, onCancel }) => {

  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreEmpresa:  "",
    nit:            "",
    direccion:      "",
    correoEmpresa:  "",
    sitioWeb:       "",
    nombreContacto: "",
    telefono:       "",
    correoContacto: "",
  });

  const [errors,        setErrors]        = useState({});
  const [pendingClose,  setPendingClose]  = useState(false);
  const [alertConfig,   setAlertConfig]   = useState({
    open:      false,
    type:      "confirm",
    title:     "",
    message:   "",
    onConfirm: null,
  });

  /* cargar proveedor si es edición */
  useEffect(() => {
    if (supplier) {
      setFormData({
        nombreEmpresa:  supplier.nombreEmpresa  || "",
        nit:            supplier.nit            || "",
        direccion:      supplier.direccion      || "",
        correoEmpresa:  supplier.correoEmpresa  || "",
        sitioWeb:       supplier.sitioWeb       || "",
        nombreContacto: supplier.nombreContacto || "",
        telefono:       supplier.telefono       || "",
        correoContacto: supplier.correoContacto || "",
      });
    }
  }, [supplier]);

  /* cuando la alerta se cierra y pendingClose está activo → cerrar modal */
  useEffect(() => {
    if (pendingClose && !alertConfig.open) {
      setPendingClose(false);
      onCancel();
    }
  }, [alertConfig.open, pendingClose]);

  /* cerrar con ESC */
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") handleCancelClick(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /* cerrar clic afuera */
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  /* VALIDAR CAMPO */
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombreEmpresa":
        error = validators.required(value);
        break;
      case "nit":
        error = validators.required(value) || validators.numbers(value);
        if (!error && (value.length < 8 || value.length > 12))
          error = "Debe tener entre 8 y 12 dígitos";
        break;
      case "direccion":
        error = validators.required(value);
        break;
      case "correoEmpresa":
        error = validators.required(value) || validators.email(value);
        break;
      case "telefono":
        error = validators.required(value) || validators.numbers(value);
        if (!error && value.length !== 10) error = "Debe tener 10 dígitos";
        break;
      case "correoContacto":
        error = value ? validators.email(value) : "";
        break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  /* CAMBIO INPUT */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "telefono" || name === "nit") && !/^[0-9]*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  /* VALIDAR TODO */
  const validateAll = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* SUBMIT */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setAlertConfig({
        open: true, type: "warning",
        title: "Campos incompletos",
        message: "Corrige los campos marcados antes de continuar.",
        onConfirm: null,
      });
      return;
    }
    try {
      onSubmit(formData);
      setPendingClose(true);
      setAlertConfig({
        open: true, type: "success",
        title: supplier ? "Proveedor actualizado" : "Proveedor creado",
        message: supplier
          ? "El proveedor fue actualizado correctamente."
          : "El proveedor fue creado correctamente.",
        onConfirm: null,
      });
    } catch {
      setAlertConfig({
        open: true, type: "danger",
        title: "Error al guardar",
        message: "No se pudo guardar el proveedor. Intenta de nuevo.",
        onConfirm: null,
      });
    }
  };

  /* CLICK CANCELAR */
  const handleCancelClick = () => {
    setAlertConfig({
      open: true, type: "warning",
      title: "Cancelar",
      message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, open: false }));
        onCancel();
      },
    });
  };

  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          else setAlertConfig(prev => ({ ...prev, open: false }));
        }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 50,
        }}
      >
        <div
          ref={modalRef}
          style={{
            backgroundColor: "#fff", borderRadius: "16px",
            width: "100%", maxWidth: "900px",
            padding: "36px 40px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          {/* Botón cerrar ✕ */}
          <button
            onClick={handleCancelClick}
            style={{
              position: "absolute", top: "16px", right: "16px",
              width: "32px", height: "32px", borderRadius: "50%",
              border: "none", backgroundColor: "#f3f4f6", cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✕
          </button>

          <h2 style={{ textAlign: "center", marginBottom: "28px" }}>
            {supplier ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>

              {/* IZQUIERDA */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", borderRight: "1px solid #e5e7eb", paddingRight: "30px" }}>

                <Input
                  label="Nombre Empresa *"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombreEmpresa}
                />

                <Input
                  label="NIT *"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nit}
                />

                <Input
                  label="Dirección *"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.direccion}
                />

                <Input
                  label="Correo Empresa *"
                  type="email"
                  name="correoEmpresa"
                  value={formData.correoEmpresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoEmpresa}
                />

                <Input
                  label="Sitio Web"
                  name="sitioWeb"
                  value={formData.sitioWeb}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

              </div>

              {/* DERECHA */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                <Input
                  label="Nombre Contacto"
                  name="nombreContacto"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Input
                  label="Teléfono *"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                />

                <Input
                  label="Correo Contacto"
                  type="email"
                  name="correoContacto"
                  value={formData.correoContacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correoContacto}
                />

              </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelClick}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="primary">
                Guardar Proveedor
              </Button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default SupplierForm;