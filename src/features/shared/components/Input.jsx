import React from "react";

function Input({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  as = "input",
  children,
}) {

  const baseStyle =
    "w-full border rounded-lg px-3 py-2 text-sm outline-none transition";

  const normal =
    "border-gray-300 focus:border-[#ff4fd6]";

  const errorStyle =
    "border-[#ff4fd6] focus:border-[#ff4fd6]";

  const Component = as;

  return (
    <div className="flex flex-col">

      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Component
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${baseStyle} ${error ? errorStyle : normal}`}
      >
        {children}
      </Component>

      {error && (
        <span className="text-xs mt-1 font-bold" style={{ color: "#ff4fd6" }}>
          {error}
        </span>
      )}

    </div>
  );
}

export default Input;