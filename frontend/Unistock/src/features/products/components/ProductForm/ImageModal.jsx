import React from "react";

const ImageModal = ({ isOpen, images = [], selectedIndex, onClose, productName }) => {
  if (!isOpen) return null;

  const currentImage = images[selectedIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    > 
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2100,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ff4fd6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
        }}
      >
        ✕
      </button>
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}
        onClick={e => e.stopPropagation()}
      >

        <img
          src={currentImage?.src}
          alt={currentImage?.label || productName}
          style={{
            maxWidth: "80vw",
            maxHeight: "65vh",
            borderRadius: "12px",
            objectFit: "contain",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.5)"
          }}
        />

        {hasMultipleImages && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {images.map((img, i) => (
              <div
                key={i}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "default",
                  border: i === selectedIndex ? "2.5px solid #FF4FD6" : "2px solid rgba(255, 255, 255, 0.3)",
                  transition: "border 0.15s"
                }}
              >
                <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;