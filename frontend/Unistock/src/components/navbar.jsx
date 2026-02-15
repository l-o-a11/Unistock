import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Briefcase, MapPin, LogOut, Edit } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = {
    name: 'Sofia Osorio',
    email: 'sofiaosorio@gmail.com',
    rol: 'Empleado',
    sede: 'Parque la 93',
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="px-6 py-3 flex items-center justify-end gap-4 relative" ref={dropdownRef}>

        {/* Botón del icono de usuario */}
        <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-full border-2 border-pink-300 hover:bg-pink-50 transition-colors"><User className="w-5 h-5 text-pink-400" /></button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-14 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-300 z-50 overflow-hidden">

            {/* Encabezado del perfil */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-pink-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info del usuario */}
            <div className="px-5 py-4 space-y-4">

              {/* Correo */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Correo</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Rol</p>
                  <p className="text-sm text-gray-700">{user.rol}</p>
                </div>
              </div>

              {/* Sede */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Sede</p>
                  <p className="text-sm text-gray-700">{user.sede}</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="px-5 pb-5 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2.5 rounded-full transition-colors text-sm">
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-full transition-colors text-sm">
                <Edit className="w-4 h-4" />
                Editar perfil
              </button>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;