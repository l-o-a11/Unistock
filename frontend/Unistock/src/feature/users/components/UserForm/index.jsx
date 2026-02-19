import React, { useState, useEffect } from "react";

const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        tipoDocumento: "",
        numeroDocumento: "",
        nombreCompleto: "",
        correo: "",
        rol: "",
        sede: "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="w-full flex justify-center items-center px-6 py-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-md w-full max-w-5xl p-7"
            >
                {/* TITLE */}
                <h1 className="text-2xl font-semibold mb-12">
                    {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* BLOQUE IZQUIERDO */}
                    <div>
                        <h2 className="text-gray-800 font-medium border-b border-gray-300 pb-2 mb-2">
                            Información Principal
                        </h2>

                        <div className="space-y-4">
                            <Input
                                label="Tipo De Documento"
                                name="tipoDocumento"
                                value={formData.tipoDocumento}
                                onChange={handleChange}
                            />

                            <Input
                                label="Documento"
                                name="numeroDocumento"
                                value={formData.numeroDocumento}
                                onChange={handleChange}
                            />

                            <Input
                                label="Nombre"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* BLOQUE DERECHO */}
                    <div>
                        <h2 className="text-gray-800 font-medium border-b border-gray-300 pb-2 mb-2">
                            Información Adicional
                        </h2>

                        <div className="space-y-4">
                            <Input
                                label="Correo"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                            />

                            <Input
                                label="Rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                            />

                            <Input
                                label="Sede"
                                name="sede"
                                value={formData.sede}
                                onChange={handleChange}
                            />

                            {!user && (
                                <Input
                                    label="Contraseña"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTONES */}
                <div className="flex justify-end gap-6 mt-14">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-3 rounded-lg bg-gray-300 text-gray-700 font-medium hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="px-8 py-3 rounded-lg text-white font-medium
                               bg-gradient-to-r from-pink-500 to-pink-600
                               hover:from-pink-600 hover:to-pink-700
                               shadow-lg transition"
                    >
                        {user ? "Guardar Cambios" : "Guardar Usuario"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;

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
        <label className="block text-sm text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="
                w-full 
                px-4 
                py-3 
                rounded-lg 
                bg-gray-100 
                border border-gray-400 
                focus:outline-none 
                focus:border-pink-500 
                focus:ring-1 
                focus:ring-pink-500
                transition
            "
        />
    </div>
);

