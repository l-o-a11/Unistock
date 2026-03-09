// src/feature/employees/hooks/mockEmployees.js
// Comparte el mismo localStorage que users (app_users)
// Solo opera sobre registros con rol "Empleado"

import { useState, useEffect } from "react";
import { EMPLOYEE_ROLE } from "../types/constantsEmployees";

const STORAGE_KEY = "app_users";

const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return [];
};

const saveToStorage = (allUsers) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
    } catch (e) {
        console.error("No se pudo guardar en localStorage:", e);
    }
};

export const useEmployees = () => {
    // allUsers: TODOS los usuarios (admins, gerentes, empleados)
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carga inicial
    useEffect(() => {
        setLoading(true);
        setAllUsers(loadFromStorage());
        setLoading(false);
    }, []);

    // Persiste cada cambio — sobre TODOS los usuarios, no solo empleados
    useEffect(() => {
        if (!loading) saveToStorage(allUsers);
    }, [allUsers, loading]);

    // Vista filtrada: solo rol Empleado
    const employees = allUsers.filter((u) => u.rol === EMPLOYEE_ROLE);

    // ── CRUD (solo afecta registros con rol Empleado) ──────────────────────

    const createEmployee = async (formData) => {
        const exists = allUsers.find(
            (u) =>
                u.numeroDocumento === formData.documentNumber ||
                u.correo === formData.email
        );
        if (exists) throw new Error("Ya existe un usuario con ese documento o correo.");

        const newEmployee = {
            id: Date.now(),
            tipoDocumento: formData.documentType,
            numeroDocumento: formData.documentNumber,
            nombreCompleto: formData.name,
            correo: formData.email,
            rol: EMPLOYEE_ROLE,   // siempre Empleado
            sede: formData.sede,
            estado: true,
        };

        setAllUsers((prev) => [...prev, newEmployee]);
        return newEmployee;
    };

    const updateEmployee = async (id, formData) => {
        const exists = allUsers.find(
            (u) =>
                String(u.id) !== String(id) &&
                (u.numeroDocumento === formData.documentNumber ||
                    u.correo === formData.email)
        );
        if (exists) throw new Error("Ya existe otro usuario con ese documento o correo.");

        setAllUsers((prev) =>
            prev.map((u) =>
                String(u.id) === String(id)
                    ? {
                        ...u,
                        tipoDocumento: formData.documentType,
                        numeroDocumento: formData.documentNumber,
                        nombreCompleto: formData.name,
                        correo: formData.email,
                        rol: EMPLOYEE_ROLE,   // no puede cambiar de rol
                        sede: formData.sede,
                    }
                    : u
            )
        );
    };

    const deleteEmployee = async (id) => {
        const confirmDelete = window.confirm("¿Seguro que deseas eliminar este empleado?");
        if (!confirmDelete) return;
        setAllUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
    };

    const toggleEmployee = (id) => {
        setAllUsers((prev) =>
            prev.map((u) =>
                String(u.id) === String(id) ? { ...u, estado: !u.estado } : u
            )
        );
    };

    return {
        employees,  // solo los de rol Empleado
        loading,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployee,
    };
};

export default useEmployees;