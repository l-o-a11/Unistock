import React, { useState, useMemo } from "react";
import { useSuppliers } from "../hooks/mockSuppliers";
import { useSupplierSearch } from "../hooks/useSupplierSearch";
import { useSupplierDetail } from "../hooks/useSupplierDetail";

import SupplierForm from "../components/SupplierForm";
import SupplierTable from "../components/SupplierTable";
import SupplierSearch from "../components/SupplierSearch";
import AddSupplierButton from "../components/AddSupplierButton";
import SupplierDetail from "../components/SupplierDetail";
import Alert from "../../shared/components/Alert";

const SupplierPage = () => {
  const { suppliers, deleteSupplier, toggleSupplier, createSupplier, updateSupplier } = useSuppliers();
  const { searchTerm, handleSearch } = useSupplierSearch();
  const { selectedSupplier, isOpen, openDetail, closeDetail } = useSupplierDetail();

  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const itemsPerPage = 7;

  const [alertConfig, setAlertConfig] = useState({
    open: false, type: "confirm", title: "", message: "", onConfirm: null,
  });

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    const term = searchTerm.toLowerCase();
    return suppliers.filter((supplier) =>
      Object.values(supplier).some((value) =>
        value?.toString().toLowerCase().includes(term)
      )
    );
  }, [suppliers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplier = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handleView = (supplier) => openDetail(supplier);

  const handleDelete = (id) => {
    const supplier = suppliers.find(s => s.id === id);

    // Bloquear eliminación si el proveedor está activo
    if (supplier?.estado === true) {
      setAlertConfig({
        open: true,
        type: "error",
        title: "No se puede eliminar",
        message: `El proveedor "${supplier.nombreEmpresa}" está activo. Inactívalo primero antes de eliminarlo.`,
        onConfirm: null,
      });
      return;
    }

    setAlertConfig({
      open: true,
      type: "password",
      title: "Eliminar proveedor",
      message: `¿Deseas eliminar a "${supplier?.nombreEmpresa}"? Esta acción no se puede deshacer. Ingresa la contraseña de administrador para confirmar.`,
      onConfirm: async () => {
        try {
          await deleteSupplier(id);
          setAlertConfig({ open: false, type: "confirm", title: "", message: "", onConfirm: null });
          setTimeout(() => {
            setAlertConfig({
              open: true,
              type: "success",
              title: "Proveedor eliminado",
              message: `El proveedor "${supplier?.nombreEmpresa}" fue eliminado correctamente.`,
              onConfirm: null,
            });
          }, 100);
        } catch (e) {
          setAlertConfig({
            open: true,
            type: "error",
            title: "Error al eliminar",
            message: e?.message || "No se pudo eliminar el proveedor.",
            onConfirm: null,
          });
        }
      },
    });
  };

  const handleToggle = (id) => toggleSupplier?.(id);

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data);
    } else {
      await createSupplier(data);
    }
  };

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
    <div style={{ padding: "24px 32px", background: "#f9fafb", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          if (alertConfig.onConfirm) alertConfig.onConfirm();
          else setAlertConfig(prev => ({ ...prev, open: false }));
        }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1f2937", margin: 0 }}>Proveedores</h1>
        <div style={{ width: "280px" }}>
          <SupplierSearch value={searchTerm} onChange={handleSearch} placeholder="Buscar proveedor..." />
        </div>
      </div>

      {/* Card with table */}
      <div style={{ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <AddSupplierButton onClick={handleAddSupplier} />
        </div>

        <SupplierTable
          suppliers={paginatedSupplier}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />

        {filteredSuppliers.length > 0 && (
          <div style={{ padding: "14px 20px", display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={paginationBtn}>‹</button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={i} style={{ padding: "6px 10px" }}>...</span>
              ) : (
                <button key={p} onClick={() => setCurrentPage(p)}
                  style={{ ...paginationBtn, backgroundColor: p === currentPage ? "#E91E8C" : "#fff", color: p === currentPage ? "#fff" : "#333", border: p === currentPage ? "1px solid #E91E8C" : "1px solid #ddd" }}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={paginationBtn}>›</button>
          </div>
        )}
      </div>

      {isOpen && (
        <SupplierDetail supplier={selectedSupplier} onClose={closeDetail} onEdit={handleEdit} />
      )}

      {showForm && (
        <SupplierForm supplier={editingSupplier} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
};

const paginationBtn = {
  padding: "6px 12px", borderRadius: "6px", border: "1px solid #ddd",
  background: "#fff", cursor: "pointer", fontSize: 13,
};

export default SupplierPage;
