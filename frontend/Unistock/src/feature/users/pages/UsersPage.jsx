import React, { useState, useMemo } from "react";
import { useUsers } from "../hooks/mockUsers";
import { useUserSearch } from "../hooks/useUserSearch";
import UserTable from "../components/UserTable/index.jsx";
import SearchInput from "../../shared/components/Search.jsx";
import UserForm from "../components/UserForm/index.jsx";
import AddUserButton from "../components/AddUserButton.jsx";
import Alert from "../../shared/components/Alert";
import { useRoles } from "../../roles/hooks/useRoles";
import { useSedes } from "../../sedes/hooks/useSedes";

const UsersPage = () => {
  const { users, createUser, updateUser, deleteUser, toggleUser } = useUsers();
  const { searchTerm, handleSearch } = useUserSearch();

  const { roles } = useRoles();
  const { sedes } = useSedes();
  const rolesActivos = roles.filter((r) => r.estado !== false).map((r) => r.nombre);
  const sedesActivas = sedes.filter((s) => s.estado !== false).map((s) => s.nombre);

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // ── Alerta global ────────────────────────────────────────────────────────
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "password",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  // 🔎 FILTRO
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const term = searchTerm.toLowerCase();

    return users.filter((user) =>
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(term),
      ),
    );
  }, [users, searchTerm]);

  // 📄 PAGINACIÓN
  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // 🎯 ACCIONES
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

  // 🗑️ ELIMINAR CON CONTRASEÑA
  const handleDelete = (id) => {
    setAlertConfig({
      open: true,
      type: "password",
      title: "Eliminar usuario",
      message:
        "Esta acción no se puede deshacer. Ingresa la contraseña de administrador para confirmar.",
      onConfirm: async () => {
        try {
          await deleteUser(id);
          closeAlert();
        } catch (e) {
          setAlertConfig({
            open: true,
            type: "error",
            title: "No se puede eliminar",
            message: e.message,
            onConfirm: null,
          });
        }
      },
    });
  };

  // 🔁 ACTIVAR / DESACTIVAR CON CONTRASEÑA
  const handleToggle = (id) => {
    const user = users.find((u) => String(u.id) === String(id));
    const isActive = user?.estado !== false;
    setAlertConfig({
      open: true,
      type: "password",
      title: isActive ? "Inactivar usuario" : "Activar usuario",
      message: isActive
        ? "Para inactivar este usuario ingresa la contraseña de administrador."
        : "Para activar este usuario ingresa la contraseña de administrador.",
      onConfirm: () => {
        try {
          toggleUser(id);
          closeAlert();
        } catch (e) {
          setAlertConfig({
            open: true,
            type: "error",
            title: "No se puede cambiar el estado",
            message: e.message,
            onConfirm: null,
          });
        }
      },
    });
  };

  const handleCreateSubmit = async (userData) => {
    await createUser(userData);
  };

  const handleEditSubmit = async (userData) => {
    await updateUser(editUser.id, userData);
    setEditUser(null);
  };

  // 🔢 PAGINACIÓN VISUAL
  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* 🔔 ALERTA GLOBAL */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={closeAlert}
      />

      {/* 🔝 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Usuarios</h1>
        <div style={{ width: "260px" }}>
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar usuario"
          />
        </div>
      </div>

      {/* ➕ BOTÓN */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
          padding: "12px 16px",
        }}
      >
        <AddUserButton onClick={() => setShowCreate(true)} />
      </div>

      {/* 📋 TABLA */}
      <UserTable
        users={paginatedUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ➕ FORM CREAR */}
      {showCreate && (
        <UserForm
          roles={rolesActivos}
          sedes={sedesActivas}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* ✏️ FORM EDITAR */}
      {editUser && (
        <UserForm
          user={editUser}
          roles={rolesActivos}
          sedes={sedesActivas}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditUser(null)}
        />
      )}

      {/* 📄 PAGINACIÓN */}
      {filteredUsers.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={paginationBtn}
          >
            ‹
          </button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: "6px 10px" }}>
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  ...paginationBtn,
                  backgroundColor: p === currentPage ? "#FF4FD6" : "#fff",
                  color: p === currentPage ? "#fff" : "#333",
                  border:
                    p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd",
                }}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={paginationBtn}
          >
            ›
          </button>
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