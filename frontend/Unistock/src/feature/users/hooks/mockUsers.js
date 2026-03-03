import { useState, useEffect } from "react";

const STORAGE_KEY = "app_users";

// Usuarios iniciales — solo se cargan la primera vez que no hay nada en localStorage
const seedUsers = [
    {
        id: 1,
        tipoDocumento: "CC",
        numeroDocumento: "856127435",
        nombreCompleto: "Sofía Osorio Ramírez",
        correo: "sofia.osorio@gmail.com",
        rol: "Empleado",
        sede: "Parque Berrio",
        estado: true,
    },
    {
        id: 2,
        tipoDocumento: "CC",
        numeroDocumento: "684217935",
        nombreCompleto: "Miguel Ángel Torres",
        correo: "miguel.torres@gmail.com",
        rol: "Empleado",
        sede: "Parque Berrio",
        estado: true,
    },
    {
        id: 3,
        tipoDocumento: "CC",
        numeroDocumento: "1023456789",
        nombreCompleto: "Laura Marcela Gómez",
        correo: "laura.gomez@gmail.com",
        rol: "Administrador",
        sede: "Parque Berrio",
        estado: true,
    },
];

// ── Helpers de localStorage ────────────────────────────────────────────────
const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // Si el JSON está corrupto, ignoramos y usamos seed
    }
    return null;
};

const saveToStorage = (users) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("No se pudo guardar en localStorage:", e);
    }
};

// ── Hook principal ─────────────────────────────────────────────────────────
export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carga inicial: desde localStorage o desde seed
    useEffect(() => {
        setLoading(true);
        const stored = loadFromStorage();
        setUsers(stored ?? seedUsers);
        setLoading(false);
    }, []);

    // Cada vez que users cambia, persistimos en localStorage
    useEffect(() => {
        if (!loading) {
            saveToStorage(users);
        }
    }, [users, loading]);

    // ── CRUD ───────────────────────────────────────────────────────────────

    const createUser = async (userData) => {
        const exists = users.find(
            (u) =>
                u.numeroDocumento === userData.documentNumber ||
                u.correo === userData.email
        );
        if (exists) {
            throw new Error("Ya existe un usuario con ese documento o correo");
        }

        const newUser = {
            id: Date.now(),
            tipoDocumento: userData.documentType,
            numeroDocumento: userData.documentNumber,
            nombreCompleto: userData.name,
            correo: userData.email,
            rol: userData.role,
            sede: userData.sede,
            estado: true,
        };

        setUsers((prev) => [...prev, newUser]);
        return newUser;
    };

    const updateUser = async (id, userData) => {
        const exists = users.find(
            (u) =>
                String(u.id) !== String(id) &&
                (
                    u.numeroDocumento === userData.documentNumber ||
                    u.correo === userData.email
                )
        );
        if (exists) {
            throw new Error("Ya existe otro usuario con ese documento o correo");
        }

        setUsers((prev) =>
            prev.map((u) =>
                String(u.id) === String(id)
                    ? {
                        ...u,
                        tipoDocumento: userData.documentType,
                        numeroDocumento: userData.documentNumber,
                        nombreCompleto: userData.name,
                        correo: userData.email,
                        rol: userData.role,
                        sede: userData.sede,
                    }
                    : u
            )
        );
    };

    const deleteUser = async (id) => {
        const userToDelete = users.find((u) => u.id === id);
        if (!userToDelete) return;

        if (userToDelete.rol === "Administrador" && userToDelete.estado) {
            alert("No se puede eliminar un administrador activo");
            return;
        }

        const confirmDelete = window.confirm("¿Seguro que deseas eliminar este usuario?");
        if (!confirmDelete) return;

        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    const toggleUser = (id) => {
        setUsers((prev) => {
            const userToToggle = prev.find((u) => u.id === id);
            if (!userToToggle) return prev;

            const isActive = userToToggle.estado !== false;

            if (userToToggle.rol === "Administrador" && isActive) {
                const activeAdmins = prev.filter(
                    (u) => u.rol === "Administrador" && u.estado !== false
                );
                if (activeAdmins.length <= 1) {
                    alert("No se puede desactivar el único administrador activo");
                    return prev;
                }
            }

            return prev.map((u) =>
                u.id === id ? { ...u, estado: !u.estado } : u
            );
        });
    };

    // Util: resetear al seed original (útil para desarrollo/testing)
    const resetUsers = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUsers(seedUsers);
    };

    return {
        users,
        loading,
        createUser,
        updateUser,
        deleteUser,
        toggleUser,
        resetUsers,
    };
};

export default useUsers;