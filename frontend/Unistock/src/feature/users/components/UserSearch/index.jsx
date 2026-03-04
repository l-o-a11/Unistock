import React from "react";

const UserSearch = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="relative w-full max-w-xs">

      {/* Icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          pl-9 pr-4 py-2
          text-sm
          border border-gray-200
          rounded-lg
          bg-white
          outline-none
          transition
          focus:border-pink-500
          focus:ring-1
          focus:ring-pink-500
        "
      />
    </div>
  );
};

export default UserSearch;