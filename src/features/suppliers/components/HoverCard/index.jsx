import React, { useRef, useState } from "react";

const HoverCard = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltipPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 228)),
      bottom: window.innerHeight - rect.top + 8,
    });
    setIsVisible(true);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* Trigger */}
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setIsVisible(false)}
        style={{ cursor: 'help', display: 'inline-block' }}
      >
        {children}
      </span>

      {isVisible && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            width: '220px',
            ...tooltipPosition,
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
            {/* Header */}
            <div
              style={{
                background: '#f5f5f5',
                borderBottom: '1px solid #e5e7eb',
                padding: '8px 16px',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Información Detallada
              </h4>
            </div>

            {/* Content */}
            <div
              style={{
                padding: '16px',
                maxHeight: '384px',
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