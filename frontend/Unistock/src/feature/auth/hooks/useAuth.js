import { useState } from 'react';
import { AUTH_MODALS } from '../types/constants';
import { AuthAPI } from '../services/AuthAPI';

export const useAuth = () => {
    const [activeModal, setActiveModal] = useState(AUTH_MODALS.NONE);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const openModal = (modal) => {
        setError('');
        setActiveModal(modal);
    };

    const closeModal = () => {
        setError('');
        setActiveModal(AUTH_MODALS.NONE);
    };

    const handleLogin = async (username, password) => {
        setLoading(true);
        setError('');
        try {
            const data = await AuthAPI.login({ username, password });
            // Guardar token, redirigir, etc.
            console.log('Login exitoso:', data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async (email) => {
        setLoading(true);
        setError('');
        try {
            await AuthAPI.sendRecoveryCode(email);
            setRecoveryEmail(email);
            setActiveModal(AUTH_MODALS.VERIFY_CODE);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (code) => {
        setLoading(true);
        setError('');
        try {
            await AuthAPI.verifyCode(recoveryEmail, code);
            setActiveModal(AUTH_MODALS.CHANGE_PASSWORD);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (code, newPassword) => {
        setLoading(true);
        setError('');
        try {
            await AuthAPI.changePassword(recoveryEmail, code, newPassword);
            closeModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        activeModal,
        recoveryEmail,
        loading,
        error,
        openModal,
        closeModal,
        handleLogin,
        handleSendCode,
        handleVerifyCode,
        handleChangePassword,
    };
};