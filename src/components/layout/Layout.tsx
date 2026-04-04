// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AccessibilityButton from '../accessibility/AccessibilityButton';

const Layout = () => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  return (
    // Fondo general de la app: gris muy claro para contrastar con las tarjetas blancas
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1A1A]">
      <Sidebar />
      
      {/* Contenedor principal: 
          - Sin padding izquierdo en móvil (0px)
          - Con padding de 260px a partir de pantallas medianas (md:pl-[260px]) 
      */}
      <div className="flex flex-col min-h-screen md:pl-[260px] transition-all duration-300">
        <Topbar onOpenAccessibility={() => setIsAccessibilityOpen(true)} />
        
        {/* Aquí se renderiza el contenido de cada página. 
            Menos padding en celular (p-4), padding normal en PC (md:p-8) */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Solo renderizamos el panel/modal, no el botón flotante si ya está en el Topbar.
          Nota: Si prefieres el botón flotante ABAJO A LA DERECHA, mantén este componente tal cual.
          Si prefieres que se abra solo desde el Topbar, habría que modificar AccessibilityButton
          para que no renderice el botón circular flotante. */}
      <AccessibilityButton 
        isOpen={isAccessibilityOpen} 
        onToggle={() => setIsAccessibilityOpen(!isAccessibilityOpen)} 
      />
    </div>
  );
};

export default Layout;