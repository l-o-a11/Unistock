import React, { useState, useMemo } from "react";
import { useEmployees } from "../hooks/mockEmployees";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import EmployeeTable from "../components/EmployeeTable/index.jsx";
import EmployeeForm from "../components/EmployeeForm/index.jsx";
import AddEmployeeButton from "../components/AddEmployeeButton.jsx";
import SearchInput from "../../shared/components/Search.jsx";
import Alert from "../components/Alert/index.jsx";

const EmployeesPage = () => {
  const {
    employees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployee,
  } = useEmployees();

  const { searchTerm, handleSearch } = useEmployeeSearch();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // 🔔 ALERTA GLOBAL
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "password",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  // 🔎 Filtro
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    const term = searchTerm.toLowerCase();

    return employees.filter((employee) =>
      Object.values(employee).some((value) =>
        value?.toString().toLowerCase().includes(term),
      ),
    );
  }, [employees, searchTerm]);

  // 📄 Paginación
  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginated = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // 🎯 Acciones
  const handleEdit = (employee) => {
    setEditEmployee({
      id: employee.id,
      documentType: employee.tipoDocumento,
      documentNumber: employee.numeroDocumento,
      name: employee.nombreCompleto,
      email: employee.correo,
      sede: employee.sede,
    });
  };

  // 🗑️ ELIMINAR CON CONTRASEÑA (igual que UsersPage)
  const handleDelete = (id) => {
    setAlertConfig({
      open: true,
      type: "password",
      title: "Eliminar empleado",
      message:
        "Esta acción no se puede deshacer. Ingresa la contraseña de administrador para confirmar.",
      onConfirm: () => {
        deleteEmployee(id);
        closeAlert();
      },
    });
  };

  // 🔁 ACTIVAR / DESACTIVAR CON CONTRASEÑA
  const handleToggle = (id) => {
    const employee = employees.find((e) => String(e.id) === String(id));
    const isActive = employee?.estado !== false;
    setAlertConfig({
      open: true,
      type: "password",
      title: isActive ? "Inactivar empleado" : "Activar empleado",
      message: isActive
        ? "Para inactivar este empleado ingresa la contraseña de administrador."
        : "Para activar este empleado ingresa la contraseña de administrador.",
      onConfirm: () => {
        toggleEmployee(id);
        closeAlert();
      },
    });
  };

  // ➕ CREAR
  const handleCreateSubmit = async (formData) => {
    await createEmployee(formData);
    setShowCreate(false);
  };

  // ✏️ EDITAR
  const handleEditSubmit = async (formData) => {
    await updateEmployee(editEmployee.id, formData);
    setEditEmployee(null);
  };

  // 🔢 Paginación visual
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
      {/* 🔔 ALERTA GLOBAL (eliminar con contraseña) */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={closeAlert}
      />

      {/* 🔝 Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Empleados</h1>

        <div style={{ width: "260px" }}>
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar empleado"
          />
        </div>
      </div>

      {/* ➕ Botón agregar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
          padding: "12px 16px",
        }}
      >
        <AddEmployeeButton onClick={() => setShowCreate(true)} />
      </div>

      {/* 📋 Tabla */}
      <EmployeeTable
        employees={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ➕ Crear — el form maneja su propio overlay y alertas */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <EmployeeForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* ✏️ Editar */}
      {editEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <EmployeeForm
            employee={editEmployee}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditEmployee(null)}
          />
        </div>
      )}

      {/* 📄 Paginación */}
      {filteredEmployees.length > 0 && (
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

export default EmployeesPage;