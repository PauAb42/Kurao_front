import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  ClipboardList, 
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'doctor', 'reception', 'patient'] },
    { to: '/patients', icon: Users, label: 'Pacientes', roles: ['admin', 'doctor', 'reception'] },
    { to: '/doctors', icon: UserRound, label: 'Médicos', roles: ['admin', 'reception'] },
    { to: '/appointments', icon: Calendar, label: 'Citas', roles: ['admin', 'doctor', 'reception', 'patient'] },
    { to: '/history', icon: ClipboardList, label: 'Historial Clínico', roles: ['admin', 'doctor', 'patient'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[260px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
          <Activity size={24} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Kurao</h1>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive 
                ? "bg-[var(--color-primary)] text-white" 
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            "mb-4 flex items-center gap-3 rounded-xl p-2 transition-colors",
            isActive ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-dark)] text-white font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.name || 'Usuario'}</p>
            <p className="truncate text-xs text-[var(--color-text-muted)] capitalize">{user?.role || 'Rol'}</p>
          </div>
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-red-50"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
