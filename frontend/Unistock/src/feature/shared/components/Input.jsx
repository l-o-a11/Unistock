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
    "border-gray-300 focus:border-[#E91E8C]";

  const errorStyle =
    "border-red-500 focus:border-red-500";

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
        <span className="text-red-500 text-xs mt-1">
          {error}
        </span>
      )}

    </div>
  );
}

export default Input;