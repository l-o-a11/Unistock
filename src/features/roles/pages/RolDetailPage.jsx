import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RolesTable from '../components/roles/RolesTable';
import RolesPagination from '../components/roles/RolesPagination';
import RolForm from '../components/roles/RolForm';
import RolDetail from '../components/roles/RolDetail';
import Modal from '../components/ui/Modal';
import styles from './RolesPage.module.css';

// Datos de ejemplo
const initialRoles = [
  { 
    id: 1, 
    nombre: 'Gerente', 
    descripcion: 'Accede a todos los módulos y permisos completos del sistema. Puede crear, editar y eliminar cualquier registro.' 
  },
  { 
    id: 2, 
    nombre: 'Administrador', 
    descripcion: 'Accede a todos los módulos de su área. Puede gestionar usuarios y configuraciones básicas.' 
  },
  { 
    id: 3, 
    nombre: 'Personal de corte', 
    descripcion: 'Accede a la zona contable de la empresa y puede registrar horas de trabajo y materiales utilizados.' 
  },
  { 
    id: 4, 
    nombre: 'Gestor de inventario', 
    descripcion: 'Este rol permite acceder a los módulos de gestión de inventario, incluyendo insumos, productos y compras. Ideal para personal encargado del control de stock.' 
  },
  { 
    id: 5, 
    nombre: 'Vendedor', 
    descripcion: 'Visualiza la información de productos y puede registrar ventas. No tiene acceso a configuración.' 
  },
];

const RolesPage = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [viewingRol, setViewingRol] = useState(null);

  const handleAddRol = () => {
    setEditingRol(null);
    setShowModal(true);
  };

  const handleEditRol = (rol) => {
    setEditingRol(rol);
    setShowModal(true);
  };

  const handleViewDetails = (rol) => {
    setViewingRol(rol);
    setShowDetailModal(true);
  };

  const handleDeleteRol = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      setRoles(roles.filter(rol => rol.id !== id));
    }
  };

  const handleSaveRol = (formData) => {
    if (editingRol) {
      // Actualizar rol existente
      setRoles(roles.map(rol => 
        rol.id === editingRol.id 
          ? { ...formData, id: editingRol.id }
          : rol
      ));
    } else {
      // Agregar nuevo rol
      const newId = Math.max(...roles.map(r => r.id)) + 1;
      setRoles([...roles, { ...formData, id: newId }]);
    }
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <Sidebar onAddRol={handleAddRol} />
      
      <main className={styles.main}>
        <Header onAddRol={handleAddRol} />
        
        <div className={styles.content}>
          <RolesTable
            roles={roles}
            onEdit={handleEditRol}
            onDelete={handleDeleteRol}
            onViewDetails={handleViewDetails}
          />
          <RolesPagination />
        </div>
      </main>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRol ? 'Editar Rol' : 'Agregar Nuevo Rol'}
      >
        <RolForm
          rol={editingRol}
          onSave={handleSaveRol}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Modal para ver detalles */}
      {viewingRol && (
        <RolDetail
          rol={viewingRol}
          onClose={() => setShowDetailModal(false)}
          onEdit={(rol) => {
            setShowDetailModal(false);
            handleEditRol(rol);
          }}
          onDelete={handleDeleteRol}
        />
      )}
    </div>
  );
};

export default RolDetailPage;