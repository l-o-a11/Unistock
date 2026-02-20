import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUsers } from "../hooks/mockUsers";
import UserForm from "../components/UserForm";

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { users, updateUser } = useUsers();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const found = users.find((u) => String(u.id) === String(id));

        if (found) {
            setUser({
                id: found.id,
                documentType: found.tipoDocumento,
                documentNumber: found.numeroDocumento,
                name: found.nombreCompleto,
                email: found.correo,
                role: found.rol,
                sede: found.sede,
            });
        }
    }, [id, users]);

    const handleSubmit = async (userData) => {
        try {
            await updateUser(id, userData);
            navigate("/users");
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
        }
    };

    // ⏳ LOADING
    if (!user) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF4FD6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ animation: "spin 0.9s linear infinite" }}
                    >
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>

                    <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
                        Cargando usuario...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 flex justify-center items-center">
            <UserForm
                user={user}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/users")}
            />
        </div>
    );

};

export default EditUserPage;