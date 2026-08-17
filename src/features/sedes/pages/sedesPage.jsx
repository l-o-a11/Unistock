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
import SearchInput from "../../shared/components/SearchInput";
import SedeTable from "../components/SedesTable";
import SedeForm from "../components/SedesForm";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";

const SedesPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
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
  } = useSedes({ page: 1, limit: 7 });

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

  const showInitialLoading = loading && sedes.length === 0;

  // FIX #9: búsqueda delegada al servidor con debounce simple
  const handleSearch = useCallback(
    (e) => {
      const value = e?.target?.value ?? e;
      const text = String(value || "")
        .toLowerCase()
        .trim();

      // Atajo de texto: escribir "activo"/"inactivo" filtra por el
      // parámetro ?estado= en vez de mandarlo como término de búsqueda
      if (text === "activo") {
        applyFilters({ search: "", estado: "true", page: 1 });
        return;
      }
      if (text === "inactivo") {
        applyFilters({ search: "", estado: "false", page: 1 });
        return;
      }

      applyFilters({ search: value, estado: "", page: 1 });
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
    if (totalPages <= 7)
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

  if (showInitialLoading) {
    return (
      <div style={{ padding: isMobile ? "16px 12px" : "24px 32px" }}>
        <style>{`
          @keyframes eloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
          @keyframes eskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "12px" : "0", marginBottom: 20 }}>
          <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Sedes</h1>
          <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: 4 }}>
            <div style={{ width: 400, maxWidth: "100%", height: 38, borderRadius: 10, background: "#f3f4f6", border: "1px solid #e5e7eb", animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
            <div style={{ width: 260, height: 11, borderRadius: 6, background: "#f3f4f6", animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: "12px 20px", marginBottom: 16, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <div style={{ width: 168, height: 38, borderRadius: 20, background: "linear-gradient(90deg, #ff8fe0, #FF4FD6)", opacity: 0.4, animation: "eskeleton-pulse 1.6s ease-in-out infinite" }} />
        </div>

        <div style={{ position: "relative", height: 3, background: "#fce7f3", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)", animation: "eloadbar 1.6s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)", padding: isMobile ? "16px 12px" : "24px 32px", boxSizing: "border-box", backgroundColor: "#f5f5f5" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "0",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? "22px" : "26px",
            fontWeight: "700",
            color: "#1a1a1a",
            width: isMobile ? "100%" : "auto",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Sedes
        </h1>
        {/* FIX #9: onChange llama a applyFilters → búsqueda server-side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "stretch" : "flex-end",
            gap: "4px",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <SearchInput
            onChange={handleSearch}
            placeholder="Buscar"
            width={isMobile ? "100%" : "400px"}
            maxWidth={isMobile ? "100%" : "400px"}
          />
          <span
            style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: isMobile ? "normal" : "nowrap", lineHeight: isMobile ? 1.4 : "normal" }}
          >
            Escribe <strong>activo</strong> para ver compras activas ·{" "}
            <strong>anulado</strong> para ver compras anuladas
          </span>
        </div>
      </div>

      {/* Botón crear */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "flex-end",
          flexDirection: isMobile ? "column" : "row",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          padding: "12px 20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", width: isMobile ? "100%" : "auto" }}>
          <AddSedesButton onClick={handleCreate} />
        </div>
      </div>

      {/* Tabla — muestra solo la página actual devuelta por el servidor */}
      <div style={{ flex: "1 0 auto" }}>
        <SedeTable
          sedes={sedes}
          loading={loading}
          onView={(sede) => setSelectedSede(sede)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>

      {/* Modal Crear / Editar */}
      {modalType && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
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
              boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
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
            backgroundColor: "rgba(0, 0, 0, 0.45)",
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
              boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
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
