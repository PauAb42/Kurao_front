import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Accessibility } from 'lucide-react';

const Topbar = ({ onOpenAccessibility }) => {
  const location = useLocation();
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/patients')) return 'Pacientes';
    if (path.includes('/doctors')) return 'Médicos';
    if (path.includes('/appointments')) return 'Citas';
    if (path.includes('/history')) return 'Historial Clínico';
    return 'Kurao';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8">
      <h2 className="text-xl font-bold text-[var(--color-text)]">{getTitle()}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Buscador global..."
            className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        
        <button 
          onClick={onOpenAccessibility}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg)] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
          aria-label="Opciones de accesibilidad"
        >
          <Accessibility size={22} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
