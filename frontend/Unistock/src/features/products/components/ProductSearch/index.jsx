import React from 'react';

const ProductSearch = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <span
        style={{
          position: 'absolute',
          left: '11px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 14px 9px 34px',
          border: '1.5px solid #e5e7eb',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#333',
          backgroundColor: '#fff',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#FF4FD6')}
        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
      />
    </div>
  );
};

export default ProductSearch;