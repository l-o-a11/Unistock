// ─────────────────────────────────────────────────────────────
//  Alert/ToastAlert.jsx
//  Toast deslizante lateral para: success | error | warning
//  Se auto-cierra tras `duration` ms con barra de progreso.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { ALERT_CONFIG, injectShrinkKeyframes } from "./alertConfig";

const ToastAlert = ({ isOpen, type, title, message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => { injectShrinkKeyframes(); }, []);

  useEffect(() => {
    if (!isOpen) return;
    setVisible(true);
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const { color, icon } = ALERT_CONFIG[type];

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.toast,
          transform: visible ? "translateX(0)" : "translateX(120%)",
          opacity:   visible ? 1 : 0,
          borderLeft: `6px solid ${color}`,
        }}
      >
        <div style={styles.icon}>{icon}</div>

        <div style={{ flex: 1 }}>
          <strong>{title}</strong>
          {message && <p style={styles.message}>{message}</p>}
        </div>

        <button style={styles.closeBtn} onClick={handleClose}>✕</button>

        {/* ⏳ barra de progreso */}
        <div
          style={{
            ...styles.progressBar,
            background: color,
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
  },
  toast: {
    width: "320px",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    transition: "all .35s ease",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "4px",
    width: "100%",
    borderRadius: "0 0 14px 14px",
    animationName: "shrink",
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  },
  icon:       { fontWeight: "bold", fontSize: "18px" },
  message:    { margin: "2px 0 0", fontSize: "13px", color: "#555" },
  closeBtn:   { border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#666" },
};

export default ToastAlert;
