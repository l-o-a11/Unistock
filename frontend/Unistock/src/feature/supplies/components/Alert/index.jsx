import React from 'react';

const Alert = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px 28px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Title */}
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#ff4fd6',
          }}
        >
          Alerta
        </h3>

        {/* Message */}
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#333333',
            lineHeight: '1.5',
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '15px',
              fontWeight: '600',
              color: '#ff4fd6',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff4fd6'}
            onMouseLeave={e => e.currentTarget.style.color = '#ff4fd6'}
          >
            Aceptar
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '15px',
              fontWeight: '600',
              color: '#ff4fd6',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff4fd6'}
            onMouseLeave={e => e.currentTarget.style.color = '#ff4fd6'}
          >
            Denegar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;