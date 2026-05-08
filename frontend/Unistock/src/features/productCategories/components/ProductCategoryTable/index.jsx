import React from 'react';
import HoverCard from '../../../shared/components/HoverCart';
import { useMediaQuery } from '../../../shared/hooks/useMediaQuery';

const ProductCategoryTable = ({ productCategories = [], onEdit, onDelete }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const thStyle = {
    padding: isMobile ? '10px 12px' : '14px 20px',
    textAlign: 'left',
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: '500',
    color: '#888',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#f5f5f5',
    whiteSpace: isMobile ? 'normal' : 'nowrap',
  };

  const tdStyle = {
    padding: isMobile ? '10px 12px' : '14px 20px',
    fontSize: isMobile ? '13px' : '14px',
    color: '#333',
    borderBottom: '1px solid #f5f5f5',
    whiteSpace: isMobile ? 'normal' : 'nowrap',
  };

  const needsHover = (text) => text && text.length > 12;

  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (productCategories.length === 0) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '64px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>
          No hay categorías para mostrar
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: isMobile ? '740px' : undefined,
        }}>
          
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Descripción</th>
              <th style={thStyle}>Cantidad de productos</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productCategories.map((productCategory) => (
              <tr
                key={productCategory.id}
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >

                {/* NOMBRE */}
                <td style={tdStyle}>
                  {needsHover(productCategory.name) ? (
                    <HoverCard
                      title="Nombre completo"
                      position="right"
                      fields={[
                        { label: "Nombre", value: productCategory.name, highlight: true },
                        { label: "ID", value: productCategory.id, type: "badge" }
                      ]}
                    >
                      <span style={{
                        color: '#333',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'help'
                      }}>
                        {truncateText(productCategory.name, 20)}
                      </span>
                    </HoverCard>
                  ) : (
                    <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                      {productCategory.name}
                    </span>
                  )}
                </td>

                {/* DESCRIPCIÓN */}
                <td style={tdStyle}>
                  {needsHover(productCategory.description) ? (
                    <HoverCard
                      title="Información categoría"
                      position="right"
                      fields={[
                        { label: "Descripción", value: productCategory.description, highlight: true }
                      ]}
                    >
                      <span style={{ cursor: 'help' }}>
                        {truncateText(productCategory.description, 25)}
                      </span>
                    </HoverCard>
                  ) : (
                    <span title={productCategory.description}>
                      {truncateText(productCategory.description, 25)}
                    </span>
                  )}
                </td>

                {/* CANTIDAD */}
                <td style={tdStyle}>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {productCategory.productCount}
                  </span>
                </td>

                {/* ACCIONES */}
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '10px' }}>

                    {/* EDIT */}
                    <button
                      onClick={() => onEdit(productCategory)}
                      title="Editar categoría"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#555',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => onDelete(productCategory.id)}
                      title="Eliminar categoría"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#555',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ProductCategoryTable;