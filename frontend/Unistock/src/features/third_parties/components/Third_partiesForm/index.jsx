/**
 * @file Third_partiesForm/index.jsx
 * @description Formulario modal para crear o editar un tercero.
 * CAMBIOS: mejoras responsive — padding adaptativo, grid 1 col en móvil,
 *          modal con max-height y scroll, botones full-width en móvil.
 */
import React, { useState, useEffect, useRef } from 'react';
import Alert from '../../../shared/components/Alert';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { validators } from '../../../shared/utils/validators';
import { blockInput } from '../../../shared/utils/blockInput';

const Third_partieForm = ({ Third_partie, onSubmit, onCancel }) => {
  const isEdit = Boolean(Third_partie);

  const [formData, setFormData] = useState({
    nombre: '', nit: '', direccion: '',
    telefono: '', contacto: '', correo: '',
  });
  const [errors,       setErrors]       = useState({});
  const [pendingClose, setPendingClose] = useState(false);
  const [alertConfig,  setAlertConfig]  = useState({
    open: false, type: 'success', title: '', message: '', onConfirm: null,
  });
  const modalRef = useRef(null);

  useEffect(() => {
    if (Third_partie) {
      setFormData({
        nombre:    Third_partie.nombreEmpresa || Third_partie.nombre    || '',
        nit:       Third_partie.nit       || '',
        direccion: Third_partie.direccion || '',
        telefono:  Third_partie.telefono  || '',
        contacto:  Third_partie.nombreContacto || Third_partie.contacto || '',
        correo:    Third_partie.correo    || Third_partie.email || '',
      });
    }
  }, [Third_partie]);

  useEffect(() => {
    if (pendingClose && !alertConfig.open) { setPendingClose(false); onCancel(); }
  }, [alertConfig.open, pendingClose]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') handleCancelClick(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'nombre':    error = validators.required(value); break;
      case 'direccion': error = validators.required(value); break;
      case 'contacto':  error = validators.required(value); break;
      case 'telefono':  error = validators.required(value) || validators.phone(value); break;
      case 'nit':       if (value) error = validators.nit(value); break;
      case 'correo':    if (value) error = validators.email(value); break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono' && !blockInput.onlyNumbers(e)) return;
    if (name === 'nit'      && !blockInput.nit(e))         return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const validateAll = () => {
    const required  = ['nombre', 'direccion', 'telefono', 'contacto'];
    const newErrors = {};
    required.forEach(k => {
      const e = validateField(k, formData[k]);
      if (e) newErrors[k] = e;
    });
    if (formData.nit)    { const e = validateField('nit',    formData.nit);    if (e) newErrors.nit    = e; }
    if (formData.correo) { const e = validateField('correo', formData.correo); if (e) newErrors.correo = e; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setAlertConfig({ open: true, type: 'warning', title: 'Campos incompletos', message: 'Corrige los campos marcados antes de continuar.', onConfirm: null });
      return;
    }
    try {
      Promise.resolve(onSubmit({
        nombreEmpresa:  formData.nombre,
        nombre:         formData.nombre,
        nit:            formData.nit,
        direccion:      formData.direccion,
        telefono:       formData.telefono,
        nombreContacto: formData.contacto,
        contacto:       formData.contacto,
        correo:         formData.correo,
        email:          formData.correo,
      })).then(() => {
        setPendingClose(true);
        setAlertConfig({
          open: true, type: 'success',
          title:   isEdit ? 'Tercero actualizado' : 'Tercero creado',
          message: isEdit ? 'El tercero fue actualizado correctamente.' : 'El tercero fue creado correctamente.',
          onConfirm: null,
        });
      }).catch((err) => {
        const message = err?.message || 'No se pudo guardar. Intenta de nuevo.';
        setAlertConfig({ open: true, type: 'error', title: 'Error al guardar', message, onConfirm: null });
      });
    } catch (err) {
      const message = err?.message || 'No se pudo guardar. Intenta de nuevo.';
      setAlertConfig({ open: true, type: 'error', title: 'Error al guardar', message, onConfirm: null });
    }
  };

  const handleCancelClick = () => {
    // ✅ Solo mostrar alerta de confirmación si el formulario tiene algún campo llenado
    const INITIAL_VALUES = { nombre: '', nit: '', direccion: '', telefono: '', contacto: '', correo: '' };
    const initialData = isEdit
      ? {
          nombre:    Third_partie?.nombreEmpresa || Third_partie?.nombre    || '',
          nit:       Third_partie?.nit       || '',
          direccion: Third_partie?.direccion || '',
          telefono:  Third_partie?.telefono  || '',
          contacto:  Third_partie?.nombreContacto || Third_partie?.contacto || '',
          correo:    Third_partie?.correo    || Third_partie?.email || '',
        }
      : INITIAL_VALUES;

    const hasChanges = Object.keys(formData).some(k => formData[k] !== initialData[k]);

    if (!hasChanges) {
      // Sin cambios — cerrar directamente sin alerta
      onCancel();
      return;
    }

    setAlertConfig({
      open: true, type: 'confirm', title: 'Cancelar',
      message: '¿Seguro que deseas cancelar? Se perderán los cambios.',
      onConfirm: () => { setAlertConfig(prev => ({ ...prev, open: false })); onCancel(); },
    });
  };

  return (
    <>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else setAlertConfig(prev => ({ ...prev, open: false })); }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false }))}
      />

      <style>{`
        /* ── Overlay ── */
        .tp-form-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; justify-content: center; align-items: center;
          z-index: 50;
          padding: 16px;
          /* En móvil muy pequeño, alinear al fondo para más espacio */
        }
        @media (max-width: 480px) {
          .tp-form-overlay { align-items: flex-end; padding: 0; }
        }

        /* ── Modal ── */
        .tp-form-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 860px;
          padding: 20px 18px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.18);
          position: relative;
          max-height: 92vh;
          overflow-y: auto;
        }
        @media (max-width: 480px) {
          .tp-form-modal {
            border-radius: 20px 20px 0 0;
            max-height: 92vh;
            padding: 20px 16px 32px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .tp-form-modal { padding: 22px 20px; }
        }
        @media (min-width: 768px) {
          .tp-form-modal { padding: 28px 32px; }
        }

        /* Drag handle en móvil */
        .tp-form-handle {
          width: 40px; height: 4px;
          background: #e5e7eb; border-radius: 99px;
          margin: 0 auto 16px;
          display: none;
        }
        @media (max-width: 480px) { .tp-form-handle { display: block; } }

        /* ── Grid campos: 1 col en móvil, 2 en ≥ 600px ── */
        .tp-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 600px) {
          .tp-form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px 28px;
          }
        }

        /* Columna izquierda: borde derecho solo en desktop */
        .tp-form-col-left {
          display: flex; flex-direction: column; gap: 16px;
        }
        @media (min-width: 600px) {
          .tp-form-col-left {
            border-right: 1px solid #f0f0f0;
            padding-right: 24px;
          }
        }

        /* ── Botones: full width en móvil pequeño ── */
        .tp-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        @media (max-width: 400px) {
          .tp-form-actions { flex-direction: column-reverse; }
          .tp-form-actions > * { width: 100%; }
        }
      `}</style>

      <div className="tp-form-overlay" onClick={handleOverlayClick}>
        <div ref={modalRef} className="tp-form-modal">

          {/* Handle visual para móvil */}
          <div className="tp-form-handle" />

          {/* Botón cerrar ✕ */}
          <button
            onClick={handleCancelClick}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 30, height: 30, borderRadius: '50%',
              border: 'none', background: '#f3f4f6',
              cursor: 'pointer', fontSize: 14,
            }}>
            ✕
          </button>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1f2937' }}>
              {isEdit ? 'Editar tercero' : 'Nuevo tercero'}
            </h2>
            {isEdit && (
              <span style={{
                display: 'inline-block', marginTop: 6,
                fontSize: 12, fontWeight: 700, color: '#FF4FD6',
                background: '#fce7f3', padding: '2px 10px', borderRadius: 20,
              }}>
                NIT: {Third_partie.nit || 'Sin NIT'}
              </span>
            )}
            {!isEdit && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>
                El NIT identifica al tercero en listados y asignaciones.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="tp-form-grid">

              {/* ── Columna izquierda ── */}
              <div className="tp-form-col-left">
                <Input
                  label="Nombre empresa *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombre}
                />
                <Input
                  label="NIT (opcional)"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nit}
                />
                <Input
                  label="Dirección *"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.direccion}
                />
              </div>

              {/* ── Columna derecha ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Contacto principal *"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.contacto}
                />
                <Input
                  label="Teléfono * (10 dígitos)"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                />
                <Input
                  label="Correo (opcional)"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correo}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="tp-form-actions">
              <Button type="button" variant="secondary" onClick={handleCancelClick}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {isEdit ? 'Guardar cambios' : 'Crear tercero'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Third_partieForm;
