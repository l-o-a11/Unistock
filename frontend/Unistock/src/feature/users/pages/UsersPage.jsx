import React, { useState, useMemo } from "react";
import { useUsers } from "../hooks/mockUsers";
import { useUserSearch } from "../hooks/useUserSearch";
import { useUserDetail } from "../hooks/useUserDetail";

import UserTable from "../components/UserTable";
import SearchInput from "../../shared/components/Search";
import AddUserButton from "../components/AddUserButton";
import UserDetail from "../components/UserDetail";
import UserForm from "../components/UserForm";

const UsersPage = () => {
  const { users, createUser, updateUser, deleteUser, toggleUser } = useUsers();
  const { searchTerm, handleSearch } = useUserSearch();
  const { selectedUser, isOpen, openDetail, closeDetail } = useUserDetail();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null); // null = cerrado, objeto = editando

  // 🔎 FILTRO
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (u) =>
        u.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // 📄 PAGINACIÓN
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // 🎯 ACCIONES
  const handleView = (user) => openDetail(user);

  const handleEdit = (user) => {
    setEditUser({
      id: user.id,
      documentType: user.tipoDocumento,
      documentNumber: user.numeroDocumento,
      name: user.nombreCompleto,
      email: user.correo,
      role: user.rol,
      sede: user.sede,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar usuario?")) deleteUser(id);
  };

  const handleToggle = (id) => toggleUser?.(id);

  const handleCreateSubmit = async (userData) => {
    try {
      await createUser(userData);
      setShowCreate(false);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  };

  const handleEditSubmit = async (userData) => {
    try {
      await updateUser(editUser.id, userData);
      setEditUser(null);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  // 🔢 PAGINACIÓN VISUAL
  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* 🔝 HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Usuarios</h1>
        <div style={{ width: "260px" }}>
          <SearchInput
  value={searchTerm}
  onChange={ handleSearch}
  placeholder="Buscar usuario"
/>
        </div>
      </div>

      {/* ➕ BOTÓN */}
      <div style={{ backgroundColor: "#FFFFFF", display: "flex", justifyContent: "flex-end", marginBottom: "20px", padding: "12px 16px" }}>
        <AddUserButton onClick={() => setShowCreate(true)} />
      </div>

      {/* 📋 TABLA */}
      <UserTable
        users={paginatedUsers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* 📦 MODAL DETALLE */}
      {isOpen && (
        <UserDetail user={selectedUser} onClose={closeDetail} onEdit={handleEdit} />
      )}

      {/* ➕ MODAL CREAR */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <UserForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* ✏️ MODAL EDITAR */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <UserForm
            user={editUser}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditUser(null)}
          />
        </div>
      )}

      {/* 📄 PAGINACIÓN */}
      {filteredUsers.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={paginationBtn}>‹</button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: "6px 10px" }}>...</span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  ...paginationBtn,
                  backgroundColor: p === currentPage ? "#FF4FD6" : "#fff",
                  color: p === currentPage ? "#fff" : "#333",
                  border: p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd",
                }}
              >
                {p}
              </button>
            )
          )}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={paginationBtn}>›</button>
        </div>
      )}
    </div>
  );
};

const paginationBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

export default UsersPage;