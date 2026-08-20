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
import TableSkeleton from '../../shared/components/TableSkeleton';
import { userAPI } from '../services/usersAPI';

// Responsive: en móvil el título y el buscador se apilan (en vez de ir
// lado a lado, donde se pisan/cortan), y el padding de la página se reduce
// para no desperdiciar espacio horizontal.
const responsiveCss = `
  @media (max-width: 640px) {
    .up-page { padding: 16px !important; }
    .up-header { flex-direction: column !important; align-items: stretch !important; }
    .up-search { align-items: stretch !important; }
    .up-search > div { max-width: 100% !important; width: 100% !important; }
    .up-search > span { text-align: center !important; white-space: normal !important; }
    .up-addbar { justify-content: center !important; }
  }
`;

const UsersPage = () => {
  const { users, loading, createUser, updateUser, deleteUser, toggleUser } = useUsers();
  const { searchTerm, handleSearch } = useUserSearch();
  const { rolesActivos, sedesActivas, getRolNombre, getSedeNombre, roles, sedes } = useCatalogs();

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Modal que pide contraseña (para eliminar / activar / inactivar).
  // Vive separado del toast de resultado para que cada uno tenga su propio
  // ciclo open:false -> open:true y su temporizador de auto-cierre funcione
  // siempre, sin depender de reciclar un único Alert entre distintos "type".
  const [passwordAlert, setPasswordAlert] = useState({
    open: false, title: '', message: '', onConfirm: null,
  });

  // Toast de resultado (success / error). Estado propio, independiente del
  // modal de contraseña.
  const [resultAlert, setResultAlert] = useState({
    open: false, type: 'success', title: '', message: '',
  });

  const closePasswordAlert = () => setPasswordAlert((prev) => ({ ...prev, open: false }));
  const closeResultAlert = () => setResultAlert((prev) => ({ ...prev, open: false }));

  // Fuerza un ciclo open:false -> open:true (con un pequeño delay) incluso si
  // ya había un toast abierto antes, así el temporizador de auto-cierre de
  // Alert.jsx siempre se re-arma y el toast no se queda pegado en pantalla.
  const showResult = (type, title, message) => {
    setResultAlert((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      setResultAlert({ open: true, type, title, message });
    }, 50);
  };

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
  const itemsPerPage = 7;
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
      cargos: Array.isArray(user.cargo) ? user.cargo : (user.cargo ? [user.cargo] : []),
    });
  };

  const handleDelete = (id) => {
    const target = users.find((u) => String(u.id) === String(id));
    setPasswordAlert({
      open: true,
      title: 'Eliminar usuario',
      message: `Para eliminar a "${target?.nombreCompleto}" ingresa tu contraseña. Esta acción no se puede deshacer.`,
      onConfirm: async (pwd) => {
        try {
          await userAPI.verifyPassword(pwd);
        } catch (verifyErr) {
          const msg = verifyErr?.message || "";
          if (msg.toLowerCase().includes("sesión") || msg.toLowerCase().includes("token")) {
            closePasswordAlert();
            showResult('error', 'Sesión inválida', 'Tu sesión expiró. Por favor inicia sesión de nuevo.');
            setTimeout(() => { localStorage.removeItem("session_user"); window.location.href = "/login"; }, 2000);
          } else {
            // Contraseña incorrecta: el modal se queda abierto para reintentar,
            // igual que antes — no lo cerramos aquí.
            showResult('error', 'Contraseña incorrecta', 'La contraseña ingresada no es válida.');
          }
          return;
        }

        // Contraseña correcta: ahora sí cerramos el modal antes del toast final.
        closePasswordAlert();
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
    setPasswordAlert({
      open: true,
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
            closePasswordAlert();
            showResult('error', 'Sesión inválida', 'Tu sesión expiró. Por favor inicia sesión de nuevo.');
            setTimeout(() => { localStorage.removeItem("session_user"); window.location.href = "/login"; }, 2000);
          } else {
            // Contraseña incorrecta: el modal se queda abierto para reintentar.
            showResult('error', 'Contraseña incorrecta', 'La contraseña ingresada no es válida.');
          }
          return;
        }

        // Contraseña correcta: cerramos el modal antes del toast final.
        closePasswordAlert();
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

  if (loading) return <TableSkeleton title="Usuarios" />;

  return (
    <div className="up-page" style={{ padding: '24px 32px' }}>
      <style>{responsiveCss}</style>
      {/* Modal de contraseña — pide confirmación antes de eliminar/activar/inactivar */}
      <Alert
        isOpen={passwordAlert.open}
        type="password"
        title={passwordAlert.title}
        message={passwordAlert.message}
        onConfirm={passwordAlert.onConfirm}
        onCancel={closePasswordAlert}
      />

      {/* Toast de resultado — éxito o error, se cierra solo */}
      <Alert
        isOpen={resultAlert.open}
        type={resultAlert.type}
        title={resultAlert.title}
        message={resultAlert.message}
        onCancel={closeResultAlert}
      />

      <div className="up-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: 12 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Usuarios</h1>
        <div className="up-search" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <SearchInput value={searchTerm} onChange={handleSearch} placeholder="Buscar" maxWidth="400px" />
          <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
            Escribe <strong>activo</strong> para ver usuarios activos · <strong>inactivo</strong> para ver usuarios inactivos
          </span>
        </div>
      </div>

      <div className="up-addbar" style={{ backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', padding: '12px 16px', borderRadius: '10px' }}>
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
          allUsers={users}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editUser && (
        <UserForm
          user={editUser}
          roles={rolesActivos}
          sedes={sedesActivas}
          allUsers={users}
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