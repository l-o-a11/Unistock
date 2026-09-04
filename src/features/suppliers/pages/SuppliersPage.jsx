import React, { useState, useMemo } from "react";
import { useSuppliers } from "../hooks/mockSuppliers";
import { useSupplierSearch } from "../hooks/useSupplierSearch";
import { useSupplierDetail } from "../hooks/useSupplierDetail";

import SupplierForm from "../components/SupplierForm";
import SupplierTable from "../components/SupplierTable";
import AddSupplierButton from "../components/AddSupplierButton";
import SupplierDetail from "../components/SupplierDetail";
import Alert from "../../shared/components/Alert";
import SearchInput from "../../shared/components/SearchInput";
import { get } from "../../shared/utils/httpClient";
import { AuthAPI } from "../../auth/services/AuthAPI";
import { useAuthContext } from "../../shared/AuthContext";

const SuppliersPage = () => {
  const { user: currentUser } = useAuthContext();
  const { suppliers, loading, deleteSupplier, toggleSupplier, createSupplier, updateSupplier } =
    useSuppliers();
  const { searchTerm, handleSearch } = useSupplierSearch();
  const { selectedSupplier, isOpen, openDetail, closeDetail } = useSupplierDetail();

  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const itemsPerPage = 7;

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];

    const term = searchTerm.toLowerCase().trim();

    return suppliers.filter((supplier) => {
      if (term === "activo") return supplier.estado === true;
      if (term === "inactivo") return supplier.estado === false;

      const estadoTexto =
        supplier.estado === true
          ? "activo"
          : supplier.estado === false
            ? "inactivo"
            : "";

      const enCampos = Object.values(supplier).some((value) =>
        String(value).toLowerCase().includes(term)
      );

      const enEstado = estadoTexto.includes(term);

      return enCampos || enEstado;
    });
  }, [suppliers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplier = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (supplier) => openDetail(supplier);

  const handleDelete = async (id) => {
    const supplier = suppliers.find((s) => s.id === id);

    try {
      const res = await get(`/suppliers/${id}/has-purchases`);
      const data = res?.data || res;
      if (data?.hasPurchases) {
        showAlert("error", "No se puede eliminar", `"${supplier?.nombreEmpresa}" tiene compras asociadas y no puede ser eliminado.`);
        return;
      }
    } catch {
      // El backend de eliminación protege por sus propias validaciones.
    }

    showAlert(
      "password",
      "Eliminar proveedor",
      `Esta acción requiere autorización. Confirma tu contraseña para eliminar "${supplier?.nombreEmpresa}".`,
      async (pwd) => {
        if (!pwd) {
          showAlert("error", "Datos incompletos", "Ingresa tu contraseña para continuar.");
          return;
        }
        const userIdentifier = currentUser?.correo || currentUser?.username || currentUser?.nombre;
        if (!userIdentifier) {
          showAlert("error", "Error de sesión", "No se pudo identificar al usuario. Recarga la página.");
          return;
        }
        try {
          const auth = await AuthAPI.login({ username: userIdentifier, password: pwd });
          const rolNombre = (auth?.rolNombre || auth?.user?.rolNombre || "").toLowerCase();
          if (rolNombre !== "gerente") {
            showAlert("error", "Acceso denegado", "Solo un usuario con rol de Gerente puede eliminar proveedores.");
            return;
          }
        } catch {
          showAlert("error", "Contraseña incorrecta", "La contraseña ingresada no es correcta.");
          return;
        }
        try {
          await deleteSupplier(id);
          showAlert("success", "Proveedor eliminado", `"${supplier?.nombreEmpresa}" fue eliminado correctamente.`);
        } catch {
          showAlert("error", "Error al eliminar", "No se pudo eliminar el proveedor. Intenta nuevamente.");
        }
      }
    );
  };

  const handleToggle = (id) => {
    const supplier = suppliers.find((s) => s.id === id);
    const accion = supplier?.estado ? "inactivar" : "activar";
    showAlert(
      "password",
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} proveedor?`,
      `Para ${accion} "${supplier?.nombreEmpresa}" confirma tu contraseña.`,
      async (pwd) => {
        const userIdentifier = currentUser?.correo || currentUser?.username || currentUser?.nombre;
        try {
          if (!userIdentifier) throw new Error("Usuario no identificado");
          await AuthAPI.login({ username: userIdentifier, password: pwd });
        } catch {
          showAlert("error", "Contraseña incorrecta", "Verifica tu contraseña e intenta nuevamente.");
          return;
        }
        toggleSupplier(id);
        showAlert(
          "success",
          `Proveedor ${accion === "activar" ? "activado" : "inactivado"}`,
          `"${supplier?.nombreEmpresa}" fue ${accion === "activar" ? "activado" : "inactivado"} correctamente.`
        );
      }
    );
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
        setShowForm(false);
        showAlert("success", "Proveedor actualizado", `"${data.nombreEmpresa}" fue actualizado correctamente.`);
      } else {
        await createSupplier(data);
        setShowForm(false);
        showAlert("success", "Proveedor creado", `"${data.nombreEmpresa}" fue creado correctamente.`);
      }
    } catch (error) {
      showAlert("error", "Error", error.message || "No se pudo completar la operación.");
    }
  };

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

  const paginationBtn = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  };

  // ── Estado de carga inicial ────────────────────────────────────────────
  // El skeleton replica EXACTAMENTE el layout del header, buscador y barra
  // del botón que se ven una vez que suppliers ya cargó, para que no haya
  // "salto" visual (título mismo tamaño, buscador mismo ancho/posición,
  // botón dentro de su propia barra blanca).
  if (loading && suppliers.length === 0) return (
    <div className="sup-root">
      <style>{`
        @keyframes uloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
        @keyframes uskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .sup-root { padding: 14px; }
        @media (min-width: 640px)  { .sup-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .sup-root { padding: 24px 32px; } }

        .sup-skel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        @media (max-width: 639px) { .sup-skel-header { flex-direction: column; align-items: center; gap: 10px; } }
        .sup-skel-search-col { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        @media (max-width: 639px) { .sup-skel-search-col { align-items: center; } }
        .sup-skel-btn-bar {
          background: #fff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          padding: 12px 20px; margin-bottom: 16px;
          display: flex; justify-content: flex-end; align-items: center;
        }
        @media (max-width: 639px) { .sup-skel-btn-bar { justify-content: center; } }
      `}</style>

      {/* HEADER: título + search — mismo layout que el estado ya cargado */}
      <div className="sup-skel-header">
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Proveedores</h1>
        <div className="sup-skel-search-col">
          {/* mismo alto/ancho/radio que SearchInput (width="400px") */}
          <div style={{
            width: 400, maxWidth: '100%', height: 38, borderRadius: 10,
            background: '#f3f4f6', border: '1px solid #e5e7eb',
            animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
          }} />
          {/* placeholder del texto de ayuda ("Escribe activo para...") */}
          <div style={{
            width: 260, height: 11, borderRadius: 6, background: '#f3f4f6',
            animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* BARRA BLANCA CON BOTÓN — mismo contenedor que AddSupplierButton */}
      <div className="sup-skel-btn-bar">
        <div style={{
          width: 168, height: 38, borderRadius: 20,
          background: 'linear-gradient(90deg, #ff8fe0, #FF4FD6)',
          opacity: 0.4, animation: 'uskeleton-pulse 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* barra de progreso */}
      <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)', animation: 'uloadbar 1.6s ease-in-out infinite' }} />
      </div>
    </div>
  );

  return (
    <div className="sup-root" style={{ display: "flex", flexDirection: "column" }}>
      <style>{`
        .sup-root { padding: 14px; }
        @media (min-width: 640px)  { .sup-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .sup-root { padding: 24px 32px; } }

        .sup-header {
          display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;
        }
        @media (min-width: 640px) {
          .sup-header {
            flex-direction: row; justify-content: space-between; align-items: center;
          }
        }
        @media (max-width: 639px) {
          .sup-header { align-items: stretch; text-align: left; }
          .sup-header h1 { text-align: center; }
        }

        .sup-search-col { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        @media (max-width: 639px) { .sup-search-col { align-items: stretch; width: 100%; } .sup-search-col > div { width: 100% !important; max-width: 100% !important; } .sup-search-col > span { align-self: flex-start; width: 100%; text-align: left; white-space: normal !important; } }

        .sup-btn-bar {
          background: #fff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          padding: 12px 20px; margin-bottom: 16px;
          display: flex; justify-content: flex-end; align-items: center;
        }
        @media (max-width: 639px) { .sup-btn-bar { justify-content: center; } }

        .sup-page-btn {
          padding: 6px 12px; border-radius: 6px;
          border: 1px solid #ddd; background: #fff;
          cursor: pointer; font-size: 14px;
        }
      `}</style>

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={closeAlert}
      />

      {/* HEADER: título + search */}
      <div className="sup-header" style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Proveedores</h1>
        <div className="sup-search-col">
          <SearchInput
  value={searchTerm}
  onChange={(v) => { handleSearch(v); setCurrentPage(1); }}
  placeholder="Buscar"
  width="400px"
  margin="0 0 4px 0"
/>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
  Escribe <strong>activo</strong> para ver registros activos ·{" "}
  <strong>inactivo</strong> para ver registros inactivos
</span>
        </div>
      </div>

      {/* BARRA BLANCA CON BOTÓN */}
      <div className="sup-btn-bar">
        <AddSupplierButton onClick={handleAddSupplier} />
      </div>

      {/* TABLA */}
      <SupplierTable
        suppliers={paginatedSupplier}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* MODAL DETALLE */}
      {isOpen && (
        <SupplierDetail
          supplier={selectedSupplier}
          onClose={closeDetail}
          onEdit={handleEdit}
        />
      )}

      {/* PAGINACIÓN */}
      {filteredSuppliers.length > 0 && (
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

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={paginationBtn}
          >
            ›
          </button>
        </div>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          allSuppliers={suppliers}
        />
      )}
    </div>
  );
};

export default SuppliersPage;