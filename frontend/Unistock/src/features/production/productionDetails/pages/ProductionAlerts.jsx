/**
 * @file ProductionAlerts.jsx
 * @description Modal multipropósito para acciones sobre órdenes de producción.
 *
 * TIPOS SOPORTADOS:
 *   advance    — confirmación simple de cambio de estado
 *   third      — selección de tercero(s) + cantidad antes de avanzar
 *                Valida que la suma de cantidades ≤ totalUnidades
 *   assignSede — selección de sede(s) + cantidad antes de avanzar
 *                Valida que la suma de cantidades ≤ totalUnidades
 *   confirm    — confirmación de acción destructiva (anular artículo)
 *   anular     — anulación de orden con campo de motivo obligatorio
 */
import React, { useState, useEffect } from "react";

const BRAND = "#FF4FD6";
const BRAND_DARK = "#d93db8";

// Carga terceros activos desde localStorage (igual que el módulo de terceros)
const loadTerceros = () => {
  try {
    const raw = localStorage.getItem('app_third_parties');
    const list = raw ? JSON.parse(raw) : [];
    return list.filter(t => t.estado !== false).map(t => t.nombreEmpresa || t.nombre || t.codigo);
  } catch { return ["Confección Aurora", "Taller Rojo"]; }
};

// Carga sedes activas desde localStorage
const loadSedes = () => {
  try {
    const raw = localStorage.getItem('app_sedes');
    const list = raw ? JSON.parse(raw) : [];
    return list.filter(s => s.estado !== false).map(s => s.nombre);
  } catch { return ["Sede Principal", "Sede Norte"]; }
};

/* ─── Íconos inline ──────────────────────────────────────────── */
const IconArrow   = () => <svg width="18" height="18" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>;
const IconPerson  = () => <svg width="18" height="18" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"/></svg>;
const IconPin     = () => <svg width="18" height="18" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconWarn    = () => <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>;
const IconPlus    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;

