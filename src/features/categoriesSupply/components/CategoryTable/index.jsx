import React from 'react';
import HoverCard from '../../../shared/components/HoverCart'; 
import { CATEGORY_COLORS } from '../../types/constants';
import BaseTable from '../../../shared/components/Table';

const CategoryTable = ({ categories = [], onEdit, onDelete, supplyCounts = {}, }) => {
  const thStyle = {
    padding: '14px 20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '500',
    color: '#888',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#f5f5f5',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '14px 20px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f5f5f5',
  };
   
  if (categories.length === 0) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '64px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>No hay categorías para mostrar</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      // overflow: 'hidden',  // ← ELIMINADO
    }}>
      <div style={{ 
        overflowX: 'visible'  // ← AGREGADO para permitir que el hover sobresalga
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Cantidad de insumos</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              const colorIndex = index % CATEGORY_COLORS.length;
              const colors = CATEGORY_COLORS[colorIndex];

              return (
                <tr
                  key={category.id}
                  style={{ transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}

                  
                >
                  {/* NOMBRE */}
                    <td style={tdStyle}>
                     {category.nombre}
                    </td>

                  {/* cantidad de insumos */}
                    <td style={tdStyle}>
                     {supplyCounts[String(category.id)] ?? 0}
                    </td>

                  {/* ACCIONES */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Edit button */}
                      <button
                        onClick={() => onEdit(category)}
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

                      {/* Delete button */}
                      <button
                        onClick={() => onDelete(category.id)}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;