import React, { useState } from "react";
import * as XLSX from "xlsx-js-style";
import putongasLogoUrl from "../../shared/assets/putongasLogo.png";
import { useShoppings } from "../hooks/useShoppings";
import { shoppingAPI } from "../services/shoppingAPI";
import ShoppingTable from "../components/ShoppingTable";
import SearchInput from "../../shared/components/SearchInput";
import AddShoppingButton from "../components/AddShoppingButton";
import ShoppingForm from "../components/ShoppingForm";
import ShoppingDetail from "../components/ShoppingDetail";
import Alert from "../../shared/components/Alert";
import TableSkeleton from "../../shared/components/TableSkeleton";
import { useSuppliers } from "../../suppliers/hooks/mockSuppliers";
import { useSedeScope, isVisibleBySede } from "../../shared/hooks/useSedeScope";

const ShoppingsPage = () => {
  const { suppliers } = useSuppliers();

  // ✅ FIX: sin parseInt — proveedorId vendrá como string desde MongoDB
  const getProveedorNombre = (proveedorId) =>
    suppliers.find((s) => String(s.id) === String(proveedorId))
      ?.nombreEmpresa ?? "—";

  const { shoppings, loading, createShopping, anularShopping } = useShoppings();
  const { isGerente, sedeId: miSedeId } = useSedeScope();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShopping, setSelectedShopping] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  // ── Modal de descarga (elegir Excel o PDF) ────────────────────────────────
  // Igual patrón que ProductionPage: un booleano controla si el modal se ve.
  const [downloadModal, setDownloadModal] = useState(false);

  // ── Modal anulación con motivo ────────────────────────────────────────────
  const [cancelModal, setCancelModal] = useState({
    open: false,
    id: null,
    motivo: "",
  });
  const [motivoError, setMotivoError] = useState("");

  const openCancelModal = (id) => {
    setCancelModal({ open: true, id, motivo: "" });
    setMotivoError("");
  };
  const closeCancelModal = () => {
    setCancelModal({ open: false, id: null, motivo: "" });
    setMotivoError("");
  };

  // ── Alert global ─────────────────────────────────────────────────────────
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });
  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showAlert = (type, title, message, onConfirm = null) =>
    setAlertConfig({ open: true, type, title, message, onConfirm });

  if (loading && shoppings.length === 0) {
    return (
      <TableSkeleton
        title="Compras"
        toolbarLeftButtons={[{ width: 90 }]}
        toolbarButtons={[{ width: 110, primary: true }]}
      />
    );
  }

  // ── Filtrado y paginación ─────────────────────────────────────────────────
  const filteredShoppings = shoppings.filter((p) => {
    const text = searchTerm.toLowerCase().trim();

    // Atajos de texto: escribir "activo" o "anulado" filtra por estado
    if (text === "activo") return !p.anulada;
    if (text === "anulado") return p.anulada;

    const coincideBusqueda =
      p.id?.toString().includes(searchTerm) ||
      p.numeroFactura?.toLowerCase().includes(text) ||
      p.proveedor?.toLowerCase().includes(text) ||
      p.observaciones?.toLowerCase().includes(text) ||
      p.motivoAnulacion?.toLowerCase().includes(text) ||
      p.costoTotal?.toString().includes(searchTerm) ||
      p.fecha?.includes(searchTerm);

    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && !p.anulada) ||
      (estadoFiltro === "inactivos" && p.anulada);

    // 🔒 Alcance de sede: Gerente ve todas las compras;
    // cualquier otro rol ve las compras de su sede y los registros sin sede.
    const coincideSede = isVisibleBySede(p, isGerente, miSedeId);

    return coincideBusqueda && coincideEstado && coincideSede;
  });

  const itemsPerPage = 7;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredShoppings.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShoppings = filteredShoppings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleView = async (shopping) => {
    try {
      const response = await shoppingAPI.getById(shopping.id);
      const full = response?.data ?? response;
      const normalizado = {
        ...full,
        id: full._id ?? full.id,
        costoTotal: full.total ?? full.costoTotal,
        detalles: (full.detalles || []).map((d) => ({
          ...d,
          id: d._id ?? d.id,
          costoUnitario: d.precioUnitario ?? 0,
          costo: d.subtotal ?? 0,
        })),
      };
      setSelectedShopping(normalizado);
    } catch {
      setSelectedShopping(shopping);
    }
  };

  const handleAnular = (id) => {
    const shopping = shoppings.find((p) => p.id === id);
    if (shopping?.anulada) {
      showAlert(
        "error",
        "Compra ya anulada",
        `La factura "${shopping?.numeroFactura || id}" ya fue anulada anteriormente.`,
      );
      return;
    }
    openCancelModal(id);
  };

  const confirmAnular = async () => {
    if (!cancelModal.motivo.trim()) {
      setMotivoError("El motivo de anulación es obligatorio");
      return;
    }
    const shopping = shoppings.find((p) => p.id === cancelModal.id);
    try {
      await anularShopping(cancelModal.id, cancelModal.motivo.trim());
      closeCancelModal();
      showAlert(
        "success",
        "Compra anulada",
        `La factura "${shopping?.numeroFactura || cancelModal.id}" fue anulada correctamente.`,
      );
    } catch {
      closeCancelModal();
      showAlert(
        "error",
        "Error",
        "No se pudo anular la compra. Intenta nuevamente.",
      );
    }
  };

  const handleCreateSubmit = async (shoppingData) => {
    try {
      await createShopping(shoppingData);
      setShowCreateForm(false);
      showAlert(
        "success",
        "Compra registrada",
        `Factura "${shoppingData.numeroFactura}" creada correctamente.`,
      );
    } catch (error) {
      showAlert(
        "error",
        "Error al crear",
        error.message || "No se pudo registrar la compra.",
      );
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadModal(false);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "UniStock";
      wb.created = new Date();

      const ws = wb.addWorksheet("Compras", {
        pageSetup: { orientation: "landscape", fitToPage: true },
      });

      const now = new Date();
      const fecha = now.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      ws.columns = [
        { key: "id", width: 10 },
        { key: "factura", width: 16 },
        { key: "proveedor", width: 30 },
        { key: "fecha", width: 16 },
        { key: "obs", width: 32 },
        { key: "total", width: 16 },
        { key: "estado", width: 12 },
        { key: "motivo", width: 28 },
      ];

      const ARGB = (hex) => "FF" + hex.replace("#", "").toUpperCase();
      const fillSolid = (hex) => ({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: ARGB(hex) },
      });
      const thinBorder = (hex = "#ffffff") => {
        const c = { style: "thin", color: { argb: ARGB(hex) } };
        return { top: c, bottom: c, left: c, right: c };
      };

      /* ── Logo (filas 1-2, columna A) ── */
      const logoRes = await fetch(putongasLogoUrl);
      const logoBlob = await logoRes.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(logoBlob);
      });
      const logoId = wb.addImage({ base64: logoBase64, extension: "png" });
      ws.addImage(logoId, {
        tl: { col: 0.15, row: 0.15 },
        ext: { width: 46, height: 60 },
      });

      /* ── Fila 1: título ── */
      ws.mergeCells("B1:H1");
      ws.getRow(1).height = 30;
      const titleCell = ws.getCell("B1");
      titleCell.value = "Reporte de Compras — Sistema de Gestión UniStock";
      titleCell.font = {
        name: "Arial",
        size: 15,
        bold: true,
        color: { argb: "00000000" },
      };
      titleCell.alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1"].forEach((r) => {
        ws.getCell(r).fill = fillSolid("#FDF6FF");
      });

      /* ── Fila 2: subtítulo ── */
      ws.mergeCells("B2:H2");
      ws.getRow(2).height = 18;
      const subCell = ws.getCell("B2");
      subCell.value = `Generado el ${fecha}  ·  ${filteredShoppings.length} compra${filteredShoppings.length !== 1 ? "s" : ""}`;
      subCell.font = { name: "Arial", size: 10, color: { argb: "00000000" } };
      subCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      ["A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2"].forEach((r) => {
        ws.getCell(r).fill = fillSolid("#FDF6FF");
      });

      /* ── Fila 3: separadora ── */
      ws.getRow(3).height = 6;
      ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3"].forEach((r) => {
        ws.getCell(r).fill = fillSolid("#ffffff");
      });

      /* ── Fila 4: encabezados ── */
      const headerRow = ws.getRow(4);
      headerRow.height = 26;
      [
        "#",
        "N° Factura",
        "Proveedor",
        "Fecha",
        "Observaciones",
        "Costo Total",
        "Estado",
        "Motivo anulación",
      ].forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        cell.fill = fillSolid("#FF4FD6");
        cell.alignment = {
          horizontal: i === 5 ? "right" : "left",
          vertical: "middle",
          indent: i === 5 ? 0 : 1,
        };
        cell.border = {
          bottom: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
        };
      });

      /* ── Filas de datos ── */
      filteredShoppings.forEach((p, i) => {
        const row = ws.getRow(5 + i);
        row.height = 20;
        const even = i % 2 === 0;
        const bg = fillSolid(even ? "#FFFFFF" : "#FDF6FF");

        const values = [
          `#${p.consecutivo ?? p.id ?? ""}`,
          p.numeroFactura || "—",
          getProveedorNombre(p.proveedorId) || p.proveedor || "—",
          p.fecha || "—",
          p.observaciones || "—",
          Number(p.costoTotal ?? 0),
          p.anulada ? "Anulada" : "Activa",
          p.motivoAnulacion || "—",
        ];

        values.forEach((v, ci) => {
          const cell = row.getCell(ci + 1);
          cell.value = v;
          cell.fill = bg;
          cell.border = thinBorder();
          cell.alignment = {
            horizontal: ci === 5 ? "right" : "left",
            vertical: "middle",
            indent: ci === 5 ? 0 : 1,
          };
          cell.font = { name: "Arial", size: 10, color: { argb: "FF374151" } };
        });

        /* # compra: magenta bold */
        row.getCell(1).font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: ARGB("#FF4FD6") },
        };
        /* Costo total: morado bold */
        row.getCell(6).font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: ARGB("#a858d6") },
        };
        row.getCell(6).numFmt = '"$"#,##0.00';
        /* Estado: color según valor */
        const estadoCell = row.getCell(7);
        if (p.anulada) {
          estadoCell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: ARGB("#991b1b") },
          };
          estadoCell.fill = fillSolid("#fee2e2");
        } else {
          estadoCell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: ARGB("#166534") },
          };
          estadoCell.fill = fillSolid("#dcfce7");
        }
      });

      /* ── Fila de totales ── */
      const totalRowIdx = filteredShoppings.length + 6;
      const totalGeneral = filteredShoppings.reduce(
        (s, p) => s + (Number(p.costoTotal) || 0),
        0,
      );
      const totalRow = ws.getRow(totalRowIdx);

      const labelCell = totalRow.getCell(2);
      labelCell.value = "Total general";
      labelCell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: ARGB("#363636") },
      };
      labelCell.fill = fillSolid("#ffffff");
      labelCell.alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
      labelCell.border = {
        top: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
      };

      const valueCell = totalRow.getCell(6);
      valueCell.value = totalGeneral;
      valueCell.numFmt = '"$"#,##0.00';
      valueCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: ARGB("#a858d6") },
      };
      valueCell.fill = fillSolid("#ffffff");
      valueCell.alignment = { horizontal: "right", vertical: "middle" };
      valueCell.border = {
        top: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
      };

      [1, 3, 4, 5, 7, 8].forEach((col) => {
        const c = totalRow.getCell(col);
        c.fill = fillSolid("#FDF6FF");
        c.border = {
          top: { style: "medium", color: { argb: ARGB("#FF4FD6") } },
        };
      });

      /* ── Descargar ── */
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compras_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      showAlert("success", "¡Éxito!", "Archivo exportado correctamente.");
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      showAlert("error", "Error", "No se pudo exportar el archivo.");
    }
  };

  // ── Exportar a PDF ─────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    setDownloadModal(false);

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
    const docId = `CP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    const esc = (v) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const totalGeneral = filteredShoppings.reduce(
      (s, p) => s + (Number(p.costoTotal) || 0),
      0,
    );
    const totalAnuladas = filteredShoppings.filter((p) => p.anulada).length;
    const totalActivas = filteredShoppings.length - totalAnuladas;

    const estadoColor = (anulada) =>
      anulada
        ? { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" }
        : { bg: "#dcfce7", color: "#166534", dot: "#22c55e" };

    const tableRows = filteredShoppings
      .map((p, i) => {
        const ec = estadoColor(p.anulada);
        return `
        <tr class="${i % 2 === 0 ? "row-even" : "row-odd"}">
          <td class="td-order"><span class="order-num">#${esc(p.consecutivo ?? p.id)}</span></td>
          <td>${esc(p.numeroFactura || "—")}</td>
          <td><span style="font-weight:600;color:#2d1b4e;">${esc(getProveedorNombre(p.proveedorId) || p.proveedor || "—")}</span></td>
          <td style="color:#6b7280;">${esc(p.fecha || "—")}</td>
          <td style="color:#6b7280;">${esc(p.observaciones || "—")}</td>
          <td style="text-align:right;font-weight:700;">$${Number(p.costoTotal || 0).toLocaleString("es-CO")}</td>
          <td style="text-align:right;">
            <span class="status-badge" style="background:${ec.bg};color:${ec.color};">
              <span class="status-dot" style="background:${ec.dot};"></span>
              ${p.anulada ? "Anulada" : "Activa"}
            </span>
          </td>
        </tr>`;
      })
      .join("");

    const detailCards = filteredShoppings
      .map((p) => {
        const ec = estadoColor(p.anulada);
        return `
        <div class="reparto-card">
          <div class="reparto-card-header">
            <div>
              <div class="reparto-order">#${esc(p.consecutivo ?? p.id)}</div>
              <div style="font-size:10px;color:#2d1b4e;font-weight:600;margin-top:2px;">Factura ${esc(p.numeroFactura || "—")}</div>
            </div>
            <span class="reparto-status-badge" style="background:${ec.bg};color:${ec.color};">
              <span class="status-dot" style="background:${ec.dot};"></span>
              ${p.anulada ? "Anulada" : "Activa"}
            </span>
          </div>
          <div class="reparto-field"><span class="reparto-key">Proveedor</span><span class="reparto-val">${esc(getProveedorNombre(p.proveedorId) || p.proveedor || "—")}</span></div>
          <div class="reparto-field"><span class="reparto-key">Fecha factura</span><span class="reparto-val">${esc(p.fecha || "—")}</span></div>
          <div class="reparto-field"><span class="reparto-key">Observaciones</span><span class="reparto-val">${esc(p.observaciones || "—")}</span></div>
          ${p.anulada ? `<div class="reparto-field"><span class="reparto-key">Motivo</span><span class="reparto-val">${esc(p.motivoAnulacion || "—")}</span></div>` : ""}
          <div class="reparto-field" style="margin-top:6px;">
            <span class="reparto-key">Costo total</span>
            <span class="reparto-qty-big">$${Number(p.costoTotal || 0).toLocaleString("es-CO")}</span>
          </div>
        </div>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Compras — ${fecha}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#2d1b4e; font-size:11px; }
  .page { width:210mm; min-height:297mm; margin:0 auto; }

  .header { background:#ffffff; border-bottom:3px solid #FF4FD6; padding:24px 32px 22px; position:relative; overflow:hidden; }
  .header::before, .header::after { display:none; }
  .header-top  { display:flex; justify-content:space-between; align-items:flex-start; }
  .brand       { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .brand-logo  { width:32px; height:auto; display:block; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15)); }
  .brand-name  { font-size:11px; font-weight:600; color:#9ca3af; letter-spacing:0.12em; text-transform:uppercase; }
  .doc-title   { font-size:22px; font-weight:700; color:#2d1b4e; letter-spacing:-0.02em; line-height:1.2; }
  .doc-subtitle{ font-size:12px; color:#6b7280; margin-top:4px; }
  .header-meta        { text-align:right; font-size:11px; color:#2d1b4e; line-height:2; }
  .header-meta strong { color:#2d1b4e; font-weight:700; font-size:12px; letter-spacing:0.02em; }
  .doc-id { display:inline-block; background:#ffffff; color:#FF4FD6; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; border:1px solid #FF4FD6; margin-top:6px; letter-spacing:0.06em; }

  .body { padding:22px 32px 28px; }

  .totals-row { display:flex; gap:12px; margin-bottom:22px; }
  .total-card { flex:1; border-radius:10px; padding:14px 18px; background:#ffffff; border:1.5px solid #FF4FD6; }
  .tc-a { background:#ffffff; }
  .tc-b { background:#ffffff; }
  .tc-c { background:#ffffff; }
  .tc-d { background:#ffffff; }
  .total-val   { font-size:22px; font-weight:800; line-height:1; letter-spacing:-0.03em; color:#FF4FD6; }
  .total-label { font-size:10px; color:#636264; margin-top:3px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600; }

  .section-title { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; display:flex; align-items:center; gap:7px; }
  .section-title::after { content:''; flex:1; height:1px; background:#FF4FD6; }

  table      { width:100%; border-collapse:collapse; font-size:10.5px; }
  thead tr   { background:#ffffff; border-bottom:2px solid #FF4FD6; }
  thead th   { padding:9px 10px; text-align:left; color:#FF4FD6; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; }
  thead th:first-child { border-radius:6px 0 0 0; }
  thead th:last-child  { border-radius:0 6px 0 0; }
  .row-even  { background:#ffffff; }
  .row-odd   { background:#fdf6ff; }
  tbody tr   { border-bottom:1px solid #f6f6f8; }
  td         { padding:9px 10px; vertical-align:middle; }
  .td-order .order-num { font-size:12px; font-weight:800; color:#FF4FD6; }

  .status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:20px; font-size:9.5px; font-weight:700; white-space:nowrap; }
  .status-dot   { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  .divider { border:none; border-top:2px dashed #FF4FD6; margin:22px 0; }

  .reparto-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .reparto-card  { border:1.5px solid #FF4FD6; border-radius:8px; padding:12px 14px; background:#ffffff; page-break-inside:avoid; }
  .reparto-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #FF4FD6; }
  .reparto-order        { font-size:14px; font-weight:800; color:#FF4FD6; }
  .reparto-status-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:20px; font-size:8.5px; font-weight:700; }
  .reparto-field { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px; font-size:10px; }
  .reparto-key   { color:#9ca3af; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  .reparto-val   { color:#2d1b4e; font-weight:600; text-align:right; max-width:60%; word-break:break-word; }
  .reparto-qty-big { font-size:16px; font-weight:900; color:#FF4FD6; }

  .footer { background:#ffffff; border-top:2px solid #e8d5f5; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#9ca3af; margin-top:auto; }
  .footer strong { color:#2d1b4e; }
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
          <img class="brand-logo" src="${putongasLogoUrl}" alt="Unistock"/>
          <span class="brand-name">Unistock · Módulo de Compras</span>
        </div>
        <div class="doc-title">Reporte de Compras</div>
        <div class="doc-subtitle">Informe administrativo de adquisiciones</div>
      </div>
      <div class="header-meta">
        <div><strong>Fecha:</strong> ${fecha}</div>
        <div><strong>Hora:</strong> ${hora}</div>
        <div><strong>Total compras:</strong> ${filteredShoppings.length}</div>
        <div><span class="doc-id">${docId}</span></div>
      </div>
    </div>
  </div>

  <div class="body">
    <div class="totals-row">
      <div class="total-card tc-a">
        <div class="total-val">${filteredShoppings.length}</div>
        <div class="total-label">Total compras</div>
      </div>
      <div class="total-card tc-b">
        <div class="total-val">$${totalGeneral.toLocaleString("es-CO")}</div>
        <div class="total-label">Monto total</div>
      </div>
      <div class="total-card tc-c">
        <div class="total-val">${totalActivas}</div>
        <div class="total-label">Activas</div>
      </div>
      <div class="total-card tc-d">
        <div class="total-val">${totalAnuladas}</div>
        <div class="total-label">Anuladas</div>
      </div>
    </div>

    <div class="section-title">Detalle de compras</div>
    <table>
      <thead>
        <tr>
          <th style="width:52px">Orden</th>
          <th style="width:80px">Factura</th>
          <th>Proveedor</th>
          <th style="width:80px">Fecha</th>
          <th>Observaciones</th>
          <th style="text-align:right;width:90px">Costo total</th>
          <th style="text-align:right;width:70px">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="7" style="text-align:center;padding:24px;color:#9ca3af;">Sin compras para mostrar</td></tr>'}
      </tbody>
    </table>

    <hr class="divider"/>

    <div class="section-title">Tarjetas de compra</div>
    <div class="reparto-grid">
      ${detailCards}
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">
      <img class="footer-logo" src="${putongasLogoUrl}" alt="Unistock"/>
      <div>
        <strong>Unistock · Sistema de Gestión de Inventario</strong><br/>
        Documento generado automáticamente · ${fecha} ${hora}
      </div>
    </div>
    <div style="text-align:right;">
      <strong>Firma responsable:</strong><br/>
      ___________________________<br/>
      Cargo: ____________________
    </div>
  </div>
</div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) {
      win.document.write(html);
      win.document.close();
    } else
      showAlert(
        "error",
        "Bloqueado",
        "El navegador bloqueó la ventana emergente. Permite pop-ups para exportar a PDF.",
      );
  };

  // ── Paginación visual ─────────────────────────────────────────────────────
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
      className="sh-page"
      style={{ display: "flex", flexDirection: "column", padding: "24px 32px 0px 32px" }}
    >
      <style>{`
        @keyframes shFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        .sh-download-modal { border-radius:16px; padding:24px; background:#fff; box-shadow:0 12px 40px rgba(0,0,0,0.18); width:calc(100vw - 32px); max-width:360px; animation:shFadeIn 0.18s ease; }
        .sh-download-opt-btn { width:100%; display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:10px; cursor:pointer; border:1.5px solid #e5e7eb; background:#fafafa; text-align:left; transition:border-color 0.15s,background 0.15s; }
        .sh-download-opt-btn:hover { border-color:#FF4FD6; background:#fff0fb; }
        .sh-download-opt-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:#ffffff; }

        @media (max-width: 640px) {
          .sh-page { padding: 16px 16px 0px 16px !important; }
          .sh-header { flex-direction: column !important; align-items: stretch !important; }
          .sh-search { align-items: stretch !important; }
          .sh-search > div { max-width: 100% !important; width: 100% !important; }
          .sh-search > span { text-align: center !important; white-space: normal !important; }
          .sh-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .sh-toolbar-left { justify-content: center !important; }
          .sh-toolbar-right { display: flex !important; justify-content: center !important; }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="sh-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            margin: 0,
            color: "#1a1a1a",
          }}
        >
          Compras
        </h1>
        <div
          className="sh-search"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar"
            width="400px"
            maxWidth="400px"
          />
          <span
            style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}
          >
            Escribe <strong>activo</strong> para ver compras activas ·{" "}
            <strong>anulado</strong> para ver compras anuladas
          </span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div
        className="sh-toolbar"
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
        <div className="sh-toolbar-left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setDownloadModal(true)}
            title="Exportar compras"
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
        </div>

        {/* DERECHA */}
        <div className="sh-toolbar-right">
          <AddShoppingButton onClick={() => setShowCreateForm(true)} />
        </div>
      </div>
      

      {/* TABLA */}
      <ShoppingTable
        shoppings={paginatedShoppings}
        getProveedorNombre={getProveedorNombre}
        onView={handleView}
        onAnular={handleAnular}
      />

      {/* MODAL CREAR */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <ShoppingForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
            existingFacturas={shoppings
              .filter((p) => p.numeroFactura)
              .map((p) => ({
                numeroFactura: String(p.numeroFactura).trim(),
                proveedorId: String(p.proveedorId ?? ''),
              }))} />
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedShopping && (
        <ShoppingDetail
          shopping={selectedShopping}
          getProveedorNombre={getProveedorNombre}
          onClose={() => setSelectedShopping(null)}
        />
      )}

      {/* PAGINACIÓN */}
      {filteredShoppings.length > 0 && (
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

      {/* MODAL ANULACIÓN CON MOTIVO */}
      {cancelModal.open &&
        (() => {
          const shopping = shoppings.find((p) => p.id === cancelModal.id);
          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
                padding: "16px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  width: "100%",
                  maxWidth: "420px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  padding: "24px",
                }}
              >
                {/* Header */}
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
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#111",
                    }}
                  >
                    Anular compra
                  </h3>
                  <button
                    onClick={closeCancelModal}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#aaa",
                      fontSize: "20px",
                      lineHeight: 1,
                      padding: "2px 6px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                  >
                    ×
                  </button>
                </div>

                {/* Info */}
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  Estás por anular la factura{" "}
                  <strong style={{ color: "#111" }}>
                    "{shopping?.numeroFactura || cancelModal.id}"
                  </strong>
                  . Esta acción no se puede deshacer.
                </p>

                {/* Motivo */}
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#555",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Motivo de anulación *
                </label>
                <textarea
                  value={cancelModal.motivo}
                  onChange={(e) => {
                    setCancelModal((p) => ({ ...p, motivo: e.target.value }));
                    setMotivoError("");
                  }}
                  placeholder="Describe el motivo..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontSize: "13px",
                    outline: "none",
                    border: motivoError
                      ? "2px solid #ef4444"
                      : "1.5px solid #d1d5db",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    if (!motivoError) e.target.style.borderColor = "#FF4FD6";
                  }}
                  onBlur={(e) => {
                    if (!motivoError) e.target.style.borderColor = "#d1d5db";
                  }}
                />
                {motivoError && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "11px",
                      color: "#ef4444",
                    }}
                  >
                    {motivoError}
                  </p>
                )}

                {/* Botones */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={closeCancelModal}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: "#555",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmAnular}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#dc2626")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#ef4444")
                    }
                  >
                    Confirmar anulación
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* MODAL DESCARGA — mismo diseño que ProductionPage */}
      {downloadModal && (
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
                  Descargar compras
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#888" }}>
                  Elige el formato de exportación
                </p>
              </div>
              <button
                onClick={() => setDownloadModal(false)}
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
                onClick={handleDownloadExcel}
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
                onClick={handleDownloadPDF}
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
              {filteredShoppings.length} compra
              {filteredShoppings.length !== 1 ? "s" : ""} se exportará
              {filteredShoppings.length !== 1 ? "n" : ""}
            </p>
          </div>
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

export default ShoppingsPage;