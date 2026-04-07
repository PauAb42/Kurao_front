import React from 'react';
import { useLocation } from 'react-router-dom';

/* ── Estilos Inyectados ── */
const STYLES = `
  .topbar-root {
    position: sticky;
    top: 0;
    z-index: 40;
    height: 80px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1.5px solid #DDE6F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 36px;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .topbar-root { padding: 0 20px 0 70px; height: 70px; }
    .topbar-title { font-size: 18px !important; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('topbar-styles-minimal')) {
  const el = document.createElement('style');
  el.id = 'topbar-styles-minimal'; el.textContent = STYLES;
  document.head.appendChild(el);
}

const Topbar = () => {
  const location = useLocation();
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Panel de Control';
    if (path.includes('/patients')) return 'Directorio de Pacientes';
    if (path.includes('/doctors')) return 'Cuerpo Médico';
    if (path.includes('/appointments')) return 'Agenda de Citas';
    if (path.includes('/history')) return 'Historial Clínico';
    if (path.includes('/profile')) return 'Configuración de Perfil';
    return 'Kurao Hospital';
  };

  return (
    <header className="topbar-root">
      <h2 className="topbar-title" style={{ fontSize: 22, fontWeight: 800, color: '#0B1F3A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {getTitle()}
      </h2>
    </header>
  );
};

export default Topbar;