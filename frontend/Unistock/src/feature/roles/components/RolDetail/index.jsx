import React from 'react';
import { Shield, Check, X, Eye, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import HoverCard from '../HoverCard';

const RolDetail = ({ rol, onClose, onEdit, onDelete }) => {
  if (!rol) return null;

  // Módulos y sus privilegios
  const modules = [
    { 
      name: 'Insumos', 
      icon: '📦',
      permissions: {
        ver: true,
        crear: true,
        editar: true,
        eliminar: true
      }
    },
    { 
      name: 'Productos', 
      icon: '🛍️',
      permissions: {
        ver: true,
        crear: true,
        editar: true,
        eliminar: false
      }
    },
    { 
      name: 'Compras', 
      icon: '🛒',
      permissions: {
        ver: true,
        crear: true,
        editar: false,
        eliminar: false
      }
    },
    { 
      name: 'Proveedores', 
      icon: '🏢',
      permissions: {
        ver: true,
        crear: false,
        editar: false,
        eliminar: false
      }
    },
    { 
      name: 'Usuarios', 
      icon: '👥',
      permissions: {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false
      }
    }
  ];

  const PermissionBadge = ({ hasPermission, label }) => {
    return hasPermission ? (
      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
        <Check size={12} className="mr-1" />
        {label}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-400 rounded-md text-xs font-medium">
        <X size={12} className="mr-1" />
        {label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
          
          {/* Header - Detalle del Rol */}
          <div className="bg-linear-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="mr-2 text-white" size={24} />
                <h3 className="text-lg font-semibold text-white">
                  Detalle del Rol
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-4">
            {/* ID y Nombre del Rol */}
            <div className="mb-6">
              <HoverCard
                content={
                  <div className="space-y-2">
                    <p className="font-medium">ID del Rol</p>
                    <p className="text-sm">#{rol.id}</p>
                    <p className="font-medium mt-3">Nombre del Rol</p>
                    <p className="text-sm">{rol.nombre}</p>
                  </div>
                }
              >
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1 block">
                        ID
                      </label>
                      <span className="text-2xl font-bold text-purple-700">#{rol.id}</span>
                    </div>
                    <div className="text-right">
                      <label className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1 block">
                        NOMBRE DEL ROL
                      </label>
                      <p className="text-xl font-semibold text-gray-800">{rol.nombre}</p>
                    </div>
                  </div>
                </div>
              </HoverCard>
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Relación */}
              <div className="col-span-2 md:col-span-1">
                <HoverCard
                  content={
                    <div>
                      <p className="font-medium mb-2">Relación del rol</p>
                      <p className="text-sm">Este rol está directamente relacionado con la gestión de inventario y control de stock.</p>
                    </div>
                  }
                >
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <span className="mr-1">🔗</span>
                        RELACIÓN
                      </label>
                      <p className="text-sm font-medium text-purple-600">Gestión de inventario</p>
                    <p className="text-xs text-gray-500 mt-1">Departamento: Operaciones</p>
                  </div>
                </HoverCard>
              </div>

              {/* Estadísticas rápidas */}
              <div className="col-span-2 md:col-span-1">
                <HoverCard
                  content={
                    <div>
                      <p className="font-medium mb-2">Estadísticas del rol</p>
                      <p className="text-sm">Usuarios asignados: 3</p>
                      <p className="text-sm">Módulos con acceso: 3 de 5</p>
                    </div>
                  }
                >
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <span className="mr-1">📊</span>
                      ESTADÍSTICAS
                    </label>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Usuarios</p>
                        <p className="text-lg font-bold text-gray-800">3</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Módulos</p>
                        <p className="text-lg font-bold text-gray-800">3/5</p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Shield size={20} className="text-purple-600" />
                      </div>
                    </div>
                  </div>
                </HoverCard>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-4">
              <HoverCard
                content={
                  <div>
                    <p className="font-medium mb-2">Descripción completa</p>
                    <p className="text-sm">{rol.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-2">Última actualización: 15/02/2026</p>
                  </div>
                }
              >
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <span className="mr-1">📝</span>
                    DESCRIPCIÓN
                  </label>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {rol.descripcion}
                  </p>
                </div>
              </HoverCard>
            </div>

            {/* Módulos y privilegios */}
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🔐</span>
                <h4 className="text-base font-semibold text-gray-900">Módulos y privilegios</h4>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Módulo
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ver
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crear
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Editar
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eliminar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modules.map((module, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{module.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{module.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {module.permissions.ver ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                              <Eye size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-full">
                              <Lock size={16} />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {module.permissions.crear ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                              <Check size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-full">
                              <X size={16} />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {module.permissions.editar ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                              <Edit size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-full">
                              <X size={16} />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {module.permissions.eliminar ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                              <Trash2 size={16} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-full">
                              <X size={16} />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leyenda de permisos */}
              <div className="mt-3 flex flex-wrap gap-3">
                <PermissionBadge hasPermission={true} label="Ver" />
                <PermissionBadge hasPermission={true} label="Crear" />
                <PermissionBadge hasPermission={true} label="Editar" />
                <PermissionBadge hasPermission={false} label="Eliminar" />
              </div>
            </div>

            {/* Resumen de accesos */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Resumen de accesos</h4>
                    <p className="text-xs text-gray-600">
                      Este rol tiene acceso a {modules.filter(m => m.permissions.ver).length} módulos • 
                      {modules.filter(m => m.permissions.crear).length} con permisos de creación •
                      Última modificación: 15/02/2026
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-xs text-gray-600">
                    <Unlock size={14} className="text-green-600 mr-1" />
                    {modules.filter(m => m.permissions.ver).length} accesos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(rol);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Editar Rol
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de eliminar este rol?')) {
                  onDelete(rol.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar Rol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolDetail;