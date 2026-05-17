import React, { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { useRolSearch } from "../hooks/useRolSearch";
import { useRolDetail } from "../hooks/useRolDetail";
import RolTable from "../components/RolTable";
import RolSearch from "../components/RolSearch";
import AddRolButton from "../components/AddRolButton";
import RolDetail from "../components/RolDetail";
import CreateRolPage from "./CreateRolPage";
import EditRolPage from "./EditRolPage";
import Alert from "../../shared/components/Alert";
import { UserAPI } from "../services/userAPI";

// ─────────────────────────────────────────────────
// CONTRASEÑA ADMIN SIMULADA
// En producción esto lo valida el backend
// ─────────────────────────────────────────────────
const ADMIN_PASSWORD = "admin123";

// Roles que no se pueden modificar ni eliminar
const ROLES_PROTEGIDOS = ["Gerente"];

const RolesPage = () => {
  const { roles, createRol, updateRol, deleteRol, toggleRol } = useRoles();

  const { searchTerm, handleSearch } = useRolSearch();
  const { selectedRol, isOpen, openDetail, closeDetail } = useRolDetail();

  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState(null);
  const [editingRol, setEditingRol] = useState(null); // objeto completo, no solo ID
const [estadoFiltro, setEstadoFiltro] = useState("todos");

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    message: "",
    onConfirm: null,
  });

  // ── Alert helpers ─────────────────────────────────
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm) =>
    setAlertConfig({ open: true, type, title, message, onConfirm: onConfirm || closeAlert });

  // ── Filter ────────────────────────────────────────
  /*const filteredRoles = roles.filter(
    (rol) =>
      rol.id.toString().includes(searchTerm) ||
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );*/
  const filteredRoles = roles.filter((rol) => {
  const text = searchTerm.toLowerCase();

  const coincideBusqueda =
    rol.id.toString().includes(searchTerm) ||
    rol.nombre.toLowerCase().includes(text) ||
    rol.descripcion.toLowerCase().includes(text);

  const coincideEstado =
    estadoFiltro === "todos" ||
    (estadoFiltro === "activos" && rol.estado !== false) ||
    (estadoFiltro === "inactivos" && rol.estado === false);

  return coincideBusqueda && coincideEstado;
});

  // ── Pagination ────────────────────────────────────
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  // ── Helpers ───────────────────────────────────────
  /**
   * Devuelve cuántos usuarios tienen este rol asignado.
   * TODO: reemplaza con tu fuente real de usuarios.
   * Ejemplo: return usuarios.filter(u => u.rolId === rolId).length;
   */
  // Consulta la API auxiliar para saber cuántos usuarios tienen este rol
  const getUsuariosEnlazados = async (rolId) => {
    return await UserAPI.countByRolId(rolId);
  };

  const verificarPassword = (password) => password === ADMIN_PASSWORD;

  // ── Handlers ──────────────────────────────────────
  const handleViewDetails = (rol) => openDetail(rol);

  const handleEdit = (rol) => {
    if (ROLES_PROTEGIDOS.includes(rol?.nombre)) {
      showAlert("error", "Rol protegido", `El rol "${rol?.nombre}" no se puede modificar.`);
      return;
    }
    setEditingRol(rol);
    setModalType("edit");
  };

  const handleDelete = async (id) => {
    const rol = roles.find((r) => r.id === id);

    if (ROLES_PROTEGIDOS.includes(rol?.nombre)) {
      showAlert("error", "Rol protegido", `El rol "${rol?.nombre}" no se puede eliminar.`);
      return;
    }

    const enlazados = await getUsuariosEnlazados(id);

    // ✅ Bloquear si tiene usuarios enlazados
    if (enlazados > 0) {
      showAlert(
        "error",
        "No se puede eliminar",
        `El rol "${rol?.nombre}" está asignado a ${enlazados} usuario${enlazados > 1 ? "s" : ""}. Reasigna o elimina esos usuarios antes de continuar.`
      );
      return;
    }

    showAlert(
      "password",
      "¿Eliminar rol?",
      `Para eliminar "${rol?.nombre}" confirma tu contraseña de administrador.`,
      (pwd) => {
        if (!verificarPassword(pwd)) {
          showAlert("error", "Contraseña incorrecta", "Verifica tu contraseña e intenta nuevamente.");
          return;
        }
        confirmarEliminar(id, rol?.nombre);
      }
    );
  };

  const confirmarEliminar = async (id, nombre) => {
    try {
      await deleteRol(id);
      showAlert("success", "Rol eliminado", `El rol "${nombre}" fue eliminado correctamente.`);
    } catch {
      showAlert("error", "Error", "Ocurrió un error al eliminar el rol. Intenta nuevamente.");
    }
  };

  const handleToggle = async (id) => {
    const rol = roles.find((r) => r.id === id);

    if (ROLES_PROTEGIDOS.includes(rol?.nombre)) {
      showAlert("error", "Rol protegido", `El rol "${rol?.nombre}" no se puede modificar.`);
      return;
    }

    const enlazados = await getUsuariosEnlazados(id);
    const isActive = rol?.estado !== false; // misma lógica que RolTable
    const accion = isActive ? "inactivar" : "activar";
    const accionLabel = accion.charAt(0).toUpperCase() + accion.slice(1);

    // ✅ Bloquear desactivación si tiene usuarios enlazados
    if (enlazados > 0 && isActive) {
      showAlert(
        "error",
        "No se puede inactivar",
        `El rol "${rol?.nombre}" está asignado a ${enlazados} usuario${enlazados > 1 ? "s" : ""}. Reasigna esos usuarios antes de inactivarlo.`
      );
      return;
    }

    showAlert(
      "password",
      `¿${accionLabel} rol?`,
      `Para ${accion} "${rol?.nombre}" confirma tu contraseña de administrador.`,
      (pwd) => {
        if (!verificarPassword(pwd)) {
          showAlert("error", "Contraseña incorrecta", "Verifica tu contraseña e intenta nuevamente.");
          return;
        }
        confirmarToggle(id, rol?.nombre, accion);
      }
    );
  };

  const confirmarToggle = async (id, nombre, accion) => {
    try {
      await toggleRol(id);
      showAlert(
        "success",
        accion === "activar" ? "Rol activado" : "Rol inactivado",
        `El rol "${nombre}" fue ${accion === "activar" ? "activado" : "inactivado"} correctamente.`
      );
    } catch {
      showAlert("error", "Error", `Ocurrió un error al ${accion} el rol. Intenta nuevamente.`);
    }
  };

  const handleAddRol = () => setModalType("create");

  const handleCreateRol = async (data) => {
    try {
      await createRol(data);
      setModalType(null);
      showAlert("success", "Rol creado", "El rol fue creado correctamente.");
    } catch {
      showAlert("error", "Error", "Ocurrió un error al crear el rol. Intenta nuevamente.");
    }
  };

  const handleUpdateRol = async (data) => {
    try {
      await updateRol(editingRol.id, data);
      setModalType(null);
      setEditingRol(null);
      showAlert("success", "Rol actualizado", "El rol fue actualizado correctamente.");
    } catch {
      showAlert("error", "Error", "Ocurrió un error al actualizar el rol. Intenta nuevamente.");
    }
  };

  // ── Pagination visual ─────────────────────────────
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

  // ── Render ────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1a1a1a" }}>Roles</h1>
        <RolSearch value={searchTerm} onChange={handleSearch} />
      </div>

      {/* Botón */}
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "12px 20px",
    marginBottom: "20px",
  }}
