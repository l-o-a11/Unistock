import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useTechnicalSheet } from '../hooks/useTechnicalSheet';
import TechnicalSheet from '../components/TechnicalSheet';

const TechnicalSheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { versions, currentVersion, loadVersions, deleteLastVersion } = useTechnicalSheet(id);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  
  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (id) {
      loadVersions();
    }
  }, [id]);

  const handleViewVersion = (version) => {
    setSelectedVersion(version);
    setShowVersions(false);
  };

  const handleDeleteVersion = async (versionId) => {
    if (window.confirm('¿Estás seguro de eliminar esta versión?')) {
      try {
        await deleteLastVersion(versionId);
        if (selectedVersion?.id === versionId) {
          setSelectedVersion(null);
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (!product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <button
          onClick={() => navigate('/productos')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff4fd6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Volver a productos
        </button>
      </div>
    );
  }

  const currentVersionObj = selectedVersion || currentVersion || versions[0] || product.technicalSheet;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '32px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '32px',
        position: 'relative'
      }}>
        {/* Header: Título a la izquierda, Fecha y Versiones a la derecha */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #eee',
          paddingBottom: '16px'
        }}>
          {/* Título a la izquierda */}
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#333',
            margin: 0
          }}>
            Ficha Técnica
          </h1>

          {/* Fecha y selector de versiones a la derecha */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Fecha */}
            <div style={{ fontSize: '14px', color: '#666' }}>
              Fecha versión {new Date(currentVersionObj?.date || product.technicalSheet?.date || '2026-02-16').toLocaleDateString('es-CO')}
            </div>

            {/* Selector de versiones (acordeón) */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowVersions(!showVersions)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: '#fdf0f7',
                  border: '1px solid #ff4fd6'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#ff4fd6' }}>
                  Versión {currentVersionObj?.version || 1}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E91E8C"
                  strokeWidth="2"
                  style={{
                    transform: showVersions ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Lista desplegable de versiones */}
              {showVersions && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 5
                    }}
                    onClick={() => setShowVersions(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      minWidth: '180px'
                    }}
                  >
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        onClick={() => handleViewVersion(version)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          backgroundColor: version.id === currentVersionObj?.id ? '#fdf0f7' : 'transparent',
                          color: version.id === currentVersionObj?.id ? '#ff4fd6' : '#333',
                          borderBottom: '1px solid #f0f0f0',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                          if (version.id !== currentVersionObj?.id) {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (version.id !== currentVersionObj?.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        Versión {version.version}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ficha Técnica */}
        <TechnicalSheet
          sheet={currentVersionObj}
          isEditing={false}
        />

        {/* Botones Cerrar y Eliminar */}
        <div style={{ 
          marginTop: '32px', 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid #eee',
          paddingTop: '24px'
        }}>
          <button
            onClick={() => navigate('/productos')}
            style={{
              padding: '10px 32px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#555',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>

          {/* Eliminar - Solo para la última versión */}
          {versions.length > 0 && versions[0]?.id === currentVersionObj?.id && (
            <button
              onClick={() => handleDeleteVersion(currentVersionObj.id)}
              style={{
                padding: '10px 32px',
                backgroundColor: '#ff4fd6',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalSheetPage;