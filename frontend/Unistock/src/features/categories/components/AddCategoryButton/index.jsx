import React from 'react';

const AddCategoryButton = ({ onClick, label = "Agregar nueva categoría" }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#FF4FD6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D93DB8')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF4FD6')}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      {label}
    </button>
  );
};

export default AddCategoryButton;
