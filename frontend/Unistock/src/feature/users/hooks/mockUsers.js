import { useState, useEffect } from "react";
import { userAPI } from "../services/usersAPI";

const STORAGE_KEY = "app_users";

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

    // Carga inicial: desde localStorage o desde API
    useEffect(() => {
        const cached = loadFromStorage();
        if (cached) {
            setUsers(cached);
            setLoading(false);
        } else {
            loadData();
        }
    }, []);

    // Cada vez que users cambia, persistimos en localStorage
    useEffect(() => {
        if (!loading) {
            saveToStorage(users);
        }
    }, [users, loading]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            // Normalizar campos del seed: rol→rolId, sede→sedeId
            const normalized = data.map((u) => ({
                ...u,
                estado: u.estado ?? true,
                rolId: u.rolId ?? (typeof u.rol === "number" ? u.rol : parseInt(u.rol)) ?? null,
                sedeId: u.sedeId ?? (typeof u.sede === "number" ? u.sede : parseInt(u.sede)) ?? null,
            }));
            setUsers(normalized);
        } catch (e) {
            console.error("Error al cargar usuarios:", e);
        } finally {
            setLoading(false);
        }
    };

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
            rolId: parseInt(userData.role),
            sedeId: parseInt(userData.sede),
            password: userData.password || null,
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
                        rolId: parseInt(userData.role),
                        sedeId: parseInt(userData.sede),
                    }
                    : u
            )
        );
    };

    const deleteUser = async (id) => {
        const userToDelete = users.find((u) => String(u.id) === String(id));
        if (!userToDelete) return;

        // Se puede eliminar sin importar si está activo o inactivo
        // Solo se protege al único administrador activo
        if (userToDelete.rolId === 2) {
            const activeAdmins = users.filter(
                (u) => u.rolId === 2 && u.estado !== false
            );
            if (activeAdmins.length <= 1 && userToDelete.estado !== false) {
                throw new Error("No se puede eliminar el único administrador activo");
            }
        }

        setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
    };

    const toggleUser = (id) => {
        const userToToggle = users.find((u) => u.id === id);
        if (!userToToggle) return;

        const isActive = userToToggle.estado !== false;

        // Proteger al único administrador activo — usa rolId: 2
        if (userToToggle.rolId === 2 && isActive) {
            const activeAdmins = users.filter(
                (u) => u.rolId === 2 && u.estado !== false
            );
            if (activeAdmins.length <= 1) {
                throw new Error("No se puede desactivar el único administrador activo");
            }
        }

        setUsers((prev) =>
            prev.map((u) =>
                u.id === id ? { ...u, estado: !u.estado } : u
            )
        );
    };

    const resetUsers = () => {
        localStorage.removeItem(STORAGE_KEY);
        loadData();
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