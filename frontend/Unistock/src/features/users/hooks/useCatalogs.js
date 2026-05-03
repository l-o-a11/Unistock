// hooks/useCatalogs.js
// Carga roles y sedes desde la API.

import { useState, useEffect } from 'react';
import { userAPI } from '../services/usersAPI';

export const useCatalogs = () => {
  const [roles, setRoles]     = useState([]);
  const [sedes, setSedes]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, s] = await Promise.all([userAPI.getRoles(), userAPI.getSedes()]);
        setRoles(r ?? []);
        setSedes(s ?? []);
      } catch (err) {
        console.error('Error cargando catálogos:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rolesActivos  = roles.filter((r) => r.estado !== false);
  const sedesActivas  = sedes.filter((s) => s.estado !== false);
  const getRolNombre  = (id) => roles.find((r) => r.id === parseInt(id))?.nombre ?? '—';
  const getSedeNombre = (id) => sedes.find((s) => s.id === parseInt(id))?.nombre ?? '—';

  return { roles, sedes, rolesActivos, sedesActivas, getRolNombre, getSedeNombre, loading };
};
