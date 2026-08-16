import React, { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { useRolSearch } from "../hooks/useRolSearch";
import { useRolDetail } from "../hooks/useRolDetail";
import RolTable from "../components/RolTable";
import SearchInput from "../../shared/components/SearchInput";
import AddRolButton from "../components/AddRolButton";
import RolDetail from "../components/RolDetail";
import CreateRolPage from "./CreateRolPage";
import EditRolPage from "./EditRolPage";
import Alert from "../../shared/components/Alert";
import { RolesAPI } from "../services/RolesAPI";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";

// Roles que no se pueden modificar ni eliminar
const ROLES_PROTEGIDOS = ["Gerente"];

const RolesPage = () => {
  const { roles, loading, createRol, updateRol, deleteRol, toggleRol } =
    useRoles();

  const { searchTerm, handleSearch } = useRolSearch();
  const { selectedRol, isOpen, openDetail, closeDetail } = useRolDetail();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  if (loading && roles.length === 0) {
    return (
      <div style={{ padding: isMobile ? "16px 12px" : "24px 32px" }}>
        <style>{`
          @keyframes eloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
          @keyframes eskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "12px" : "0px", marginBottom: "20px" }}>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>Roles</h1>
          <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: "4px" }}>
            <div style={{ width: 400, maxWidth: "100%", height: 38, borderRadius: 10, background: "#f3f4f6", border: "1px solid #e5e7eb", animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
            <div style={{ width: 260, height: 11, borderRadius: 6, background: "#f3f4f6", animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "12px 20px", marginBottom: "20px", display: "flex", justifyContent: isMobile ? "flex-start" : "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "10px" : "0px" }}>
          <div style={{ width: 84, height: 18, borderRadius: 6, background: "#f3f4f6", animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
          <div style={{ width: 168, height: 38, borderRadius: 20, background: "linear-gradient(90deg, #ff8fe0, #FF4FD6)", opacity: 0.4, animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", height: 3, background: "#fce7f3", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)", animation: "eloadbar 1.6s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  // ── Alert helpers ─────────────────────────────────
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm) =>
    setAlertConfig({
      open: true,
      type,
      title,
      message,
      onConfirm: onConfirm || closeAlert,
    });

  // ── Filter ────────────────────────────────────────
  /*const filteredRoles = roles.filter(
    (rol) =>
      rol.id.toString().includes(searchTerm) ||
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );*/
  const filteredRoles = roles.filter((rol) => {
    const text = searchTerm.toLowerCase().trim();

    // Atajo de texto: escribir "activo" o "inactivo" filtra por estado
    if (text === "activo") return rol.estado !== false;
    if (text === "inactivo") return rol.estado === false;

    const coincideBusqueda =
      String(rol.id || "").includes(searchTerm) ||
      (rol.nombre || "").toLowerCase().includes(text) ||
      (rol.descripcion || "").toLowerCase().includes(text);

    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && rol.estado !== false) ||
      (estadoFiltro === "inactivos" && rol.estado === false);

    return coincideBusqueda && coincideEstado;
  });

  // ── Pagination ────────────────────────────────────
  const itemsPerPage = 7;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRoles.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ── Helpers ───────────────────────────────────────
  /**
   * Devuelve cuántos usuarios tienen este rol asignado.
   * TODO: reemplaza con tu fuente real de usuarios.
   * Ejemplo: return usuarios.filter(u => u.rolId === rolId).length;
   */
  // Consulta la API auxiliar para saber cuántos usuarios tienen este rol
  const getUsuariosEnlazados = async (rolId) => {
    const result = await RolesAPI.countUsers(rolId);
    return result.total;
  };

  // ── Handlers ──────────────────────────────────────
  const handleViewDetails = (rol) => openDetail(rol);

  const handleEdit = (rol) => {
    if (ROLES_PROTEGIDOS.includes(rol?.nombre)) {
      showAlert(
        "error",
        "Rol protegido",
        `El rol "${rol?.nombre}" no se puede modificar.`,
      );
      return;
    }
    setEditingRol(rol);
    setModalType("edit");
  };

  const handleDelete = async (id) => {
    const rol = roles.find((r) => r.id === id);

    if (ROLES_PROTEGIDOS.includes(rol?.nombre)) {
      showAlert(
        "error",
        "Rol protegido",
        `El rol "${rol?.nombre}" no se puede eliminar.`,
      );
      return;
    }

    const enlazados = await getUsuariosEnlazados(id);

    // ✅ Bloquear si tiene usuarios enlazados
    if (enlazados > 0) {
      showAlert(
        "error",
        "No se puede eliminar",
        `El rol "${rol?.nombre}" está asignado a ${enlazados} usuario${enlazados > 1 ? "s" : ""}. Reasigna o elimina esos usuarios antes de continuar.`,
      );
      return;
    }

    showAlert(
      "password",
      "¿Eliminar rol?",
      `Para eliminar "${rol?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await deleteRol(id, pwd);
          showAlert(
            "success",
            "Rol eliminado",
            `El rol "${rol?.nombre}" fue eliminado correctamente.`,
          );
        } catch (err) {
          showAlert(
            "error",
            "Error",
            err.message ||
              "Ocurrió un error al eliminar el rol. Intenta nuevamente.",
          );
        }
      },
    );
  };

  const confirmarEliminar = async (id, nombre) => {
    try {
      await deleteRol(id);
      showAlert(
        "success",
        "Rol eliminado",
        `El rol "${nombre}" fue eliminado correctamente.`,
      );
    } catch {
      showAlert(
        "error",
        "Error",
        "Ocurrió un error al eliminar el rol. Intenta nuevamente.",
      );
    }
  };

  const handleToggle = async (id) => {
    const rol = roles.find((r) => r.id === id);

    if (ROLES_PROTEGIDOS.includes(rol?.nombre)) {
      showAlert(
        "error",
        "Rol protegido",
        `El rol "${rol?.nombre}" no se puede modificar.`,
      );
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
        `El rol "${rol?.nombre}" está asignado a ${enlazados} usuario${enlazados > 1 ? "s" : ""}. Reasigna esos usuarios antes de inactivarlo.`,
      );
      return;
    }

    showAlert(
      "password",
      `¿${accionLabel} rol?`,
      `Para ${accion} "${rol?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await toggleRol(id, pwd);
          showAlert(
            "success",
            accion === "activar" ? "Rol activado" : "Rol inactivado",
            `El rol "${rol?.nombre}" fue ${accion === "activar" ? "activado" : "inactivado"} correctamente.`,
          );
        } catch (err) {
          showAlert(
            "error",
            "Error",
            err.message ||
              `Ocurrió un error al ${accion} el rol. Intenta nuevamente.`,
          );
        }
      },
    );
  };

  const confirmarToggle = async (id, nombre, accion) => {
    try {
      await toggleRol(id);
      showAlert(
        "success",
        accion === "activar" ? "Rol activado" : "Rol inactivado",
        `El rol "${nombre}" fue ${accion === "activar" ? "activado" : "inactivado"} correctamente.`,
      );
    } catch {
      showAlert(
        "error",
        "Error",
        `Ocurrió un error al ${accion} el rol. Intenta nuevamente.`,
      );
    }
  };

  const handleAddRol = () => setModalType("create");

  const handleCreateRol = async (data) => {
    try {
      await createRol(data);
      setModalType(null);
      showAlert("success", "Rol creado", "El rol fue creado correctamente.");
    } catch (error) {
      const message = error?.message || "";
      const isDuplicate =
        message.toLowerCase().includes("ya existe") ||
        message.toLowerCase().includes("duplicado") ||
        message.toLowerCase().includes("duplicate");

      if (isDuplicate) {
        throw error;
      }

      showAlert(
        "error",
        "Error",
        message || "Ocurrió un error al crear el rol. Intenta nuevamente.",
      );
    }
  };

  const handleUpdateRol = async (data) => {
    try {
      await updateRol(editingRol.id, data);
      setModalType(null);
      setEditingRol(null);
      showAlert(
        "success",
        "Rol actualizado",
        "El rol fue actualizado correctamente.",
      );
    } catch (error) {
      const message = error?.message || "";
      const isDuplicate =
        message.toLowerCase().includes("ya existe") ||
        message.toLowerCase().includes("duplicado") ||
        message.toLowerCase().includes("duplicate");

      if (isDuplicate) {
        throw error;
      }

      showAlert(
        "error",
        "Error",
        message || "Ocurrió un error al actualizar el rol. Intenta nuevamente.",
      );
    }
  };

  // ── Pagination visual ─────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
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

  // ── Render ────────────────────────────────────────
  return (
    <div
      className="roles-page-shell"
      style={{ position: "relative", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)", gap: "0", padding: "24px 32px", width: "100%", maxWidth: "100%", boxSizing: "border-box", fontFamily: "Segoe UI, Arial, sans-serif" }}
    >
      <style>{`
        @media (max-width: 768px) {
          .roles-page-shell {
            padding: 16px 12px !important;
          }
          .roles-header {
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .roles-header-actions {
            width: 100% !important;
            align-items: stretch !important;
          }
          .roles-header-actions > div {
            width: 100% !important;
            max-width: 100% !important;
          }
          .roles-search-hint {
            white-space: normal !important;
            line-height: 1.4 !important;
          }
          .roles-action-bar {
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            padding: 12px 14px !important;
          }
          .roles-page-title,
          .roles-action-bar > * {
            width: 100% !important;
            text-align: center !important;
          }
          .roles-modal-overlay {
            padding: 16px !important;
          }
          .roles-modal-dialog {
            max-height: calc(100dvh - 32px) !important;
            border-radius: 16px !important;
          }
          .roles-modal-scroll {
            padding: 20px 16px !important;
            max-height: calc(100dvh - 32px) !important;
          }
          .roles-form-actions {
            flex-direction: column-reverse !important;
          }
          .roles-form-actions > * {
            width: 100% !important;
          }
        }
      `}</style>
      {/* Header */}
      <div
        className="roles-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <h1
          className="roles-page-title"
          style={{
            margin: 0,
            fontSize: "26px",
            fontWeight: "700",
            color: "#1a1a1a",
            fontFamily: "inherit",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Roles
        </h1>
        <div
          className="roles-header-actions"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "stretch" : "flex-end",
            gap: "4px",
            width: "100%",
            maxWidth: isMobile ? "100%" : "400px",
          }}
        >
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar"
            width={isMobile ? "100%" : "400px"}
            maxWidth={isMobile ? "100%" : "400px"}
          />
          <span
            className="roles-search-hint"
            style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}
          >
            Escribe <strong>activo</strong> para ver registros activos ·{" "}
            <strong>inactivo</strong> para ver registros inactivos
          </span>
        </div>
      </div>

      {/* Botón */}
      <div
        className="roles-action-bar"
        style={{
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-end",
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          padding: "12px 20px",
          marginBottom: "20px",
          width: "100%",
          gap: "12px",
          flexWrap: "wrap",
          boxSizing: "border-box",
        }}
      >
        {/* DERECHA - BOTÓN */}
        <div
          className="roles-toolbar-right"
          style={{
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-end",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <AddRolButton onClick={handleAddRol} />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ flex: "1 0 auto" }}>
        <RolTable
          roles={paginatedRoles}
          onView={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          startIndex={startIndex}
        />
      </div>

      {/* Modal Crear / Editar */}
      {modalType && (
        <div
          className="roles-modal-overlay"
          onClick={() => {
            setModalType(null);
            setEditingRol(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="roles-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 800,
              maxHeight: "calc(100dvh - 32px)",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
              position: "relative",
            }}
          >
            <div className="roles-modal-scroll" style={{ padding: "28px 24px", overflowY: "auto", maxHeight: "calc(100dvh - 32px)", boxSizing: "border-box", WebkitOverflowScrolling: "touch" }}>
              {modalType === "create" && (
                <CreateRolPage
                  createRol={handleCreateRol}
                  roles={roles}
                  onClose={() => setModalType(null)}
                />
              )}
              {modalType === "edit" && (
                <EditRolPage
                  rol={editingRol}
                  roles={roles}
                  updateRol={handleUpdateRol}
                  onClose={() => {
                    setModalType(null);
                    setEditingRol(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detalle */}
      {isOpen && (
        <RolDetail
          rol={selectedRol}
          onClose={closeDetail}
          onEdit={handleEdit}
        />
      )}

      {/* Paginación */}
      {filteredRoles.length > 0 && (
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
