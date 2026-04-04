// src/components/layout/Topbar.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/patients')) return 'Pacientes';
    if (path.includes('/doctors')) return 'Médicos';
    if (path.includes('/appointments')) return 'Citas';
    if (path.includes('/history')) return 'Historial Clínico';
    if (path.includes('/settings')) return 'Configuración';
    if (path.includes('/search')) return 'Resultados de Búsqueda';
    return 'Kurao';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Verificamos que no esté vacío el buscador
    if (searchTerm.trim()) {
      // Navegamos a la ruta global de búsqueda pasando el término por la URL
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      // Limpiamos el input después de buscar (opcional)
      setSearchTerm('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E1E1E1] bg-[#FFFFFF] px-4 pl-16 md:px-8 shadow-sm">
      {/* El título tiene truncate para que no empuje el buscador en pantallas muy pequeñas,
        y se reduce a text-xl en móviles para ahorrar espacio. 
      */}
      <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] truncate pr-4">
        {getTitle()}
      </h2>
      
      <div className="flex items-center">
        {/* Cambiamos el div por un form para habilitar la búsqueda al presionar "Enter" */}
        <form onSubmit={handleSearch} className="relative w-[140px] sm:w-[200px] md:w-72">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[#8DAAC8]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-full border border-[#E1E1E1] bg-[#F8FAFC] py-2 md:py-2.5 pl-9 md:pl-11 pr-4 text-sm outline-none transition-all placeholder-[#8DAAC8] focus:border-[#1047A9] focus:bg-white focus:ring-2 focus:ring-[#1047A9]/20"
            style={{ color: '#1A1A1A' }}
          />
        </form>
      </div>
    </header>
  );
};

export default Topbar;