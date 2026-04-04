// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  ClipboardList, 
  LogOut,
  Activity,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú en móviles

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'doctor', 'reception', 'patient'] },
    { to: '/patients', icon: Users, label: 'Pacientes', roles: ['admin', 'doctor', 'reception'] },
    { to: '/doctors', icon: UserRound, label: 'Médicos', roles: ['admin', 'reception'] },
    { to: '/appointments', icon: Calendar, label: 'Citas', roles: ['admin', 'doctor', 'reception', 'patient'] },
    { to: '/history', icon: ClipboardList, label: 'Historial Clínico', roles: ['admin', 'doctor', 'patient'] },
    { to: '/settings', icon: Settings, label: 'Configuración', roles: ['admin', 'doctor', 'reception', 'patient'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'admin'));

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Botón de Menú para Móviles (Hamburguesa) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1047A9] text-white shadow-md md:hidden transition-transform active:scale-95"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay oscuro para cerrar el menú al hacer clic fuera (Solo móviles) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-[#0B1F3A]/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Menú Lateral */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-[#FFFFFF] border-r border-[#E1E1E1] shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full" // Oculta o muestra según el estado
        )}
      >
        <div className="flex items-center gap-3 p-6 mb-2 mt-12 md:mt-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1047A9] text-white shadow-md">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#1047A9] tracking-tight">Kurao</h1>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto overflow-x-hidden">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar} // Cierra el menú al seleccionar una opción en móvil
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group",
                isActive 
                  ? "bg-[#F0F4FA] text-[#1047A9]" 
                  : "text-[#8DAAC8] hover:bg-gray-50 hover:text-[#1047A9]"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={cn(
                      "transition-colors", 
                      isActive ? "text-[#1047A9]" : "text-[#8DAAC8] group-hover:text-[#1047A9]"
                    )} 
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#E1E1E1] p-4 bg-[#FFFFFF]">
          <NavLink
            to="/profile"
            onClick={closeSidebar}
            className={({ isActive }) => cn(
              "mb-3 flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-gray-50",
              isActive ? "bg-[#F0F4FA] border border-[#1047A9]/20" : "border border-transparent"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1047A9] text-white font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-[#1A1A1A]">
                {user?.name || 'Usuario Demo'}
              </span>
              <span className="truncate text-xs font-medium text-[#8DAAC8] capitalize">
                {user?.role || 'Administrador'}
              </span>
            </div>
          </NavLink>
          
          <button
            onClick={() => {
              closeSidebar();
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-[#EF4444] transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;