/**
 * @file DamagedProductsModal/index.jsx
 * @description Modal que se activa cuando una orden de producción es anulada
 *   durante los pasos de "Corte" o "Producción".
 *
 * FLUJO:
 *   1. La orden se anula mientras está en paso Corte o Producción.
 *   2. Este modal aparece automáticamente con los artículos (details) de la orden.
 *   3. El usuario selecciona cuáles artículos resultaron dañados.
 *   4. Puede elegir entre dos acciones:
 *      a) "Crear ficha técnica" → navega a la ruta de creación de ficha técnica
 *         pasando los artículos dañados como estado de navegación.
 *      b) "Nueva orden de producción" → abre el formulario de nueva orden
 *         pre-llenado con los artículos dañados seleccionados.
 *
 * PROPS:
 *   isOpen         {boolean}   — controla visibilidad del modal
 *   production     {object}    — datos completos de la orden anulada
 *   onClose        {function}  — cierra el modal sin acción
 *   onNewOrder     {function(damagedDetails)} — callback para crear nueva orden
 *   onNewTechSheet {function(damagedDetails)} — callback para crear ficha técnica
 */
import React, { useState, useEffect } from "react";

// ── Íconos ────────────────────────────────────────────────────────────────────

const WarningIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5"  y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Devuelve un resumen del artículo para mostrar en la lista.
 * @param {object} detail — artículo de production.details
 * @returns {string}
 */
