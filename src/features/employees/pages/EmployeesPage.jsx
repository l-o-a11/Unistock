import React, { useState, useMemo } from "react";
import { useEmployees } from "../hooks/mockEmployees";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import { useRoles } from "../../roles/hooks/useRoles";
import { useSedes } from "../../sedes/hooks/useSedes";
import EmployeeTable from "../components/EmployeeTable/index.jsx";
import EmployeeForm from "../components/EmployeeForm/index.jsx";
import AddEmployeeButton from "../components/AddEmployeeButton.jsx";
import SearchInput from "../../shared/components/SearchInput";
import Alert from "../../shared/components/Alert";
import { userAPI } from "../../users/services/usersAPI";

const EmployeesPage = () => {
  const {
    employees,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployee,
  } = useEmployees();

  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();
  const { sedes, loading: loadingSedes, error: errorSedes } = useSedes();

  // Filtrar roles: excluir Gerente, Admin y Administrador (cualquier capitalización)
  const ROLES_EXCLUIDOS_FORM = ["gerente", "admin", "administrador"];
  const rolesDisponibles = roles.filter(
    (r) =>
      !ROLES_EXCLUIDOS_FORM.includes(r.nombre?.toLowerCase().trim()) &&
      r.estado !== false,
  );

  const sedesActivas = sedes.filter((s) => s.estado !== false);

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
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;

    return employees.filter((employee) => {
      // Filtro por estado con tecla rápida
      if (term === "activo") return employee.estado !== false;
      if (term === "inactivo") return employee.estado === false;

      // Resolver nombres de rol y sede para incluirlos en la búsqueda
      // FIX: rolId/sedeId pueden ser ObjectId strings — comparar con String(), no parseInt
      const rolNombre =
        roles.find((r) => String(r.id) === String(employee.rolId ?? employee.rol))
          ?.nombre ?? "";
      const sedeNombre =
        sedes.find((s) => String(s.id) === String(employee.sedeId ?? employee.sede))
          ?.nombre ?? "";

      // Solo buscar en campos visibles/relevantes, no en todo el objeto
      const camposBuscables = [
        employee.nombreCompleto,
        employee.numeroDocumento,
        employee.tipoDocumento,
        employee.correo,
        rolNombre,
        sedeNombre,
      ];

      return camposBuscables.some((v) => v?.toString().toLowerCase().includes(term));
    });
  }, [employees, searchTerm, roles, sedes]);

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
      role: employee.rolId ?? employee.rol,
      sede: employee.sedeId ?? employee.sede,
    });
  };

  // 🗑️ ELIMINAR CON CONTRASEÑA REAL (validada en backend)
  const handleDelete = (id) => {
    setAlertConfig({
      open: true,
      type: "password",
      title: "Eliminar empleado",
      message:
        "Esta acción no se puede deshacer. Ingresa tu contraseña para confirmar.",
      onConfirm: async (pwd) => {
        try {
          await userAPI.verifyPassword(pwd);
        } catch (verifyErr) {
          const msg = verifyErr?.message || "";
          if (msg.toLowerCase().includes("sesión") || msg.toLowerCase().includes("token")) {
            setAlertConfig({ open: true, type: "error", title: "Sesión inválida", message: "Tu sesión expiró. Por favor inicia sesión de nuevo.", onConfirm: null });
            setTimeout(() => { localStorage.removeItem("session_user"); window.location.href = "/login"; }, 2000);
          } else {
            setAlertConfig({ open: true, type: "error", title: "Contraseña incorrecta", message: "La contraseña ingresada no es válida.", onConfirm: null });
          }
          return;
        }
        try {
          await deleteEmployee(id);
          closeAlert();
          setAlertConfig({ open: true, type: "success", title: "Empleado eliminado", message: "El empleado fue eliminado correctamente.", onConfirm: null });
        } catch (e) {
          setAlertConfig({ open: true, type: "error", title: "No se puede eliminar", message: e.message, onConfirm: null });
        }
      },
    });
  };

  // 🔁 ACTIVAR / DESACTIVAR CON CONTRASEÑA REAL
  const handleToggle = (id) => {
    const employee = employees.find((e) => String(e.id) === String(id));
    const isActive = employee?.estado !== false;
    setAlertConfig({
      open: true,
      type: "password",
      title: isActive ? "Inactivar empleado" : "Activar empleado",
      message: isActive
        ? "Para inactivar este empleado ingresa tu contraseña."
        : "Para activar este empleado ingresa tu contraseña.",
      onConfirm: async (pwd) => {
        try {
          await userAPI.verifyPassword(pwd);
        } catch (verifyErr) {
          const msg = verifyErr?.message || "";
          if (msg.toLowerCase().includes("sesión") || msg.toLowerCase().includes("token")) {
            setAlertConfig({ open: true, type: "error", title: "Sesión inválida", message: "Tu sesión expiró. Por favor inicia sesión de nuevo.", onConfirm: null });
            setTimeout(() => { localStorage.removeItem("session_user"); window.location.href = "/login"; }, 2000);
          } else {
            setAlertConfig({ open: true, type: "error", title: "Contraseña incorrecta", message: "La contraseña ingresada no es válida.", onConfirm: null });
          }
          return;
        }
        try {
          toggleEmployee(id);
          closeAlert();
          setAlertConfig({
            open: true, type: "success",
            title: isActive ? "Empleado inactivado" : "Empleado activado",
            message: isActive ? "El empleado fue inactivado correctamente." : "El empleado fue activado correctamente.",
            onConfirm: null,
          });
        } catch (e) {
          setAlertConfig({ open: true, type: "error", title: "No se puede cambiar el estado", message: e.message, onConfirm: null });
        }
      },
    });
  };

  // ➕ CREAR — deja que el error suba al EmployeeForm para mostrarlo allí
  const handleCreateSubmit = async (formData) => {
    await createEmployee(formData);
    setShowCreate(false);
  };

  // ✏️ EDITAR — ídem
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

  // Si los catálogos fallan, mostrar error claro en lugar de selects vacíos silenciosos
  if (loading) return (
    <div style={{ padding: '24px 32px' }}>
      <style>{`
        @keyframes eloadbar {
          0%   { left: -40%; width: 40%; }
          50%  { left: 30%;  width: 50%; }
          100% { left: 110%; width: 40%; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Empleados</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 220, height: 34, background: '#f3f4f6', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          <div style={{ width: 110, height: 34, background: '#FF4FD6', borderRadius: 20, opacity: 0.15 }} />
        </div>
      </div>
      <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)',
          animation: 'eloadbar 1.6s ease-in-out infinite',
        }} />
      </div>
    </div>
  );

  if (errorRoles || errorSedes) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#ef4444', fontWeight: 600 }}>
          ⚠ No se pudieron cargar los catálogos de roles o sedes
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>{errorRoles || errorSedes}</p>
        <button onClick={() => window.location.reload()}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#ff4fd6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Reintentar
        </button>
      </div>
    );
  }

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
        <h1 style={{ fontSize: "26px", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Empleados</h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar"
            width="400px"
            maxWidth="400px"
          />

          <span style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>
            Escribe <strong>activo</strong> para ver registros activos ·{" "}
            <strong>inactivo</strong> para ver registros inactivos
          </span>
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
          borderRadius: "10px",
        }}
      >
        <AddEmployeeButton onClick={() => setShowCreate(true)} />
      </div>

      {/* 📋 Tabla */}
      <EmployeeTable
        employees={paginated}
        roles={roles}
        sedes={sedes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* ➕ Crear — el form maneja su propio overlay y alertas */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <EmployeeForm
            roles={rolesDisponibles}
            sedes={sedesActivas}
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
            roles={rolesDisponibles}
            sedes={sedesActivas}
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