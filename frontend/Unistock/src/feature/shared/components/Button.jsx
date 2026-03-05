import React from "react";

function Button({
  onClick,
  children,
  variant = "primary",
  type = "button",
  icon,
  className = "",
}) {
  const variants = {
    primary:
      "bg-[#FF4FD6] hover:bg-[#ff3fcd] active:bg-[#e636ba] text-white",
    success:
      "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white",
    danger:
      "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
    warning:
      "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5
        text-sm font-medium
        rounded-lg
        transition-all duration-200
        shadow-sm hover:shadow-md
        whitespace-nowrap
        ${variants[variant]}
        ${className}
      `}
    >
      {icon && <span className="w-[18px] h-[18px]">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;