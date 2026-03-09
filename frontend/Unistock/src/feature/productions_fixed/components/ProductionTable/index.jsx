import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MinusCircle } from 'lucide-react';
import Alert from '../Alert';

const ProductionTable = ({ productions = [], onCancel }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  // ✅ Fix: Alert propio para confirmar anulación — consistente con el patrón de suppliers/users
  const [cancelAlert, setCancelAlert] = useState({ open: false, id: null });

  const handleCancelClick = (id) => {
    setCancelAlert({ open: true, id });
  };

  const confirmCancel = () => {
    onCancel?.(cancelAlert.id);
    setCancelAlert({ open: false, id: null });
  };

  const thStyle = {
    padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '500',
    color: '#888', borderBottom: '1px solid #eee', backgroundColor: '#fafafa', whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '14px 20px', fontSize: '14px', color: '#333', borderBottom: '1px solid #f5f5f5',
  };

  const getStatusStyle = (status) => {
    const map = {
      'Producción':   { background: '#ffe4f6', color: '#ff4fd6' },
      'Corte':        { background: '#dbeafe', color: '#1d4ed8' },
      'Diseño':       { background: '#f3e8ff', color: '#7c3aed' },
      'Compras':      { background: '#fef3c7', color: '#d97706' },
      'Recepción':    { background: '#dcfce7', color: '#16a34a' },
      'Entregado':    { background: '#f0fdf4', color: '#15803d' },
      'Anulada':      { background: '#fee2e2', color: '#dc2626' },
      'En producción':{ background: '#ffe4f6', color: '#ff4fd6' },
      'En corte':     { background: '#dbeafe', color: '#1d4ed8' },
    };
    return map[status] || { background: '#f3f4f6', color: '#6b7280' };
  };

  const badgeStyle = (status) => ({
    ...getStatusStyle(status),
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
    fontWeight: '500', display: 'inline-block',
  });

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  if (!productions || productions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <p>No hay producciones para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <Alert
        isOpen={cancelAlert.open}
        type="confirm"
        title="Anular orden"
        message="¿Seguro que deseas anular esta orden de producción? Esta acción no se puede deshacer."
        onConfirm={confirmCancel}
        onCancel={() => setCancelAlert({ open: false, id: null })}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Orden</th>
            <th style={thStyle}>Cantidad</th>
            <th style={thStyle}>Fecha de entrega</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Fecha de estado</th>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productions.map((prod) => (
            <React.Fragment key={prod.id}>
              <tr
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={tdStyle}>{prod.orderNumber}</td>
                <td style={tdStyle}>{prod.quantity}</td>
                <td style={tdStyle}>{prod.deliveryDate}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(prod.status)}>{prod.status}</span>
                </td>
                <td style={tdStyle}>{prod.statusDate}</td>
                <td style={tdStyle}>{prod.client}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* ✅ Fix: abre Alert en lugar de llamar onCancel directo */}
                    <button
                      style={{
                        ...iconBtn,
                        color: prod.status === 'Anulada' ? '#bbb' : '#ef4444',
                        cursor: prod.status === 'Anulada' ? 'not-allowed' : 'pointer',
                      }}
                      disabled={prod.status === 'Anulada'}
                      title="Anular orden"
                      onClick={() => prod.status !== 'Anulada' && handleCancelClick(prod.id)}
                      onMouseEnter={(e) => { if (prod.status !== 'Anulada') e.currentTarget.style.color = '#dc2626'; }}
                      onMouseLeave={(e) => { if (prod.status !== 'Anulada') e.currentTarget.style.color = '#ef4444'; }}
                    >
                      <MinusCircle size={16} />
                    </button>

                    <button
                      style={{ ...iconBtn, color: '#888' }}
                      onClick={() => toggleRow(prod.id)}
                      title={expandedRow === prod.id ? 'Colapsar' : 'Expandir detalles'}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4fd6')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                    >
                      {expandedRow === prod.id ? '▴' : '▾'}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Fila expandida con detalles */}
              {expandedRow === prod.id && (
                <tr>
                  <td colSpan="7" style={{ background: '#f9f9f9', padding: 0 }}>
                    <table style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, fontSize: '12px' }}>Ref_corte</th>
                          <th style={{ ...thStyle, fontSize: '12px' }}>Ref</th>
                          <th style={{ ...thStyle, fontSize: '12px' }}>Estado</th>
                          <th style={{ ...thStyle, fontSize: '12px' }}>Fecha de estado</th>
                          <th style={{ ...thStyle, fontSize: '12px' }}>Cantidad</th>
                          <th style={{ ...thStyle, fontSize: '12px' }}>Color</th>
                          <th style={{ ...thStyle, fontSize: '12px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(prod.details || []).map((d, i) => (
                          <tr key={i}>
                            <td style={tdStyle}>{d.refCorte}</td>
                            <td style={tdStyle}>{d.ref}</td>
                            <td style={tdStyle}>
                              <span style={badgeStyle(d.status)}>{d.status}</span>
                            </td>
                            <td style={tdStyle}>{d.statusDate}</td>
                            <td style={tdStyle}>{d.quantity}</td>
                            <td style={tdStyle}>{d.color}</td>
                            <td style={tdStyle}>
                              <button
                                style={{ ...iconBtn, color: '#888' }}
                                title="Ver detalle completo"
                                onClick={() => navigate(`/layout/produccion/detail/${prod.id}`)}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4fd6')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
};

const iconBtn = { border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' };

export default ProductionTable;