>
  {/**IZQUIERDA SELECT */}
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <label style={{ fontSize: "13px", color: "#555" }}>
    Estado:
  </label>

  <select
    value={estadoFiltro}
    onChange={(e) => {
      setEstadoFiltro(e.target.value);
      setCurrentPage(1); // reset paginación
    }}
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "13px",
      cursor: "pointer",
      outline: "none",
    }}
  >
    <option value="todos">Todos</option>
    <option value="activos">Activos</option>
    <option value="inactivos">Inactivos</option>
  </select>
</div>

  {/* DERECHA - BOTÓN */}
  <AddRolButton onClick={handleAddRol} />
</div>

      {/* Tabla */}
      <RolTable
        roles={paginatedRoles}
        onView={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* Modal Crear / Editar */}
      {modalType && (
        <div
          onClick={() => { setModalType(null); setEditingRol(null); }}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", width: "50%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            {modalType === "create" && (
              <CreateRolPage createRol={handleCreateRol} onClose={() => setModalType(null)} />
            )}
            {modalType === "edit" && (
              <EditRolPage
                rol={editingRol}
                updateRol={handleUpdateRol}
                onClose={() => { setModalType(null); setEditingRol(null); }}
              />
            )}
          </div>
        </div>
      )}

      {/* Detalle */}
      {isOpen && <RolDetail rol={selectedRol} onClose={closeDetail} onEdit={handleEdit} />}

      {/* Paginación */}
      {filteredRoles.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={paginationBtn}>‹</button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={i} style={{ padding: "6px 10px" }}>...</span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{ ...paginationBtn, backgroundColor: p === currentPage ? "#FF4FD6" : "#fff", color: p === currentPage ? "#fff" : "#333", border: p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd" }}
              >
                {p}
              </button>
            )
          )}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={paginationBtn}>›</button>
        </div>
      )}

      {/* Alert global */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={(val) => alertConfig.onConfirm?.(val)}
        onCancel={closeAlert}
      />
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

export default RolesPage;