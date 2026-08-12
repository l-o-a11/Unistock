/**
 * @file useSedeScope.js
 * @description Determina si el usuario logueado debe ver TODO (Gerente),
 * solo los datos de su propia sede (rol "Administrador"), o solo lo suyo
 * (cualquier otro rol — empleado). Se usa en los módulos que tienen
 * relación con sedes: Empleados, Producción y Compras. Usuarios queda
 * excluido a propósito (es exclusivo de Gerente — ver AuthContext.canAccess).
 *
 * USO:
 *   const { isGerente, isAdministrador, sedeId, rolNombre } = useSedeScope();
 *   const visibles = isGerente ? empleados : empleados.filter(e => String(e.sedeId) === String(sedeId));
 *
 *   // o con el helper para registros que pueden no tener sede (ej. compras viejas):
 *   const visibles = compras.filter((c) => isVisibleBySede(c, isGerente, sedeId));
 */
import { useAuthContext } from '../AuthContext';

export const useSedeScope = () => {
    const { user } = useAuthContext();
    const rolNombre = (user?.rolNombre ?? '').toString().toLowerCase();
    const isGerente = rolNombre === 'gerente';
    const isAdministrador = rolNombre === 'administrador';
    const isEmpleado = rolNombre === 'empleado';
    const sedeId = user?.sedeId ?? null;
    return { isGerente, isAdministrador, isEmpleado, rolNombre, sedeId, user };
};

/**
 * Helper para filtrar un registro (ej. una compra) por sede.
 * - Gerente: siempre visible.
 * - Registro sin sedeId (ej. compras creadas antes de este cambio): visible
 *   para todos — evita que datos viejos "desaparezcan" para nadie.
 * - Resto: solo visible si el sedeId del registro coincide con el del usuario.
 */
export const isVisibleBySede = (record, isGerente, sedeId) => {
    if (isGerente) return true;
    if (!record) return false;
    const recordSedeId = record.sedeId ?? record.sede ?? null;
    return !recordSedeId || String(recordSedeId) === String(sedeId);
};