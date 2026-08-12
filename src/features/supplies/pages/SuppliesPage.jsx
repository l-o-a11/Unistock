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
// TODO: ajustar la ruta del logo según la ubicación real del asset en tu proyecto
import putongasLogoUrl from "../../../assets/transparent-Photoroom.png";

const SuppliesPage = () => {
  const {
    supplies,
    loading,
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

  if (loading) {
    return (
      <div style={{ padding: "24px 32px" }}>
        <style>{`
          @keyframes eloadbar { 0% { left: -40%; width: 40%; } 50% { left: 30%; width: 50%; } 100% { left: 110%; width: 40%; } }
          @keyframes eskeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Insumos</h1>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
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

  const handleView = (supply) => setSelectedSupply(supply);

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

  /* ══════════════════════════════════════════════════════════════════════
   * DESCARGA EXCEL — ExcelJS con estilos paleta empresa + logo Putongas
   * Sin negros en fondos: header magenta UniStock, filas rosas/blancas
   * ══════════════════════════════════════════════════════════════════════ */
  const handleDownloadExcel = async () => {
    setShowDownloadModal(false);

    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "UniStock";
      wb.created = new Date();

      const ws = wb.addWorksheet("Insumos", {
        pageSetup: { orientation: "landscape", fitToPage: true },
      });

      const now = new Date();
      const fecha = now.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      /* ── Columnas ── */
      ws.columns = [
        { key: "nombre", width: 30 },
        { key: "categoria", width: 20 },
        { key: "medida", width: 16 },
        { key: "valorMedida", width: 14 },
        { key: "stock", width: 12 },
        { key: "estado", width: 14 },
      ];

      const ARGB = (hex) => "FF" + hex.replace("#", "").toUpperCase();
      const fillSolid = (hex) => ({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: ARGB(hex) },
      });
      const thinBorder = (hex = "#FF4FD6") => {
        const c = { style: "thin", color: { argb: ARGB(hex) } };
        return { top: c, bottom: c, left: c, right: c };
      };

      /* ── Logo Putongas (filas 1-4, columna A) ── */
      try {
        const logoRes = await fetch(putongasLogoUrl);
        const logoBlob = await logoRes.blob();
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(logoBlob);
        });
        const logoImageId = wb.addImage({
          base64: logoBase64,
          extension: "png",
        });
        ws.addImage(logoImageId, {
          tl: { col: 0.15, row: 0.15 },
          ext: { width: 46, height: 60 },
        });
      } catch (logoError) {
        console.warn("No se pudo cargar el logo:", logoError);
      }

      /* ── Fila 1: título (logo ocupa col A visualmente) ── */
      ws.mergeCells("B1:F1");
      ws.getRow(1).height = 30;
      const titleCell = ws.getCell("B1");
      titleCell.value = "Insumos — Sistema de Gestión UniStock";
      titleCell.font = {
        name: "Arial",
        size: 15,
        bold: true,
        color: { argb: "000000" },
      };
      titleCell.alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      ["A1", "B1", "C1", "D1", "E1", "F1"].forEach((ref) => {
        ws.getCell(ref).fill = fillSolid("#FFFFFF");
      });

      /* ── Fila 2: subtítulo ── */
      ws.mergeCells("B2:F2");
      ws.getRow(2).height = 18;
      const subCell = ws.getCell("B2");
      subCell.value = `Generado el ${fecha}  ·  ${filteredSupplies.length} insumo${filteredSupplies.length !== 1 ? "s" : ""}`;
      subCell.font = { name: "Arial", size: 10, color: { argb: "#000000" } };
      subCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      ["A2", "B2", "C2", "D2", "E2", "F2"].forEach((ref) => {
        ws.getCell(ref).fill = fillSolid("#FFFFFF");
      });
      ws.getCell("B2").border = {
        bottom: { style: "thin", color: { argb: ARGB("#FF4FD6") } },
      };

      /* ── Fila 3: separadora ── */
      ws.getRow(3).height = 6;
      ["A3", "B3", "C3", "D3", "E3", "F3"].forEach((ref) => {
        ws.getCell(ref).fill = fillSolid("#FFFFFF");
      });

      /* ── Fila 4: encabezados de columnas ── */
      const headerRow = ws.getRow(4);
      headerRow.height = 26;
      const headers = [
        "Nombre",
        "Categoría",
        "Medida",
        "Valor medida",
        "Stock",
        "Estado",
      ];
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: ARGB("#FF4FD6") },
        };
        cell.fill = fillSolid("#FFFFFF");
        cell.alignment = {
          horizontal: i === 4 || i === 5 ? "right" : "left",
          vertical: "middle",
          indent: i === 4 || i === 5 ? 0 : 1,
        };
        const pinkThin = { style: "thin", color: { argb: ARGB("#FF4FD6") } };
        cell.border = {
          top: pinkThin,
          left: pinkThin,
          right: pinkThin,
          bottom: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
        };
      });

      /* ── Filas de datos ── */
      filteredSupplies.forEach((s, i) => {
        const row = ws.getRow(5 + i);
        row.height = 20;
        const baseFill = fillSolid("#FFFFFF");

        const values = [
          s.nombre || "—",
          getCategoriaNombre(s.categoriaId) || "—",
          getMedidaNombre(s.medidaId) || "—",
          s.valorMedida ?? "—",
          s.stock ?? 0,
          s.estado ? "Activo" : "Inactivo",
        ];

        values.forEach((v, ci) => {
          const cell = row.getCell(ci + 1);
          cell.value = v;
          cell.fill = baseFill;
          cell.border = thinBorder();
          cell.alignment = {
            horizontal: ci === 4 || ci === 5 ? "right" : "left",
            vertical: "middle",
            indent: ci === 4 || ci === 5 ? 0 : 1,
          };
          cell.font = { name: "Arial", size: 10, color: { argb: "FF374151" } };
        });

        /* Stock: morado oscuro bold */
        row.getCell(5).font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: ARGB("#a858d6") },
        };
      });

      /* ── Fila de totales ── */
      const totalRowIdx = filteredSupplies.length + 6;
      const totalStock = filteredSupplies.reduce(
        (s, item) => s + (Number(item.stock) || 0),
        0,
      );
      const totalRow = ws.getRow(totalRowIdx);

      const totalLabelCell = totalRow.getCell(2);
      totalLabelCell.value = "Total stock";
      totalLabelCell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: ARGB("#363636") },
      };
      totalLabelCell.fill = fillSolid("#FFFFFF");
      totalLabelCell.alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      totalLabelCell.border = {
        top: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
      };

      const totalValueCell = totalRow.getCell(5);
      totalValueCell.value = totalStock;
      totalValueCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: ARGB("#a858d6") },
      };
      totalValueCell.fill = fillSolid("#FFFFFF");
      totalValueCell.alignment = { horizontal: "right", vertical: "middle" };
      totalValueCell.border = {
        top: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
      };

      /* Resto de celdas de la fila de totales con el mismo fondo */
      [1, 3, 4, 6].forEach((col) => {
        const c = totalRow.getCell(col);
        c.fill = fillSolid("#FFFFFF");
        c.border = {
          top: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
        };
      });

      /* ── Generar y descargar ── */
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "insumos.xlsx";
      link.click();
      URL.revokeObjectURL(url);

      showAlert(
        "success",
        "Descarga lista",
        "El archivo Excel se descargó correctamente.",
      );
    } catch (e) {
      console.error("Error generando Excel:", e);
      try {
        const rows = [
            [
              "Nombre",
              "Categoría",
              "Medida",
              "Valor medida",
              "Stock",
              "Estado",
            ],
            ...filteredSupplies.map((s) => [
              s.nombre || "",
              getCategoriaNombre(s.categoriaId) || "",
              getMedidaNombre(s.medidaId) || "",
              s.valorMedida ?? "",
              s.stock ?? 0,
              s.estado ? "Activo" : "Inactivo",
            ]),
          ];
        const csv = rows
          .map((r) =>
            r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
          )
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "insumos.csv";
        link.click();
        URL.revokeObjectURL(url);
        showAlert(
          "success",
          "Descarga lista",
          "Se generó un CSV de respaldo (no se pudo generar el Excel).",
        );
      } catch (fallbackError) {
        console.error("Error generando CSV de respaldo:", fallbackError);
        showAlert("error", "Error", "No se pudo descargar el archivo Excel.");
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
   * DESCARGA PDF — sin degradados, sin negros en fondos, logo Putongas
   * Header: #ff4fd698 (morado suave)
   * Fecha/hora: blanco puro #ffffff
   * Tarjetas totales: rosas/lila planos
   * Color principal: #FF4FD6
   * ══════════════════════════════════════════════════════════════════════ */
  const handleDownloadPDF = () => {
    setShowDownloadModal(false);

    const now = new Date();
    const fecha = now.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const hora = now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const estadoSummary = filteredSupplies.reduce((acc, s) => {
      const e = s.estado ? "Activo" : "Inactivo";
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {});
    const totalStock = filteredSupplies.reduce(
      (s, item) => s + (Number(item.stock) || 0),
      0,
    );

    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const estadoBadge = (activo) => ({
      bg: activo ? "#dcfce7" : "#fee2e2",
      color: activo ? "#15803d" : "#b91c1c",
      dot: activo ? "#22c55e" : "#ef4444",
    });

    const tableRows = filteredSupplies
      .map((s, i) => {
        const sc = estadoBadge(s.estado);
        return `
        <tr class="${i % 2 === 0 ? "row-even" : "row-odd"}">
          <td class="td-product">
            <span class="product-name">${esc(s.nombre || "—")}</span>
          </td>
          <td class="td-client">${esc(getCategoriaNombre(s.categoriaId) || "—")}</td>
          <td class="td-color"><span class="color-pill">${esc(getMedidaNombre(s.medidaId) || "—")}</span></td>
          <td class="td-qty"><span class="qty-badge">${esc(s.valorMedida ?? "—")}</span></td>
          <td class="td-qty"><span class="qty-badge">${esc(s.stock ?? 0)}</span></td>
          <td class="td-status">
            <span class="status-badge" style="background:${sc.bg};color:${sc.color};">
              <span class="status-dot" style="background:${sc.dot};"></span>
              ${esc(s.estado ? "Activo" : "Inactivo")}
            </span>
          </td>
        </tr>`;
      })
      .join("");

    const summaryCards = Object.entries(estadoSummary)
      .map(
        ([e, n]) => `
      <div class="sum-card">
        <span class="sum-count">${n}</span>
        <span class="sum-label">${esc(e)}</span>
      </div>`,
      )
      .join("");

    const filterInfo = [
      statusFilter !== "todos"
        ? `Estado: <strong>${esc(statusFilter)}</strong>`
        : "",
      searchTerm ? `Búsqueda: <strong>"${esc(searchTerm)}"</strong>` : "",
    ]
      .filter(Boolean)
      .join(" &nbsp;·&nbsp; ");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Insumos — ${fecha}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #2d1b4e; font-size: 11px; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; }

  .header {
    background: #ffffff;
    border-bottom: 3px solid #FF4FD6;
    padding: 24px 32px 22px;
    position: relative;
    overflow: hidden;
  }
  .header-top  { display:flex; justify-content:space-between; align-items:flex-start; }
  .brand       { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .brand-logo  { width:32px; height:auto; display:block; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15)); }
  .brand-name  { font-size:11px; font-weight:600; color:#9ca3af; letter-spacing:0.12em; text-transform:uppercase; }
  .doc-title   { font-size:22px; font-weight:700; color:#2d1b4e; letter-spacing:-0.02em; line-height:1.2; }
  .doc-subtitle{ font-size:12px; color:#6b7280; margin-top:4px; }

  .header-meta        { text-align:right; font-size:11px; color:#2d1b4e; line-height:2; }
  .header-meta strong { color:#2d1b4e; font-weight:700; font-size:12px; letter-spacing:0.02em; }

  .doc-id {
    display:inline-block; background:#ffffff; color:#FF4FD6;
    font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px;
    border:1px solid #FF4FD6; margin-top:6px; letter-spacing:0.06em;
  }

  .body { padding: 22px 32px 28px; }

  .filter-bar {
    background:#ffffff; border:1px solid #FF4FD6; border-radius:8px;
    padding:8px 14px; margin-bottom:18px; font-size:10px; color:#6b7280;
    display:flex; align-items:center; gap:6px; flex-wrap:wrap;
  }
  .filter-bar strong { color:#2d1b4e; }

  .summary    { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
  .sum-card   {
    flex:1; min-width:90px; background:#ffffff; border:1px solid #FF4FD6;
    border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:2px;
  }
  .sum-count  { font-size:20px; font-weight:800; line-height:1; color:#FF4FD6; }
  .sum-label  { font-size:9.5px; color:#9ca3af; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; }

  .totals-row { display:flex; gap:12px; margin-bottom:22px; }
  .total-card { flex:1; border-radius:10px; padding:14px 18px; background:#ffffff; border:1.5px solid #FF4FD6; }
  .total-val   { font-size:26px; font-weight:800; line-height:1; letter-spacing:-0.03em; color:#FF4FD6; }
  .total-label { font-size:10px; color:#6b7280; margin-top:3px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; }

  .section-title {
    font-size:10px; font-weight:700; color:#9ca3af;
    text-transform:uppercase; letter-spacing:0.1em;
    margin-bottom:10px; display:flex; align-items:center; gap:7px;
  }
  .section-title::after { content:''; flex:1; height:1px; background:#FF4FD6; }

  table           { width:100%; border-collapse:collapse; font-size:10.5px; }
  thead tr        { background:#ffffff; border-bottom:2px solid #FF4FD6; }
  thead th        { padding:9px 10px; text-align:left; color:#FF4FD6; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; }
  .row-even, .row-odd { background:#ffffff; }
  tbody tr        { border-bottom:1px solid #fbcfe8; }
  td              { padding:9px 10px; vertical-align:middle; }

  .td-order .order-num    { font-size:12px; font-weight:800; color:#FF4FD6; letter-spacing:-0.02em; }
  .td-product .product-name { display:block; font-weight:600; color:#2d1b4e; font-size:10.5px; }
  .td-client      { color:#374151; font-weight:500; }
  .td-qty         { text-align:right; white-space:nowrap; }
  .qty-badge      { font-size:12px; font-weight:800; color:#2d1b4e; }
  .td-color .color-pill { background:#ffffff; border-radius:4px; padding:2px 7px; font-size:9.5px; color:#000000; font-weight:500; }

  .status-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 8px; border-radius:20px; font-size:9.5px; font-weight:700; white-space:nowrap;
  }
  .status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  .divider { border:none; border-top:2px dashed #FF4FD6; margin:22px 0; }

  .footer { background:#ffffff; border-top:2px solid #FF4FD6; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#6b7280; margin-top:auto; }
  .footer strong { color:#2d1b4e; }
  .footer-sig    { text-align:right; line-height:1.6; }
  .footer-brand  { display:flex; align-items:center; gap:8px; }
  .footer-logo   { width:18px; height:auto; display:block; }

  @media print {
    body { background:#fff; }
    .page { width:100%; margin:0; }
    .no-print { display:none !important; }
    thead { display:table-header-group; }
    tr, .reparto-card { page-break-inside:avoid; }
  }
  .print-bar { display:flex; justify-content:flex-end; padding:12px 32px 0; gap:10px; }
  .btn-print { background:#FF4FD6; color:#fff; border:none; border-radius:8px; padding:9px 20px; font-size:12px; font-weight:700; cursor:pointer; }
  .btn-close { background:#ffffff; color:#2d1b4e; border:none; border-radius:8px; padding:9px 16px; font-size:12px; font-weight:600; cursor:pointer; }
</style>
</head>
<body>
<div class="print-bar no-print">
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
  <button class="btn-print" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
</div>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand">
          <img src="${putongasLogoUrl}" class="brand-logo" alt="Putongas" />
          <span class="brand-name">UniStock · Inventario</span>
        </div>
        <div class="doc-title">Reporte de Insumos</div>
        <div class="doc-subtitle">Informe administrativo de insumos</div>
      </div>
      <div class="header-meta">
        <div><strong>Fecha:</strong> ${fecha}</div>
        <div><strong>Hora:</strong> ${hora}</div>
        <div><strong>Total insumos:</strong> ${filteredSupplies.length}</div>
        <div><span class="doc-id">INS-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}</span></div>
      </div>
    </div>
  </div>

  <div class="body">
    ${filterInfo ? `<div class="filter-bar"><strong>Filtros aplicados:</strong> ${filterInfo}</div>` : ''}

    <div class="totals-row">
      <div class="total-card tc-a">
        <div class="total-val">${filteredSupplies.length}</div>
        <div class="total-label">Insumos totales</div>
      </div>
      <div class="total-card tc-b">
        <div class="total-val">${totalStock}</div>
        <div class="total-label">Stock acumulado</div>
      </div>
    </div>

    <div class="section-title">Desglose por estado</div>
    <div class="summary">${summaryCards}</div>

    <div class="section-title" style="margin-top:4px;">Detalle de insumos</div>
    <table>
      <thead>
        <tr>
          <th style="width:220px">Nombre</th>
          <th>Categoría</th>
          <th style="width:90px">Medida</th>
          <th style="text-align:right;width:80px">Valor medida</th>
          <th style="text-align:right;width:64px">Stock</th>
          <th style="width:110px">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:#9ca3af;">Sin insumos para mostrar</td></tr>'}
      </tbody>
    </table>

    <hr class="divider"/>

  </div>

  <div class="footer">
    <div class="footer-brand">
      <img src="${putongasLogoUrl}" class="footer-logo" alt="Putongas" />
      <div>
        <strong>UniStock · Sistema de Gestión</strong><br/>
        Documento generado automáticamente · ${fecha} ${hora}
      </div>
    </div>
    <div class="footer-sig">
      <strong>Firma responsable:</strong><br/>
      ___________________________<br/>
      Cargo: ____________________
    </div>
  </div>
</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      showAlert(
        "error",
        "Error",
        "No se pudo abrir la ventana de impresión. Verifica el bloqueador de pop-ups.",
      );
    }
  };

  // ── Paginación visual ──────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 7)
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <SearchInput
            value={searchTerm}
            onChange={handleSearchWithState}
            placeholder="Buscar"
            width="400px"
            maxWidth="400px"
          />
          <span
            style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}
          >
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

      {/* MODAL DESCARGA — mismo diseño que Compras */}
      {showDownloadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1200,
            padding: "0 16px",
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: 24,
              background: "#fff",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              width: "calc(100vw - 32px)",
              maxWidth: 360,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#FF4FD6",
                  }}
                >
                  Descargar insumos
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#888" }}>
                  Elige el formato de exportación
                </p>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Excel */}
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  handleDownloadExcel();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "1.5px solid #e5e7eb",
                  background: "#fafafa",
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff4fd6";
                  e.currentTarget.style.background = "#fff0fb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.background = "#fafafa";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: "#ffffff",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff4fd6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#FF4FD6",
                    }}
                  >
                    Excel (.xlsx)
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 11,
                      color: "#6b7280",
                    }}
                  >
                    Tabla estilada con colores de la empresa y logo
                  </p>
                </div>
              </button>

              {/* PDF */}
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  handleDownloadPDF();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "1.5px solid #e5e7eb",
                  background: "#fafafa",
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff4fd6";
                  e.currentTarget.style.background = "#fff0fb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.background = "#fafafa";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: "#ffffff",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF4FD6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#FF4FD6",
                    }}
                  >
                    PDF
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 11,
                      color: "#6b7280",
                    }}
                  >
                    Documento listo para imprimir o compartir, con logo
                  </p>
                </div>
              </button>
            </div>

            <p
              style={{
                margin: "14px 0 0",
                fontSize: 11,
                color: "#d1d5db",
                textAlign: "center",
              }}
            >
              {filteredSupplies.length} insumo
              {filteredSupplies.length !== 1 ? "s" : ""} se exportará
              {filteredSupplies.length !== 1 ? "n" : ""}
            </p>
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
