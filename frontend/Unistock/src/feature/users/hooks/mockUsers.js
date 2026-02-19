import { useState, useEffect } from "react";

export const mockUsers = [
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
    {
        id: 4,
        tipoDocumento: "TI",
        numeroDocumento: "1098765432",
        nombreCompleto: "Juan David Martínez",
        correo: "juan.martinez@gmail.com",
        rol: "Empleado",
        sede: "Parque Berrio",
        estado: false,
    },
    {
        id: 5,
        tipoDocumento: "CE",
        numeroDocumento: "553214789",
        nombreCompleto: "Valentina Rodríguez",
        correo: "valentina.rodriguez@gmail.com",
        rol: "Supervisor",
        sede: "Parque Berrio",
        estado: true,
    },
    {
        id: 6,
        tipoDocumento: "CC",
        numeroDocumento: "741258963",
        nombreCompleto: "Andrés Felipe Castro",
        correo: "andres.castro@gmail.com",
        rol: "Empleado",
        sede: "Parque Berrio",
        estado: false,
    },
    {
        id: 7,
        tipoDocumento: "CC",
        numeroDocumento: "963852741",
        nombreCompleto: "Camila Andrea Herrera",
        correo: "camila.herrera@gmail.com",
        rol: "Administrador",
        sede: "Parque Berrio",
        estado: true,
    },
    {
        id: 8,
        tipoDocumento: "CE",
        numeroDocumento: "321654987",
        nombreCompleto: "Sebastián López",
        correo: "sebastian.lopez@gmail.com",
        rol: "Empleado",
        sede: "Parque Berrio",
        estado: true,
    }
];

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUsers([...mockUsers]);
            setLoading(false);
        }, 500);
    }, []);

    const createUser = async (userData) => {
        const newUser = {
            id: Date.now(),
            ...userData,
        };

        setUsers((prev) => [...prev, newUser]);
        return newUser;
    };

    const updateUser = async (id, userData) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
        );
    };

    const deleteUser = async (id) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    const toggleUser = (id) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === id ? { ...u, estado: !u.estado } : u
            )
        );
    };

    return {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        toggleUser,
    };
};
