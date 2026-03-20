import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '../../../../assets/icons/Dashboard';
import UsuariosIcon from "../../../../assets/icons/Usuarios";
import ComprasIcon from "../../../../assets/icons/Compras";
import ProduccionIcon from "../../../../assets/icons/Produccion";
import sedesIcon from "../../../../assets/icons/Sedes";
import ConfigIcon from "../../../../assets/icons/Config";

import logo from '../../../../assets/transparent-Photoroom.png';

const mainMenuItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: DashboardIcon,
    hasSubmenu: false,
    path: '/layout/dashboard'
  },

  {
    id: 'usuarios',
    name: 'Usuarios',
    icon: UsuariosIcon,
    hasSubmenu: false,
    path: '/layout/usuarios'
  },

  {
    id: 'compras',
    name: 'Compras',
    icon: ComprasIcon,
    hasSubmenu: true,
    submenu: [
      { name: 'Categorías', path: 'categorias-insumos' },
      { name: 'Insumos', path: 'insumos' },
      { name: 'Proveedores', path: 'proveedores' },
      { name: 'Compras', path: 'compras' },
    ]
  },

  {
    id: 'produccion',
    name: 'Producción',
    icon: ProduccionIcon,
    hasSubmenu: true,
    submenu: [
      { name: 'Categorías', path: 'categorias' },
      { name: 'Productos', path: 'productos' },
      { name: 'Producción', path: 'produccion' },
      { name: 'Terceros', path: 'terceros' },
      { name: 'Empleados', path: 'empleados' },
    ]
  },
   {
    id: 'sedes',
    name: 'Sedes',
    icon: sedesIcon,
    hasSubmenu: false,
    path: '/layout/sedes'
  },
];

const bottomMenuItem = {
  id: 'configuracion',
  name: 'Roles',
  icon: ConfigIcon,
  hasSubmenu: false,
  path: '/layout/roles'
};

export default function Sidebar() {

  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);

  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActiveMenu(null);
        setActiveSubItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);

  const handleMenuClick = (item) => {

    if (!item.hasSubmenu) {
      setActiveMenu(item.id);
      setActiveSubItem(null);
      navigate(item.path);
      return;
    }

    setActiveMenu(prev => prev === item.id ? null : item.id);
    setActiveSubItem(null);
  };

  const handleSubitemClick = (subitem) => {
    navigate(`/layout/${subitem.path}`);
  };

  const allItems = [...mainMenuItems, bottomMenuItem];
  const activeItem = allItems.find(m => m.id === activeMenu);
  const isPanelOpen = !!activeMenu && !!activeItem?.hasSubmenu;

  return (
    <div ref={sidebarRef} className="flex h-screen">

      <div className="w-30 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-1 shadow-sm z-10">

        <div className="w-20 h-20 overflow-hidden flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>

        <div className="w-10 h-px bg-gray-100 mb-2" />

        {mainMenuItems.map((item) => {

          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`relative w-18 h-18 rounded-2xl flex flex-col items-center justify-center gap-1
              transition-colors duration-150 border-none cursor-pointer group
              ${isActive ? 'bg-pink-400 text-white' : 'bg-transparent hover:bg-pink-100'}`}
            >

              <Icon className={isActive ? 'text-white w-8 h-8' : 'text-gray-800 group-hover:text-pink-500 w-8 h-8'} />

              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {item.name}
              </span>

            </button>
          );
        })}

        <div className="mt-auto">

          <div className="w-10 h-px bg-gray-100 mb-2" />

          {(() => {

            const item = bottomMenuItem;
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                onClick={() => handleMenuClick(item)}
                className={`relative w-18 h-18 rounded-2xl flex flex-col items-center justify-center gap-1
                transition-colors duration-150 border-none cursor-pointer group
                ${isActive ? 'bg-pink-400 text-white' : 'bg-transparent hover:bg-pink-100'}`}
              >

                <Icon className={isActive ? 'text-white w-8 h-8' : 'text-gray-800 group-hover:text-pink-500 w-8 h-8'} />

                <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </span>

              </button>
            );
          })()}

        </div>

      </div>

      {/* Panel Submenu */}

      <div className={`bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 flex flex-col overflow-hidden
      transition-all duration-300 ease-in-out
      ${isPanelOpen ? 'w-56 opacity-100 shadow-2xl' : 'w-0 opacity-0'}`}>

        {activeItem?.hasSubmenu && (

          <div className="flex flex-col h-full">

            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <h3 className="text-sm font-bold text-gray-900">{activeItem.name}</h3>
            </div>

            <div className="flex flex-col flex-1 py-3 px-3 space-y-2 overflow-y-auto">

              {activeItem.submenu.map((subitem, i) => {

                const key = `${activeItem.id}-${i}`;
                const isActive = activeSubItem === key;

                return (

                  <button
                    key={i}
                    onClick={() => {
                      setActiveSubItem(key);
                      handleSubitemClick(subitem);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium rounded-xl
                    ${isActive ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-50'}`}
                  >

                    {subitem.name}

                  </button>

                );
              })}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}