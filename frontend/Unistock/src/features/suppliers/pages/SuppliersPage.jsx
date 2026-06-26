import React, { useState, useMemo } from "react";
import { useSuppliers } from "../hooks/mockSuppliers";
import { useSupplierSearch } from "../hooks/useSupplierSearch";
import { useSupplierDetail } from "../hooks/useSupplierDetail";

import SupplierForm from "../components/SupplierForm";
import SupplierTable from "../components/SupplierTable";
import AddSupplierButton from "../components/AddSupplierButton";
import SupplierDetail from "../components/SupplierDetail";
import Alert from "../../shared/components/Alert";
import LoadingState from "../../shared/components/LoadingState";
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "24px 32px" }}>
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Proveedores</h1>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <SearchInput
            value={searchTerm}
            onChange={(v) => { handleSearch(v); setCurrentPage(1); }}
            placeholder="Buscar"
            width="400px"
            maxWidth="400px"
          />
          <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
            Escribe <strong>activo</strong> para ver registros activos ·{" "}
            <strong>inactivo</strong> para ver registros inactivos
          </span>
        </div>
      </div>

      {/* BARRA BLANCA CON BOTÓN */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        padding: "12px 20px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}>
        <AddSupplierButton onClick={handleAddSupplier} />
      </div>

      {/* TABLA */}
      {loading && suppliers.length === 0 ? (
        <LoadingState message="Cargando proveedores, por favor espera un momento..." />
      ) : (
        <SupplierTable
          suppliers={paginatedSupplier}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}

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