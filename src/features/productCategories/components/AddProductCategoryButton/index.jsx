import React from 'react';

const AddProductCategoryButton = ({ onClick, label = 'Agregar' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#FF4FD6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(255,79,214,0.3)',
        transition: 'background 0.15s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e040c0'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,79,214,0.4)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF4FD6'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,79,214,0.3)'; }}
    >
      <svg
        width="16"
        height="16"
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

export default AddProductCategoryButton;
