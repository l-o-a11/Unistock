/**
 * @file useSedeScope.js
 * @description Determina si el usuario logueado debe ver TODO (Gerente) o
 * solo los datos de su propia sede (cualquier otro rol, ej. "Administrador
 * de sede"). Se usa en los módulos que tienen relación con sedes:
 * Empleados, Producción y Compras. Usuarios queda excluido a propósito
 * (es exclusivo de Gerente — ver AuthContext.canAccess).
 *
 * USO:
 *   const { isGerente, sedeId } = useSedeScope();
 *   const visibles = isGerente ? empleados : empleados.filter(e => String(e.sedeId) === String(sedeId));
 */
import { useAuthContext } from '../AuthContext';

export const useSedeScope = () => {
    const { user } = useAuthContext();
    const rolNombre = (user?.rolNombre ?? '').toString().toLowerCase();
    const isGerente = rolNombre === 'gerente';
    const sedeId = user?.sedeId ?? null;
    return { isGerente, sedeId, user };
};

export const isVisibleBySede = (record, isGerente, sedeId) => {
    if (isGerente) return true;
    if (!record) return false;
    const recordSedeId = record.sedeId ?? record.sede ?? null;
    return !recordSedeId || String(recordSedeId) === String(sedeId);
};