// pages/UsersPage.jsx

import React, { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useUserSearch } from '../hooks/useUserSearch';
import { useCatalogs } from '../hooks/useCatalogs';
import UserTable from '../components/UserTable/index.jsx';
import UserForm from '../components/UserForm/index.jsx';
import AddUserButton from '../components/AddUserButton.jsx';
import SearchInput from '../../shared/components/SearchInput';
import Alert from '../../shared/components/Alert';
import { userAPI } from '../services/usersAPI';

const UsersPage = () => {
  const { users, loading, createUser, updateUser, deleteUser, toggleUser } = useUsers();
  const { searchTerm, handleSearch } = useUserSearch();
  const { rolesActivos, sedesActivas, getRolNombre, getSedeNombre, roles, sedes } = useCatalogs();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [alertConfig, setAlertConfig] = useState({
    open: false, type: 'password', title: '', message: '', onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, open: false }));
  const showResult = (type, title, message) =>
    setAlertConfig({ open: true, type, title, message, onConfirm: null });

  // Filtro
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users.filter(Boolean);

    return users.filter(Boolean).filter((user) => {
      if (term === 'activo') return user.estado !== false;
      if (term === 'inactivo') return user.estado === false;

      // rolId y sedeId son ObjectId strings — comparar con String(), no parseInt
      const rolNombre = roles.find((r) => String(r.id) === String(user.rolId))?.nombre ?? '';
      const sedeNombre = sedes.find((s) => String(s.id) === String(user.sedeId))?.nombre ?? '';

      // Solo buscar en campos visibles/relevantes para el usuario,
      // en vez de barrer Object.values(user) (incluye ids, booleanos, etc.)
      const camposBuscables = [
        user.nombreCompleto,
        user.correo,
        user.numeroDocumento,
        user.tipoDocumento,
        rolNombre,
        sedeNombre,
      ];

      return camposBuscables.some((v) => v?.toString().toLowerCase().includes(term));
    });
  }, [users, searchTerm, roles, sedes]);

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Acciones
  const handleEdit = (user) => {
    setEditUser({
      id: user.id,
      documentType: user.tipoDocumento,
      documentNumber: user.numeroDocumento,
      name: user.nombreCompleto,
      email: user.correo,
      role: user.rolId ?? '',
      sede: user.sedeId ?? '',
    });
  };

  const handleDelete = (id) => {
    const target = users.find((u) => String(u.id) === String(id));
    setAlertConfig({
      open: true, type: 'password',
      title: 'Eliminar usuario',
      message: `Para eliminar a "${target?.nombreCompleto}" ingresa tu contraseña. Esta acción no se puede deshacer.`,
      onConfirm: async (pwd) => {
        try {
          await userAPI.verifyPassword(pwd);
        } catch (verifyErr) {
          // Si el 401 es de sesión inválida (token expirado o usuario no existe en BD),
          // redirigir al login. Si es contraseña incorrecta, mostrar error inline.
          const msg = verifyErr?.message || "";
          if (msg.toLowerCase().includes("sesión") || msg.toLowerCase().includes("token")) {
            showResult('error', 'Sesión inválida', 'Tu sesión expiró. Por favor inicia sesión de nuevo.');
            setTimeout(() => { localStorage.removeItem("session_user"); window.location.href = "/login"; }, 2000);
          } else {
            showResult('error', 'Contraseña incorrecta', 'La contraseña ingresada no es válida.');
          }
          return;
        }
        closeAlert();
        try {
          await deleteUser(id);
          showResult('success', 'Usuario eliminado', 'El usuario fue eliminado correctamente.');
        } catch (e) {
          showResult('error', 'No se pudo eliminar', e.message);
        }
      },
    });
  };

  const handleToggle = (id) => {
    const user = users.find((u) => String(u.id) === String(id));
    const isActive = user?.estado !== false;
    setAlertConfig({
      open: true, type: 'password',
      title: isActive ? 'Inactivar usuario' : 'Activar usuario',
      message: isActive
        ? `Para inactivar a "${user?.nombreCompleto}" ingresa tu contraseña.`
        : `Para activar a "${user?.nombreCompleto}" ingresa tu contraseña.`,
      onConfirm: async (pwd) => {
        try {
          await userAPI.verifyPassword(pwd);
        } catch (verifyErr) {
          const msg = verifyErr?.message || "";
          if (msg.toLowerCase().includes("sesión") || msg.toLowerCase().includes("token")) {
            showResult('error', 'Sesión inválida', 'Tu sesión expiró. Por favor inicia sesión de nuevo.');
            setTimeout(() => { localStorage.removeItem("session_user"); window.location.href = "/login"; }, 2000);
          } else {
            showResult('error', 'Contraseña incorrecta', 'La contraseña ingresada no es válida.');
          }
          return;
        }
        closeAlert();
        try {
          await toggleUser(id);
          showResult(
            'success',
            isActive ? 'Usuario inactivado' : 'Usuario activado',
            isActive ? 'El usuario fue inactivado correctamente.' : 'El usuario fue activado correctamente.',
          );
        } catch (e) {
          showResult('error', 'No se pudo cambiar el estado', e.message);
        }
      },
    });
  };

  const handleCreateSubmit = async (userData) => { await createUser(userData); };
  const handleEditSubmit = async (userData) => { await updateUser(editUser.id, userData); };

  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (loading) return (
    <div style={{ padding: '24px 32px' }}>
      <style>{`
        @keyframes uloadbar {
          0%   { left: -40%; width: 40%; }
          50%  { left: 30%;  width: 50%; }
          100% { left: 110%; width: 40%; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Usuarios</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 220, height: 34, background: '#f3f4f6', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          <div style={{ width: 110, height: 34, background: '#FF4FD6', borderRadius: 20, opacity: 0.15 }} />
        </div>
      </div>
      <div style={{ position: 'relative', height: 3, background: '#fce7f3', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #f9a8d4, #FF4FD6, #c026d3)',
          animation: 'uloadbar 1.6s ease-in-out infinite',
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px 32px' }}>
      <Alert
        isOpen={alertConfig.open}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={closeAlert}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Usuarios</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <SearchInput value={searchTerm} onChange={handleSearch} placeholder="Buscar" maxWidth="400px" />
          <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
            Escribe <strong>activo</strong> para ver usuarios activos · <strong>inactivo</strong> para ver usuarios inactivos
          </span>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', padding: '12px 16px', borderRadius: '10px' }}>
        <AddUserButton onClick={() => setShowCreate(true)} />
      </div>

      <UserTable
        users={paginatedUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        getRolNombre={getRolNombre}
        getSedeNombre={getSedeNombre}
      />

      {showCreate && (
        <UserForm
          roles={rolesActivos}
          sedes={sedesActivas}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editUser && (
        <UserForm
          user={editUser}
          roles={rolesActivos}
          sedes={sedesActivas}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditUser(null)}
        />
      )}

      {filteredUsers.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' }}>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={paginationBtn}>‹</button>
          {getPageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={i} style={{ padding: '6px 10px' }}>...</span>
            ) : (
              <button key={p} onClick={() => setCurrentPage(p)} style={{
                ...paginationBtn,
                backgroundColor: p === currentPage ? '#FF4FD6' : '#fff',
                color: p === currentPage ? '#fff' : '#333',
                border: p === currentPage ? '1px solid #FF4FD6' : '1px solid #ddd',
              }}>
                {p}
              </button>
            ),
          )}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} style={paginationBtn}>›</button>
        </div>
      )}
    </div>
  );
};

const paginationBtn = {
  padding: '6px 12px', borderRadius: '6px',
  border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
};

export default UsersPage;