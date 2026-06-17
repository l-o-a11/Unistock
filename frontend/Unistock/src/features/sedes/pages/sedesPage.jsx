/**
 * sedesPage.jsx
 *
 * FIX #9: paginación delegada al servidor (via useSedes)
 *         Se eliminó el filtrado/paginación local. El search ahora llama a la API.
 * FIX #10: ADMIN_PASSWORD eliminada del frontend.
 *          Las acciones protegidas (eliminar/toggle) ahora verifican la contraseña
 *          contra el endpoint POST /api/auth/verify-password del backend.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useSedes } from "../hooks/useSedes";
import Alert from "../../shared/components/Alert";
import AddSedesButton from "../components/AddSedesButton";
import SedesSearch from "../components/SedesSearch";
import SedeTable from "../components/SedesTable";
import SedeForm from "../components/SedesForm";

const SedesPage = () => {
  // FIX #9: useSedes ahora gestiona paginación server-side
  const {
    sedes,
    pagination,
    loading,
    createSede,
    updateSede,
    deleteSede,
    toggleSede,
    goToPage,
    applyFilters,
  } = useSedes({ page: 1, limit: 10 });

  const [modalType, setModalType] = useState(null); // "create" | "edit"
  const [editingSede, setEditingSede] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    if (!selectedSede) return;
    const updated = sedes.find((s) => s.id === selectedSede.id);
    if (updated && updated !== selectedSede) {
      setSelectedSede(updated);
    }
  }, [sedes, selectedSede]);

  const closeAlert = () => setAlertConfig((p) => ({ ...p, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  // FIX #9: búsqueda delegada al servidor con debounce simple
  const handleSearch = useCallback(
    (e) => {
      const value = e?.target?.value ?? e;
      applyFilters({ search: value, page: 1 });
    },
    [applyFilters],
  );

  // ── Acciones CRUD ──────────────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingSede(null);
    setModalType("create");
  };
  const handleEdit = (sede) => {
    setEditingSede(sede);
    setModalType("edit");
  };
  const handleClose = () => {
    setModalType(null);
    setEditingSede(null);
  };

  const handleDelete = (id) => {
    const sede = sedes.find((s) => s.id === id);
    showAlert(
      "password",
      "¿Eliminar sede?",
      `Para eliminar "${sede?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await deleteSede(id, pwd);
          showAlert(
            "success",
            "Sede eliminada",
            `"${sede?.nombre}" fue eliminada correctamente.`,
          );
        } catch (err) {
          showAlert(
            "error",
            "Error",
            err.message || "No se pudo eliminar la sede.",
          );
        }
      },
    );
  };

  const handleToggle = (id) => {
    const sede = sedes.find((s) => s.id === id);
    const accion = sede?.estado ? "inactivar" : "activar";
    showAlert(
      "password",
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} sede?`,
      `Para ${accion} "${sede?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await toggleSede(id, pwd);
          showAlert(
            "success",
            `Sede ${accion === "activar" ? "activada" : "inactivada"}`,
            `"${sede?.nombre}" fue ${accion === "activar" ? "activada" : "inactivada"} correctamente.`,
          );
        } catch (err) {
          showAlert(
            "error",
            "Error",
            err.message || `No se pudo ${accion} la sede.`,
          );
        }
      },
    );
  };

  const handleCreateSubmit = async (data) => {
    try {
      await createSede(data);
      handleClose();
      showAlert(
        "success",
        "Sede creada",
        `"${data.nombre}" fue creada correctamente.`,
      );
    } catch (err) {
      showAlert(
        "error",
        "Error al crear",
        err.message || "No se pudo crear la sede.",
      );
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateSede(editingSede.id, data);
      handleClose();
      showAlert(
        "success",
        "Sede actualizada",
        `"${data.nombre}" fue actualizada correctamente.`,
      );
    } catch (err) {
      showAlert(
        "error",
        "Error al actualizar",
        err.message || "No se pudo actualizar la sede.",
      );
    }
  };

  // ── Paginación (FIX #9 — usa pagination del servidor) ─────────────────────
  const { page: currentPage, totalPages } = pagination;

  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pBtn = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", padding: "24px 32px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "26px",
            fontWeight: "700",
            color: "#1a1a1a",
          }}
        >
          Sedes
        </h1>
        {/* FIX #9: onChange llama a applyFilters → búsqueda server-side */}
        <SedesSearch onChange={handleSearch} />
      </div>

      {/* Botón crear */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          padding: "12px 20px",
          marginBottom: "20px",
        }}
      >
        <AddSedesButton onClick={handleCreate} />
      </div>

      {/* Tabla — muestra solo la página actual devuelta por el servidor */}
      <SedeTable
        sedes={sedes}
        loading={loading}
        onView={(sede) => setSelectedSede(sede)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* Modal Crear / Editar */}
      {modalType && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "28px 24px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            }}
          >
            <SedeForm
              sede={modalType === "edit" ? editingSede : null}
              onSubmit={
                modalType === "edit" ? handleEditSubmit : handleCreateSubmit
              }
              onCancel={handleClose}
            />
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {selectedSede && (
        <div
          onClick={() => setSelectedSede(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px 16px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                Detalle de Sede
              </h2>
              <button
                onClick={() => setSelectedSede(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#aaa",
                  fontSize: "20px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {[
                ["ID", selectedSede.id],
                ["Nombre", selectedSede.nombre],
                ["Ciudad", selectedSede.ciudad],
                ["Barrio", selectedSede.barrio],
                ["Dirección", selectedSede.direccion],
                ["Teléfono", selectedSede.telefono],
                [
                  "Estado",
                  selectedSede.estado !== false ? "Activa" : "Inactiva",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <span
                    style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: label === "Estado" ? 600 : 400,
                      color:
                        label === "Estado"
                          ? selectedSede.estado !== false
                            ? "#22c55e"
                            : "#ef4444"
                          : "#111",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "0 24px 20px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setSelectedSede(null);
                  handleEdit(selectedSede);
                }}
                style={{
                  padding: "9px 22px",
                  borderRadius: "50px",
                  border: "none",
                  background: "#FF4FD6",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px #FF4FD644",
                }}
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginación (FIX #9 — usa totalPages del servidor) */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            style={pBtn}
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
                onClick={() => goToPage(p)}
                style={{
                  ...pBtn,
                  background: p === currentPage ? "#FF4FD6" : "#fff",
                  color: p === currentPage ? "#fff" : "#000",
                  border:
                    p === currentPage ? "1px solid #FF4FD6" : "1px solid #ddd",
                }}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            style={pBtn}
          >
            ›
          </button>
        </div>
      )}

      {/* Alert */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={(pwd) => {
          alertConfig.onConfirm?.(pwd);
        }}
        onCancel={closeAlert}
      />
    </div>
  );
};

export default SedesPage;
