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
  onNewOrder,
  onNewTechSheet,
}) => {
  // IDs de los artículos seleccionados como dañados
  const [selectedIds, setSelectedIds] = useState(new Set());
  // Paso: "select" → seleccionar artículos | "confirm" → confirmar acción elegida
  const [step,        setStep]        = useState("select");
  const [chosenAction, setChosenAction] = useState(null); // "order" | "techsheet"

  const details = production?.details || [];

  // Reiniciar estado al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(details.map((_, i) => i)));  // todos seleccionados por defecto
      setStep("select");
      setChosenAction(null);
    }
  }, [isOpen]);

  if (!isOpen || !production) return null;

  const selectedCount   = selectedIds.size;
  const damagedDetails  = details.filter((_, i) => selectedIds.has(i));
  const hasSelection    = selectedCount > 0;

  // ── Handlers de selección ────────────────────────────────────────────────

  const toggleItem = (index) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const selectAll   = () => setSelectedIds(new Set(details.map((_, i) => i)));
  const deselectAll = () => setSelectedIds(new Set());

  // ── Handlers de acción ───────────────────────────────────────────────────

  const handleNewOrder = () => {
    onNewOrder(damagedDetails);
    onClose();
  };

  const handleNewTechSheet = () => {
    onNewTechSheet(damagedDetails);
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
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── HEADER ── */}
        <div style={{
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
            background: "#fff", borderRadius: 12, padding: "12px 16px",
            marginBottom: 14, border: "1px solid #f0f0f0",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
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
                    {selectedCount} de {details.length} seleccionados
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
                  const isChecked = selectedIds.has(index);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleItem(index)}
                      style={{
                        padding: "12px 16px",
                        display: "flex", alignItems: "center", gap: 12,
                        cursor: "pointer",
                        borderBottom: index < details.length - 1 ? "1px solid #f5f5f5" : "none",
                        background: isChecked ? "#fffbeb" : "#fff",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isChecked ? "#fef3c7" : "#fafafa"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isChecked ? "#fffbeb" : "#fff"; }}
                    >
                      {/* Checkbox personalizado */}
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        border: isChecked ? "none" : "2px solid #d1d5db",
                        background: isChecked ? "#f59e0b" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                        boxShadow: isChecked ? "0 2px 8px rgba(245,158,11,0.35)" : "none",
                      }}>
                        {isChecked && <CheckIcon />}
                      </div>

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
                      </div>

                      {/* Badge de estado */}
                      <span style={{
                        padding: "3px 8px", borderRadius: 8,
                        fontSize: 10, fontWeight: 700,
                        background: isChecked ? "#fef3c7" : "#f3f4f6",
                        color: isChecked ? "#d97706" : "#9ca3af",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}>
                        {isChecked ? "⚠ Dañado" : "OK"}
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
              <strong>Tienes {selectedCount} artículo{selectedCount !== 1 ? "s" : ""} dañado{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !== 1 ? "s" : ""}.</strong>
              {" "}Elige qué acción tomar con ellos:
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
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#E91E8C"; e.currentTarget.style.color = "#E91E8C"; e.currentTarget.style.background = "#fff0fb"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#fff"; }}
                >
                  <FileIcon />
                  Nueva ficha técnica
                </button>

                {/* Nueva orden */}
                <button
                  onClick={handleNewOrder}
                  style={{
                    flex: 1, padding: "11px 16px", borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #E91E8C, #ff4fd6)",
                    color: "#fff", cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    boxShadow: "0 4px 14px rgba(233,30,140,0.35)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(233,30,140,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(233,30,140,0.35)"; }}
                >
                  <PlusIcon />
                  Nueva orden de producción
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

          {/* Siempre disponible: ignorar y cerrar */}
          {hasSelection && (
            <button
              onClick={onClose}
              style={{
                marginTop: 8, width: "100%", padding: "8px",
                borderRadius: 8, border: "none", background: "transparent",
                color: "#9ca3af", cursor: "pointer", fontSize: 12,
                textDecoration: "underline",
              }}
            >
              Ignorar y cerrar sin acción
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default DamagedProductsModal;