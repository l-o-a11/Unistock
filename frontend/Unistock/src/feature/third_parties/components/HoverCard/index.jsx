import React, { useState } from "react";

const HoverCard = ({ children, content, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    right: { left: '100%', marginLeft: '8px', top: '50%', transform: 'translateY(-50%)' },
    left:  { right: '100%', marginRight: '8px', top: '50%', transform: 'translateY(-50%)' },
    top:   { bottom: '100%', marginBottom: '8px', left: '50%', transform: 'translateX(-50%)' },
    bottom:{ top: '100%', marginTop: '8px', left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ cursor: 'help', display: 'inline-block' }}
      >
        {children}
      </span>

      {isVisible && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            width: '320px',
            ...positionStyles[position],
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
            }}
          >
            

            {/* Content */}
            <div
              style={{
                padding: '16px',
                maxHeight: '100px',
                overflowY: 'auto',
              }}
            >
              {content}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default HoverCard;