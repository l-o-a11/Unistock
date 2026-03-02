import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MinusCircle } from 'lucide-react';
const ProductionTable = ({ productions = [], onCancel }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const thStyle = {
    padding: '14px 20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '500',
    color: '#888',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fafafa',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '14px 20px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f5f5f5',
  };

  const badgeStyle = {
    background: '#ffe4f6',
    color: '#ff4fd6',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
  };

  // 👉 ESTILO DEL BOTÓN ANULAR
  const cancelBtn = {
    background: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 500,
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (!productions || productions.length === 0) {
    return <p style={{ textAlign: 'center', padding: 40 }}>No hay producciones</p>;
  }

  return (
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
        {(productions || []).map((prod) => (
          <React.Fragment key={prod.id}>
            <tr
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={tdStyle}>{prod.orderNumber}</td>
              <td style={tdStyle}>{prod.quantity}</td>
              <td style={tdStyle}>{prod.deliveryDate}</td>
              <td style={tdStyle}>
                <span style={badgeStyle}>{prod.status}</span>
              </td>
              <td style={tdStyle}>{prod.statusDate}</td>
              <td style={tdStyle}>{prod.client}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    style={{
                      ...iconBtn,
                      color: prod.status === "Anulada" ? "#bbb" : "#ff4d4f",
                      cursor: prod.status === "Anulada" ? "not-allowed" : "pointer"
                    }}
                    disabled={prod.status === "Anulada"}
                    title="Anular orden"
                    onClick={() => onCancel && onCancel(prod.id)}
                  >
                    <MinusCircle size={16} />
                  </button>
                  <button
                    style={iconBtn}
                    onClick={() => toggleRow(prod.id)}
                    title="Expandir"
                  >
                    {expandedRow === prod.id ? '▴' : '▾'}
                  </button>
                </div>
              </td>
            </tr>
            {expandedRow === prod.id && (
              <tr>
                <td colSpan="7" style={{ background: '#f9f9f9', padding: 0 }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Ref_corte</th>
                        <th style={thStyle}>Ref</th>
                        <th style={thStyle}>Estado</th>
                        <th style={thStyle}>Fecha de estado</th>
                        <th style={thStyle}>Cantidad</th>
                        <th style={thStyle}>Color</th>
                        <th style={thStyle}></th>
                      </tr>
                    </thead><tbody>
                      {(prod.details || []).map((d, i) => (
                        <tr key={i}>
                          <td style={tdStyle}>{d.refCorte}</td>
                          <td style={tdStyle}>{d.ref}</td>
                          <td style={tdStyle}>
                            <span style={badgeStyle}>{d.status}</span>
                          </td>
                          <td style={tdStyle}>{d.statusDate}</td>
                          <td style={tdStyle}>{d.quantity}</td>
                          <td style={tdStyle}>{d.color}</td>
                          <td style={tdStyle}>
                            <button
                              style={iconBtn}
                              title="Ver detalle"
                              onClick={() => navigate(`/produccion/${prod.id}`)}
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
  );
};

const iconBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '16px',
};

export default ProductionTable;