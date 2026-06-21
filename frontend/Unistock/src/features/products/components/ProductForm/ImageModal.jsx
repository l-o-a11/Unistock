import React from "react";

const ImageModal = ({ isOpen, images = [], selectedIndex, onClose, onDeleteImage, onDeleteAllImages, productName }) => {
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
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-36px",
            right: 0,
            background: "rgba(255, 255, 255, 0.15)",
            border: "none",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ×
        </button>

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

        <p style={{
          color: "#fff",
          fontSize: "12px",
          fontWeight: 600,
          margin: 0,
          background: "rgba(0, 0, 0, 0.45)",
          padding: "4px 12px",
          borderRadius: "20px"
        }}>
          {currentImage?.label || "Imagen del producto"}
        </p>

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

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {onDeleteImage && (
            <button
              onClick={() => onDeleteImage(selectedIndex)}
              style={{
                background: "rgba(255, 79, 214, 0.9)",
                border: "none",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Eliminar imagen
            </button>
          )}
          {onDeleteAllImages && (
            <button
              onClick={onDeleteAllImages}
              style={{
                background: "rgba(220, 38, 38, 0.9)",
                border: "none",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Eliminar todas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;