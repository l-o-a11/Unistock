import React from "react";

function Input({
  label,
  error,
  as = "input", // input o select
  children,
  className = "",
  ...props
}) {
  const baseStyle = `
    w-full
    bg-gray-50
    border
    rounded-xl
    px-4 py-2
    text-sm
    shadow-sm
    transition
    focus:outline-none
    focus:ring-2
    focus:ring-pink-500
  `;

  const errorStyle = error
    ? "border-red-500 focus:ring-red-400"
    : "border-gray-200 hover:border-pink-300 focus:border-pink-400";

  const Component = as;

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <Component
        {...props}
        className={`${baseStyle} ${errorStyle} mt-2 ${className}`}
      >
        {children}
      </Component>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default Input;