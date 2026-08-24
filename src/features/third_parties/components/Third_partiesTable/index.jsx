/**
 * @file Third_partiesTable/index.jsx
 * @description Tabla de terceros — fix responsive: scroll horizontal en móvil.
 */
import React, { useState } from 'react';
import HoverCard from '../../../shared/components/HoverCart';
import Alert from '../../../shared/components/Alert';

const Third_partieTable = ({ Third_parties = [], onView, onEdit, onDelete, onToggle, selectedId }) => {
  const [toggleAlert, setToggleAlert] = useState({ open: false, thirdId: null, isActive: false });

  const handleToggleClick = (e, t) => {
    e.stopPropagation();
    setToggleAlert({ open: true, thirdId: t.id, isActive: t.estado !== false });
  };

  const confirmToggle = async () => {
    await onToggle?.(toggleAlert.thirdId);
    setToggleAlert({ open: false, thirdId: null, isActive: false });
  };

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
    whiteSpace: 'nowrap',
  };

  if (Third_parties.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '64px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
        <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>No hay terceros para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <Alert
        isOpen={toggleAlert.open}
        type="password"
        title={toggleAlert.isActive ? 'Inactivar tercero' : 'Activar tercero'}
        message={toggleAlert.isActive
          ? 'Para inactivar este tercero ingresa la contraseña de administrador.'
          : 'Para activar este tercero ingresa la contraseña de administrador.'}
        onConfirm={confirmToggle}
        onCancel={() => setToggleAlert({ open: false, thirdId: null, isActive: false })}
      />

      {/* tp-table-card (padre) maneja el scroll — este div solo da estilos visuales */}
      <div style={{
        width: '100%',
  overflowX: 'auto',          // ← Activa el scroll horizontal si es necesario
  borderRadius: '12px',       // hereda el borde redondeado visual
  border: '1px solid #f0f0f0',
  backgroundColor: '#fff',
      }}>
        <table style={{
           width: '100%',
    borderCollapse: 'collapse',
    minWidth: '560px', /* en pantallas < 560px aparece la scrollbar */
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Identificador</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Contacto principal</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Third_parties.map((t) => {
              const isActive   = t.estado !== false;
              const isSelected = t.id === selectedId;

              return (
                <tr
                  key={t.id}
                  style={{
                    cursor: 'pointer',
                    background: isSelected
                      ? 'linear-gradient(90deg,#FdF4ff)'
                      : 'transparent',
                    borderLeft: isSelected ? '3px solid #FF4FD6' : '3px solid transparent',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => onView?.(t)}
                >
                  {/* CÓDIGO */}
                  <td style={tdStyle}>
                    <span style={{
                      fontWeight: 700,
                      color:      isSelected ? '#FF4FD6' : '#be185d',
                      background: isSelected ? '#fce7f3' : '#fdf2f8',
                      padding: '3px 8px', borderRadius: 6, fontSize: 12,
                    }}>
                      {t.nit || t.codigo || `#${t.id}`}
                    </span>
                  </td>

                  {/* NOMBRE */}
                  <td style={tdStyle}>
                    <HoverCard title="Información tercero" fields={[
                      { label: 'Empresa', value: t.nombreEmpresa, highlight: true },
                      { label: 'NIT',     value: t.nit },
                      { label: 'Estado',  value: isActive ? 'Activo' : 'Inactivo', type: 'status' },
                    ]}>
                      <span style={{ fontWeight: isSelected ? 700 : 500 }}>
                        {(t.nombreEmpresa || '').length > 22
                          ? (t.nombreEmpresa || '').slice(0, 22) + '…'
                          : (t.nombreEmpresa || '—')}
                      </span>
                    </HoverCard>
                  </td>

                  {/* CONTACTO */}
                  <td style={tdStyle}>
                    <HoverCard title="Contacto" fields={[
                      { label: 'Nombre',   value: t.nombreContacto || t.contacto },
                      { label: 'Teléfono', value: t.telefono },
                      { label: 'Correo',   value: t.correo || t.email },
                    ]}>
                      {((t.nombreContacto || t.contacto || '—')).length > 20
                        ? ((t.nombreContacto || t.contacto || '—')).slice(0, 20) + '…'
                        : (t.nombreContacto || t.contacto || '—')}
                    </HoverCard>
                  </td>

                  {/* ACCIONES */}
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                      {/* Ver detalle */}
                      <button onClick={(e) => { e.stopPropagation(); onView?.(t); }} title="Ver detalle"
                        style={iconBtn}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4FD6')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      {/* Editar */}
                      <button onClick={(e) => { e.stopPropagation(); onEdit?.(t); }} title="Editar"
                        style={iconBtn}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4FD6')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {/* Eliminar */}
                      <button onClick={(e) => { e.stopPropagation(); onDelete?.(t.id); }} title="Eliminar"
                        style={iconBtn}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>

                      {/* Toggle activo/inactivo */}
                      <button onClick={(e) => handleToggleClick(e, t)} title={isActive ? 'Inactivar' : 'Activar'}
                        style={{
                          position: 'relative', width: '38px', height: '20px',
                          borderRadius: '20px', border: 'none',
                          backgroundColor: isActive ? '#22c55e' : '#d1d5db',
                          cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
                        }}>
                        <span style={{
                          position: 'absolute', top: '2px',
                          left: isActive ? '18px' : '2px',
                          width: '16px', height: '16px',
                          borderRadius: '50%', backgroundColor: '#fff',
                          transition: 'left 0.2s',
                        }} />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '3px',
};

export default Third_partieTable;