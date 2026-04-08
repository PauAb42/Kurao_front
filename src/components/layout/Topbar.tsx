// src/components/layout/Topbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/patients')) return 'Pacientes';
    if (path.includes('/doctors')) return 'Médicos';
    if (path.includes('/appointments')) return 'Citas';
    if (path.includes('/history')) return 'Historial Clínico';
    if (path.includes('/profile')) return 'Perfil';
    return 'Kurao Hospital';
  };

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-[70px] md:h-20 w-full items-center justify-between border-b border-[#DDE6F0] bg-white/85 px-5 pl-[70px] md:px-9 backdrop-blur-md transition-all duration-300">
      
      {/* Título de la página */}
      <h2 className="truncate text-lg md:text-[22px] font-extrabold text-[#0B1F3A] tracking-tight">
        {getTitle()}
      </h2>

      {/* Sección Derecha: Perfil */}
      <div className="relative flex items-center" ref={dropdownRef}>
        
        {/* Botón del Avatar */}
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1047A9] text-white font-bold shadow-md ring-2 ring-transparent transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-[#1047A9]/30 active:scale-95"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </button>

        {/* Menú Desplegable (Dropdown) */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-14 w-60 origin-top-right rounded-2xl bg-white p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-gray-100 transition-all duration-200 animate-in fade-in slide-in-from-top-2 z-50">
            
            {/* Cabecera del Dropdown (Info del Usuario) */}
            <div className="mb-1 flex flex-col border-b border-gray-100 px-3 pb-3 pt-2">
              <span className="truncate text-sm font-bold text-[#1A1A1A]">
                {user?.name || 'Usuario Demo'}
              </span>
              <span className="truncate text-xs font-medium text-[#8DAAC8] capitalize mt-0.5">
                {user?.role || 'Administrador'}
              </span>
            </div>

            {/* Opciones del Menú */}
            <div className="flex flex-col gap-1 mt-2">
              <Link 
                to="/profile" 
                onClick={() => setIsDropdownOpen(false)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8DAAC8] transition-colors hover:bg-[#F0F4FA] hover:text-[#1047A9]"
              >
                <User size={18} className="transition-colors group-hover:text-[#1047A9]" />
                Ver Perfil
              </Link>
              
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#EF4444] transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
              >
                <LogOut size={18} className="transition-colors group-hover:text-red-600" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;