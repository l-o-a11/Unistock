import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const HoverCard = ({ children, content, position = "right" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 288; // w-72 = 18rem = 288px
    const gap = 12;

    let top = rect.top + rect.height / 2 + window.scrollY;
    let left = rect.right + gap + window.scrollX;

    if (position === "left") {
      left = rect.left - cardWidth - gap + window.scrollX;
    } else if (position === "top") {
      top = rect.top - gap + window.scrollY;
      left = rect.left + rect.width / 2 - cardWidth / 2 + window.scrollX;
    } else if (position === "bottom") {
      top = rect.bottom + gap + window.scrollY;
      left = rect.left + rect.width / 2 - cardWidth / 2 + window.scrollX;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsVisible(true);
  };

  // Recalcula si la ventana se mueve
  useEffect(() => {
    if (isVisible) {
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  const card = isVisible ? (
    <div
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        transform: "translateY(-50%)",
        zIndex: 9999,
        width: "288px",
      }}
    >
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
            Información detallada
          </h4>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4 text-sm text-gray-700">
          {content}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {createPortal(card, document.body)}
    </div>
  );
};

export default HoverCard;