// pages/UsersPage.jsx

import React, { useState, useMemo } from 'react';
import { useUsers }      from '../hooks/useUsers';
import { useUserSearch } from '../hooks/useUserSearch';
import { useCatalogs }   from '../hooks/useCatalogs';
import UserTable         from '../components/UserTable/index.jsx';
import UserForm          from '../components/UserForm/index.jsx';
import AddUserButton     from '../components/AddUserButton.jsx';
import SearchInput       from '../../shared/components/SearchInput';
import Alert             from '../../shared/components/Alert';

const UsersPage = () => {
  const { users, loading, createUser, updateUser, deleteUser, toggleUser } = useUsers();
  const { searchTerm, handleSearch } = useUserSearch();
  const { rolesActivos, sedesActivas, getRolNombre, getSedeNombre, roles, sedes } = useCatalogs();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate]   = useState(false);
  const [editUser, setEditUser]       = useState(null);

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
    return users.filter((user) => {
      if (term === 'a') return user.estado !== false;
      if (term === 'i') return user.estado === false;
      const rolNombre  = roles.find((r) => r.id === parseInt(user.rolId))?.nombre  ?? '';
      const sedeNombre = sedes.find((s) => s.id === parseInt(user.sedeId))?.nombre ?? '';
      const enCampos   = Object.values(user).some((v) => v?.toString().toLowerCase().includes(term));
      return enCampos || rolNombre.toLowerCase().includes(term) || sedeNombre.toLowerCase().includes(term);
    });
  }, [users, searchTerm, roles, sedes]);

  // Paginación
  const itemsPerPage   = 5;
  const totalPages     = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Acciones
  const handleEdit = (user) => {
    setEditUser({
      id:             user.id,
      documentType:   user.tipoDocumento,
      documentNumber: user.numeroDocumento,
      name:           user.nombreCompleto,
      email:          user.correo,
      role:           user.rolId  ?? '',
      sede:           user.sedeId ?? '',
    });
  };

  const handleDelete = (id) => {
    const target = users.find((u) => String(u.id) === String(id));
    setAlertConfig({
      open: true, type: 'password',
      title: 'Eliminar usuario',
      message: `Para eliminar a "${target?.nombreCompleto}" ingresa la contraseña de administrador. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
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
    const user     = users.find((u) => String(u.id) === String(id));
    const isActive = user?.estado !== false;
    setAlertConfig({
      open: true, type: 'password',
      title: isActive ? 'Inactivar usuario' : 'Activar usuario',
      message: isActive
        ? `Para inactivar a "${user?.nombreCompleto}" ingresa la contraseña de administrador.`
        : `Para activar a "${user?.nombreCompleto}" ingresa la contraseña de administrador.`,
      onConfirm: async () => {
        closeAlert();
        try {
          await toggleUser(id);
          showResult('success',
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
  const handleEditSubmit   = async (userData) => { await updateUser(editUser.id, userData); };

  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (loading) return <div style={{ padding: '24px 32px', color: '#6b7280' }}>Cargando usuarios...</div>;

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
        <h1 style={{ fontSize: '26px', fontWeight: 600 }}>Usuarios</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ width: '260px' }}>
            <SearchInput value={searchTerm} onChange={handleSearch} placeholder="Buscar" />
          </div>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
            Escribe <strong>a</strong> para ver activos · <strong>i</strong> para inactivos
          </span>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', padding: '12px 16px' }}>
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
                color:           p === currentPage ? '#fff'    : '#333',
                border:          p === currentPage ? '1px solid #FF4FD6' : '1px solid #ddd',
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
