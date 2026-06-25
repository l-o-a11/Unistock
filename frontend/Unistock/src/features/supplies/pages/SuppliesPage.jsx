import React, { useState } from "react";
import { useSupplies } from "../hooks/useSupplies";
import { useSupplySearch } from "../hooks/useSupplySearch";
import SupplyTable from "../components/SupplyTable";
import SearchInput from "../../shared/components/SearchInput";
import AddSupplyButton from "../components/AddSupplyButton";
import SupplyForm from "../components/SupplyForm";
import SupplyDetail from "../components/SupplyDetail";
import Alert from "../../shared/components/Alert";
import SupplyCategoriesModal from "../components/SupplyCategoriesModal";
import CategoryForm from "../../categoriesSupply/components/CategoryForm";
import { useCategories } from "../../categoriesSupply/hooks/useCategories";
import { supplyAPI } from "../services/supplyAPI";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SuppliesPage = () => {
  const {
    supplies,
    createSupply,
    updateSupply,
    deleteSupply,
    toggleSupply,
    categorias,
    medidas,
    propiedades,
    getCategoriaNombre,
    getMedidaNombre,
    refreshCatalogos,
  } = useSupplies();

  const { searchTerm, handleSearch } = useSupplySearch();
  const { createCategory, updateCategory, deleteCategory } = useCategories();

  const [selectedSupply, setSelectedSupply] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const estadoFiltro = "todos"; // Always show all (filter via search)
  const [statusFilter, setStatusFilter] = useState("todos"); // For filtering by estado:
  const [showCategories, setShowCategories] = useState(false); // 👈 nuevo
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categorySupplyCounts, setCategorySupplyCounts] = useState({});

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  // ── Alert helpers ──────────────────────────────────────────────────────────
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ open: true, type, title, message, onConfirm });
  };

  // ── Filtrado y paginación ──────────────────────────────────────────────────
  const filteredSupplies = supplies.filter((s) => {
    const text = searchTerm.toLowerCase();

    const coincideBusqueda =
      s.id?.toString().includes(searchTerm) ||
      s.stock?.toString().includes(searchTerm) ||
      s.nombre?.toLowerCase().includes(text) ||
      s.valorMedida?.toString().includes(searchTerm) ||
      getCategoriaNombre(s.categoriaId)?.toLowerCase().includes(text) ||
      getMedidaNombre(s.medidaId)?.toLowerCase().includes(text);

    const coincideEstado =
      statusFilter === "todos" ||
      (statusFilter === "activos" && s.estado) ||
      (statusFilter === "inactivos" && !s.estado);

    return coincideBusqueda && coincideEstado;
  });

  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSupplies.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSupplies = filteredSupplies.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ── Acciones ───────────────────────────────────────────────────────────────
  const handleAddSupply = () => setShowCreateForm(true);

  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingSupply(null);
  };

  const handleCategoryCloseForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleOpenCreateCategoryForm = () => {
    setShowCreateCategoryForm(true);
  };

  const handleCreateCategoryCloseForm = () => {
    setShowCreateCategoryForm(false);
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  // Wrapper for search input: allow special directives to change statusFilter
  const handleSearchWithState = (term) => {
    const t = String(term || "").trim();
    if (!t) {
      setCurrentPage(1);
      setStatusFilter("todos");
      handleSearch("");
      return;
    }

    const lower = t.toLowerCase();

    // Accept explicit directives: "estado:activo", "estado=activo", "estado activo"
    const m = lower.match(/^estado\s*[:= ]\s*(activos?|inactivos?|todos?)$/);
    if (m) {
      const val = m[1];
      if (val.startsWith("activo")) setStatusFilter("activos");
      else if (val.startsWith("inactivo")) setStatusFilter("inactivos");
      else setStatusFilter("todos");
      setCurrentPage(1);
      // clear the textual search when using directive
      handleSearch("");
      return;
    }

    // Also accept exact shorthand: "activos" or "inactivos"
    if (lower === "activos" || lower === "activo") {
      setStatusFilter("activos");
      setCurrentPage(1);
      handleSearch("");
      return;
    }
    if (lower === "inactivos" || lower === "inactivo") {
      setStatusFilter("inactivos");
      setCurrentPage(1);
      handleSearch("");
      return;
    }

    // Default: normal search (doesn't change statusFilter)
    setStatusFilter("todos");
    setCurrentPage(1);
    handleSearch(term);
  };

  const loadCategorySupplyCounts = async () => {
    try {
      const result = await supplyAPI.getAll({ limit: 1000 });
      const counts = (result.data || []).reduce((acc, supply) => {
        const catId = String(supply.categoriaId ?? supply.categoriaId ?? "");
        if (!catId) return acc;
        acc[catId] = (acc[catId] || 0) + 1;
        return acc;
      }, {});
      setCategorySupplyCounts(counts);
    } catch (error) {
      console.error("Error cargando conteo de insumos por categoría:", error);
      setCategorySupplyCounts({});
    }
  };

  const openCategoriesModal = async () => {
    await loadCategorySupplyCounts();
    setShowCategories(true);
  };

  const handleCategoryDelete = (id) => {
    const category = categorias.find((c) => c.id === id);

    showAlert(
      "confirm",
      "¿Eliminar categoría?",
      `La categoría "${category?.nombre}" será eliminada permanentemente.`,
      async () => {
        closeAlert();
        try {
          await deleteCategory(id);
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

  const handleCategorySubmit = async (categoryData) => {
    try {
      await updateCategory(editingCategory.id, categoryData);
      handleCategoryCloseForm();
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

  const handleCreateCategorySubmit = async (categoryData) => {
    try {
      await createCategory(categoryData);
      await refreshCatalogos();
      handleCreateCategoryCloseForm();
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

  const handleView = (supply, displayId) =>
    setSelectedSupply({ ...supply, displayId });

  const handleDelete = async (id) => {
    const supply = supplies.find((s) => s.id === id);

    showAlert(
      "password",
      "¿Eliminar insumo?",
      `Para eliminar "${supply?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await deleteSupply(id, pwd);
          showAlert(
            "success",
            "Insumo eliminado",
            `"${supply?.nombre}" fue eliminado correctamente.`,
          );
        } catch (error) {
          showAlert(
            "error",
            "Error",
            error.message ||
            "No se pudo eliminar el insumo. Intenta nuevamente.",
          );
        }
      },
    );
  };

  const handleToggle = (id) => {
    const supply = supplies.find((s) => s.id === id);
    const accion = supply?.estado ? "inactivar" : "activar";
    showAlert(
      "password",
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} insumo?`,
      `Para ${accion} "${supply?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        try {
          await toggleSupply(id, pwd);
          showAlert(
            "success",
            `Insumo ${accion === "activar" ? "activado" : "inactivado"}`,
            `"${supply?.nombre}" fue ${accion === "activar" ? "activado" : "inactivado"} correctamente.`,
          );
        } catch (error) {
          showAlert(
            "error",
            "Error",
            error.message ||
            "No se pudo cambiar el estado del insumo. Intenta nuevamente.",
          );
        }
      },
    );
  };

  const handleCreateSubmit = async (supplyData) => {
    try {
      await createSupply(supplyData);
      handleCloseForm();
      showAlert(
        "success",
        "Insumo creado",
        `"${supplyData.nombre}" fue creado correctamente.`,
      );
    } catch (error) {
      showAlert(
        "error",
        "Error al crear",
        error.message || "No se pudo crear el insumo.",
      );
    }
  };

  const handleEditSubmit = async (supplyData) => {
    try {
      await updateSupply(editingSupply.id, supplyData);
      handleCloseForm();
      showAlert(
        "success",
        "Insumo actualizado",
        `"${supplyData.nombre}" fue actualizado correctamente.`,
      );
    } catch (error) {
      showAlert(
        "error",
        "Error al actualizar",
        error.message || "No se pudo actualizar el insumo.",
      );
    }
  };

  const handleCancelCreate = () => handleCloseForm();
  const handleCancelEdit = () => handleCloseForm();

  const getExportData = () =>
    filteredSupplies.map((s) => ({
      ID: s.id,
      Nombre: s.nombre,
      Categoría: getCategoriaNombre(s.categoriaId) || "",
      Medida: getMedidaNombre(s.medidaId) || "",
      "Valor medida": s.valorMedida,
      Stock: s.stock,
      Estado: s.estado ? "Activo" : "Inactivo",
    }));

  const handleDownloadExcel = () => {
    try {
      const data = getExportData();
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
        { wch: 10 },
        { wch: 12 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Insumos");

      const fecha = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `insumos_${fecha}.xlsx`);
      showAlert(
        "success",
        "Descarga lista",
        "El archivo Excel se descargó correctamente.",
      );
    } catch (error) {
      console.error("Error exportando Excel:", error);
      showAlert("error", "Error", "No se pudo descargar el archivo Excel.");
    }
  };

  const handleDownloadPDF = () => {
    try {
      const data = getExportData();
      const doc = new jsPDF({ orientation: "landscape" });
      const fecha = new Date().toISOString().split("T")[0];

      doc.setFontSize(16);
      doc.text("Reporte de insumos", 14, 16);

      autoTable(doc, {
        startY: 22,
        head: [
          [
            "ID",
            "Nombre",
            "Categoría",
            "Medida",
            "Valor medida",
            "Stock",
            "Estado",
          ],
        ],
        body: data.map((item) => [
          item.ID,
          item.Nombre,
          item.Categoría,
          item.Medida,
          item["Valor medida"],
          item.Stock,
          item.Estado,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [255, 79, 214], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });

      doc.save(`insumos_${fecha}.pdf`);
      showAlert(
        "success",
        "Descarga lista",
        "El archivo PDF se descargó correctamente.",
      );
    } catch (error) {
      console.error("Error exportando PDF:", error);
      showAlert("error", "Error", "No se pudo descargar el archivo PDF.");
    }
  };

  // ── Paginación visual ──────────────────────────────────────────────────────
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
      style={{ display: "flex", flexDirection: "column", padding: "24px 32px" }}
    >
      {/* HEADER */}
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
          Insumos
        </h1>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <SearchInput
            value={searchTerm}
            onChange={handleSearchWithState}
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

      {/* BARRA DE HERRAMIENTAS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#fff",
          padding: "12px 20px",
          borderRadius: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        {/* IZQUIERDA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* BOTÓN EXPORTAR (abre modal de elección) */}
          <button
            onClick={() => setShowDownloadModal(true)}
            title="Exportar insumos"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#555",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              gap: "6px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E91E8C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar
          </button>

          {/* BOTÓN CATEGORÍAS 👈 nuevo */}
          <button
            onClick={openCategoriesModal}
            title="Ver categorías de insumos"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#555",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#E91E8C";
              e.currentTarget.style.background = "#fdf5fb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#555";
              e.currentTarget.style.background = "none";
            }}
          >
            {/* Icono tag/categoría */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Categorías
            {/* Badge con conteo */}
            {categorias?.length > 0 && (
              <span
                style={{
                  background: "#FF4FD6",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  lineHeight: "1.5",
                }}
              >
                {categorias.length}
              </span>
            )}
          </button>
        </div>

        {/* DERECHA */}
        <AddSupplyButton onClick={handleAddSupply} />
      </div>

      {/* TABLA */}
      <SupplyTable
        supplies={paginatedSupplies}
        getCategoriaNombre={getCategoriaNombre}
        getMedidaNombre={getMedidaNombre}
        onView={handleView}
        startIndex={startIndex}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* MODAL CATEGORÍAS 👈 nuevo */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Descargar insumos
              </h3>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "20px",
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p
              style={{ margin: "0 0 18px", color: "#6b7280", fontSize: "14px" }}
            >
              Elige el formato para exportar la lista actual.
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  handleDownloadExcel();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  padding: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#e8f5ee",
                    display: "grid",
                    placeItems: "center",
                    color: "#15803d",
                    fontWeight: 700,
                  }}
                >
                  X
                </span>
                <span>
                  <strong
                    style={{
                      display: "block",
                      color: "#111827",
                      fontSize: "14px",
                    }}
                  >
                    Excel
                  </strong>
                  <small style={{ color: "#6b7280" }}>
                    Compatible con Excel y Google Sheets
                  </small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  handleDownloadPDF();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  padding: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#fee2e2",
                    display: "grid",
                    placeItems: "center",
                    color: "#b91c1c",
                    fontWeight: 700,
                  }}
                >
                  P
                </span>
                <span>
                  <strong
                    style={{
                      display: "block",
                      color: "#111827",
                      fontSize: "14px",
                    }}
                  >
                    PDF
                  </strong>
                  <small style={{ color: "#6b7280" }}>
                    Versión lista para imprimir o compartir
                  </small>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategories && (
        <SupplyCategoriesModal
          categorias={categorias}
          supplyCounts={categorySupplyCounts}
          onEdit={handleCategoryEdit}
          onDelete={handleCategoryDelete}
          onClose={() => setShowCategories(false)}
        />
      )}

      {showCategoryForm && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-8">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <CategoryForm
              category={editingCategory}
              onSubmit={handleCategorySubmit}
              onCancel={handleCategoryCloseForm}
            />
          </div>
        </div>
      )}

      {showCreateCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-8">
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            <CategoryForm
              onSubmit={handleCreateCategorySubmit}
              onCancel={handleCreateCategoryCloseForm}
            />
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <SupplyForm
            categorias={categorias}
            medidas={medidas}
            propiedades={propiedades}
            onSubmit={handleCreateSubmit}
            onCancel={handleCancelCreate}
            onCreateCategory={handleOpenCreateCategoryForm}
          />
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditForm && editingSupply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <SupplyForm
            supply={editingSupply}
            categorias={categorias}
            medidas={medidas}
            propiedades={propiedades}
            onSubmit={handleEditSubmit}
            onCancel={handleCancelEdit}
            onCreateCategory={handleOpenCreateCategoryForm}
          />
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedSupply && (
        <SupplyDetail
          supply={selectedSupply}
          medidas={medidas}
          propiedades={propiedades}
          categorias={categorias}
          onClose={() => setSelectedSupply(null)}
          onEdit={(supply) => {
            setSelectedSupply(null);
            handleEdit(supply);
          }}
        />
      )}

      {/* PAGINACIÓN */}
      {filteredSupplies.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "6px",
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
                  background: p === currentPage ? "#FF4FD6" : "#fff",
                  color: p === currentPage ? "#fff" : "#000",
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

      {/* ALERT GLOBAL */}
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

export default SuppliesPage;