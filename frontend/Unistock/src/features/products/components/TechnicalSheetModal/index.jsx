import React, { useEffect, useState } from 'react';
import TechnicalSheet from '../TechnicalSheet';
import VersionHistory from '../VersionHistory';
import { useTechnicalSheet } from '../../hooks/useTechnicalSheet';
import Alert from '../../../shared/components/Alert';
import { AuthAPI } from '../../../auth/services/AuthAPI';
import { useAuthContext } from '../../../shared/AuthContext';

const TechnicalSheetModal = ({ product, onClose, onTechnicalSheetChanged }) => {
  const { versions, currentVersion, loadVersions, createVersion, deleteLastVersion, editVersion } = useTechnicalSheet(product?.id);
  // ✅ Se necesita el usuario actual para validar la contraseña al eliminar
  const { user: currentUser } = useAuthContext();
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ open: false, message: "" });

  // ✅ Edición real de una versión existente — no crea una versión nueva
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editDraft, setEditDraft] = useState(null);

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
    setIsEditingMode(false);
    setEditDraft(null);
  };

  const handleStartEdit = () => {
    setEditDraft({ ...currentVersionObj });
    setIsEditingMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false);
    setEditDraft(null);
  };

  // ✅ Fix: al "editar", NUNCA se modifica la ficha existente — se guarda
  // una ficha técnica NUEVA con los datos actualizados, conservando la
  // anterior intacta. Así se puede ver el historial completo de versiones.
  const handleSaveEdit = async () => {
    if (!editDraft) return;
    try {
      setLoading(true);
      await createVersion(editDraft);
      setIsEditingMode(false);
      setEditDraft(null);
      setSelectedVersion(null); // mostrar la versión recién creada (la más nueva)
      await loadVersions();
      onTechnicalSheetChanged?.();
    } catch (error) {
      console.error("Error al guardar la nueva versión:", error);
      setErrorAlert({
        open: true,
        message: error?.message || "No se pudo guardar la ficha técnica.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (password) => {
    try {
      setLoading(true);
      // ✅ Fix: AuthAPI.verifyPassword no existe — se valida la contraseña
      // intentando un login real contra el usuario actualmente autenticado.
      const userIdentifier = currentUser?.correo || currentUser?.username || currentUser?.nombre;
      if (!userIdentifier) {
        throw new Error("No se pudo identificar al usuario actual.");
      }
      await AuthAPI.login({ username: userIdentifier, password });
      await deleteLastVersion(currentVersionObj.id);
      console.log("Versión eliminada:", currentVersionObj.id);
      setDeleteAlert({ open: false });
      if (selectedVersion?.id === currentVersionObj.id) {
        setSelectedVersion(null);
      }
      await loadVersions();
      onTechnicalSheetChanged?.();
    } catch (error) {
      console.error("Error al eliminar:", error);
      const isInvalidPassword = error?.status === 401 || /contraseñ|password|credenciales/i.test(String(error?.message || ""));
      if (isInvalidPassword) {
        setErrorAlert({
          open: true,
          message: "La contraseña no coincide con tu usuario actual.",
        });
        setDeleteAlert({ open: true, step: "password" });
        return;
      }
      setErrorAlert({
        open: true,
        message: error?.message || "No se pudo eliminar la versión.",
      });
      setDeleteAlert({ open: false });
    } finally {
      setLoading(false);
    }
  };

  const isLastVersion = versions.length > 0 && versions[0]?.id === currentVersionObj?.id;

  return (
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
        }} onClick={isEditingMode ? undefined : onClose} />

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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            borderBottom: '1px solid #eee'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              {isEditingMode ? '✏️ Nueva versión de la ficha técnica' : 'Ficha Técnica'}
            </h2>

            {/* Selector de versiones — oculto mientras se edita */}
            {!isEditingMode && versions.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Fecha versión {(() => {
                    const raw = currentVersionObj?.date;
                    if (!raw) return '—';
                    const str = String(raw);
                    let parsed;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                      const [y, m, d] = str.split('-').map(Number);
                      parsed = new Date(y, m - 1, d);
                    } else {
                      parsed = new Date(raw);
                    }
                    const safe = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
                    return safe.toLocaleDateString('es-CO');
                  })()}
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

                  {/* ✅ Fix: se restaura el componente VersionHistory original
                      (botón para ver TODO el historial de versiones, con su
                      eliminación de última versión integrada) — había sido
                      reemplazado por un dropdown personalizado más limitado. */}
                  {showVersions && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 5 }}
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
                          minWidth: '180px',
                          overflow: 'hidden',
                        }}
                      >
                        <VersionHistory
                          versions={versions}
                          currentVersion={currentVersionObj?.version}
                          onViewVersion={handleViewVersion}
                          onDeleteLast={(versionId) => {
                            setShowVersions(false);
                            setDeleteAlert({ open: true, step: "password" });
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contenido de la ficha técnica */}
          <div style={{ padding: '24px 32px' }}>
            <TechnicalSheet
              sheet={isEditingMode ? (editDraft || {}) : currentVersionObj}
              isEditing={isEditingMode}
              onChange={isEditingMode ? setEditDraft : undefined}
            />
          </div>

          {/* Botones */}
          <div style={{
            padding: '20px 32px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            {isEditingMode ? (
              <>
                <button style={styles.closeBtn} onClick={handleCancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button style={styles.saveBtn} onClick={handleSaveEdit} disabled={loading}>
                  {loading ? 'Guardando...' : '💾 Guardar como nueva versión'}
                </button>
              </>
            ) : (
              <>
                {/* ✅ "Editar" no modifica la ficha existente: guarda una ficha
                    NUEVA con los datos actualizados, preservando el historial */}
                <button style={styles.editBtn} onClick={handleStartEdit} disabled={loading}>
                  ✏️ Editar ficha
                </button>

                {/* Eliminar: solo cuando hay más de una versión y estás en la última */}
                {isLastVersion && versions.length > 1 && (
                  <button
                    style={styles.deleteBtn}
                    onClick={() =>
                      setDeleteAlert({
                        open: true,
                        step: "password",
                      })
                    }
                    disabled={loading}
                  >
                    {loading ? 'Eliminando...' : 'Eliminar versión'}
                  </button>
                )}

                <button style={styles.closeBtn} onClick={onClose}>
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ALERTAS */}
      <Alert
        isOpen={deleteAlert.open && deleteAlert.step === "password"}
        type="password"
        message="Ingresa la contraseña para eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteAlert({ open: false })}
      />

      <Alert
        isOpen={errorAlert.open}
        type="error"
        title="Error"
        message={errorAlert.message}
        onConfirm={() => setErrorAlert({ open: false, message: "" })}
        onCancel={() => setErrorAlert({ open: false, message: "" })}
      />
    </>
  );
};

// 🔥 ESTILOS
const styles = {
  editBtn: {
    padding: '10px 24px',
    backgroundColor: '#fff',
    border: '1px solid #ff4fd6',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ff4fd6',
    fontWeight: 700,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 32px',
    backgroundColor: '#ff4fd6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
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