/* ─── Fila de asignación (tercero o sede + cantidad) ─────────── */
const AssignRow = ({ options, value, cantidad, onChangeOption, onChangeCantidad, onRemove, maxLeft, isOnly }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
    <select
      value={value}
      onChange={(e) => onChangeOption(e.target.value)}
      style={{
        flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 10px",
        fontSize: 13, color: "#374151", outline: "none", background: "#fff",
        cursor: "pointer",
      }}
      onFocus={(e) => (e.target.style.borderColor = BRAND)}
      onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
    >
      <option value="">Seleccionar...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>

    <input
      type="number"
      min="1"
      max={maxLeft + (Number(cantidad) || 0)}
      value={cantidad}
      onChange={(e) => onChangeCantidad(e.target.value)}
      placeholder="Cant."
      style={{
        width: 72, border: "1.5px solid #e5e7eb", borderRadius: 10,
        padding: "8px 10px", fontSize: 13, color: "#374151", outline: "none",
        textAlign: "center",
      }}
      onFocus={(e) => (e.target.style.borderColor = BRAND)}
      onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
    />

    {!isOnly && (
      <button
        onClick={onRemove}
        title="Eliminar fila"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#ef4444", padding: 4, borderRadius: 6,
          display: "flex", alignItems: "center",
        }}
      >
        <IconTrash />
      </button>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const ProductionAlerts = ({
  isOpen,
  type,
  targetStep,
  // tercero / sede ahora son arrays gestionados internamente
  // mantenemos props legacy por compatibilidad pero los ignoramos en third/assignSede
  tercero,
  sede,
  onChangeTercero,
  onChangeSede,
  customTitle,
  customMessage,
  onAccept,
  onCancel,
  // ── NUEVO ── total de unidades de la orden (para validar cantidades)
  totalUnidades = 0,
}) => {
  // Lista de asignaciones: [{ option: "", cantidad: "" }, ...]
  const [assignments, setAssignments] = useState([{ option: "", cantidad: "" }]);
  const [motivo, setMotivo] = useState("");

  // Resetear assignments cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAssignments([{ option: "", cantidad: "" }]);
      setMotivo("");
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isAssign = type === "third" || type === "assignSede";
  const options  = type === "third" ? loadTerceros() : loadSedes();

  /* ── Total ya asignado en las filas actuales ── */
  const totalAsignado = assignments.reduce((s, a) => s + (Number(a.cantidad) || 0), 0);
  const restante      = totalUnidades - totalAsignado;

  /* ── Actualizar una fila ── */
  const updateRow = (i, field, val) => {
    setAssignments((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  };
  const addRow    = () => setAssignments((prev) => [...prev, { option: "", cantidad: "" }]);
  const removeRow = (i) => setAssignments((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Configuración de título y mensaje ── */
  const config = {
    advance: {
      title:   customTitle   || "Cambiar estado",
      message: customMessage || (targetStep ? `¿Confirmas el avance al estado "${targetStep}"?` : "¿Deseas continuar?"),
      icon: <IconArrow />, iconBg: "#fdf0fa",
    },
    third: {
      title:   customTitle   || "Asignar tercero(s)",
      message: customMessage || `Asigna uno o más terceros y la cantidad de unidades para el estado "${targetStep}".`,
      icon: <IconPerson />, iconBg: "#fdf0fa",
    },
    assignSede: {
      title:   customTitle   || "Asignar sede(s)",
      message: customMessage || `Asigna una o más sedes y la cantidad de unidades para el estado "${targetStep}".`,
      icon: <IconPin />, iconBg: "#fdf0fa",
    },
    confirm: {
      title:   customTitle   || "Confirmar acción",
      message: customMessage || "¿Deseas continuar con esta acción?",
      icon: <IconWarn />, iconBg: "#fff5f5",
    },
    anular: {
      title:   customTitle   || "Anular orden",
      message: customMessage || "¿Deseas anular esta orden de producción? Esta acción no se puede deshacer.",
      icon: <IconWarn />, iconBg: "#fff5f5",
    },
    password: {
      title:   customTitle   || "Autorización requerida",
      message: customMessage || "Ingresa la contraseña de administrador para continuar.",
      icon: <IconWarn />, iconBg: "#fdf0fa",
    },
  };

  const { title, message, icon, iconBg } = config[type] || config.advance;
  const isDestructive = type === "confirm" || type === "anular";

  /* ── Validación del botón Confirmar ── */
  const assignmentsValid =
    assignments.length > 0 &&
    assignments.every((a) => !!a.option && Number(a.cantidad) >= 1) &&
    totalAsignado === totalUnidades &&
    totalUnidades > 0;

  const canConfirm =
    (isAssign                       && assignmentsValid)      ||
    (type === "anular"              && motivo.trim() !== "")  ||
    (type === "password"            && motivo.trim() !== "")  ||
    type === "advance"              ||
    type === "confirm";

  /* ── Colores de botón ── */
  const confirmStyle = canConfirm
    ? { background: isDestructive ? "#ef4444" : BRAND, color: "#fff", cursor: "pointer" }
    : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" };

  /* ── Confirmar ── */
  const handleAccept = () => {
    if (type === "anular" || type === "password") { onAccept(motivo.trim()); setMotivo(""); return; }
    if (isAssign) {
      // Retorna el array de asignaciones al padre
      onAccept(assignments);
      // También dispara los legacy props si existen (compatibilidad)
      onChangeTercero?.(assignments[0]?.option || "");
      onChangeSede?.(assignments[0]?.option || "");
      return;
    }
    onAccept("");
  };

  const handleCancel = () => { setMotivo(""); onCancel(); };

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(0,0,0,0.45)", zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 28px 24px",
        width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        fontFamily: "'Nunito', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
      /* Ocultar ojo nativo del navegador en inputs de contraseña */
      input[type="password"]::-ms-reveal,
      input[type="password"]::-ms-clear,
      input[type="password"]::-webkit-credentials-auto-fill-button,
      input[type="password"]::-webkit-password-generator-button { display: none !important; }
        `}} />

        {/* ── Ícono + Título ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {icon}
          </div>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 700,
            color: isDestructive ? "#dc2626" : "#111827",
          }}>
            {title}
          </h2>
        </div>

        {/* ── Mensaje ── */}
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.5 }}>{message}</p>

        {/* ── Asignaciones múltiples (tercero / sede) ── */}
        {isAssign && (
          <div style={{ marginBottom: 4 }}>
            {/* Contador de unidades */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                {type === "third" ? "Terceros" : "Sedes"} y cantidades
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: totalAsignado > totalUnidades ? "#fee2e2" : totalAsignado === totalUnidades ? "#d1fae5" : "#fef3c7",
                color: totalAsignado > totalUnidades ? "#dc2626" : totalAsignado === totalUnidades ? "#065f46" : "#92400e",
              }}>
                {totalAsignado} / {totalUnidades} uds
              </span>
            </div>

            {/* Filas de asignación */}
            {assignments.map((a, i) => (
              <AssignRow
                key={i}
                options={options}
                value={a.option}
                cantidad={a.cantidad}
                onChangeOption={(v) => updateRow(i, "option", v)}
                onChangeCantidad={(v) => {
                  const num = Math.max(0, Number(v));
                  const otherSum = assignments.reduce((s, x, idx) => idx === i ? s : s + (Number(x.cantidad) || 0), 0);
                  if (num + otherSum <= totalUnidades) updateRow(i, "cantidad", v);
                }}
                onRemove={() => removeRow(i)}
                maxLeft={restante}
                isOnly={assignments.length === 1}
              />
            ))}

            {/* Error si excede */}
            {totalAsignado > totalUnidades && (
              <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                ⚠ La cantidad total supera las {totalUnidades} unidades de la orden.
              </p>
            )}

            {/* Error: unidades faltantes — bloquea confirmar */}
            {totalAsignado > 0 && totalAsignado < totalUnidades && (
              <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>
                ⛔ Debes asignar las {totalUnidades} unidades. Faltan {totalUnidades - totalAsignado}.
              </p>
            )}
            {totalAsignado === 0 && totalUnidades > 0 && (
              <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>
                ⛔ Debes asignar las {totalUnidades} unidades de la orden para continuar.
              </p>
            )}

            {/* Botón agregar fila */}
            {restante > 0 && (
              <button
                onClick={addRow}
                style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 8,
                  background: "none", border: `1.5px dashed ${BRAND}`, borderRadius: 10,
                  padding: "7px 14px", fontSize: 12, fontWeight: 700, color: BRAND,
                  cursor: "pointer", width: "100%", justifyContent: "center",
                }}
              >
                <IconPlus /> Agregar {type === "third" ? "tercero" : "sede"}
              </button>
            )}
          </div>
        )}

        {/* ── Campo de contraseña para retroceder ── */}
        {type === "password" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
              Contraseña de administrador <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="password"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Contraseña de administrador..."
              autoFocus
              style={{
                width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
                padding: "9px 12px", fontSize: 13, color: "#374151",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF4FD6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              onKeyDown={(e) => e.key === "Enter" && motivo.trim() && handleAccept()}
            />
            {!motivo.trim() && (
              <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>La contraseña es obligatoria.</p>
            )}
          </div>
        )}

        {/* ── Campo de motivo de anulación ── */}
        {type === "anular" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
              Motivo de anulación <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo de la anulación..."
              rows={3}
              style={{
                width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
                padding: "9px 12px", fontSize: 13, color: "#374151",
                outline: "none", resize: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
              onBlur={(e)  => (e.target.style.borderColor = "#e5e7eb")}
            />
            {!motivo.trim() && (
              <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>El motivo es obligatorio para anular.</p>
            )}
          </div>
        )}

        {/* ── Botones ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleCancel}
            style={{
              padding: "9px 20px", borderRadius: 12, border: "1.5px solid #e5e7eb",
              background: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!canConfirm}
            style={{
              padding: "9px 22px", borderRadius: 12, border: "none",
              fontSize: 13, fontWeight: 700, transition: "all 0.15s",
              boxShadow: canConfirm ? "0 4px 14px rgba(255,79,214,0.3)" : "none",
              ...confirmStyle,
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionAlerts;
