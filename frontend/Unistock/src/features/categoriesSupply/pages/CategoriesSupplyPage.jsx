import React, { useState, useRef, useEffect } from "react";
import { useCategories } from "../hooks/useCategories";
import CategoryTable from "../components/CategoryTable";
import CategorySearch from "../components/CategorySearch";
import AddCategoryButton from "../components/AddCategorySupplyButton";
import CategoryForm from "../components/CategoryForm";
import Alert from "../../shared/components/Alert";
import { supplyAPI } from "../../supplies/services/supplyAPI";

const CategoriesSupplyPage = () => {
  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [supplyCounts, setSupplyCounts] = useState({});
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  // FIX: usar ref para el onConfirm — evita stale closure cuando el estado
  // cambia entre renders mientras el modal está abierto
  const onConfirmRef = useRef(null);

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm = null) => {
    onConfirmRef.current = onConfirm; // guardar en ref, no en estado
    setAlertConfig({ open: true, type, title, message, onConfirm });
  };

  const itemsPerPage = 7;

  const filteredCategories = categories.filter(
    (cat) =>
      cat.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.id?.toString().includes(searchTerm),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowEditForm(true);
  };

  const handleAddCategory = () => setShowCreateForm(true);

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingCategory(null);
  };

  const handleCreateSubmit = async (categoryData) => {
    try {
      await createCategory(categoryData);
      handleCloseForm();
      showAlert(
        "success",
        "Categoría creada",
        `"${categoryData.nombre}" fue creada correctamente.`,
      );
    } catch (error) {
      showAlert(
        "error",
        "Error al crear",
        error.message || "No se pudo crear la categoría.",
      );
    }
  };

  const handleEditSubmit = async (categoryData) => {
    try {
      await updateCategory(editingCategory.id, categoryData);
      handleCloseForm();
      showAlert(
        "success",
        "Categoría actualizada",
        `"${categoryData.nombre}" fue actualizada correctamente.`,
      );
    } catch (error) {
      showAlert(
        "error",
        "Error al actualizar",
        error.message || "No se pudo actualizar la categoría.",
      );
    }
  };
  
  useEffect(() => {
  const loadCounts = async () => {
    try {
      const result = await supplyAPI.getAll({ limit: 1000 });
      const counts = (result.data || []).reduce((acc, supply) => {
        const catId = String(supply.categoriaId ?? "");
        if (!catId) return acc;
        acc[catId] = (acc[catId] || 0) + 1;
        return acc;
      }, {});
      setSupplyCounts(counts);
    } catch (error) {
      console.error("Error cargando conteo:", error);
    }
  };
  loadCounts();
}, []);

  const handleDelete = (id) => {
    const category = categories.find((c) => c.id === id);

    showAlert(
      "password",
      "¿Eliminar categoría?",
      `Para eliminar "${category?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await deleteCategory(id, pwd);
          showAlert(
            "success",
            "Categoría eliminada",
            `"${category?.nombre}" fue eliminada correctamente.`,
          );
        } catch (error) {
          showAlert(
            "error",
            "Error al eliminar",
            error.message || "No se pudo eliminar la categoría.",
          );
        }
      },
    );
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
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        padding: "24px 32px",
      }}
    >
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
          Categorías de insumos
        </h1>
        <CategorySearch value={searchTerm} onChange={setSearchTerm} />
      </div>

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
        <AddCategoryButton onClick={handleAddCategory} />
      </div>

      <CategoryTable
        categories={paginatedCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        supplyCounts={supplyCounts}
      />

      {showCreateForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              pointerEvents: "auto",
              zIndex: 1001,
            }}
            onClick={handleCloseForm}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              zIndex: 1002,
              pointerEvents: "auto",
            }}
          >
            <CategoryForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {showEditForm && editingCategory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              pointerEvents: "auto",
              zIndex: 1001,
            }}
            onClick={handleCloseForm}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              zIndex: 1002,
              pointerEvents: "auto",
            }}
          >
            <CategoryForm
              category={editingCategory}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* FIX: onConfirm lee desde ref para evitar stale closure */}
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={(pwd) => {
          onConfirmRef.current?.(pwd);
        }}
        onCancel={closeAlert}
      />

      {filteredCategories.length > 0 && (
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
            disabled={currentPage === 1}
            style={{
              ...paginationBtn,
              color: currentPage === 1 ? "#ccc" : "#333",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span
                key={i}
                style={{ padding: "6px 10px", fontSize: "14px", color: "#999" }}
              >
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
            disabled={currentPage === totalPages}
            style={{
              ...paginationBtn,
              color: currentPage === totalPages ? "#ccc" : "#333",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesSupplyPage;
