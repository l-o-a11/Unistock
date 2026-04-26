import React, { useEffect, useState } from 'react';
import TechnicalSheet from '../TechnicalSheet';
import { useTechnicalSheet } from '../../hooks/useTechnicalSheet';
import Alert from '../Alert';

const TechnicalSheetModal = ({ product, onClose }) => {
  const { versions, currentVersion, loadVersions, deleteLastVersion } = useTechnicalSheet(product?.id);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 🔥 IGUAL A TERCEROS: estado para alerta de eliminación
  const [deleteAlert, setDeleteAlert] = useState({
    open: false,
    step: "confirm",
  });

  useEffect(() => {
    if (product?.id) {
      loadVersions();
    }
  }, [product?.id]);

  if (!product) return null;

  const currentVersionObj = selectedVersion || currentVersion || versions[0] || product.technicalSheet;

  const handleViewVersion = (version) => {
    setSelectedVersion(version);
    setShowVersions(false);
  };

  // 🔥 IGUAL A TERCEROS: función final de eliminar versión
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteLastVersion(currentVersionObj.id);
      console.log("Versión eliminada:", currentVersionObj.id);
      setDeleteAlert({ open: false });
      if (selectedVersion?.id === currentVersionObj.id) {
        setSelectedVersion(null);
      }
      await loadVersions();
    } catch (error) {
      console.error("Error al eliminar:", error);
      setDeleteAlert({ open: false });
    } finally {
      setLoading(false);
    }
  };

  const isLastVersion = versions.length > 0 && versions[0]?.id === currentVersionObj?.id;

  return (

      <style>{`
        .form-root { padding: 16px; }
        @media (min-width: 640px)  { .form-root { padding: 20px 24px; } }
        @media (min-width: 1024px) { .form-root { padding: 24px 32px; } }
        .form-grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px)  { .form-grid-2 { grid-template-columns: 1fr 1fr; } }
        .form-grid-3 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px)  { .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>
      <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'auto',
          zIndex: 1001
        }} onClick={onClose} />
        
        {/* Contenedor del modal */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          zIndex: 1002,
          pointerEvents: 'auto'
        }}>
          {/* Header del modal */}
          <div className="form-root">
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Ficha Técnica</h2>
            
            {/* Selector de versiones */}
            {versions.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Fecha versión {new Date(currentVersionObj?.date || new Date()).toLocaleDateString('es-CO')}
                </div>
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
                      stroke="#FF4FD6"
                      strokeWidth="2"
                      style={{
                        transform: showVersions ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

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
                          >
                            Versión {version.version}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contenido de la ficha técnica */}
          <div className="form-root">
            <TechnicalSheet
              sheet={currentVersionObj}
              isEditing={false}
            />
          </div>

          {/* Botones - IGUAL A TERCEROS */}
          <div style={{
            padding: '20px 32px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            {/* Botón Eliminar - Solo para la última versión */}
            {isLastVersion && versions.length === 1 && (
              <button
                style={styles.deleteBtn}
                onClick={() =>
                  setDeleteAlert({
                    open: true,
                    step: "confirm",
                  })
                }
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar versión'}
              </button>
            )}
            
            <button
              style={styles.closeBtn}
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 ALERTAS - IGUAL A TERCEROS */}

      {/* ALERTA CONFIRMAR */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "confirm"}
        type="confirm"
        message="¿Seguro que deseas eliminar esta versión?"
        onConfirm={() =>
          setDeleteAlert({ open: true, step: "password" })
        }
        onCancel={() => setDeleteAlert({ open: false })}
      />

      {/* ALERTA PASSWORD */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "password"}
        type="password"
        message="Ingresa la contraseña para eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteAlert({ open: false })}
      />
    </>
  );
};

// 🔥 ESTILOS - IGUAL A TERCEROS
const styles = {
  deleteBtn: {
    padding: '10px 32px',
    backgroundColor: '#ff4fd6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff',
    cursor: 'pointer',
  },
  closeBtn: {
    padding: '10px 32px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer'
  }
};

export default TechnicalSheetModal;