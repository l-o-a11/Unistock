import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../assets/icons/Dashboard';
import UsuariosIcon from '../assets/icons/Usuarios';
import ComprasIcon from '../assets/icons/Compras';
import ProduccionIcon from '../assets/icons/Produccion';
import logo from '../assets/transparent-Photoroom.png';

const menuItems = [
  { id: 'dashboard',  name: 'Dashboard',  icon: DashboardIcon, hasSubmenu: false },

  { id: 'usuarios',   name: 'Usuarios',   icon: UsuariosIcon, hasSubmenu: true,
    submenu: [
      { name: 'Roles', path: 'roles' },
      { name: 'Usuarios', path: 'users' }
    ], 
  },
  {
    id: 'compras', name: 'Compras', icon: ComprasIcon, hasSubmenu: true,
    submenu: [
      { name: 'Insumos', path: '/insumos' },
      { name: 'Categorías', path: '/categorias' },
      { name: 'Proveedores', path: '/proveedores' },
      { name: 'Compras', path: '/compras' },
    ],
  },
  {
    id: 'produccion', name: 'Producción', icon: ProduccionIcon, hasSubmenu: true,
    submenu: [
      { name: 'Categorías', path: '/categorias' },
      { name: 'Producción', path: '/produccion' },
      { name: 'Terceros', path: '/terceros' },
      { name: 'Productos', path: '/productos' },
    ],
  },
];

export default function Sidebar() {
  const [activeMenu,    setActiveMenu]    = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [hoveredSub,    setHoveredSub]    = useState(null);

  const navigate = useNavigate();

  // 🔥 referencia del sidebar
  const sidebarRef = useRef(null);

  // 🔥 detectar clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActiveMenu(null);
        setActiveSubItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (item) => {
    if (!item.hasSubmenu) {
      setActiveMenu(item.id);
      setActiveSubItem(null);
      navigate(`/${item.id}`);
      return;
    }
    setActiveMenu(prev => prev === item.id ? null : item.id);
    setActiveSubItem(null);
  };

  const handleSubitemClick = (subitem) => {
    navigate(subitem.path);
  };

  const activeItem  = menuItems.find(m => m.id === activeMenu);
  const isPanelOpen = !!activeMenu && !!activeItem?.hasSubmenu;

  return (
    <div ref={sidebarRef} className="flex h-screen">

      {/* ── Rail principal ── */}
      <div className="w-30 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-1 shadow-sm z-10">

        <div className="w-13 h-13 overflow-hidden flex items-center justify-center">
          <img src={logo} alt="Usuario" className="w-full h-full object-cover" />
        </div>

        <div className="w-9 h-px bg-gray-100 mb-2" />

        {menuItems.map((item) => {
          const Icon     = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`
                relative w-18 h-18 rounded-2xl flex flex-col items-center justify-center gap-1
                transition-colors duration-150 border-none cursor-pointer group
                ${isActive
                  ? 'bg-pink-400 text-white'
                  : 'bg-transparent hover:bg-pink-100'}
              `}
            >
              <Icon className={isActive ? 'text-white w-8 h-8' : 'text-gray-800 group-hover:text-pink-500 w-8 h-8'} />
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Panel lateral submenú ── */}
      <div
        className={`
          bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
          ${isPanelOpen ? 'w-56 opacity-100 shadow-2xl' : 'w-0 opacity-0'}
        `}
      >
        {activeItem?.hasSubmenu && (
          <div className="flex flex-col h-full">
            
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-7 bg-gradient-to-b from-pink-500 to-fuchsia-500 rounded-full"/>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{activeItem.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{activeItem.submenu.length} elementos</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 py-3 px-3 space-y-2 overflow-y-auto">
              {activeItem.submenu.map((subitem, i) => {
                const key      = `${activeItem.id}-${i}`;
                const isActive = activeSubItem === key;
                const isHov    = hoveredSub === key;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveSubItem(key);
                      handleSubitemClick(subitem);
                    }}
                    onMouseEnter={() => setHoveredSub(key)}
                    onMouseLeave={() => setHoveredSub(null)}
                    className={`
                      group w-full px-4 py-3 text-left text-sm font-medium
                      border-none cursor-pointer whitespace-nowrap relative
                      transition-all duration-200 ease-in-out rounded-xl
                      flex items-center gap-3
                      ${isActive
                        ? 'bg-gradient-to-r from-pink-500 via-pink-400 to-fuchsia-500 text-white shadow-lg shadow-pink-200'
                        : isHov
                        ? 'bg-pink-50 text-pink-700 shadow-sm'
                        : 'bg-white text-gray-700'}
                    `}
                  >
                    <div className={`w-1.5 h-5 rounded-full transition-all duration-200 ${
                      isActive ? 'bg-white' : 'bg-gray-200 group-hover:bg-pink-300'
                    }`}/>
                    
                    {isActive && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}

                    <span className="flex-1">{subitem.name}</span>

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gradient-to-b from-transparent to-pink-50">
              <p className="text-xs text-gray-500 text-center">Selecciona una opción</p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
