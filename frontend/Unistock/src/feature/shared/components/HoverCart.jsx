import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const HoverCard = ({
  children,
  content,
  title = "Información",
  position = "right",
  variant = "primary",
  width = 288,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const variants = {
    primary: "from-pink-500 to-pink-600",
    success: "from-green-500 to-green-600",
    danger: "from-red-500 to-red-600",
    warning: "from-yellow-500 to-yellow-600",
    info: "from-indigo-500 to-indigo-600",
  };

  const updateCoords = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 12;

    let top = rect.top + rect.height / 2 + window.scrollY;
    let left = rect.right + gap + window.scrollX;

    if (position === "left") {
      left = rect.left - width - gap + window.scrollX;
    } else if (position === "top") {
      top = rect.top - gap + window.scrollY;
      left =
        rect.left + rect.width / 2 - width / 2 + window.scrollX;
    } else if (position === "bottom") {
      top = rect.bottom + gap + window.scrollY;
      left =
        rect.left + rect.width / 2 - width / 2 + window.scrollX;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsVisible(true);
  };

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
      className="absolute z-[9999] transition-all duration-200 animate-in fade-in zoom-in-95"
      style={{
        top: coords.top,
        left: coords.left,
        width: `${width}px`,
        transform: position === "right" || position === "left"
          ? "translateY(-50%)"
          : "none",
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${variants[variant]} px-4 py-2`}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
            {title}
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