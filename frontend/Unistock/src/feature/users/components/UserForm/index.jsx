import React, { useState, useEffect, useRef } from "react";

const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        documentType: user?.documentType || "",
        documentNumber: user?.documentNumber || "",
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
        sede: user?.sede || "",
    });

    const modalRef = useRef(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                documentType: user.documentType || "",
                documentNumber: user.documentNumber || "",
                name: user.name || "",
                email: user.email || "",
                role: user.role || "",
                sede: user.sede || "",
            });
        }
    }, [user]);

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onCancel();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // limpiar error individual
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!formData.documentType) {
            errors.documentType = "Debe seleccionar tipo de documento";
        }

        if (!formData.documentNumber) {
            errors.documentNumber = "El número de documento es obligatorio";
        } else if (!/^\d+$/.test(formData.documentNumber)) {
            errors.documentNumber = "Solo se permiten números";
        }

        if (!formData.name.trim()) {
            errors.name = "El nombre completo es obligatorio";
        }

        if (!formData.email) {
            errors.email = "El correo es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Correo inválido";
        }

        if (!formData.role) {
            errors.role = "Debe seleccionar un rol";
        }

        if (!formData.sede) {
            errors.sede = "Debe seleccionar una sede";
        }

        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        onSubmit(formData);
    };

    const selectStyle = `
    w-full
    appearance-none
    bg-gray-50
    border border-gray-200
    rounded-xl
    px-4 py-2
    pr-10
    text-sm
    shadow-sm
    hover:border-pink-300
    focus:outline-none
    focus:ring-2
    focus:ring-pink-500
    focus:border-pink-400
    transition
  `;

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-4xl rounded-xl shadow-2xl px-10 py-4"
        >
            {/* Título */}
            <h1 className="text-3xl font-bold mb-5">
                {user ? "Editar Usuario" : "Crear Usuario"}
            </h1>

            {/* IDENTIFICACIÓN */}
            <div className="mb-5">
                <h2 className="font-semibold mb-2 text-gray-700">Identificación</h2>
                <div className="border-t border-gray-200 mb-4"></div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Tipo documento */}
                    <div>
                        <label className="text-sm font-medium">
                            Tipo de documento <span className="text-red-500">*</span>
                        </label>

                        <div className="relative mt-2">
                            <select
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleChange}
                                className={selectStyle}
                            >
                                <option value="">Seleccionar Tipo</option>
                                <option value="CC">CC</option>
                                <option value="TI">TI</option>
                            </select>

                            {errors.documentType && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.documentType}
                                </p>
                            )}

                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Número documento */}
                    <div>
                        <label className="text-sm font-medium">
                            Número de documento <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="documentNumber"
                            value={formData.documentNumber}
                            onChange={handleChange}
                            className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition"
                        />

                        {errors.documentNumber && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.documentNumber}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* DATOS PERSONALES */}
            <div className="mb-5">
                <h2 className="font-semibold mb-2 text-gray-700">Datos personales</h2>
                <div className="border-t border-gray-200 mb-4"></div>

                <div className="mb-4">
                    <label className="text-sm font-medium">Nombre completo</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Marthin Sosa"
                        className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition"
                    />

                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition"
                    />

                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>
            </div>

            {/* ROL */}
            <div className="mb-10">
                <label className="text-sm font-medium">
                    Rol <span className="text-red-500">*</span>
                </label>

                <div className="border-t border-gray-200 my-3"></div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Rol */}
                    <div className="relative">
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={selectStyle}
                        >
                            <option value="">Seleccionar rol</option>
                            <option value="Administrador">Administrador</option>
                            <option value="Empleado">Empleado</option>
                        </select>

                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.role}
                            </p>
                        )}

                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Sede */}
                    <div className="relative">
                        <select
                            name="sede"
                            value={formData.sede}
                            onChange={handleChange}
                            className={selectStyle}
                        >
                            <option value="">Sede asignada</option>
                            <option value="Parque Berrio">Parque Berrio</option>
                        </select>

                        {errors.sede && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.sede}
                            </p>
                        )}

                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-medium"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:scale-[1.02] hover:shadow-lg transition font-medium"
                >
                    Guardar Usuario
                </button>
            </div>
        </form>
    );
};

export default UserForm;
