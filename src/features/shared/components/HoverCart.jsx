// ─────────────────────────────────────────────────────────────
//  shared/HoverCard.jsx
//  Tooltip genérico reutilizable para cualquier tabla.
//
//  USO:
//  <HoverCard title="..." position="right" fields={[...]}>
//    <span>{valor}</span>
//  </HoverCard>
//
//  PROPS:
//  · title     → string   — Título del header            (editable por tabla)
//  · position  → string   — "right" | "left" | "top" | "bottom"
//  · fields    → array    — [{ label, value, highlight?, type? }]
//                  type: "badge" | "status" | undefined
//  · children  → ReactNode — Elemento que dispara el hover
//
//  ⚠️  NO modificar este archivo.
//      Cada tabla define sus propios `fields` al importarlo.
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const HoverCard = ({ children, title = "Información detallada", fields = [], position = "right" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 288;
    const gap = 12;

    let top = rect.top + rect.height / 2 + window.scrollY;
    let left = rect.right + gap + window.scrollX;

    if (position === "left") { left = rect.left - cardWidth - gap + window.scrollX; }
    if (position === "top") { top = rect.top - gap + window.scrollY; left = rect.left + rect.width / 2 - cardWidth / 2 + window.scrollX; }
    if (position === "bottom") { top = rect.bottom + gap + window.scrollY; left = rect.left + rect.width / 2 - cardWidth / 2 + window.scrollX; }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (!isVisible) return;
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  const card = isVisible ? (
    <div style={{ position: "absolute", top: coords.top, left: coords.left, transform: "translateY(-50%)", zIndex: 9999, width: 288 }}>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", padding: "8px 16px" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>
            {title}
          </p>
        </div>
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          {fields.map(({ label, value, highlight, type }, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", flexShrink: 0 }}>{label}</span>
              {type === "badge" ? (
                <span style={{ fontSize: 11, fontWeight: 700, background: "#fce7f3", color: "#db2777", borderRadius: 99, padding: "2px 10px" }}>
                  {value}
                </span>
              ) : type === "status" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: value === "Activo" ? "#22c55e" : "#ef4444", display: "inline-block" }} />
                  {value}
                </span>
              ) : (
                <span style={{ fontSize: 12, fontWeight: highlight ? 700 : 400, color: "#111827", textAlign: "right", wordBreak: "break-all" }}>
                  {value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <span
      ref={triggerRef}
      style={{ display: "inline-block", cursor: "pointer" }}
      onMouseEnter={() => { updateCoords(); setIsVisible(true); }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {createPortal(card, document.body)}
    </span>
  );
};

export default HoverCard;