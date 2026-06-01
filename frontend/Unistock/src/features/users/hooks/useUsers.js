// hooks/useUsers.js
// Maneja el estado de la lista de usuarios y las acciones CRUD.

import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/usersAPI';

export const useUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAll();
      setUsers(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = async (userData) => {
    const result = await userAPI.create(userData);
    setUsers((prev) => [...prev, result.user]);
    return result;
  };

  const updateUser = async (id, userData) => {
    const updated = await userAPI.update(id, userData);
    setUsers((prev) => prev.map((u) => (String(u.id) === String(id) ? updated : u)));
    return updated;
  };

  const deleteUser = async (id) => {
    await userAPI.delete(id);
    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
  };

  const toggleUser = async (id) => {
    const updated = await userAPI.toggleStatus(id);
    setUsers((prev) => prev.map((u) => (String(u.id) === String(id) ? updated : u)));
    return updated;
  };

  return { users, loading, error, createUser, updateUser, deleteUser, toggleUser, refetch: fetchUsers };
};
