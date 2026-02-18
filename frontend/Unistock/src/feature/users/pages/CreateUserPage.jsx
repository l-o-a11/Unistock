import React from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/mockUsers";
import UserForm from "../components/UserForm";

const CreateUserPage = () => {
    const navigate = useNavigate();
    const { createUser } = useUsers();

    const handleSubmit = async (userData) => {
        try {
            await createUser(userData);
            navigate("/usuarios");
        } catch (error) {
            console.error("Error al crear el usuario:", error);
        }
    };

    return (
        <div className="bg-gray-100 flex justify-center items-center">
            <UserForm
                onSubmit={handleSubmit}
                onCancel={() => navigate("/usuarios")}
            />
        </div>
    );
};

export default CreateUserPage;