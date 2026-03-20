import React, { useState, useCallback } from "react";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Alert from "../../../shared/components/Alert";
import { validators } from "../../../shared/utils/validators";
import { EmployeeDocumentTypes, EmployeeSedes } from "../../types/constantsEmployees";

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
    // Inicializa directamente desde la prop — sin useEffect para evitar setState en efecto
    const [formData, setFormData] = useState(() => employee ?? {
        documentType: "",
        documentNumber: "",
        name: "",
        email: "",
        sede: "",
    });

    const [errors, setErrors] = useState({});
    const [alertConfig, setAlertConfig] = useState({
        open: false, type: "success", title: "", message: "", onConfirm: null,
    });

    const closeAlert = useCallback(
        () => setAlertConfig((prev) => ({ ...prev, open: false })),
        []
    );

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "documentType": error = validators.required(value); break;
            case "documentNumber": error = validators.required(value) || validators.numbers(value); break;
            case "name": error = validators.required(value); break;
            case "email": error = validators.required(value) || validators.email(value); break;
            case "sede": error = validators.required(value); break;
            default: break;
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                open: true, type: "warning",
                title: "Campos incompletos",
                message: "Corrige los campos marcados antes de continuar.",
                onConfirm: null,
            });
            return;
        }

        onSubmit(formData);
        // Al cerrar el toast de éxito se cierra el modal
        setAlertConfig({
            open: true, type: "success",
            title: employee ? "Empleado actualizado" : "Empleado creado",
            message: employee
                ? "El empleado fue actualizado correctamente."
                : "El empleado fue creado correctamente.",
            onConfirm: null,
        });
    };

    const handleCancelClick = useCallback(() => {
        setAlertConfig({
            open: true, type: "confirm",
            title: "Cancelar",
            message: "¿Seguro que deseas cancelar? Se perderán los cambios.",
            onConfirm: () => {
                setAlertConfig((prev) => ({ ...prev, open: false }));
                onCancel();
            },
        });
    }, [onCancel]);

    return (
        <>
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl rounded-xl shadow-2xl px-8 py-5">
                <h1 className="text-3xl font-bold mb-4">
                    {employee ? "Editar Empleado" : "Crear Empleado"}
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
                        <option value="">Seleccionar tipo</option>
                        {EmployeeDocumentTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
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

                {/* DATOS PERSONALES */}
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
                        {EmployeeSedes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Input>
                </div>

                {/* ROL informativo */}
                <div className="mb-6 p-3 bg-pink-50 border border-pink-200 rounded-xl">
                    <p className="text-sm text-pink-600 font-semibold">
                        Rol asignado: <span className="font-bold">Empleado</span>
                    </p>
                </div>

                {/* BOTONES */}
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="secondary" onClick={handleCancelClick}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                        Guardar Empleado
                    </Button>
                </div>
            </form>

            <Alert
                isOpen={alertConfig.open}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={() => {
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                    else closeAlert();
                }}
                onCancel={() => {
                    closeAlert();
                    // Si era toast de éxito, cerramos el modal al cerrar la alerta
                    if (alertConfig.type === "success") onCancel();
                }}
            />
        </>
    );
};

export default EmployeeForm;