const detailLabel = (detail) => {
  const parts = [];
  if (detail.ref)      parts.push(`Ref: ${detail.ref}`);
  if (detail.color)    parts.push(detail.color);
  if (detail.quantity) parts.push(`${detail.quantity} uds`);
  if (detail.refCorte) parts.push(`(Corte: ${detail.refCorte})`);
  return parts.join(" · ");
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const DamagedProductsModal = ({
  isOpen,
  production,
  onClose,
  onIgnore,
  onNewOrder,
  onNewTechSheet,
  // 🆕 "Solo crear ficha técnica": crea la producción de reemplazo y la deja
  // en "Ficha Técnica", lista para pasar a corte, SIN abrir el editor.
  onNewTechSheetOnly,
}) => {
  // Cantidad dañada seleccionada por cada artículo
  const [selectedQuantities, setSelectedQuantities] = useState({});
  // Paso: "select" → seleccionar artículos | "confirm" → confirmar acción elegida
  const [step,        setStep]        = useState("select");
  const [chosenAction, setChosenAction] = useState(null); // "order" | "techsheet"

  const details = production?.details || [];

  // Reiniciar estado al abrir
  useEffect(() => {
    if (isOpen) {
      const initialQuantities = Object.fromEntries(
        details.map((detail, index) => [index, Number(detail.quantity) || 0])
      );
      setSelectedQuantities(initialQuantities);
      setStep("select");
      setChosenAction(null);
    }
  }, [isOpen, details]);

  if (!isOpen || !production) return null;

  const selectedCount   = Object.values(selectedQuantities).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  const damagedDetails  = details
    .map((detail, index) => ({ ...detail, quantity: Number(selectedQuantities[index] || 0), sourceIndex: index }))
    .filter((detail) => Number(detail.quantity) > 0);
  const hasSelection    = selectedCount > 0;
  const isTechSheetAction = chosenAction === "techsheet" || chosenAction === "techsheetOnly";

  // ── Handlers de selección ────────────────────────────────────────────────

  const updateQuantity = (index, nextValue) => {
    const maxQty = Number(details[index]?.quantity || 0);
    const normalized = Math.max(0, Math.min(Number(nextValue) || 0, maxQty));
    setSelectedQuantities(prev => ({ ...prev, [index]: normalized }));
  };

  const selectAll = () => {
    const initialQuantities = Object.fromEntries(
      details.map((detail, index) => [index, Number(detail.quantity) || 0])
    );
    setSelectedQuantities(initialQuantities);
  };

  const deselectAll = () => {
    const initialQuantities = Object.fromEntries(
      details.map((_, index) => [index, 0])
    );
    setSelectedQuantities(initialQuantities);
  };

  // ── Handlers de acción ───────────────────────────────────────────────────

  // Se utiliza el modal propio en lugar de `window.confirm()`.
  // para la acción "Nueva ficha técnica". Ahora TODAS las acciones pasan por
  // el paso de confirmación estilizado "confirm" del modal, que muestra un
  // resumen de lo que se hará y pide confirmación con los botones de la app.
  const handleNewOrder = () => {
    setChosenAction("order");
    setStep("confirm");
  };

  const handleNewTechSheet = () => {
    setChosenAction("techsheet");
    setStep("confirm");
  };

  const confirmAction = (action) => {
    if (action === "order") {
      onNewOrder(damagedDetails);
    } else if (action === "techsheet") {
      onNewTechSheet(damagedDetails);
    } else if (action === "techsheetOnly") {
      // Esta opción crea la producción de reemplazo y su ficha técnica.
      // y la deja en "Ficha Técnica" lista para pasar a corte, sin abrir el
      // editor (la ficha se hereda del producto original).
      if (typeof onNewTechSheetOnly === "function") onNewTechSheetOnly(damagedDetails);
      else onNewTechSheet(damagedDetails);
    }
    onClose();
  };

  const backToSelect = () => {
    setStep("select");
    setChosenAction(null);
  };

  const handleIgnore = () => {
    if (typeof onIgnore === "function") {
      onIgnore();
      return;
    }
    onClose();
  };

  // ── Colores del paso de anulación ────────────────────────────────────────
  const stepColors = {
    Corte:      { bg: "#ecfeff", text: "#0891b2", border: "#67e8f9" },
    Producción: { bg: "#fdf2f8", text: "#ec4899", border: "#f9a8d4" },
  };
  const stepColor = stepColors[production.status] || { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        fontFamily: "sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#f6f6f8", borderRadius: 20,
          width: "100%", maxWidth: 560,
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── PASO CONFIRMACIÓN (reemplaza el window.confirm nativo) ── */}
        {step === "confirm" && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            background: "#f6f6f8", borderRadius: 20,
            display: "flex", flexDirection: "column",
            overflow: "hidden", animation: "fadeIn 0.18s ease",
          }}>
            {/* Header */}
            <div style={{
              background: "#fff", borderBottom: "3px solid #FF4FD6",
              padding: "18px 22px", display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#fdf2f8", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(255,79,214,0.2)",
                }}>
                  {isTechSheetAction ? <FileIcon /> : <PlusIcon />}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
                    {isTechSheetAction ? "Crear ficha técnica de reemplazo" : "Nueva producción de reemplazo"}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
                    {chosenAction === "techsheetOnly"
                      ? "La producción quedará en Ficha Técnica, lista para continuar a corte."
                      : "Revisa el resumen antes de continuar."}
                  </p>
                </div>
              </div>
              <button
                onClick={backToSelect}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: "1px solid #e5e7eb", background: "#f9fafb",
                  color: "#555", cursor: "pointer", fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "16px 22px", flex: 1 }}>
              <div style={{
                padding: "12px 16px", borderRadius: 12, marginBottom: 14,
                background: "#fdf2f8", border: "1px solid #f9a8d4",
                fontSize: 12.5, color: "#6b21a8", lineHeight: 1.6,
              }}>
                {chosenAction === "techsheet" ? (
                  <>Se creará una <strong>nueva producción de reemplazo</strong> con los artículos dañados y se abrirá la <strong>ficha técnica</strong> para ajustarla según lo modificado/dañado.</>
                ) : chosenAction === "techsheetOnly" ? (
                  <>Se creará una <strong>nueva producción de reemplazo</strong> con los artículos dañados, en estado <strong>"Ficha Técnica"</strong> y lista para pasar a corte.</>
                ) : (
                  <>Se abrirá el <strong>formulario de nueva producción</strong> pre-llenado con los artículos dañados, para rehacer la misma referencia desde el inicio.</>
                )}
              </div>

              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Artículos dañados ({damagedDetails.length})
              </p>
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                {damagedDetails.map((detail, i) => (
                  <div key={i} style={{
                    padding: "10px 14px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                    borderBottom: i < damagedDetails.length - 1 ? "1px solid #f5f5f5" : "none",
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {detailLabel(detail)}
                    </span>
                    <span style={{
                      padding: "3px 9px", borderRadius: 8, flexShrink: 0,
                      fontSize: 11, fontWeight: 700,
                      background: "#fef3c7", color: "#d97706",
                    }}>
                      {Number(detail.quantity) || 0} uds
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 22px 20px", borderTop: "1px solid #f0f0f0",
              background: "#fff", flexShrink: 0,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {chosenAction === "order" ? (
                <button
                  onClick={() => confirmAction("order")}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12,
                    border: "none", background: "linear-gradient(135deg, #FF4FD6, #ff4fd6)",
                    color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    boxShadow: "0 4px 14px rgba(255,79,214,0.3)",
                  }}
                >
                  <CheckIcon />
                  Continuar a nueva producción
                </button>
              ) : (
                <>
                  {/* Crear producción y abrir la ficha para ajustarla */}
                  <button
                    onClick={() => confirmAction("techsheet")}
                    style={{
                      width: "100%", padding: "12px", borderRadius: 12,
                      border: "none", background: "linear-gradient(135deg, #FF4FD6, #ff4fd6)",
                      color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      boxShadow: "0 4px 14px rgba(255,79,214,0.3)",
                    }}
                  >
                    <CheckIcon />
                    Crear producción y abrir ficha
                  </button>
                  {/* 🆕 Solo crear la ficha: deja la producción en Ficha Técnica, lista para corte */}
                  <button
                    onClick={() => confirmAction("techsheetOnly")}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 12,
                      border: "1.5px solid #FF4FD6", background: "#fff",
                      color: "#FF4FD6", cursor: "pointer", fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}
                  >
                    <FileIcon />
                    Solo crear ficha técnica
                  </button>
                </>
              )}
              <button
                onClick={backToSelect}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  border: "1.5px solid #e5e7eb", background: "#f9fafb",
                  color: "#6b7280", cursor: "pointer", fontSize: 12, fontWeight: 700,
                }}
              >
                Volver a la selección
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="dmg-stats-grid" style={{
          background: "#fff",
          borderBottom: "3px solid #f59e0b",
          padding: "18px 22px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            {/* Ícono de advertencia */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "#fef3c7",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
            }}>
              <WarningIcon />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1f2937" }}>
                Orden anulada — ¿Hay productos dañados?
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
                La orden <strong style={{ color: "#374151" }}>#{production.orderNumber}</strong> fue anulada
                durante el paso{" "}
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "2px 8px", borderRadius: 10,
                  background: stepColor.bg, color: stepColor.text,
                  border: `1px solid ${stepColor.border}`,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {production.status}
                </span>
                . Selecciona los artículos dañados para gestionarlos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid #e5e7eb", background: "#f9fafb",
              color: "#555", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── BODY (con scroll) ── */}
        <div style={{ overflowY: "auto", padding: "16px 22px", flex: 1 }}>

          {/* Info de la orden */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: "10px 12px",
            marginBottom: 14, border: "1px solid #f0f0f0",
            className: "dmg-stats-grid",
          }}>
            {[
              ["Cliente",    production.client    || "—"],
              ["Referencia", production.referencia || "—"],
              ["Cantidad",   `${(details || []).reduce((s, d) => s + (Number(d.quantity) || 0), 0)} uds`],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: "#374151" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Selección de artículos */}
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0", marginBottom: 14 }}>

            {/* Encabezado con controles seleccionar todos */}
            <div style={{
              padding: "10px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid #f0f0f0", background: "#fafafa",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                Artículos de la orden
                {details.length > 0 && (
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 10,
                    background: selectedCount > 0 ? "#fef3c7" : "#f3f4f6",
                    color: selectedCount > 0 ? "#d97706" : "#9ca3af",
                  }}>
                    {selectedCount} uds seleccionadas
                  </span>
                )}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={selectAll}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#555", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                >
                  Todos
                </button>
                <button
                  onClick={deselectAll}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#555", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                >
                  Ninguno
                </button>
              </div>
            </div>

            {/* Lista de artículos */}
            {details.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Esta orden no tiene artículos registrados.</p>
              </div>
            ) : (
              <div>
                {details.map((detail, index) => {
                  const selectedQty = Number(selectedQuantities[index] || 0);
                  const maxQty = Number(detail.quantity || 0);
                  return (
                    <div
                      key={index}
                      style={{
                        padding: "10px 12px",
                        display: "flex", alignItems: "center", gap: 12,
                        borderBottom: index < details.length - 1 ? "1px solid #f5f5f5" : "none",
                        background: selectedQty > 0 ? "#fffbeb" : "#fff",
                        transition: "background 0.12s",
                      }}
                    >
                      {/* Info del artículo */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {detailLabel(detail)}
                        </p>
                        {detail.refCorte && (
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
                            Ref. Corte: {detail.refCorte}
                          </p>
                        )}
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#6b7280" }}>
                          Cantidad total: {maxQty} uds
                        </p>
                      </div>

                      {/* Selector de cantidad dañada */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateQuantity(index, selectedQty - 1); }}
                          disabled={selectedQty <= 0}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb",
                            background: selectedQty > 0 ? "#fff" : "#f9fafb",
                            color: selectedQty > 0 ? "#374151" : "#9ca3af",
                            cursor: selectedQty > 0 ? "pointer" : "not-allowed",
                            fontSize: 15, fontWeight: 700,
                          }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={maxQty}
                          value={selectedQty}
                          onChange={(e) => updateQuantity(index, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: 70, padding: "6px 8px", borderRadius: 8,
                            border: "1px solid #d1d5db", textAlign: "center",
                            fontSize: 12, fontWeight: 700, color: "#374151",
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateQuantity(index, selectedQty + 1); }}
                          disabled={selectedQty >= maxQty}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb",
                            background: selectedQty < maxQty ? "#fff" : "#f9fafb",
                            color: selectedQty < maxQty ? "#374151" : "#9ca3af",
                            cursor: selectedQty < maxQty ? "pointer" : "not-allowed",
                            fontSize: 15, fontWeight: 700,
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Badge de estado */}
                      <span style={{
                        padding: "3px 8px", borderRadius: 8,
                        fontSize: 10, fontWeight: 700,
                        background: selectedQty > 0 ? "#fef3c7" : "#f3f4f6",
                        color: selectedQty > 0 ? "#d97706" : "#9ca3af",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}>
                        {selectedQty > 0 ? `${selectedQty} uds` : "Sin seleccionar"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aviso cuando no hay selección */}
          {!hasSelection && details.length > 0 && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 14,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              fontSize: 12, color: "#16a34a", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>✓</span>
              <span>Sin artículos dañados — no se requiere ninguna acción adicional.</span>
            </div>
          )}

          {/* Aviso informativo cuando hay selección */}
          {hasSelection && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 14,
              background: "#fef3c7", border: "1px solid #fcd34d",
              fontSize: 12, color: "#92400e", lineHeight: 1.5,
            }}>
              <strong>Tienes {selectedCount} unidad{selectedCount !== 1 ? "es" : ""} dañada{selectedCount !== 1 ? "s" : ""} seleccionada{selectedCount !== 1 ? "s" : ""}.</strong>
              {" "}Puedes ajustar la cantidad por artículo y seguir con la nueva ruta elegida.
            </div>
          )}

        </div>

        {/* ── FOOTER: ACCIONES ── */}
        <div style={{
          padding: "14px 22px 20px",
          borderTop: "1px solid #f0f0f0",
          background: "#fff",
          flexShrink: 0,
        }}>

          {hasSelection ? (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                ¿Qué deseas hacer con los {selectedCount} artículos dañados?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {/* Crear ficha técnica */}
                  <button
                    onClick={handleNewTechSheet}
                    style={{
                      flex: 1, padding: "11px 16px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", background: "#fff",
                      color: "#374151", cursor: "pointer",
                      fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF4FD6"; e.currentTarget.style.color = "#FF4FD6"; e.currentTarget.style.background = "#fff0fb"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#fff"; }}
                  >
                    <FileIcon />
                    Nueva ficha técnica
                  </button>

                  {/* Nueva orden para reintentar desde corte */}
                  <button
                    onClick={handleNewOrder}
                    style={{
                      flex: 1, padding: "11px 16px", borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #FF4FD6, #ff4fd6)",
                      color: "#fff", cursor: "pointer",
                      fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      boxShadow: "0 4px 14px rgba(255,79,214,0.3)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(255,79,214,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,79,214,0.3)"; }}
                  >
                    <PlusIcon />
                    Nueva producción desde corte
                  </button>
                </div>

                <button
                  onClick={handleIgnore}
                  style={{
                    width: "100%", padding: "10px",
                    borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f9fafb",
                    color: "#6b7280", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  }}
                >
                  No hacer nada nuevo
                </button>
              </div>
            </>
          ) : (
            /* Sin selección — solo opción de cerrar */
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "11px", borderRadius: 12,
                border: "1.5px solid #e5e7eb", background: "#fff",
                color: "#374151", cursor: "pointer", fontSize: 13, fontWeight: 600,
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
            >
              Cerrar — no hay artículos dañados
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default DamagedProductsModal;