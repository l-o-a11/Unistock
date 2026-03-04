import React from "react";

function AddUserButton({ onClick, label = "Agregar nuevo usuario" }) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-2
        px-5 py-2.5
        bg-[#FF4FD6] hover:bg-[#ff3fcd] active:bg-[#e636ba]
        text-white text-sm font-medium
        rounded-lg
        transition-all duration-200
        shadow-sm hover:shadow-md
        whitespace-nowrap
      "
    >
      <svg
        className="w-[18px] h-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>

      {label}
    </button>
  );
}

export default AddUserButton;