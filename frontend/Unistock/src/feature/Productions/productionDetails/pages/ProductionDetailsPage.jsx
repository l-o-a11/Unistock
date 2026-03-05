import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductionAPI } from '../../services/ProductionAPI';

const steps = [
  'Diseño',
  'Ficha Técnica',
  'Corte',
  'Compras',
  'Producción',
  'Recepción',
  'Entregado'
];

const ProductionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ProductionAPI.getById(Number(id));
        setProduction(data);
      } catch (err) {
        setError(err.message || 'Error al obtener detalles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!production) return <p>No se encontró la orden de producción</p>;

  const currentStepIndex = steps.indexOf(production.status);
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);
  const nextStepIndex = currentStepIndex + 1;
  const nextStep = nextStepIndex < steps.length ? steps[nextStepIndex] : 'Completado';

  const handlePreviousStep = () => {
    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
    if (!prevStep) return;
    const ok = window.confirm(`¿Cambiar estado a "${prevStep}"?`);
    if (ok) {
      // Aquí llamarías a updateProduction
      console.log('Cambiar a paso anterior:', prevStep);
    }
  };

  const handleNextStep = () => {
    const nextStepName = nextStepIndex < steps.length ? steps[nextStepIndex] : null;
    if (!nextStepName) return;
    const ok = window.confirm(`¿Cambiar estado a "${nextStepName}"?`);
    if (ok) {
      // Aquí llamarías a updateProduction
      console.log('Cambiar al siguiente paso:', nextStepName);
    }
  };

  return (
    <div style={container}>
      {/* Botón volver */}
      <button
        onClick={() => navigate('/Layout/produccion')}
        style={{
          marginBottom: 16,
          padding: '8px 16px',
          background: '#f3f4f6',
          border: '1px solid #ddd',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        ← Volver a Producciones
      </button>

      {/* Header */}
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>Orden #{production.orderNumber}</h2>
          <span style={{ ...badge, background: production.status === 'Entregado' ? '#d1fae5' : '#fbcfe8', color: production.status === 'Entregado' ? '#065f46' : '#be185d' }}>
            {production.status}
          </span>
        </div>
        <button
          style={saveBtn}
          onClick={() => {
            const ok = window.confirm('¿Deseas guardar los cambios realizados en esta orden de producción?');
            if (ok) {
              console.log('Guardando cambios de la orden:', production.orderNumber);
              alert('Cambios guardados exitosamente');
            }
          }}
        >
          Guardar cambios
        </button>
      </div>

      {/* Barra progreso general */}
      <div style={card}>
        <div style={progressHeader}>
          <span>Proceso general de la producción</span>
          <span>{progressPercent}%</span>
        </div>
        <div style={progressBar}>
          <div style={{ ...progressFill, width: `${progressPercent}%` }} />
        </div>
        <small>Siguiente etapa: {nextStep}</small>
      </div>

      {/* Steps */}
      <div style={card}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          {/* Líneas de conexión */}
          {steps.map((step, i) => {
            if (i === steps.length - 1) return null;
            const isConnectorComplete = i < currentStepIndex;
            return (
              <div
                key={`line-${i}`}
                style={{
                  position: 'absolute',
                  top: 12,
                  left: `calc(${(i + 0.5) * (100 / steps.length)}%)`,
                  right: `calc(${(steps.length - i - 1.5) * (100 / steps.length)}%)`,
                  height: 2,
                  background: isConnectorComplete ? '#10b981' : '#e5e7eb',
                  zIndex: 0
                }}
              />
            );
          })}

          {/* Pasos */}
          {steps.map((step, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            let bgColor = '#e5e7eb';
            let textColor = '#999';
            if (isCurrent) {
              bgColor = '#ec4899';
              textColor = '#fff';
            } else if (isCompleted) {
              bgColor = '#10b981';
              textColor = '#fff';
            }
            return (
              <div key={i} style={{ ...stepItem, position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    ...stepCircle,
                    background: bgColor,
                    color: textColor
                  }}
                >
                  {isCompleted ? '✓' : (isCurrent ? '●' : '')}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: isCurrent ? '#ec4899' : textColor
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div style={processBox}>
          <strong>{production.status}</strong>
          <p style={{ margin: '4px 0', fontSize: 13 }}>
            Última actualización: {production.statusDate}
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={secondaryBtn}
              disabled={currentStepIndex === 0}
              onClick={handlePreviousStep}
            >
              Anterior
            </button>
            <button
              style={primaryBtn}
              disabled={currentStepIndex === steps.length - 1}
              onClick={handleNextStep}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Grid inferior */}
      <div style={grid}>
        {/* Referencias */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Referencia</h3>
            <button
              onClick={() => {
                const ok = window.confirm('¿Deseas agregar una nueva referencia?');
                if (ok) {
                  console.log('Agregar nueva referencia');
                  alert('Funcionalidad de agregar referencia en desarrollo');
                }
              }}
              style={{
                padding: '6px 12px',
                background: '#ec4899',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500
              }}
            >
              + Agregar referencia
            </button>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={th}>Número</th>
                <th style={th}>Código</th>
                <th style={th}>Cantidad</th>
                <th style={th}>Color</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {production.details?.map((d, i) => (
                <tr key={i}>
                  <td style={td}>{d.refCorte}</td>
                  <td style={td}>{d.ref}</td>
                  <td style={td}>{d.quantity}</td>
                  <td style={td}>{d.color}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => {
                          const ok = window.confirm(`¿Deseas editar la referencia ${d.ref}?`);
                          if (ok) {
                            console.log('Editar referencia:', d.ref);
                            alert('Funcionalidad de editar en desarrollo');
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          const ok = window.confirm(`¿Deseas anular la referencia ${d.ref}?`);
                          if (ok) {
                            console.log('Anular referencia:', d.ref);
                            alert('Referencia anulada');
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Anular
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Historial */}
        <div style={card}>
          <h3>Historial</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={th}>Estado</th>
                <th style={th}>Fecha</th>
                <th style={th}>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {production.history?.map((h, i) => (
                <tr key={i}>
                  <td style={td}>{h.status}</td>
                  <td style={td}>{h.date}</td>
                  <td style={td}>{h.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ficha técnica */}
      <div style={card}>
        <div style={techHeader}>
          <h3>Ficha técnica y costos</h3>
          <span style={completedBadge}>{production.techSpecification?.completed ? 'Completado' : 'Pendiente'}</span>
        </div>

        <div style={techRow}>
          <span>{production.techSpecification?.name || 'N/A'}</span>
          <span>Versión {production.techSpecification?.version || '1.0'}</span>
        </div>

        <div style={costBox}>
          Costo final por unidad: ${production.techSpecification?.costPerUnit?.toLocaleString('es-CO') || 'N/A'}. Costo total del pedido: ${production.techSpecification?.totalCost?.toLocaleString('es-CO') || 'N/A'}
        </div>
      </div>
    </div>
  );
};

/* ESTILOS */

const container = {
  padding: 24,
  fontFamily: 'sans-serif',
  background: '#f3f4f6'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16
};

const badge = {
  background: '#fbcfe8',
  color: '#be185d',
  padding: '4px 10px',
  borderRadius: 12,
  fontSize: 12,
  marginLeft: 10
};

const saveBtn = {
  background: '#ec4899',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer'
};

const card = {
  background: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
};

const progressHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 8
};

const progressBar = {
  height: 8,
  background: '#fce7f3',
  borderRadius: 8,
  overflow: 'hidden',
  marginBottom: 6
};

const progressFill = {
  height: '100%',
  background: '#ec4899'
};

const stepsContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 16
};

const stepItem = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1
};

const stepCircle = {
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 4,
  fontSize: 12
};

const processBox = {
  background: '#fce7f3',
  padding: 16,
  borderRadius: 10
};

const primaryBtn = {
  background: '#ec4899',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer'
};

const secondaryBtn = {
  background: '#f3f4f6',
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16
};

const th = {
  textAlign: 'left',
  fontSize: 13,
  paddingBottom: 6,
  color: '#6b7280'
};

const td = {
  padding: '6px 0',
  fontSize: 14
};

const techHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const completedBadge = {
  background: '#d1fae5',
  color: '#065f46',
  padding: '4px 10px',
  borderRadius: 10,
  fontSize: 12
};

const techRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 10,
  fontSize: 14
};

const costBox = {
  marginTop: 12,
  background: '#dbeafe',
  padding: 10,
  borderRadius: 8,
  fontSize: 13
};

export default ProductionDetailsPage;