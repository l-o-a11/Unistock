import React, { useState, useCallback, useEffect, useRef } from 'react';
import Alert from '../../../shared/components/Alert';
import Button from '../../../shared/components/Button';
import { validators } from '../../../shared/utils/validators';
import { blockInput } from '../../../shared/utils/blockInput';
import { EmployeeDocumentTypes } from '../../types/constantsEmployees';
import {
    getInputStyleBox,
    errorStyle as errMsg,
    labelStyle,
    requiredStar,
} from '../../../shared/utils/validationStyles';

const sectionTitle = (t) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 10px' }}>{t}</p>
);

const EmployeeForm = ({ employee, roles, sedes, onSubmit, onCancel }) => {
    const modalRef = useRef(null);

    const [formData, setFormData] = useState(() => employee ?? {
        documentType: '', documentNumber: '', name: '', email: '', role: '', sede: '',
    });
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });

    const closeAlert = useCallback(() => setAlertConfig((p) => ({ ...p, open: false })), []);

    const handleCancelClick = useCallback(() => {
        const blank = !formData.documentType && !formData.documentNumber && !formData.name && !formData.email && !formData.role && !formData.sede;
        if (blank) { onCancel(); return; }
        setAlertConfig({
            open: true, type: 'confirm', title: 'Cancelar',
            message: '¿Seguro que deseas cancelar? Se perderán los cambios.',
            onConfirm: () => { setAlertConfig((p) => ({ ...p, open: false })); onCancel(); },
        });
    }, [onCancel, formData]);

    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape') handleCancelClick(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [handleCancelClick]);

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) handleCancelClick();
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'documentType': error = validators.required(value); break;
            case 'documentNumber':
                error = validators.required(value)
                    || (value && value.toString().trim().length < 10 ? 'Mínimo 10 dígitos' : '');
                break;
            case 'name':
                error = validators.required(value)
                    || (value && value.trim().length < 3 ? 'Mínimo 3 caracteres' : '');
                break;
            case 'email': error = validators.required(value) || validators.email(value); break;
            case 'role': error = validators.required(value); break;
            case 'sede': error = validators.required(value); break;
        }
        setErrors((p) => ({ ...p, [name]: error }));
        return error;
    };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(formData).forEach(([k, v]) => { const e = validateField(k, v); if (e) newErrors[k] = e; });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (errors[name] !== undefined) validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) {
            setAlertConfig({ open: true, type: 'warning', title: 'Campos incompletos', message: 'Corrige los campos marcados antes de continuar.', onConfirm: null });
            return;
        }
        try {
            setSending(true);
            await onSubmit(formData);
            setAlertConfig({
                open: true, type: 'success',
                title: employee ? 'Empleado actualizado' : 'Empleado creado',
                message: employee
                    ? 'El empleado fue actualizado correctamente.'
                    : `Empleado creado. Se envió un correo a ${formData.email} con las credenciales de acceso.`,
                onConfirm: null,
            });
        } catch (err) {
            setAlertConfig({
                open: true, type: 'error', title: 'Error al guardar',
                message: err?.message || err?.data?.message || 'No se pudo guardar el empleado. Intenta nuevamente.',
                onConfirm: null,
            });
        } finally { setSending(false); }
    };

    return (
        <>
            <Alert
                isOpen={alertConfig.open} type={alertConfig.type}
                title={alertConfig.title} message={alertConfig.message}
                onConfirm={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else closeAlert(); }}
                onCancel={() => { closeAlert(); if (alertConfig.type === 'success') onCancel(); }}
            />

            <div onClick={handleOverlayClick} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                <div ref={modalRef} style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', position: 'relative' }}>

                    <div style={{ padding: '28px 30px' }}>
                        <button onClick={handleCancelClick} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 14, zIndex: 1 }}>✕</button>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ff4fd6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                </svg>
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1f2937' }}>
                                    {employee ? 'Editar empleado' : 'Nuevo empleado'}
                                </h2>
                                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Completa todos los campos obligatorios</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            {sectionTitle('Datos personales')}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={labelStyle}>Tipo de documento <span style={requiredStar}>*</span></label>
                                    <select
                                        name="documentType" value={formData.documentType} onChange={handleChange}
                                        onBlur={(e) => validateField('documentType', e.target.value)}
                                        style={getInputStyleBox(errors.documentType)}
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        {EmployeeDocumentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    {errors.documentType && <span style={errMsg}>⚠ {errors.documentType}</span>}
                                </div>

                                <div>
                                    <label style={labelStyle}>Número de documento <span style={requiredStar}>*</span></label>
                                    <input
                                        type="text" inputMode="numeric" name="documentNumber"
                                        value={formData.documentNumber}
                                        onChange={(e) => { if (!blockInput.onlyNumbers(e)) return; handleChange(e); }}
                                        onBlur={(e) => validateField('documentNumber', e.target.value)}
                                        placeholder="Ej: 1234567890"
                                        style={getInputStyleBox(errors.documentNumber)}
                                    />
                                    {errors.documentNumber && <span style={errMsg}>⚠ {errors.documentNumber}</span>}
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Nombre completo <span style={requiredStar}>*</span></label>
                                <input
                                    name="name" value={formData.name}
                                    onChange={(e) => { if (!blockInput.onlyLetters(e)) return; handleChange(e); }}
                                    onBlur={(e) => validateField('name', e.target.value)}
                                    placeholder="Ej: Carlos Ramírez"
                                    style={getInputStyleBox(errors.name)}
                                />
                                {errors.name && <span style={errMsg}>⚠ {errors.name}</span>}
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Correo electrónico <span style={requiredStar}>*</span></label>
                                <input
                                    type="email" name="email" value={formData.email}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField('email', e.target.value)}
                                    placeholder="Ej: carlos@empresa.com"
                                    style={getInputStyleBox(errors.email)}
                                />
                                {errors.email && <span style={errMsg}>⚠ {errors.email}</span>}
                            </div>

                            {sectionTitle('Acceso y ubicación')}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={labelStyle}>Rol <span style={requiredStar}>*</span></label>
                                    <select
                                        name="role" value={formData.role} onChange={handleChange}
                                        onBlur={(e) => validateField('role', e.target.value)}
                                        style={getInputStyleBox(errors.role)}
                                    >
                                        <option value="">Seleccionar rol...</option>
                                        {roles?.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                    </select>
                                    {errors.role && <span style={errMsg}>⚠ {errors.role}</span>}
                                </div>

                                <div>
                                    <label style={labelStyle}>Sede <span style={requiredStar}>*</span></label>
                                    <select
                                        name="sede" value={formData.sede} onChange={handleChange}
                                        onBlur={(e) => validateField('sede', e.target.value)}
                                        style={getInputStyleBox(errors.sede)}
                                    >
                                        <option value="">Seleccionar sede...</option>
                                        {sedes?.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                    </select>
                                    {errors.sede && <span style={errMsg}>⚠ {errors.sede}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4, borderTop: '1px solid #f3f4f6', marginTop: 8 }}>
                                <Button type="button" variant="secondary" onClick={handleCancelClick}>Cancelar</Button>
                                <Button type="submit" variant="primary" disabled={sending}>
                                    {sending ? 'Guardando...' : employee ? 'Guardar cambios' : 'Crear empleado'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmployeeForm;