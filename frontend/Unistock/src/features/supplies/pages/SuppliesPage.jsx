import React, { useState } from "react";
import { useSupplies } from "../hooks/useSupplies";
import { useSupplySearch } from "../hooks/useSupplySearch";
import SupplyTable from "../components/SupplyTable";
import SupplySearch from "../components/SupplySearch";
import AddSupplyButton from "../components/AddSupplyButton";
import SupplyForm from "../components/SupplyForm";
import SupplyDetail from "../components/SupplyDetail";
import Alert from "../../shared/components/Alert";

const ADMIN_PASSWORD = "1234"; // TODO: validar en backend

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
  } = useSupplies();

  const { searchTerm, handleSearch } = useSupplySearch();

  const [selectedSupply, setSelectedSupply] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

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
  /*const filteredSupplies = supplies.filter((s) => {
    const text = searchTerm.toLowerCase();
    return (
      s.id?.toString().includes(searchTerm) ||
      s.stock?.toString().includes(searchTerm) ||
      s.nombre?.toLowerCase().includes(text) ||
      s.valorMedida?.toString().includes(searchTerm) ||
      getCategoriaNombre(s.categoriaId)?.toLowerCase().includes(text) ||
      getMedidaNombre(s.medidaId)?.toLowerCase().includes(text)
    );
  });*/
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
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && s.estado) ||
      (estadoFiltro === "inactivos" && !s.estado);

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

  const handleView = (supply) => setSelectedSupply(supply);

  const handleDelete = async (id) => {
    const supply = supplies.find((s) => s.id === id);

    // TODO: validar fichas técnicas enlazadas
    // Cuando el módulo de fichas esté listo, descomenta:
    // const fichasEnlazadas = getFichasEnlazadas(id); // ver useSupplies.js
    // if (fichasEnlazadas > 0) {
    //   showAlert("error", "No se puede eliminar",
    //     `"${supply?.nombre}" está enlazado a ${fichasEnlazadas} ficha(s) técnica(s). Desasócialo primero.`);
    //   return;
    // }

    showAlert(
      "password",
      "¿Eliminar insumo?",
      `Para eliminar "${supply?.nombre}" confirma tu contraseña de administrador.`,
      async (pwd) => {
        if (pwd !== ADMIN_PASSWORD) {
          showAlert(
            "error",
            "Contraseña incorrecta",
            "Verifica tu contraseña e intenta nuevamente.",
          );
          return;
        }
        try {
          await deleteSupply(id);
          showAlert(
            "success",
            "Insumo eliminado",
            `"${supply?.nombre}" fue eliminado correctamente.`,
          );
        } catch {
          showAlert(
            "error",
            "Error",
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
      (pwd) => {
        if (pwd !== ADMIN_PASSWORD) {
          showAlert(
            "error",
            "Contraseña incorrecta",
            "Verifica tu contraseña e intenta nuevamente.",
          );
          return;
        }
        toggleSupply(id);
        showAlert(
          "success",
          `Insumo ${accion === "activar" ? "activado" : "inactivado"}`,
          `"${supply?.nombre}" fue ${accion === "activar" ? "activado" : "inactivado"} correctamente.`,
        );
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

  // El SupplyForm maneja su propia alerta de confirmación antes de llamar onCancel
  const handleCancelCreate = () => handleCloseForm();
  const handleCancelEdit = () => handleCloseForm();

  const handleDownload = () => {
    const csv = [
      ["id", "Nombre", "Categoría", "Stock"],
      ...filteredSupplies.map((s) => [
        s.id,
        s.nombre,
        getCategoriaNombre(s.categoriaId),
        s.stock,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insumos.csv";
    a.click();
    URL.revokeObjectURL(url);
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
        <SupplySearch value={searchTerm} onChange={handleSearch} />
      </div>

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
    
    {/* BOTÓN EXPORTAR */}
    <button
      onClick={handleDownload}
      title="Exportar insumos"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#555",
        display: "flex",
        alignItems: "center",
        padding: "4px",
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
        </button>

    {/* CHIPS */}
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* MODAL CREAR */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <SupplyForm
            categorias={categorias}
            medidas={medidas}
            propiedades={propiedades}
            onSubmit={handleCreateSubmit}
            onCancel={handleCancelCreate}
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
