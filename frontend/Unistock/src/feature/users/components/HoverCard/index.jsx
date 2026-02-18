import React, { useState } from "react";

const HoverCard = ({ children, content, position = "right" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    right: { left: "100%", marginLeft: "12px", top: "50%", transform: "translateY(-50%)" },
    left: { right: "100%", marginRight: "12px", top: "50%", transform: "translateY(-50%)" },
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          style={{
            position: "absolute",
            zIndex: 9999,
            width: "280px",
            ...positionStyles[position],
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
              border: "1px solid #eee",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(90deg, #E91E63, #C2185B)",
                padding: "10px 16px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Información del Usuario
              </h4>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "16px",
                fontSize: "14px",
                color: "#333",
              }}
            >
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverCard;
