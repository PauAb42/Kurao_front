import React, { useState, useEffect } from 'react';
// Importamos los íconos necesarios, ya no necesitamos 'Accessibility' de lucide
import { X, Type, Contrast, Space, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = {
  primaryBlue: '#1047A9', 
  surfaceWhite: '#FFFFFF', 
  textDark: '#1A1A1A',     
  textMuted: '#8DAAC8',   
  inputBorder: '#E1E1E1',  
  activeBg: '#F0F4FA',    
  inactiveBg: '#D1D5DB'    
};

/* ── ÍCONO PERSONALIZADO (Basado en la imagen proporcionada) ── */
const CustomAccessibilityIcon = ({ size = 24, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Cabeza (Círculo superior) */}
    <circle cx="12" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    
    {/* Cuerpo y extremidades (Línea continua redondeada) */}
    <path 
      d="M7 10H17M12 8V13M12 13L9.5 20M12 13L14.5 20" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Nota: He recreado el trazo para que sea escalable y use 'currentColor' 
       para que se pinte de blanco automáticamente dentro del botón.
    */}
  </svg>
);

/* ── Estilos de Accesibilidad Inyectados ── */
const ACCESSIBILITY_STYLES = `
  body.kurao-letter-spacing * {
    letter-spacing: 0.06em !important;
  }
  body.kurao-underline-links a {
    text-decoration: underline !important;
    text-underline-offset: 4px !important;
    font-weight: 700 !important;
  }
`;

const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('kurao_accessibility');
    return saved ? JSON.parse(saved) : {
      fontSize: 'normal',
      highContrast: false,
      letterSpacing: false,
      underlineLinks: false
    };
  });

  // Inyectar los estilos CSS reales la primera vez que se monta
  useEffect(() => {
    if (!document.getElementById('kurao-a11y-styles')) {
      const el = document.createElement('style');
      el.id = 'kurao-a11y-styles';
      el.textContent = ACCESSIBILITY_STYLES;
      document.head.appendChild(el);
    }
  }, []);

  // Aplicar configuraciones al cambiar
  useEffect(() => {
    localStorage.setItem('kurao_accessibility', JSON.stringify(settings));
    
    const html = document.documentElement;
    const body = document.body;

    // Tamaño de fuente (Depende de que uses 'rem' en tu CSS/Tailwind)
    const fontSizes = { small: '14px', normal: '16px', large: '18px', huge: '20px' };
    html.style.fontSize = fontSizes[settings.fontSize];

    // Clases en el body
    body.classList.toggle('kurao-letter-spacing', settings.letterSpacing);
    body.classList.toggle('kurao-underline-links', settings.underlineLinks);

  }, [settings]);

  const toggleSetting = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const setFontSize = (size) => setSettings(prev => ({ ...prev, fontSize: size }));

  return (
    <>
      {/* CAPA DE ALTO CONTRASTE */}
      {settings.highContrast && (
        <div 
          className="fixed inset-0 z-[9990] pointer-events-none" 
          style={{ 
            backdropFilter: 'contrast(125%) saturate(110%)',
            WebkitBackdropFilter: 'contrast(125%) saturate(110%)'
          }} 
        />
      )}

      {/* BOTÓN FLOTANTE PRINCIPAL */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_30px_rgb(16,71,169,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ backgroundColor: colors.primaryBlue }}
        aria-label="Ajustes de vista y accesibilidad"
      >
        {/* AQUÍ ESTÁ EL CAMBIO: Usamos el ícono personalizado */}
        <CustomAccessibilityIcon size={28} />
      </button>

      {/* OVERLAY PARA CERRAR AL HACER CLIC FUERA */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/5 md:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* PANEL DESPLEGABLE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[9999] w-[320px] rounded-2xl border border-[#E1E1E1]/50 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#E1E1E1]/60 pb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight" style={{ color: colors.textDark }}>Accesibilidad</h3>
                <p className="text-xs font-medium mt-1" style={{ color: colors.textMuted }}>Ajusta la interfaz a tus necesidades</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-red-50 hover:text-red-500"
                style={{ color: colors.textMuted }}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-6">
              {/* TAMAÑO DE TEXTO */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  <Type size={14} /> Tamaño de texto
                </label>
                <div className="flex rounded-xl p-1 shadow-sm border border-[#E1E1E1]" style={{ backgroundColor: '#FAFBFD' }}>
                  {[
                    { id: 'small', label: 'A-', size: 'text-xs' },
                    { id: 'normal', label: 'A', size: 'text-sm' },
                    { id: 'large', label: 'A+', size: 'text-base' },
                    { id: 'huge', label: 'A++', size: 'text-lg' }
                  ].map(({ id, label, size }) => {
                    const isActive = settings.fontSize === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setFontSize(id)}
                        className={`flex-1 rounded-lg py-2 font-bold transition-all ${size}`}
                        style={{
                          backgroundColor: isActive ? colors.surfaceWhite : 'transparent',
                          color: isActive ? colors.primaryBlue : colors.textMuted,
                          boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SWITCHES MODERNOS */}
              <div className="space-y-2.5">
                {[
                  { key: 'highContrast', icon: <Contrast size={18} />, label: 'Alto contraste' },
                  { key: 'letterSpacing', icon: <Space size={18} />, label: 'Espaciado de texto' },
                  { key: 'underlineLinks', icon: <Link2 size={18} />, label: 'Subrayar enlaces' },
                ].map(({ key, icon, label }) => {
                  const isActive = settings[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSetting(key)}
                      className="group flex w-full items-center justify-between rounded-xl p-3 transition-all hover:bg-[#F8FAFD]"
                      style={{
                        border: `1.5px solid ${isActive ? colors.primaryBlue : colors.inputBorder}`,
                        backgroundColor: isActive ? colors.activeBg : 'transparent',
                      }}
                    >
                      <span className="flex items-center gap-3 text-sm font-semibold transition-colors" style={{ color: isActive ? colors.primaryBlue : colors.textDark }}>
                        {icon} {label}
                      </span>
                      
                      {/* Toggle visual estilo iOS */}
                      <div 
                        className="relative h-6 w-11 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: isActive ? colors.primaryBlue : colors.inactiveBg }}
                      >
                        <div 
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isActive ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} 
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityButton;